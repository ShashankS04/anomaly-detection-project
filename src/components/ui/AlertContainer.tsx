import React from 'react';
import Alert from './Alert';
import { useAppContext } from '../../contexts/AppContext';

const AlertContainer: React.FC = () => {
  const { alerts, removeAlert } = useAppContext();

  if (alerts.length === 0) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-md">
      {alerts.map((alert) => (
        <Alert key={alert.id} alert={alert} onClose={removeAlert} />
      ))}
    </div>
  );
};

export default AlertContainer;