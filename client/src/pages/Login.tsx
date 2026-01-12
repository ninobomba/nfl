import { useState, useRef, useEffect } from 'react';
import { useAppDispatch } from '../store/hooks';
import { setCredentials } from '../store/slices/authSlice';
import { useNavigate, useSearchParams } from 'react-router-dom';
import api from '../api/axios';
import { Card } from 'primereact/card';
import { InputText } from 'primereact/inputtext';
import { Password } from 'primereact/password';
import { Button } from 'primereact/button';
import { Divider } from 'primereact/divider';
import { Dropdown } from 'primereact/dropdown';
import { Toast } from 'primereact/toast';
import { useTranslation } from 'react-i18next';

interface LoginProps {
    isAdminLogin?: boolean;
}

const Login = ({ isAdminLogin = false }: LoginProps) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { t, i18n } = useTranslation();
  const toast = useRef<Toast>(null);

  useEffect(() => {
    const token = searchParams.get('token');
    const error = searchParams.get('error');

    if (error) {
        toast.current?.show({severity:'error', summary: 'Login Failed', detail: error, life: 3000});
    }

    if (token) {
        const fetchUser = async () => {
            try {
                const response = await api.get('/api/auth/me', {
                    headers: { Authorization: `Bearer ${token}` }
                });
                dispatch(setCredentials({ token, user: response.data.user }));
                navigate('/picks');
            } catch (error) {
                console.error('Failed to fetch user with token:', error);
                toast.current?.show({severity:'error', summary: 'Login Error', detail: 'Invalid or expired token', life: 3000});
            }
        };
        fetchUser();
    }
  }, [searchParams, dispatch, navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await api.post('/api/auth/login', {
        username,
        password,
      });
      
      const { user } = response.data;
      dispatch(setCredentials(response.data));
      
      if (user.role === 'ADMIN') {
          navigate('/admin');
      } else {
          navigate('/picks');
      }
    } catch (error: unknown) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const err = error as any;
      if (!err.response) {
          toast.current?.show({severity:'error', summary: 'Network Error', detail: 'Is the server running?', life: 3000});
      } else {
          const msg = err.response.data?.message || 'Login failed';
          toast.current?.show({severity:'error', summary: 'Error', detail: msg, life: 3000});
      }
    }
  };

  const langOptions = [
      { label: 'English (EN)', value: 'en' },
      { label: 'Español (ES)', value: 'es' }
  ];

  const title = (
      <div className="flex flex-col items-center gap-8 mb-6">
          <img 
            src="/images/nfl-logo-60x80.png" 
            alt="NFL Logo" 
            className="w-16 h-20"
          />
          <span className="text-3xl font-black italic tracking-tighter text-white">
              {isAdminLogin ? t('landing.adminPortal') : t('landing.signin')}
          </span>
      </div>
  );

  return (
    <div className="min-h-screen flex flex-col surface-ground font-comfortaa">
      <Toast ref={toast} />
      {/* BARRA SUPERIOR FÍSICA (NO FLOTANTE) */}
      <header className="w-full surface-card border-b border-gray-800 shadow-1 py-2 px-4 md:px-8 flex justify-end items-center z-50">
          <div className="flex items-center gap-3">
              <i className="pi pi-globe text-gray-500 text-xs"></i>
              <Dropdown 
                value={i18n.language.split('-')[0]} 
                options={langOptions} 
                onChange={(e) => i18n.changeLanguage(e.value)} 
                className="w-12rem border-none bg-transparent p-inputtext-sm font-bold"
              />
          </div>
      </header>

      {/* ÁREA DE CONTENIDO */}
      <div className="flex-grow flex items-center justify-center p-4">
          <Card title={title} className="w-full max-w-[450px] shadow-lg border-none px-4 py-4">
            <form onSubmit={handleLogin} className="flex flex-col gap-6 p-fluid">
              <div className="flex flex-col gap-4">
                <label htmlFor="username" className="font-bold text-xs text-gray-500">{t('landing.username')}</label>
                <InputText 
                    id="username" 
                    value={username} 
                    onChange={(e) => setUsername(e.target.value)} 
                    placeholder={t('landing.username')}
                    className="p-3"
                />
              </div>
              <div className="flex flex-col gap-4">
                <label htmlFor="password" title="password" className="font-bold text-xs text-gray-500">{t('landing.password')}</label>
                <Password 
                    id="password" 
                    value={password} 
                    onChange={(e) => setPassword(e.target.value)} 
                    feedback={false} 
                    placeholder={t('landing.password')}
                    toggleMask
                    inputClassName="p-3"
                />
                <div className="text-right mt-1">
                    <Button label={t('landing.forgotPassword')} link onClick={() => navigate('/forgot-password')} type="button" className="text-xs font-bold p-0 opacity-60" />
                </div>
              </div>
              
              <Button label={isAdminLogin ? t('landing.adminPortal') : t('landing.signin')} icon="pi pi-sign-in" className="mt-4 py-3 shadow-4" />
              
              {!isAdminLogin && (
                  <>
                    <Button 
                        label="Continue with Facebook" 
                        icon="pi pi-facebook" 
                        className="mt-2 py-3 shadow-4 bg-blue-600 border-blue-600 hover:bg-blue-700" 
                        type="button"
                        onClick={() => window.location.href = `${import.meta.env.VITE_API_URL || 'http://localhost:3000'}/api/auth/facebook`}
                    />

                    <Divider align="center" className="my-4">
                        <span className="p-tag text-xs text-gray-400 bg-transparent tracking-widest">{t('landing.or')}</span>
                    </Divider>
                    
                    <div className="text-center">
                        <Button 
                            label={t('landing.register')} 
                            link 
                            onClick={() => navigate('/register')} 
                            type="button"
                            className="font-bold"
                        />
                    </div>
                  </>
              )}

              {isAdminLogin && (
                  <div className="text-center mt-4">
                      <Button 
                        label="Back" 
                        link 
                        onClick={() => navigate('/')} 
                        type="button"
                        icon="pi pi-arrow-left"
                        className="font-bold"
                      />
                  </div>
              )}
            </form>
          </Card>
      </div>
    </div>
  );
};

export default Login;