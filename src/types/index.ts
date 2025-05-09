export interface CsvFile {
  id: string;
  name: string;
  size: number;
  lastModified: number;
  features?: string[];
  data?: any[];
}

export interface AlertMessage {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  message: string;
}

export interface ModelOption {
  id: string;
  name: string;
  description: string;
}

export interface ChartData {
  labels: string[];
  datasets: {
    label: string;
    data: number[];
    backgroundColor: string;
    borderColor: string;
    borderWidth: number;
  }[];
}

export interface AnomalyAlert {
  id: string;
  timestamp: string;
  rowId: number;
  featureValues: Record<string, number>;
  reason: string;
  severity: 'low' | 'medium' | 'high';
  score: number;
}

export interface AnomalyData {
  date: string;
  Usage_kWh: number;
  'CO2(tCO2)': number;
  Lagging_Current_Power_Factor: number;
  Anomaly_Label: string;
  FMEA_Diagnosis: string;
  Alert_Level: number;
}

export type SortDirection = 'asc' | 'desc';

export interface SortState {
  id: string;
  desc: boolean;
}