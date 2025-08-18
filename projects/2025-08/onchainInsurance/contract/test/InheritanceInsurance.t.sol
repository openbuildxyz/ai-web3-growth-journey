// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Test, console} from "forge-std/Test.sol";
import {InsuranceManager} from "../src/InsuranceManager.sol";
import {MockUSDC} from "../src/MockUSDC.sol";

contract InheritanceInsuranceTest is Test {
    InsuranceManager public insuranceManager;
    MockUSDC public usdc;
    address public owner;
    address public user1;
    address public user2;
    address public mysteriousAddress;

    function setUp() public {
        owner = address(this);
        user1 = makeAddr("user1");
        user2 = makeAddr("user2");
        mysteriousAddress = makeAddr("mysteriousAddress");

        // Deploy contracts
        usdc = new MockUSDC();
        insuranceManager = new InsuranceManager(address(usdc));

        // Give users some USDC
        usdc.mint(user1, 20000 * 10**6); // 20,000 USDC
        usdc.mint(user2, 20000 * 10**6); // 20,000 USDC

        // Set mysterious address
        insuranceManager.setMysteriousAddress(mysteriousAddress);
    }

    function testInheritanceMechanismSuccess() public {
        // Simplified test focusing on core inheritance functionality
        
        // Set initial test time to January 1970
        insuranceManager.setTestTime(1970, 1);
        
        // === STEP 1: Create and fund insurance ===
        insuranceManager.createInsurance("China", "Typhoon", 2, 1970);
        bytes32 insuranceId = insuranceManager.getInsuranceId("China", "Typhoon", 2, 1970);

        // Users buy insurance
        vm.startPrank(user1);
        usdc.approve(address(insuranceManager), 1000 * 10**6);
        insuranceManager.buyInsurance(insuranceId, 1000 * 10**6);
        vm.stopPrank();

        // Total pool: 1000 USDC
        assertEq(insuranceManager.getInsurancePool(insuranceId), 1000 * 10**6);

        // === STEP 2: Advance time and process pool ===
        insuranceManager.setTestTime(1970, 3); // Move to March (February ended)

        // Process unclaimed pool (no disaster declared)
        uint mysteriousBalanceBefore = usdc.balanceOf(mysteriousAddress);
        insuranceManager.processUnclaimedPool(insuranceId);
        uint mysteriousBalanceAfter = usdc.balanceOf(mysteriousAddress);

        // Check mysterious address received 20% = 200 USDC
        assertEq(mysteriousBalanceAfter - mysteriousBalanceBefore, 200 * 10**6);

        // === STEP 3: Verify next month's insurance was created with inheritance ===
        bytes32 nextInsuranceId = insuranceManager.getInsuranceId("China", "Typhoon", 3, 1970);
        (,,,, bool exists,,,,,,) = insuranceManager.insuranceInfos(nextInsuranceId);
        assertTrue(exists);
        
        (uint totalPool, uint userContributions, uint inheritedAmount,,) = 
            insuranceManager.getInsuranceFinancialInfo(nextInsuranceId);
        
        // Should have inherited 80% = 800 USDC
        assertEq(inheritedAmount, 800 * 10**6);
        assertEq(totalPool, 800 * 10**6);
        assertEq(userContributions, 0); // No user purchases yet
        
        console.log("Inheritance test passed!");
        console.log("Original pool: 1000 USDC");
        console.log("Mysterious address received: %d USDC", (mysteriousBalanceAfter - mysteriousBalanceBefore) / 10**6);
        console.log("Next month inherited: %d USDC", inheritedAmount / 10**6);
    }

    function testCannotClaimWithoutDisasterDetermination() public {
        // Create insurance for current month
        insuranceManager.createInsurance("Japan", "Earthquake", 2, 1970);
        bytes32 insuranceId = insuranceManager.getInsuranceId("Japan", "Earthquake", 2, 1970);

        // User buys insurance
        vm.startPrank(user1);
        usdc.approve(address(insuranceManager), 1000 * 10**6);
        insuranceManager.buyInsurance(insuranceId, 1000 * 10**6);
        vm.stopPrank();

        // Fast forward to next month (insurance month has passed)
        vm.warp(block.timestamp + 60 * 24 * 60 * 60);

        // Try to claim without disaster declaration - should fail
        vm.startPrank(user1);
        vm.expectRevert("Disaster status has not been determined yet");
        insuranceManager.claim(insuranceId);
        vm.stopPrank();

        // Now declare disaster
        insuranceManager.declareDisaster(insuranceId, 80);

        // Now claim should work
        vm.startPrank(user1);
        insuranceManager.claim(insuranceId); // Should succeed
        vm.stopPrank();

        // Verify user received claim
        assertTrue(insuranceManager.hasUserClaimed(user1, insuranceId));
    }

    function testCannotClaimAfterPoolProcessed() public {
        // Set initial test time to January 1970
        insuranceManager.setTestTime(1970, 1);
        
        // Create insurance for February 1970 (future month)
        insuranceManager.createInsurance("India", "Flood", 2, 1970);
        bytes32 insuranceId = insuranceManager.getInsuranceId("India", "Flood", 2, 1970);

        // User buys insurance
        vm.startPrank(user1);
        usdc.approve(address(insuranceManager), 1000 * 10**6);
        insuranceManager.buyInsurance(insuranceId, 1000 * 10**6);
        vm.stopPrank();

        // Move time to March 1970 (February has ended)
        insuranceManager.setTestTime(1970, 3);

        // Process pool without declaring disaster (no disaster scenario)
        insuranceManager.processUnclaimedPool(insuranceId);

        // Now user should be able to claim (but will get 0 because no disaster)
        uint user1BalanceBefore = usdc.balanceOf(user1);
        vm.startPrank(user1);
        insuranceManager.claim(insuranceId); // Should succeed but with 0 payout
        vm.stopPrank();
        uint user1BalanceAfter = usdc.balanceOf(user1);

        // Verify no payout (disaster didn't happen)
        assertEq(user1BalanceAfter - user1BalanceBefore, 0);
        assertTrue(insuranceManager.hasUserClaimed(user1, insuranceId));
    }

    function testUserCanOnlyClaimOwnInsurance() public {
        // Set initial test time to January 1970
        insuranceManager.setTestTime(1970, 1);
        
        // Create two different insurances for March 1970
        insuranceManager.createInsurance("China", "Typhoon", 3, 1970);
        insuranceManager.createInsurance("Japan", "Earthquake", 3, 1970);
        
        bytes32 chinaId = insuranceManager.getInsuranceId("China", "Typhoon", 3, 1970);
        bytes32 japanId = insuranceManager.getInsuranceId("Japan", "Earthquake", 3, 1970);

        // User1 buys China insurance
        vm.startPrank(user1);
        usdc.approve(address(insuranceManager), 1000 * 10**6);
        insuranceManager.buyInsurance(chinaId, 1000 * 10**6);
        vm.stopPrank();

        // User2 buys Japan insurance
        vm.startPrank(user2);
        usdc.approve(address(insuranceManager), 1000 * 10**6);
        insuranceManager.buyInsurance(japanId, 1000 * 10**6);
        vm.stopPrank();

        // Move time to April 1970 (March has ended)
        insuranceManager.setTestTime(1970, 4);

        // Declare disasters for both
        insuranceManager.declareDisaster(chinaId, 80);
        insuranceManager.declareDisaster(japanId, 90);

        // User1 tries to claim Japan insurance (should fail - no shares)
        vm.startPrank(user1);
        vm.expectRevert("No shares to claim");
        insuranceManager.claim(japanId);
        vm.stopPrank();

        // User1 claims own China insurance (should succeed)
        vm.startPrank(user1);
        insuranceManager.claim(chinaId); // Should succeed
        vm.stopPrank();

        // User2 claims own Japan insurance (should succeed)
        vm.startPrank(user2);
        insuranceManager.claim(japanId); // Should succeed
        vm.stopPrank();

        // Verify claims
        assertTrue(insuranceManager.hasUserClaimed(user1, chinaId));
        assertTrue(insuranceManager.hasUserClaimed(user2, japanId));
        assertFalse(insuranceManager.hasUserClaimed(user1, japanId)); // User1 never claimed Japan
        assertFalse(insuranceManager.hasUserClaimed(user2, chinaId)); // User2 never claimed China
    }

    function testInheritanceChainTracking() public {
        // Set initial test time to January 1970
        insuranceManager.setTestTime(1970, 1);
        
        // Create and process multiple months to build inheritance chain
        bytes32[] memory ids = new bytes32[](3);
        
        // February
        insuranceManager.createInsurance("Brazil", "Flood", 2, 1970);
        ids[0] = insuranceManager.getInsuranceId("Brazil", "Flood", 2, 1970);
        
        vm.startPrank(user1);
        usdc.approve(address(insuranceManager), 1000 * 10**6);
        insuranceManager.buyInsurance(ids[0], 1000 * 10**6);
        vm.stopPrank();

        // Move time to March and process February (no disaster)
        insuranceManager.setTestTime(1970, 3);
        insuranceManager.processUnclaimedPool(ids[0]);
        
        // March should be auto-created
        ids[1] = insuranceManager.getInsuranceId("Brazil", "Flood", 3, 1970);
        (,,,, bool mar_exists,,,,,,) = insuranceManager.insuranceInfos(ids[1]);
        assertTrue(mar_exists);
        
        // Still in March - add more funds to March (we can buy current month)
        // Actually, let's stay in February and buy March insurance
        insuranceManager.setTestTime(1970, 2); // Go back to February
        vm.startPrank(user1);
        usdc.approve(address(insuranceManager), 500 * 10**6);
        insuranceManager.buyInsurance(ids[1], 500 * 10**6); // Buy March insurance while in February
        vm.stopPrank();

        // Move time to April and process March (no disaster)
        insuranceManager.setTestTime(1970, 4);
        insuranceManager.processUnclaimedPool(ids[1]);
        
        // April should be auto-created
        ids[2] = insuranceManager.getInsuranceId("Brazil", "Flood", 4, 1970);
        (,,,, bool apr_exists,,,,,,) = insuranceManager.insuranceInfos(ids[2]);
        assertTrue(apr_exists);

        // Check inheritance chain
        bytes32[] memory chain = insuranceManager.getInheritanceChain(ids[0], 10);
        assertEq(chain.length, 3);
        assertEq(chain[0], ids[0]); // February
        assertEq(chain[1], ids[1]); // March
        assertEq(chain[2], ids[2]); // April

        // Check inheritance amounts accumulated in April
        (uint totalPool, uint userContributions, uint inheritedAmount,,) = 
            insuranceManager.getInsuranceFinancialInfo(ids[2]);
        
        // Should have inherited funds from previous months
        assertTrue(inheritedAmount > 0);
        console.log("April inherited %d USDC from previous months", inheritedAmount / 10**6);
    }

    function testMysteriousAddressConfiguration() public {
        // Set initial test time to January 1970
        insuranceManager.setTestTime(1970, 1);
        
        // Test changing mysterious address and ratios
        address newMysteriousAddress = makeAddr("newCharity");
        
        // Change mysterious address
        insuranceManager.setMysteriousAddress(newMysteriousAddress);
        assertEq(insuranceManager.mysteriousAddress(), newMysteriousAddress);
        
        // Change distribution ratios
        insuranceManager.setDistributionRatios(30, 70); // 30% mysterious, 70% inheritance
        assertEq(insuranceManager.mysteriousRatio(), 30);
        assertEq(insuranceManager.inheritanceRatio(), 70);
        
        // Test with new ratios - create insurance for February 1970
        insuranceManager.createInsurance("Australia", "Bushfire", 2, 1970);
        bytes32 insuranceId = insuranceManager.getInsuranceId("Australia", "Bushfire", 2, 1970);
        
        vm.startPrank(user1);
        usdc.approve(address(insuranceManager), 1000 * 10**6);
        insuranceManager.buyInsurance(insuranceId, 1000 * 10**6);
        vm.stopPrank();
        
        // Move time to March 1970
        insuranceManager.setTestTime(1970, 3);
        
        uint newMysteriousBalanceBefore = usdc.balanceOf(newMysteriousAddress);
        insuranceManager.processUnclaimedPool(insuranceId);
        uint newMysteriousBalanceAfter = usdc.balanceOf(newMysteriousAddress);
        
        // Should receive 30% = 300 USDC
        assertEq(newMysteriousBalanceAfter - newMysteriousBalanceBefore, 300 * 10**6);
    }

    function testCannotExceedHundredPercentRatio() public {
        // Try to set ratios that exceed 100%
        vm.expectRevert("Ratios cannot exceed 100%");
        insuranceManager.setDistributionRatios(60, 50); // 60% + 50% = 110% > 100%
        
        // Valid ratios should work
        insuranceManager.setDistributionRatios(40, 50); // 40% + 50% = 90% <= 100%
        assertEq(insuranceManager.mysteriousRatio(), 40);
        assertEq(insuranceManager.inheritanceRatio(), 50);
    }
} 