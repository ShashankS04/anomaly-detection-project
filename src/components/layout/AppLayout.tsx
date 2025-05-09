import React from 'react';
import { Outlet } from 'react-router-dom';
import NavBar from './NavBar';
import AlertContainer from '../ui/AlertContainer';
import ChatBot from '../chat/ChatBot';

const AppLayout: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <NavBar />
      <main className="pb-12">
        <Outlet />
      </main>
      <AlertContainer />
      <ChatBot />
    </div>
  );
};

export default AppLayout;