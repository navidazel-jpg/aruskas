/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { Dashboard } from './components/Dashboard';
import { Anggaran } from './components/Anggaran';
import { PerjalananDinas } from './components/PerjalananDinas';
import { MakanMinum } from './components/MakanMinum';
import { LoginScreen } from './components/LoginScreen';
import { initAuth } from './lib/auth';
import { useStore } from './store';
import { RefreshCcw, CheckCircle2, CloudOff, User } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isGoogleConnected, setIsGoogleConnected] = useState(false);
  const { currentUser, initializeSheets, syncToSheets, isSaving } = useStore();

  useEffect(() => {
    const unsubscribe = initAuth(
      (user, token) => {
        setIsGoogleConnected(true);
        initializeSheets();
      },
      () => {
        setIsGoogleConnected(false);
      }
    );
    return () => unsubscribe();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleGoogleConnectSuccess = () => {
    setIsGoogleConnected(true);
    initializeSheets();
  };

  // If user hasn't logged in with Name, show LoginScreen
  if (!currentUser) {
    return (
      <LoginScreen 
        isGoogleConnected={isGoogleConnected} 
        onGoogleConnectSuccess={handleGoogleConnectSuccess} 
      />
    );
  }

  return (
    <div className="flex h-screen bg-slate-50 font-sans text-slate-800 overflow-hidden relative">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
      
      <main className="flex-1 flex flex-col p-6 lg:p-8 overflow-y-auto">
        <div className="max-w-7xl mx-auto w-full h-full flex flex-col relative">
          
          {/* Header Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 pb-4 mb-4 border-b border-slate-200/80">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-base shadow-sm">
                {currentUser.nama.charAt(0).toUpperCase()}
              </div>
              <div>
                <p className="text-xs text-slate-500 font-medium">Petugas Aktif</p>
                <div className="flex items-center gap-2">
                  <h2 className="text-sm font-bold text-slate-800">{currentUser.nama}</h2>
                  <span className="text-[11px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md font-semibold">
                    {currentUser.jabatan || 'Staf Keuangan'}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {/* Google Sheets Sync Indicator */}
              <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-white border border-slate-200 shadow-xs">
                {isGoogleConnected ? (
                  <>
                    <CheckCircle2 size={14} className="text-emerald-600" />
                    <span className="text-slate-700">Database Cloud: <strong className="text-emerald-700 font-bold">Terhubung</strong></span>
                  </>
                ) : (
                  <>
                    <CloudOff size={14} className="text-amber-500" />
                    <span className="text-slate-600">Database: <strong className="text-amber-600 font-semibold">Lokal</strong></span>
                  </>
                )}
              </div>

              <button 
                onClick={syncToSheets} 
                disabled={isSaving}
                className="bg-white border border-slate-200 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold text-slate-700 shadow-sm flex items-center gap-2 hover:bg-slate-50 transition-all disabled:opacity-50"
              >
                <RefreshCcw size={14} className={isSaving ? 'animate-spin text-blue-500' : ''} />
                {isSaving ? 'Menyimpan...' : 'Simpan ke Cloud'}
              </button>
            </div>
          </div>

          <div className="flex-1 flex flex-col pt-1">
            {activeTab === 'dashboard' && <Dashboard />}
            {activeTab === 'anggaran' && <Anggaran />}
            {activeTab === 'perjalanan_dinas' && <PerjalananDinas />}
            {activeTab === 'makan_minum' && <MakanMinum />}
          </div>
        </div>
      </main>
    </div>
  );
}

