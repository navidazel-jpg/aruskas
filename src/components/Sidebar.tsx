import { LayoutDashboard, WalletCards, PlaneTakeoff, Coffee, LogOut, User } from 'lucide-react';
import { clsx } from 'clsx';
import { useStore, formatRupiah } from '../store';

type SidebarProps = {
  activeTab: string;
  setActiveTab: (tab: string) => void;
};

export function Sidebar({ activeTab, setActiveTab }: SidebarProps) {
  const { data, currentUser, logoutUser } = useStore();
  const totalAnggaran = data.subKegiatan.reduce((sum, item) => {
    const pPerubPD = item.anggaranPerubahanPD || 0;
    const pMurniPD = item.anggaranMurniPD || 0;
    const pPerubMM = item.anggaranPerubahanMM || 0;
    const pMurniMM = item.anggaranMurniMM || 0;
    return sum + (pPerubPD > 0 ? pPerubPD : pMurniPD) + (pPerubMM > 0 ? pPerubMM : pMurniMM);
  }, 0);

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'anggaran', label: 'Sub Kegiatan', icon: WalletCards },
    { id: 'perjalanan_dinas', label: 'Perjalanan Dinas', icon: PlaneTakeoff },
    { id: 'makan_minum', label: 'Makan & Minum', icon: Coffee },
  ];

  const userInitial = currentUser?.nama ? currentUser.nama.charAt(0).toUpperCase() : 'U';

  return (
    <aside className="w-64 bg-slate-900 flex flex-col flex-shrink-0">
      <div className="p-5 border-b border-slate-800/50">
        <div className="flex items-start gap-3">
          <div className="w-9 h-9 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center text-xs font-bold text-white shadow-lg shadow-blue-500/20 flex-shrink-0 mt-0.5">
            MAK
          </div>
          <div className="flex flex-col">
            <h1 className="text-sm font-bold text-white leading-snug">
              Monitoring Arus Kas
            </h1>
            <p className="text-[10px] text-slate-400 leading-tight mt-0.5 font-medium">
              Dinas Komunikasi dan Informatika Kalbar
            </p>
          </div>
        </div>
      </div>
      <nav className="flex-1 px-4 space-y-2 mt-6">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={clsx(
                "group w-full flex items-center gap-3 px-3 py-2.5 rounded-2xl transition-all text-left",
                isActive 
                  ? "bg-white/10 text-white shadow-sm" 
                  : "text-slate-400 hover:bg-white/5 hover:text-slate-200"
              )}
            >
              <div className={clsx(
                "p-2 rounded-xl flex items-center justify-center flex-shrink-0 transition-colors", 
                isActive ? "bg-blue-500 text-white shadow-md shadow-blue-500/20" : "bg-slate-800 text-slate-400 group-hover:bg-slate-700 group-hover:text-slate-200"
              )}>
                <Icon size={18} />
              </div>
              <span className="font-medium text-sm">{item.label}</span>
            </button>
          );
        })}
      </nav>

      <div className="p-4 space-y-3 mt-auto border-t border-slate-800/60">
        <div className="p-3.5 bg-slate-800/40 rounded-2xl border border-slate-700/40">
          <p className="text-[11px] text-slate-400 uppercase tracking-wider mb-1 font-semibold">Anggaran Total</p>
          <p className="text-base font-bold text-white tracking-tight">{formatRupiah(totalAnggaran)}</p>
        </div>

        {currentUser && (
          <div className="p-3 bg-slate-800/70 rounded-2xl border border-slate-700/60 flex items-center justify-between gap-2">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white font-bold flex items-center justify-center text-xs flex-shrink-0">
                {userInitial}
              </div>
              <div className="overflow-hidden">
                <p className="text-xs font-bold text-white truncate leading-tight">
                  {currentUser.nama}
                </p>
                <p className="text-[10px] text-slate-400 truncate mt-0.5">
                  {currentUser.jabatan || 'Pengguna'}
                </p>
              </div>
            </div>
            <button
              onClick={logoutUser}
              title="Ganti Pengguna / Keluar"
              className="p-1.5 text-slate-400 hover:text-red-400 hover:bg-slate-700/60 rounded-lg transition-colors flex-shrink-0"
            >
              <LogOut size={16} />
            </button>
          </div>
        )}
      </div>
    </aside>
  );
}
