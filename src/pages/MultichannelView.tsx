import React, { useState, useEffect } from 'react';
import PageContainer from '../components/layout/PageContainer';
import { useAppContext } from '../contexts/AppContext';
import FeatureSelector from '../components/ui/FeatureSelector';
import ChartContainer from '../components/ui/ChartContainer';
import Button from '../components/ui/Button';
import { Link } from 'react-router-dom';

const generateColors = (count: number) => {
  const colors = [
    '#0f52ba', // primary
    '#00a6a6', // secondary
    '#ff8c00', // accent
    '#10b981', // success
    '#f59e0b', // warning
    '#ef4444', // error
  ];

  return Array.from({ length: count }, (_, i) => colors[i % colors.length]);
};

const MultichannelView: React.FC = () => {
  const { selectedFile, selectedFeatures, setSelectedFeatures } = useAppContext();
  const [chartData, setChartData] = useState<any>(null);

  useEffect(() => {
    if (selectedFile?.data && selectedFeatures.length > 0) {
      const totalPoints = selectedFile.data.length;
      const pointsToShow = Math.min(100, totalPoints);
      const step = Math.max(1, Math.floor(totalPoints / pointsToShow));

      // Create sampled data points
      const sampledData = selectedFile.data.filter((_, index) => index % step === 0);
      
      // Create labels (use row index or timestamp if available)
      const labels = sampledData.map((row: any) => {
        if (row.date) {
          const date = new Date(row.date);
          return date.toLocaleDateString();
        }
        return `Point ${index * step + 1}`;
      });

      // Create normalized datasets for each selected feature
      const datasets = selectedFeatures.map((feature, index) => {
        const values = sampledData.map((row: any) => row[feature] || 0);
        
        // Calculate min and max for normalization
        const min = Math.min(...values);
        const max = Math.max(...values);
        const range = max - min;
        
        // Normalize values to a 0-100 scale for better comparison
        const normalizedData = values.map(value => {
          if (range === 0) return 0;
          return ((value - min) / range) * 100;
        });

        const colors = generateColors(selectedFeatures.length);
        return {
          label: `${feature} (${min.toFixed(2)} - ${max.toFixed(2)})`,
          data: normalizedData,
          borderColor: colors[index],
          backgroundColor: `${colors[index]}33`,
          borderWidth: 2,
          pointRadius: 1,
          tension: 0.3,
          fill: false
        };
      });

      setChartData({ labels, datasets });
    } else {
      setChartData(null);
    }
  }, [selectedFile, selectedFeatures]);

  const handleFeatureChange = (features: string[]) => {
    setSelectedFeatures(features);
  };

  return (
    <PageContainer
      title="Multichannel View"
      description="Visualize and analyze your data across multiple channels"
    >
      {!selectedFile && (
        <div className="bg-white shadow rounded-lg p-6 text-center">
          <p className="text-gray-600 mb-4">
            No file selected. Please upload and select a CSV file first.
          </p>
          <Link to="/">
            <Button>Go to Data Ingestion</Button>
          </Link>
        </div>
      )}

      {selectedFile && (
        <div className="space-y-6">
          <section className="bg-white shadow rounded-lg p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">
              Data Features for: {selectedFile.name}
            </h2>
            {selectedFile.features && (
              <FeatureSelector
                features={selectedFile.features}
                selectedFeatures={selectedFeatures}
                onChange={handleFeatureChange}
              />
            )}
          </section>

          <section className="bg-white shadow rounded-lg p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Feature Visualization</h2>
            {chartData ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between mb-4">
                  <div className="text-sm text-gray-500">
                    <p>* Values are normalized to 0-100 scale for better comparison</p>
                    <p>* Original ranges shown in legend</p>
                  </div>
                  <span className="text-sm text-gray-500">
                    Showing {Math.min(100, selectedFile.data.length)} data points
                  </span>
                </div>
                <ChartContainer
                  type="line"
                  data={chartData}
                  height={500}
                />
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <p>
                  {selectedFeatures.length === 0
                    ? 'Please select at least one feature to visualize'
                    : 'No data available for the selected features'}
                </p>
              </div>
            )}
          </section>
        </div>
      )}
    </PageContainer>
  );
};

export default MultichannelView;