import React, { useState } from 'react';
import { Settings, RefreshCcw } from 'lucide-react';
import { SettingsModal } from './SettingsModal';
import { useAppContext } from '../store/AppContext';

export const Header = ({ activeTab }: { activeTab: string }) => {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const { gasUrl, isSyncing } = useAppContext();
  
  const isOnline = !!gasUrl;

  const getTitle = () => {
    switch(activeTab) {
      case 'dashboard': return 'Analitik Anggaran 2026';
      case 'subkegiatan': return 'Master Sub Kegiatan';
      case 'pd': return 'Perjalanan Dinas (SPPD)';
      case 'mm': return 'Makan & Minum';
      default: return 'Analitik Anggaran 2026';
    }
  }

  return (
    <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-8 shrink-0 z-10">
      <h2 className="text-xl font-bold text-slate-800">{getTitle()}</h2>
      
      <div className="flex items-center gap-6">
        {/* Sync Status for GAS */}
        <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full border ${isOnline ? 'bg-slate-100 border-slate-200' : 'bg-amber-50 border-amber-200'}`}>
          <div className={`w-2 h-2 rounded-full ${isOnline ? 'bg-green-500' : 'bg-amber-500'} ${isSyncing ? 'animate-ping' : ''}`}></div>
          <span className="text-xs font-medium text-slate-600 flex items-center gap-1.5">
            {isOnline ? 'Terhubung (GAS)' : 'Database Belum Diatur'}
            {isSyncing && <RefreshCcw size={12} className="animate-spin text-blue-500" />}
          </span>
        </div>
        
        <button 
          onClick={() => setIsSettingsOpen(true)}
          className="text-slate-500 hover:text-slate-800 transition-colors p-2 hover:bg-slate-100 rounded-full"
          title="Pengaturan Database"
        >
          <Settings size={20} />
        </button>
      </div>
      
      <SettingsModal isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} />
    </header>
  );
};

