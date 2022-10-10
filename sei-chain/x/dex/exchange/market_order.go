package exchange

import (
	sdk "github.com/cosmos/cosmos-sdk/types"
	"github.com/sei-protocol/sei-chain/x/dex/types"
)

func MatchMarketOrders(
	ctx sdk.Context,
	marketOrders []*types.Order,
	orderBookEntries *types.CachedSortedOrderBookEntries,
	direction types.PositionDirection,
) ExecutionOutcome {
	totalExecuted, totalPrice := sdk.ZeroDec(), sdk.ZeroDec()
	settlements := []*types.SettlementEntry{}
	allTakerSettlements := []*types.SettlementEntry{}
	for _, marketOrder := range marketOrders {
		switch marketOrder.OrderType {
		case types.OrderType_FOKMARKETBYVALUE:
			settlements, allTakerSettlements = MatchByValueFOKMarketOrder(
				ctx, marketOrder, orderBookEntries, direction, &totalExecuted, &totalPrice, settlements, allTakerSettlements)
		case types.OrderType_FOKMARKET:
			settlements, allTakerSettlements = MatchFOKMarketOrder(
				ctx, marketOrder, orderBookEntries, direction, &totalExecuted, &totalPrice, settlements, allTakerSettlements)
		default:
			settlements, allTakerSettlements = MatchMarketOrder(
				ctx, marketOrder, orderBookEntries, direction, &totalExecuted, &totalPrice, settlements, allTakerSettlements)
		}
	}

	if totalExecuted.IsPositive() {
		clearingPrice := totalPrice.Quo(totalExecuted)
		for _, settlement := range allTakerSettlements {
			settlement.ExecutionCostOrProceed = clearingPrice
		}
		settlements = append(settlements, allTakerSettlements...)
	}
	return ExecutionOutcome{
		TotalNotional: totalPrice,
		TotalQuantity: totalExecuted,
		Settlements:   settlements,
	}
}

func MatchMarketOrder(
	ctx sdk.Context,
	marketOrder *types.Order,
	orderBookEntries *types.CachedSortedOrderBookEntries,
	direction types.PositionDirection,
	totalExecuted *sdk.Dec,
	totalPrice *sdk.Dec,
	settlements []*types.SettlementEntry,
	allTakerSettlements []*types.SettlementEntry,
) ([]*types.SettlementEntry, []*types.SettlementEntry) {
	remainingQuantity := marketOrder.Quantity
	for i := range orderBookEntries.Entries {
		var existingOrder types.OrderBookEntry
		if direction == types.PositionDirection_LONG {
			existingOrder = orderBookEntries.Entries[i]
		} else {
			existingOrder = orderBookEntries.Entries[len(orderBookEntries.Entries)-i-1]
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
		if remainingQuantity.LTE(existingOrder.GetEntry().Quantity) {
			executed = remainingQuantity
		} else {
			executed = existingOrder.GetEntry().Quantity
		}
		remainingQuantity = remainingQuantity.Sub(executed)
		*totalExecuted = totalExecuted.Add(executed)
		*totalPrice = totalPrice.Add(
			executed.Mul(existingOrder.GetPrice()),
		)
		orderBookEntries.AddDirtyEntry(existingOrder)

		takerSettlements, makerSettlements := Settle(
			ctx,
			marketOrder,
			executed,
			existingOrder,
			marketOrder.Price,
		)
		settlements = append(settlements, makerSettlements...)
		// taker settlements' clearing price will need to be adjusted after all market order executions finish
		allTakerSettlements = append(allTakerSettlements, takerSettlements...)
		if remainingQuantity.IsZero() {
			break
		}
	}

	return settlements, allTakerSettlements
}

func MatchFOKMarketOrder(
	ctx sdk.Context,
	marketOrder *types.Order,
	orderBookEntries *types.CachedSortedOrderBookEntries,
	direction types.PositionDirection,
	totalExecuted *sdk.Dec,
	totalPrice *sdk.Dec,
	settlements []*types.SettlementEntry,
	allTakerSettlements []*types.SettlementEntry,
) ([]*types.SettlementEntry, []*types.SettlementEntry) {
	// check if there is enough liquidity for fill-or-kill market order, if not skip them
	remainingQuantity := marketOrder.Quantity
	ordersToSettle := []types.OrderBookEntry{}
	quantityExecuted := []sdk.Dec{}
	for i := range orderBookEntries.Entries {
		var existingOrder types.OrderBookEntry
		if direction == types.PositionDirection_LONG {
			existingOrder = orderBookEntries.Entries[i]
		} else {
			existingOrder = orderBookEntries.Entries[len(orderBookEntries.Entries)-i-1]
		}
		if existingOrder.GetEntry().Quantity.IsZero() {
			continue
		}
		if !marketOrder.Price.IsZero() {
			if (direction == types.PositionDirection_LONG && marketOrder.Price.LT(existingOrder.GetPrice())) ||
				(direction == types.PositionDirection_SHORT && marketOrder.Price.GT(existingOrder.GetPrice())) {
				break
			}
		}

		var executed sdk.Dec
		if remainingQuantity.LTE(existingOrder.GetEntry().Quantity) {
			executed = remainingQuantity
		} else {
			executed = existingOrder.GetEntry().Quantity
		}
		remainingQuantity = remainingQuantity.Sub(executed)
		ordersToSettle = append(ordersToSettle, existingOrder)
		quantityExecuted = append(quantityExecuted, executed)

		if remainingQuantity.IsZero() {
			break
		}
	}

	if remainingQuantity.IsZero() {
		for i := range ordersToSettle {
			executed := quantityExecuted[i]
			existingOrder := ordersToSettle[i]

			*totalExecuted = totalExecuted.Add(executed)
			*totalPrice = totalPrice.Add(
				executed.Mul(existingOrder.GetPrice()),
			)
			orderBookEntries.AddDirtyEntry(existingOrder)

			takerSettlements, makerSettlements := Settle(
				ctx,
				marketOrder,
				executed,
				existingOrder,
				marketOrder.Price,
			)
			settlements = append(settlements, makerSettlements...)
			allTakerSettlements = append(allTakerSettlements, takerSettlements...)
		}
	}

	return settlements, allTakerSettlements
}

func MatchByValueFOKMarketOrder(
	ctx sdk.Context,
	marketOrder *types.Order,
	orderBookEntries *types.CachedSortedOrderBookEntries,
	direction types.PositionDirection,
	totalExecuted *sdk.Dec,
	totalPrice *sdk.Dec,
	settlements []*types.SettlementEntry,
	allTakerSettlements []*types.SettlementEntry,
) ([]*types.SettlementEntry, []*types.SettlementEntry) {
	remainingFund := marketOrder.Nominal
	remainingQuantity := marketOrder.Quantity
	ordersToSettle := []types.OrderBookEntry{}
	quantityExecuted := []sdk.Dec{}
	for i := range orderBookEntries.Entries {
		var existingOrder types.OrderBookEntry
		if direction == types.PositionDirection_LONG {
			existingOrder = orderBookEntries.Entries[i]
		} else {
			existingOrder = orderBookEntries.Entries[len(orderBookEntries.Entries)-i-1]
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
		if remainingFund.LTE(existingOrder.GetEntry().Quantity.Mul(existingOrder.GetEntry().Price)) {
			executed = remainingFund.Quo(existingOrder.GetEntry().Price)
			remainingFund = sdk.ZeroDec()
		} else {
			executed = existingOrder.GetEntry().Quantity
			remainingFund = remainingFund.Sub(executed.Mul(existingOrder.GetEntry().Price))
		}
		remainingQuantity = remainingQuantity.Sub(executed)
		ordersToSettle = append(ordersToSettle, existingOrder)
		quantityExecuted = append(quantityExecuted, executed)
		if remainingFund.IsZero() || remainingQuantity.LTE(sdk.ZeroDec()) {
			break
		}
	}

	// settle orders only when all fund are used
	if remainingFund.IsZero() && remainingQuantity.GTE(sdk.ZeroDec()) {
		marketByNominalSettlement := []*types.SettlementEntry{}
		for i := range ordersToSettle {
			executed := quantityExecuted[i]
			existingOrder := ordersToSettle[i]

			*totalExecuted = totalExecuted.Add(executed)
			*totalPrice = totalPrice.Add(
				executed.Mul(existingOrder.GetPrice()),
			)
			orderBookEntries.AddDirtyEntry(existingOrder)

			takerSettlements, makerSettlements := Settle(
				ctx,
				marketOrder,
				executed,
				existingOrder,
				marketOrder.Price,
			)
			settlements = append(settlements, makerSettlements...)
			marketByNominalSettlement = MergeByNominalTakerSettlements(append(marketByNominalSettlement, takerSettlements...))
		}
		allTakerSettlements = append(allTakerSettlements, marketByNominalSettlement...)
	}

	return settlements, allTakerSettlements
}

func MergeByNominalTakerSettlements(settlements []*types.SettlementEntry) []*types.SettlementEntry {
	aggregatedSettlement := types.SettlementEntry{Quantity: sdk.ZeroDec()}
	for _, settlement := range settlements {
		quantity := settlement.Quantity.Add(aggregatedSettlement.Quantity)
		aggregatedSettlement = *settlement
		aggregatedSettlement.Quantity = quantity
	}

	return []*types.SettlementEntry{&aggregatedSettlement}
}
