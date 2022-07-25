package dex

import (
	"context"
	"encoding/json"
	"fmt"
	"sort"

	"github.com/CosmWasm/wasmd/x/wasm"
	"github.com/gorilla/mux"
	"github.com/grpc-ecosystem/grpc-gateway/runtime"
	"github.com/spf13/cobra"
	"go.opentelemetry.io/otel/attribute"

	abci "github.com/tendermint/tendermint/abci/types"

	"github.com/cosmos/cosmos-sdk/client"
	"github.com/cosmos/cosmos-sdk/codec"
	cdctypes "github.com/cosmos/cosmos-sdk/codec/types"
	sdk "github.com/cosmos/cosmos-sdk/types"
	"github.com/cosmos/cosmos-sdk/types/module"
	"github.com/sei-protocol/sei-chain/utils"
	"github.com/sei-protocol/sei-chain/utils/tracing"
	dexcache "github.com/sei-protocol/sei-chain/x/dex/cache"
	"github.com/sei-protocol/sei-chain/x/dex/client/cli"
	"github.com/sei-protocol/sei-chain/x/dex/exchange"
	"github.com/sei-protocol/sei-chain/x/dex/keeper"
	"github.com/sei-protocol/sei-chain/x/dex/migrations"
	"github.com/sei-protocol/sei-chain/x/dex/types"
	"github.com/sei-protocol/sei-chain/x/store"
)

var (
	_ module.AppModule      = AppModule{}
	_ module.AppModuleBasic = AppModuleBasic{}
)

// ----------------------------------------------------------------------------
// AppModuleBasic
// ----------------------------------------------------------------------------

// AppModuleBasic implements the AppModuleBasic interface for the capability module.
type AppModuleBasic struct {
	cdc codec.BinaryCodec
}

func NewAppModuleBasic(cdc codec.BinaryCodec) AppModuleBasic {
	return AppModuleBasic{cdc: cdc}
}

// Name returns the capability module's name.
func (AppModuleBasic) Name() string {
	return types.ModuleName
}

func (AppModuleBasic) RegisterCodec(cdc *codec.LegacyAmino) {
	types.RegisterCodec(cdc)
}

func (AppModuleBasic) RegisterLegacyAminoCodec(cdc *codec.LegacyAmino) {
	types.RegisterCodec(cdc)
}

// RegisterInterfaces registers the module's interface types
func (a AppModuleBasic) RegisterInterfaces(reg cdctypes.InterfaceRegistry) {
	types.RegisterInterfaces(reg)
}

// DefaultGenesis returns the capability module's default genesis state.
func (AppModuleBasic) DefaultGenesis(cdc codec.JSONCodec) json.RawMessage {
	return cdc.MustMarshalJSON(types.DefaultGenesis())
}

// ValidateGenesis performs genesis state validation for the capability module.
func (AppModuleBasic) ValidateGenesis(cdc codec.JSONCodec, config client.TxEncodingConfig, bz json.RawMessage) error {
	var genState types.GenesisState
	if err := cdc.UnmarshalJSON(bz, &genState); err != nil {
		return fmt.Errorf("failed to unmarshal %s genesis state: %w", types.ModuleName, err)
	}
	return genState.Validate()
}

// RegisterRESTRoutes registers the capability module's REST service handlers.
func (AppModuleBasic) RegisterRESTRoutes(clientCtx client.Context, rtr *mux.Router) {
}

// RegisterGRPCGatewayRoutes registers the gRPC Gateway routes for the module.
func (AppModuleBasic) RegisterGRPCGatewayRoutes(clientCtx client.Context, mux *runtime.ServeMux) {
	types.RegisterQueryHandlerClient(context.Background(), mux, types.NewQueryClient(clientCtx)) //nolint:errcheck // this is inside a module, and the method doesn't return error.  Leave it alone.
}

// GetTxCmd returns the capability module's root tx command.
func (a AppModuleBasic) GetTxCmd() *cobra.Command {
	return cli.GetTxCmd()
}

// GetQueryCmd returns the capability module's root query command.
func (AppModuleBasic) GetQueryCmd() *cobra.Command {
	return cli.GetQueryCmd(types.StoreKey)
}

// ----------------------------------------------------------------------------
// AppModule
// ----------------------------------------------------------------------------

// AppModule implements the AppModule interface for the capability module.
type AppModule struct {
	AppModuleBasic

	keeper        keeper.Keeper
	accountKeeper types.AccountKeeper
	bankKeeper    types.BankKeeper
	wasmKeeper    wasm.Keeper

	tracingInfo *tracing.Info
}

func NewAppModule(
	cdc codec.Codec,
	keeper keeper.Keeper,
	accountKeeper types.AccountKeeper,
	bankKeeper types.BankKeeper,
	wasmKeeper wasm.Keeper,
	tracingInfo *tracing.Info,
) AppModule {
	return AppModule{
		AppModuleBasic: NewAppModuleBasic(cdc),
		keeper:         keeper,
		accountKeeper:  accountKeeper,
		bankKeeper:     bankKeeper,
		wasmKeeper:     wasmKeeper,
		tracingInfo:    tracingInfo,
	}
}

// Name returns the capability module's name.
func (am AppModule) Name() string {
	return am.AppModuleBasic.Name()
}

// Route returns the capability module's message routing key.
func (am AppModule) Route() sdk.Route {
	return sdk.NewRoute(types.RouterKey, NewHandler(am.keeper, am.tracingInfo))
}

// QuerierRoute returns the capability module's query routing key.
func (AppModule) QuerierRoute() string { return types.QuerierRoute }

// LegacyQuerierHandler returns the capability module's Querier.
func (am AppModule) LegacyQuerierHandler(legacyQuerierCdc *codec.LegacyAmino) sdk.Querier {
	return nil
}

// RegisterServices registers a GRPC query service to respond to the
// module-specific GRPC queries.
func (am AppModule) RegisterServices(cfg module.Configurator) {
	types.RegisterMsgServer(cfg.MsgServer(), keeper.NewMsgServerImpl(am.keeper, am.tracingInfo))
	types.RegisterQueryServer(cfg.QueryServer(), am.keeper)

	_ = cfg.RegisterMigration(types.ModuleName, 1, func(ctx sdk.Context) error { return nil })
	_ = cfg.RegisterMigration(types.ModuleName, 2, func(ctx sdk.Context) error {
		return migrations.DataTypeUpdate(ctx, am.keeper.GetStoreKey(), am.keeper.Cdc)
	})
	_ = cfg.RegisterMigration(types.ModuleName, 3, func(ctx sdk.Context) error {
		return migrations.PriceSnapshotUpdate(ctx, am.keeper.Paramstore)
	})
	_ = cfg.RegisterMigration(types.ModuleName, 4, func(ctx sdk.Context) error {
		return migrations.V4ToV5(ctx, am.keeper.GetStoreKey(), am.keeper.Paramstore)
	})
}

// RegisterInvariants registers the capability module's invariants.
func (am AppModule) RegisterInvariants(_ sdk.InvariantRegistry) {}

// InitGenesis performs the capability module's genesis initialization It returns
// no validator updates.
func (am AppModule) InitGenesis(ctx sdk.Context, cdc codec.JSONCodec, gs json.RawMessage) []abci.ValidatorUpdate {
	var genState types.GenesisState
	// Initialize global index to index in genesis state
	cdc.MustUnmarshalJSON(gs, &genState)

	InitGenesis(ctx, am.keeper, genState)

	return []abci.ValidatorUpdate{}
}

// ExportGenesis returns the capability module's exported genesis state as raw JSON bytes.
func (am AppModule) ExportGenesis(ctx sdk.Context, cdc codec.JSONCodec) json.RawMessage {
	genState := ExportGenesis(ctx, am.keeper)
	return cdc.MustMarshalJSON(genState)
}

// ConsensusVersion implements ConsensusVersion.
func (AppModule) ConsensusVersion() uint64 { return 5 }

func (am AppModule) getAllContractInfo(ctx sdk.Context) []types.ContractInfo {
	return am.keeper.GetAllContractInfo(ctx)
}

// BeginBlock executes all ABCI BeginBlock logic respective to the capability module.
func (am AppModule) BeginBlock(ctx sdk.Context, _ abci.RequestBeginBlock) {
	am.keeper.MemState.Clear()
	isNewEpoch, currentEpoch := am.keeper.IsNewEpoch(ctx)
	if isNewEpoch {
		am.keeper.SetEpoch(ctx, currentEpoch)
	}
	for _, contract := range am.getAllContractInfo(ctx) {
		am.beginBlockForContract(ctx, contract, int64(currentEpoch))
	}
}

func (am AppModule) beginBlockForContract(ctx sdk.Context, contract types.ContractInfo, epoch int64) {
	_, span := (*am.tracingInfo.Tracer).Start(am.tracingInfo.TracerContext, "DexBeginBlock")
	contractAddr := contract.ContractAddr
	span.SetAttributes(attribute.String("contract", contractAddr))
	defer span.End()

	if contract.NeedHook {
		if err := am.keeper.HandleBBNewBlock(ctx, contractAddr, epoch); err != nil {
			ctx.Logger().Error(fmt.Sprintf("New block hook error for %s: %s", contractAddr, err.Error()))
		}
	}

	if contract.NeedOrderMatching {
		currentTimestamp := uint64(ctx.BlockTime().Unix())
		ctx.Logger().Info(fmt.Sprintf("Removing stale prices for ts %d", currentTimestamp))
		priceRetention := am.keeper.GetParams(ctx).PriceSnapshotRetention
		for _, pair := range am.keeper.GetAllRegisteredPairs(ctx, contractAddr) {
			am.keeper.DeletePriceStateBefore(ctx, contractAddr, currentTimestamp-priceRetention, pair)
		}
	}
}

// EndBlock executes all ABCI EndBlock logic respective to the capability module. It
// returns no validator updates.
func (am AppModule) EndBlock(ctx sdk.Context, _ abci.RequestEndBlock) []abci.ValidatorUpdate {
	validContractAddresses := map[string]types.ContractInfo{}
	for _, contractInfo := range am.getAllContractInfo(ctx) {
		validContractAddresses[contractInfo.ContractAddr] = contractInfo
	}
	// Each iteration is atomic. If an iteration finishes without any error, it will return,
	// otherwise it will rollback any state change, filter out contracts that cause the error,
	// and proceed to the next iteration. The loop is guaranteed to finish since
	// `validContractAddresses` will always decrease in size every iteration.
	iterCounter := len(validContractAddresses)
	for len(validContractAddresses) > 0 {
		failedContractAddresses := utils.NewStringSet([]string{})
		cachedCtx, msCached := store.GetCachedContext(ctx)
		// cache keeper in-memory state
		memStateCopy := am.keeper.MemState.DeepCopy()
		finalizeBlockMessages := map[string]*types.SudoFinalizeBlockMsg{}
		for contractAddr := range validContractAddresses {
			finalizeBlockMessages[contractAddr] = types.NewSudoFinalizeBlockMsg()
		}

		for contractAddr, contractInfo := range validContractAddresses {
			if !contractInfo.NeedOrderMatching {
				continue
			}
			ctx.Logger().Info(fmt.Sprintf("End block for %s", contractAddr))
			if orderResultsMap, err := am.endBlockForContract(cachedCtx, contractInfo); err != nil {
				ctx.Logger().Error(fmt.Sprintf("Error for EndBlock of %s", contractAddr))
				failedContractAddresses.Add(contractAddr)
			} else {
				for account, orderResults := range orderResultsMap {
					// only add to finalize message for contract addresses
					if msg, ok := finalizeBlockMessages[account]; ok {
						msg.AddContractResult(orderResults)
					}
				}
			}
		}

		for contractAddr, finalizeBlockMsg := range finalizeBlockMessages {
			if !validContractAddresses[contractAddr].NeedHook {
				continue
			}
			if _, err := am.keeper.CallContractSudo(cachedCtx, contractAddr, finalizeBlockMsg); err != nil {
				ctx.Logger().Error(fmt.Sprintf("Error calling FinalizeBlock of %s", contractAddr))
				failedContractAddresses.Add(contractAddr)
			}
		}

		// No error is thrown for any contract. This should happen most of the time.
		if failedContractAddresses.Size() == 0 {
			msCached.Write()
			return []abci.ValidatorUpdate{}
		}
		// restore keeper in-memory state
		*am.keeper.MemState = *memStateCopy
		// exclude orders by failed contracts from in-memory state,
		// then update `validContractAddresses`
		for _, failedContractAddress := range failedContractAddresses.ToSlice() {
			am.keeper.MemState.DeepFilterAccount(failedContractAddress)
			delete(validContractAddresses, failedContractAddress)
		}

		iterCounter--
		if iterCounter == 0 {
			ctx.Logger().Error("All contracts failed in dex EndBlock. Doing nothing.")
			break
		}
	}

	// don't call `ctx.Write` if all contracts have error
	return []abci.ValidatorUpdate{}
}

func (am AppModule) endBlockForContract(ctx sdk.Context, contract types.ContractInfo) (map[string]types.ContractOrderResult, error) {
	contractAddr := contract.ContractAddr
	spanCtx, span := (*am.tracingInfo.Tracer).Start(am.tracingInfo.TracerContext, "DexEndBlock")
	span.SetAttributes(attribute.String("contract", contractAddr))
	defer span.End()

	typedContractAddr := types.ContractAddress(contractAddr)
	registeredPairs := am.keeper.GetAllRegisteredPairs(ctx, contractAddr)
	_, currentEpoch := am.keeper.IsNewEpoch(ctx)
	orderResults := map[string]types.ContractOrderResult{}

	if err := am.keeper.HandleEBLiquidation(spanCtx, ctx, am.tracingInfo.Tracer, contractAddr, registeredPairs); err != nil {
		return orderResults, err
	}
	if err := am.keeper.HandleEBCancelOrders(spanCtx, ctx, am.tracingInfo.Tracer, contractAddr, registeredPairs); err != nil {
		return orderResults, err
	}
	if err := am.keeper.HandleEBPlaceOrders(spanCtx, ctx, am.tracingInfo.Tracer, contractAddr, registeredPairs); err != nil {
		return orderResults, err
	}

	// populate order placement results for FinalizeBlock hook
	for _, orders := range am.keeper.MemState.BlockOrders[typedContractAddr] {
		types.PopulateOrderPlacementResults(contractAddr, *orders, orderResults)
	}

	for _, pair := range registeredPairs {
		typedPairStr := types.GetPairString(&pair) //nolint:gosec // USING THE POINTER HERE COULD BE BAD, LET'S CHECK IT
		orders := am.keeper.MemState.GetBlockOrders(typedContractAddr, typedPairStr)
		cancels := am.keeper.MemState.GetBlockCancels(typedContractAddr, typedPairStr)
		ctx.Logger().Info(string(typedPairStr))
		ctx.Logger().Info(fmt.Sprintf("Order count: %d", len(*orders)))
		marketBuys := orders.GetSortedMarketOrders(types.PositionDirection_LONG, true)
		marketSells := orders.GetSortedMarketOrders(types.PositionDirection_SHORT, true)
		limitBuys := orders.GetLimitOrders(types.PositionDirection_LONG)
		limitSells := orders.GetLimitOrders(types.PositionDirection_SHORT)
		ctx.Logger().Info(fmt.Sprintf("Number of LB: %d, LS: %d, MB: %d, MS: %d", len(limitBuys), len(limitSells), len(marketBuys), len(marketSells)))
		priceDenomStr := pair.PriceDenom
		assetDenomStr := pair.AssetDenom
		allExistingBuys := am.keeper.GetAllLongBookForPair(ctx, contractAddr, priceDenomStr, assetDenomStr)
		allExistingSells := am.keeper.GetAllShortBookForPair(ctx, contractAddr, priceDenomStr, assetDenomStr)
		sort.Slice(allExistingBuys, func(i, j int) bool {
			return allExistingBuys[i].GetPrice().LT(allExistingBuys[j].GetPrice())
		})
		sort.Slice(allExistingSells, func(i, j int) bool {
			return allExistingSells[i].GetPrice().LT(allExistingSells[j].GetPrice())
		})

		longDirtyPrices, shortDirtyPrices := exchange.NewDirtyPrices(), exchange.NewDirtyPrices()

		originalOrdersToCancel := am.keeper.GetOrdersByIds(ctx, contractAddr, cancels.GetIdsToCancel())
		exchange.CancelOrders(ctx, *cancels, allExistingBuys, originalOrdersToCancel, &longDirtyPrices)
		exchange.CancelOrders(ctx, *cancels, allExistingSells, originalOrdersToCancel, &shortDirtyPrices)

		settlements := []*types.SettlementEntry{}
		// orders that are fully executed during order matching and need to be removed from active order state
		zeroOrders := []exchange.AccountOrderID{}
		marketBuyTotalPrice, marketBuyTotalQuantity := exchange.MatchMarketOrders(
			ctx,
			marketBuys,
			allExistingSells,
			pair,
			types.PositionDirection_LONG,
			&shortDirtyPrices,
			&settlements,
			&zeroOrders,
		)
		marketSellTotalPrice, marketSellTotalQuantity := exchange.MatchMarketOrders(
			ctx,
			marketSells,
			allExistingBuys,
			pair,
			types.PositionDirection_SHORT,
			&longDirtyPrices,
			&settlements,
			&zeroOrders,
		)
		limitTotalPrice, limitTotalQuantity := exchange.MatchLimitOrders(
			ctx,
			limitBuys,
			limitSells,
			&allExistingBuys,
			&allExistingSells,
			pair,
			&longDirtyPrices,
			&shortDirtyPrices,
			&settlements,
			&zeroOrders,
		)
		var avgPrice sdk.Dec
		if marketBuyTotalQuantity.Add(marketSellTotalQuantity).Add(limitTotalQuantity).IsZero() {
			avgPrice = sdk.ZeroDec()
		} else {
			avgPrice = (marketBuyTotalPrice.Add(marketSellTotalPrice).Add(limitTotalPrice)).Quo(marketBuyTotalQuantity.Add(marketSellTotalQuantity).Add(limitTotalQuantity))
			priceState, _ := am.keeper.GetPriceState(ctx, contractAddr, currentEpoch, pair)
			priceState.SnapshotTimestampInSeconds = uint64(ctx.BlockTime().Unix())
			priceState.Price = avgPrice
			am.keeper.SetPriceState(ctx, priceState, contractAddr)
		}
		ctx.Logger().Info(fmt.Sprintf("Number of long books: %d", len(allExistingBuys)))
		ctx.Logger().Info(fmt.Sprintf("Number of short books: %d", len(allExistingSells)))
		ctx.Logger().Info(fmt.Sprintf("Average price for %s/%s: %d", pair.PriceDenom, pair.AssetDenom, avgPrice))
		for _, buy := range allExistingBuys {
			ctx.Logger().Info(fmt.Sprintf("Long book: %s, %s", buy.GetPrice(), buy.GetEntry().Quantity))
			if longDirtyPrices.Has(buy.GetPrice()) {
				ctx.Logger().Info("Long book is dirty")
				am.keeper.FlushDirtyLongBook(ctx, contractAddr, buy)
			}
		}
		for _, sell := range allExistingSells {
			if shortDirtyPrices.Has(sell.GetPrice()) {
				am.keeper.FlushDirtyShortBook(ctx, contractAddr, sell)
			}
		}
		_, currentEpoch := am.keeper.IsNewEpoch(ctx)
		allSettlements := types.Settlements{
			Epoch:   int64(currentEpoch),
			Entries: []*types.SettlementEntry{},
		}
		settlementMap := map[string]*types.Settlements{}

		for _, settlementEntry := range settlements {
			priceDenom := settlementEntry.PriceDenom
			assetDenom := settlementEntry.AssetDenom
			pair := types.Pair{
				PriceDenom: priceDenom,
				AssetDenom: assetDenom,
			}
			if settlements, ok := settlementMap[pair.String()]; ok {
				settlements.Entries = append(settlements.Entries, settlementEntry)
			} else {
				settlementMap[pair.String()] = &types.Settlements{
					Epoch:   int64(currentEpoch),
					Entries: []*types.SettlementEntry{settlementEntry},
				}
			}
			allSettlements.Entries = append(allSettlements.Entries, settlementEntry)
		}
		for _, pair := range registeredPairs {
			if settlementEntries, ok := settlementMap[pair.String()]; ok && len(settlementEntries.Entries) > 0 {
				am.keeper.SetSettlements(ctx, contractAddr, settlementEntries.Entries[0].PriceDenom, settlementEntries.Entries[0].AssetDenom, *settlementEntries)
			}
		}
		// populate execution results for FinalizeBlock hook
		types.PopulateOrderExecutionResults(contractAddr, allSettlements.Entries, orderResults)

		nativeSettlementMsg := types.SudoSettlementMsg{
			Settlement: allSettlements,
		}
		ctx.Logger().Info(nativeSettlementMsg.Settlement.String())
		if _, err := am.keeper.CallContractSudo(ctx, contractAddr, nativeSettlementMsg); err != nil {
			return orderResults, err
		}

		for _, order := range *orders {
			am.keeper.AddNewOrder(ctx, order)
		}
		for _, cancel := range *cancels {
			am.keeper.AddCancel(ctx, contractAddr, cancel)
			am.keeper.UpdateOrderStatus(ctx, contractAddr, cancel.Id, types.OrderStatus_CANCELLED)
		}
		for _, zeroAccountOrder := range zeroOrders {
			am.keeper.RemoveAccountActiveOrder(ctx, zeroAccountOrder.OrderID, contractAddr, zeroAccountOrder.Account)
			am.keeper.UpdateOrderStatus(ctx, contractAddr, zeroAccountOrder.OrderID, types.OrderStatus_FULFILLED)
		}

		emptyBlockCancel := dexcache.BlockCancellations([]types.Cancellation{})
		am.keeper.MemState.BlockCancels[typedContractAddr][typedPairStr] = &emptyBlockCancel
		for _, marketOrder := range marketBuys {
			if marketOrder.Quantity.IsPositive() {
				am.keeper.MemState.GetBlockCancels(typedContractAddr, typedPairStr).AddCancel(types.Cancellation{
					Id:        marketOrder.Id,
					Initiator: types.CancellationInitiator_USER,
				})
				am.keeper.UpdateOrderStatus(ctx, contractAddr, marketOrder.Id, types.OrderStatus_CANCELLED)
			} else {
				am.keeper.UpdateOrderStatus(ctx, contractAddr, marketOrder.Id, types.OrderStatus_FULFILLED)
			}
		}
		for _, marketOrder := range marketSells {
			if marketOrder.Quantity.IsPositive() {
				am.keeper.MemState.GetBlockCancels(typedContractAddr, typedPairStr).AddCancel(types.Cancellation{
					Id:        marketOrder.Id,
					Initiator: types.CancellationInitiator_USER,
				})
				am.keeper.UpdateOrderStatus(ctx, contractAddr, marketOrder.Id, types.OrderStatus_CANCELLED)
			} else {
				am.keeper.UpdateOrderStatus(ctx, contractAddr, marketOrder.Id, types.OrderStatus_FULFILLED)
			}
		}
	}
	// Cancel unfilled market orders
	if err := am.keeper.HandleEBCancelOrders(spanCtx, ctx, am.tracingInfo.Tracer, contractAddr, registeredPairs); err != nil {
		return orderResults, err
	}

	return orderResults, nil
}
