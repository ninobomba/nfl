import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch } from '../store/hooks';
import { setCredentials } from '../store/slices/authSlice';
import axios from 'axios';
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
      if (!error.response) {
          alert('Network error: Is the server running on port 3000?');
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
      {/* Header Bar - Solid and anchored */}
      <header className="w-full surface-card border-b border-gray-800 shadow-2 py-2 px-4 md:px-8 flex justify-end items-center z-50">
          <div className="flex items-center gap-3">
              <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest hidden sm:inline">Language / Idioma:</span>
              <Dropdown 
                value={i18n.language.split('-')[0]} 
                options={langOptions} 
                onChange={(e) => i18n.changeLanguage(e.value)} 
                className="w-12rem border-none bg-transparent p-inputtext-sm font-bold"
              />
          </div>
      </header>

      {/* Main Content Area */}
      <div className="flex-grow flex items-center justify-center p-4">
          <Card className="w-full max-w-[500px] text-center shadow-lg border-none overflow-hidden">
            <div className="flex flex-col items-center gap-8 py-8 px-4">
                <div className="flex flex-col items-center gap-4">
                    <img 
                        src="https://static.www.nfl.com/league/api/clubs/logos/NFL.svg" 
                        alt="NFL Logo" 
                        className="w-24 h-24 mb-2"
                    />
                    <h1 className="text-4xl md:text-6xl font-black tracking-tighter uppercase italic m-0">
                        {t('landing.title')} <span className="text-blue-600">{t('landing.subtitle')}</span>
                    </h1>
                    <p className="text-gray-500 text-sm max-w-xs mx-auto">
                        {t('landing.description')}
                    </p>
                </div>
                
                <form onSubmit={handleLogin} className="w-full max-w-sm flex flex-col gap-6 text-left p-fluid mt-2">
                    <div className="flex flex-col gap-4">
                        <label htmlFor="username" className="font-bold text-xs uppercase tracking-widest text-gray-500">{t('landing.username')}</label>
                        <InputText 
                            id="username" 
                            value={username} 
                            onChange={(e) => setUsername(e.target.value)} 
                            placeholder={t('landing.username')}
                            className="p-3"
                        />
                    </div>
                    <div className="flex flex-col gap-4">
                        <label htmlFor="password" title="password" className="font-bold text-xs uppercase tracking-widest text-gray-500">{t('landing.password')}</label>
                        <Password 
                            id="password" 
                            value={password} 
                            onChange={(e) => setPassword(e.target.value)} 
                            feedback={false} 
                            placeholder={t('landing.password')}
                            toggleMask
                            inputClassName="p-3"
                        />
                    </div>
                    
                    <Button label={t('landing.signin')} icon="pi pi-sign-in" className="mt-4 py-3 font-bold shadow-4" />
                    
                    <Divider align="center" className="my-4">
                        <span className="p-tag text-xs text-gray-400 bg-transparent uppercase tracking-widest">{t('landing.or')}</span>
                    </Divider>
                    
                    <Button 
                        label={t('landing.register')} 
                        icon="pi pi-user-plus" 
                        type="button"
                        className="p-button-outlined py-3 font-bold"
                        onClick={() => navigate('/register')}
                    />
                </form>
            </div>
          </Card>
      </div>
      
      <footer className="py-6 text-center opacity-50">
          <span className="text-gray-600 text-xs font-bold tracking-[0.4em] uppercase">
              NFL Pick'em Lottery © 2026
          </span>
      </footer>
    </div>
  );
};

export default Landing;
