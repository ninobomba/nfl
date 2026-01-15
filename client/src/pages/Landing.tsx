import { useNavigate } from 'react-router-dom';
import { Button } from 'primereact/button';
import { Card } from 'primereact/card';
import { Dropdown } from 'primereact/dropdown';
import { useTranslation } from 'react-i18next';

const Landing = () => {
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();

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
                            src="/images/nfl-logo-60x80.png" 
                            alt="NFL Logo" 
                            className="w-16 h-20 md:w-20 md:h-24 object-contain animate-bounce-slow shadow-2xl"
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
                
                <div className="w-full max-w-sm flex flex-col gap-4">
                    <Button 
                        label={t('landing.signin')} 
                        icon="pi pi-sign-in" 
                        className="py-4 font-black tracking-widest shadow-6 rounded-xl" 
                        onClick={() => navigate('/login')}
                    />
                    
                    <Button 
                        label={t('landing.register')} 
                        icon="pi pi-user-plus" 
                        type="button"
                        className="p-button-outlined py-4 font-black tracking-widest rounded-xl"
                        onClick={() => navigate('/register')}
                    />
                </div>
            </div>
          </Card>
      </div>
      
          <footer className="mt-12 text-[10px] font-black tracking-[0.3em] text-gray-600 uppercase">
              NFL Ultimate Challenge © 2026
          </footer>
    </div>
  );
};

export default Landing;