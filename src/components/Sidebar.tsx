import { LayoutDashboard, WalletCards, PlaneTakeoff, Coffee } from 'lucide-react';
import { clsx } from 'clsx';
import { useStore, formatRupiah } from '../store';

type SidebarProps = {
  activeTab: string;
  setActiveTab: (tab: string) => void;
};

export function Sidebar({ activeTab, setActiveTab }: SidebarProps) {
  const { data } = useStore();
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

  return (
    <aside className="w-64 bg-slate-900 flex flex-col flex-shrink-0">
      <div className="p-6 border-b border-slate-800/50">
        <h1 className="text-xl font-bold text-white flex items-center gap-3">
          <div className="w-9 h-9 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center text-xs shadow-lg shadow-blue-500/20">KF</div>
          KasFlow
        </h1>
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
      <div className="p-6 mt-auto">
        <div className="p-4 bg-slate-800/50 rounded-2xl border border-slate-700/50">
          <p className="text-xs text-slate-400 uppercase tracking-wider mb-1 font-semibold">Anggaran Total</p>
          <p className="text-lg font-bold text-white tracking-tight">{formatRupiah(totalAnggaran)}</p>
        </div>
      </div>
    </aside>
  );
}
