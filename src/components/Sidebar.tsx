import React from 'react';
import { LayoutDashboard, Wallet, Plane, Coffee, FileText } from 'lucide-react';

type SidebarProps = {
  activeTab: string;
  setActiveTab: (tab: string) => void;
};

export const Sidebar = ({ activeTab, setActiveTab }: SidebarProps) => {
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'subkegiatan', label: 'Sub Kegiatan', icon: Wallet },
    { id: 'pd', label: 'Perjalanan Dinas', icon: Plane },
    { id: 'mm', label: 'Makan & Minum', icon: Coffee },
    { id: 'dpa', label: 'DPA', icon: FileText },
  ];

  return (
    <aside className="w-64 bg-white flex flex-col shrink-0 z-10 border-r border-slate-200">
      <div className="p-6 flex items-center gap-3">
        <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold shadow-sm">AK</div>
        <span className="text-lg font-bold tracking-tight text-slate-800">Arus Kas</span>
      </div>
      <nav className="mt-2 flex-1 px-3">
        <div className="px-3 py-2 text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Menu Utama</div>
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 mb-1.5 rounded-xl transition-all text-sm font-semibold focus:outline-none focus:ring-0 ${
                isActive 
                  ? 'bg-blue-50 text-blue-700 shadow-sm border border-blue-100/50' 
                  : 'text-slate-500 hover:bg-slate-50 hover:text-slate-700'
              }`}
            >
              <Icon size={20} className={isActive ? 'text-blue-600' : 'text-slate-400'} />
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>
      <div className="p-6 border-t border-slate-100">
        <div className="flex items-center gap-3 text-sm font-medium">
          <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse ring-2 ring-green-100"></div>
          <span className="text-slate-500">Online</span>
        </div>
      </div>
    </aside>
  );
};
