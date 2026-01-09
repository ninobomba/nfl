import { useState } from 'react';
import { useAppDispatch } from '../store/hooks';
import { setCredentials } from '../store/slices/authSlice';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { Card } from 'primereact/card';
import { InputText } from 'primereact/inputtext';
import { Password } from 'primereact/password';
import { Button } from 'primereact/button';
import { SelectButton } from 'primereact/selectbutton';
import { Dropdown } from 'primereact/dropdown';
import { useTranslation } from 'react-i18next';

const Register = () => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [lang, setLang] = useState('en');
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await api.post('/api/auth/register', {
        username,
        email,
        password,
        lang
      });
      dispatch(setCredentials(response.data));
      navigate('/picks');
    } catch {
      alert('Registration failed. Check if username or email is already taken.');
    }
  };

  const langOptions = [
      { label: 'English (EN)', value: 'en' },
      { label: 'Español (ES)', value: 'es' }
  ];

  const title = (
    <div className="flex flex-col items-center gap-6 mb-4">
        <img 
          src="/images/nfl-logo.png" 
          alt="NFL Logo" 
          className="w-16 h-16"
        />
        <span className="text-2xl font-black italic tracking-tighter text-white">{t('landing.register')}</span>
    </div>
  );

  return (
    <div className="min-h-screen flex flex-col surface-ground font-comfortaa">
      {/* BARRA SUPERIOR FÍSICA */}
      <header className="w-full surface-card border-b border-gray-800 shadow-1 py-2 px-4 md:px-8 flex justify-end items-center z-50">
          <div className="flex items-center gap-3">
              <i className="pi pi-globe text-gray-500 text-xs"></i>
              <Dropdown 
                value={i18n.language.split('-')[0]} 
                options={langOptions} 
                onChange={(e) => {
                    i18n.changeLanguage(e.value);
                    setLang(e.value);
                }} 
                className="w-12rem border-none bg-transparent p-inputtext-sm font-bold"
              />
          </div>
      </header>

      {/* ÁREA DE CONTENIDO */}
      <div className="flex-grow flex items-center justify-center p-4">
          <Card title={title} className="w-full max-w-[480px] shadow-8 border-0 border-gray-800 px-4 md:px-8 py-6 rounded-2xl bg-surface-card overflow-hidden">
            <form onSubmit={handleRegister} className="flex flex-col gap-6 p-fluid">
              <div className="flex flex-col gap-4">
                <label htmlFor="username" className="font-bold text-xs tracking-widest text-gray-500">{t('landing.username')}</label>
                <InputText 
                    id="username" 
                    value={username} 
                    onChange={(e) => setUsername(e.target.value)} 
                    className="p-3 shadow-inner"
                />
              </div>
              <div className="flex flex-col gap-4">
                <label htmlFor="email" className="font-bold text-xs tracking-widest text-gray-500">Email Address</label>
                <InputText 
                    id="email" 
                    type="email"
                    value={email} 
                    onChange={(e) => setEmail(e.target.value)} 
                    placeholder="example@nfl.com"
                    className="p-3 shadow-inner"
                />
              </div>
              <div className="flex flex-col gap-4">
                <label htmlFor="password" title="password" className="font-bold text-xs tracking-widest text-gray-500">{t('landing.password')}</label>
                <Password 
                    id="password" 
                    value={password} 
                    onChange={(e) => setPassword(e.target.value)} 
                    toggleMask
                    inputClassName="p-3"
                    className="shadow-inner"
                />
              </div>

              <div className="flex flex-col gap-4 mt-2">
                  <label className="font-bold text-xs tracking-widest text-gray-500 text-center">Welcome Email Language</label>
                  <SelectButton value={lang} options={langOptions} onChange={(e) => setLang(e.value)} className="w-full text-xs font-bold" />
              </div>
              
              <Button label={t('landing.register')} icon="pi pi-user-plus" severity="success" className="mt-6 py-4 font-black tracking-widest shadow-4" />
              
              <div className="text-center mt-6">
                  <Button 
                    label="Already have an account? Login" 
                    link 
                    onClick={() => navigate('/login')} 
                    type="button"
                    className="font-black text-xs tracking-widest opacity-70"
                  />
              </div>
            </form>
          </Card>
      </div>

      <footer className="py-8 text-center opacity-30">
          <span className="text-gray-600 text-[10px] font-black tracking-[0.5em]">
              NFL Pick'em Lottery © 2026
          </span>
      </footer>
    </div>
  );
};

export default Register;