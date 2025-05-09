import pandas as pd
import numpy as np
from sklearn.decomposition import PCA
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
        
        # Apply PCA
        pca = PCA(n_components=2)
        X_pca = pca.fit_transform(X_scaled)
        
        # Calculate reconstruction error
        X_reconstructed = pca.inverse_transform(X_pca)
        reconstruction_errors = np.sum((X_scaled - X_reconstructed) ** 2, axis=1)
        
        # Detect anomalies based on reconstruction error
        threshold = np.percentile(reconstruction_errors, 90)  # Top 10% as anomalies
        df['Anomaly'] = (reconstruction_errors > threshold).astype(int) * -2 + 1
        df['Anomaly_Label'] = df['Anomaly'].map({1: 'Normal', -1: 'Anomaly'})
        
        # FMEA Analysis
        def get_fmea_diagnosis(row, error):
            if row['Anomaly'] == -1:
                features = ['usage_kwh', 'co2_tco2', 'power_factor']
                contributions = np.abs(pca.components_[:, [X.columns.get_loc(f) for f in features]])
                max_feature_idx = np.argmax(contributions.sum(axis=0))
                max_feature = features[max_feature_idx]
                
                if max_feature == 'usage_kwh':
                    return f"Energy consumption pattern anomaly (reconstruction error: {error:.2f})"
                elif max_feature == 'co2_tco2':
                    return f"CO2 emissions pattern anomaly (reconstruction error: {error:.2f})"
                else:
                    return f"Power factor pattern anomaly (reconstruction error: {error:.2f})"
            return "Normal operation"
        
        df['FMEA_Diagnosis'] = [get_fmea_diagnosis(row, error) 
                               for row, error in zip(df.itertuples(), reconstruction_errors)]
        
        # Alert Level based on reconstruction error
        def get_alert_level(error):
            if error > np.percentile(reconstruction_errors, 98):
                return 3  # Critical
            elif error > np.percentile(reconstruction_errors, 95):
                return 2  # Moderate
            return 1  # Minor
        
        df['Alert_Level'] = [get_alert_level(error) for error in reconstruction_errors]
        
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