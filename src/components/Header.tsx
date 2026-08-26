import React, { useState } from 'react';
import { RefreshCcw, Calendar } from 'lucide-react';
import { useAppContext } from '../store/AppContext';

export const Header = ({ activeTab }: { activeTab: string }) => {
  const { gasUrl, isSyncing, selectedYear, setSelectedYear } = useAppContext();
  
  const isOnline = !!gasUrl;
  const currentYear = 2026;
  const years = Array.from({ length: 6 }, (_, i) => currentYear + i);

  const getTitle = () => {
    switch(activeTab) {
      case 'dashboard': return 'Bidang Aptika';
      case 'subkegiatan': return 'Master Sub Kegiatan';
      case 'pd': return 'Perjalanan Dinas (SPPD)';
      case 'mm': return 'Makan & Minum';
      default: return 'Bidang Aptika';
    }
  }

  return (
    <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-8 shrink-0 z-10">
      <div className="flex items-center gap-6">
        <h2 className="text-xl font-bold text-slate-800">{getTitle()}</h2>
        
        <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-lg text-sm">
          <Calendar size={16} className="text-slate-400" />
          <span className="font-medium text-slate-600">Periode:</span>
          <select 
            value={selectedYear}
            onChange={(e) => setSelectedYear(Number(e.target.value))}
            className="bg-transparent border-none font-bold text-blue-600 focus:outline-none focus:ring-0 cursor-pointer p-0"
          >
            {years.map(y => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>
        </div>
      </div>
      
      <div className="flex items-center gap-6">
        {/* Sync Status for GAS */}
        <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full border ${isOnline ? 'bg-slate-100 border-slate-200' : 'bg-amber-50 border-amber-200'}`}>

          <div className={`w-2 h-2 rounded-full ${isOnline ? 'bg-green-500' : 'bg-amber-500'} ${isSyncing ? 'animate-ping' : ''}`}></div>
          <span className="text-xs font-medium text-slate-600 flex items-center gap-1.5">
            {isOnline ? 'Terhubung (GAS)' : 'Database Belum Diatur'}
            {isSyncing && <RefreshCcw size={12} className="animate-spin text-blue-500" />}
          </span>
        </div>
      </div>
    </header>
  );
};

