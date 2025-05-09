import React from 'react';
import { CsvFile } from '../../types';
import { FileText, Trash2 } from 'lucide-react';
import Button from './Button';

interface FileListProps {
  files: CsvFile[];
  onFileSelect: (file: CsvFile) => void;
  onFileDelete: (fileId: string) => void;
  selectedFileId?: string | null;
}

const FileList: React.FC<FileListProps> = ({
  files,
  onFileSelect,
  onFileDelete,
  selectedFileId,
}) => {
  if (files.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <p>No files uploaded yet. Upload a CSV file to get started.</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {files.map((file) => (
        <div
          key={file.id}
          className={`border rounded-lg p-4 flex items-center justify-between transition-colors ${
            selectedFileId === file.id
              ? 'border-primary-500 bg-primary-50'
              : 'border-gray-200 hover:border-gray-300'
          }`}
        >
          <div
            className="flex items-center cursor-pointer flex-1"
            onClick={() => onFileSelect(file)}
          >
            <FileText size={20} className="text-gray-400 mr-3" />
            <div>
              <p className="font-medium truncate">{file.name}</p>
              <p className="text-sm text-gray-500">
                {(file.size / 1024).toFixed(2)} KB • {file.features?.length || 0} features
              </p>
            </div>
          </div>
          <div className="flex gap-2 ml-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onFileSelect(file)}
              className={selectedFileId === file.id ? 'bg-primary-100' : ''}
            >
              {selectedFileId === file.id ? 'Selected' : 'Select'}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onFileDelete(file.id)}
              icon={<Trash2 size={16} className="text-error-500" />}
              className="text-error-500 hover:bg-error-50"
            >
              Delete
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default FileList;