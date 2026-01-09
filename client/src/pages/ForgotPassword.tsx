import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { Button } from 'primereact/button';
import { Card } from 'primereact/card';
import { InputText } from 'primereact/inputtext';
import { Password } from 'primereact/password';
import { Dropdown } from 'primereact/dropdown';
import { useTranslation } from 'react-i18next';

const ForgotPassword = () => {
  const [step, setStep] = useState(1); // 1: Email, 2: Key & New Pass
  const [email, setEmail] = useState('');
  const [key, setKey] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();

  const handleRequestKey = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/api/auth/forgot-password', {
        email,
        lang: i18n.language.split('-')[0]
      });
      alert(t('landing.reset.keySent'));
      setStep(2);
    } catch {
      alert('Error requesting key');
    }
  };

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/api/auth/reset-password', {
        email,
        key,
        newPassword
      });
      alert(t('landing.reset.success'));
      navigate('/login');
    } catch (error: unknown) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const msg = (error as any).response?.data?.message || 'Error resetting password';
      alert(msg);
    }
  };

  const langOptions = [
      { label: 'English (EN)', value: 'en' },
      { label: 'Español (ES)', value: 'es' }
  ];

  return (
    <div className="min-h-screen flex flex-col surface-ground font-comfortaa">
      <header className="w-full surface-card border-b border-gray-800 shadow-1 py-2 px-4 md:px-8 flex justify-end items-center z-50">
          <Dropdown value={i18n.language.split('-')[0]} options={langOptions} onChange={(e) => i18n.changeLanguage(e.value)} className="w-12rem border-none bg-transparent font-bold" />
      </header>

      <div className="flex-grow flex items-center justify-center p-4">
          <Card title={t('landing.reset.title')} className="w-full max-w-[450px] shadow-lg border-none px-4 py-4">
            {step === 1 ? (
                <form onSubmit={handleRequestKey} className="flex flex-col gap-6 p-fluid">
                    <p className="text-sm text-gray-500">{t('landing.reset.email')}</p>
                    <div className="flex flex-col gap-4">
                        <label className="font-bold text-xs text-gray-500">Email</label>
                        <InputText value={email} onChange={(e) => setEmail(e.target.value)} placeholder="example@nfl.com" className="p-3" required />
                    </div>
                    <Button label={t('landing.reset.sendKey')} icon="pi pi-send" className="mt-4 py-3" />
                    <Button label="Back" link onClick={() => navigate('/login')} type="button" />
                </form>
            ) : (
                <form onSubmit={handleReset} className="flex flex-col gap-6 p-fluid">
                    <div className="flex flex-col gap-4">
                        <label className="font-bold text-xs text-gray-500">{t('landing.reset.key')}</label>
                        <InputText value={key} onChange={(e) => setKey(e.target.value)} placeholder="123456" className="p-3" maxLength={6} required />
                    </div>
                    <div className="flex flex-col gap-4">
                        <label className="font-bold text-xs text-gray-500">{t('landing.reset.newPassword')}</label>
                        <Password value={newPassword} onChange={(e) => setNewPassword(e.target.value)} toggleMask inputClassName="p-3" required />
                    </div>
                    <Button label={t('landing.reset.complete')} icon="pi pi-check" severity="success" className="mt-4 py-3" />
                    <Button label="Cancel" link onClick={() => setStep(1)} type="button" />
                </form>
            )}
          </Card>
      </div>
    </div>
  );
};

export default ForgotPassword;