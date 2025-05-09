import React from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import Button from './Button';
import { LogIn, LogOut } from 'lucide-react';
import { useAppContext } from '../../contexts/AppContext';

const AuthButton: React.FC = () => {
  const navigate = useNavigate();
  const { addAlert, user } = useAppContext();

  const handleSignIn = async () => {
    const { error } = await supabase.auth.signInWithPassword({
      email: 'demo@example.com',
      password: 'demo123',
    });

    if (error) {
      addAlert({
        type: 'error',
        message: error.message,
      });
    } else {
      addAlert({
        type: 'success',
        message: 'Successfully signed in',
      });
      navigate('/model-training');
    }
  };

  const handleSignOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      addAlert({
        type: 'error',
        message: error.message,
      });
    } else {
      addAlert({
        type: 'success',
        message: 'Successfully signed out',
      });
      navigate('/');
    }
  };

  return (
    <Button
      onClick={user ? handleSignOut : handleSignIn}
      variant="outline"
      icon={user ? <LogOut size={16} /> : <LogIn size={16} />}
    >
      {user ? 'Sign Out' : 'Sign In'}
    </Button>
  );
};

export default AuthButton;