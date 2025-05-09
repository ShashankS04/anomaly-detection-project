import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { CsvFile, AlertMessage, ModelOption, AnomalyData } from '../types';
import { supabase } from '../lib/supabase';
import { User } from '@supabase/supabase-js';

interface AppContextType {
  files: CsvFile[];
  alerts: AlertMessage[];
  selectedFile: CsvFile | null;
  selectedFeatures: string[];
  selectedModel: ModelOption | null;
  anomalyData: AnomalyData[] | null;
  user: User | null;
  addFile: (file: CsvFile) => void;
  removeFile: (fileId: string) => void;
  addAlert: (alert: Omit<AlertMessage, 'id'>) => void;
  removeAlert: (alertId: string) => void;
  setSelectedFile: (file: CsvFile | null) => void;
  setSelectedFeatures: (features: string[]) => void;
  setSelectedModel: (model: ModelOption | null) => void;
  setAnomalyData: (data: AnomalyData[] | null) => void;
  parseCSV: (content: string) => { headers: string[]; data: any[] };
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const defaultModels: ModelOption[] = [
  {
    id: 'isolation-forest',
    name: 'Isolation Forest',
    description: 'Effective for detecting anomalies in high-dimensional datasets using isolation techniques',
  },
  {
    id: 'knn',
    name: 'K-Nearest Neighbors',
    description: 'Identifies anomalies by measuring the distance to k nearest neighbors in the feature space',
  },
  {
    id: 'pca',
    name: 'Principal Component Analysis',
    description: 'Detects anomalies by analyzing deviations in the principal components of the data',
  },
];

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [files, setFiles] = useState<CsvFile[]>([]);
  const [alerts, setAlerts] = useState<AlertMessage[]>([]);
  const [selectedFile, setSelectedFile] = useState<CsvFile | null>(null);
  const [selectedFeatures, setSelectedFeatures] = useState<string[]>([]);
  const [selectedModel, setSelectedModel] = useState<ModelOption | null>(null);
  const [anomalyData, setAnomalyData] = useState<AnomalyData[] | null>(null);
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const addFile = (file: CsvFile) => {
    setFiles((prevFiles) => [...prevFiles, file]);
  };

  const removeFile = (fileId: string) => {
    setFiles((prevFiles) => prevFiles.filter((file) => file.id !== fileId));
    if (selectedFile?.id === fileId) {
      setSelectedFile(null);
      setAnomalyData(null);
    }
  };

  const addAlert = (alert: Omit<AlertMessage, 'id'>) => {
    const newAlert = {
      ...alert,
      id: Date.now().toString(),
    };
    setAlerts((prevAlerts) => [...prevAlerts, newAlert]);
    
    setTimeout(() => {
      removeAlert(newAlert.id);
    }, 5000);
  };

  const removeAlert = (alertId: string) => {
    setAlerts((prevAlerts) => prevAlerts.filter((alert) => alert.id !== alertId));
  };

  const parseCSV = (content: string) => {
    const lines = content.split('\n');
    const headers = lines[0].toLowerCase().split(',').map(header => header.trim());
    
    // Normalize header names to match required format
    const normalizedHeaders = headers.map(header => {
      if (header.includes('usage') && header.includes('kwh')) return 'usage_kwh';
      if (header.includes('co2') && header.includes('tco2')) return 'co2_tco2';
      if (header.includes('power') && header.includes('factor')) return 'power_factor';
      if (header.includes('date') || header.includes('time')) return 'date';
      return header;
    });
    
    const data = lines.slice(1)
      .filter(line => line.trim() !== '')
      .map(line => {
        const values = line.split(',').map(value => value.trim());
        const row: Record<string, string | number> = {};
        
        normalizedHeaders.forEach((header, index) => {
          const value = values[index];
          if (header === 'date') {
            // Try to parse and format the date
            try {
              const date = new Date(value);
              if (!isNaN(date.getTime())) {
                row[header] = date.toISOString().split('.')[0].replace('T', ' ');
              } else {
                row[header] = value;
              }
            } catch {
              row[header] = value;
            }
          } else {
            const numValue = Number(value);
            row[header] = isNaN(numValue) ? value : numValue;
          }
        });
        
        return row;
      });
    
    return { headers: normalizedHeaders, data };
  };

  return (
    <AppContext.Provider
      value={{
        files,
        alerts,
        selectedFile,
        selectedFeatures,
        selectedModel,
        anomalyData,
        user,
        addFile,
        removeFile,
        addAlert,
        removeAlert,
        setSelectedFile,
        setSelectedFeatures,
        setSelectedModel,
        setAnomalyData,
        parseCSV,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};