package exchange

import (
	sdk "github.com/cosmos/cosmos-sdk/types"
	"github.com/sei-protocol/sei-chain/x/dex/types"
)

func MatchMarketOrders(
	ctx sdk.Context,
	marketOrders []types.Order,
	orderBook []types.OrderBook,
	pair types.Pair,
	direction types.PositionDirection,
	dirtyPrices *DirtyPrices,
	settlements *[]*types.SettlementEntry,
	zeroOrders *[]AccountOrderID,
) (sdk.Dec, sdk.Dec) {
	totalExecuted, totalPrice := sdk.ZeroDec(), sdk.ZeroDec()
	allTakerSettlements := []*types.SettlementEntry{}
	for idx, marketOrder := range marketOrders {
		for i := range orderBook {
			var existingOrder types.OrderBook
			if direction == types.PositionDirection_LONG {
				existingOrder = orderBook[i]
			} else {
				existingOrder = orderBook[len(orderBook)-i-1]
			}
			if existingOrder.GetEntry().Quantity.IsZero() {
				continue
			}
			// If price is zero, it means the order sender
			// doesn't want to specify a worst price, so
			// we don't need to perform price check for such orders
			if !marketOrder.Price.IsZero() {
				// Check if worst price can be matched against order book
				if (direction == types.PositionDirection_LONG && marketOrder.Price.LT(existingOrder.GetPrice())) ||
					(direction == types.PositionDirection_SHORT && marketOrder.Price.GT(existingOrder.GetPrice())) {
					break
				}
			}
			var executed sdk.Dec
			if marketOrder.Quantity.LTE(existingOrder.GetEntry().Quantity) {
				executed = marketOrder.Quantity
			} else {
				executed = existingOrder.GetEntry().Quantity
			}
			marketOrder.Quantity = marketOrder.Quantity.Sub(executed)
			totalExecuted = totalExecuted.Add(executed)
			totalPrice = totalPrice.Add(
				executed.Mul(existingOrder.GetPrice()),
			)
			dirtyPrices.Add(existingOrder.GetPrice())

			takerSettlements, makerSettlements, zeroAccountOrders := Settle(
				marketOrder,
				executed,
				existingOrder,
				marketOrder.Price,
			)
			*settlements = append(*settlements, makerSettlements...)
			*zeroOrders = append(*zeroOrders, zeroAccountOrders...)
			// taker settlements' clearing price will need to be adjusted after all market order executions finish
			allTakerSettlements = append(allTakerSettlements, takerSettlements...)
			if marketOrder.Quantity.IsZero() {
				break
			}
		}
		marketOrders[idx].Quantity = marketOrder.Quantity
	}
	if totalExecuted.IsPositive() {
		clearingPrice := totalPrice.Quo(totalExecuted)
		for _, settlement := range allTakerSettlements {
			settlement.ExecutionCostOrProceed = clearingPrice
		}
		*settlements = append(*settlements, allTakerSettlements...)
	}
	return totalPrice, totalExecuted
}
