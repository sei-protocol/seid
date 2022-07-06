package cli

import (
	"github.com/sei-protocol/sei-chain/x/dex/types"

	"github.com/cosmos/cosmos-sdk/client"
	"github.com/cosmos/cosmos-sdk/client/flags"
	"github.com/cosmos/cosmos-sdk/client/tx"
	sdk "github.com/cosmos/cosmos-sdk/types"
	govtypes "github.com/cosmos/cosmos-sdk/x/gov/types"
	cutils "github.com/sei-protocol/sei-chain/x/dex/client/utils"

	"github.com/spf13/cobra"
)

// NewSubmitParamChangeProposalTxCmd returns a CLI command handler for creating
// a parameter change proposal governance transaction.
func NewRegisterPairsProposalTxCmd() *cobra.Command {
	cmd := &cobra.Command{
		Use:   "register-pairs-proposal [proposal-file]",
		Args:  cobra.ExactArgs(1),
		Short: "Submit a register pairs proposal",
		RunE: func(cmd *cobra.Command, args []string) error {
			clientCtx, err := client.GetClientTxContext(cmd)
			if err != nil {
				return err
			}
			proposal, err := cutils.ParseRegisterPairsProposalJSON(clientCtx.LegacyAmino, args[0])
			if err != nil {
				return err
			}

			// Convert proposal to RegisterPairsProposal Type
			from := clientCtx.GetFromAddress()
			proposal_batch_contract_pair, err := proposal.BatchContractPair.ToMultipleBatchContractPair()
			if err != nil {
				return err
			}
			content := types.NewRegisterPairsProposal(
				proposal.Title, proposal.Description, proposal_batch_contract_pair,
			)

			deposit, err := sdk.ParseCoinsNormalized(proposal.Deposit)
			if err != nil {
				return err
			}

			msg, err := govtypes.NewMsgSubmitProposal(&content, deposit, from)
			if err != nil {
				return err
			}

			return tx.GenerateOrBroadcastTxCLI(clientCtx, cmd.Flags(), msg)
		},
	}

	flags.AddTxFlagsToCmd(cmd)

	return cmd
}

// NewSubmitParamChangeProposalTxCmd returns a CLI command handler for creating
// a parameter change proposal governance transaction.
func NewUpdateTickSizeProposalTxCmd() *cobra.Command {
	cmd := &cobra.Command{
		Use:   "update-tick-size-proposal [proposal-file]",
		Args:  cobra.ExactArgs(1),
		Short: "Submit a change to tick size proposal",
		RunE: func(cmd *cobra.Command, args []string) error {
			clientCtx, err := client.GetClientTxContext(cmd)
			if err != nil {
				return err
			}

			proposal, err := cutils.ParseUpdateTickSizeProposalJSON(clientCtx.LegacyAmino, args[0])
			if err != nil {
				return err
			}

			// Convert proposal to UpdateTickSizeForPair Type
			ticksizes, err := proposal.TickSizes.ToTickSizes()
			if err != nil {
				return err
			}

			content := types.NewUpdateTickSizeForPair(proposal.Title, proposal.Description,ticksizes)

			deposit, err := sdk.ParseCoinsNormalized(proposal.Deposit)
			if err != nil {
				return err
			}
		
			msg, err := govtypes.NewMsgSubmitProposal(&content, deposit, clientCtx.GetFromAddress())
			if err != nil {
				return err
			}

			return tx.GenerateOrBroadcastTxCLI(clientCtx, cmd.Flags(), msg)
		},
	}

	flags.AddTxFlagsToCmd(cmd)

	return cmd
}
