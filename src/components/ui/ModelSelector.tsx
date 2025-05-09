import React from 'react';
import { ModelOption } from '../../types';
import { defaultModels } from '../../contexts/AppContext';

interface ModelSelectorProps {
  selectedModel: ModelOption | null;
  onChange: (model: ModelOption) => void;
}

const ModelSelector: React.FC<ModelSelectorProps> = ({ selectedModel, onChange }) => {
  return (
    <div className="border rounded-lg p-4">
      <h3 className="text-lg font-medium mb-4">Select Model</h3>
      <div className="grid grid-cols-1 gap-3">
        {defaultModels.map((model) => (
          <div
            key={model.id}
            className={`border rounded-md p-3 cursor-pointer transition-colors ${
              selectedModel?.id === model.id
                ? 'border-primary-500 bg-primary-50'
                : 'border-gray-200 hover:border-gray-300'
            }`}
            onClick={() => onChange(model)}
          >
            <div className="flex items-center">
              <input
                type="radio"
                id={`model-${model.id}`}
                name="model"
                checked={selectedModel?.id === model.id}
                onChange={() => onChange(model)}
                className="h-4 w-4 text-primary-500 focus:ring-primary-500 border-gray-300"
              />
              <label
                htmlFor={`model-${model.id}`}
                className="ml-2 block text-sm font-medium text-gray-700"
              >
                {model.name}
              </label>
            </div>
            <p className="mt-1 text-sm text-gray-500 ml-6">{model.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ModelSelector;