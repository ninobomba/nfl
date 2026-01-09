import React from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { logout } from '../store/slices/authSlice';
import { Menubar } from 'primereact/menubar';
import { Button } from 'primereact/button';
import { Dropdown } from 'primereact/dropdown';
import type { MenuItem } from 'primereact/menuitem';
import { useTranslation } from 'react-i18next';

const Layout = ({ children }: { children?: React.ReactNode }) => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { user } = useAppSelector((state) => state.auth);
  const { t, i18n } = useTranslation();

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng);
  };

  const items: MenuItem[] = [];

  if (user?.role === 'ADMIN') {
    items.push({
      label: t('nav.admin'),
      icon: 'pi pi-fw pi-cog',
      command: () => navigate('/admin')
    });
  }

  if (user?.role !== 'ADMIN') {
    items.push({
      label: t('nav.games'),
      icon: 'pi pi-fw pi-calendar',
      command: () => navigate('/picks')
    });
  }

  items.push(
    {
      label: t('nav.results'),
      icon: 'pi pi-fw pi-check-square',
      command: () => navigate('/results')
    },
    {
      label: t('nav.standings'),
      icon: 'pi pi-fw pi-table',
      command: () => navigate('/standings')
    },
    {
      label: t('nav.leaderboard'),
      icon: 'pi pi-fw pi-list',
      command: () => navigate('/leaderboard')
    }
  );

  const start = (
    <div className="flex items-center gap-3 cursor-pointer hover:opacity-80 transition-all" onClick={() => navigate('/')}>
        <img 
            src="/images/nfl-logo.png" 
            alt="NFL" 
            className="w-10 h-10"
        />
        <span className="text-2xl font-black tracking-tighter  italic hidden md:block text-white">
            Pick'em <span className="text-blue-600">Lottery</span>
        </span>
    </div>
  );
  
  const langOptions = [
      { label: 'English (EN)', value: 'en' },
      { label: 'Español (ES)', value: 'es' }
  ];

  const end = (
    <Button 
        label={t('nav.logout')} 
        icon="pi pi-power-off" 
        severity="danger" 
        text 
        className="font-bold  text-xs tracking-widest px-4 hover:bg-red-900 hover:bg-opacity-10"
        onClick={handleLogout} 
    />
  );

  return (
    <div className="min-h-screen flex flex-col surface-ground font-comfortaa">
      {/* BARRA SUPERIOR DE UTILIDAD (IDIOIMA Y USUARIO) */}
      <header className="w-full surface-card border-b border-gray-800 py-2 px-4 md:px-8 flex justify-end items-center shadow-1 z-50">
          <div className="max-w-7xl w-full mx-auto flex justify-end items-center gap-12">
              {/* Información del Usuario Logueado */}
              {user && (
                  <div className="flex items-center gap-4 pr-4">
                      <span className="font-black text-white lowercase">{user.username}</span>
                  </div>
              )}

              <div className="flex items-center gap-40 pr-4"> | </div>

              {/* Selección de Idioma */}
              <div className="flex items-center gap-4">
                  <i className="pi pi-globe text-gray-500 text-sm"></i>
                  <Dropdown
                    value={i18n.language.split('-')[0]}
                    options={langOptions}
                    onChange={(e) => changeLanguage(e.value)}
                    className="p-inputtext-sm border-none bg-transparent hover:bg-gray-800 rounded transition-all w-14rem font-bold text-sm"
                  />
              </div>
          </div>
      </header>

      {/* MENÚ PRINCIPAL */}
      <nav className="sticky top-0 z-40 shadow-md surface-card border-b border-gray-800">
          <div className="max-w-7xl mx-auto">
            <Menubar model={items} start={start} end={end} className="border-none rounded-none py-3" />
          </div>
      </nav>
      
      <main className="flex-grow p-4 md:p-8">
        <div className="max-w-7xl mx-auto">
            {children || <Outlet />}
        </div>
      </main>

      <footer className="py-8 text-center surface-card border-t border-gray-800 mt-auto">
          <div className="flex flex-col gap-2">
              <span className="text-[10px] font-black tracking-[0.3em] text-gray-600 ">NFL Pick'em Lottery © 2026</span>
          </div>
      </footer>
    </div>
  );
};

export default Layout;
