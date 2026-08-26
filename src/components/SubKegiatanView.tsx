import React, { useState, useMemo } from 'react';
import { useAppContext, SubKegiatan } from '../store/AppContext';
import { formatRupiah, parseRupiah } from '../utils/formatters';
import { PlusCircle, Wallet, Plane, Coffee, Pencil, Trash2, X } from 'lucide-react';

export const SubKegiatanView = () => {
  const { subKegiatans, addSubKegiatan, editSubKegiatan, deleteSubKegiatan, pdTransactions, mmTransactions, selectedYear } = useAppContext();
  
  const [nama, setNama] = useState('');
  const [tahun, setTahun] = useState(selectedYear);
  const [murniPD, setMurniPD] = useState('');
  const [perubahanPD, setPerubahanPD] = useState('');
  const [murniMM, setMurniMM] = useState('');
  const [perubahanMM, setPerubahanMM] = useState('');

  // Update form year when context year changes
  React.useEffect(() => {
    setTahun(selectedYear);
  }, [selectedYear]);

  // Modals state
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editId, setEditId] = useState('');
  const [editNama, setEditNama] = useState('');
  const [editTahun, setEditTahun] = useState(selectedYear);
  const [editMurniPD, setEditMurniPD] = useState('');
  const [editPerubahanPD, setEditPerubahanPD] = useState('');
  const [editMurniMM, setEditMurniMM] = useState('');
  const [editPerubahanMM, setEditPerubahanMM] = useState('');

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deleteId, setDeleteId] = useState('');
  const [deleteNama, setDeleteNama] = useState('');

  const handleOpenEdit = (item: SubKegiatan) => {
    setEditId(item.id);
    setEditNama(item.nama);
    setEditTahun(item.tahun || selectedYear);
    setEditMurniPD(item.anggaranMurniPD ? formatRupiah(item.anggaranMurniPD) : '');
    setEditPerubahanPD(item.anggaranPerubahanPD ? formatRupiah(item.anggaranPerubahanPD) : '');
    setEditMurniMM(item.anggaranMurniMM ? formatRupiah(item.anggaranMurniMM) : '');
    setEditPerubahanMM(item.anggaranPerubahanMM ? formatRupiah(item.anggaranPerubahanMM) : '');
    setIsEditModalOpen(true);
  };

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editNama) return;
    
    editSubKegiatan(editId, {
      id: editId,
      nama: editNama,
      tahun: editTahun,
      anggaranMurniPD: parseRupiah(editMurniPD),
      anggaranPerubahanPD: parseRupiah(editPerubahanPD),
      anggaranMurniMM: parseRupiah(editMurniMM),
      anggaranPerubahanMM: parseRupiah(editPerubahanMM),
    });
    
    setIsEditModalOpen(false);
  };

  const handleOpenDelete = (item: SubKegiatan) => {
    setDeleteId(item.id);
    setDeleteNama(item.nama);
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = () => {
    deleteSubKegiatan(deleteId);
    setIsDeleteModalOpen(false);
  };

  const handleCurrencyChange = (setter: React.Dispatch<React.SetStateAction<string>>) => (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/[^0-9]/g, '');
    setter(val ? formatRupiah(Number(val)) : '');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nama) return;
    
    addSubKegiatan({
      id: Date.now().toString(),
      nama,
      tahun,
      anggaranMurniPD: parseRupiah(murniPD),
      anggaranPerubahanPD: parseRupiah(perubahanPD),
      anggaranMurniMM: parseRupiah(murniMM),
      anggaranPerubahanMM: parseRupiah(perubahanMM),
    });
    
    setNama('');
    setTahun(selectedYear);
    setMurniPD('');
    setPerubahanPD('');
    setMurniMM('');
    setPerubahanMM('');
  };

  // Computations for Table
  const tableData = useMemo(() => {
    return subKegiatans.map(sk => {
      const paguPD = sk.anggaranPerubahanPD > 0 ? sk.anggaranPerubahanPD : sk.anggaranMurniPD;
      const paguMM = sk.anggaranPerubahanMM > 0 ? sk.anggaranPerubahanMM : sk.anggaranMurniMM;
      
      const realisasiPD = pdTransactions.filter(tx => tx.subKegiatanId === sk.id).reduce((sum, tx) => sum + tx.total, 0);
      const realisasiMM = mmTransactions.filter(tx => tx.subKegiatanId === sk.id).reduce((sum, tx) => sum + tx.grandTotal, 0);
      
      const totalPagu = paguPD + paguMM;
      const totalRealisasi = realisasiPD + realisasiMM;
      const sisa = Math.max(0, totalPagu - totalRealisasi);
      const persentase = totalPagu > 0 ? (totalRealisasi / totalPagu) * 100 : 0;
      
      return {
        ...sk,
        totalPagu,
        totalRealisasi,
        sisa,
        persentase
      };
    });
  }, [subKegiatans, pdTransactions, mmTransactions]);

  return (
    <div className="space-y-8">
      {/* Form Card */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 lg:p-8">
        <h3 className="font-bold text-slate-800 mb-6 flex items-center gap-2">
          <PlusCircle className="text-blue-500" size={20} /> Tambah Sub Kegiatan Baru
        </h3>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="md:col-span-3">
              <label className="block text-sm font-medium text-slate-700 mb-2">Nama Sub Kegiatan</label>
              <input 
                type="text" 
                required
                value={nama}
                onChange={e => setNama(e.target.value)}
                className="w-full rounded-xl border border-slate-300 px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-colors bg-slate-50 focus:bg-white"
                placeholder="Contoh: Rapat Koordinasi Tahunan"
              />
            </div>
            <div className="md:col-span-1">
              <label className="block text-sm font-medium text-slate-700 mb-2">Tahun</label>
              <select 
                value={tahun}
                onChange={e => setTahun(Number(e.target.value))}
                className="w-full rounded-xl border border-slate-300 px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-colors bg-slate-50 focus:bg-white"
              >
                {[2026, 2027, 2028, 2029, 2030, 2031].map(y => (
                  <option key={y} value={y}>{y}</option>
                ))}
              </select>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-4 p-5 bg-slate-50/50 rounded-xl border border-slate-100">
              <h4 className="font-semibold text-slate-700 flex items-center gap-2 mb-4"><Plane size={18} className="text-blue-500"/> Anggaran Perjalanan Dinas (PD)</h4>
              <div>
                <label className="block text-sm text-slate-600 mb-1.5">Anggaran Murni</label>
                <input 
                  type="text" 
                  value={murniPD}
                  onChange={handleCurrencyChange(setMurniPD)}
                  className="w-full rounded-lg border border-slate-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-colors"
                  placeholder="Rp 0"
                />
              </div>
              <div>
                <label className="block text-sm text-slate-600 mb-1.5">Anggaran Perubahan (Opsional)</label>
                <input 
                  type="text" 
                  value={perubahanPD}
                  onChange={handleCurrencyChange(setPerubahanPD)}
                  className="w-full rounded-lg border border-slate-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-colors"
                  placeholder="Rp 0"
                />
              </div>
            </div>

            <div className="space-y-4 p-5 bg-slate-50/50 rounded-xl border border-slate-100">
              <h4 className="font-semibold text-slate-700 flex items-center gap-2 mb-4"><Coffee size={18} className="text-emerald-500"/> Anggaran Makan & Minum (MM)</h4>
              <div>
                <label className="block text-sm text-slate-600 mb-1.5">Anggaran Murni</label>
                <input 
                  type="text" 
                  value={murniMM}
                  onChange={handleCurrencyChange(setMurniMM)}
                  className="w-full rounded-lg border border-slate-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-colors"
                  placeholder="Rp 0"
                />
              </div>
              <div>
                <label className="block text-sm text-slate-600 mb-1.5">Anggaran Perubahan (Opsional)</label>
                <input 
                  type="text" 
                  value={perubahanMM}
                  onChange={handleCurrencyChange(setPerubahanMM)}
                  className="w-full rounded-lg border border-slate-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-colors"
                  placeholder="Rp 0"
                />
              </div>
            </div>
          </div>
          
          <div className="flex justify-end pt-2">
            <button 
              type="submit" 
              className="px-6 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-medium rounded-xl transition-colors shadow-sm focus:outline-none focus:ring-2 focus:ring-slate-900 focus:ring-offset-2"
            >
              Simpan Sub Kegiatan
            </button>
          </div>
        </form>
      </div>

      {/* Table Card */}
      <div className="bg-white rounded-2xl border border-slate-200 flex flex-col overflow-hidden shadow-sm">
        <div className="p-5 border-b border-slate-100 flex justify-between items-center">
          <h3 className="font-bold text-slate-800">Daftar Sub Kegiatan Terkini</h3>
        </div>
        <div className="overflow-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-slate-50 sticky top-0">
              <tr className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                <th className="px-5 py-3 border-b border-slate-100">Sub Kegiatan</th>
                <th className="px-5 py-3 border-b border-slate-100">Pagu Aktif</th>
                <th className="px-5 py-3 border-b border-slate-100">Total Realisasi</th>
                <th className="px-5 py-3 border-b border-slate-100">Sisa Anggaran</th>
                <th className="px-5 py-3 border-b border-slate-100 text-center">Status</th>
                <th className="px-5 py-3 border-b border-slate-100 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="text-sm divide-y divide-slate-100">
              {tableData.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-5 py-12 text-center text-slate-400">
                    Belum ada data sub kegiatan.
                  </td>
                </tr>
              ) : (
                tableData.map((row) => (
                  <tr key={row.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-5 py-4 font-semibold text-slate-700">{row.nama}</td>
                    <td className="px-5 py-4 text-slate-600">{formatRupiah(row.totalPagu)}</td>
                    <td className="px-5 py-4 text-slate-600">{formatRupiah(row.totalRealisasi)}</td>
                    <td className="px-5 py-4 font-semibold text-slate-700">{formatRupiah(row.sisa)}</td>
                    <td className="px-5 py-4 text-center">
                      <span className={`px-2 py-1 rounded-md font-bold text-xs ${
                        row.persentase > 80 
                          ? 'bg-red-50 text-red-600' 
                          : 'bg-green-50 text-green-600'
                      }`}>
                        {row.persentase.toFixed(1)}%
                      </span>
                    </td>
                    <td className="px-5 py-4 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button 
                          onClick={() => handleOpenEdit(row)}
                          className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Edit"
                        >
                          <Pencil size={16} />
                        </button>
                        <button 
                          onClick={() => handleOpenDelete(row)}
                          className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Hapus"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit Modal */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <h3 className="font-bold text-slate-800 text-lg">Edit Sub Kegiatan</h3>
              <button 
                onClick={() => setIsEditModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 transition-colors"
              >
                <X size={20} />
              </button>
            </div>
            <div className="p-6 overflow-y-auto">
              <form id="edit-form" onSubmit={handleEditSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  <div className="md:col-span-3">
                    <label className="block text-sm font-medium text-slate-700 mb-2">Nama Sub Kegiatan</label>
                    <input 
                      type="text" 
                      required
                      value={editNama}
                      onChange={e => setEditNama(e.target.value)}
                      className="w-full rounded-xl border border-slate-300 px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-colors bg-slate-50 focus:bg-white"
                    />
                  </div>
                  <div className="md:col-span-1">
                    <label className="block text-sm font-medium text-slate-700 mb-2">Tahun</label>
                    <select 
                      value={editTahun}
                      onChange={e => setEditTahun(Number(e.target.value))}
                      className="w-full rounded-xl border border-slate-300 px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-colors bg-slate-50 focus:bg-white"
                    >
                      {[2026, 2027, 2028, 2029, 2030, 2031].map(y => (
                        <option key={y} value={y}>{y}</option>
                      ))}
                    </select>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4 p-5 bg-slate-50/50 rounded-xl border border-slate-100">
                    <h4 className="font-semibold text-slate-700 flex items-center gap-2 mb-4"><Plane size={18} className="text-blue-500"/> Anggaran PD</h4>
                    <div>
                      <label className="block text-sm text-slate-600 mb-1.5">Anggaran Murni</label>
                      <input 
                        type="text" 
                        value={editMurniPD}
                        onChange={handleCurrencyChange(setEditMurniPD)}
                        className="w-full rounded-lg border border-slate-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-colors"
                        placeholder="Rp 0"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-slate-600 mb-1.5">Anggaran Perubahan</label>
                      <input 
                        type="text" 
                        value={editPerubahanPD}
                        onChange={handleCurrencyChange(setEditPerubahanPD)}
                        className="w-full rounded-lg border border-slate-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-colors"
                        placeholder="Rp 0"
                      />
                    </div>
                  </div>

                  <div className="space-y-4 p-5 bg-slate-50/50 rounded-xl border border-slate-100">
                    <h4 className="font-semibold text-slate-700 flex items-center gap-2 mb-4"><Coffee size={18} className="text-emerald-500"/> Anggaran MM</h4>
                    <div>
                      <label className="block text-sm text-slate-600 mb-1.5">Anggaran Murni</label>
                      <input 
                        type="text" 
                        value={editMurniMM}
                        onChange={handleCurrencyChange(setEditMurniMM)}
                        className="w-full rounded-lg border border-slate-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-colors"
                        placeholder="Rp 0"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-slate-600 mb-1.5">Anggaran Perubahan</label>
                      <input 
                        type="text" 
                        value={editPerubahanMM}
                        onChange={handleCurrencyChange(setEditPerubahanMM)}
                        className="w-full rounded-lg border border-slate-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-colors"
                        placeholder="Rp 0"
                      />
                    </div>
                  </div>
                </div>
              </form>
            </div>
            <div className="p-6 border-t border-slate-100 flex justify-end gap-3 bg-slate-50/50">
              <button 
                type="button"
                onClick={() => setIsEditModalOpen(false)}
                className="px-6 py-2.5 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 font-medium rounded-xl transition-colors shadow-sm focus:outline-none"
              >
                Batal
              </button>
              <button 
                type="submit" 
                form="edit-form"
                className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl transition-colors shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2"
              >
                Simpan Perubahan
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden flex flex-col">
            <div className="p-6 flex flex-col items-center text-center">
              <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mb-4">
                <Trash2 size={32} />
              </div>
              <h3 className="font-bold text-slate-800 text-xl mb-2">Hapus Sub Kegiatan?</h3>
              <p className="text-slate-500 text-sm mb-1">
                Anda yakin ingin menghapus <span className="font-bold text-slate-700">"{deleteNama}"</span>?
              </p>
              <p className="text-slate-400 text-xs">
                Tindakan ini tidak dapat dibatalkan.
              </p>
            </div>
            <div className="p-6 pt-0 flex gap-3">
              <button 
                type="button"
                onClick={() => setIsDeleteModalOpen(false)}
                className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl transition-colors focus:outline-none"
              >
                Batal
              </button>
              <button 
                type="button"
                onClick={handleConfirmDelete}
                className="flex-1 py-2.5 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl transition-colors shadow-sm focus:outline-none focus:ring-2 focus:ring-red-600 focus:ring-offset-2"
              >
                Hapus
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
