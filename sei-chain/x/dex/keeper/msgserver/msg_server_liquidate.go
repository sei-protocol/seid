package msgserver

import (
	"context"

	"github.com/sei-protocol/sei-chain/x/dex/types"
	typesutils "github.com/sei-protocol/sei-chain/x/dex/types/utils"
)

func (k msgServer) Liquidate(goCtx context.Context, msg *types.MsgLiquidation) (*types.MsgLiquidationResponse, error) {
	_, span := (*k.tracingInfo.Tracer).Start(goCtx, "PlaceOrders")
	defer span.End()

	k.MemState.GetLiquidationRequests(
		typesutils.ContractAddress(msg.GetContractAddr()),
	).AddNewLiquidationRequest(msg.Creator, msg.AccountToLiquidate)

	return &types.MsgLiquidationResponse{}, nil
}
