from flask import Flask, request, jsonify
import pandas as pd
import numpy as np
import joblib
from ta.trend import MACD
from ta.volatility import BollingerBands
from flask_cors import CORS

app = Flask(__name__)
CORS(app)
# Load model once at start
xgb_model = joblib.load("xgb_model.pkl")

# Precomputed features for all tokens (simulate as a dictionary)
token_feature_map = {
    'WBNB': {
        'open': 2.104,
        'high': 2.144,
        'low': 2.084,
        'close': 2.128,
        'volume': 1754977.29,
        'return_7d': -0.148966165,
        'rsi': 34.40640606,
        'macd': -71.14468172,
        'macd_signal': -92.55785653,
        'macd_diff': 21.41317481,
        'bb_mavg': 2.25565,
        'bb_high': 2.535915067,
        'bb_low': 1.975384933,
        'bb_width': 0.560530133
    },
    'CAKE': {
        'open': 3059.7,
        'high': 3110,
        'low': 2810,
        'close': 2981.78,
        'volume': 886994.3753,
        'return_7d': 0.0510098,
        'rsi': 23.28855242,
        'macd': 231.2758832,
        'macd_signal': 384.0359463,
        'macd_diff': -152.7600631,
        'bb_mavg': 3404.759,
        'bb_high': 3702.510651,
        'bb_low': 3107.007349,
        'bb_width': 595.5033025
    },
    'BUSD': {
        'open': 0.4779,
        'high': 0.5148,
        'low': 0.46,
        'close': 0.5018,
        'volume': 90601152.6,
        'return_7d': 0.093264249,
        'rsi': 38.27178987,
        'macd': -1.121702073,
        'macd_signal': -1.516297356,
        'macd_diff': 0.394595283,
        'bb_mavg': 0.543485,
        'bb_high': 0.61100755,
        'bb_low': 0.47596245,
        'bb_width': 0.1350451
    },
}

# Portfolio redistribution function
def redistribute_portfolio(current_allocation, predictions, strategy='Balanced'):
    tokens = [p['token'] for p in predictions]
    returns = np.array([p['return_7d'] for p in predictions])

    if strategy == 'Preservation':
        weights = -returns
    elif strategy == 'Balanced':
        weights = 1 / (1 + np.exp(-returns * 100))
    elif strategy == 'Growth':
        weights = returns - returns.min() + 1e-6
    else:
        raise ValueError("Invalid strategy")

    weights = np.clip(weights, 0, None)
    weight_sum = weights.sum()
    weights = np.ones_like(weights) / len(weights) if weight_sum == 0 else weights / weight_sum

    return dict(zip(tokens, weights.round(4)))

@app.route('/rebalance', methods=['POST'])
def rebalance():
    data = request.get_json()
    current_allocation = data.get('allocation')
    strategy = data.get('strategy', 'Balanced')

    if not current_allocation or not isinstance(current_allocation, dict):
        return jsonify({'error': 'Invalid allocation input'}), 400

    df_list = []

    for token in current_allocation:
        if token not in token_feature_map:
            return jsonify({'error': f'No features found for token: {token}'}), 404

        row = token_feature_map[token].copy()
        row['token'] = token
        df_list.append(row)

    df = pd.DataFrame(df_list)

    features = [
        "open", "high", "low", "close", "volume", "rsi",
        "macd", "macd_signal", "macd_diff",
        "bb_mavg", "bb_high", "bb_low", "bb_width"
    ]

    X = df[features]
    df['return_7d'] = xgb_model.predict(X)

    predictions = [{"token": row["token"], "return_7d": row["return_7d"]} for _, row in df.iterrows()]
    new_allocation = redistribute_portfolio(current_allocation, predictions, strategy)

    return jsonify({
        'predictions': predictions,
        'new_allocation': new_allocation
    })

if __name__ == '__main__':
    app.run(debug=True)