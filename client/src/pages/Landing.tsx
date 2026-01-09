import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch } from '../store/hooks';
import { setCredentials } from '../store/slices/authSlice';
import api from '../api/axios';
import { Button } from 'primereact/button';
import { Card } from 'primereact/card';
import { InputText } from 'primereact/inputtext';
import { Password } from 'primereact/password';
import { Divider } from 'primereact/divider';
import { Dropdown } from 'primereact/dropdown';
import { useTranslation } from 'react-i18next';

const Landing = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();

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
    } catch (error: any) {
      if (!error.response) {
          alert('Network error: Is the server running?');
      } else {
          const msg = error.response.data?.message || 'Login failed';
          alert(`Server error: ${msg}`);
      }
    }
  };

  const langOptions = [
      { label: 'English (EN)', value: 'en' },
      { label: 'Español (ES)', value: 'es' }
  ];

  return (
    <div className="min-h-screen flex flex-col surface-ground font-comfortaa">
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
      <div className="flex-grow flex items-center justify-center p-6 py-16">
          <Card className="w-full max-w-[550px] shadow-8 border-0 border-gray-800 px-4 md:px-10 py-8 rounded-3xl bg-surface-card overflow-hidden">
            <div className="flex flex-col items-center gap-10">
                <div className="flex flex-col items-center gap-6">
                    <img 
                        src="/images/nfl-logo.png" 
                        alt="NFL Logo" 
                        className="w-28 h-28"
                    />
                    <div className="flex flex-col gap-2">
                        <h1 className="text-4xl md:text-7xl font-black tracking-tighter italic m-0 leading-tight">
                            {t('landing.title')} <br />
                            <span className="text-blue-600">{t('landing.subtitle')}</span>
                        </h1>
                        <p className="text-gray-500 text-base font-medium max-w-sm mx-auto leading-relaxed">
                            {t('landing.description')}
                        </p>
                    </div>
                </div>
                
                <form onSubmit={handleLogin} className="w-full max-w-sm flex flex-col gap-8 text-left p-fluid mt-2">
                    <div className="flex flex-col gap-4">
                        <label htmlFor="username" className="font-black text-xs tracking-[0.2em] text-gray-400 pl-1">{t('landing.username')}</label>
                        <InputText 
                            id="username" 
                            value={username} 
                            onChange={(e) => setUsername(e.target.value)} 
                            placeholder={t('landing.username')}
                            className="p-4 rounded-xl border-gray-700 bg-gray-900 bg-opacity-50"
                        />
                    </div>
                    <div className="flex flex-col gap-4">
                        <label htmlFor="password" title="password" className="font-black text-xs tracking-[0.2em] text-gray-400 pl-1">{t('landing.password')}</label>
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
                    
                    <Button label={t('landing.signin')} icon="pi pi-sign-in" className="mt-4 py-4 font-black tracking-widest shadow-6 rounded-xl" />
                    
                    <Divider align="center" className="my-4">
                        <span className="p-tag text-[10px] text-gray-500 bg-transparent tracking-[0.3em] font-black">{t('landing.or')}</span>
                    </Divider>
                    
                    <Button 
                        label={t('landing.register')} 
                        icon="pi pi-user-plus" 
                        type="button"
                        className="p-button-outlined py-4 font-black tracking-widest rounded-xl"
                        onClick={() => navigate('/register')}
                    />
                </form>
            </div>
          </Card>
      </div>
      
      <footer className="py-10 text-center opacity-30">
          <span className="text-gray-600 text-xs font-black tracking-[0.5em]">
              NFL Pick'em Lottery © 2026
          </span>
      </footer>
    </div>
  );
};

export default Landing;