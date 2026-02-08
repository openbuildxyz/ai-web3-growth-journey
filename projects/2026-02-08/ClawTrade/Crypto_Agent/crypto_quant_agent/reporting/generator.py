import pandas as pd
import google.generativeai as genai
from ..config import settings
import traceback

class ReportGenerator:
    def __init__(self):
        self.use_ai = False
        if hasattr(settings, 'GEMINI_API_KEY') and settings.GEMINI_API_KEY:
            try:
                genai.configure(api_key=settings.GEMINI_API_KEY)
                self.model = genai.GenerativeModel('gemini-2.0-flash')
                self.use_ai = True
            except Exception as e:
                print(f"Warning: Failed to initialize Gemini AI: {e}")
    
    def generate(self, df: pd.DataFrame, sentiment: int, symbol: str, chain: str = None, user_query: str = "", sector_data: dict = None) -> str:
        if df.empty:
            return "## Error\nNo data available to generate report."

        # Prepare Data Context
        context = self._prepare_context(df, sentiment, symbol, chain, sector_data)
        
        if self.use_ai:
            try:
                print("Consulting Gemini AI Analyst...")
                return self._generate_ai_report(context, user_query)
            except Exception as e:
                print(f"AI Generation failed ({e}), falling back to template...")
                traceback.print_exc()
        
        return self._generate_template_report(df, sentiment, symbol, chain)

    def _prepare_context(self, df: pd.DataFrame, sentiment: int, symbol: str, chain: str, sector_data: dict = None) -> dict:
        latest = df.iloc[-1]
        
        # Calculate recent performance
        price_7d_ago = df['Price'].iloc[-7] if len(df) >= 7 else df['Price'].iloc[0]
        price_change_7d = ((latest['Price'] - price_7d_ago) / price_7d_ago) * 100
        
        # Volatility (Std Dev of returns last 30d)
        returns = df['Price'].pct_change()
        volatility = returns.tail(30).std() * (365 ** 0.5) * 100 # Annualized
        
        # TVL Data
        tvl_info = "N/A"
        if 'Chain_TVL' in df.columns and not pd.isna(latest['Chain_TVL']):
            tvl_info = f"${latest['Chain_TVL']/1e9:.2f}B"
            
        # Technical Indicators
        dxy = f"{latest['DXY']:.2f}" if 'DXY' in df.columns and not pd.isna(latest['DXY']) else "N/A"
        willr = f"{latest['WillR']:.2f}" if 'WillR' in df.columns and not pd.isna(latest['WillR']) else "N/A"
        
        bb_status = "N/A"
        if 'BB_Upper' in df.columns and not pd.isna(latest['BB_Upper']):
            if latest['Price'] > latest['BB_Upper']:
                bb_status = "突破上轨 (Possible Reversal/Strong Trend)"
            elif latest['Price'] < latest['BB_Lower']:
                bb_status = "跌破下轨 (Possible Reversal/Panic)"
            else:
                bb_status = "通道内 (Normal)"

        return {
            "symbol": symbol,
            "chain": chain,
            "date": df.index[-1].strftime('%Y-%m-%d'),
            "price": latest['Price'],
            "price_change_7d": f"{price_change_7d:.2f}%",
            "volatility": f"{volatility:.2f}%",
            "sentiment_index": sentiment,
            "correlation_spx": latest['Corr_SPX'] if 'Corr_SPX' in df.columns else "N/A",
            "spx_level": latest['SPX'] if 'SPX' in df.columns else "N/A",
            "dxy": dxy,
            "willr": willr,
            "bb_status": bb_status,
            "tvl": tvl_info,
            "sector_data": sector_data or {}
        }

    def _generate_ai_report(self, ctx: dict, user_query: str) -> str:
        # Format Sector Data for Prompt
        sector_text = ""
        if ctx['sector_data']:
            sector_text = "\n### 行业基准表现 (Sector Benchmark)\n"
            for s, data in ctx['sector_data'].items():
                sector_text += f"- **{s}**: ${data['price']:,.2f} (7d: {data['change_7d']:.2f}%)\n"
        
        prompt = f"""
        你是一位资深的加密货币量化分析师。请根据以下实时数据和用户问题，撰写一份**极度精简、观点鲜明**的中文投资速报（Executive Summary）。
        
        ### 1. 核心资产数据
        - **标的**: {ctx['symbol']} ({ctx['chain'] if ctx['chain'] else 'N/A'})
        - **日期**: {ctx['date']}
        - **当前价格**: ${ctx['price']:,.2f}
        - **7日涨跌幅**: {ctx['price_change_7d']}
        - **年化波动率(30d)**: {ctx['volatility']}
        - **恐慌贪婪指数**: {ctx['sentiment_index']} (0-100, 低为恐慌)
        - **与标普500相关性(30d)**: {ctx['correlation_spx']} (相关性高说明受宏观影响大)
        - **美元指数 (DXY)**: {ctx['dxy']}
        - **Williams %R (14)**: {ctx['willr']} (区间 -100 到 0; >-20 超买, <-80 超卖)
        - **布林带状态**: {ctx['bb_status']}
        - **链上TVL**: {ctx['tvl']}
        {sector_text}
        
        ### 2. 用户问题
        "{user_query}"
        
        ### 3. 报告要求 (必须严格遵循以下格式)
        请直接输出以下三部分内容，使用纯文本格式，不要使用 Markdown 符号（如 ** 或 ##）：

        [核心观点]
        用一句话总结当前市场状态，例如：宏观压制下的超卖反弹预期 / 趋势确立后的右侧买点 / 极度恐慌中的左侧博弈

        [关键数据支撑]
        列出3个最重要的数据点，解释其含义。
        - 数据名: 数值 -> 解读
        - 数据名: 数值 -> 解读
        - 数据名: 数值 -> 解读

        [策略建议]
        明确的操作指令：定投 / 观望 / 止盈 / 抄底，并附带简要理由
        """
        
        response = self.model.generate_content(prompt)
        return response.text

    def _generate_template_report(self, df: pd.DataFrame, sentiment: int, symbol: str, chain: str) -> str:
        # Re-using previous logic as fallback
        latest_date = df.index[-1].strftime('%Y-%m-%d')
        current_price = df['Price'].iloc[-1]
        corr_val = df['Corr_SPX'].iloc[-1] if 'Corr_SPX' in df.columns else 0
        
        report = f"""
# 📊 Crypto-Quant Analysis Report: {symbol} (Fallback Template)
**Date**: {latest_date}

## 1. Executive Summary
(AI Service Unavailable - Using Standard Template)
The market sentiment is **{sentiment}**. Price is **${current_price:,.2f}**.

## 2. Key Metrics
- **Price**: ${current_price:,.2f}
- **Fear & Greed Index**: {sentiment}
- **Correlation**: {corr_val:.2f}

*Generated by Crypto-Quant Agent (Offline Mode)*
"""
        return report.strip()
