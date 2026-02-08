import requests
from ..config import settings
from .base import DataLoader

class SentimentLoader(DataLoader):
    def fetch(self) -> int:
        print("Fetching Market Sentiment...")
        response = requests.get(settings.SENTIMENT_URL, timeout=10).json()
        return int(response['data'][0]['value'])
