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
    { id: 'dpa', label: 'Dokumen DPA', icon: FileText },
  ];

  return (
    <aside className="w-64 bg-slate-900 text-slate-300 flex flex-col shrink-0 z-10 shadow-xl">
      <div className="p-6 flex items-center gap-3">
        <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center text-white font-bold">AK</div>
        <span className="text-lg font-semibold tracking-tight text-white">Arus Kas</span>
      </div>
      <nav className="mt-4 flex-1">
        <div className="px-6 py-2 text-xs font-semibold text-slate-500 uppercase tracking-wider">Menu Utama</div>
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-3 px-6 py-3 transition-colors ${
                isActive 
                  ? 'bg-slate-800 text-white border-r-4 border-blue-500' 
                  : 'hover:bg-slate-800 hover:text-white'
              }`}
            >
              <Icon size={20} className={isActive ? 'text-blue-500' : ''} />
              <span className="font-medium">{item.label}</span>
            </button>
          );
        })}
      </nav>
      <div className="p-6 border-t border-slate-800">
        <div className="flex items-center gap-3 text-sm">
          <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
          <span className="text-slate-400">Online</span>
        </div>
      </div>
    </aside>
  );
};
