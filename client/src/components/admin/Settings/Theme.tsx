import React from 'react';
import { useTranslation } from 'react-i18next';
import { Dropdown } from 'primereact/dropdown';
import api from '../../../api/axios';

interface ThemeProps {
    selectedTheme: string;
    setSelectedTheme: (theme: string) => void;
    token: string | null;
}

const Theme: React.FC<ThemeProps> = ({ selectedTheme, setSelectedTheme, token }) => {
    const { t } = useTranslation();

    const themeOptions = [
        { label: 'Arya Blue', value: 'arya-blue' },
        { label: 'Arya Green', value: 'arya-green' },
        { label: 'Arya Orange', value: 'arya-orange' },
        { label: 'Arya Purple', value: 'arya-purple' },
        { label: 'Bootstrap 4 Dark Blue', value: 'bootstrap4-dark-blue' },
        { label: 'Bootstrap 4 Dark Purple', value: 'bootstrap4-dark-purple' },
        { label: 'Bootstrap 4 Light Blue', value: 'bootstrap4-light-blue' },
        { label: 'Bootstrap 4 Light Purple', value: 'bootstrap4-light-purple' },
        { label: 'Fluent Light', value: 'fluent-light' },
        { label: 'Lara Dark Amber', value: 'lara-dark-amber' },
        { label: 'Lara Dark Blue', value: 'lara-dark-blue' },
        { label: 'Lara Dark Cyan', value: 'lara-dark-cyan' },
        { label: 'Lara Dark Green', value: 'lara-dark-green' },
        { label: 'Lara Dark Indigo', value: 'lara-dark-indigo' },
        { label: 'Lara Dark Pink', value: 'lara-dark-pink' },
        { label: 'Lara Dark Purple', value: 'lara-dark-purple' },
        { label: 'Lara Dark Teal', value: 'lara-dark-teal' },
        { label: 'Lara Light Amber', value: 'lara-light-amber' },
        { label: 'Lara Light Blue', value: 'lara-light-blue' },
        { label: 'Lara Light Cyan', value: 'lara-light-cyan' },
        { label: 'Lara Light Green', value: 'lara-light-green' },
        { label: 'Lara Light Indigo', value: 'lara-light-indigo' },
        { label: 'Lara Light Pink', value: 'lara-light-pink' },
        { label: 'Lara Light Purple', value: 'lara-light-purple' },
        { label: 'Lara Light Teal', value: 'lara-light-teal' },
        { label: 'Luna Amber', value: 'luna-amber' },
        { label: 'Luna Blue', value: 'luna-blue' },
        { label: 'Luna Green', value: 'luna-green' },
        { label: 'Luna Pink', value: 'luna-pink' },
        { label: 'Material Design Dark Deep Purple', value: 'md-dark-deeppurple' },
        { label: 'Material Design Dark Indigo', value: 'md-dark-indigo' },
        { label: 'Material Design Light Deep Purple', value: 'md-light-deeppurple' },
        { label: 'Material Design Light Indigo', value: 'md-light-indigo' },
        { label: 'Material Design Compact Dark Deep Purple', value: 'mdc-dark-deeppurple' },
        { label: 'Material Design Compact Dark Indigo', value: 'mdc-dark-indigo' },
        { label: 'Material Design Compact Light Deep Purple', value: 'mdc-light-deeppurple' },
        { label: 'Material Design Compact Light Indigo', value: 'mdc-light-indigo' },
        { label: 'Mira', value: 'mira' },
        { label: 'Nano', value: 'nano' },
        { label: 'Nova', value: 'nova' },
        { label: 'Nova Accent', value: 'nova-accent' },
        { label: 'Nova Alt', value: 'nova-alt' },
        { label: 'Rhea', value: 'rhea' },
        { label: 'Saga Blue', value: 'saga-blue' },
        { label: 'Saga Green', value: 'saga-green' },
        { label: 'Saga Orange', value: 'saga-orange' },
        { label: 'Saga Purple', value: 'saga-purple' },
        { label: 'Soho Dark', value: 'soho-dark' },
        { label: 'Soho Light', value: 'soho-light' },
        { label: 'Tailwind Light', value: 'tailwind-light' },
        { label: 'Vela Blue', value: 'vela-blue' },
        { label: 'Vela Green', value: 'vela-green' },
        { label: 'Vela Orange', value: 'vela-orange' },
        { label: 'Vela Purple', value: 'vela-purple' },
        { label: 'Viva Dark', value: 'viva-dark' },
        { label: 'Viva Light', value: 'viva-light' }
    ];

    return (
        <div className="py-20 flex flex-col items-center animate-fadein">
            <div className="w-full max-w-[650px] surface-card p-16 rounded-[3rem] shadow-10 border-0 text-center">
                <div className="bg-primary bg-opacity-10 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-8">
                    <i className="pi pi-palette text-4xl text-primary"></i>
                </div>
                <h3 className="text-3xl font-black italic text-primary mb-10 tracking-tighter">{t('admin.tabTheme')}</h3>
                <div className="flex flex-col gap-6 text-left p-fluid">
                    <label className="font-black text-xs text-gray-500 tracking-[0.3em]  pl-2">{t('admin.theme')}</label>
                    <Dropdown value={selectedTheme} options={themeOptions} onChange={(e) => {
                        setSelectedTheme(e.value);
                        api.post('/api/admin/settings', { key: 'theme', value: e.value }, { headers: { Authorization: `Bearer ${token}` } });
                        const themeLink = document.getElementById('app-theme') as HTMLLinkElement;
                        if (themeLink) {
                            themeLink.href = `/themes/${e.value}/theme.css`;
                        }
                    }} className="w-full p-4 font-black shadow-8 rounded-2xl bg-gray-900 border-none" />
                    <p className="text-xs text-gray-600 font-bold leading-relaxed mt-6 px-4 text-center italic">{t('admin.themeNote')}</p>
                </div>
            </div>
        </div>
    );
};

export default Theme;
