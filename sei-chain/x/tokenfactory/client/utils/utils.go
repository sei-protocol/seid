package utils

import (
	"os"

	"github.com/cosmos/cosmos-sdk/codec"
)

type (
	AddCreatorsToDenomFeeWhitelistProposalJSON struct {
		Title       string   `json:"title" yaml:"title"`
		Description string   `json:"description" yaml:"description"`
		CreatorList []string `json:"creator_list" yaml:"creator_list"`
		Deposit     string   `json:"deposit" yaml:"deposit"`
	}
)

// ParseAddCreatorsToDenomFeeWhitelistProposalJSON reads and parses a AddCreatorsToDenomFeeWhitelistProposalJSON from
// a file.
func ParseAddCreatorsToDenomFeeWhitelistProposalJSON(cdc *codec.LegacyAmino, proposalFile string) (AddCreatorsToDenomFeeWhitelistProposalJSON, error) {
	proposal := AddCreatorsToDenomFeeWhitelistProposalJSON{}

	contents, err := os.ReadFile(proposalFile)
	if err != nil {
		return proposal, err
	}

	if err := cdc.UnmarshalJSON(contents, &proposal); err != nil {
		return proposal, err
	}

	return proposal, nil
}
