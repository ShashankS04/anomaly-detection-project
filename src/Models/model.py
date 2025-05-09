import numpy as np
import pandas as pd
from sklearn.ensemble import IsolationForest
from sklearn.preprocessing import StandardScaler
import json
import sys
from datetime import datetime

def train_and_detect_anomalies(data):
    try:
        # Convert data to DataFrame
        df = pd.DataFrame(data)
        
        # Select numeric columns for training
        numeric_cols = ['usage_kwh', 'co2_tco2', 'power_factor']
        X = df[numeric_cols]
        
        # Normalize the features
        scaler = StandardScaler()
        X_scaled = scaler.fit_transform(X)
        
        # Train Isolation Forest
        model = IsolationForest(n_estimators=100, contamination=0.1, random_state=42)
        predictions = model.fit_predict(X_scaled)
        
        # Add predictions to dataframe
        df['anomaly'] = predictions
        anomalies = df[df['anomaly'] == -1]
        
        # Calculate anomaly scores
        scores = model.score_samples(X_scaled)
        df['anomaly_score'] = scores
        
        return df, anomalies
        
    except Exception as e:
        print(f"Error in anomaly detection: {str(e)}")
        return None, None

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("No input data provided")
        sys.exit(1)
        
    input_data = json.loads(sys.argv[1])
    df, anomalies = train_and_detect_anomalies(input_data)
    
    if df is not None and anomalies is not None:
        result = {
            'anomalies': anomalies.to_dict('records'),
            'scores': df['anomaly_score'].tolist()
        }
        print(json.dumps(result))
    else:
        print(json.dumps({'error': 'Failed to process data'}))