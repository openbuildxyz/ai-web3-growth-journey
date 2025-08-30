// The address of your newly deployed DAORegistryV2 contract
export const daoRegistryAddress = '0xf95e4594f90436e26a349b7f5b31f592be790547';

export const daoRegistryAbi = [
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": true,
				"internalType": "address",
				"name": "registrar",
				"type": "address"
			},
			{
				"indexed": true,
				"internalType": "address",
				"name": "daoAddress",
				"type": "address"
			},
			{
				"indexed": false,
				"internalType": "string",
				"name": "cid",
				"type": "string"
			}
		],
		"name": "DAORegistered",
		"type": "event"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "_daoAddress",
				"type": "address"
			},
			{
				"internalType": "string",
				"name": "_cid",
				"type": "string"
			}
		],
		"name": "registerDAO",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "_user",
				"type": "address"
			}
		],
		"name": "getDAOsByUser",
		"outputs": [
			{
				"internalType": "address[]",
				"name": "addresses",
				"type": "address[]"
			},
			{
				"internalType": "string[]",
				"name": "cids",
				"type": "string[]"
			}
		],
		"stateMutability": "view",
		"type": "function"
	}
] as const;