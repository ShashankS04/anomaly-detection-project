import React, { useState } from 'react';
import PageContainer from '../components/layout/PageContainer';
import { useAppContext } from '../contexts/AppContext';
import FileList from '../components/ui/FileList';
import ModelSelector from '../components/ui/ModelSelector';
import Button from '../components/ui/Button';
import { Play, CheckCircle, AlertCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';

const ModelTraining: React.FC = () => {
  const {
    files,
    selectedFile,
    setSelectedFile,
    selectedModel,
    setSelectedModel,
    addAlert,
    setAnomalyData,
    anomalyData,
  } = useAppContext();

  const [trainingStatus, setTrainingStatus] = useState<
    'idle' | 'training' | 'success' | 'error'
  >('idle');
  const [progress, setProgress] = useState(0);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleFileSelect = (file: any) => {
    setSelectedFile(file);
    setTrainingStatus('idle');
    setProgress(0);
    setErrorMessage(null);
  };

  const handleModelSelect = (model: any) => {
    setSelectedModel(model);
    setTrainingStatus('idle');
    setProgress(0);
    setErrorMessage(null);
  };

  const validateTrainingData = () => {
    if (!selectedFile?.features || selectedFile.features.length === 0) {
      throw new Error('Selected file has no features to analyze');
    }

    if (!selectedFile?.data || selectedFile.data.length === 0) {
      throw new Error('Selected file contains no data');
    }

    const requiredFeatures = ['usage_kwh', 'co2_tco2', 'power_factor'];
    const missingFeatures = requiredFeatures.filter(
      feature => !selectedFile.features.includes(feature)
    );

    if (missingFeatures.length > 0) {
      throw new Error(
        `Missing required features: ${missingFeatures.join(', ')}`
      );
    }
  };

  const handleTrainModel = async () => {
    try {
      if (!selectedFile) {
        throw new Error('Please select a file for training');
      }

      if (!selectedModel) {
        throw new Error('Please select a model for training');
      }

      validateTrainingData();

      setTrainingStatus('training');
      setProgress(25);
      setErrorMessage(null);

      // Create CSV content from the selected file
      const csvContent = selectedFile.features?.join(',') + '\n' +
        selectedFile.data?.map(row => 
          selectedFile.features?.map(feature => row[feature]).join(',')
        ).join('\n');

      setProgress(50);

      // Call the Supabase Edge Function for model training
      const { data: anomalies, error: functionError } = await supabase.functions.invoke('train', {
        body: {
          csvContent,
          modelType: selectedModel.id,
          fileId: selectedFile.id
        }
      });

      if (functionError) {
        throw new Error(`Model training failed: ${functionError.message}`);
      }

      if (!anomalies) {
        throw new Error('No response from training function');
      }

      if (!Array.isArray(anomalies)) {
        throw new Error('Invalid response format from training function');
      }

      setProgress(75);

      // Store anomalies in the database
      const { error: insertError } = await supabase
        .from('anomalies')
        .insert(anomalies.map(anomaly => ({
          date: anomaly.date,
          usage_kwh: anomaly.Usage_kWh,
          co2_tco2: anomaly['CO2(tCO2)'],
          power_factor: anomaly.Lagging_Current_Power_Factor,
          anomaly_label: anomaly.Anomaly_Label,
          fmea_diagnosis: anomaly.FMEA_Diagnosis,
          alert_level: anomaly.Alert_Level,
          file_id: selectedFile.id
        })));

      if (insertError) {
        throw new Error(`Failed to store anomalies: ${insertError.message}`);
      }

      setAnomalyData(anomalies);
      setTrainingStatus('success');
      setProgress(100);
      addAlert({
        type: 'success',
        message: `${selectedModel.name} model successfully trained on ${selectedFile.name}. Found ${anomalies.length} anomalies.`,
      });
    } catch (error) {
      console.error('Training error:', error);
      setTrainingStatus('error');
      setProgress(0);
      setErrorMessage(error.message);
      addAlert({
        type: 'error',
        message: error.message || 'An unexpected error occurred',
      });
    }
  };

  return (
    <PageContainer
      title="Model Training"
      description="Train anomaly detection models on your data"
    >
      <div className="space-y-6">
        <section className="bg-white shadow rounded-lg p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Select Training Data</h2>
          {files.length > 0 ? (
            <FileList
              files={files}
              onFileSelect={handleFileSelect}
              onFileDelete={() => {}}
              selectedFileId={selectedFile?.id}
            />
          ) : (
            <div className="text-center py-4">
              <p className="text-gray-600 mb-4">
                No files available. Please upload a CSV file first.
              </p>
              <Link to="/">
                <Button>Go to Data Ingestion</Button>
              </Link>
            </div>
          )}
        </section>

        <section className="bg-white shadow rounded-lg p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Model Selection</h2>
          <ModelSelector selectedModel={selectedModel} onChange={handleModelSelect} />
        </section>

        <section className="bg-white shadow rounded-lg p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Training Status</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">
                  {selectedFile
                    ? `Selected File: ${selectedFile.name}`
                    : 'No file selected'}
                </p>
                <p className="text-sm text-gray-500">
                  {selectedModel
                    ? `Selected Model: ${selectedModel.name}`
                    : 'No model selected'}
                </p>
              </div>
              <div className="flex items-center gap-2">
                {trainingStatus === 'success' && (
                  <CheckCircle size={20} className="text-success-500" />
                )}
                {trainingStatus === 'error' && (
                  <AlertCircle size={20} className="text-error-500" />
                )}
                <Button
                  onClick={handleTrainModel}
                  disabled={!selectedFile || !selectedModel || trainingStatus === 'training'}
                  icon={<Play size={16} />}
                >
                  {trainingStatus === 'training' ? 'Training...' : 'Train Model'}
                </Button>
              </div>
            </div>

            {trainingStatus === 'training' && (
              <div className="w-full bg-gray-200 rounded-full h-2.5">
                <div
                  className="bg-primary-500 h-2.5 rounded-full transition-all duration-300"
                  style={{ width: `${progress}%` }}
                ></div>
              </div>
            )}

            {trainingStatus === 'success' && (
              <div className="p-4 bg-success-50 text-success-700 rounded-lg">
                <p className="font-medium">Training Completed Successfully!</p>
                <p className="text-sm mt-1">
                  {anomalyData && anomalyData.length === 0
                    ? 'No anomalies were detected in the dataset.'
                    : 'The model has been trained and anomalies have been stored in the database. View results in the Alerts tab.'}
                </p>
              </div>
            )}

            {trainingStatus === 'error' && (
              <div className="p-4 bg-error-50 text-error-700 rounded-lg">
                <p className="font-medium">Training Failed</p>
                <p className="text-sm mt-1">
                  {errorMessage || 'There was an error training the model. Please try again.'}
                </p>
              </div>
            )}
          </div>
        </section>
      </div>
    </PageContainer>
  );
};

export default ModelTraining;