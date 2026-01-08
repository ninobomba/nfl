import { useState } from 'react';
import { useAppDispatch } from '../store/hooks';
import { setCredentials } from '../store/slices/authSlice';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Card } from 'primereact/card';
import { InputText } from 'primereact/inputtext';
import { Password } from 'primereact/password';
import { Button } from 'primereact/button';
import { Divider } from 'primereact/divider';
import { Dropdown } from 'primereact/dropdown';
import { useTranslation } from 'react-i18next';

interface LoginProps {
    isAdminLogin?: boolean;
}

const Login = ({ isAdminLogin = false }: LoginProps) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await axios.post('http://localhost:3000/api/auth/login', {
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
    } catch (error: any) {
      alert(error.response?.data?.message || 'Login failed');
    }
  };

  const langOptions = [
      { label: 'English (EN)', value: 'en' },
      { label: 'Español (ES)', value: 'es' }
  ];

  const title = (
      <div className="flex flex-col items-center gap-8 mb-6">
          <img 
            src="https://static.www.nfl.com/league/api/clubs/logos/NFL.svg" 
            alt="NFL Logo" 
            className="w-20 h-20"
          />
          <span className="text-3xl font-black  italic tracking-tighter text-white">
              {isAdminLogin ? t('landing.adminPortal') : t('landing.signin')}
          </span>
      </div>
  );

  return (
    <div className="min-h-screen flex flex-col surface-ground font-comfortaa">
      <header className="w-full surface-card border-b border-gray-800 shadow-sm py-3 px-4 md:px-12 flex justify-end items-center z-50">
          <div className="flex items-center gap-4">
              <i className="pi pi-globe text-gray-500 text-sm"></i>
              <Dropdown 
                value={i18n.language.split('-')[0]} 
                options={langOptions} 
                onChange={(e) => i18n.changeLanguage(e.value)} 
                className="w-14rem border-none bg-transparent font-bold text-sm"
              />
          </div>
      </header>

      <div className="flex-grow flex items-center justify-center p-6">
          <Card title={title} className="w-full max-w-[480px] shadow-8 border-1 border-gray-800 px-4 md:px-10 py-10 rounded-3xl bg-surface-card overflow-hidden">
            <form onSubmit={handleLogin} className="flex flex-col gap-8 p-fluid">
              <div className="flex flex-col gap-4">
                <label htmlFor="username" className="font-black text-xs  tracking-[0.2em] text-gray-400 pl-1">{t('landing.username')}</label>
                <InputText 
                    id="username" 
                    value={username} 
                    onChange={(e) => setUsername(e.target.value)} 
                    placeholder={t('landing.username')}
                    className="p-4 rounded-xl border-gray-700 bg-gray-900 bg-opacity-50"
                />
              </div>
              <div className="flex flex-col gap-4">
                <label htmlFor="password" title="password" className="font-black text-xs  tracking-[0.2em] text-gray-400 pl-1">{t('landing.password')}</label>
                <Password 
                    id="password" 
                    value={password} 
                    onChange={(e) => setPassword(e.target.value)} 
                    feedback={false} 
                    placeholder={t('landing.password')}
                    toggleMask
                    inputClassName="p-4"
                    className="rounded-xl border-gray-700 bg-gray-900 bg-opacity-50 overflow-hidden"
                />
                <div className="text-right mt-1">
                    <Button label={t('landing.forgotPassword')} link onClick={() => navigate('/forgot-password')} type="button" className="text-xs font-bold p-0 opacity-60" />
                </div>
              </div>
              
              <Button label={isAdminLogin ? t('landing.adminPortal') : t('landing.signin')} icon="pi pi-sign-in" className="mt-4 py-4 font-black  tracking-widest shadow-6 rounded-xl" />
              
              {!isAdminLogin && (
                  <>
                    <Divider align="center" className="my-2">
                        <span className="p-tag text-[10px] text-gray-500 bg-transparent  tracking-[0.3em] font-black">{t('landing.or')}</span>
                    </Divider>
                    
                    <div className="text-center">
                        <Button 
                            label={t('landing.register')} 
                            link 
                            onClick={() => navigate('/register')} 
                            type="button"
                            className="font-black  tracking-widest text-xs"
                        />
                    </div>
                  </>
              )}

              {isAdminLogin && (
                  <div className="text-center mt-4">
                      <Button 
                        label="Back to Portal" 
                        link 
                        onClick={() => navigate('/')} 
                        type="button"
                        icon="pi pi-arrow-left"
                        className="font-black  tracking-widest text-xs"
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
