import React, { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload } from 'lucide-react';
import { CsvFile } from '../../types';
import { useAppContext } from '../../contexts/AppContext';

interface FileUploaderProps {
  onFileUpload: (file: CsvFile) => void;
}

const FileUploader: React.FC<FileUploaderProps> = ({ onFileUpload }) => {
  const { addAlert, parseCSV } = useAppContext();

  const validateHeaders = (headers: string[]) => {
    const requiredFeatures = ['usage_kwh', 'co2_tco2', 'power_factor'];
    const missingFeatures = requiredFeatures.filter(
      feature => !headers.includes(feature)
    );

    if (missingFeatures.length > 0) {
      throw new Error(
        `CSV file must contain the following columns: ${missingFeatures.join(', ')}. ` +
        'Please ensure your CSV has columns for energy usage (kWh), CO2 emissions (tCO2), and power factor.'
      );
    }
  };

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      acceptedFiles.forEach((file) => {
        const reader = new FileReader();

        reader.onload = () => {
          try {
            const content = reader.result as string;
            const { headers, data } = parseCSV(content);
            
            // Validate required headers
            validateHeaders(headers);
            
            const csvFile: CsvFile = {
              id: Date.now().toString(),
              name: file.name,
              size: file.size,
              lastModified: file.lastModified,
              features: headers,
              data: data,
            };
            
            onFileUpload(csvFile);
            addAlert({
              type: 'success',
              message: `File "${file.name}" successfully uploaded and parsed.`,
            });
          } catch (error) {
            addAlert({
              type: 'error',
              message: error.message || `Failed to parse file "${file.name}". Please check the file format.`,
            });
          }
        };

        reader.onerror = () => {
          addAlert({
            type: 'error',
            message: `Failed to read file "${file.name}".`,
          });
        };

        reader.readAsText(file);
      });
    },
    [onFileUpload, addAlert, parseCSV]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'text/csv': ['.csv'],
    },
    maxFiles: 1,
  });

  return (
    <div
      {...getRootProps()}
      className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
        isDragActive
          ? 'border-primary-500 bg-primary-50'
          : 'border-gray-300 hover:border-primary-300 hover:bg-gray-50'
      }`}
    >
      <input {...getInputProps()} />
      <div className="flex flex-col items-center justify-center gap-2">
        <Upload
          size={36}
          className={isDragActive ? 'text-primary-500' : 'text-gray-400'}
        />
        <p className="text-lg font-medium">
          {isDragActive ? 'Drop the CSV file here' : 'Drag & drop a CSV file here'}
        </p>
        <p className="text-sm text-gray-500">or click to select a file</p>
        <p className="text-xs text-gray-400 mt-2">
          CSV must include columns for: usage_kwh, co2_tco2, power_factor
        </p>
      </div>
    </div>
  );
};

export default FileUploader;