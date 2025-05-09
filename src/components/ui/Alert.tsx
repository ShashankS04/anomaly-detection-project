import React from 'react';
import { AlertMessage } from '../../types';
import { X } from 'lucide-react';

interface AlertProps {
  alert: AlertMessage;
  onClose: (id: string) => void;
}

const Alert: React.FC<AlertProps> = ({ alert, onClose }) => {
  const { id, type, message } = alert;

  const alertStyles = {
    success: 'bg-success-500 text-white',
    error: 'bg-error-500 text-white',
    warning: 'bg-warning-500 text-white',
    info: 'bg-blue-500 text-white',
  };

  return (
    <div
      className={`${alertStyles[type]} p-4 rounded-md shadow-md flex items-center justify-between animate-slide-in`}
    >
      <p>{message}</p>
      <button
        onClick={() => onClose(id)}
        className="ml-4 text-white hover:text-gray-200 focus:outline-none"
        aria-label="Close alert"
      >
        <X size={18} />
      </button>
    </div>
  );
};

export default Alert;