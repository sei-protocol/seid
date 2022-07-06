package types

import (
	"fmt"

	"github.com/cosmos/cosmos-sdk/types"
)

// DefaultIndex is the default capability global index
const DefaultIndex uint64 = 1

// DefaultGenesis returns the default Capability genesis state
func DefaultGenesis() *GenesisState {
	// set ticksize for each pair
	n := len(Denom_name)
	ticksizes := make([]*TickSize, n * n, n * n)
	i := 0
	for _, priceDenom := range Denom_value {
		for _, assetDenom := range Denom_value {
			ticksizes[i] = &TickSize{Pair: &Pair{PriceDenom: Denom(priceDenom), AssetDenom: Denom(assetDenom)}, Ticksize: types.NewDec(2)}
			i += 1
		}
	}
	return &GenesisState{
		LongBookList:  []LongBook{},
		ShortBookList: []ShortBook{},
		TickSizeList: ticksizes,
		Params:    DefaultParams(),
		LastEpoch: 0,
	}
}

// Validate performs basic genesis state validation returning an error upon any
// failure.
func (gs GenesisState) Validate() error {
	// Check for duplicated ID in longBook
	longBookIdMap := make(map[uint64]bool)
	for _, elem := range gs.LongBookList {
		if _, ok := longBookIdMap[elem.Price.BigInt().Uint64()]; ok {
			return fmt.Errorf("duplicated price for longBook")
		}
		longBookIdMap[elem.Price.BigInt().Uint64()] = true
	}
	// Check for duplicated ID in shortBook
	shortBookIdMap := make(map[uint64]bool)
	for _, elem := range gs.ShortBookList {
		if _, ok := shortBookIdMap[elem.Price.BigInt().Uint64()]; ok {
			return fmt.Errorf("duplicated price for shortBook")
		}
		shortBookIdMap[elem.Price.BigInt().Uint64()] = true
	}
	// this line is used by starport scaffolding # genesis/types/validate

	return gs.Params.Validate()
}
