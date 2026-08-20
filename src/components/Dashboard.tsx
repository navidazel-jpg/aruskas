import React from 'react';
import { useStore, formatRupiah } from '../store';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

export function Dashboard() {
  const { data } = useStore();

  const totalAnggaranPD = data.subKegiatan.reduce((sum, item) => {
    const pPerub = item.anggaranPerubahanPD || 0;
    const pMurni = item.anggaranMurniPD || 0;
    return sum + (pPerub > 0 ? pPerub : pMurni);
  }, 0);
  const totalAnggaranMM = data.subKegiatan.reduce((sum, item) => {
    const pPerub = item.anggaranPerubahanMM || 0;
    const pMurni = item.anggaranMurniMM || 0;
    return sum + (pPerub > 0 ? pPerub : pMurni);
  }, 0);
  
  const totalRealisasiPD = data.perjalananDinas.reduce((sum, item) => sum + item.total, 0);
  const totalRealisasiMM = data.makanMinum.reduce((sum, item) => sum + item.total, 0);
  
  const sisaAnggaranPD = totalAnggaranPD - totalRealisasiPD;
  const sisaAnggaranMM = totalAnggaranMM - totalRealisasiMM;
  
  const persenRealisasiPD = totalAnggaranPD > 0 ? ((totalRealisasiPD / totalAnggaranPD) * 100).toFixed(1) : '0';
  const persenRealisasiMM = totalAnggaranMM > 0 ? ((totalRealisasiMM / totalAnggaranMM) * 100).toFixed(1) : '0';

  const subKegiatanChartData = data.subKegiatan.map(sk => {
    const pPerubPD = sk.anggaranPerubahanPD || 0;
    const pMurniPD = sk.anggaranMurniPD || 0;
    const pPerubMM = sk.anggaranPerubahanMM || 0;
    const pMurniMM = sk.anggaranMurniMM || 0;

    const paguPD = pPerubPD > 0 ? pPerubPD : pMurniPD;
    const paguMM = pPerubMM > 0 ? pPerubMM : pMurniMM;
    const realisasiPD = data.perjalananDinas.filter(p => p.subKegiatanId === sk.id).reduce((s, i) => s + i.total, 0);
    const realisasiMM = data.makanMinum.filter(m => m.subKegiatanId === sk.id).reduce((s, i) => s + i.total, 0);
    return {
      nama: sk.nama.length > 15 ? sk.nama.substring(0, 15) + '...' : sk.nama,
      'Pagu PD': paguPD,
      'Realisasi PD': realisasiPD,
      'Pagu MM': paguMM,
      'Realisasi MM': realisasiMM
    };
  });

  const pieData = [
    { name: 'Perjalanan Dinas', value: totalRealisasiPD },
    { name: 'Makan Minum', value: totalRealisasiMM },
  ].filter(d => d.value > 0);

  return (
    <div className="flex flex-col h-full">
      <header className='flex justify-between items-center mb-8 shrink-0'>
        <div>
          <h2 className='text-2xl font-bold text-slate-900'>Monitoring Realisasi Arus Kas</h2>
          <p className='text-slate-500 mt-1'>Sistem Informasi Anggaran</p>
        </div>
        <div className='flex items-center gap-4'>
          <div className='flex -space-x-2'>
            <div className='w-8 h-8 rounded-full bg-slate-300 border-2 border-white flex items-center justify-center text-[10px] font-bold'>A</div>
            <div className='w-8 h-8 rounded-full bg-blue-300 border-2 border-white flex items-center justify-center text-[10px] font-bold'>B</div>
          </div>
        </div>
      </header>

      <div className='grid grid-cols-1 lg:grid-cols-12 lg:grid-rows-6 gap-4 flex-1 min-h-[600px]'>
        
        {/* Card 1: Sisa Anggaran PD */}
        <div className='col-span-1 lg:col-span-4 lg:row-span-2 bg-white rounded-3xl p-5 border border-slate-200 shadow-sm flex flex-col justify-between'>
          <div className='flex justify-between items-center'>
            <span className='text-sm font-semibold text-slate-500'>Sisa Anggaran (Perjalanan Dinas)</span>
            <span className={`text-[10px] px-2 py-1 rounded-full font-bold ${Number(persenRealisasiPD) > 80 ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'}`}>
              {Number(persenRealisasiPD) > 80 ? 'Warning' : 'Aman'}
            </span>
          </div>
          <h3 className='text-3xl font-black text-slate-900 mt-2'>{formatRupiah(sisaAnggaranPD)}</h3>
          <div className='w-full bg-slate-100 h-2 rounded-full mt-4 overflow-hidden'>
            <div className={`h-full rounded-full ${Number(persenRealisasiPD) > 80 ? 'bg-red-500' : 'bg-blue-500'}`} style={{ width: `${Math.min(100, Number(persenRealisasiPD))}%` }}></div>
          </div>
          <p className='text-[10px] text-slate-400 mt-2'>Realisasi: {persenRealisasiPD}% dari Pagu Aktif</p>
        </div>

        {/* Card 2: Sisa Anggaran MM */}
        <div className='col-span-1 lg:col-span-4 lg:row-span-2 bg-white rounded-3xl p-5 border border-slate-200 shadow-sm flex flex-col justify-between'>
          <div className='flex justify-between items-center mb-2'>
            <span className='text-sm font-semibold text-slate-500'>Sisa Anggaran (Makan Minum)</span>
            <span className={`text-[10px] px-2 py-1 rounded-full font-bold ${Number(persenRealisasiMM) > 80 ? 'bg-red-100 text-red-700' : 'bg-emerald-100 text-emerald-700'}`}>
              {Number(persenRealisasiMM) > 80 ? 'Warning' : 'Aman'}
            </span>
          </div>
          <h3 className='text-3xl font-black text-slate-900 mt-1'>{formatRupiah(sisaAnggaranMM)}</h3>
          <div className='w-full bg-slate-100 h-2 rounded-full mt-4 overflow-hidden'>
            <div className={`h-full rounded-full ${Number(persenRealisasiMM) > 80 ? 'bg-red-500' : 'bg-emerald-500'}`} style={{ width: `${Math.min(100, Number(persenRealisasiMM))}%` }}></div>
          </div>
          <p className='text-[10px] text-slate-400 mt-2'>Realisasi: {persenRealisasiMM}% dari Pagu Aktif</p>
        </div>

        {/* Card 3: Pie Chart (Komposisi) & Summary */}
        <div className='col-span-1 lg:col-span-4 lg:row-span-6 bg-white rounded-3xl p-6 border border-slate-200 shadow-sm flex flex-col'>
          <h3 className='text-lg font-bold mb-4 text-slate-900'>Total Keseluruhan</h3>
          
          <div className="bg-slate-50 p-4 rounded-2xl mb-4 border border-slate-100">
            <p className="text-xs text-slate-500 font-medium mb-1">Total Realisasi</p>
            <h4 className="text-2xl font-black text-slate-800">{formatRupiah(totalRealisasiPD + totalRealisasiMM)}</h4>
            <div className="flex justify-between mt-3 text-xs border-t border-slate-200 pt-2">
              <span className="text-slate-500">Pagu Total</span>
              <span className="font-bold text-slate-700">{formatRupiah(totalAnggaranPD + totalAnggaranMM)}</span>
            </div>
          </div>

          <h3 className='text-sm font-semibold mb-2 text-slate-600 mt-2'>Komposisi Pengeluaran</h3>
          <div className='flex-1 min-h-[200px] relative'>
            {pieData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={pieData} cx="50%" cy="50%" innerRadius={60} outerRadius={90} paddingAngle={5} dataKey="value" stroke="none">
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value: number) => formatRupiah(value)} contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}} />
                  <Legend verticalAlign="bottom" height={36} iconType="circle" />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="absolute inset-0 flex items-center justify-center text-slate-400 text-sm">Belum ada data pengeluaran</div>
            )}
          </div>
        </div>

        {/* Card 4: Bar Chart (Status Sub Kegiatan) */}
        <div className='col-span-1 lg:col-span-5 lg:row-span-4 bg-white rounded-3xl p-6 border border-slate-200 shadow-sm flex flex-col'>
          <div className='flex justify-between items-center mb-6'>
            <h3 className='text-lg font-bold text-slate-900'>Status Anggaran per Sub Kegiatan</h3>
          </div>
          <div className='flex flex-wrap gap-3 mb-4'>
            <span className='flex items-center gap-1 text-[10px] font-bold text-slate-500'><div className='w-2 h-2 rounded-full bg-[#3b82f6]'></div> Pagu PD</span>
            <span className='flex items-center gap-1 text-[10px] font-bold text-slate-500'><div className='w-2 h-2 rounded-full bg-[#93c5fd]'></div> Realisasi PD</span>
            <span className='flex items-center gap-1 text-[10px] font-bold text-slate-500'><div className='w-2 h-2 rounded-full bg-[#10b981]'></div> Pagu MM</span>
            <span className='flex items-center gap-1 text-[10px] font-bold text-slate-500'><div className='w-2 h-2 rounded-full bg-[#6ee7b7]'></div> Realisasi MM</span>
          </div>
          <div className='flex-1 w-full min-h-[200px]'>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={subKegiatanChartData} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="nama" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 10, fontWeight: 500}} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 10}} tickFormatter={(value) => `Rp ${value / 1000000}Jt`} />
                <Tooltip cursor={{fill: '#f8fafc'}} formatter={(value: number) => formatRupiah(value)} contentStyle={{borderRadius: '16px', border: '1px solid #e2e8f0', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)'}} />
                <Bar dataKey="Pagu PD" fill="#3b82f6" radius={[4, 4, 0, 0]} maxBarSize={15} />
                <Bar dataKey="Realisasi PD" fill="#93c5fd" radius={[4, 4, 0, 0]} maxBarSize={15} />
                <Bar dataKey="Pagu MM" fill="#10b981" radius={[4, 4, 0, 0]} maxBarSize={15} />
                <Bar dataKey="Realisasi MM" fill="#6ee7b7" radius={[4, 4, 0, 0]} maxBarSize={15} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Card 5: Sisa Makan Minum per Sub Kegiatan */}
        <div className='col-span-1 lg:col-span-3 lg:row-span-4 bg-white rounded-3xl p-6 border border-slate-200 shadow-sm flex flex-col'>
          <h3 className='text-sm font-bold mb-4 text-slate-900'>Detail Sisa Makan Minum</h3>
          <div className='flex-1 overflow-y-auto pr-2 space-y-3'>
            {data.subKegiatan.map(sk => {
              const pPerub = sk.anggaranPerubahanMM || 0;
              const pMurni = sk.anggaranMurniMM || 0;
              const pagu = pPerub > 0 ? pPerub : pMurni;
              const realisasi = data.makanMinum.filter(m => m.subKegiatanId === sk.id).reduce((s, i) => s + i.total, 0);
              const sisa = pagu - realisasi;
              const persen = pagu > 0 ? (realisasi / pagu) * 100 : 0;
              
              return (
                <div key={sk.id} className='bg-slate-50 p-3 rounded-2xl border border-slate-100'>
                  <p className='text-[11px] font-bold text-slate-700 leading-tight mb-2'>{sk.nama}</p>
                  <div className='flex justify-between items-end'>
                    <div>
                      <p className='text-[9px] text-slate-400 mb-0.5'>Sisa Anggaran</p>
                      <p className={`text-sm font-black ${sisa < 0 ? 'text-red-600' : 'text-emerald-600'}`}>
                        {formatRupiah(sisa)}
                      </p>
                    </div>
                    <div className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md ${persen > 80 ? 'bg-red-100 text-red-600' : 'bg-emerald-100 text-emerald-600'}`}>
                      {persen.toFixed(0)}%
                    </div>
                  </div>
                </div>
              );
            })}
            {data.subKegiatan.length === 0 && (
              <p className='text-xs text-center text-slate-400 italic py-4'>Belum ada data</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
