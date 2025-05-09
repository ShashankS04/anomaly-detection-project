import React, { useState, useEffect } from 'react';
import PageContainer from '../components/layout/PageContainer';
import { useAppContext } from '../contexts/AppContext';
import ChartContainer from '../components/ui/ChartContainer';
import Button from '../components/ui/Button';
import { Link } from 'react-router-dom';
import { TrendingUp, AlertTriangle, Activity } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface PredictionData {
  date: string;
  usage_kwh: number;
  co2_tco2: number;
  power_factor: number;
}

const Analytics: React.FC = () => {
  const { selectedFile, anomalyData } = useAppContext();
  const [predictionDays, setPredictionDays] = useState(7);
  const [predictions, setPredictions] = useState<PredictionData[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const predictFuture = async () => {
    if (!selectedFile?.data) return;

    setLoading(true);
    setError(null);

    try {
      const { data, error } = await supabase.functions.invoke('predict', {
        body: {
          historicalData: selectedFile.data,
          days: predictionDays
        }
      });

      if (error) throw error;
      setPredictions(data);
    } catch (err) {
      setError(err.message);
      console.error('Prediction error:', err);
    } finally {
      setLoading(false);
    }
  };

  const generateChartData = () => {
    if (!selectedFile?.data || !predictions.length) return null;

    const historicalData = selectedFile.data.slice(-30); // Last 30 days
    const metrics = ['usage_kwh', 'co2_tco2', 'power_factor'];
    
    return metrics.map(metric => ({
      labels: [
        ...historicalData.map(d => new Date(d.date).toLocaleDateString()),
        ...predictions.map(d => new Date(d.date).toLocaleDateString())
      ],
      datasets: [
        {
          label: 'Historical',
          data: historicalData.map(d => d[metric]),
          borderColor: '#0f52ba',
          backgroundColor: 'rgba(15, 82, 186, 0.1)',
          borderWidth: 2
        },
        {
          label: 'Predicted',
          data: [...Array(historicalData.length).fill(null), ...predictions.map(d => d[metric])],
          borderColor: '#ff8c00',
          backgroundColor: 'rgba(255, 140, 0, 0.1)',
          borderWidth: 2,
          borderDash: [5, 5]
        }
      ]
    }));
  };

  const chartData = generateChartData();

  return (
    <PageContainer
      title="Analytics & Predictions"
      description="Analyze trends and predict future anomalies"
    >
      {!selectedFile ? (
        <div className="bg-white shadow rounded-lg p-6 text-center">
          <p className="text-gray-600 mb-4">
            Please select a file to analyze trends and make predictions.
          </p>
          <Link to="/">
            <Button>Go to Data Ingestion</Button>
          </Link>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Prediction Controls */}
          <section className="bg-white shadow rounded-lg p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">
              Prediction Settings
            </h2>
            <div className="flex items-center gap-4">
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Prediction Period (Days)
                </label>
                <select
                  value={predictionDays}
                  onChange={(e) => setPredictionDays(Number(e.target.value))}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                >
                  {[7, 14, 30, 60, 90].map((days) => (
                    <option key={days} value={days}>
                      {days} days
                    </option>
                  ))}
                </select>
              </div>
              <Button
                onClick={predictFuture}
                disabled={loading}
                icon={<TrendingUp size={16} />}
              >
                {loading ? 'Predicting...' : 'Generate Predictions'}
              </Button>
            </div>
            {error && (
              <div className="mt-4 p-4 bg-error-50 text-error-700 rounded-lg">
                {error}
              </div>
            )}
          </section>

          {/* Trend Charts */}
          {chartData && (
            <section className="bg-white shadow rounded-lg p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4">
                Trend Analysis
              </h2>
              <div className="space-y-6">
                <div>
                  <h3 className="text-md font-medium text-gray-700 mb-2">
                    Energy Usage (kWh)
                  </h3>
                  <ChartContainer
                    type="line"
                    data={chartData[0]}
                    height={300}
                  />
                </div>
                <div>
                  <h3 className="text-md font-medium text-gray-700 mb-2">
                    CO₂ Emissions (tCO₂)
                  </h3>
                  <ChartContainer
                    type="line"
                    data={chartData[1]}
                    height={300}
                  />
                </div>
                <div>
                  <h3 className="text-md font-medium text-gray-700 mb-2">
                    Power Factor
                  </h3>
                  <ChartContainer
                    type="line"
                    data={chartData[2]}
                    height={300}
                  />
                </div>
              </div>
            </section>
          )}

          {/* Anomaly Analysis */}
          {anomalyData && anomalyData.length > 0 && (
            <section className="bg-white shadow rounded-lg p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4">
                Anomaly Analysis
              </h2>
              <div className="space-y-4">
                {anomalyData.map((anomaly, index) => (
                  <div
                    key={index}
                    className={`border-l-4 p-4 ${
                      anomaly.Alert_Level === 3
                        ? 'border-l-error-500 bg-error-50'
                        : anomaly.Alert_Level === 2
                        ? 'border-l-warning-500 bg-warning-50'
                        : 'border-l-success-500 bg-success-50'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-medium flex items-center gap-2">
                          <AlertTriangle size={16} className="text-warning-500" />
                          {anomaly.Anomaly_Label}
                        </h3>
                        <p className="text-sm text-gray-600 mt-1">
                          {new Date(anomaly.date).toLocaleString()}
                        </p>
                      </div>
                      <span
                        className={`px-2 py-1 text-xs font-medium rounded-full ${
                          anomaly.Alert_Level === 3
                            ? 'bg-error-100 text-error-700'
                            : anomaly.Alert_Level === 2
                            ? 'bg-warning-100 text-warning-700'
                            : 'bg-success-100 text-success-700'
                        }`}
                      >
                        {anomaly.Alert_Level === 3
                          ? 'Critical'
                          : anomaly.Alert_Level === 2
                          ? 'Moderate'
                          : 'Minor'}
                      </span>
                    </div>
                    <div className="mt-2 space-y-2">
                      <div className="grid grid-cols-3 gap-4 text-sm">
                        <div>
                          <span className="text-gray-500">Energy Usage:</span>
                          <br />
                          {anomaly.Usage_kWh.toFixed(2)} kWh
                        </div>
                        <div>
                          <span className="text-gray-500">CO₂ Emissions:</span>
                          <br />
                          {anomaly['CO2(tCO2)'].toFixed(2)} tCO₂
                        </div>
                        <div>
                          <span className="text-gray-500">Power Factor:</span>
                          <br />
                          {anomaly.Lagging_Current_Power_Factor.toFixed(2)}
                        </div>
                      </div>
                      <div className="text-sm mt-2">
                        <span className="text-gray-500">Diagnosis:</span>
                        <div className="mt-1 whitespace-pre-wrap">
                          {anomaly.FMEA_Diagnosis}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>
      )}
    </PageContainer>
  );
};

export default Analytics;