import React from 'react';
import PageContainer from '../components/layout/PageContainer';
import FileUploader from '../components/ui/FileUploader';
import FileList from '../components/ui/FileList';
import { useAppContext } from '../contexts/AppContext';

const DataIngestion: React.FC = () => {
  const { files, addFile, removeFile, selectedFile, setSelectedFile } = useAppContext();

  const handleFileUpload = (file: any) => {
    addFile(file);
  };

  const handleFileSelect = (file: any) => {
    setSelectedFile(file);
  };

  const handleFileDelete = (fileId: string) => {
    removeFile(fileId);
  };

  return (
    <PageContainer
      title="Data Ingestion"
      description="Upload and manage your CSV data files for anomaly detection"
    >
      <div className="space-y-6">
        <section className="bg-white shadow rounded-lg p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Upload File</h2>
          <FileUploader onFileUpload={handleFileUpload} />
        </section>

        <section className="bg-white shadow rounded-lg p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Uploaded Files</h2>
          <FileList
            files={files}
            onFileSelect={handleFileSelect}
            onFileDelete={handleFileDelete}
            selectedFileId={selectedFile?.id}
          />
        </section>
      </div>
    </PageContainer>
  );
};

export default DataIngestion;