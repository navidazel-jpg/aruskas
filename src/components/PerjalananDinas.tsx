import React, { useState } from 'react';
import { useStore, formatRupiah, formatNumberInput, parseNumberInput, formatDateSafe } from '../store';
import { Plus, Trash2, UserPlus, X } from 'lucide-react';
import { Personil } from '../types';

export function PerjalananDinas() {
  const { data, addPerjalananDinas, deletePerjalananDinas } = useStore();
  
  const [formData, setFormData] = useState({
    subKegiatanId: '',
    judul: '',
    wilayah: '',
    tanggal: ''
  });

  const [personilList, setPersonilList] = useState<Personil[]>([]);
  const [currentPersonil, setCurrentPersonil] = useState({ nama: '', nominal: '' });

  const handleAddPersonil = () => {
    if (!currentPersonil.nama || !currentPersonil.nominal) return;
    
    setPersonilList([
      ...personilList, 
      { 
        id: crypto.randomUUID(), 
        nama: currentPersonil.nama, 
        nominal: parseNumberInput(currentPersonil.nominal) 
      }
    ]);
    setCurrentPersonil({ nama: '', nominal: '' });
  };

  const handleRemovePersonil = (id: string) => {
    setPersonilList(personilList.filter(p => p.id !== id));
  };

  const totalNominal = personilList.reduce((sum, p) => sum + p.nominal, 0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.subKegiatanId) {
      alert('Pilih sub kegiatan terlebih dahulu!');
      return;
    }
    if (personilList.length === 0) {
      alert('Tambahkan minimal 1 personil yang melaksanakan tugas!');
      return;
    }

    addPerjalananDinas({
      subKegiatanId: formData.subKegiatanId,
      judul: formData.judul,
      wilayah: formData.wilayah,
      tanggal: formData.tanggal,
      personil: personilList,
      total: totalNominal
    });

    setFormData({ subKegiatanId: '', judul: '', wilayah: '', tanggal: '' });
    setPersonilList([]);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-900">Perjalanan Dinas</h2>
        <p className="text-slate-500 text-sm mt-1">Input SPPD dan biaya personil.</p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2 bg-white p-6 rounded-3xl shadow-sm border border-slate-200">
          <h3 className="text-lg font-semibold mb-4 text-slate-800 border-b border-slate-100 pb-2">Informasi Perjalanan</h3>
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Sub Kegiatan (Sumber Dana)</label>
              <select
                required
                value={formData.subKegiatanId}
                onChange={(e) => setFormData({ ...formData, subKegiatanId: e.target.value })}
                className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
              >
                <option value="">-- Pilih Sub Kegiatan --</option>
                {data.subKegiatan.map(sk => (
                  <option key={sk.id} value={sk.id}>{sk.nama}</option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Judul Perjalanan Dinas</label>
              <input
                type="text"
                required
                className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                placeholder="Contoh: Kunjungan Kerja ke Kementerian"
                value={formData.judul}
                onChange={(e) => setFormData({ ...formData, judul: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Wilayah Tujuan</label>
                <input
                  type="text"
                  required
                  className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                  placeholder="Contoh: Jakarta"
                  value={formData.wilayah}
                  onChange={(e) => setFormData({ ...formData, wilayah: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Tanggal Keberangkatan</label>
                <input
                  type="date"
                  required
                  className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                  value={formData.tanggal}
                  onChange={(e) => setFormData({ ...formData, tanggal: e.target.value })}
                />
              </div>
            </div>

            <div className="pt-4 flex justify-end">
              <button
                type="submit"
                className="flex items-center px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium shadow-sm shadow-blue-200 transition-colors"
              >
                <Plus size={18} className="mr-2" />
                Simpan Transaksi
              </button>
            </div>
          </form>
        </div>

        {/* Personil Panel */}
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200 flex flex-col">
          <h3 className="text-lg font-semibold mb-4 text-slate-800 border-b border-slate-100 pb-2">Personil Tugas</h3>
          
          <div className="space-y-3 mb-6">
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1">Nama Personil</label>
              <input
                type="text"
                className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                placeholder="Nama Lengkap"
                value={currentPersonil.nama}
                onChange={(e) => setCurrentPersonil({ ...currentPersonil, nama: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1">Nominal (Rp)</label>
              <input
                type="text"
                className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                placeholder="0"
                value={currentPersonil.nominal}
                onChange={(e) => setCurrentPersonil({ ...currentPersonil, nominal: formatNumberInput(e.target.value) })}
              />
            </div>
            <button
              type="button"
              onClick={handleAddPersonil}
              className="w-full flex items-center justify-center px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-lg text-sm font-medium transition-colors"
            >
              <UserPlus size={16} className="mr-2" />
              Tambah Personil
            </button>
          </div>

          <div className="flex-1 overflow-y-auto min-h-[150px]">
            {personilList.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-slate-400">
                <UserPlus size={32} className="mb-2 opacity-50" />
                <p className="text-sm">Belum ada personil ditambahkan</p>
              </div>
            ) : (
              <ul className="space-y-2">
                {personilList.map((p, i) => (
                  <li key={p.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-100">
                    <div>
                      <div className="text-sm font-semibold text-slate-800">{i + 1}. {p.nama}</div>
                      <div className="text-xs text-blue-600 font-medium">{formatRupiah(p.nominal)}</div>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemovePersonil(p.id)}
                      className="text-slate-400 hover:text-red-500 transition-colors"
                    >
                      <X size={16} />
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="mt-4 pt-4 border-t border-slate-100">
            <div className="flex justify-between items-end">
              <span className="text-sm font-medium text-slate-500">Total Biaya</span>
              <span className="text-xl font-bold text-slate-800">{formatRupiah(totalNominal)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* History Table */}
      <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden mt-8">
        <div className="px-6 py-4 border-b border-slate-100 bg-slate-50">
          <h3 className="font-semibold text-slate-800">Riwayat Perjalanan Dinas</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="text-slate-700 font-semibold border-b border-slate-100">
              <tr>
                <th className="px-6 py-4">Tanggal</th>
                <th className="px-6 py-4">Judul & Wilayah</th>
                <th className="px-6 py-4">Sub Kegiatan</th>
                <th className="px-6 py-4">Personil</th>
                <th className="px-6 py-4 text-right">Total Biaya</th>
                <th className="px-6 py-4 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {data.perjalananDinas.length === 0 ? (
                 <tr>
                 <td colSpan={6} className="px-6 py-8 text-center text-slate-400 italic">
                   Belum ada riwayat perjalanan dinas.
                 </td>
               </tr>
              ) : (
                data.perjalananDinas.sort((a,b) => b.createdAt - a.createdAt).map(item => {
                  const subKegiatan = data.subKegiatan.find(sk => sk.id === item.subKegiatanId);
                  return (
                    <tr key={item.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">{formatDateSafe(item.tanggal)}</td>
                      <td className="px-6 py-4">
                        <div className="font-medium text-slate-800">{item.judul}</div>
                        <div className="text-xs text-slate-500 mt-0.5">Tujuan: {item.wilayah}</div>
                      </td>
                      <td className="px-6 py-4 text-slate-500">{subKegiatan?.nama || 'Unknown'}</td>
                      <td className="px-6 py-4">
                        <div className="text-xs space-y-1">
                          {item.personil.map(p => (
                            <div key={p.id} className="flex justify-between">
                              <span className="truncate w-24 text-slate-700">{p.nama}</span>
                              <span className="text-slate-500">{formatRupiah(p.nominal)}</span>
                            </div>
                          ))}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right font-semibold text-emerald-600">{formatRupiah(item.total)}</td>
                      <td className="px-6 py-4 text-center">
                        <button onClick={() => deletePerjalananDinas(item.id)} className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                          <Trash2 size={16} />
                        </button>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
