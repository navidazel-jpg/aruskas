import React, { useState } from 'react';
import { useAppContext } from '../store/AppContext';
import { X, Save, Database, Code } from 'lucide-react';

export const SettingsModal = ({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) => {
  const { gasUrl, setGasUrl, isSyncing, manualSync } = useAppContext();
  const [urlInput, setUrlInput] = useState(gasUrl);

  if (!isOpen) return null;

  const handleSave = () => {
    setGasUrl(urlInput);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-2xl shadow-xl overflow-hidden flex flex-col max-h-[90vh]">
        <div className="flex items-center justify-between p-6 border-b border-slate-100">
          <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <Database className="text-blue-500" />
            Pengaturan Database Google Sheets
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-lg transition-colors text-slate-500">
            <X size={20} />
          </button>
        </div>
        
        <div className="p-6 overflow-y-auto">
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Google Apps Script Web App URL</label>
              <input
                type="text"
                value={urlInput}
                onChange={(e) => setUrlInput(e.target.value)}
                placeholder="https://script.google.com/macros/s/AKfycby.../exec"
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              />
              <p className="text-sm text-slate-500 mt-2">
                Masukkan URL yang Anda dapatkan setelah mendeploy script `code.gs` sebagai Web App.
              </p>
            </div>

            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-sm text-amber-800">
              <h4 className="font-bold flex items-center gap-2 mb-2">
                <Code size={16} /> Cara Instalasi
              </h4>
              <ol className="list-decimal pl-4 space-y-2">
                <li>Buka file Google Sheets baru.</li>
                <li>Pilih menu <strong>Ekstensi &gt; Apps Script</strong>.</li>
                <li>Salin kode dari file <code>apps-script-code.gs</code> di project ini (lihat root folder) dan tempel ke editor Apps Script.</li>
                <li>Klik tombol <strong>Terapkan (Deploy) &gt; Deployment baru</strong>.</li>
                <li>Pilih jenis <strong>Aplikasi Web</strong>.</li>
                <li>Pilih Akses: <strong>Siapa saja (Anyone)</strong>.</li>
                <li>Klik Deploy, otorisasi akun Google Anda, dan salin URL Web App yang diberikan ke kotak di atas.</li>
              </ol>
            </div>
            
            <div className="pt-4 flex gap-3">
               <button
                  onClick={manualSync}
                  disabled={!gasUrl || isSyncing}
                  className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium rounded-xl transition-colors disabled:opacity-50"
                >
                  {isSyncing ? 'Menyinkronkan...' : 'Sinkronisasi Manual'}
                </button>
            </div>
          </div>
        </div>

        <div className="p-6 border-t border-slate-100 bg-slate-50 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-5 py-2.5 text-slate-600 font-medium hover:bg-slate-200 rounded-xl transition-colors"
          >
            Batal
          </button>
          <button
            onClick={handleSave}
            className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl flex items-center gap-2 transition-colors shadow-sm"
          >
            <Save size={18} />
            Simpan URL
          </button>
        </div>
      </div>
    </div>
  );
};
