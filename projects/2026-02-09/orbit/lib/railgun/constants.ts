/**
 * RAILGUN network constants.
 * @railgun-community/shared-models exports NetworkName, not NETWORK_ID.
 */

import { NetworkName } from '@railgun-community/shared-models';

export const SEPOLIA_NETWORK_NAME = NetworkName.EthereumSepolia;

/** Official RAILGUN proxy contract on Sepolia (used for shield/unshield). */
export const RAILGUN_PROXY_ADDRESS = '0xeCFCf3b4eC647c4Ca6D49108b311b7a7C9543fea' as const;
