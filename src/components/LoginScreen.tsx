import React, { useState } from 'react';
import { useStore } from '../store';
import { UserCheck, Plus, ArrowRight, ShieldCheck, Database, CheckCircle2, UserPlus, Trash2, Sparkles } from 'lucide-react';
import { googleSignIn, getAccessToken } from '../lib/auth';

type LoginScreenProps = {
  isGoogleConnected: boolean;
  onGoogleConnectSuccess: () => void;
};

export function LoginScreen({ isGoogleConnected, onGoogleConnectSuccess }: LoginScreenProps) {
  const { registeredUsers, loginAsUser, addRegisteredUser, deleteRegisteredUser } = useStore();
  
  const [selectedName, setSelectedName] = useState('');
  const [customName, setCustomName] = useState('');
  const [customJabatan, setCustomJabatan] = useState('');
  const [isAddingUser, setIsAddingUser] = useState(false);
  const [isConnectingGoogle, setIsConnectingGoogle] = useState(false);
  const [showManageUsers, setShowManageUsers] = useState(false);

  const handleSelectQuickUser = (user: { nama: string; jabatan: string }) => {
    loginAsUser(user.nama, user.jabatan);
  };

  const handleSubmitCustom = (e: React.FormEvent) => {
    e.preventDefault();
    const finalName = customName.trim();
    if (!finalName) return;
    loginAsUser(finalName, customJabatan.trim() || 'Staf Keuangan');
  };

  const handleAddNewUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customName.trim()) return;
    addRegisteredUser(customName.trim(), customJabatan.trim() || 'Staf Keuangan');
    setCustomName('');
    setCustomJabatan('');
    setIsAddingUser(false);
  };

  const handleConnectGoogle = async () => {
    setIsConnectingGoogle(true);
    try {
      const result = await googleSignIn();
      if (result) {
        onGoogleConnectSuccess();
      }
    } catch (err) {
      console.error('Google Sign In failed:', err);
    } finally {
      setIsConnectingGoogle(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-950 flex flex-col justify-center items-center p-4 sm:p-6 text-slate-100 font-sans">
      <div className="w-full max-w-xl">
        
        {/* App Branding Card */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-tr from-blue-600 to-indigo-500 rounded-3xl shadow-xl shadow-blue-500/25 ring-4 ring-white/10 mb-4 transform transition-transform hover:scale-105">
            <span className="text-xl font-black text-white tracking-wider">MAK</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Monitoring Arus Kas
          </h1>
          <p className="text-xs sm:text-sm font-medium text-blue-400 mt-1 uppercase tracking-wider">
            Dinas Komunikasi dan Informatika Kalbar
          </p>
        </div>

        {/* Login Main Box */}
        <div className="bg-white text-slate-800 rounded-3xl shadow-2xl p-6 sm:p-8 border border-slate-100 backdrop-blur-lg">
          
          <div className="flex items-center justify-between pb-4 mb-6 border-b border-slate-100">
            <div>
              <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                <UserCheck className="text-blue-600" size={20} />
                Pilih Nama Pengguna
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Cukup pilih atau masukkan nama Anda untuk mulai bekerja
              </p>
            </div>
            <button
              onClick={() => setShowManageUsers(!showManageUsers)}
              className="text-xs font-semibold text-blue-600 hover:text-blue-700 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-xl transition-colors"
            >
              {showManageUsers ? 'Selesai' : 'Kelola Nama'}
            </button>
          </div>

          {/* Quick Select User List */}
          {!isAddingUser && (
            <div className="space-y-2.5 mb-6">
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                Daftar Nama Terdaftar
              </label>
              
              <div className="grid grid-cols-1 gap-2.5 max-h-60 overflow-y-auto pr-1">
                {(registeredUsers || []).map((u) => {
                  const initial = u.nama.charAt(0).toUpperCase();
                  return (
                    <div 
                      key={u.id}
                      className="group flex items-center justify-between p-3 rounded-2xl border border-slate-200/80 hover:border-blue-500 hover:bg-blue-50/50 hover:shadow-sm transition-all"
                    >
                      <button
                        type="button"
                        onClick={() => handleSelectQuickUser(u)}
                        className="flex-1 flex items-center gap-3.5 text-left focus:outline-none"
                      >
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white font-bold flex items-center justify-center text-sm shadow-md shadow-blue-500/20 group-hover:scale-105 transition-transform flex-shrink-0">
                          {initial}
                        </div>
                        <div className="overflow-hidden">
                          <p className="font-bold text-slate-800 text-sm group-hover:text-blue-700 transition-colors truncate">
                            {u.nama}
                          </p>
                          <p className="text-xs text-slate-500 font-medium truncate">
                            {u.jabatan || 'Staf Keuangan'}
                          </p>
                        </div>
                      </button>

                      {showManageUsers ? (
                        <button
                          type="button"
                          onClick={() => deleteRegisteredUser(u.id)}
                          className="p-2 text-red-500 hover:bg-red-50 rounded-xl transition-colors"
                          title="Hapus Nama"
                        >
                          <Trash2 size={16} />
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => handleSelectQuickUser(u)}
                          className="px-3 py-1.5 text-xs font-semibold text-blue-600 group-hover:bg-blue-600 group-hover:text-white rounded-xl transition-all flex items-center gap-1"
                        >
                          Masuk
                          <ArrowRight size={14} />
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Form for Custom / New User Input */}
          {!isAddingUser ? (
            <div className="pt-2">
              <button
                type="button"
                onClick={() => setIsAddingUser(true)}
                className="w-full py-3 px-4 border-2 border-dashed border-slate-300 hover:border-blue-500 hover:bg-blue-50/40 text-slate-600 hover:text-blue-600 rounded-2xl text-xs font-bold transition-all flex items-center justify-center gap-2"
              >
                <Plus size={16} />
                Masukkan Nama Lainnya
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmitCustom} className="space-y-4 pt-2 border-t border-slate-100">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                  <UserPlus size={15} className="text-blue-600" />
                  Masuk dengan Nama Baru
                </span>
                <button
                  type="button"
                  onClick={() => setIsAddingUser(false)}
                  className="text-xs text-slate-400 hover:text-slate-600 font-medium"
                >
                  Batal
                </button>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                  Nama Lengkap <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  autoFocus
                  placeholder="Contoh: Budi Santoso"
                  value={customName}
                  onChange={(e) => setCustomName(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                  Jabatan / Posisi (Opsional)
                </label>
                <input
                  type="text"
                  placeholder="Contoh: Bendahara / Staf Pengelola"
                  value={customJabatan}
                  onChange={(e) => setCustomJabatan(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="submit"
                  className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold py-3 px-4 rounded-xl text-sm shadow-md shadow-blue-500/20 transition-all flex items-center justify-center gap-2"
                >
                  <span>Masuk Sekarang</span>
                  <ArrowRight size={16} />
                </button>
                <button
                  type="button"
                  onClick={handleAddNewUser}
                  title="Simpan nama ini ke daftar agar bisa dipilih langsung lain kali"
                  className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold py-3 px-4 rounded-xl text-xs transition-colors"
                >
                  Daftarkan Permanen
                </button>
              </div>
            </form>
          )}

          {/* Database Connection Status Section */}
          <div className="mt-8 pt-5 border-t border-slate-100">
            <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100 flex items-start justify-between gap-3">
              <div className="flex items-start gap-3">
                <div className={`p-2 rounded-xl mt-0.5 ${isGoogleConnected ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                  <Database size={18} />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <p className="text-xs font-bold text-slate-800">
                      Basis Data Google Sheets:
                    </p>
                    {isGoogleConnected ? (
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200/60">
                        <CheckCircle2 size={12} />
                        Terhubung
                      </span>
                    ) : (
                      <span className="text-[11px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200/60">
                        Perlu Disinkronkan
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">
                    {isGoogleConnected 
                      ? 'Tersambung ke Google Spreadsheet ("KasFlow Data"). Semua pencatatan kas otomatis tersimpan ke cloud.'
                      : 'Sinkronkan sekali dengan akun Google Master database untuk mengaktifkan pencatatan cloud.'}
                  </p>
                </div>
              </div>

              {!isGoogleConnected && (
                <button
                  onClick={handleConnectGoogle}
                  disabled={isConnectingGoogle}
                  className="flex-shrink-0 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 px-3.5 py-2 rounded-xl shadow-sm transition-all flex items-center gap-1.5 disabled:opacity-50"
                >
                  <Sparkles size={14} className="text-amber-400" />
                  {isConnectingGoogle ? 'Menghubungkan...' : 'Hubungkan'}
                </button>
              )}
            </div>
          </div>

        </div>

        {/* Footer info */}
        <p className="text-center text-xs text-slate-400 mt-6">
          Sistem Informasi Monitoring Arus Kas Internal &copy; {new Date().getFullYear()} Diskominfo Kalbar
        </p>

      </div>
    </div>
  );
}
