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
    <div className="flex items-center gap-4 cursor-pointer group" onClick={() => navigate('/')}>
        <div className="relative">
            <img 
                src="/images/nfl-logo-60x80.png" 
                alt="NFL" 
                className="w-8 h-10 transition-transform duration-300 group-hover:scale-110"
            />
            <div className="absolute inset-0 bg-blue-500 blur-xl opacity-0 group-hover:opacity-20 transition-opacity"></div>
        </div>
                <div className="flex flex-col leading-none">
                    <span className="text-2xl font-black tracking-tighter italic text-white">
                        ULTIMATE <span className="text-blue-500">CHALLENGE</span>
                    </span>
                    <span className="text-[8px] font-bold tracking-[0.5em] text-gray-500">Championship Edition</span>
                </div>
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
                className="font-black text-[10px] tracking-[0.2em] px-6 py-3 rounded-full hover:bg-red-500/10 border border-transparent hover:border-red-500/20 transition-all"
                onClick={handleLogout} 
            />
          );
        
          return (
            <div className="min-h-screen flex flex-col bg-[#0f111a] font-comfortaa">
              {/* UTILITY HEADER */}
              <header className="w-full bg-[#161b2b] border-b border-gray-800/50 py-2 px-4 md:px-8 z-50">
                  <div className="max-w-7xl w-full mx-auto flex justify-between items-center">
                      <div className="flex items-center gap-2">
                          <span className="text-[10px] font-black tracking-[0.2em] text-gray-500 hidden sm:block">
                              Official NFL Prediction Platform
                          </span>
                      </div>
                      
                      <div className="flex items-center gap-6">
                          {/* User Info */}
                          {user && (
                              <div className="flex items-center gap-2 px-3 py-1 bg-gray-900/50 rounded-full">
                                  <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                                  <span className="text-xs font-black text-gray-300 tracking-tighter">{user.username}</span>
                              </div>
                          )}
        
                          <div className="h-4 w-[1px] bg-gray-1200"></div>
        
                          {/* Language Selector */}
                          <div className="flex items-center gap-2 group cursor-pointer">
                              <i className="pi pi-globe text-gray-500 text-xs group-hover:text-primary transition-colors"></i>
                              <Dropdown
                                value={i18n.language.split('-')[0]}
                                options={langOptions}
                                onChange={(e) => changeLanguage(e.value)}
                                className="p-inputtext-sm border-none bg-transparent hover:bg-gray-800/30 rounded transition-all w-10rem font-black text-[10px] tracking-widest"
                              />
                          </div>
                      </div>
                  </div>
              </header>
        
              {/* MAIN NAVIGATION */}
              <nav className="sticky top-0 z-40 shadow-2xl bg-[#161b2b]/80 backdrop-blur-md border-b border-gray-800/50">
                  <div className="max-w-7xl mx-auto px-4">
                    <Menubar 
                        model={items} 
                        start={start} 
                        end={end} 
                        className="border-none bg-transparent py-4" 
                    />
                  </div>
              </nav>
              
              {/* PAGE CONTENT */}
              <main className="flex-grow relative">
                <div className="absolute inset-0 bg-[url('/images/ball.jpeg')] bg-fixed bg-cover bg-center opacity-[0.03] pointer-events-none"></div>
                <div className="max-w-7xl mx-auto py-8 md:py-12 px-4 relative z-10">
                    {children || <Outlet />}
                </div>
              </main>
        
              {/* FOOTER */}
              <footer className="py-12 bg-[#0a0c14] border-t border-gray-800/50 mt-auto">
                  <div className="max-w-7xl mx-auto px-4 flex flex-col items-center gap-6">
                      <div className="flex items-center gap-3 grayscale opacity-30 hover:grayscale-0 hover:opacity-100 transition-all duration-500 cursor-pointer">
                          <img src="/images/nfl-logo.png" alt="NFL" className="w-8" />
                          <span className="font-black italic tracking-tighter text-xl underline decoration-blue-500 underline-offset-8">ULTIMATE CHALLENGE</span>
                      </div>
                      <div className="flex gap-8">
                          <a href="#" className="text-[10px] font-bold text-gray-600 hover:text-primary transition-colors tracking-widest">Terms</a>
                          <a href="#" className="text-[10px] font-bold text-gray-600 hover:text-primary transition-colors tracking-widest">Privacy</a>
                          <a href="#" className="text-[10px] font-bold text-gray-600 hover:text-primary transition-colors tracking-widest">Support</a>
                      </div>
                      <span className="text-[9px] font-black tracking-[0.4em] text-gray-700">
                          NFL Ultimate Challenge © 2026 • Built for the ultimate fans
                      </span>
                  </div>
              </footer>
            </div>
  );
};

export default Layout;
