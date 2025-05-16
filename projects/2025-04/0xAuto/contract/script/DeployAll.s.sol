// SPDX-License-Identifier: MIT
pragma solidity 0.8.24;

import {Script, console2} from "forge-std/Script.sol";
import {PointsToken} from "../src/token/PointsToken.sol";
import {PointsPaymaster, IEntryPoint} from "../src/paymaster/PointsPaymaster.sol";
import {FollowPermitRegistry} from "../src/registry/FollowPermitRegistry.sol";
import {MCPAgent} from "../src/agent/MCPAgent.sol";
import {Config} from "./Config.s.sol";

/**
 * @dev Run with:
 * forge script script/DeployAll.s.sol \
 *      --rpc-url $RPC_URL \
 *      --private-key $DEPLOYER_PK \
 *      --broadcast -vvvv
 */
contract DeployAll is Script {
    function run() external {
        /* ---------- read env & config ---------- */
        uint256 deployerPk = vm.envUint("DEPLOYER_PK");
        address entryPoint = vm.envAddress("ENTRYPOINT_ADDR"); // 4337 entrypoint address

        // Get network config
        Config config = new Config();
        Config.NetworkConfig memory networkConfig = config.getActiveNetworkConfig();
        console2.log("Deploying to %s (Chain ID: %s)", networkConfig.name, networkConfig.chainId);

        vm.startBroadcast(deployerPk);

        /* ---------- deploy ---------- */
        PointsToken token = new PointsToken("Points", "PTS");

        PointsPaymaster paymaster = new PointsPaymaster(IEntryPoint(entryPoint));
        // grant PAYMASTER_ROLE
        token.grantRole(token.PAYMASTER_ROLE(), address(paymaster));
        // grant TOKEN_ADMIN role for paymaster
        paymaster.grantRole(paymaster.TOKEN_ADMIN(), msg.sender);
        // set token in paymaster
        paymaster.setToken(address(token));

        FollowPermitRegistry reg = new FollowPermitRegistry();

        MCPAgent agent = new MCPAgent(address(reg));

        /* ---------- optional mint for smoke test ---------- */
        token.grantRole(token.MINTER_ROLE(), msg.sender);
        token.mintTo(msg.sender, 1_000 ether, "");

        vm.stopBroadcast();

        /* ---------- log addresses ---------- */
        console2.log("PointsToken  :", address(token));
        console2.log("Paymaster    :", address(paymaster));
        console2.log("Registry     :", address(reg));
        console2.log("MCPAgent     :", address(agent));
        console2.log("EntryPoint   :", entryPoint);
    }
}
