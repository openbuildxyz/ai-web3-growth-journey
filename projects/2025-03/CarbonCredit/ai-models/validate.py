import pandas as pd
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split
import joblib
from typing import List, Dict, Tuple
import numpy as np
import requests
from io import BytesIO
import pickle
from sklearn.metrics import precision_score, recall_score
from scipy.stats import zscore
import warnings
warnings.filterwarnings('ignore')

class CarbonValidator:
    def __init__(self):
        self.model = RandomForestClassifier(n_estimators=100)
        self.federated_nodes = []
        self.node_status = {}  # Track node status and last active time
    
    def train(self, data_path):
        """Train validation model on historical carbon project data"""
        df = pd.read_csv(data_path)
        X = df.drop(['is_valid'], axis=1)
        y = df['is_valid']
        
        X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2)
        self.model.fit(X_train, y_train)
        
        print(f"Training accuracy: {self.model.score(X_train, y_train):.2f}")
        print(f"Test accuracy: {self.model.score(X_test, y_test):.2f}")
    
    def validate(self, project_data):
        """Validate new carbon project data with anomaly detection"""
        # First check for data anomalies
        if self._detect_anomalies(project_data):
            return False
        
        # Then run model prediction
        return self.model.predict(project_data)
        
    def _detect_anomalies(self, data) -> bool:
        """Detect statistical anomalies in project data"""
        numeric_cols = data.select_dtypes(include=[np.number]).columns
        for col in numeric_cols:
            z_scores = zscore(data[col])
            if any(abs(z_scores) > 3):  # 3 standard deviations
                return True
        return False
    
    def save_model(self, path):
        """Save trained model to file"""
        joblib.dump(self.model, path)
    
    def load_model(self, path):
        """Load pre-trained model"""
        self.model = joblib.load(path)
        
    def add_federated_node(self, node_url: str):
        """Add a federated learning node"""
        self.federated_nodes.append(node_url)
        self.node_status[node_url] = {
            'active': True,
            'last_seen': time.time()
        }
        
    def check_node_health(self, node_url: str) -> bool:
        """Check if a federated node is healthy"""
        try:
            response = requests.get(f"{node_url}/health", timeout=5)
            if response.status_code == 200:
                self.node_status[node_url]['last_seen'] = time.time()
                self.node_status[node_url]['active'] = True
                return True
        except:
            pass
        
        self.node_status[node_url]['active'] = False
        return False
        
    def federated_train(self, local_data_path: str, rounds: int = 5):
        """Train model using federated learning approach"""
        # Train local model first
        self.train(local_data_path)
        
        # Check all nodes health before training
        for node in self.federated_nodes:
            self.check_node_health(node)
        
        for _ in range(rounds):
            # Get current model weights
            local_weights = self._get_model_weights()
            
            # Collect weights from all nodes
            federated_weights = [local_weights]
            for node in self.federated_nodes:
                try:
                    response = requests.get(f"{node}/model_weights")
                    if response.status_code == 200:
                        weights = pickle.load(BytesIO(response.content))
                        federated_weights.append(weights)
                except Exception as e:
                    print(f"Error getting weights from {node}: {e}")
            
            # Average weights
            if len(federated_weights) > 1:
                avg_weights = self._average_weights(federated_weights)
                self._set_model_weights(avg_weights)
        
    def _get_model_weights(self) -> Dict:
        """Extract model weights for sharing"""
        return {
            'estimators': [e.tree_.value for e in self.model.estimators_],
            'n_classes': self.model.n_classes_
        }
        
    def _set_model_weights(self, weights: Dict):
        """Update model with new weights"""
        for estimator, tree_values in zip(self.model.estimators_, weights['estimators']):
            estimator.tree_.value = tree_values
        
    def _average_weights(self, weights_list: List[Dict]) -> Dict:
        """Average weights from multiple models"""
        avg_weights = {
            'estimators': [],
            'n_classes': weights_list[0]['n_classes']
        }
        
        # Average each tree's values
        for i in range(len(self.model.estimators_)):
            tree_values = [w['estimators'][i] for w in weights_list]
            avg_tree = np.mean(tree_values, axis=0)
            avg_weights['estimators'].append(avg_tree)
            
        return avg_weights