import React, { useState, useRef, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, Activity, LogIn, LogOut, UserCircle, ChevronDown, TrendingUp } from 'lucide-react';
import { useAppContext } from '../../contexts/AppContext';
import AuthModal from '../auth/AuthModal';
import Button from '../ui/Button';
import { supabase } from '../../lib/supabase';

interface NavItem {
  name: string;
  path: string;
  icon?: React.ReactNode;
}

const navItems: NavItem[] = [
  { name: 'Data Ingestion', path: '/' },
  { name: 'Multichannel View', path: '/multichannel' },
  { name: 'Model Training', path: '/model-training' },
  { name: 'Analytics', path: '/analytics', icon: <TrendingUp size={16} /> },
  { name: 'Alerts', path: '/alerts' },
  { name: 'FMEA', path: '/fmea' },
];

const NavBar: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const location = useLocation();
  const { user, addAlert } = useAppContext();
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsProfileDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const handleSignOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      setShowLogoutConfirm(false);
      addAlert({
        type: 'success',
        message: 'Successfully signed out',
      });
    } catch (error: any) {
      addAlert({
        type: 'error',
        message: error.message || 'Failed to sign out',
      });
    }
  };

  const LogoutConfirmation = () => (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center px-4">
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"></div>
        <div className="relative bg-white rounded-lg p-6 max-w-sm w-full">
          <h3 className="text-lg font-medium mb-4">Confirm Logout</h3>
          <p className="text-gray-600 mb-6">Are you sure you want to log out?</p>
          <div className="flex justify-end space-x-3">
            <Button
              variant="outline"
              onClick={() => setShowLogoutConfirm(false)}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={handleSignOut}
              icon={<LogOut size={16} />}
            >
              Logout
            </Button>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <>
      <nav className="bg-white shadow-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Link to="/" className="flex-shrink-0 flex items-center">
                <Activity className="h-8 w-8 text-primary-500" />
                <span className="ml-2 text-xl font-bold text-gray-900">
                  Smart Anomaly Detection
                </span>
              </Link>
            </div>

            {/* Desktop navigation */}
            <div className="hidden md:flex md:items-center md:space-x-4">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    location.pathname === item.path
                      ? 'bg-primary-50 text-primary-600'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                >
                  {item.name}
                </Link>
              ))}
              {user ? (
                <div className="relative" ref={dropdownRef}>
                  <button
                    onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
                    className="flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                  >
                    <UserCircle className="h-6 w-6" />
                    <span>{user.email}</span>
                    <ChevronDown className="h-4 w-4" />
                  </button>
                  
                  {isProfileDropdownOpen && (
                    <div className="absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5">
                      <div className="py-1">
                        <div className="px-4 py-2 text-sm text-gray-700 border-b">
                          Signed in as<br />
                          <span className="font-medium">{user.email}</span>
                        </div>
                        <button
                          onClick={() => {
                            setIsProfileDropdownOpen(false);
                            setShowLogoutConfirm(true);
                          }}
                          className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
                        >
                          <LogOut className="h-4 w-4 mr-2" />
                          Sign out
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsAuthModalOpen(true)}
                  icon={<LogIn size={16} />}
                >
                  Sign In
                </Button>
              )}
            </div>

            {/* Mobile menu button */}
            <div className="flex items-center md:hidden">
              <button
                onClick={toggleMenu}
                className="inline-flex items-center justify-center p-2 rounded-md text-gray-500 hover:text-gray-900 hover:bg-gray-100 focus:outline-none focus:bg-gray-100 focus:text-gray-900"
              >
                {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile menu */}
        {isMenuOpen && (
          <div className="md:hidden absolute w-full bg-white shadow-lg">
            <div className="pt-2 pb-3 space-y-1">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`block px-3 py-2 rounded-md text-base font-medium ${
                    location.pathname === item.path
                      ? 'bg-primary-50 text-primary-600'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  {item.name}
                </Link>
              ))}
              {user ? (
                <div className="px-3 py-2 space-y-2">
                  <div className="flex items-center text-sm text-gray-600">
                    <UserCircle className="h-5 w-5 mr-2" />
                    {user.email}
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setIsMenuOpen(false);
                      setShowLogoutConfirm(true);
                    }}
                    className="w-full"
                    icon={<LogOut size={16} />}
                  >
                    Sign Out
                  </Button>
                </div>
              ) : (
                <div className="px-3 py-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setIsAuthModalOpen(true);
                      setIsMenuOpen(false);
                    }}
                    className="w-full"
                    icon={<LogIn size={16} />}
                  >
                    Sign In
                  </Button>
                </div>
              )}
            </div>
          </div>
        )}
      </nav>

      <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />
      {showLogoutConfirm && <LogoutConfirmation />}
    </>
  );
};

export default NavBar;