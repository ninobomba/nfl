import { useState } from 'react';
import { useAppDispatch } from '../store/hooks';
import { setCredentials } from '../store/slices/authSlice';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
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
      const response = await axios.post('http://localhost:3000/api/auth/register', {
        username,
        email,
        password,
        lang
      });
      dispatch(setCredentials(response.data));
      navigate('/picks');
    } catch (error) {
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
          src="https://static.www.nfl.com/league/api/clubs/logos/NFL.svg" 
          alt="NFL Logo" 
          className="w-16 h-16"
        />
        <span className="text-2xl font-black uppercase italic tracking-tighter">{t('landing.register')}</span>
    </div>
  );

  return (
    <div className="min-h-screen flex flex-col surface-ground font-comfortaa">
      {/* Header Bar - Solid and anchored */}
      <header className="w-full surface-card border-b border-gray-800 shadow-2 py-2 px-4 md:px-8 flex justify-end items-center z-50">
          <div className="flex items-center gap-3">
              <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest hidden sm:inline">Language / Idioma:</span>
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

      {/* Main Content Area */}
      <div className="flex-grow flex items-center justify-center p-4">
          <Card title={title} className="w-full max-w-[450px] shadow-lg border-none px-4 py-4">
            <form onSubmit={handleRegister} className="flex flex-col gap-6 p-fluid">
              <div className="flex flex-col gap-4">
                <label htmlFor="username" className="font-bold text-xs uppercase text-gray-500">{t('landing.username')}</label>
                <InputText 
                    id="username" 
                    value={username} 
                    onChange={(e) => setUsername(e.target.value)} 
                    className="p-3"
                />
              </div>
              <div className="flex flex-col gap-4">
                <label htmlFor="email" className="font-bold text-xs uppercase text-gray-500">Email Address</label>
                <InputText 
                    id="email" 
                    type="email"
                    value={email} 
                    onChange={(e) => setEmail(e.target.value)} 
                    placeholder="example@nfl.com"
                    className="p-3"
                />
              </div>
              <div className="flex flex-col gap-4">
                <label htmlFor="password" title="password" className="font-bold text-xs uppercase text-gray-500">{t('landing.password')}</label>
                <Password 
                    id="password" 
                    value={password} 
                    onChange={(e) => setPassword(e.target.value)} 
                    toggleMask
                    inputClassName="p-3"
                />
              </div>

              <div className="flex flex-col gap-4">
                  <label className="font-bold text-xs uppercase text-gray-500">Welcome Email Language</label>
                  <SelectButton value={lang} options={langOptions} onChange={(e) => setLang(e.value)} className="w-full" />
              </div>
              
              <Button label={t('landing.register')} icon="pi pi-user-plus" severity="success" className="mt-4 py-3 font-bold" />
              
              <div className="text-center mt-4">
                  <Button 
                    label="Already have an account? Login" 
                    link 
                    onClick={() => navigate('/login')} 
                    type="button"
                    className="font-bold"
                  />
              </div>
            </form>
          </Card>
      </div>
    </div>
  );
};

export default Register;
