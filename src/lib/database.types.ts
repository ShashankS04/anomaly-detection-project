export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      anomalies: {
        Row: {
          id: string
          created_at: string
          date: string
          usage_kwh: number
          co2_tco2: number
          power_factor: number
          anomaly_label: string
          fmea_diagnosis: string
          alert_level: number
          file_id: string
        }
        Insert: {
          id?: string
          created_at?: string
          date: string
          usage_kwh: number
          co2_tco2: number
          power_factor: number
          anomaly_label: string
          fmea_diagnosis: string
          alert_level: number
          file_id: string
        }
        Update: {
          id?: string
          created_at?: string
          date?: string
          usage_kwh?: number
          co2_tco2?: number
          power_factor?: number
          anomaly_label?: string
          fmea_diagnosis?: string
          alert_level?: number
          file_id?: string
        }
      }
    }
  }
}