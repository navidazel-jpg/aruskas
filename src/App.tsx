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
import { initAuth, googleSignIn } from './lib/auth';
import { useStore } from './store';
import { RefreshCcw } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [needsAuth, setNeedsAuth] = useState(true);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const { initializeSheets, syncToSheets, isSaving } = useStore();

  useEffect(() => {
    const unsubscribe = initAuth(
      (user, token) => {
        setNeedsAuth(false);
        initializeSheets();
      },
      () => setNeedsAuth(true)
    );
    return () => unsubscribe();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleLogin = async () => {
    setIsLoggingIn(true);
    try {
      const result = await googleSignIn();
      if (result) {
        setNeedsAuth(false);
        initializeSheets();
      }
    } catch (err) {
      console.error('Login failed:', err);
    } finally {
      setIsLoggingIn(false);
    }
  };

  if (needsAuth) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-50 font-sans text-slate-800">
        <div className="bg-white p-12 rounded-3xl shadow-xl max-w-md w-full text-center">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center text-white text-2xl font-bold shadow-lg shadow-blue-500/20 mx-auto mb-6">KF</div>
          <h1 className="text-2xl font-bold mb-2">Login ke KasFlow</h1>
          <p className="text-slate-500 mb-8">Penyimpanan terhubung dengan Google Sheets. Silakan masuk dengan akun Google Anda untuk melanjutkan.</p>
          
          <button onClick={handleLogin} disabled={isLoggingIn} className="gsi-material-button mx-auto w-full max-w-[280px] bg-white border border-slate-300 rounded-xl px-4 py-3 flex items-center justify-center gap-4 hover:bg-slate-50 transition-colors shadow-sm disabled:opacity-50">
            <svg version="1.1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" className="w-6 h-6">
              <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"></path>
              <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"></path>
              <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"></path>
              <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"></path>
              <path fill="none" d="M0 0h48v48H0z"></path>
            </svg>
            <span className="font-semibold text-slate-700">{isLoggingIn ? 'Memuat...' : 'Sign in with Google'}</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-slate-50 font-sans text-slate-800 overflow-hidden relative">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
      
      <main className="flex-1 flex flex-col p-8 overflow-y-auto">
        <div className="max-w-7xl mx-auto w-full h-full flex flex-col relative">
          
          <button 
            onClick={syncToSheets} 
            disabled={isSaving}
            className="absolute top-0 right-0 z-10 bg-white border border-slate-200 px-4 py-2 rounded-xl text-sm font-semibold text-slate-700 shadow-sm flex items-center gap-2 hover:bg-slate-50 transition-all disabled:opacity-50"
          >
            <RefreshCcw size={16} className={isSaving ? 'animate-spin text-blue-500' : ''} />
            {isSaving ? 'Menyimpan...' : 'Simpan ke Cloud'}
          </button>

          <div className="flex-1 flex flex-col pt-4">
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

