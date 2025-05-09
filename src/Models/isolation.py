import numpy as np
import pandas as pd
from sklearn.ensemble import IsolationForest
from sklearn.preprocessing import StandardScaler, RobustScaler
from sklearn.covariance import EllipticEnvelope
import json
import sys
from datetime import datetime

def calculate_feature_importance(model, X):
    """Calculate feature importance scores based on isolation paths"""
    n_samples = X.shape[0]
    n_features = X.shape[1]
    feature_scores = np.zeros(n_features)
    
    for estimator in model.estimators_:
        for tree in estimator.estimators_:
            leaves_index = tree.apply(X)
            for leaf in np.unique(leaves_index):
                leaf_samples = X[leaves_index == leaf]
                if len(leaf_samples) > 1:
                    feature_scores += np.var(leaf_samples, axis=0)
    
    return feature_scores / len(model.estimators_)

def get_anomaly_details(row, feature_scores, means, stds, thresholds):
    """Get detailed anomaly information for a data point"""
    deviations = {}
    primary_issue = None
    max_deviation = 0
    
    features = ['usage_kwh', 'co2_tco2', 'power_factor']
    for feature, score, mean, std, threshold in zip(features, feature_scores, means, stds, thresholds):
        value = row[feature]
        z_score = abs((value - mean) / std)
        deviation = (value - mean) / mean * 100 if mean != 0 else float('inf')
        
        if z_score > threshold:
            deviations[feature] = {
                'z_score': z_score,
                'deviation': deviation,
                'direction': 'high' if value > mean else 'low'
            }
            if score * z_score > max_deviation:
                max_deviation = score * z_score
                primary_issue = feature
    
    return deviations, primary_issue, max_deviation

def train_and_detect_anomalies(csv_path):
    try:
        # Load and prepare data
        df = pd.read_csv(csv_path)
        if 'date' not in df.columns:
            df['date'] = datetime.now().strftime('%Y-%m-%d %H:%M:%S')
        df['date'] = pd.to_datetime(df['date'])
        
        # Select features
        features = ['usage_kwh', 'co2_tco2', 'power_factor']
        X = df[features].copy()
        
        # Handle missing or invalid values
        for col in features:
            X[col] = pd.to_numeric(X[col], errors='coerce')
            X[col].fillna(X[col].mean(), inplace=True)
        
        # Use RobustScaler to handle outliers better
        scaler = RobustScaler()
        X_scaled = scaler.fit_transform(X)
        
        # Train multiple models for ensemble approach
        base_contamination = 0.1
        models = {
            'isolation_forest': IsolationForest(
                n_estimators=200,
                contamination=base_contamination,
                random_state=42
            ),
            'robust_covariance': EllipticEnvelope(
                contamination=base_contamination,
                random_state=42
            )
        }
        
        # Get predictions from each model
        predictions = {}
        for name, model in models.items():
            predictions[name] = model.fit_predict(X_scaled)
        
        # Combine predictions (majority voting)
        combined_predictions = np.mean([pred for pred in predictions.values()], axis=0)
        df['Anomaly'] = (combined_predictions < 0).astype(int) * -2 + 1
        
        # Calculate feature importance and thresholds
        feature_scores = calculate_feature_importance(models['isolation_forest'], X_scaled)
        means = X.mean()
        stds = X.std()
        thresholds = {
            'critical': 3.0,    # Critical anomaly
            'moderate': 2.0,    # Moderate anomaly
            'minor': 1.5        # Minor anomaly
        }
        
        # Analyze anomalies
        anomalies = []
        for idx, row in df[df['Anomaly'] == -1].iterrows():
            deviations, primary_issue, max_deviation = get_anomaly_details(
                row, feature_scores, means, stds, 
                [thresholds['minor']] * len(features)
            )
            
            # Determine severity
            if max_deviation > thresholds['critical']:
                severity = 3  # Critical
            elif max_deviation > thresholds['moderate']:
                severity = 2  # Moderate
            else:
                severity = 1  # Minor
            
            # Generate detailed diagnosis
            if primary_issue == 'usage_kwh':
                anomaly_name = 'Energy Consumption Anomaly'
                diagnosis = f"{'High' if deviations[primary_issue]['direction'] == 'high' else 'Low'} energy consumption detected"
            elif primary_issue == 'co2_tco2':
                anomaly_name = 'CO2 Emissions Anomaly'
                diagnosis = f"{'Elevated' if deviations[primary_issue]['direction'] == 'high' else 'Reduced'} CO2 emissions detected"
            else:
                anomaly_name = 'Power Factor Anomaly'
                if row['power_factor'] < 0.85:
                    diagnosis = "Poor power factor indicating reactive power issues"
                elif row['power_factor'] > 0.98:
                    diagnosis = "Power factor over-compensation detected"
                else:
                    diagnosis = f"Abnormal power factor fluctuation"
            
            # Add correlation insights
            if len(deviations) > 1:
                correlated_issues = [k for k in deviations.keys() if k != primary_issue]
                if correlated_issues:
                    diagnosis += f". Also showing abnormal {', '.join(correlated_issues)}"
            
            anomalies.append({
                'date': row['date'].strftime('%Y-%m-%d %H:%M:%S'),
                'Usage_kWh': float(row['usage_kwh']),
                'CO2(tCO2)': float(row['co2_tco2']),
                'Lagging_Current_Power_Factor': float(row['power_factor']),
                'Anomaly_Label': anomaly_name,
                'FMEA_Diagnosis': diagnosis,
                'Alert_Level': severity
            })
        
        return json.dumps(anomalies)
        
    except Exception as e:
        return json.dumps({'error': str(e)})

if __name__ == '__main__':
    if len(sys.argv) < 2:
        print(json.dumps({'error': 'No CSV file provided'}))
    else:
        csv_path = sys.argv[1]
        result = train_and_detect_anomalies(csv_path)
        print(result)