// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Script} from "forge-std/Script.sol";
import {console} from "forge-std/console.sol";
import {InsuranceManager} from "../src/InsuranceManager.sol";
import {MockUSDC} from "../src/MockUSDC.sol";

contract DeployScript is Script {
    function run() external {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        vm.startBroadcast(deployerPrivateKey);

        // Deploy MockUSDC first
        MockUSDC usdc = new MockUSDC();
        console.log("MockUSDC deployed at:", address(usdc));

        // Deploy InsuranceManager
        InsuranceManager insuranceManager = new InsuranceManager(address(usdc));
        console.log("InsuranceManager deployed at:", address(insuranceManager));

        // Mint some USDC for testing (1 million USDC)
        usdc.mint(msg.sender, 1000000 * 1e6);
        console.log("Minted 1,000,000 USDC to deployer");

        // Create some sample insurances
        createSampleInsurances(insuranceManager);
        
        // Add some sample data to the insurances
        populateSampleData(insuranceManager, usdc);

        vm.stopBroadcast();

        // Print final summary
        console.log("\n=== Deployment Summary ===");
        console.log("MockUSDC:", address(usdc));
        console.log("InsuranceManager:", address(insuranceManager));
        console.log("Deployer USDC balance:", usdc.balanceOf(msg.sender) / 1e6, "USDC");
        console.log("\n=== Sample Insurances Created ===");
        console.log("1. China Typhoon 2025-09");
        console.log("2. Japan Earthquake 2025-10");
        console.log("3. India Flood 2025-11");
        console.log("4. Philippines Typhoon 2025-12");
        console.log("5. USA Hurricane 2025-09");
    }

    function createSampleInsurances(InsuranceManager insuranceManager) internal {
        // Create 5 sample insurances for different countries and disaster types
        // Use future months to avoid the "past months" restriction
        insuranceManager.createInsurance("China", "Typhoon", 9, 2025);
        console.log("Created: China Typhoon 2025-09");

        insuranceManager.createInsurance("Japan", "Earthquake", 10, 2025);
        console.log("Created: Japan Earthquake 2025-10");

        insuranceManager.createInsurance("India", "Flood", 11, 2025);
        console.log("Created: India Flood 2025-11");

        insuranceManager.createInsurance("Philippines", "Typhoon", 12, 2025);
        console.log("Created: Philippines Typhoon 2025-12");

        insuranceManager.createInsurance("USA", "Hurricane", 9, 2025);
        console.log("Created: USA Hurricane 2025-09");
    }

    function populateSampleData(InsuranceManager insuranceManager, MockUSDC usdc) internal {
        // Approve the insurance manager to spend USDC
        usdc.approve(address(insuranceManager), 1000000 * 1e6);

        // Get insurance IDs
        bytes32 chinaId = insuranceManager.getInsuranceId("China", "Typhoon", 9, 2025);
        bytes32 japanId = insuranceManager.getInsuranceId("Japan", "Earthquake", 10, 2025);
        bytes32 indiaId = insuranceManager.getInsuranceId("India", "Flood", 11, 2025);
        bytes32 philippinesId = insuranceManager.getInsuranceId("Philippines", "Typhoon", 12, 2025);
        bytes32 usaId = insuranceManager.getInsuranceId("USA", "Hurricane", 9, 2025);

        // Add some purchases and donations to make the data realistic
        
        // China Typhoon - Popular insurance with good funding
        insuranceManager.buyInsurance(chinaId, 5000 * 1e6);  // 5000 USDC
        insuranceManager.donate(chinaId, 1000 * 1e6);        // 1000 USDC donation
        console.log("Added 5000 USDC purchase + 1000 USDC donation to China Typhoon");

        // Japan Earthquake - Moderate funding
        insuranceManager.buyInsurance(japanId, 3000 * 1e6);  // 3000 USDC
        insuranceManager.donate(japanId, 500 * 1e6);         // 500 USDC donation
        console.log("Added 3000 USDC purchase + 500 USDC donation to Japan Earthquake");

        // India Flood - Good funding
        insuranceManager.buyInsurance(indiaId, 2000 * 1e6);  // 2000 USDC
        insuranceManager.donate(indiaId, 800 * 1e6);         // 800 USDC donation
        console.log("Added 2000 USDC purchase + 800 USDC donation to India Flood");

        // Philippines Typhoon - Smaller but active
        insuranceManager.buyInsurance(philippinesId, 1500 * 1e6);  // 1500 USDC
        insuranceManager.donate(philippinesId, 300 * 1e6);         // 300 USDC donation
        console.log("Added 1500 USDC purchase + 300 USDC donation to Philippines Typhoon");

        // USA Hurricane - Large insurance pool
        insuranceManager.buyInsurance(usaId, 8000 * 1e6);  // 8000 USDC
        insuranceManager.donate(usaId, 2000 * 1e6);        // 2000 USDC donation
        console.log("Added 8000 USDC purchase + 2000 USDC donation to USA Hurricane");
    }


} 