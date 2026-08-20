import React, { useState } from 'react';
import { useStore, formatRupiah } from '../store';
import { Plus, Trash2, Receipt, Pencil, ChevronDown, ChevronUp, AlertCircle, X, Check } from 'lucide-react';
import { format } from 'date-fns';

const HARGA_SNACK = 15400;
const HARGA_NASI = 46300;
const TARIF_PAJAK_DAERAH = 0.10;
const TARIF_PPH = 0.005;

export function MakanMinum() {
  const { data, addMakanMinum, updateMakanMinum, deleteMakanMinum } = useStore();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({});
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    subKegiatanId: '',
    judul: '',
    tanggal: '',
    qtySnack: '',
    qtyMakan: ''
  });

  const qtySnackNum = Number(formData.qtySnack) || 0;
  const qtyMakanNum = Number(formData.qtyMakan) || 0;

  const snackBase = qtySnackNum * HARGA_SNACK;
  const makanBase = qtyMakanNum * HARGA_NASI;
  const totalBase = snackBase + makanBase;

  const totalPajakDaerah = totalBase * TARIF_PAJAK_DAERAH;
  const totalPph = totalBase * TARIF_PPH;
  const grandTotal = totalBase + totalPajakDaerah;

  const toggleGroup = (subKegiatanId: string) => {
    setExpandedGroups(prev => ({ ...prev, [subKegiatanId]: !prev[subKegiatanId] }));
  };

  const handleEdit = (item: any) => {
    setEditingId(item.id);
    setFormData({
      subKegiatanId: item.subKegiatanId,
      judul: item.judul,
      tanggal: item.tanggal,
      qtySnack: String(item.qtySnack),
      qtyMakan: String(item.qtyMakan)
    });
    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setFormData({
      subKegiatanId: '',
      judul: '',
      tanggal: '',
      qtySnack: '',
      qtyMakan: ''
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.subKegiatanId) {
      alert('Pilih sub kegiatan terlebih dahulu!');
      return;
    }

    if (editingId) {
      updateMakanMinum(editingId, {
        subKegiatanId: formData.subKegiatanId,
        judul: formData.judul,
        tanggal: formData.tanggal,
        qtySnack: qtySnackNum,
        qtyMakan: qtyMakanNum,
        total: grandTotal
      });
      setEditingId(null);
    } else {
      addMakanMinum({
        subKegiatanId: formData.subKegiatanId,
        judul: formData.judul,
        tanggal: formData.tanggal,
        qtySnack: qtySnackNum,
        qtyMakan: qtyMakanNum,
        total: grandTotal
      });
    }

    setFormData({
      subKegiatanId: '',
      judul: '',
      tanggal: '',
      qtySnack: '',
      qtyMakan: ''
    });
  };

  const handleDelete = () => {
    if (confirmDeleteId) {
      deleteMakanMinum(confirmDeleteId);
      setConfirmDeleteId(null);
    }
  };

  // Group items by subKegiatanId
  const groupedMakanMinum = data.makanMinum.reduce((acc, curr) => {
    if (!acc[curr.subKegiatanId]) {
      acc[curr.subKegiatanId] = [];
    }
    acc[curr.subKegiatanId].push(curr);
    return acc;
  }, {} as Record<string, typeof data.makanMinum>);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-900">Makan Minum Rapat</h2>
        <p className="text-slate-500 text-sm mt-1">Input transaksi pengeluaran konsumsi rapat.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white p-6 rounded-3xl shadow-sm border border-slate-200">
          <h3 className="text-lg font-semibold mb-4 text-slate-800 border-b border-slate-100 pb-2">Form Input Transaksi</h3>
          <form onSubmit={handleSubmit} className="space-y-4">
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
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Judul Rapat</label>
                <input
                  type="text"
                  required
                  className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                  placeholder="Contoh: Rapat Evaluasi Bulanan"
                  value={formData.judul}
                  onChange={(e) => setFormData({ ...formData, judul: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Tanggal</label>
                <input
                  type="date"
                  required
                  className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                  value={formData.tanggal}
                  onChange={(e) => setFormData({ ...formData, tanggal: e.target.value })}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Banyak Paket Snack</label>
                <div className="relative">
                  <input
                    type="number"
                    min="0"
                    className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                    placeholder="0"
                    value={formData.qtySnack}
                    onChange={(e) => setFormData({ ...formData, qtySnack: e.target.value })}
                  />
                  <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none text-slate-400 text-sm">
                    Pax
                  </div>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Banyak Paket Makan Berat</label>
                <div className="relative">
                  <input
                    type="number"
                    min="0"
                    className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                    placeholder="0"
                    value={formData.qtyMakan}
                    onChange={(e) => setFormData({ ...formData, qtyMakan: e.target.value })}
                  />
                  <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none text-slate-400 text-sm">
                    Pax
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-4 flex justify-end gap-3">
              {editingId && (
                <button
                  type="button"
                  onClick={handleCancelEdit}
                  className="flex items-center px-6 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-medium transition-colors"
                >
                  <X size={18} className="mr-2" />
                  Batal Edit
                </button>
              )}
              <button
                type="submit"
                className="flex items-center px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium shadow-sm shadow-blue-200 transition-colors"
              >
                {editingId ? <Check size={18} className="mr-2" /> : <Plus size={18} className="mr-2" />}
                {editingId ? 'Simpan Perubahan' : 'Simpan Transaksi'}
              </button>
            </div>
          </form>
        </div>

        {/* Kalkulator Preview */}
        <div className="bg-slate-900 text-white p-6 rounded-3xl shadow-xl flex flex-col">
          <div className="flex items-center space-x-3 mb-6">
            <div className="p-2 bg-blue-500/20 rounded-lg">
              <Receipt className="text-blue-400" size={24} />
            </div>
            <h3 className="text-lg font-semibold text-slate-100">Kalkulasi Biaya</h3>
          </div>
          
          <div className="space-y-4 flex-1">
            <div className="flex justify-between items-center text-sm">
              <span className="text-slate-400">Snack ({qtySnackNum} x {formatRupiah(HARGA_SNACK)})</span>
              <span className="font-medium text-slate-200">{formatRupiah(snackBase)}</span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="text-slate-400">Makan ({qtyMakanNum} x {formatRupiah(HARGA_NASI)})</span>
              <span className="font-medium text-slate-200">{formatRupiah(makanBase)}</span>
            </div>
            
            <div className="border-t border-slate-700/50 pt-3 flex justify-between items-center text-sm">
              <span className="text-slate-300">Total Dasar</span>
              <span className="font-semibold text-slate-200">{formatRupiah(totalBase)}</span>
            </div>
            
            <div className="flex justify-between items-center text-sm">
              <span className="text-slate-400">Pajak Daerah (10%)</span>
              <span className="font-medium text-amber-400">{formatRupiah(totalPajakDaerah)}</span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="text-slate-400">PPh (-0.5%)</span>
              <span className="font-medium text-rose-400">{formatRupiah(totalPph)}</span>
            </div>
          </div>
          
          <div className="mt-6 pt-4 border-t border-slate-700">
            <div className="text-sm text-slate-400 mb-1">Total Realisasi Anggaran</div>
            <div className="text-3xl font-bold text-emerald-400">{formatRupiah(grandTotal)}</div>
          </div>
        </div>
      </div>

      {/* History Grouped by Sub Kegiatan */}
      <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden mt-8">
        <div className="px-6 py-4 border-b border-slate-100 bg-slate-50">
          <h3 className="font-semibold text-slate-800">Riwayat Makan Minum (per Sub Kegiatan)</h3>
        </div>
        
        <div className="divide-y divide-slate-100">
          {Object.keys(groupedMakanMinum).length === 0 ? (
            <div className="px-6 py-8 text-center text-slate-400 italic">
              Belum ada riwayat transaksi makan minum.
            </div>
          ) : (
            data.subKegiatan
              .filter(sk => groupedMakanMinum[sk.id] && groupedMakanMinum[sk.id].length > 0)
              .map(sk => {
                const items = groupedMakanMinum[sk.id].sort((a,b) => b.createdAt - a.createdAt);
                const isExpanded = expandedGroups[sk.id];
                
                const paguMurni = sk.anggaranMurniMM || 0;
                const paguPerubahan = sk.anggaranPerubahanMM || 0;
                const paguAktif = paguPerubahan > 0 ? paguPerubahan : paguMurni;
                
                const totalRealisasi = items.reduce((sum, item) => sum + item.total, 0);
                const sisaAnggaran = paguAktif - totalRealisasi;

                return (
                  <div key={sk.id} className="group">
                    <button 
                      onClick={() => toggleGroup(sk.id)}
                      className="w-full px-6 py-4 flex items-center justify-between hover:bg-slate-50 transition-colors focus:outline-none"
                    >
                      <div className="flex flex-col items-start text-left">
                        <span className="font-semibold text-slate-800 mb-1">{sk.nama}</span>
                        <div className="flex flex-wrap items-center gap-4 text-xs">
                          <span className="text-slate-500">Pagu: <span className="font-medium text-slate-700">{formatRupiah(paguAktif)}</span></span>
                          <span className="text-emerald-600">Total Biaya: <span className="font-medium">{formatRupiah(totalRealisasi)}</span></span>
                          <span className={`${sisaAnggaran < 0 ? 'text-red-500' : 'text-blue-600'}`}>Sisa Anggaran: <span className="font-medium">{formatRupiah(sisaAnggaran)}</span></span>
                        </div>
                      </div>
                      <div className="text-slate-400 p-2">
                        {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                      </div>
                    </button>
                    
                    {isExpanded && (
                      <div className="px-6 pb-6 bg-slate-50/50 border-t border-slate-50">
                        <div className="mt-4 overflow-x-auto rounded-xl border border-slate-200 bg-white">
                          <table className="w-full text-left text-sm text-slate-600">
                            <thead className="bg-slate-50 text-slate-700 font-medium border-b border-slate-200">
                              <tr>
                                <th className="px-4 py-3">Tanggal</th>
                                <th className="px-4 py-3">Daftar Rapat</th>
                                <th className="px-4 py-3 text-center">Snack / Makan</th>
                                <th className="px-4 py-3 text-right">Total Biaya</th>
                                <th className="px-4 py-3 text-center">Aksi</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                              {items.map(item => (
                                <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                                  <td className="px-4 py-3 whitespace-nowrap">{format(new Date(item.tanggal), 'dd MMM yyyy')}</td>
                                  <td className="px-4 py-3 font-medium text-slate-800">{item.judul}</td>
                                  <td className="px-4 py-3 text-center">
                                    <span className="bg-slate-100 px-2 py-1 rounded-md text-xs font-medium mr-1">{item.qtySnack} Snack</span>
                                    <span className="bg-blue-50 text-blue-700 px-2 py-1 rounded-md text-xs font-medium">{item.qtyMakan} Makan</span>
                                  </td>
                                  <td className="px-4 py-3 text-right font-semibold text-emerald-600">{formatRupiah(item.total)}</td>
                                  <td className="px-4 py-3 text-center">
                                    <div className="flex items-center justify-center space-x-1">
                                      <button onClick={() => handleEdit(item)} className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title="Edit">
                                        <Pencil size={16} />
                                      </button>
                                      <button onClick={() => setConfirmDeleteId(item.id)} className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors" title="Hapus">
                                        <Trash2 size={16} />
                                      </button>
                                    </div>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })
          )}
        </div>
      </div>

      {/* Confirmation Modal */}
      {confirmDeleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white rounded-3xl shadow-xl w-full max-w-sm overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="p-6 text-center">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertCircle className="text-red-500" size={32} />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">Hapus Data?</h3>
              <p className="text-slate-500 text-sm">
                Apakah Anda yakin ingin menghapus transaksi ini? Tindakan ini tidak dapat dibatalkan.
              </p>
            </div>
            <div className="bg-slate-50 p-4 flex gap-3 border-t border-slate-100">
              <button
                onClick={() => setConfirmDeleteId(null)}
                className="flex-1 px-4 py-2.5 bg-white border border-slate-200 text-slate-700 rounded-xl font-semibold hover:bg-slate-50 transition-colors"
              >
                Batal
              </button>
              <button
                onClick={handleDelete}
                className="flex-1 px-4 py-2.5 bg-red-500 text-white rounded-xl font-semibold hover:bg-red-600 transition-colors shadow-sm shadow-red-200"
              >
                Ya, Hapus
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
