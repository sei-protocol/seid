package app

import (
	sdk "github.com/cosmos/cosmos-sdk/types"
	"github.com/cosmos/cosmos-sdk/types/module"
	upgradetypes "github.com/cosmos/cosmos-sdk/x/upgrade/types"
)

const UpgradeNameOracleModule = "create-oracle-mod"
const UpgradeOracleStaleIndicator = "upgrade-oracle-stale-indicator"

func (app App) RegisterUpgradeHandlers() {
	app.UpgradeKeeper.SetUpgradeHandler(UpgradeNameOracleModule, func(ctx sdk.Context, plan upgradetypes.Plan, fromVM module.VersionMap) (module.VersionMap, error) {
		return app.mm.RunMigrations(ctx, app.configurator, fromVM)
	})
	app.UpgradeKeeper.SetUpgradeHandler(UpgradeOracleStaleIndicator, func(ctx sdk.Context, plan upgradetypes.Plan, fromVM module.VersionMap) (module.VersionMap, error) {
		return app.mm.RunMigrations(ctx, app.configurator, fromVM)
	})
}
