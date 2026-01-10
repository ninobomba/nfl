import React from 'react';
import { useTranslation } from 'react-i18next';
import type { Matchup, User } from '../types';

interface OverviewProps {
    matchups: Matchup[];
    users: User[];
}

const Overview: React.FC<OverviewProps> = ({ matchups, users }) => {
    const { t } = useTranslation();

    return (
        <div className="py-16 px-4 flex flex-col items-center animate-fadein">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-10 w-full max-w-[1000px]">
                <div className="surface-card p-10 rounded-[2rem] border-l-8 border-primary shadow-xl flex flex-col items-center transition-all hover:scale-105">
                    <div className="bg-primary bg-opacity-10 p-4 rounded-full mb-4">
                        <i className="pi pi-calendar text-3xl text-primary"></i>
                    </div>
                    <span className="text-xs font-black text-gray-500 tracking-[0.2em] ">{t('admin.stats.totalMatchups')}</span>
                    <div className="text-6xl font-black mt-4 text-white tracking-tighter">{matchups.length}</div>
                </div>
                
                <div className="surface-card p-10 rounded-[2rem] border-l-8 border-green-500 shadow-xl flex flex-col items-center transition-all hover:scale-105">
                    <div className="bg-green-500 bg-opacity-10 p-4 rounded-full mb-4">
                        <i className="pi pi-check-circle text-3xl text-green-500"></i>
                    </div>
                    <span className="text-xs font-black text-gray-500 tracking-[0.2em] ">{t('admin.stats.finishedGames')}</span>
                    <div className="text-6xl font-black mt-4 text-green-500 tracking-tighter">{matchups.filter(m => m.isFinished).length}</div>
                </div>

                <div className="surface-card p-10 rounded-[2rem] border-l-8 border-yellow-500 shadow-xl flex flex-col items-center transition-all hover:scale-105">
                    <div className="bg-yellow-500 bg-opacity-10 p-4 rounded-full mb-4">
                        <i className="pi pi-users text-3xl text-yellow-500"></i>
                    </div>
                    <span className="text-xs font-black text-gray-500 tracking-[0.2em] ">{t('admin.stats.activeUsers')}</span>
                    <div className="text-6xl font-black mt-4 text-yellow-500 tracking-tighter">{users.filter(u => u.isActive).length}</div>
                </div>
            </div>
            <div className="mt-12 text-gray-600 font-bold italic opacity-40 text-sm tracking-widest ">
                <i className="pi pi-spin pi-spinner mr-2"></i> {t('admin.stats.realTime')}
            </div>
        </div>
    );
};

export default Overview;
