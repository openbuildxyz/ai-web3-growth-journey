import { createContext } from 'react'

export interface IPixelContractConfig {
  address: string
  abi: Array<any>
  onLogs: (logs: any) => void
}
export const pixelContractConfig: IPixelContractConfig = {
  address: '0xe5c13bC276F492eDDdFA349EF052aDF37D5c408d',
  abi: [
    {
      inputs: [
        { internalType: 'address', name: '_vrfCoordinator', type: 'address' },
        { internalType: 'bytes32', name: '_gasLane', type: 'bytes32' },
        { internalType: 'uint256', name: '_subscriptionId', type: 'uint256' },
        { internalType: 'uint32', name: '_callbackGasLimit', type: 'uint32' },
        { internalType: 'address', name: '_priceFeed', type: 'address' }
      ],
      stateMutability: 'nonpayable',
      type: 'constructor'
    },
    {
      inputs: [
        { internalType: 'address', name: 'have', type: 'address' },
        { internalType: 'address', name: 'want', type: 'address' }
      ],
      name: 'OnlyCoordinatorCanFulfill',
      type: 'error'
    },
    {
      inputs: [
        { internalType: 'address', name: 'have', type: 'address' },
        { internalType: 'address', name: 'owner', type: 'address' },
        { internalType: 'address', name: 'coordinator', type: 'address' }
      ],
      name: 'OnlyOwnerOrCoordinator',
      type: 'error'
    },
    { inputs: [], name: 'PixelGame__NotEnoughETH', type: 'error' },
    { inputs: [], name: 'PixelGame__PixelAlreadyPurchased', type: 'error' },
    { inputs: [], name: 'PixelGame__PixelIndexOutOfBounds', type: 'error' },
    { inputs: [], name: 'ReentrancyGuardReentrantCall', type: 'error' },
    { inputs: [], name: 'ZeroAddress', type: 'error' },
    {
      anonymous: false,
      inputs: [
        {
          indexed: false,
          internalType: 'address',
          name: 'vrfCoordinator',
          type: 'address'
        }
      ],
      name: 'CoordinatorSet',
      type: 'event'
    },
    {
      anonymous: false,
      inputs: [
        {
          indexed: true,
          internalType: 'address',
          name: 'from',
          type: 'address'
        },
        { indexed: true, internalType: 'address', name: 'to', type: 'address' }
      ],
      name: 'OwnershipTransferRequested',
      type: 'event'
    },
    {
      anonymous: false,
      inputs: [
        {
          indexed: true,
          internalType: 'address',
          name: 'from',
          type: 'address'
        },
        { indexed: true, internalType: 'address', name: 'to', type: 'address' }
      ],
      name: 'OwnershipTransferred',
      type: 'event'
    },
    {
      anonymous: false,
      inputs: [
        {
          indexed: true,
          internalType: 'address',
          name: 'player',
          type: 'address'
        },
        {
          indexed: true,
          internalType: 'uint256',
          name: 'pixelIndex',
          type: 'uint256'
        },
        {
          indexed: true,
          internalType: 'uint256',
          name: 'pixelColor',
          type: 'uint256'
        }
      ],
      name: 'PixelPurchased',
      type: 'event'
    },
    {
      anonymous: false,
      inputs: [
        {
          indexed: true,
          internalType: 'uint256',
          name: 'requestId',
          type: 'uint256'
        },
        {
          indexed: false,
          internalType: 'uint256[]',
          name: 'randomWords',
          type: 'uint256[]'
        },
        {
          indexed: true,
          internalType: 'uint256',
          name: 'winnerIndex',
          type: 'uint256'
        }
      ],
      name: 'RequestFulfilled',
      type: 'event'
    },
    {
      anonymous: false,
      inputs: [
        {
          indexed: true,
          internalType: 'uint256',
          name: 'requestId',
          type: 'uint256'
        }
      ],
      name: 'RequestedRaffleWinner',
      type: 'event'
    },
    {
      inputs: [],
      name: 'acceptOwnership',
      outputs: [],
      stateMutability: 'nonpayable',
      type: 'function'
    },
    {
      inputs: [],
      name: 'getPixelArray',
      outputs: [{ internalType: 'uint256[]', name: '', type: 'uint256[]' }],
      stateMutability: 'view',
      type: 'function'
    },
    {
      inputs: [],
      name: 'owner',
      outputs: [{ internalType: 'address', name: '', type: 'address' }],
      stateMutability: 'view',
      type: 'function'
    },
    {
      inputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
      name: 'pixelArray',
      outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
      stateMutability: 'view',
      type: 'function'
    },
    {
      inputs: [{ internalType: 'uint256', name: 'index', type: 'uint256' }],
      name: 'pixelMapping',
      outputs: [
        { internalType: 'address', name: 'player', type: 'address' },
        { internalType: 'uint256', name: 'pixelIndex', type: 'uint256' },
        { internalType: 'uint256', name: 'pixelColor', type: 'uint256' },
        { internalType: 'bool', name: 'isPurchased', type: 'bool' }
      ],
      stateMutability: 'view',
      type: 'function'
    },
    {
      inputs: [],
      name: 'prevWinnerIndex',
      outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
      stateMutability: 'view',
      type: 'function'
    },
    {
      inputs: [
        { internalType: 'uint256', name: 'pixelIndex', type: 'uint256' },
        { internalType: 'uint256', name: 'pixelColor', type: 'uint256' }
      ],
      name: 'purchasePixel',
      outputs: [],
      stateMutability: 'payable',
      type: 'function'
    },
    {
      inputs: [
        { internalType: 'uint256', name: 'requestId', type: 'uint256' },
        { internalType: 'uint256[]', name: 'randomWords', type: 'uint256[]' }
      ],
      name: 'rawFulfillRandomWords',
      outputs: [],
      stateMutability: 'nonpayable',
      type: 'function'
    },
    {
      inputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
      name: 's_requests',
      outputs: [
        { internalType: 'bool', name: 'fulfilled', type: 'bool' },
        { internalType: 'bool', name: 'exists', type: 'bool' }
      ],
      stateMutability: 'view',
      type: 'function'
    },
    {
      inputs: [],
      name: 's_vrfCoordinator',
      outputs: [
        {
          internalType: 'contract IVRFCoordinatorV2Plus',
          name: '',
          type: 'address'
        }
      ],
      stateMutability: 'view',
      type: 'function'
    },
    {
      inputs: [
        { internalType: 'address', name: '_vrfCoordinator', type: 'address' }
      ],
      name: 'setCoordinator',
      outputs: [],
      stateMutability: 'nonpayable',
      type: 'function'
    },
    {
      inputs: [{ internalType: 'address', name: 'to', type: 'address' }],
      name: 'transferOwnership',
      outputs: [],
      stateMutability: 'nonpayable',
      type: 'function'
    }
  ],
  onLogs(logs) {
    console.log('New logs!', logs)
  }
}

export const ContractContext = createContext<IPixelContractConfig>({
  address: '',
  abi: [],
  onLogs: () => {}
})

export const contractConfig = {
  address: pixelContractConfig.address as `0x${string}`,
  abi: pixelContractConfig.abi
} as const
