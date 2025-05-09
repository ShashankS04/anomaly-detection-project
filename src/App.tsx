import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AppProvider } from './contexts/AppContext';
import AppLayout from './components/layout/AppLayout';
import DataIngestion from './pages/DataIngestion';
import MultichannelView from './pages/MultichannelView';
import ModelTraining from './pages/ModelTraining';
import Alerts from './pages/Alerts';
import FMEA from './pages/FMEA';
import Analytics from './pages/Analytics';

function App() {
  return (
    <AppProvider>
      <Router>
        <Routes>
          <Route path="/" element={<AppLayout />}>
            <Route index element={<DataIngestion />} />
            <Route path="multichannel" element={<MultichannelView />} />
            <Route path="model-training" element={<ModelTraining />} />
            <Route path="alerts" element={<Alerts />} />
            <Route path="fmea" element={<FMEA />} />
            <Route path="analytics" element={<Analytics />} />
          </Route>
        </Routes>
      </Router>
    </AppProvider>
  );
}

export default App;