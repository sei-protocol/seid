package keeper

import (
	"context"
	"encoding/json"
	"fmt"

	sdk "github.com/cosmos/cosmos-sdk/types"
	dexcache "github.com/sei-protocol/sei-chain/x/dex/cache"
	"github.com/sei-protocol/sei-chain/x/dex/types"
	"go.opentelemetry.io/otel/attribute"
	otrace "go.opentelemetry.io/otel/trace"
)

// There is a limit on how many bytes can be passed to wasm VM in a single call,
// so we shouldn't bump this number unless there is an upgrade to wasm VM
const MaxOrdersPerSudoCall = 50000

func (k *Keeper) HandleEBPlaceOrders(ctx context.Context, sdkCtx sdk.Context, tracer *otrace.Tracer, contractAddr string, registeredPairs []types.Pair) error {
	_, span := (*tracer).Start(ctx, "SudoPlaceOrders")
	span.SetAttributes(attribute.String("contractAddr", contractAddr))

	typedContractAddr := types.ContractAddress(contractAddr)
	msgs := k.GetPlaceSudoMsg(sdkCtx, typedContractAddr, registeredPairs)
	_, err := k.CallContractSudo(sdkCtx, contractAddr, msgs[0]) // deposit
	if err != nil {
		sdkCtx.Logger().Error(fmt.Sprintf("Error during deposit: %s", err.Error()))
		return err
	}

	responses := []types.SudoOrderPlacementResponse{}
	for _, msg := range msgs[1:] {
		data, err := k.CallContractSudo(sdkCtx, contractAddr, msg)
		if err != nil {
			sdkCtx.Logger().Error(fmt.Sprintf("Error during order placement: %s", err.Error()))
			return err
		}
		response := types.SudoOrderPlacementResponse{}
		if err := json.Unmarshal(data, &response); err != nil {
			sdkCtx.Logger().Error("Failed to parse order placement response")
			return err
		}
		sdkCtx.Logger().Info(fmt.Sprintf("Sudo response data: %s", response))
		responses = append(responses, response)
	}

	for _, pair := range registeredPairs {
		typedPairStr := types.GetPairString(&pair) //nolint:gosec // USING THE POINTER HERE COULD BE BAD, LET'S CHECK IT.
		for _, response := range responses {
			k.MemState.GetBlockOrders(typedContractAddr, typedPairStr).MarkFailedToPlaceByIds(response.UnsuccessfulOrderIds)
		}
	}
	span.End()
	return nil
}

func (k *Keeper) GetPlaceSudoMsg(ctx sdk.Context, typedContractAddr types.ContractAddress, registeredPairs []types.Pair) []types.SudoOrderPlacementMsg {
	msgs := []types.SudoOrderPlacementMsg{k.GetDepositSudoMsg(ctx, typedContractAddr)}
	contractOrderPlacements := []types.Order{}
	for _, pair := range registeredPairs {
		typedPairStr := types.GetPairString(&pair) //nolint:gosec // USING THE POINTER HERE COULD BE BAD, LET'S CHECK IT.
		for _, order := range *k.MemState.GetBlockOrders(typedContractAddr, typedPairStr) {
			contractOrderPlacements = append(contractOrderPlacements, order)
			if len(contractOrderPlacements) == MaxOrdersPerSudoCall {
				msgs = append(msgs, types.SudoOrderPlacementMsg{
					OrderPlacements: types.OrderPlacementMsgDetails{
						Orders:   contractOrderPlacements,
						Deposits: []types.ContractDepositInfo{},
					},
				})
				contractOrderPlacements = []types.Order{}
			}
		}
	}
	msgs = append(msgs, types.SudoOrderPlacementMsg{
		OrderPlacements: types.OrderPlacementMsgDetails{
			Orders:   contractOrderPlacements,
			Deposits: []types.ContractDepositInfo{},
		},
	})
	return msgs
}

func (k *Keeper) GetDepositSudoMsg(ctx sdk.Context, typedContractAddr types.ContractAddress) types.SudoOrderPlacementMsg {
	contractDepositInfo := []types.ContractDepositInfo{}
	for _, depositInfo := range *k.MemState.GetDepositInfo(typedContractAddr) {
		fund := sdk.NewCoins(sdk.NewCoin(depositInfo.Denom, depositInfo.Amount.RoundInt()))
		sender, err := sdk.AccAddressFromBech32(depositInfo.Creator)
		if err != nil {
			ctx.Logger().Error("Invalid deposit creator")
		}
		receiver, err := sdk.AccAddressFromBech32(string(typedContractAddr))
		if err != nil {
			ctx.Logger().Error("Invalid deposit contract")
		}
		if err := k.BankKeeper.SendCoins(ctx, sender, receiver, fund); err == nil {
			contractDepositInfo = append(contractDepositInfo, dexcache.ToContractDepositInfo(depositInfo))
		} else {
			ctx.Logger().Error(err.Error())
		}
	}
	return types.SudoOrderPlacementMsg{
		OrderPlacements: types.OrderPlacementMsgDetails{
			Orders:   []types.Order{},
			Deposits: contractDepositInfo,
		},
	}
}
