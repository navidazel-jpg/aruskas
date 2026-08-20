import React, { useState } from 'react';
import { useStore, formatRupiah, formatNumberInput, parseNumberInput } from '../store';
import { Plus, Edit2, Trash2 } from 'lucide-react';
import { SubKegiatan } from '../types';

export function Anggaran() {
  const { data, addSubKegiatan, updateSubKegiatan, deleteSubKegiatan } = useStore();
  const [isEditing, setIsEditing] = useState(false);
  const [currentId, setCurrentId] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    nama: '',
    anggaranMurniPD: '',
    anggaranPerubahanPD: '',
    anggaranMurniMM: '',
    anggaranPerubahanMM: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      nama: formData.nama,
      anggaranMurniPD: parseNumberInput(formData.anggaranMurniPD) || 0,
      anggaranPerubahanPD: parseNumberInput(formData.anggaranPerubahanPD) || 0,
      anggaranMurniMM: parseNumberInput(formData.anggaranMurniMM) || 0,
      anggaranPerubahanMM: parseNumberInput(formData.anggaranPerubahanMM) || 0
    };

    if (isEditing && currentId) {
      updateSubKegiatan(currentId, payload);
    } else {
      addSubKegiatan(payload);
    }

    setFormData({ nama: '', anggaranMurniPD: '', anggaranPerubahanPD: '', anggaranMurniMM: '', anggaranPerubahanMM: '' });
    setIsEditing(false);
    setCurrentId(null);
  };

  const handleEdit = (item: SubKegiatan) => {
    setFormData({
      nama: item.nama || '',
      anggaranMurniPD: formatNumberInput(item.anggaranMurniPD || 0),
      anggaranPerubahanPD: formatNumberInput(item.anggaranPerubahanPD || 0),
      anggaranMurniMM: formatNumberInput(item.anggaranMurniMM || 0),
      anggaranPerubahanMM: formatNumberInput(item.anggaranPerubahanMM || 0)
    });
    setIsEditing(true);
    setCurrentId(item.id);
  };

  const getRealisasiPD = (subId: string) => {
    return data.perjalananDinas
      .filter(p => p.subKegiatanId === subId)
      .reduce((sum, item) => sum + item.total, 0);
  };

  const getRealisasiMM = (subId: string) => {
    return data.makanMinum
      .filter(m => m.subKegiatanId === subId)
      .reduce((sum, item) => sum + item.total, 0);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Master Sub Kegiatan</h2>
          <p className="text-slate-500 text-sm mt-1">Kelola anggaran murni dan perubahan per kegiatan.</p>
        </div>
      </div>

      <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200">
        <h3 className="text-lg font-semibold mb-6 text-slate-800">
          {isEditing ? 'Edit Sub Kegiatan' : 'Tambah Sub Kegiatan Baru'}
        </h3>
        <form onSubmit={handleSubmit} className="space-y-6">
          
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Nama Sub Kegiatan</label>
            <input
              type="text"
              required
              className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
              placeholder="Contoh: Rapat Koordinasi Tahunan"
              value={formData.nama}
              onChange={(e) => setFormData({ ...formData, nama: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4 p-4 bg-blue-50/50 rounded-2xl border border-blue-100">
              <h4 className="font-semibold text-blue-800 text-sm border-b border-blue-200 pb-2">Perjalanan Dinas</h4>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Pagu Murni (Rp)</label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                    placeholder="0"
                    value={formData.anggaranMurniPD}
                    onChange={(e) => setFormData({ ...formData, anggaranMurniPD: formatNumberInput(e.target.value) })}
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Pagu Perubahan (Rp)</label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                    placeholder="0"
                    value={formData.anggaranPerubahanPD}
                    onChange={(e) => setFormData({ ...formData, anggaranPerubahanPD: formatNumberInput(e.target.value) })}
                  />
                </div>
              </div>
            </div>

            <div className="space-y-4 p-4 bg-emerald-50/50 rounded-2xl border border-emerald-100">
              <h4 className="font-semibold text-emerald-800 text-sm border-b border-emerald-200 pb-2">Makan Minum Rapat</h4>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Pagu Murni (Rp)</label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                    placeholder="0"
                    value={formData.anggaranMurniMM}
                    onChange={(e) => setFormData({ ...formData, anggaranMurniMM: formatNumberInput(e.target.value) })}
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Pagu Perubahan (Rp)</label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                    placeholder="0"
                    value={formData.anggaranPerubahanMM}
                    onChange={(e) => setFormData({ ...formData, anggaranPerubahanMM: formatNumberInput(e.target.value) })}
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-2">
            {isEditing && (
              <button
                type="button"
                onClick={() => {
                  setIsEditing(false);
                  setFormData({ nama: '', anggaranMurniPD: '', anggaranPerubahanPD: '', anggaranMurniMM: '', anggaranPerubahanMM: '' });
                }}
                className="mr-3 px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-xl font-medium transition-colors"
              >
                Batal
              </button>
            )}
            <button
              type="submit"
              className="flex items-center px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium shadow-sm shadow-blue-200 transition-colors"
            >
              {isEditing ? <Edit2 size={18} className="mr-2" /> : <Plus size={18} className="mr-2" />}
              {isEditing ? 'Simpan Perubahan' : 'Tambah Kegiatan'}
            </button>
          </div>
        </form>
      </div>

      <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50 text-slate-700 font-semibold border-b border-slate-100">
              <tr>
                <th className="px-4 py-4" rowSpan={2}>Sub Kegiatan</th>
                <th className="px-4 py-2 text-center border-b border-slate-200 bg-blue-50/50" colSpan={4}>Perjalanan Dinas</th>
                <th className="px-4 py-2 text-center border-b border-slate-200 bg-emerald-50/50" colSpan={4}>Makan Minum</th>
                <th className="px-4 py-4 text-center" rowSpan={2}>Aksi</th>
              </tr>
              <tr>
                <th className="px-2 py-2 text-right text-xs bg-blue-50/30">Pagu Aktif</th>
                <th className="px-2 py-2 text-right text-xs bg-blue-50/30">Realisasi</th>
                <th className="px-2 py-2 text-right text-xs bg-blue-50/30">Sisa</th>
                <th className="px-2 py-2 text-right text-xs bg-blue-50/30">%</th>
                <th className="px-2 py-2 text-right text-xs bg-emerald-50/30">Pagu Aktif</th>
                <th className="px-2 py-2 text-right text-xs bg-emerald-50/30">Realisasi</th>
                <th className="px-2 py-2 text-right text-xs bg-emerald-50/30">Sisa</th>
                <th className="px-2 py-2 text-right text-xs bg-emerald-50/30">%</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {data.subKegiatan.map((item) => {
                const murniPD = item.anggaranMurniPD || 0;
                const perubPD = item.anggaranPerubahanPD || 0;
                const paguAktifPD = perubPD > 0 ? perubPD : murniPD;
                const realisasiPD = getRealisasiPD(item.id);
                const sisaPD = paguAktifPD - realisasiPD;
                const persenPD = paguAktifPD > 0 ? ((realisasiPD / paguAktifPD) * 100).toFixed(1) : '0';

                const murniMM = item.anggaranMurniMM || 0;
                const perubMM = item.anggaranPerubahanMM || 0;
                const paguAktifMM = perubMM > 0 ? perubMM : murniMM;
                const realisasiMM = getRealisasiMM(item.id);
                const sisaMM = paguAktifMM - realisasiMM;
                const persenMM = paguAktifMM > 0 ? ((realisasiMM / paguAktifMM) * 100).toFixed(1) : '0';

                return (
                  <tr key={item.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-4 py-4 font-medium text-slate-800">{item.nama}</td>
                    
                    <td className="px-2 py-4 text-right font-medium text-blue-600">{formatRupiah(paguAktifPD)}</td>
                    <td className="px-2 py-4 text-right font-medium text-slate-600">{formatRupiah(realisasiPD)}</td>
                    <td className={`px-2 py-4 text-right font-medium ${sisaPD < 0 ? 'text-red-500' : 'text-slate-600'}`}>{formatRupiah(sisaPD)}</td>
                    <td className={`px-2 py-4 text-right font-bold text-xs ${Number(persenPD) > 80 ? 'text-red-500' : 'text-blue-500'}`}>{persenPD}%</td>
                    
                    <td className="px-2 py-4 text-right font-medium text-emerald-600">{formatRupiah(paguAktifMM)}</td>
                    <td className="px-2 py-4 text-right font-medium text-slate-600">{formatRupiah(realisasiMM)}</td>
                    <td className={`px-2 py-4 text-right font-medium ${sisaMM < 0 ? 'text-red-500' : 'text-slate-600'}`}>{formatRupiah(sisaMM)}</td>
                    <td className={`px-2 py-4 text-right font-bold text-xs ${Number(persenMM) > 80 ? 'text-red-500' : 'text-emerald-500'}`}>{persenMM}%</td>
                    
                    <td className="px-4 py-4">
                      <div className="flex items-center justify-center space-x-2">
                        <button onClick={() => handleEdit(item)} className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                          <Edit2 size={16} />
                        </button>
                        <button onClick={() => deleteSubKegiatan(item.id)} className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {data.subKegiatan.length === 0 && (
                <tr>
                  <td colSpan={10} className="px-4 py-8 text-center text-slate-400 italic">
                    Belum ada data sub kegiatan.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
