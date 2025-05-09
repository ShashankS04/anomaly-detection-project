import React from 'react';
import PageContainer from '../components/layout/PageContainer';
import { TestTube } from 'lucide-react';

const ModelTesting: React.FC = () => {
  return (
    <PageContainer
      title="Model Testing"
      description="Test and evaluate your trained anomaly detection models"
    >
      <div className="bg-white shadow rounded-lg p-6 flex items-center justify-center h-64">
        <div className="text-center">
          <TestTube size={48} className="text-primary-500 mx-auto mb-4" />
          <h2 className="text-xl font-medium text-gray-900 mb-2">
            Model Testing Module Coming Soon
          </h2>
          <p className="text-gray-500">
            This feature is currently under development. Check back later for updates.
          </p>
        </div>
      </div>
    </PageContainer>
  );
};

export default ModelTesting;