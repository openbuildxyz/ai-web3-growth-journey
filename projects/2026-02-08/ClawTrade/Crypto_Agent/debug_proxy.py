import os
import requests
import sys

print("--- Proxy Debug Info ---")
print(f"HTTP_PROXY: {os.environ.get('http_proxy')}")
print(f"HTTPS_PROXY: {os.environ.get('https_proxy')}")
print(f"ALL_PROXY: {os.environ.get('all_proxy')}")

try:
    print("\nAttempting to connect to https://api.binance.com/api/v3/exchangeInfo...")
    response = requests.get("https://api.binance.com/api/v3/exchangeInfo", timeout=5)
    print(f"Status Code: {response.status_code}")
    print("Success!")
except Exception as e:
    print(f"Failed: {e}")
