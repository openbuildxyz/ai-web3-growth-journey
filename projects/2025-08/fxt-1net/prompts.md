### Github Copilot Prompts

I want you to write a simple erc20 solidity smart contract by importing openzepellin erc20 template, i will later import this file and replace ${contractName} with the name of contract, similarly same for ${name} and ${supply}, write correct smart contract code

Frontend will send an api request containing smart contract code, compile it using compileWithHardHat() function and return the abi and bytecode

cors allow request from everywhere

Can you make it so that it compiles and the output json file is generated with a custom name in the same folder as this compile.js and then the abi and bytecode is returned

extract the contract name from source code file, and then use it when reading from artifact file

Write a solidity smart contract that uses the openzeppelin erc20 template, 

npx hardhat compile says nothing to compile

where to update contracts folder path

Create a node.js backend that has a post endpoint /generate, that takes in an input json with field description, also make a templates folder

Make it so that we pull templates from files (erc20.sol, erc721.sol, pausable.sol) instead of from templates.json

make it ESM compatible code

---

### Chatgpt Prompts

what is an ethereum node and how do you connect to it via metamask

is it free to deploy dApp on testnet

to get free eth via faucet, it requires you to have at least 0.001 ETH? or is there any way to avoid that

Does the frontend need to be a dApp - means it needs to be deployed on blockchain or it can be deployed on something like render/vercel/aws, and what about the backend? does it need to be deployed on blockchain or something like render/vercel/aw

what needs to be done on the backend - node.js

which exact templates should i download from open zeppelin?

So i dont need to manually download openzeppelin contracts to a template folder, i can simply import them

give a minimal list of openzepplin templates and their corresponding type (like ERC20, ERC721) for MVP (only the essentials),

Can you give the proper full-scale template source code for each of these. Like if the user wants ERC20, the backend should have the source code for a proper ERC20 solidity contract, not an example of 4-5 lines

what are solidity templates like ERC20 / ERC721 / DAO / Staking?

since solc-js will compile my code, and i installed the openzeppelin package in node.js, i dont think solc-js compiler can import openzepplin packages while solidity code

I want to use hardhat inside a node.js function, it should read the source code from a string (function input), compile the code and return abi+bytecode'

To use hardhat like this inside my function, i need to run npx hardhat --init first in my terminal?


---

### Lovable Prompts

Create a Next.js App. Ai-based smart contract builder, user inputs their requirement (like I want an ERC20 token called PrimoCoin with 1,000,000 supply) and the system accordingly generates a smart contract (the smart contracts must be built upon openzepellin templates like erc20 or erc721), then there should be an option to validate security of the smart contract, and deploy the smart contract on meta mask.
There should be an AI layer that parses the user input to determine their intent, i.e what type of token do they want to make, what type of name, what type of supply, and any other variables if available

Now connect it with metamask

Compile the smart contract via solc-js, and then connect to an ethereum node

Generate the smart contract using ai, i have gemini api key i will add it in the code, remove the code where smart contract is statically generated