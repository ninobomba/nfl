import { useState, useRef, useEffect } from 'react';
import { useAppDispatch } from '../store/hooks';
import { setCredentials } from '../store/slices/authSlice';
import { useNavigate, useSearchParams } from 'react-router-dom';
import api from '../api/axios';
import { API_URL } from '../config';
import { Card } from 'primereact/card';
import { InputText } from 'primereact/inputtext';
import { Password } from 'primereact/password';
import { Button } from 'primereact/button';
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

  const header = (
      <div className="flex flex-col items-center gap-4 mb-2 mt-2">
          <img 
            src="/images/nfl-logo-60x80.png" 
            alt="NFL Logo" 
            className="w-14 h-auto drop-shadow-lg"
          />
          <div className="text-center">
            <h1 className="text-2xl font-black italic tracking-tighter text-white m-0">
                {isAdminLogin ? t('landing.adminPortal') : t('landing.signin')}
            </h1>
            {/*<p className="text-gray-500 text-sm mt-1 font-medium tracking-wide">*/}
            {/*    {t('landing.welcomeBack')}*/}
            {/*</p>*/}
          </div>
      </div>
  );

  return (
    <div className="min-h-screen flex flex-col bg-[#0f111a] font-comfortaa">
      <Toast ref={toast} />
      {/* HEADER */}
      <header className="w-full border-b border-gray-800/50 p-4 flex justify-end items-center z-50 absolute top-0 right-0 bg-transparent">
          <div className="flex items-center gap-2 bg-gray-900/50 px-3 py-1 rounded-full border border-gray-800 backdrop-blur-sm">
              <i className="pi pi-globe text-gray-400 text-xs"></i>
              <Dropdown 
                value={i18n.language.split('-')[0]} 
                options={langOptions} 
                onChange={(e) => i18n.changeLanguage(e.value)} 
                className="border-none bg-transparent p-0 text-xs font-bold w-24"
                panelClassName="text-xs"
              />
          </div>
      </header>

      {/* CONTENT */}
      <div className="flex-grow flex items-center justify-center p-4">
          <Card className="w-full max-w-[420px] shadow-2xl border border-gray-800 rounded-2xl bg-[#161b2b] p-2">
            {header}
            <div className="px-2 pb-2">
                <form onSubmit={handleLogin} className="flex flex-col gap-5 p-fluid mt-6">
                <div className="flex flex-col gap-2">
                    <span className="p-float-label">
                        <InputText 
                            id="username" 
                            value={username} 
                            onChange={(e) => setUsername(e.target.value)} 
                            className="p-3 w-full bg-[#0f111a] border-gray-700 text-white focus:border-blue-500 rounded-xl"
                        />
                        <label htmlFor="username" className="text-gray-400">{t('landing.username')}</label>
                    </span>
                </div>
                
                <div className="flex flex-col gap-2">
                    <span className="p-float-label">
                        <Password 
                            id="password" 
                            value={password} 
                            onChange={(e) => setPassword(e.target.value)} 
                            feedback={false} 
                            toggleMask
                            inputClassName="p-3 w-full bg-[#0f111a] border-gray-700 text-white focus:border-blue-500 rounded-xl"
                            className="w-full"
                        />
                        <label htmlFor="password" className="text-gray-400">{t('landing.password')}</label>
                    </span>
                    <div className="text-right">
                        <Button 
                            label={t('landing.forgotPassword')} 
                            link 
                            onClick={() => navigate('/forgot-password')} 
                            type="button" 
                            className="text-xs font-bold text-gray-500 hover:text-white p-0" 
                        />
                    </div>
                </div>
                
                <Button 
                    label={isAdminLogin ? t('landing.adminPortal') : t('landing.signin')} 
                    icon="pi pi-arrow-right" 
                    iconPos="right"
                    className="w-full py-3.5 shadow-lg rounded-xl font-bold tracking-wider bg-blue-600 border-none hover:bg-blue-500 transition-all" 
                />
                
                {!isAdminLogin && (
                    <div className="flex flex-col gap-4 mt-2">

                        <div className="relative flex items-center py-2">
                            <div className="flex-grow border-t border-gray-700/50"></div>
                            <span className="flex-shrink-0 mx-4 text-xs font-bold text-gray-500 uppercase tracking-widest">{t('landing.or')}</span>
                            <div className="flex-grow border-t border-gray-700/50"></div>
                        </div>

                        <div className="flex flex-col gap-3">
                            <button 
                                className="w-full h-16 bg-white rounded-xl text-gray-800 font-bold hover:bg-gray-100 transition-all shadow-sm flex items-center justify-center gap-4 cursor-pointer border border-gray-200" 
                                type="button"
                                onClick={() => window.location.href = `${API_URL}/api/auth/google`}
                            >
                                <img src="/images/google-logo.svg" alt="Google" style={{ width: '24px', height: '24px' }} />
                                <span className="text-sm tracking-wide font-bold">{t('landing.signInGoogle')}</span>
                            </button>

                            <button 
                                className="w-full h-16 bg-[#1877F2] rounded-xl text-white font-bold hover:bg-[#166fe5] transition-all shadow-sm flex items-center justify-center gap-4 cursor-pointer" 
                                type="button"
                                onClick={() => window.location.href = `${API_URL}/api/auth/facebook`}
                            >
                                <img src="/images/facebook-logo.svg" alt="Facebook" style={{ width: '24px', height: '24px' }} />
                                <span className="text-sm tracking-wide font-bold">{t('landing.signInFacebook')}</span>
                            </button>
                        </div>
                        
                        <div className="text-center mt-4">
                            <span className="text-gray-500 text-xs">{t('landing.noAccount')} </span>
                            <Button 
                                label={t('landing.register')} 
                                link 
                                onClick={() => navigate('/register')} 
                                type="button"
                                className="font-bold text-blue-500 p-0 ml-1"
                            />
                        </div>
                    </div>
                )}

                {isAdminLogin && (
                    <div className="text-center mt-4">
                        <Button 
                            label={t('landing.backToHome')} 
                            link 
                            onClick={() => navigate('/')} 
                            type="button"
                            icon="pi pi-arrow-left"
                            className="font-bold text-gray-500 hover:text-white"
                        />
                    </div>
                )}
                </form>
            </div>
          </Card>
      </div>
    </div>
  );
};

export default Login;