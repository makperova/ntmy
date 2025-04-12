import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import { supabase } from '../../lib/supabase';
import Link from 'next/link';
import { FiHome, FiSettings, FiBarChart2, FiUser, FiLock } from 'react-icons/fi';

const SettingsPage: React.FC = () => {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: ''
  });
  const [registrationDate, setRegistrationDate] = useState<string | null>(null);
  const [lastPasswordChange, setLastPasswordChange] = useState<string | null>(null);
  const [emailVerified, setEmailVerified] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveError, setSaveError] = useState('');

  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        router.push('/signin');
        return;
      }
      
      setUser(session.user);
      
      // Установка начальных значений формы
      const userName = session.user.user_metadata?.name || '';
      const nameParts = userName.split(' ');
      
      setFormData({
        firstName: nameParts[0] || '',
        lastName: nameParts.slice(1).join(' ') || '',
        email: session.user.email || ''
      });
      
      setEmailVerified(session.user.email_confirmed_at !== null);
      
      // Устанавливаем дату регистрации и последнего изменения пароля
      if (session.user.created_at) {
        const createdDate = new Date(session.user.created_at);
        setRegistrationDate(
          `${String(createdDate.getDate()).padStart(2, '0')}.${String(createdDate.getMonth() + 1).padStart(2, '0')}.${createdDate.getFullYear()}`
        );
        setLastPasswordChange(
          `${String(createdDate.getDate()).padStart(2, '0')}.${String(createdDate.getMonth() + 1).padStart(2, '0')}.${createdDate.getFullYear()}`
        );
      }
      
      setLoading(false);
    };
    
    checkUser();
    
    // Определение мобильного устройства
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [router]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSaveSuccess(false);
    setSaveError('');

    try {
      const fullName = `${formData.firstName} ${formData.lastName}`.trim();
      const { error } = await supabase.auth.updateUser({
        data: { 
          name: fullName
        }
      });

      if (error) throw error;
      
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (error: any) {
      console.error('Error updating profile:', error);
      setSaveError(error.message || 'Failed to save changes. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteAccount = async () => {
    const confirmed = confirm('Are you sure you want to delete your account? This action cannot be undone.');
    
    if (confirmed) {
      try {
        // В реальном приложении здесь был бы запрос на API для удаления аккаунта
        alert('The account deletion function will be implemented in the next update.');
      } catch (error: any) {
        alert('An error occurred while trying to delete the account.');
      }
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/signin');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  // Mobile version
  if (isMobile) {
  return (
      <div className="flex flex-col min-h-screen bg-gray-50">
      <Head>
          <title>Settings | NTMY</title>
          <meta name="description" content="Manage your profile settings" />
      </Head>

        <header className="bg-white p-4 border-b border-gray-200 flex items-center justify-between sticky top-0 z-10">
          <div>
            <h1 className="text-xl font-medium text-gray-800">Settings</h1>
            <p className="text-sm text-gray-500">Manage your profile</p>
          </div>
        </header>
        
        <main className="flex-1 p-4 pb-20">
          <div className="space-y-4">
            <form onSubmit={handleSubmit}>
              <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200 space-y-4">
                <h2 className="text-lg font-medium text-gray-800">Profile</h2>
                
                {saveSuccess && (
                  <div className="bg-green-50 p-3 rounded-lg text-green-700 text-sm">
                    Profile updated successfully!
                  </div>
                )}
                
                {saveError && (
                  <div className="bg-red-50 p-3 rounded-lg text-red-700 text-sm">
                    {saveError}
                  </div>
                )}
                
                <div>
                  <label htmlFor="firstName" className="block text-sm font-medium text-gray-500 mb-1">
                    First Name
                  </label>
                  <input
                    type="text"
                    id="firstName"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleChange}
                    className="block w-full px-3 py-2 rounded-lg bg-white border border-gray-200 text-gray-900 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="John"
                  />
                </div>
                
                <div>
                  <label htmlFor="lastName" className="block text-sm font-medium text-gray-500 mb-1">
                    Last Name
                  </label>
                  <input
                    type="text"
                    id="lastName"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleChange}
                    className="block w-full px-3 py-2 rounded-lg bg-white border border-gray-200 text-gray-900 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Doe"
                  />
                </div>
                
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-500 mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    disabled
                    className="block w-full px-3 py-2 rounded-lg bg-gray-50 border border-gray-200 text-gray-400"
                    placeholder="example@email.com"
                  />
          </div>
          
                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={saving}
                    className="w-full px-4 py-2 bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 text-white font-medium"
                  >
                    {saving ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              </div>
            </form>
            
            <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200 space-y-4">
              <h2 className="text-lg font-medium text-gray-800">Account Information</h2>
              
              <div className="space-y-2">
                <div>
                  <p className="text-sm text-gray-500">Username</p>
                  <p className="font-medium">{user.email.split('@')[0] || 'Not set'}</p>
                </div>
                
                <div>
                  <p className="text-sm text-gray-500">Email Status</p>
                  <p className={`font-medium ${emailVerified ? 'text-green-600' : 'text-yellow-600'}`}>
                    {emailVerified ? 'Verified' : 'Not Verified'}
                  </p>
                </div>
                
                <div>
                  <p className="text-sm text-gray-500">Registered On</p>
                  <p className="font-medium">{registrationDate || 'N/A'}</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200 space-y-4">
              <h2 className="text-lg font-medium text-gray-800">Security</h2>
              
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Password</p>
                    <p className="text-sm text-gray-500">Last changed: {lastPasswordChange || 'N/A'}</p>
          </div>
            <button 
                    className="px-3 py-1.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                    onClick={() => alert('Password change will be implemented in the next update.')}
            >
                    Change
            </button>
          </div>
        </div>
      </div>

            <div className="bg-white rounded-xl p-4 shadow-sm border border-red-100 space-y-4">
              <h2 className="text-lg font-medium text-red-600">Dangerous Zone</h2>
              
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-gray-800">Delete Account</p>
                    <p className="text-sm text-gray-500">This action cannot be undone.</p>
                  </div>
                  <button 
                    className="px-3 py-1.5 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors"
                    onClick={handleDeleteAccount}
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          </div>
        </main>
        
        {/* Bottom Navigation Menu */}
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 h-16 flex justify-around items-center z-20">
          <Link href="/admin/dashboard" className="flex flex-col items-center justify-center text-gray-500 hover:text-blue-600">
            <FiHome className="w-6 h-6" />
            <span className="text-xs mt-1">Home</span>
          </Link>
          <Link href="/admin/analytics" className="flex flex-col items-center justify-center text-gray-500 hover:text-blue-600">
            <FiBarChart2 className="w-6 h-6" />
            <span className="text-xs mt-1">Analytics</span>
          </Link>
          <Link href="/admin/settings" className="flex flex-col items-center justify-center text-blue-600">
            <FiSettings className="w-6 h-6" />
            <span className="text-xs mt-1">Settings</span>
          </Link>
        </div>
      </div>
    );
  }

  // Desktop version
  return (
    <div className="min-h-screen flex bg-gray-50">
      <Head>
        <title>Settings | NTMY</title>
        <meta name="description" content="Manage your profile settings" />
      </Head>
      
      {/* Боковая панель */}
      <div className="w-16 bg-white shadow-sm min-h-screen fixed left-0 top-0 bottom-0">
        <div className="flex flex-col items-center py-8 h-full">
          <div className="mb-12">
            <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-medium">
              ntmy
            </div>
          </div>
          
          <div className="flex-1 flex flex-col items-center space-y-6">
            <Link href="/admin/dashboard" className="p-2 text-gray-400 hover:text-blue-500">
              <FiHome className="h-6 w-6" />
            </Link>
            
            <Link href="/admin/analytics" className="p-2 text-gray-400 hover:text-blue-500">
              <FiBarChart2 className="h-6 w-6" />
            </Link>
            
            <Link href="/admin/settings" className="p-2 text-blue-500">
              <FiSettings className="h-6 w-6" />
            </Link>
          </div>
          
          <div className="mt-6 mb-8">
            <button 
              onClick={handleLogout}
              className="p-2 text-gray-400 hover:text-red-500 transition-colors"
              title="Выйти"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
            </button>
          </div>
        </div>
      </div>
      
      {/* Основной контент */}
      <div className="ml-16 w-full">
        <div className="max-w-3xl mx-auto py-10 px-6">
          <h1 className="text-2xl font-medium text-gray-800 mb-6">Settings</h1>
          
          <div className="space-y-6">
            <form onSubmit={handleSubmit}>
              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 space-y-6">
                <h2 className="text-xl font-medium text-gray-800">Profile</h2>
                <p className="text-gray-500 mb-6">Manage your personal information</p>
                
                  <div>
                    <label htmlFor="firstName" className="block text-sm font-medium text-gray-500 mb-1">
                    First Name
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                      </div>
                      <input
                        type="text"
                        id="firstName"
                        name="firstName"
                        value={formData.firstName}
                        onChange={handleChange}
                        className="block w-full pl-10 px-3 py-3 rounded-xl bg-white border border-gray-200 text-gray-900 focus:ring-blue-500 focus:border-blue-500 shadow-sm"
                      placeholder="John"
                      />
                  </div>
                  </div>
                  
                  <div>
                    <label htmlFor="lastName" className="block text-sm font-medium text-gray-500 mb-1">
                    Last Name
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <FiUser className="text-gray-400" />
                      </div>
                      <input
                        type="text"
                        id="lastName"
                        name="lastName"
                        value={formData.lastName}
                        onChange={handleChange}
                        className="block w-full pl-10 px-3 py-3 rounded-xl bg-white border border-gray-200 text-gray-900 focus:ring-blue-500 focus:border-blue-500 shadow-sm"
                      placeholder="Doe"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-500 mb-1">
                      Email
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                      </div>
                      <input
                        type="email"
                        id="email"
                        name="email"
                        value={formData.email}
                        disabled
                        className="block w-full pl-10 px-3 py-3 rounded-xl bg-gray-50 border border-gray-200 text-gray-400 shadow-sm"
                        placeholder="example@email.com"
                      />
                      {emailVerified && (
                        <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                          <div className="text-green-500 flex items-center">
                            <svg className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                          <span className="text-xs">Verified</span>
                        </div>
                        </div>
                      )}
                  </div>
                  </div>

                  <div className="pt-4">
                    <button
                      type="submit"
                      disabled={saving}
                      className="w-full px-4 py-3 bg-blue-600 rounded-xl hover:bg-blue-700 transition-colors disabled:opacity-50 text-white shadow-sm font-medium"
                    >
                    {saving ? 'Saving...' : 'Save Changes'}
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
    </div>
  );
};

export default SettingsPage; 