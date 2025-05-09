import React from 'react';
import { useAppContext } from '../../contexts/AppContext';

interface FeatureSelectorProps {
  features: string[];
  selectedFeatures: string[];
  onChange: (features: string[]) => void;
}

const FeatureSelector: React.FC<FeatureSelectorProps> = ({
  features,
  selectedFeatures,
  onChange,
}) => {
  const handleToggleFeature = (feature: string) => {
    const isSelected = selectedFeatures.includes(feature);
    let newSelected: string[];

    if (isSelected) {
      newSelected = selectedFeatures.filter((f) => f !== feature);
    } else {
      newSelected = [...selectedFeatures, feature];
    }

    onChange(newSelected);
  };

  const handleSelectAll = () => {
    onChange([...new Set(features)]);
  };

  const handleDeselectAll = () => {
    onChange([]);
  };

  return (
    <div className="border rounded-lg p-4">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-medium">Select Features</h3>
        <div className="space-x-2">
          <button
            onClick={handleSelectAll}
            className="text-primary-500 text-sm hover:underline"
          >
            Select All
          </button>
          <button
            onClick={handleDeselectAll}
            className="text-gray-500 text-sm hover:underline"
          >
            Deselect All
          </button>
        </div>
      </div>
      <div className="max-h-64 overflow-y-auto grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
        {[...new Set(features)].map((feature) => (
          <div key={`feature-${feature}`} className="flex items-center">
            <input
              type="checkbox"
              id={`feature-${feature}`}
              checked={selectedFeatures.includes(feature)}
              onChange={() => handleToggleFeature(feature)}
              className="h-4 w-4 rounded border-gray-300 text-primary-500 focus:ring-primary-500"
            />
            <label
              htmlFor={`feature-${feature}`}
              className="ml-2 text-sm font-medium text-gray-700 truncate"
            >
              {feature}
            </label>
          </div>
        ))}
      </div>
      <div className="mt-3 text-sm text-gray-500">
        {selectedFeatures.length} of {new Set(features).size} features selected
      </div>
    </div>
  );
};

export default FeatureSelector;