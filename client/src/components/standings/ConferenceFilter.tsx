import React from 'react';
import { Dropdown } from 'primereact/dropdown';
import { useTranslation } from 'react-i18next';

interface ConferenceFilterProps {
  selectedConference: string | null;
  onConferenceChange: (value: string | null) => void;
}

const ConferenceFilter: React.FC<ConferenceFilterProps> = ({ selectedConference, onConferenceChange }) => {
  const { t } = useTranslation();

  const conferences = [
    { label: 'AFC', value: 'AFC' },
    { label: 'NFC', value: 'NFC' }
  ];

  return (
    <div className="flex justify-center mb-8">
      <div className="flex flex-col items-center gap-2">
        <label className="text-xs font-bold text-gray-500 tracking-widest">{t('admin.conf')}</label>
        <Dropdown 
          value={selectedConference} 
          options={conferences} 
          onChange={(e) => onConferenceChange(e.value)} 
          placeholder="Conference"
          showClear
          className="w-full md:w-20rem shadow-5 rounded-xl border-none bg-gray-900/50"
        />
      </div>
    </div>
  );
};

export default ConferenceFilter;
