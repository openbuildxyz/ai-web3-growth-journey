# ClaritySign AI: Prompt Engineering Guide

1. Transaction Explainer 📝 User tries to sign a transaction → app parses ABI + function call. AI converts it into plain English: “You are about to approve Contract X to move unlimited USDT from your wallet.” Warn about risks (e.g., unlimited approvals, unknown contracts). Smart Contract Clause Explainer 📜 User pastes a contract address. App fetches verified source from Etherscan (or similar). AI gives a human-readable summary: Who can call functions? Are there admin-only powers? Any “rug-pull” risks like withdrawAll()? Create app.jsx and components files for it and make sure to use tailwind css and jsx files only and make it dark theme.

2. `import React from "react"; import Header from "./components/Header"; import TransactionExplainer from "./components/TransactionExplainer"; import SmartContractExplainer from "./components/SmartContractExplainer"; function App() { return ( <div className="min-h-screen bg-gray-900 text-white font-sans"> <Header /> <main className="container mx-auto p-4"> <div className="grid grid-cols-1 lg:grid-cols-2 gap-8"> <TransactionExplainer /> <SmartContractExplainer /> </div> </main> </div> ); } export default App;` Make frontend here better

3. ````POST http://localhost:8000/api/explain-transaction 500 (Internal Server Error)
   handleExplain @ TransactionExplainer.jsx:17
   executeDispatch @ react-dom_client.js?v=e5014211:11734
   runWithFiberInDEV @ react-dom_client.js?v=e5014211:1483
   processDispatchQueue @ react-dom_client.js?v=e5014211:11770
   (anonymous) @ react-dom_client.js?v=e5014211:12180
   batchedUpdates$1 @ react-dom_client.js?v=e5014211:2626
   dispatchEventForPluginEventSystem @ react-dom_client.js?v=e5014211:11875
   dispatchEvent @ react-dom_client.js?v=e5014211:14790
   dispatchDiscreteEvent @ react-dom_client.js?v=e5014211:14771```
   ````
