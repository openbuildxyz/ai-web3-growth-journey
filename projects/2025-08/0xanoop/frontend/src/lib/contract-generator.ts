import { Node, Edge } from 'reactflow';

const generateTokenContract = (node: Node): string => {
  const name = node.data.name || 'MyToken';
  const symbol = node.data.symbol || 'TKN';
  const supply = node.data.supply || 1000000;

  return `// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title ${name}
 * @dev A simple ERC20-like token for governance.
 */
contract ${name.replace(/\s+/g, '')} {
    string public name = "${name}";
    string public symbol = "${symbol}";
    uint8 public decimals = 18;
    uint256 public totalSupply;
    mapping(address => uint256) public balanceOf;

    constructor() {
        totalSupply = ${supply} * 10**decimals;
        balanceOf[msg.sender] = totalSupply;
    }
}
`;
};

const generateTimelockContract = (node: Node): string => {
  const delay = node.data.delay || 2;
  return `// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title Timelock
 * @dev Delays execution of transactions. The Governor is the only one who can propose transactions.
 * This is a simplified version for demonstration. A production version would use OpenZeppelin's TimelockController.
 */
contract Timelock {
    uint public delay = ${delay} days;
    address public governor;

    constructor(address _governor) {
        governor = _governor;
    }

    // Note: This is a simplified placeholder for demonstration.
    // A full implementation would include proposal queueing, execution, and cancellation logic.
}
`;
};

const generateVotingContract = (node: Node, tokenContractName: string, quorum: number, useTimelock: boolean): string => {
  const votingPeriod = node.data.period || 7;
  const timelockImport = useTimelock ? 'import "./Timelock.sol";' : '';
  const timelockVariable = useTimelock ? 'Timelock public timelock;' : '';
  const timelockParam = useTimelock ? ', address _timelockAddress' : '';
  const timelockAssignment = useTimelock ? '        timelock = Timelock(_timelockAddress);' : '';

  return `// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./${tokenContractName}.sol";
${timelockImport}

/**
 * @title Governor
 * @dev A simple governance contract.
 */
contract Governor {
    ${tokenContractName} public token;
    ${timelockVariable}
    uint256 public quorumPercentage = ${quorum};
    uint256 public votingPeriodDays = ${votingPeriod};

    constructor(address _tokenAddress${timelockParam}) {
        token = ${tokenContractName}(_tokenAddress);
${timelockAssignment}
    }

    // Note: This is a simplified placeholder for demonstration.
    // A full implementation would include proposal creation, voting logic, and execution.
}
`;
};

const generateTreasuryContract = (owner: string): string => {
  return `// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title Treasury
 * @dev Manages the DAO's funds. Can only be controlled by its owner (the ${owner} contract).
 */
contract Treasury {
    address public owner;

    constructor(address _owner) {
        owner = _owner;
    }

    receive() external payable {}

    function withdraw(uint amount, address payable to) external {
        require(msg.sender == owner, "Only the owner can withdraw");
        to.transfer(amount);
    }
}
`;
};

const generateAiContract = (node: Node): string => {
  const label = (node.data.label || 'CustomModule').replace(/\s+/g, '');
  const description = node.data.description || 'No description provided.';

  return `// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title ${label} (AI-Generated Custom Module)
 * @dev This is a placeholder contract for custom logic requested by the user.
 * The functionality described below needs to be implemented by a developer.
 */
contract ${label} {
    address public owner; // Assuming it's owned by Governor or Timelock

    constructor(address _owner) {
        owner = _owner;
    }

    /*
     * USER-DEFINED LOGIC:
     * ${description.split('\n').join('\n     * ')}
     */

    // TODO: Implement the custom logic described above.
    // This may involve interactions with the Treasury, Token, or other contracts.
}
`;
};

export const generateDaoContracts = (nodes: Node[], edges: Edge[]): { filename: string, code: string }[] => {
  const contracts: { filename: string, code: string }[] = [];
  
  const tokenNode = nodes.find(n => n.type === 'token');
  const votingNode = nodes.find(n => n.type === 'voting');
  const treasuryNode = nodes.find(n => n.type === 'treasury');
  const quorumNode = nodes.find(n => n.type === 'quorum');
  const timelockNode = nodes.find(n => n.type === 'timelock');
  const aiNodes = nodes.filter(n => n.type === 'ai');

  let tokenContractName = '';
  if (tokenNode) {
    tokenContractName = (tokenNode.data.name || 'MyToken').replace(/\s+/g, '');
    contracts.push({
      filename: `${tokenContractName}.sol`,
      code: generateTokenContract(tokenNode),
    });
  }

  const isTimelockConnectedToVoting = edges.some(e => 
    (e.source === votingNode?.id && e.target === timelockNode?.id) ||
    (e.target === votingNode?.id && e.source === timelockNode?.id)
  );

  if (timelockNode && isTimelockConnectedToVoting) {
    contracts.push({
      filename: 'Timelock.sol',
      code: generateTimelockContract(timelockNode),
    });
  }

  if (votingNode) {
    const isVotingConnectedToToken = edges.some(e => 
      (e.source === tokenNode?.id && e.target === votingNode.id) ||
      (e.target === tokenNode?.id && e.source === votingNode.id)
    );

    if (isVotingConnectedToToken && tokenContractName) {
      const isQuorumConnected = edges.some(e => 
        (e.source === tokenNode?.id && e.target === quorumNode?.id) ||
        (e.target === tokenNode?.id && e.source === quorumNode?.id)
      );
      const quorumValue = isQuorumConnected ? quorumNode?.data.percentage : 4;

      contracts.push({
        filename: 'Governor.sol',
        code: generateVotingContract(votingNode, tokenContractName, quorumValue, isTimelockConnectedToVoting),
      });
    } else {
       contracts.push({
        filename: 'Governor.sol',
        code: `// Note: The Voting contract is not connected to a Token contract.\n// Please connect it to a Token node to define voting power.\n`
      });
    }
  }

  if (treasuryNode) {
    const isTreasuryConnectedToTimelock = edges.some(e => 
      (e.source === timelockNode?.id && e.target === treasuryNode.id) ||
      (e.target === timelockNode?.id && e.source === treasuryNode.id)
    );
    const treasuryOwner = isTreasuryConnectedToTimelock ? 'Timelock' : 'Governor';
    contracts.push({
      filename: 'Treasury.sol',
      code: generateTreasuryContract(treasuryOwner),
    });
  }

  aiNodes.forEach(node => {
    const contractName = (node.data.label || 'CustomModule').replace(/\s+/g, '');
    contracts.push({
      filename: `${contractName}.sol`,
      code: generateAiContract(node),
    });
  });

  return contracts;
};