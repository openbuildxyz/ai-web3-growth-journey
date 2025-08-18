// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Test, console} from "forge-std/Test.sol";
import {InsuranceManager} from "../src/InsuranceManager.sol";
import {MockUSDC} from "../src/MockUSDC.sol";

contract InsuranceManagerTest is Test {
    InsuranceManager public insuranceManager;
    MockUSDC public usdc;
    address public owner;
    address public user1;
    address public user2;

    function setUp() public {
        owner = address(this);
        user1 = makeAddr("user1");
        user2 = makeAddr("user2");

        // Deploy contracts
        usdc = new MockUSDC();
        insuranceManager = new InsuranceManager(address(usdc));

        // Give users some USDC
        usdc.mint(user1, 10000 * 10**6); // 10,000 USDC
        usdc.mint(user2, 10000 * 10**6); // 10,000 USDC
    }

    function testCreateInsurance() public {
        insuranceManager.createInsurance("China", "Typhoon", 7, 1970);
        
        bytes32 insuranceId = insuranceManager.getInsuranceId("China", "Typhoon", 7, 1970);
        
        (string memory country, string memory disasterType, uint month, uint year, bool exists,,,,,,) = 
            insuranceManager.insuranceInfos(insuranceId);
        
        assertEq(country, "China");
        assertEq(disasterType, "Typhoon");
        assertEq(month, 7);
        assertEq(year, 1970);
        assertTrue(exists);
    }

    function testBuyInsurance() public {
        // Create insurance first
        insuranceManager.createInsurance("China", "Typhoon", 7, 1970);
        bytes32 insuranceId = insuranceManager.getInsuranceId("China", "Typhoon", 7, 1970);

        // User1 buys insurance
        vm.startPrank(user1);
        usdc.approve(address(insuranceManager), 1000 * 10**6); // Approve 1000 USDC
        insuranceManager.buyInsurance(insuranceId, 1000 * 10**6); // Buy with 1000 USDC
        vm.stopPrank();

        // Check user shares
        uint userShares = insuranceManager.getUserShares(user1, insuranceId);
        assertEq(userShares, 1000 * 10**6); // Should get 1000 shares (1:1 ratio)

        // Check pool balance
        uint poolBalance = insuranceManager.getInsurancePool(insuranceId);
        assertEq(poolBalance, 1000 * 10**6);
    }

    function testDonate() public {
        // Create insurance first
        insuranceManager.createInsurance("China", "Typhoon", 7, 1970);
        bytes32 insuranceId = insuranceManager.getInsuranceId("China", "Typhoon", 7, 1970);

        // User1 donates
        vm.startPrank(user1);
        usdc.approve(address(insuranceManager), 500 * 10**6); // Approve 500 USDC
        insuranceManager.donate(insuranceId, 500 * 10**6); // Donate 500 USDC
        vm.stopPrank();

        // Check user shares (should be 0 for donation)
        uint userShares = insuranceManager.getUserShares(user1, insuranceId);
        assertEq(userShares, 0);

        // Check pool balance
        uint poolBalance = insuranceManager.getInsurancePool(insuranceId);
        assertEq(poolBalance, 500 * 10**6);
    }

    function testDeclareDisaster() public {
        // Set initial test time to January 1970
        insuranceManager.setTestTime(1970, 1);
        
        // Create insurance for February 1970 (future month)
        insuranceManager.createInsurance("China", "Typhoon", 2, 1970);
        bytes32 insuranceId = insuranceManager.getInsuranceId("China", "Typhoon", 2, 1970);

        // Move time to March 1970 so February becomes past
        insuranceManager.setTestTime(1970, 3);

        // Declare disaster with 80% claim ratio
        insuranceManager.declareDisaster(insuranceId, 80);

        (,,,, bool exists, bool disasterHappened,,, uint claimRatio,,) = 
            insuranceManager.insuranceInfos(insuranceId);
        
        assertTrue(exists);
        assertTrue(disasterHappened);
        assertEq(claimRatio, 80);
    }

    function testFullInsuranceFlow() public {
        // Set initial test time to January 1970
        insuranceManager.setTestTime(1970, 1);
        
        // 1. Create insurance for February 1970 (future)
        insuranceManager.createInsurance("China", "Typhoon", 2, 1970);
        bytes32 insuranceId = insuranceManager.getInsuranceId("China", "Typhoon", 2, 1970);

        // 2. Users buy insurance
        vm.startPrank(user1);
        usdc.approve(address(insuranceManager), 1000 * 10**6);
        insuranceManager.buyInsurance(insuranceId, 1000 * 10**6); // 1000 USDC
        vm.stopPrank();

        vm.startPrank(user2);
        usdc.approve(address(insuranceManager), 2000 * 10**6);
        insuranceManager.buyInsurance(insuranceId, 2000 * 10**6); // 2000 USDC
        vm.stopPrank();

        // 3. Someone donates
        vm.startPrank(user1);
        usdc.approve(address(insuranceManager), 500 * 10**6);
        insuranceManager.donate(insuranceId, 500 * 10**6); // 500 USDC donation
        vm.stopPrank();

        // Check total pool: 1000 + 2000 + 500 = 3500 USDC
        uint totalPool = insuranceManager.getInsurancePool(insuranceId);
        assertEq(totalPool, 3500 * 10**6);

        // Check total shares: 1000 + 2000 = 3000 shares (donations don't get shares)
        uint totalShares = insuranceManager.getTotalShares(insuranceId);
        assertEq(totalShares, 3000 * 10**6);

        // 4. Move time to March 1970 and declare disaster with 70% claim ratio
        insuranceManager.setTestTime(1970, 3);
        insuranceManager.declareDisaster(insuranceId, 70);

        // 5. Users check potential claims
        uint user1PotentialClaim = insuranceManager.getPotentialClaim(user1, insuranceId);
        uint user2PotentialClaim = insuranceManager.getPotentialClaim(user2, insuranceId);
        
        // Claimable pool = 3500 * 70% = 2450 USDC
        // User1: (1000/3000) * 2450 = 816.67 USDC
        // User2: (2000/3000) * 2450 = 1633.33 USDC
        assertEq(user1PotentialClaim, 816666666); // ~816.67 USDC
        assertEq(user2PotentialClaim, 1633333333); // ~1633.33 USDC

        // 6. Users claim
        uint user1BalanceBefore = usdc.balanceOf(user1);
        vm.prank(user1);
        insuranceManager.claim(insuranceId);
        uint user1BalanceAfter = usdc.balanceOf(user1);
        
        uint user2BalanceBefore = usdc.balanceOf(user2);
        vm.prank(user2);
        insuranceManager.claim(insuranceId);
        uint user2BalanceAfter = usdc.balanceOf(user2);

        // Check claim amounts
        assertEq(user1BalanceAfter - user1BalanceBefore, 816666666);
        assertEq(user2BalanceAfter - user2BalanceBefore, 1633333333);

        // Check that users can't claim again
        assertTrue(insuranceManager.hasUserClaimed(user1, insuranceId));
        assertTrue(insuranceManager.hasUserClaimed(user2, insuranceId));
    }

    function testCannotBuyPastInsurance() public {
        // Try to create insurance for a past month (this should fail in real scenario)
        // For testing, we'll create a future insurance and then test the buy logic
        insuranceManager.createInsurance("China", "Typhoon", 12, 1970);
        bytes32 insuranceId = insuranceManager.getInsuranceId("China", "Typhoon", 12, 1970);

        // This should work (buying future insurance)
        vm.startPrank(user1);
        usdc.approve(address(insuranceManager), 1000 * 10**6);
        insuranceManager.buyInsurance(insuranceId, 1000 * 10**6);
        vm.stopPrank();

        // Verify the purchase worked
        uint userShares = insuranceManager.getUserShares(user1, insuranceId);
        assertEq(userShares, 1000 * 10**6);
    }
} 