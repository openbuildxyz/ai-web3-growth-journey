# Frontend Contract Reference

Network: sepolia
Deployer: 0x56c0fee52344a563b2ea1a524a2b5ff71e9b4f24

## Addresses
- PlatformToken: 0x420e7088ecb3849805201a4a6a889060e0162985
- TokenExchange: 0x4004bfd7e3f173525a5cc79e271e6fc69174621e
- EscrowVault: 0xe11cd99c80a9699bd7567195297c29a3f04f58cf
- TaskManager: 0xe13f23df9db64611eedc362392bde5f2ceb9d578
- Arbitration: 0xbcd33f9ee5101bd6b8045a7f53f3b3f58f36a5dd

## TokenExchange behavior
- Rate formula: tokenAmount = msg.value * tokensPerEth / 1e18
- With tokensPerEth = 1000e18, 1 ETH buys 100 Q
- ETH is forwarded to treasury (default: deployer)

## TaskManager status enum
- 0 Created
- 1 Accepted
- 2 InProgress
- 3 PendingReview
- 4 Completed
- 5 Disputed
- 6 Arbitrated
- 7 Cancelled

## ABI

### PlatformToken ABI

```json
[
    {
        "inputs":  [
                       {
                           "internalType":  "string",
                           "name":  "name_",
                           "type":  "string"
                       },
                       {
                           "internalType":  "string",
                           "name":  "symbol_",
                           "type":  "string"
                       },
                       {
                           "internalType":  "uint256",
                           "name":  "cap_",
                           "type":  "uint256"
                       },
                       {
                           "internalType":  "address",
                           "name":  "admin_",
                           "type":  "address"
                       }
                   ],
        "stateMutability":  "nonpayable",
        "type":  "constructor"
    },
    {
        "inputs":  [

                   ],
        "name":  "AccessControlBadConfirmation",
        "type":  "error"
    },
    {
        "inputs":  [
                       {
                           "internalType":  "address",
                           "name":  "account",
                           "type":  "address"
                       },
                       {
                           "internalType":  "bytes32",
                           "name":  "neededRole",
                           "type":  "bytes32"
                       }
                   ],
        "name":  "AccessControlUnauthorizedAccount",
        "type":  "error"
    },
    {
        "inputs":  [
                       {
                           "internalType":  "uint256",
                           "name":  "increasedSupply",
                           "type":  "uint256"
                       },
                       {
                           "internalType":  "uint256",
                           "name":  "cap",
                           "type":  "uint256"
                       }
                   ],
        "name":  "ERC20ExceededCap",
        "type":  "error"
    },
    {
        "inputs":  [
                       {
                           "internalType":  "address",
                           "name":  "spender",
                           "type":  "address"
                       },
                       {
                           "internalType":  "uint256",
                           "name":  "allowance",
                           "type":  "uint256"
                       },
                       {
                           "internalType":  "uint256",
                           "name":  "needed",
                           "type":  "uint256"
                       }
                   ],
        "name":  "ERC20InsufficientAllowance",
        "type":  "error"
    },
    {
        "inputs":  [
                       {
                           "internalType":  "address",
                           "name":  "sender",
                           "type":  "address"
                       },
                       {
                           "internalType":  "uint256",
                           "name":  "balance",
                           "type":  "uint256"
                       },
                       {
                           "internalType":  "uint256",
                           "name":  "needed",
                           "type":  "uint256"
                       }
                   ],
        "name":  "ERC20InsufficientBalance",
        "type":  "error"
    },
    {
        "inputs":  [
                       {
                           "internalType":  "address",
                           "name":  "approver",
                           "type":  "address"
                       }
                   ],
        "name":  "ERC20InvalidApprover",
        "type":  "error"
    },
    {
        "inputs":  [
                       {
                           "internalType":  "uint256",
                           "name":  "cap",
                           "type":  "uint256"
                       }
                   ],
        "name":  "ERC20InvalidCap",
        "type":  "error"
    },
    {
        "inputs":  [
                       {
                           "internalType":  "address",
                           "name":  "receiver",
                           "type":  "address"
                       }
                   ],
        "name":  "ERC20InvalidReceiver",
        "type":  "error"
    },
    {
        "inputs":  [
                       {
                           "internalType":  "address",
                           "name":  "sender",
                           "type":  "address"
                       }
                   ],
        "name":  "ERC20InvalidSender",
        "type":  "error"
    },
    {
        "inputs":  [
                       {
                           "internalType":  "address",
                           "name":  "spender",
                           "type":  "address"
                       }
                   ],
        "name":  "ERC20InvalidSpender",
        "type":  "error"
    },
    {
        "anonymous":  false,
        "inputs":  [
                       {
                           "indexed":  true,
                           "internalType":  "address",
                           "name":  "owner",
                           "type":  "address"
                       },
                       {
                           "indexed":  true,
                           "internalType":  "address",
                           "name":  "spender",
                           "type":  "address"
                       },
                       {
                           "indexed":  false,
                           "internalType":  "uint256",
                           "name":  "value",
                           "type":  "uint256"
                       }
                   ],
        "name":  "Approval",
        "type":  "event"
    },
    {
        "anonymous":  false,
        "inputs":  [
                       {
                           "indexed":  true,
                           "internalType":  "bytes32",
                           "name":  "role",
                           "type":  "bytes32"
                       },
                       {
                           "indexed":  true,
                           "internalType":  "bytes32",
                           "name":  "previousAdminRole",
                           "type":  "bytes32"
                       },
                       {
                           "indexed":  true,
                           "internalType":  "bytes32",
                           "name":  "newAdminRole",
                           "type":  "bytes32"
                       }
                   ],
        "name":  "RoleAdminChanged",
        "type":  "event"
    },
    {
        "anonymous":  false,
        "inputs":  [
                       {
                           "indexed":  true,
                           "internalType":  "bytes32",
                           "name":  "role",
                           "type":  "bytes32"
                       },
                       {
                           "indexed":  true,
                           "internalType":  "address",
                           "name":  "account",
                           "type":  "address"
                       },
                       {
                           "indexed":  true,
                           "internalType":  "address",
                           "name":  "sender",
                           "type":  "address"
                       }
                   ],
        "name":  "RoleGranted",
        "type":  "event"
    },
    {
        "anonymous":  false,
        "inputs":  [
                       {
                           "indexed":  true,
                           "internalType":  "bytes32",
                           "name":  "role",
                           "type":  "bytes32"
                       },
                       {
                           "indexed":  true,
                           "internalType":  "address",
                           "name":  "account",
                           "type":  "address"
                       },
                       {
                           "indexed":  true,
                           "internalType":  "address",
                           "name":  "sender",
                           "type":  "address"
                       }
                   ],
        "name":  "RoleRevoked",
        "type":  "event"
    },
    {
        "anonymous":  false,
        "inputs":  [
                       {
                           "indexed":  true,
                           "internalType":  "address",
                           "name":  "from",
                           "type":  "address"
                       },
                       {
                           "indexed":  true,
                           "internalType":  "address",
                           "name":  "to",
                           "type":  "address"
                       },
                       {
                           "indexed":  false,
                           "internalType":  "uint256",
                           "name":  "value",
                           "type":  "uint256"
                       }
                   ],
        "name":  "Transfer",
        "type":  "event"
    },
    {
        "inputs":  [

                   ],
        "name":  "DEFAULT_ADMIN_ROLE",
        "outputs":  [
                        {
                            "internalType":  "bytes32",
                            "name":  "",
                            "type":  "bytes32"
                        }
                    ],
        "stateMutability":  "view",
        "type":  "function"
    },
    {
        "inputs":  [

                   ],
        "name":  "MINTER_ROLE",
        "outputs":  [
                        {
                            "internalType":  "bytes32",
                            "name":  "",
                            "type":  "bytes32"
                        }
                    ],
        "stateMutability":  "view",
        "type":  "function"
    },
    {
        "inputs":  [
                       {
                           "internalType":  "address",
                           "name":  "owner",
                           "type":  "address"
                       },
                       {
                           "internalType":  "address",
                           "name":  "spender",
                           "type":  "address"
                       }
                   ],
        "name":  "allowance",
        "outputs":  [
                        {
                            "internalType":  "uint256",
                            "name":  "",
                            "type":  "uint256"
                        }
                    ],
        "stateMutability":  "view",
        "type":  "function"
    },
    {
        "inputs":  [
                       {
                           "internalType":  "address",
                           "name":  "spender",
                           "type":  "address"
                       },
                       {
                           "internalType":  "uint256",
                           "name":  "value",
                           "type":  "uint256"
                       }
                   ],
        "name":  "approve",
        "outputs":  [
                        {
                            "internalType":  "bool",
                            "name":  "",
                            "type":  "bool"
                        }
                    ],
        "stateMutability":  "nonpayable",
        "type":  "function"
    },
    {
        "inputs":  [
                       {
                           "internalType":  "address",
                           "name":  "account",
                           "type":  "address"
                       }
                   ],
        "name":  "balanceOf",
        "outputs":  [
                        {
                            "internalType":  "uint256",
                            "name":  "",
                            "type":  "uint256"
                        }
                    ],
        "stateMutability":  "view",
        "type":  "function"
    },
    {
        "inputs":  [
                       {
                           "internalType":  "uint256",
                           "name":  "value",
                           "type":  "uint256"
                       }
                   ],
        "name":  "burn",
        "outputs":  [

                    ],
        "stateMutability":  "nonpayable",
        "type":  "function"
    },
    {
        "inputs":  [
                       {
                           "internalType":  "address",
                           "name":  "account",
                           "type":  "address"
                       },
                       {
                           "internalType":  "uint256",
                           "name":  "value",
                           "type":  "uint256"
                       }
                   ],
        "name":  "burnFrom",
        "outputs":  [

                    ],
        "stateMutability":  "nonpayable",
        "type":  "function"
    },
    {
        "inputs":  [

                   ],
        "name":  "cap",
        "outputs":  [
                        {
                            "internalType":  "uint256",
                            "name":  "",
                            "type":  "uint256"
                        }
                    ],
        "stateMutability":  "view",
        "type":  "function"
    },
    {
        "inputs":  [

                   ],
        "name":  "decimals",
        "outputs":  [
                        {
                            "internalType":  "uint8",
                            "name":  "",
                            "type":  "uint8"
                        }
                    ],
        "stateMutability":  "view",
        "type":  "function"
    },
    {
        "inputs":  [
                       {
                           "internalType":  "bytes32",
                           "name":  "role",
                           "type":  "bytes32"
                       }
                   ],
        "name":  "getRoleAdmin",
        "outputs":  [
                        {
                            "internalType":  "bytes32",
                            "name":  "",
                            "type":  "bytes32"
                        }
                    ],
        "stateMutability":  "view",
        "type":  "function"
    },
    {
        "inputs":  [
                       {
                           "internalType":  "bytes32",
                           "name":  "role",
                           "type":  "bytes32"
                       },
                       {
                           "internalType":  "address",
                           "name":  "account",
                           "type":  "address"
                       }
                   ],
        "name":  "grantRole",
        "outputs":  [

                    ],
        "stateMutability":  "nonpayable",
        "type":  "function"
    },
    {
        "inputs":  [
                       {
                           "internalType":  "bytes32",
                           "name":  "role",
                           "type":  "bytes32"
                       },
                       {
                           "internalType":  "address",
                           "name":  "account",
                           "type":  "address"
                       }
                   ],
        "name":  "hasRole",
        "outputs":  [
                        {
                            "internalType":  "bool",
                            "name":  "",
                            "type":  "bool"
                        }
                    ],
        "stateMutability":  "view",
        "type":  "function"
    },
    {
        "inputs":  [
                       {
                           "internalType":  "address",
                           "name":  "to",
                           "type":  "address"
                       },
                       {
                           "internalType":  "uint256",
                           "name":  "amount",
                           "type":  "uint256"
                       }
                   ],
        "name":  "mint",
        "outputs":  [

                    ],
        "stateMutability":  "nonpayable",
        "type":  "function"
    },
    {
        "inputs":  [

                   ],
        "name":  "name",
        "outputs":  [
                        {
                            "internalType":  "string",
                            "name":  "",
                            "type":  "string"
                        }
                    ],
        "stateMutability":  "view",
        "type":  "function"
    },
    {
        "inputs":  [
                       {
                           "internalType":  "bytes32",
                           "name":  "role",
                           "type":  "bytes32"
                       },
                       {
                           "internalType":  "address",
                           "name":  "callerConfirmation",
                           "type":  "address"
                       }
                   ],
        "name":  "renounceRole",
        "outputs":  [

                    ],
        "stateMutability":  "nonpayable",
        "type":  "function"
    },
    {
        "inputs":  [
                       {
                           "internalType":  "bytes32",
                           "name":  "role",
                           "type":  "bytes32"
                       },
                       {
                           "internalType":  "address",
                           "name":  "account",
                           "type":  "address"
                       }
                   ],
        "name":  "revokeRole",
        "outputs":  [

                    ],
        "stateMutability":  "nonpayable",
        "type":  "function"
    },
    {
        "inputs":  [
                       {
                           "internalType":  "bytes4",
                           "name":  "interfaceId",
                           "type":  "bytes4"
                       }
                   ],
        "name":  "supportsInterface",
        "outputs":  [
                        {
                            "internalType":  "bool",
                            "name":  "",
                            "type":  "bool"
                        }
                    ],
        "stateMutability":  "view",
        "type":  "function"
    },
    {
        "inputs":  [

                   ],
        "name":  "symbol",
        "outputs":  [
                        {
                            "internalType":  "string",
                            "name":  "",
                            "type":  "string"
                        }
                    ],
        "stateMutability":  "view",
        "type":  "function"
    },
    {
        "inputs":  [

                   ],
        "name":  "totalSupply",
        "outputs":  [
                        {
                            "internalType":  "uint256",
                            "name":  "",
                            "type":  "uint256"
                        }
                    ],
        "stateMutability":  "view",
        "type":  "function"
    },
    {
        "inputs":  [
                       {
                           "internalType":  "address",
                           "name":  "to",
                           "type":  "address"
                       },
                       {
                           "internalType":  "uint256",
                           "name":  "value",
                           "type":  "uint256"
                       }
                   ],
        "name":  "transfer",
        "outputs":  [
                        {
                            "internalType":  "bool",
                            "name":  "",
                            "type":  "bool"
                        }
                    ],
        "stateMutability":  "nonpayable",
        "type":  "function"
    },
    {
        "inputs":  [
                       {
                           "internalType":  "address",
                           "name":  "from",
                           "type":  "address"
                       },
                       {
                           "internalType":  "address",
                           "name":  "to",
                           "type":  "address"
                       },
                       {
                           "internalType":  "uint256",
                           "name":  "value",
                           "type":  "uint256"
                       }
                   ],
        "name":  "transferFrom",
        "outputs":  [
                        {
                            "internalType":  "bool",
                            "name":  "",
                            "type":  "bool"
                        }
                    ],
        "stateMutability":  "nonpayable",
        "type":  "function"
    }
]
```

### TokenExchange ABI

```json
[
    {
        "inputs":  [
                       {
                           "internalType":  "address",
                           "name":  "token_",
                           "type":  "address"
                       },
                       {
                           "internalType":  "uint256",
                           "name":  "tokensPerEth_",
                           "type":  "uint256"
                       },
                       {
                           "internalType":  "address",
                           "name":  "treasury_",
                           "type":  "address"
                       }
                   ],
        "stateMutability":  "nonpayable",
        "type":  "constructor"
    },
    {
        "inputs":  [
                       {
                           "internalType":  "address",
                           "name":  "owner",
                           "type":  "address"
                       }
                   ],
        "name":  "OwnableInvalidOwner",
        "type":  "error"
    },
    {
        "inputs":  [
                       {
                           "internalType":  "address",
                           "name":  "account",
                           "type":  "address"
                       }
                   ],
        "name":  "OwnableUnauthorizedAccount",
        "type":  "error"
    },
    {
        "inputs":  [

                   ],
        "name":  "ReentrancyGuardReentrantCall",
        "type":  "error"
    },
    {
        "anonymous":  false,
        "inputs":  [
                       {
                           "indexed":  true,
                           "internalType":  "address",
                           "name":  "previousOwner",
                           "type":  "address"
                       },
                       {
                           "indexed":  true,
                           "internalType":  "address",
                           "name":  "newOwner",
                           "type":  "address"
                       }
                   ],
        "name":  "OwnershipTransferred",
        "type":  "event"
    },
    {
        "anonymous":  false,
        "inputs":  [
                       {
                           "indexed":  false,
                           "internalType":  "uint256",
                           "name":  "oldRate",
                           "type":  "uint256"
                       },
                       {
                           "indexed":  false,
                           "internalType":  "uint256",
                           "name":  "newRate",
                           "type":  "uint256"
                       }
                   ],
        "name":  "RateUpdated",
        "type":  "event"
    },
    {
        "anonymous":  false,
        "inputs":  [
                       {
                           "indexed":  true,
                           "internalType":  "address",
                           "name":  "buyer",
                           "type":  "address"
                       },
                       {
                           "indexed":  false,
                           "internalType":  "uint256",
                           "name":  "ethIn",
                           "type":  "uint256"
                       },
                       {
                           "indexed":  false,
                           "internalType":  "uint256",
                           "name":  "tokensOut",
                           "type":  "uint256"
                       }
                   ],
        "name":  "TokensPurchased",
        "type":  "event"
    },
    {
        "anonymous":  false,
        "inputs":  [
                       {
                           "indexed":  true,
                           "internalType":  "address",
                           "name":  "oldTreasury",
                           "type":  "address"
                       },
                       {
                           "indexed":  true,
                           "internalType":  "address",
                           "name":  "newTreasury",
                           "type":  "address"
                       }
                   ],
        "name":  "TreasuryUpdated",
        "type":  "event"
    },
    {
        "inputs":  [

                   ],
        "name":  "buy",
        "outputs":  [

                    ],
        "stateMutability":  "payable",
        "type":  "function"
    },
    {
        "inputs":  [

                   ],
        "name":  "owner",
        "outputs":  [
                        {
                            "internalType":  "address",
                            "name":  "",
                            "type":  "address"
                        }
                    ],
        "stateMutability":  "view",
        "type":  "function"
    },
    {
        "inputs":  [

                   ],
        "name":  "renounceOwnership",
        "outputs":  [

                    ],
        "stateMutability":  "nonpayable",
        "type":  "function"
    },
    {
        "inputs":  [
                       {
                           "internalType":  "uint256",
                           "name":  "newRate",
                           "type":  "uint256"
                       }
                   ],
        "name":  "setRate",
        "outputs":  [

                    ],
        "stateMutability":  "nonpayable",
        "type":  "function"
    },
    {
        "inputs":  [
                       {
                           "internalType":  "address",
                           "name":  "newTreasury",
                           "type":  "address"
                       }
                   ],
        "name":  "setTreasury",
        "outputs":  [

                    ],
        "stateMutability":  "nonpayable",
        "type":  "function"
    },
    {
        "inputs":  [

                   ],
        "name":  "token",
        "outputs":  [
                        {
                            "internalType":  "contract IPlatformToken",
                            "name":  "",
                            "type":  "address"
                        }
                    ],
        "stateMutability":  "view",
        "type":  "function"
    },
    {
        "inputs":  [

                   ],
        "name":  "tokensPerEth",
        "outputs":  [
                        {
                            "internalType":  "uint256",
                            "name":  "",
                            "type":  "uint256"
                        }
                    ],
        "stateMutability":  "view",
        "type":  "function"
    },
    {
        "inputs":  [
                       {
                           "internalType":  "address",
                           "name":  "newOwner",
                           "type":  "address"
                       }
                   ],
        "name":  "transferOwnership",
        "outputs":  [

                    ],
        "stateMutability":  "nonpayable",
        "type":  "function"
    },
    {
        "inputs":  [

                   ],
        "name":  "treasury",
        "outputs":  [
                        {
                            "internalType":  "address",
                            "name":  "",
                            "type":  "address"
                        }
                    ],
        "stateMutability":  "view",
        "type":  "function"
    },
    {
        "stateMutability":  "payable",
        "type":  "receive"
    }
]
```

### EscrowVault ABI

```json
[
    {
        "inputs":  [
                       {
                           "internalType":  "contract IERC20",
                           "name":  "_token",
                           "type":  "address"
                       }
                   ],
        "stateMutability":  "nonpayable",
        "type":  "constructor"
    },
    {
        "inputs":  [
                       {
                           "internalType":  "address",
                           "name":  "owner",
                           "type":  "address"
                       }
                   ],
        "name":  "OwnableInvalidOwner",
        "type":  "error"
    },
    {
        "inputs":  [
                       {
                           "internalType":  "address",
                           "name":  "account",
                           "type":  "address"
                       }
                   ],
        "name":  "OwnableUnauthorizedAccount",
        "type":  "error"
    },
    {
        "inputs":  [
                       {
                           "internalType":  "address",
                           "name":  "token",
                           "type":  "address"
                       }
                   ],
        "name":  "SafeERC20FailedOperation",
        "type":  "error"
    },
    {
        "anonymous":  false,
        "inputs":  [
                       {
                           "indexed":  true,
                           "internalType":  "uint256",
                           "name":  "taskId",
                           "type":  "uint256"
                       },
                       {
                           "indexed":  true,
                           "internalType":  "address",
                           "name":  "from",
                           "type":  "address"
                       },
                       {
                           "indexed":  false,
                           "internalType":  "uint256",
                           "name":  "amount",
                           "type":  "uint256"
                       }
                   ],
        "name":  "Deposited",
        "type":  "event"
    },
    {
        "anonymous":  false,
        "inputs":  [
                       {
                           "indexed":  true,
                           "internalType":  "address",
                           "name":  "previousOwner",
                           "type":  "address"
                       },
                       {
                           "indexed":  true,
                           "internalType":  "address",
                           "name":  "newOwner",
                           "type":  "address"
                       }
                   ],
        "name":  "OwnershipTransferred",
        "type":  "event"
    },
    {
        "anonymous":  false,
        "inputs":  [
                       {
                           "indexed":  true,
                           "internalType":  "uint256",
                           "name":  "taskId",
                           "type":  "uint256"
                       },
                       {
                           "indexed":  true,
                           "internalType":  "address",
                           "name":  "to",
                           "type":  "address"
                       },
                       {
                           "indexed":  false,
                           "internalType":  "uint256",
                           "name":  "amount",
                           "type":  "uint256"
                       }
                   ],
        "name":  "Refunded",
        "type":  "event"
    },
    {
        "anonymous":  false,
        "inputs":  [
                       {
                           "indexed":  true,
                           "internalType":  "uint256",
                           "name":  "taskId",
                           "type":  "uint256"
                       },
                       {
                           "indexed":  true,
                           "internalType":  "address",
                           "name":  "to",
                           "type":  "address"
                       },
                       {
                           "indexed":  false,
                           "internalType":  "uint256",
                           "name":  "amount",
                           "type":  "uint256"
                       }
                   ],
        "name":  "Released",
        "type":  "event"
    },
    {
        "anonymous":  false,
        "inputs":  [
                       {
                           "indexed":  true,
                           "internalType":  "address",
                           "name":  "taskManager",
                           "type":  "address"
                       }
                   ],
        "name":  "TaskManagerSet",
        "type":  "event"
    },
    {
        "inputs":  [
                       {
                           "internalType":  "uint256",
                           "name":  "taskId",
                           "type":  "uint256"
                       },
                       {
                           "internalType":  "address",
                           "name":  "from",
                           "type":  "address"
                       },
                       {
                           "internalType":  "uint256",
                           "name":  "amount",
                           "type":  "uint256"
                       }
                   ],
        "name":  "deposit",
        "outputs":  [

                    ],
        "stateMutability":  "nonpayable",
        "type":  "function"
    },
    {
        "inputs":  [
                       {
                           "internalType":  "uint256",
                           "name":  "",
                           "type":  "uint256"
                       }
                   ],
        "name":  "escrowOf",
        "outputs":  [
                        {
                            "internalType":  "uint256",
                            "name":  "",
                            "type":  "uint256"
                        }
                    ],
        "stateMutability":  "view",
        "type":  "function"
    },
    {
        "inputs":  [
                       {
                           "internalType":  "uint256",
                           "name":  "taskId",
                           "type":  "uint256"
                       }
                   ],
        "name":  "getEscrowBalance",
        "outputs":  [
                        {
                            "internalType":  "uint256",
                            "name":  "",
                            "type":  "uint256"
                        }
                    ],
        "stateMutability":  "view",
        "type":  "function"
    },
    {
        "inputs":  [

                   ],
        "name":  "owner",
        "outputs":  [
                        {
                            "internalType":  "address",
                            "name":  "",
                            "type":  "address"
                        }
                    ],
        "stateMutability":  "view",
        "type":  "function"
    },
    {
        "inputs":  [
                       {
                           "internalType":  "uint256",
                           "name":  "taskId",
                           "type":  "uint256"
                       },
                       {
                           "internalType":  "address",
                           "name":  "to",
                           "type":  "address"
                       },
                       {
                           "internalType":  "uint256",
                           "name":  "amount",
                           "type":  "uint256"
                       }
                   ],
        "name":  "refund",
        "outputs":  [

                    ],
        "stateMutability":  "nonpayable",
        "type":  "function"
    },
    {
        "inputs":  [
                       {
                           "internalType":  "uint256",
                           "name":  "taskId",
                           "type":  "uint256"
                       },
                       {
                           "internalType":  "address",
                           "name":  "to",
                           "type":  "address"
                       },
                       {
                           "internalType":  "uint256",
                           "name":  "amount",
                           "type":  "uint256"
                       }
                   ],
        "name":  "release",
        "outputs":  [

                    ],
        "stateMutability":  "nonpayable",
        "type":  "function"
    },
    {
        "inputs":  [

                   ],
        "name":  "renounceOwnership",
        "outputs":  [

                    ],
        "stateMutability":  "nonpayable",
        "type":  "function"
    },
    {
        "inputs":  [
                       {
                           "internalType":  "address",
                           "name":  "_taskManager",
                           "type":  "address"
                       }
                   ],
        "name":  "setTaskManager",
        "outputs":  [

                    ],
        "stateMutability":  "nonpayable",
        "type":  "function"
    },
    {
        "inputs":  [

                   ],
        "name":  "taskManager",
        "outputs":  [
                        {
                            "internalType":  "address",
                            "name":  "",
                            "type":  "address"
                        }
                    ],
        "stateMutability":  "view",
        "type":  "function"
    },
    {
        "inputs":  [

                   ],
        "name":  "token",
        "outputs":  [
                        {
                            "internalType":  "contract IERC20",
                            "name":  "",
                            "type":  "address"
                        }
                    ],
        "stateMutability":  "view",
        "type":  "function"
    },
    {
        "inputs":  [
                       {
                           "internalType":  "address",
                           "name":  "newOwner",
                           "type":  "address"
                       }
                   ],
        "name":  "transferOwnership",
        "outputs":  [

                    ],
        "stateMutability":  "nonpayable",
        "type":  "function"
    }
]
```

### TaskManager ABI

```json
[
    {
        "inputs":  [
                       {
                           "internalType":  "address",
                           "name":  "vaultAddr",
                           "type":  "address"
                       }
                   ],
        "stateMutability":  "nonpayable",
        "type":  "constructor"
    },
    {
        "inputs":  [
                       {
                           "internalType":  "address",
                           "name":  "owner",
                           "type":  "address"
                       }
                   ],
        "name":  "OwnableInvalidOwner",
        "type":  "error"
    },
    {
        "inputs":  [
                       {
                           "internalType":  "address",
                           "name":  "account",
                           "type":  "address"
                       }
                   ],
        "name":  "OwnableUnauthorizedAccount",
        "type":  "error"
    },
    {
        "inputs":  [

                   ],
        "name":  "ReentrancyGuardReentrantCall",
        "type":  "error"
    },
    {
        "anonymous":  false,
        "inputs":  [
                       {
                           "indexed":  true,
                           "internalType":  "address",
                           "name":  "arbitration",
                           "type":  "address"
                       }
                   ],
        "name":  "ArbitrationSet",
        "type":  "event"
    },
    {
        "anonymous":  false,
        "inputs":  [
                       {
                           "indexed":  true,
                           "internalType":  "address",
                           "name":  "previousOwner",
                           "type":  "address"
                       },
                       {
                           "indexed":  true,
                           "internalType":  "address",
                           "name":  "newOwner",
                           "type":  "address"
                       }
                   ],
        "name":  "OwnershipTransferred",
        "type":  "event"
    },
    {
        "anonymous":  false,
        "inputs":  [
                       {
                           "indexed":  true,
                           "internalType":  "uint256",
                           "name":  "taskId",
                           "type":  "uint256"
                       },
                       {
                           "indexed":  true,
                           "internalType":  "address",
                           "name":  "agent",
                           "type":  "address"
                       }
                   ],
        "name":  "TaskAccepted",
        "type":  "event"
    },
    {
        "anonymous":  false,
        "inputs":  [
                       {
                           "indexed":  true,
                           "internalType":  "uint256",
                           "name":  "taskId",
                           "type":  "uint256"
                       }
                   ],
        "name":  "TaskApproved",
        "type":  "event"
    },
    {
        "anonymous":  false,
        "inputs":  [
                       {
                           "indexed":  true,
                           "internalType":  "uint256",
                           "name":  "taskId",
                           "type":  "uint256"
                       },
                       {
                           "indexed":  false,
                           "internalType":  "uint256",
                           "name":  "buyerAmount",
                           "type":  "uint256"
                       },
                       {
                           "indexed":  false,
                           "internalType":  "uint256",
                           "name":  "agentAmount",
                           "type":  "uint256"
                       }
                   ],
        "name":  "TaskArbitrated",
        "type":  "event"
    },
    {
        "anonymous":  false,
        "inputs":  [
                       {
                           "indexed":  true,
                           "internalType":  "uint256",
                           "name":  "taskId",
                           "type":  "uint256"
                       }
                   ],
        "name":  "TaskCancelled",
        "type":  "event"
    },
    {
        "anonymous":  false,
        "inputs":  [
                       {
                           "indexed":  true,
                           "internalType":  "uint256",
                           "name":  "taskId",
                           "type":  "uint256"
                       },
                       {
                           "indexed":  true,
                           "internalType":  "address",
                           "name":  "buyer",
                           "type":  "address"
                       },
                       {
                           "indexed":  false,
                           "internalType":  "uint256",
                           "name":  "amount",
                           "type":  "uint256"
                       },
                       {
                           "indexed":  false,
                           "internalType":  "bytes32",
                           "name":  "metaHash",
                           "type":  "bytes32"
                       }
                   ],
        "name":  "TaskCreated",
        "type":  "event"
    },
    {
        "anonymous":  false,
        "inputs":  [
                       {
                           "indexed":  true,
                           "internalType":  "uint256",
                           "name":  "taskId",
                           "type":  "uint256"
                       },
                       {
                           "indexed":  true,
                           "internalType":  "address",
                           "name":  "by",
                           "type":  "address"
                       }
                   ],
        "name":  "TaskDisputed",
        "type":  "event"
    },
    {
        "anonymous":  false,
        "inputs":  [
                       {
                           "indexed":  true,
                           "internalType":  "uint256",
                           "name":  "taskId",
                           "type":  "uint256"
                       },
                       {
                           "indexed":  false,
                           "internalType":  "bytes32",
                           "name":  "deliveryHash",
                           "type":  "bytes32"
                       }
                   ],
        "name":  "TaskSubmitted",
        "type":  "event"
    },
    {
        "anonymous":  false,
        "inputs":  [
                       {
                           "indexed":  true,
                           "internalType":  "address",
                           "name":  "vault",
                           "type":  "address"
                       }
                   ],
        "name":  "VaultSet",
        "type":  "event"
    },
    {
        "inputs":  [
                       {
                           "internalType":  "uint256",
                           "name":  "taskId",
                           "type":  "uint256"
                       }
                   ],
        "name":  "acceptTask",
        "outputs":  [

                    ],
        "stateMutability":  "nonpayable",
        "type":  "function"
    },
    {
        "inputs":  [
                       {
                           "internalType":  "uint256",
                           "name":  "taskId",
                           "type":  "uint256"
                       }
                   ],
        "name":  "approve",
        "outputs":  [

                    ],
        "stateMutability":  "nonpayable",
        "type":  "function"
    },
    {
        "inputs":  [

                   ],
        "name":  "arb",
        "outputs":  [
                        {
                            "internalType":  "contract IArbitration",
                            "name":  "",
                            "type":  "address"
                        }
                    ],
        "stateMutability":  "view",
        "type":  "function"
    },
    {
        "inputs":  [

                   ],
        "name":  "arbitration",
        "outputs":  [
                        {
                            "internalType":  "address",
                            "name":  "",
                            "type":  "address"
                        }
                    ],
        "stateMutability":  "view",
        "type":  "function"
    },
    {
        "inputs":  [
                       {
                           "internalType":  "uint256",
                           "name":  "taskId",
                           "type":  "uint256"
                       }
                   ],
        "name":  "cancelTask",
        "outputs":  [

                    ],
        "stateMutability":  "nonpayable",
        "type":  "function"
    },
    {
        "inputs":  [
                       {
                           "internalType":  "uint256",
                           "name":  "amount",
                           "type":  "uint256"
                       },
                       {
                           "internalType":  "bytes32",
                           "name":  "metaHash",
                           "type":  "bytes32"
                       }
                   ],
        "name":  "createTask",
        "outputs":  [
                        {
                            "internalType":  "uint256",
                            "name":  "taskId",
                            "type":  "uint256"
                        }
                    ],
        "stateMutability":  "nonpayable",
        "type":  "function"
    },
    {
        "inputs":  [
                       {
                           "internalType":  "uint256",
                           "name":  "taskId",
                           "type":  "uint256"
                       }
                   ],
        "name":  "dispute",
        "outputs":  [

                    ],
        "stateMutability":  "nonpayable",
        "type":  "function"
    },
    {
        "inputs":  [
                       {
                           "internalType":  "uint256",
                           "name":  "taskId",
                           "type":  "uint256"
                       }
                   ],
        "name":  "getTask",
        "outputs":  [
                        {
                            "components":  [
                                               {
                                                   "internalType":  "address",
                                                   "name":  "buyer",
                                                   "type":  "address"
                                               },
                                               {
                                                   "internalType":  "address",
                                                   "name":  "agent",
                                                   "type":  "address"
                                               },
                                               {
                                                   "internalType":  "uint256",
                                                   "name":  "amount",
                                                   "type":  "uint256"
                                               },
                                               {
                                                   "internalType":  "enum TaskManager.Status",
                                                   "name":  "status",
                                                   "type":  "uint8"
                                               },
                                               {
                                                   "internalType":  "uint64",
                                                   "name":  "createdAt",
                                                   "type":  "uint64"
                                               },
                                               {
                                                   "internalType":  "uint64",
                                                   "name":  "acceptedAt",
                                                   "type":  "uint64"
                                               },
                                               {
                                                   "internalType":  "uint64",
                                                   "name":  "submittedAt",
                                                   "type":  "uint64"
                                               },
                                               {
                                                   "internalType":  "uint64",
                                                   "name":  "disputedAt",
                                                   "type":  "uint64"
                                               },
                                               {
                                                   "internalType":  "bytes32",
                                                   "name":  "metaHash",
                                                   "type":  "bytes32"
                                               },
                                               {
                                                   "internalType":  "bytes32",
                                                   "name":  "deliveryHash",
                                                   "type":  "bytes32"
                                               }
                                           ],
                            "internalType":  "struct TaskManager.Task",
                            "name":  "",
                            "type":  "tuple"
                        }
                    ],
        "stateMutability":  "view",
        "type":  "function"
    },
    {
        "inputs":  [

                   ],
        "name":  "nextTaskId",
        "outputs":  [
                        {
                            "internalType":  "uint256",
                            "name":  "",
                            "type":  "uint256"
                        }
                    ],
        "stateMutability":  "view",
        "type":  "function"
    },
    {
        "inputs":  [
                       {
                           "internalType":  "uint256",
                           "name":  "taskId",
                           "type":  "uint256"
                       },
                       {
                           "internalType":  "uint256",
                           "name":  "buyerAmount",
                           "type":  "uint256"
                       },
                       {
                           "internalType":  "uint256",
                           "name":  "agentAmount",
                           "type":  "uint256"
                       }
                   ],
        "name":  "onArbitrated",
        "outputs":  [

                    ],
        "stateMutability":  "nonpayable",
        "type":  "function"
    },
    {
        "inputs":  [

                   ],
        "name":  "owner",
        "outputs":  [
                        {
                            "internalType":  "address",
                            "name":  "",
                            "type":  "address"
                        }
                    ],
        "stateMutability":  "view",
        "type":  "function"
    },
    {
        "inputs":  [

                   ],
        "name":  "renounceOwnership",
        "outputs":  [

                    ],
        "stateMutability":  "nonpayable",
        "type":  "function"
    },
    {
        "inputs":  [
                       {
                           "internalType":  "address",
                           "name":  "arbitrationAddr",
                           "type":  "address"
                       }
                   ],
        "name":  "setArbitration",
        "outputs":  [

                    ],
        "stateMutability":  "nonpayable",
        "type":  "function"
    },
    {
        "inputs":  [
                       {
                           "internalType":  "address",
                           "name":  "vaultAddr",
                           "type":  "address"
                       }
                   ],
        "name":  "setVault",
        "outputs":  [

                    ],
        "stateMutability":  "nonpayable",
        "type":  "function"
    },
    {
        "inputs":  [
                       {
                           "internalType":  "uint256",
                           "name":  "taskId",
                           "type":  "uint256"
                       }
                   ],
        "name":  "startTask",
        "outputs":  [

                    ],
        "stateMutability":  "nonpayable",
        "type":  "function"
    },
    {
        "inputs":  [
                       {
                           "internalType":  "uint256",
                           "name":  "taskId",
                           "type":  "uint256"
                       },
                       {
                           "internalType":  "bytes32",
                           "name":  "deliveryHash",
                           "type":  "bytes32"
                       }
                   ],
        "name":  "submitDelivery",
        "outputs":  [

                    ],
        "stateMutability":  "nonpayable",
        "type":  "function"
    },
    {
        "inputs":  [
                       {
                           "internalType":  "uint256",
                           "name":  "",
                           "type":  "uint256"
                       }
                   ],
        "name":  "tasks",
        "outputs":  [
                        {
                            "internalType":  "address",
                            "name":  "buyer",
                            "type":  "address"
                        },
                        {
                            "internalType":  "address",
                            "name":  "agent",
                            "type":  "address"
                        },
                        {
                            "internalType":  "uint256",
                            "name":  "amount",
                            "type":  "uint256"
                        },
                        {
                            "internalType":  "enum TaskManager.Status",
                            "name":  "status",
                            "type":  "uint8"
                        },
                        {
                            "internalType":  "uint64",
                            "name":  "createdAt",
                            "type":  "uint64"
                        },
                        {
                            "internalType":  "uint64",
                            "name":  "acceptedAt",
                            "type":  "uint64"
                        },
                        {
                            "internalType":  "uint64",
                            "name":  "submittedAt",
                            "type":  "uint64"
                        },
                        {
                            "internalType":  "uint64",
                            "name":  "disputedAt",
                            "type":  "uint64"
                        },
                        {
                            "internalType":  "bytes32",
                            "name":  "metaHash",
                            "type":  "bytes32"
                        },
                        {
                            "internalType":  "bytes32",
                            "name":  "deliveryHash",
                            "type":  "bytes32"
                        }
                    ],
        "stateMutability":  "view",
        "type":  "function"
    },
    {
        "inputs":  [
                       {
                           "internalType":  "address",
                           "name":  "newOwner",
                           "type":  "address"
                       }
                   ],
        "name":  "transferOwnership",
        "outputs":  [

                    ],
        "stateMutability":  "nonpayable",
        "type":  "function"
    },
    {
        "inputs":  [

                   ],
        "name":  "vault",
        "outputs":  [
                        {
                            "internalType":  "contract EscrowVault",
                            "name":  "",
                            "type":  "address"
                        }
                    ],
        "stateMutability":  "view",
        "type":  "function"
    }
]
```

### Arbitration ABI

```json
[
    {
        "inputs":  [
                       {
                           "internalType":  "contract IERC20",
                           "name":  "_platformToken",
                           "type":  "address"
                       },
                       {
                           "internalType":  "address",
                           "name":  "_taskManager",
                           "type":  "address"
                       }
                   ],
        "stateMutability":  "nonpayable",
        "type":  "constructor"
    },
    {
        "inputs":  [
                       {
                           "internalType":  "address",
                           "name":  "owner",
                           "type":  "address"
                       }
                   ],
        "name":  "OwnableInvalidOwner",
        "type":  "error"
    },
    {
        "inputs":  [
                       {
                           "internalType":  "address",
                           "name":  "account",
                           "type":  "address"
                       }
                   ],
        "name":  "OwnableUnauthorizedAccount",
        "type":  "error"
    },
    {
        "inputs":  [

                   ],
        "name":  "ReentrancyGuardReentrantCall",
        "type":  "error"
    },
    {
        "inputs":  [
                       {
                           "internalType":  "address",
                           "name":  "token",
                           "type":  "address"
                       }
                   ],
        "name":  "SafeERC20FailedOperation",
        "type":  "error"
    },
    {
        "anonymous":  false,
        "inputs":  [
                       {
                           "indexed":  true,
                           "internalType":  "uint256",
                           "name":  "taskId",
                           "type":  "uint256"
                       },
                       {
                           "indexed":  false,
                           "internalType":  "enum Arbitration.Decision",
                           "name":  "result",
                           "type":  "uint8"
                       },
                       {
                           "indexed":  false,
                           "internalType":  "uint32",
                           "name":  "buyerVotes",
                           "type":  "uint32"
                       },
                       {
                           "indexed":  false,
                           "internalType":  "uint32",
                           "name":  "agentVotes",
                           "type":  "uint32"
                       }
                   ],
        "name":  "CaseFinalized",
        "type":  "event"
    },
    {
        "anonymous":  false,
        "inputs":  [
                       {
                           "indexed":  true,
                           "internalType":  "uint256",
                           "name":  "taskId",
                           "type":  "uint256"
                       },
                       {
                           "indexed":  true,
                           "internalType":  "address",
                           "name":  "buyer",
                           "type":  "address"
                       },
                       {
                           "indexed":  true,
                           "internalType":  "address",
                           "name":  "agent",
                           "type":  "address"
                       },
                       {
                           "indexed":  false,
                           "internalType":  "uint256",
                           "name":  "amount",
                           "type":  "uint256"
                       },
                       {
                           "indexed":  false,
                           "internalType":  "uint64",
                           "name":  "deadline",
                           "type":  "uint64"
                       },
                       {
                           "indexed":  false,
                           "internalType":  "uint32",
                           "name":  "quorum",
                           "type":  "uint32"
                       }
                   ],
        "name":  "CaseOpened",
        "type":  "event"
    },
    {
        "anonymous":  false,
        "inputs":  [
                       {
                           "indexed":  true,
                           "internalType":  "address",
                           "name":  "previousOwner",
                           "type":  "address"
                       },
                       {
                           "indexed":  true,
                           "internalType":  "address",
                           "name":  "newOwner",
                           "type":  "address"
                       }
                   ],
        "name":  "OwnershipTransferred",
        "type":  "event"
    },
    {
        "anonymous":  false,
        "inputs":  [
                       {
                           "indexed":  false,
                           "internalType":  "uint256",
                           "name":  "minStake",
                           "type":  "uint256"
                       },
                       {
                           "indexed":  false,
                           "internalType":  "uint64",
                           "name":  "voteDuration",
                           "type":  "uint64"
                       },
                       {
                           "indexed":  false,
                           "internalType":  "uint32",
                           "name":  "defaultQuorum",
                           "type":  "uint32"
                       }
                   ],
        "name":  "ParamsSet",
        "type":  "event"
    },
    {
        "anonymous":  false,
        "inputs":  [
                       {
                           "indexed":  true,
                           "internalType":  "address",
                           "name":  "user",
                           "type":  "address"
                       },
                       {
                           "indexed":  false,
                           "internalType":  "uint256",
                           "name":  "amount",
                           "type":  "uint256"
                       }
                   ],
        "name":  "Staked",
        "type":  "event"
    },
    {
        "anonymous":  false,
        "inputs":  [
                       {
                           "indexed":  true,
                           "internalType":  "address",
                           "name":  "taskManager",
                           "type":  "address"
                       }
                   ],
        "name":  "TaskManagerSet",
        "type":  "event"
    },
    {
        "anonymous":  false,
        "inputs":  [
                       {
                           "indexed":  true,
                           "internalType":  "address",
                           "name":  "user",
                           "type":  "address"
                       },
                       {
                           "indexed":  false,
                           "internalType":  "uint256",
                           "name":  "amount",
                           "type":  "uint256"
                       }
                   ],
        "name":  "Unstaked",
        "type":  "event"
    },
    {
        "anonymous":  false,
        "inputs":  [
                       {
                           "indexed":  true,
                           "internalType":  "uint256",
                           "name":  "taskId",
                           "type":  "uint256"
                       },
                       {
                           "indexed":  true,
                           "internalType":  "address",
                           "name":  "voter",
                           "type":  "address"
                       },
                       {
                           "indexed":  false,
                           "internalType":  "enum Arbitration.Decision",
                           "name":  "decision",
                           "type":  "uint8"
                       }
                   ],
        "name":  "Voted",
        "type":  "event"
    },
    {
        "inputs":  [
                       {
                           "internalType":  "uint256",
                           "name":  "",
                           "type":  "uint256"
                       }
                   ],
        "name":  "cases",
        "outputs":  [
                        {
                            "internalType":  "bool",
                            "name":  "exists",
                            "type":  "bool"
                        },
                        {
                            "internalType":  "bool",
                            "name":  "finalized",
                            "type":  "bool"
                        },
                        {
                            "internalType":  "address",
                            "name":  "buyer",
                            "type":  "address"
                        },
                        {
                            "internalType":  "address",
                            "name":  "agent",
                            "type":  "address"
                        },
                        {
                            "internalType":  "uint256",
                            "name":  "amount",
                            "type":  "uint256"
                        },
                        {
                            "internalType":  "uint64",
                            "name":  "openedAt",
                            "type":  "uint64"
                        },
                        {
                            "internalType":  "uint64",
                            "name":  "deadline",
                            "type":  "uint64"
                        },
                        {
                            "internalType":  "uint32",
                            "name":  "quorum",
                            "type":  "uint32"
                        },
                        {
                            "internalType":  "uint32",
                            "name":  "buyerVotes",
                            "type":  "uint32"
                        },
                        {
                            "internalType":  "uint32",
                            "name":  "agentVotes",
                            "type":  "uint32"
                        },
                        {
                            "internalType":  "enum Arbitration.Decision",
                            "name":  "result",
                            "type":  "uint8"
                        }
                    ],
        "stateMutability":  "view",
        "type":  "function"
    },
    {
        "inputs":  [

                   ],
        "name":  "defaultQuorum",
        "outputs":  [
                        {
                            "internalType":  "uint32",
                            "name":  "",
                            "type":  "uint32"
                        }
                    ],
        "stateMutability":  "view",
        "type":  "function"
    },
    {
        "inputs":  [
                       {
                           "internalType":  "uint256",
                           "name":  "taskId",
                           "type":  "uint256"
                       }
                   ],
        "name":  "finalize",
        "outputs":  [

                    ],
        "stateMutability":  "nonpayable",
        "type":  "function"
    },
    {
        "inputs":  [
                       {
                           "internalType":  "uint256",
                           "name":  "taskId",
                           "type":  "uint256"
                       }
                   ],
        "name":  "getCase",
        "outputs":  [
                        {
                            "components":  [
                                               {
                                                   "internalType":  "bool",
                                                   "name":  "exists",
                                                   "type":  "bool"
                                               },
                                               {
                                                   "internalType":  "bool",
                                                   "name":  "finalized",
                                                   "type":  "bool"
                                               },
                                               {
                                                   "internalType":  "address",
                                                   "name":  "buyer",
                                                   "type":  "address"
                                               },
                                               {
                                                   "internalType":  "address",
                                                   "name":  "agent",
                                                   "type":  "address"
                                               },
                                               {
                                                   "internalType":  "uint256",
                                                   "name":  "amount",
                                                   "type":  "uint256"
                                               },
                                               {
                                                   "internalType":  "uint64",
                                                   "name":  "openedAt",
                                                   "type":  "uint64"
                                               },
                                               {
                                                   "internalType":  "uint64",
                                                   "name":  "deadline",
                                                   "type":  "uint64"
                                               },
                                               {
                                                   "internalType":  "uint32",
                                                   "name":  "quorum",
                                                   "type":  "uint32"
                                               },
                                               {
                                                   "internalType":  "uint32",
                                                   "name":  "buyerVotes",
                                                   "type":  "uint32"
                                               },
                                               {
                                                   "internalType":  "uint32",
                                                   "name":  "agentVotes",
                                                   "type":  "uint32"
                                               },
                                               {
                                                   "internalType":  "enum Arbitration.Decision",
                                                   "name":  "result",
                                                   "type":  "uint8"
                                               }
                                           ],
                            "internalType":  "struct Arbitration.Case",
                            "name":  "",
                            "type":  "tuple"
                        }
                    ],
        "stateMutability":  "view",
        "type":  "function"
    },
    {
        "inputs":  [
                       {
                           "internalType":  "uint256",
                           "name":  "",
                           "type":  "uint256"
                       },
                       {
                           "internalType":  "address",
                           "name":  "",
                           "type":  "address"
                       }
                   ],
        "name":  "hasVoted",
        "outputs":  [
                        {
                            "internalType":  "bool",
                            "name":  "",
                            "type":  "bool"
                        }
                    ],
        "stateMutability":  "view",
        "type":  "function"
    },
    {
        "inputs":  [

                   ],
        "name":  "minStake",
        "outputs":  [
                        {
                            "internalType":  "uint256",
                            "name":  "",
                            "type":  "uint256"
                        }
                    ],
        "stateMutability":  "view",
        "type":  "function"
    },
    {
        "inputs":  [
                       {
                           "internalType":  "uint256",
                           "name":  "taskId",
                           "type":  "uint256"
                       },
                       {
                           "internalType":  "address",
                           "name":  "buyer",
                           "type":  "address"
                       },
                       {
                           "internalType":  "address",
                           "name":  "agent",
                           "type":  "address"
                       },
                       {
                           "internalType":  "uint256",
                           "name":  "amount",
                           "type":  "uint256"
                       }
                   ],
        "name":  "openCase",
        "outputs":  [

                    ],
        "stateMutability":  "nonpayable",
        "type":  "function"
    },
    {
        "inputs":  [

                   ],
        "name":  "owner",
        "outputs":  [
                        {
                            "internalType":  "address",
                            "name":  "",
                            "type":  "address"
                        }
                    ],
        "stateMutability":  "view",
        "type":  "function"
    },
    {
        "inputs":  [

                   ],
        "name":  "platformToken",
        "outputs":  [
                        {
                            "internalType":  "contract IERC20",
                            "name":  "",
                            "type":  "address"
                        }
                    ],
        "stateMutability":  "view",
        "type":  "function"
    },
    {
        "inputs":  [

                   ],
        "name":  "renounceOwnership",
        "outputs":  [

                    ],
        "stateMutability":  "nonpayable",
        "type":  "function"
    },
    {
        "inputs":  [
                       {
                           "internalType":  "uint256",
                           "name":  "_minStake",
                           "type":  "uint256"
                       },
                       {
                           "internalType":  "uint64",
                           "name":  "_voteDuration",
                           "type":  "uint64"
                       },
                       {
                           "internalType":  "uint32",
                           "name":  "_defaultQuorum",
                           "type":  "uint32"
                       }
                   ],
        "name":  "setParams",
        "outputs":  [

                    ],
        "stateMutability":  "nonpayable",
        "type":  "function"
    },
    {
        "inputs":  [
                       {
                           "internalType":  "address",
                           "name":  "_taskManager",
                           "type":  "address"
                       }
                   ],
        "name":  "setTaskManager",
        "outputs":  [

                    ],
        "stateMutability":  "nonpayable",
        "type":  "function"
    },
    {
        "inputs":  [
                       {
                           "internalType":  "uint256",
                           "name":  "amount",
                           "type":  "uint256"
                       }
                   ],
        "name":  "stake",
        "outputs":  [

                    ],
        "stateMutability":  "nonpayable",
        "type":  "function"
    },
    {
        "inputs":  [
                       {
                           "internalType":  "address",
                           "name":  "",
                           "type":  "address"
                       }
                   ],
        "name":  "staked",
        "outputs":  [
                        {
                            "internalType":  "uint256",
                            "name":  "",
                            "type":  "uint256"
                        }
                    ],
        "stateMutability":  "view",
        "type":  "function"
    },
    {
        "inputs":  [

                   ],
        "name":  "taskManager",
        "outputs":  [
                        {
                            "internalType":  "contract ITaskManager",
                            "name":  "",
                            "type":  "address"
                        }
                    ],
        "stateMutability":  "view",
        "type":  "function"
    },
    {
        "inputs":  [
                       {
                           "internalType":  "address",
                           "name":  "newOwner",
                           "type":  "address"
                       }
                   ],
        "name":  "transferOwnership",
        "outputs":  [

                    ],
        "stateMutability":  "nonpayable",
        "type":  "function"
    },
    {
        "inputs":  [
                       {
                           "internalType":  "uint256",
                           "name":  "amount",
                           "type":  "uint256"
                       }
                   ],
        "name":  "unstake",
        "outputs":  [

                    ],
        "stateMutability":  "nonpayable",
        "type":  "function"
    },
    {
        "inputs":  [
                       {
                           "internalType":  "uint256",
                           "name":  "taskId",
                           "type":  "uint256"
                       },
                       {
                           "internalType":  "enum Arbitration.Decision",
                           "name":  "decision",
                           "type":  "uint8"
                       }
                   ],
        "name":  "vote",
        "outputs":  [

                    ],
        "stateMutability":  "nonpayable",
        "type":  "function"
    },
    {
        "inputs":  [

                   ],
        "name":  "voteDuration",
        "outputs":  [
                        {
                            "internalType":  "uint64",
                            "name":  "",
                            "type":  "uint64"
                        }
                    ],
        "stateMutability":  "view",
        "type":  "function"
    }
]
```
