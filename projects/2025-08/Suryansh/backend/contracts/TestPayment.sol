// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract TestPayment {
    uint256 public paymentAmount = 2 ether;
    address public omsi;
    address public suryansh;
    
    event PaymentReleased(address to, uint256 amount);
    
    constructor(address _omsi, address _suryansh) {
        omsi = _omsi;
        suryansh = _suryansh;
    }
    
    function releasePayment() external {
        require(msg.sender == omsi, "Only omsi can release payment");
        payable(suryansh).transfer(paymentAmount);
        emit PaymentReleased(suryansh, paymentAmount);
    }
}