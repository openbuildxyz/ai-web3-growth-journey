from abc import ABC, abstractmethod
from typing import Any

class DataLoader(ABC):
    @abstractmethod
    def fetch(self, **kwargs) -> Any:
        pass
