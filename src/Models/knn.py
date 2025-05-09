import pandas as pd
import numpy as np
from sklearn.neighbors import NearestNeighbors
from sklearn.preprocessing import StandardScaler
import json
import sys
from datetime import datetime

def train_and_detect_anomalies(csv_path):
    try:
        # Load the dataset
        df = pd.read_csv(csv_path)
        
        # Ensure date column exists
        if 'date' not in df.columns:
            df['date'] = datetime.now().strftime('%Y-%m-%d %H:%M:%S')
        
        # Convert date to datetime
        df['date'] = pd.to_datetime(df['date'])
        
        # Select numeric columns for training
        numeric_cols = df.select_dtypes(include=[np.number]).columns
        X = df[numeric_cols]
        
        # Normalize the features
        scaler = StandardScaler()
        X_scaled = scaler.fit_transform(X)
        
        # Train KNN
        n_neighbors = 5
        knn = NearestNeighbors(n_neighbors=n_neighbors)
        knn.fit(X_scaled)
        
        # Calculate distances and detect anomalies
        distances, _ = knn.kneighbors(X_scaled)
        avg_distances = distances.mean(axis=1)
        threshold = np.percentile(avg_distances, 90)  # Top 10% as anomalies
        df['Anomaly'] = (avg_distances > threshold).astype(int) * -2 + 1
        df['Anomaly_Label'] = df['Anomaly'].map({1: 'Normal', -1: 'Anomaly'})
        
        # FMEA Analysis
        def get_fmea_diagnosis(row, distance):
            if row['Anomaly'] == -1:
                features = ['usage_kwh', 'co2_tco2', 'power_factor']
                z_scores = np.abs((row[features] - df[features].mean()) / df[features].std())
                max_feature = features[z_scores.argmax()]
                deviation = z_scores.max()
                
                if max_feature == 'usage_kwh':
                    return f"Energy consumption anomaly detected (deviation: {deviation:.2f}σ, distance: {distance:.2f})"
                elif max_feature == 'co2_tco2':
                    return f"CO2 emissions anomaly detected (deviation: {deviation:.2f}σ, distance: {distance:.2f})"
                else:
                    return f"Power factor anomaly detected (deviation: {deviation:.2f}σ, distance: {distance:.2f})"
            return "Normal operation"
        
        df['FMEA_Diagnosis'] = [get_fmea_diagnosis(row, dist) for row, dist in zip(df.itertuples(), avg_distances)]
        
        # Alert Level based on distance
        def get_alert_level(distance):
            if distance > np.percentile(avg_distances, 98):
                return 3  # Critical
            elif distance > np.percentile(avg_distances, 95):
                return 2  # Moderate
            return 1  # Minor
        
        df['Alert_Level'] = [get_alert_level(dist) for dist in avg_distances]
        
        # Filter anomalies and prepare output
        anomalies = df[df['Anomaly'] == -1].copy()
        
        # Prepare output data
        output_data = []
        for _, row in anomalies.iterrows():
            anomaly_data = {
                'date': row['date'].strftime('%Y-%m-%d %H:%M:%S'),
                'Usage_kWh': float(row['usage_kwh']),
                'CO2(tCO2)': float(row['co2_tco2']),
                'Lagging_Current_Power_Factor': float(row['power_factor']),
                'Anomaly_Label': row['Anomaly_Label'],
                'FMEA_Diagnosis': row['FMEA_Diagnosis'],
                'Alert_Level': int(row['Alert_Level'])
            }
            output_data.append(anomaly_data)
        
        return json.dumps(output_data)
        
    except Exception as e:
        return json.dumps({'error': str(e)})

if __name__ == '__main__':
    if len(sys.argv) < 2:
        print(json.dumps({'error': 'No CSV file provided'}))
    else:
        csv_path = sys.argv[1]
        result = train_and_detect_anomalies(csv_path)
        print(result)