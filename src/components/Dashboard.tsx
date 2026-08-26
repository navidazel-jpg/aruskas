import React, { useMemo, useState } from 'react';
import { useAppContext } from '../store/AppContext';
import { formatRupiah } from '../utils/formatters';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend, BarChart, Bar, XAxis, YAxis, CartesianGrid, LineChart, Line } from 'recharts';
import { Plane, Coffee, Briefcase, BarChart2, PieChart as PieChartIcon, Activity } from 'lucide-react';

export const Dashboard = () => {
  const { subKegiatans, pdTransactions, mmTransactions } = useAppContext();
  const [chartType, setChartType] = useState<'pie' | 'bar' | 'line'>('pie');
  
  // Computations for Global Chart

  const globalPdPagu = useMemo(() => subKegiatans.reduce((sum, item) => sum + (item.anggaranPerubahanPD > 0 ? item.anggaranPerubahanPD : item.anggaranMurniPD), 0), [subKegiatans]);
  const globalPdRealisasi = useMemo(() => pdTransactions.reduce((sum, item) => sum + item.total, 0), [pdTransactions]);
  const globalPdSisa = Math.max(0, globalPdPagu - globalPdRealisasi);

  const globalMmPagu = useMemo(() => subKegiatans.reduce((sum, item) => sum + (item.anggaranPerubahanMM > 0 ? item.anggaranPerubahanMM : item.anggaranMurniMM), 0), [subKegiatans]);
  const globalMmRealisasi = useMemo(() => mmTransactions.reduce((sum, item) => sum + item.grandTotal, 0), [mmTransactions]);
  const globalMmSisa = Math.max(0, globalMmPagu - globalMmRealisasi);

  const chartData = [
    { name: 'Realisasi PD', value: globalPdRealisasi, color: '#3b82f6' },
    { name: 'Sisa PD', value: globalPdSisa, color: '#93c5fd' },
    { name: 'Realisasi MM', value: globalMmRealisasi, color: '#10b981' },
    { name: 'Sisa MM', value: globalMmSisa, color: '#6ee7b7' },
  ];

  const globalPdPercent = globalPdPagu > 0 ? (globalPdRealisasi / globalPdPagu) * 100 : 0;
  const globalMmPercent = globalMmPagu > 0 ? (globalMmRealisasi / globalMmPagu) * 100 : 0;

  // Computations Per Sub Kegiatan
  const subKegiatanStats = useMemo(() => {
    return subKegiatans.map(sk => {
      const pdPagu = sk.anggaranPerubahanPD > 0 ? sk.anggaranPerubahanPD : sk.anggaranMurniPD;
      const pdRealisasi = pdTransactions.filter(tx => String(tx.subKegiatanId) === String(sk.id)).reduce((sum, tx) => sum + tx.total, 0);
      const pdSisa = Math.max(0, pdPagu - pdRealisasi);
      const pdPercent = pdPagu > 0 ? (pdRealisasi / pdPagu) * 100 : 0;

      const mmPagu = sk.anggaranPerubahanMM > 0 ? sk.anggaranPerubahanMM : sk.anggaranMurniMM;
      const mmRealisasi = mmTransactions.filter(tx => String(tx.subKegiatanId) === String(sk.id)).reduce((sum, tx) => sum + tx.grandTotal, 0);
      const mmSisa = Math.max(0, mmPagu - mmRealisasi);
      const mmPercent = mmPagu > 0 ? (mmRealisasi / mmPagu) * 100 : 0;

      return {
        ...sk, pdPagu, pdRealisasi, pdSisa, pdPercent, mmPagu, mmRealisasi, mmSisa, mmPercent
      };
    });
  }, [subKegiatans, pdTransactions, mmTransactions]);

  return (
    <div className="space-y-6">
      
      {/* Section: Total Keseluruhan (Terpisah) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-6">
        {/* Global PD Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden flex flex-col">
          <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-blue-50/50">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-blue-100 text-blue-600 rounded-xl"><Plane size={24} /></div>
              <div>
                <h3 className="font-bold text-slate-800">Perjalanan Dinas</h3>
                <p className="text-xs text-slate-500">Total Keseluruhan</p>
              </div>
            </div>
            <span className="text-xs font-bold px-3 py-1.5 bg-white text-blue-700 rounded-lg border border-blue-100 shadow-sm">
              {globalPdPercent.toFixed(1)}% Terserap
            </span>
          </div>
          <div className="p-6 grid grid-cols-1 sm:grid-cols-3 gap-6 sm:gap-4 divide-y sm:divide-y-0 sm:divide-x divide-slate-100">
            <div className="flex flex-col pt-4 sm:pt-0">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Total Pagu</span>
              <span className="text-lg font-bold text-slate-800">{formatRupiah(globalPdPagu)}</span>
            </div>
            <div className="flex flex-col pt-4 sm:pt-0 sm:pl-4">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Realisasi</span>
              <span className="text-lg font-bold text-slate-800">{formatRupiah(globalPdRealisasi)}</span>
            </div>
            <div className="flex flex-col pt-4 sm:pt-0 sm:pl-4">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Sisa</span>
              <span className="text-lg font-bold text-blue-600">{formatRupiah(globalPdSisa)}</span>
            </div>
          </div>
        </div>

        {/* Global MM Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden flex flex-col">
          <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-emerald-50/50">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-emerald-100 text-emerald-600 rounded-xl"><Coffee size={24} /></div>
              <div>
                <h3 className="font-bold text-slate-800">Makan & Minum</h3>
                <p className="text-xs text-slate-500">Total Keseluruhan</p>
              </div>
            </div>
            <span className="text-xs font-bold px-3 py-1.5 bg-white text-emerald-700 rounded-lg border border-emerald-100 shadow-sm">
              {globalMmPercent.toFixed(1)}% Terserap
            </span>
          </div>
          <div className="p-6 grid grid-cols-1 sm:grid-cols-3 gap-6 sm:gap-4 divide-y sm:divide-y-0 sm:divide-x divide-slate-100">
            <div className="flex flex-col pt-4 sm:pt-0">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Total Pagu</span>
              <span className="text-lg font-bold text-slate-800">{formatRupiah(globalMmPagu)}</span>
            </div>
            <div className="flex flex-col pt-4 sm:pt-0 sm:pl-4">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Realisasi</span>
              <span className="text-lg font-bold text-slate-800">{formatRupiah(globalMmRealisasi)}</span>
            </div>
            <div className="flex flex-col pt-4 sm:pt-0 sm:pl-4">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Sisa</span>
              <span className="text-lg font-bold text-emerald-600">{formatRupiah(globalMmSisa)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Section: Anggaran Per Sub Kegiatan */}
      <div>
        <h3 className="font-bold text-slate-800 text-lg mb-4 flex items-center gap-2">
          <Briefcase size={20} className="text-blue-500" /> Rincian Anggaran per Sub Kegiatan
        </h3>
        
        {subKegiatanStats.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center text-slate-400 text-sm font-medium">
            Belum ada data sub kegiatan yang ditambahkan. Silakan tambahkan melalui menu Master Sub Kegiatan.
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden divide-y divide-slate-100">
            {subKegiatanStats.map(stat => (
              <div key={stat.id} className="p-5 hover:bg-slate-50/50 transition-colors flex flex-col gap-3">
                <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-2">
                  <h4 className="font-bold text-slate-800 text-sm">{stat.nama}</h4>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-8 mt-1">
                  {/* Kolom PD */}
                  <div className="flex flex-col gap-1.5">
                    <div className="flex justify-between items-end">
                      <div className="flex items-center gap-1.5">
                        <Plane size={12} className="text-blue-500" />
                        <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider">Perjalanan Dinas</span>
                      </div>
                      <div className="text-xs font-bold text-slate-800">{formatRupiah(stat.pdSisa)}</div>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <div className="flex-1 h-1 bg-slate-100 rounded-full overflow-hidden">
                        <div className={`h-full ${stat.pdPercent > 80 ? 'bg-red-500' : 'bg-blue-500'} transition-all duration-500`} style={{ width: `${Math.min(stat.pdPercent, 100)}%` }}></div>
                      </div>
                      <span className="text-[9px] font-bold text-slate-400 w-6 text-right">{stat.pdPercent.toFixed(0)}%</span>
                    </div>
                  </div>

                  {/* Kolom MM */}
                  <div className="flex flex-col gap-1.5">
                    <div className="flex justify-between items-end">
                      <div className="flex items-center gap-1.5">
                        <Coffee size={12} className="text-emerald-500" />
                        <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider">Makan Minum</span>
                      </div>
                      <div className="text-xs font-bold text-slate-800">{formatRupiah(stat.mmSisa)}</div>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <div className="flex-1 h-1 bg-slate-100 rounded-full overflow-hidden">
                        <div className={`h-full ${stat.mmPercent > 80 ? 'bg-red-500' : 'bg-emerald-500'} transition-all duration-500`} style={{ width: `${Math.min(stat.mmPercent, 100)}%` }}></div>
                      </div>
                      <span className="text-[9px] font-bold text-slate-400 w-6 text-right">{stat.mmPercent.toFixed(0)}%</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Global Chart Section */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 flex flex-col">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6">
          <h3 className="font-bold text-slate-800">Rasio Penyerapan Anggaran Keseluruhan</h3>
          
          <div className="flex bg-slate-100 p-1 rounded-lg self-start sm:self-auto">
            <button 
              onClick={() => setChartType('pie')}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${chartType === 'pie' ? 'bg-white shadow-sm text-blue-600' : 'text-slate-500 hover:text-slate-700'}`}
            >
              <PieChartIcon size={14} /> Pie
            </button>
            <button 
              onClick={() => setChartType('bar')}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${chartType === 'bar' ? 'bg-white shadow-sm text-blue-600' : 'text-slate-500 hover:text-slate-700'}`}
            >
              <BarChart2 size={14} /> Bar
            </button>
            <button 
              onClick={() => setChartType('line')}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${chartType === 'line' ? 'bg-white shadow-sm text-blue-600' : 'text-slate-500 hover:text-slate-700'}`}
            >
              <Activity size={14} /> Line
            </button>
          </div>
        </div>

        <div className="h-80 w-full relative">
          {chartData.filter(d => d.value > 0).length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              {chartType === 'pie' ? (
                <PieChart>
                  <Pie
                    data={chartData.filter(d => d.value > 0)}
                    cx="50%"
                    cy="50%"
                    innerRadius={90}
                    outerRadius={120}
                    paddingAngle={3}
                    dataKey="value"
                    stroke="none"
                  >
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    formatter={(value: number) => formatRupiah(value)}
                    contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} 
                  />
                  <Legend verticalAlign="bottom" height={36} iconType="circle" />
                </PieChart>
              ) : chartType === 'bar' ? (
                <BarChart data={chartData.filter(d => d.value > 0)} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} dy={10} />
                  <YAxis 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fill: '#64748b', fontSize: 12 }} 
                    tickFormatter={(val) => {
                      if (val >= 1000000000) return `Rp${(val / 1000000000).toFixed(1)}M`;
                      if (val >= 1000000) return `Rp${(val / 1000000).toFixed(1)}Jt`;
                      return `Rp${val}`;
                    }}
                    dx={-10}
                  />
                  <Tooltip 
                    formatter={(value: number) => formatRupiah(value)}
                    contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} 
                    cursor={{ fill: '#f8fafc' }}
                  />
                  <Bar dataKey="value" radius={[6, 6, 0, 0]} maxBarSize={60}>
                    {chartData.filter(d => d.value > 0).map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              ) : (
                <LineChart data={chartData.filter(d => d.value > 0)} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} dy={10} />
                  <YAxis 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fill: '#64748b', fontSize: 12 }} 
                    tickFormatter={(val) => {
                      if (val >= 1000000000) return `Rp${(val / 1000000000).toFixed(1)}M`;
                      if (val >= 1000000) return `Rp${(val / 1000000).toFixed(1)}Jt`;
                      return `Rp${val}`;
                    }}
                    dx={-10}
                  />
                  <Tooltip 
                    formatter={(value: number) => formatRupiah(value)}
                    contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} 
                  />
                  <Line type="monotone" dataKey="value" stroke="#3b82f6" strokeWidth={3} dot={{ r: 6, fill: '#3b82f6', strokeWidth: 2, stroke: '#fff' }} activeDot={{ r: 8 }} />
                </LineChart>
              )}
            </ResponsiveContainer>
          ) : (
             <div className="w-full h-full flex flex-col items-center justify-center text-slate-400">
               <PieChart className="opacity-20 mb-4" width={120} height={120} />
               <p className="text-sm font-medium">Belum ada data anggaran yang diinput.</p>
             </div>
          )}
        </div>
      </div>
    </div>
  );
};
