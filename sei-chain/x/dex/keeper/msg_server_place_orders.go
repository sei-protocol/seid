package keeper

import (
	"context"

	sdk "github.com/cosmos/cosmos-sdk/types"
	sdkerrors "github.com/cosmos/cosmos-sdk/types/errors"
	dexcache "github.com/sei-protocol/sei-chain/x/dex/cache"
	"github.com/sei-protocol/sei-chain/x/dex/types"
)

func (k msgServer) transferFunds(goCtx context.Context, msg *types.MsgPlaceOrders) error {
	if len(msg.Funds) == 0 {
		return nil
	}
	_, span := (*k.tracingInfo.Tracer).Start(goCtx, "TransferFunds")
	defer span.End()

	ctx := sdk.UnwrapSDKContext(goCtx)
	callerAddr, err := sdk.AccAddressFromBech32(msg.Creator)
	if err != nil {
		return err
	}
	contractAddr, err := sdk.AccAddressFromBech32(msg.ContractAddr)
	if err != nil {
		return err
	}
	if err := k.BankKeeper.IsSendEnabledCoins(ctx, msg.Funds...); err != nil {
		return err
	}
	if k.BankKeeper.BlockedAddr(contractAddr) {
		return sdkerrors.Wrapf(sdkerrors.ErrUnauthorized, "%s is not allowed to receive funds", contractAddr.String())
	}
	if err := k.BankKeeper.SendCoins(ctx, callerAddr, contractAddr, msg.Funds); err != nil {
		return err
	}

	di := k.DepositInfo[msg.GetContractAddr()]
	for _, fund := range msg.Funds {
		fundDenom, unit, err := types.GetDenomFromStr(fund.Denom)
		if err != nil {
			panic(err)
		}
		di.DepositInfoList = append(di.DepositInfoList, dexcache.DepositInfoEntry{
			Creator: msg.Creator,
			Denom:   fundDenom,
			Amount:  types.ConvertDecToStandard(unit, sdk.NewDec(fund.Amount.Int64())),
		})
	}
	return nil
}

func (k msgServer) PlaceOrders(goCtx context.Context, msg *types.MsgPlaceOrders) (*types.MsgPlaceOrdersResponse, error) {
	spanCtx, span := (*k.tracingInfo.Tracer).Start(goCtx, "PlaceOrders")
	defer span.End()

	ctx := sdk.UnwrapSDKContext(goCtx)

	if err := k.transferFunds(spanCtx, msg); err != nil {
		return nil, err
	}

	pairToOrderPlacements := k.OrderPlacements[msg.GetContractAddr()]

	
	nextId := k.GetNextOrderId(ctx)
	idsInResp := []uint64{}
	for _, orderPlacement := range msg.GetOrders() {
		ticksize, found := k.Keeper.GetTickSizeForPair(ctx,msg.GetContractAddr(), types.Pair{PriceDenom: orderPlacement.PriceDenom, AssetDenom: orderPlacement.AssetDenom})
		if !found {
			return nil, sdkerrors.Wrapf(sdkerrors.ErrKeyNotFound, "the pair {price:%s,asset:%s} has no ticksize configured", orderPlacement.PriceDenom.String(), orderPlacement.AssetDenom.String())
		}
		pair := types.Pair{PriceDenom: orderPlacement.PriceDenom, AssetDenom: orderPlacement.AssetDenom, Ticksize: &ticksize}
		(*pairToOrderPlacements[pair.String()]).Orders = append(
			(*pairToOrderPlacements[pair.String()]).Orders,
			dexcache.OrderPlacement{
				Id:         nextId,
				Price:      orderPlacement.Price,
				Quantity:   orderPlacement.Quantity,
				Creator:    msg.Creator,
				PriceDenom: orderPlacement.PriceDenom,
				AssetDenom: orderPlacement.AssetDenom,
				OrderType:  orderPlacement.OrderType,
				Direction:  orderPlacement.PositionDirection,
				Effect:     orderPlacement.PositionEffect,
				Leverage:   orderPlacement.Leverage,
			},
		)
		idsInResp = append(idsInResp, nextId)
		nextId += 1
	}
	k.SetNextOrderId(ctx, nextId)

	return &types.MsgPlaceOrdersResponse{
		OrderIds: idsInResp,
	}, nil
}
