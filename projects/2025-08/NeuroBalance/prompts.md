# 📄 prompts.md  

## 🎯 Portfolio Categorization & Overview  
**Prompt:**  
```
You are an AI portfolio assistant.  
Given this wallet’s holdings across BNB Smart Chain (tokens, balances, USD values), generate a clean JSON output showing:  
1. Token name & symbol  
2. Current balance & USD value  
3. Percentage allocation in the total portfolio  
4. Portfolio summary (total value, biggest token, smallest token)  

Format response as:  
{
  "tokens": [
    {"symbol":"BUSD","balance":1000,"usdValue":1000,"allocation":"40%"},
    {"symbol":"WBNB","balance":2,"usdValue":600,"allocation":"24%"}
  ],
  "summary": {
    "totalValue": 2500,
    "largestHolding": "BUSD",
    "smallestHolding": "CAKE"
  }
}
```

---

## 📈 AI-Powered Predictions (7-Day Forecasts)  
**Prompt:**  
```
You are a financial prediction AI.  
Input: Current portfolio allocations + 7-day price predictions for BUSD, WBNB, CAKE.  
Output: For each token, provide:  
1. Expected % return over 7 days  
2. Confidence level (High/Medium/Low)  
3. Suggested action: Buy / Hold / Sell  

Return as JSON:  
[
  {"symbol":"WBNB","expectedReturn":"+5.2%","confidence":"High","action":"Buy"},
  {"symbol":"CAKE","expectedReturn":"-3.8%","confidence":"Medium","action":"Sell"}
]
```

---

## 🧮 Optimal Allocation Suggestion (Portfolio Optimization)  
**Prompt:**  
```
You are a portfolio optimizer using Modern Portfolio Theory (MPT).  
Input: Current allocations + predicted returns + user risk profile (Growth / Balanced / Conservative).  
Task: Suggest the optimal allocation across tokens.  
Make sure allocations sum to 100%.  

Output format:  
{
  "strategy":"Balanced",
  "optimalAllocations":[
    {"symbol":"BUSD","allocation":"30%"},
    {"symbol":"WBNB","allocation":"45%"},
    {"symbol":"CAKE","allocation":"25%"}
  ]
}
```

---

## 🔄 Automated Rebalancing (Transaction Plan)  
**Prompt:**  
```
You are a portfolio rebalancer.  
Input: Current allocations + target allocations.  
Task: Generate a step-by-step swap plan to achieve the target.  
Include source token, target token, and swap amount.  

Output:  
[
  {"from":"BUSD","to":"WBNB","amount":"200"},
  {"from":"CAKE","to":"BUSD","amount":"50"}
]
```

---

## 📜 Swap History & Audit Trail  
**Prompt:**  
```
You are a portfolio auditor.  
Input: Before & after allocations of a rebalance + executed swap steps.  
Task: Generate a human-readable summary for the user and a structured JSON log for storage.  

Human Summary:  
"Rebalanced portfolio: Sold 200 BUSD for WBNB, Sold 50 CAKE for BUSD.  
New allocation: WBNB 45%, BUSD 30%, CAKE 25%."

JSON Log:  
{
  "timestamp":"2024-08-30T12:30:00Z",
  "actions":[
    {"from":"BUSD","to":"WBNB","amount":"200"},
    {"from":"CAKE","to":"BUSD","amount":"50"}
  ],
  "newAllocations":[
    {"symbol":"WBNB","allocation":"45%"},
    {"symbol":"BUSD","allocation":"30%"},
    {"symbol":"CAKE","allocation":"25%"}
  ]
}
```

---

## ⚠️ Smart Alerts (Risk & Anomalies)  
**Prompt:**  
```
You are a risk monitor for a DeFi portfolio.  
Input: Current allocations + predicted market trends.  
Task: Generate 2–3 smart alerts if there are risks or unusual patterns.  

Example outputs:  
- "Your CAKE allocation (50%) is too high relative to market risk. Consider reducing."  
- "WBNB predicted return is +6%, but you only hold 10%. Consider increasing."  
```
