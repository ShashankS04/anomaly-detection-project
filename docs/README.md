# Smart Anomaly Detection Platform Documentation

## Overview
The Smart Anomaly Detection Platform is a comprehensive web application designed to detect, analyze, and predict anomalies in industrial systems. It focuses on monitoring energy usage, CO₂ emissions, and power factor metrics to identify potential issues before they become critical problems.

## Getting Started

### Prerequisites
- Node.js (v18 or higher)
- npm (v9 or higher)
- Python 3.x (for ML models)

### Installation
1. Clone the repository
2. Install dependencies:
```bash
npm install
```
3. Set up environment variables in `.env`:
```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```
4. Start the development server:
```bash
npm run dev
```

## Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite
- **Styling**: TailwindCSS
- **State Management**: React Context API
- **Routing**: React Router DOM
- **Data Visualization**: Chart.js with react-chartjs-2
- **Icons**: Lucide React

### Backend Architecture
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **Serverless Functions**: Supabase Edge Functions
- **Real-time Updates**: Supabase Realtime

### Machine Learning Components
- **Algorithms**:
  - Isolation Forest
  - K-Nearest Neighbors
  - Principal Component Analysis
- **Libraries**:
  - NumPy
  - Pandas
  - Scikit-learn

## Features

### 1. Data Ingestion
- CSV file upload and validation
- Automatic feature detection
- Real-time data parsing
- Data preview and validation

### 2. Multichannel View
- Interactive time series visualization
- Multiple metric comparison
- Normalized data display
- Dynamic feature selection

### 3. Model Training
- Multiple algorithm options
- Real-time training status
- Progress tracking
- Model performance metrics

### 4. Anomaly Detection
- Real-time anomaly detection
- Severity classification
- FMEA diagnosis
- Alert generation

### 5. Analytics
- Predictive modeling
- Trend analysis
- Future anomaly prediction
- Performance metrics visualization

### 6. FMEA Analysis
- Failure mode identification
- Root cause analysis
- Recommended actions
- Severity assessment

## Security

### Authentication
- Email/password authentication
- Session management
- Protected routes
- Role-based access control

### Database Security
- Row Level Security (RLS)
- Secure API access
- Data encryption
- Access policies

## API Reference

### Edge Functions

#### 1. Train Model
```typescript
POST /functions/v1/train
Body: {
  csvContent: string,
  modelType: string,
  fileId: string
}
```

#### 2. Predict
```typescript
POST /functions/v1/predict
Body: {
  historicalData: DataPoint[],
  days: number
}
```

#### 3. Chat
```typescript
POST /functions/v1/chat
Body: {
  message: string,
  context?: {
    anomalyCount: number,
    recentAlerts: Alert[]
  }
}
```

## Database Schema

### Anomalies Table
```sql
CREATE TABLE anomalies (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz DEFAULT now(),
  date timestamptz NOT NULL,
  usage_kwh double precision NOT NULL,
  co2_tco2 double precision NOT NULL,
  power_factor double precision NOT NULL,
  anomaly_label text NOT NULL,
  fmea_diagnosis text NOT NULL,
  alert_level integer NOT NULL,
  file_id text NOT NULL
);
```

## Project Structure
```
project/
├── src/
│   ├── components/     # Reusable UI components
│   │   ├── auth/      # Authentication components
│   │   ├── chat/      # AI assistant components
│   │   ├── layout/    # Layout components
│   │   └── ui/        # Common UI components
│   ├── contexts/      # React contexts
│   ├── lib/           # Utility functions
│   ├── Models/        # ML model implementations
│   ├── pages/         # Route pages
│   └── types/         # TypeScript definitions
├── supabase/
│   ├── functions/     # Edge function implementations
│   └── migrations/    # Database migrations
└── public/            # Static assets
```

## Contributing
1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License
This project is licensed under the MIT License - see the LICENSE file for details.