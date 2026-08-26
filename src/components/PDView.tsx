import React, { useState } from 'react';
import { useAppContext, Personil, PDTransaction } from '../store/AppContext';
import { formatRupiah, parseRupiah } from '../utils/formatters';
import { Plane, Plus, Trash2, Calendar, MapPin, FileText, Pencil, X } from 'lucide-react';

export const PDView = () => {
  const { subKegiatans, pdTransactions, addPDTransaction, editPDTransaction, deletePDTransaction } = useAppContext();

  const [subKegiatanId, setSubKegiatanId] = useState('');
  const [judul, setJudul] = useState('');
  const [wilayah, setWilayah] = useState('');
  const [tanggal, setTanggal] = useState('');
  const [personilList, setPersonilList] = useState<Personil[]>([{ id: Date.now().toString(), nama: '', nominal: 0 }]);

  // Edit Modal State
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editId, setEditId] = useState('');
  const [editSubKegiatanId, setEditSubKegiatanId] = useState('');
  const [editJudul, setEditJudul] = useState('');
  const [editWilayah, setEditWilayah] = useState('');
  const [editTanggal, setEditTanggal] = useState('');
  const [editPersonilList, setEditPersonilList] = useState<Personil[]>([]);

  // Delete Modal State
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deleteId, setDeleteId] = useState('');
  const [deleteJudul, setDeleteJudul] = useState('');

  const handlePersonilChange = (id: string, field: 'nama' | 'nominal', value: string) => {
    setPersonilList(prev => prev.map(p => {
      if (p.id === id) {
        return { ...p, [field]: field === 'nominal' ? parseRupiah(value) : value };
      }
      return p;
    }));
  };

  const handleEditPersonilChange = (id: string, field: 'nama' | 'nominal', value: string) => {
    setEditPersonilList(prev => prev.map(p => {
      if (p.id === id) {
        return { ...p, [field]: field === 'nominal' ? parseRupiah(value) : value };
      }
      return p;
    }));
  };

  const addPersonil = () => setPersonilList(prev => [...prev, { id: Date.now().toString(), nama: '', nominal: 0 }]);
  const removePersonil = (id: string) => { if (personilList.length > 1) setPersonilList(prev => prev.filter(p => p.id !== id)); };

  const addEditPersonil = () => setEditPersonilList(prev => [...prev, { id: Date.now().toString(), nama: '', nominal: 0 }]);
  const removeEditPersonil = (id: string) => { if (editPersonilList.length > 1) setEditPersonilList(prev => prev.filter(p => p.id !== id)); };

  const grandTotal = personilList.reduce((sum, p) => sum + (p.nominal || 0), 0);
  const editGrandTotal = editPersonilList.reduce((sum, p) => sum + (p.nominal || 0), 0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!subKegiatanId) {
      alert('Gagal menyimpan: Silakan pilih Sub Kegiatan terlebih dahulu. (Jika kosong, pastikan Anda sudah membuat Sub Kegiatan untuk tahun ini)');
      return;
    }
    if (personilList.some(p => !p.nama || p.nominal < 0)) {
      alert('Gagal menyimpan: Pastikan semua personil memiliki nama dan nominal tidak boleh minus.');
      return;
    }
    if (!judul || !tanggal) {
      alert('Gagal menyimpan: Pastikan judul dan tanggal sudah diisi.');
      return;
    }

    addPDTransaction({
      id: Date.now().toString(),
      subKegiatanId,
      judul,
      wilayah,
      tanggal,
      personil: [...personilList],
      total: grandTotal
    });

    setJudul('');
    setWilayah('');
    setTanggal('');
    setPersonilList([{ id: Date.now().toString(), nama: '', nominal: 0 }]);
  };

  const handleOpenEdit = (tx: PDTransaction) => {
    setEditId(tx.id);
    setEditSubKegiatanId(tx.subKegiatanId);
    setEditJudul(tx.judul);
    setEditWilayah(tx.wilayah);
    setEditTanggal(tx.tanggal);
    setEditPersonilList(JSON.parse(JSON.stringify(tx.personil)));
    setIsEditModalOpen(true);
  };

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editSubKegiatanId) {
      alert('Gagal menyimpan: Silakan pilih Sub Kegiatan.');
      return;
    }
    if (editPersonilList.some(p => !p.nama || p.nominal < 0)) {
      alert('Gagal menyimpan: Pastikan semua personil memiliki nama dan nominal tidak boleh minus.');
      return;
    }
    if (!editJudul || !editTanggal) {
      alert('Gagal menyimpan: Pastikan judul dan tanggal sudah diisi.');
      return;
    }

    editPDTransaction(editId, {
      id: editId,
      subKegiatanId: editSubKegiatanId,
      judul: editJudul,
      wilayah: editWilayah,
      tanggal: editTanggal,
      personil: [...editPersonilList],
      total: editGrandTotal
    });
    setIsEditModalOpen(false);
  };

  const handleOpenDelete = (tx: PDTransaction) => {
    setDeleteId(tx.id);
    setDeleteJudul(tx.judul);
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = () => {
    deletePDTransaction(deleteId);
    setIsDeleteModalOpen(false);
  };

  return (
    <div className="space-y-8">
      {/* Form Card */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 lg:p-8">
        <h3 className="font-bold text-slate-800 mb-6 flex items-center gap-2">
          <Plane className="text-blue-500" size={20} /> Input SPPD Baru
        </h3>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Sub Kegiatan</label>
              <select 
                required
                value={subKegiatanId}
                onChange={e => setSubKegiatanId(e.target.value)}
                className="w-full rounded-xl border border-slate-300 px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-colors bg-white"
              >
                <option value="">-- Pilih Sub Kegiatan --</option>
                {subKegiatans.filter(sk => sk.anggaranMurniPD > 0 || sk.anggaranPerubahanPD > 0).map(sk => (
                  <option key={sk.id} value={sk.id}>{sk.nama}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Tanggal</label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input 
                  type="date" 
                  required
                  value={tanggal}
                  onChange={e => setTanggal(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 pl-10 pr-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-colors bg-white"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Judul Kegiatan</label>
              <div className="relative">
                <FileText className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input 
                  type="text" 
                  required
                  value={judul}
                  onChange={e => setJudul(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 pl-10 pr-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-colors bg-white"
                  placeholder="Contoh: Kunjungan Kerja ke Provinsi"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Wilayah Tujuan</label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input 
                  type="text" 
                  required
                  value={wilayah}
                  onChange={e => setWilayah(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 pl-10 pr-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-colors bg-white"
                  placeholder="Contoh: Jakarta"
                />
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100">
            <div className="flex items-center justify-between mb-4">
              <h4 className="font-semibold text-slate-800">Daftar Personil</h4>
              <button 
                type="button" 
                onClick={addPersonil}
                className="flex items-center gap-1 text-sm font-medium text-blue-600 hover:text-blue-700 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-lg transition-colors"
              >
                <Plus size={16} /> Tambah Personil
              </button>
            </div>
            
            <div className="space-y-3">
              {personilList.map((p, index) => (
                <div key={p.id} className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
                  <div className="flex-1 w-full">
                    <input 
                      type="text" 
                      required
                      value={p.nama}
                      onChange={e => handlePersonilChange(p.id, 'nama', e.target.value)}
                      className="w-full rounded-lg border border-slate-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500"
                      placeholder={`Nama Personil ${index + 1}`}
                    />
                  </div>
                  <div className="flex-1 w-full flex gap-2">
                    <input 
                      type="text" 
                      required
                      value={p.nominal ? formatRupiah(p.nominal) : ''}
                      onChange={e => handlePersonilChange(p.id, 'nominal', e.target.value)}
                      className="w-full rounded-lg border border-slate-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500"
                      placeholder="Nominal (Rp)"
                    />
                    <button 
                      type="button"
                      onClick={() => removePersonil(p.id)}
                      disabled={personilList.length === 1}
                      className="p-2 text-slate-400 hover:text-red-500 disabled:opacity-50 transition-colors"
                    >
                      <Trash2 size={20} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="mt-6 flex flex-col sm:flex-row items-start sm:items-center justify-between bg-slate-50 p-5 rounded-xl border border-slate-200">
              <span className="font-medium text-slate-600 mb-1 sm:mb-0">Grand Total Transaksi:</span>
              <span className="text-2xl font-bold text-slate-900 tracking-tight">{formatRupiah(grandTotal)}</span>
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button 
              type="submit" 
              className="w-full sm:w-auto px-8 py-3 bg-slate-900 hover:bg-slate-800 text-white font-medium rounded-xl transition-colors shadow-sm focus:outline-none focus:ring-2 focus:ring-slate-900 focus:ring-offset-2"
            >
              Simpan SPPD
            </button>
          </div>
        </form>
      </div>

      {/* History Table */}
      <div className="bg-white rounded-2xl border border-slate-200 flex flex-col overflow-hidden shadow-sm">
        <div className="p-5 border-b border-slate-100 flex justify-between items-center">
          <h3 className="font-bold text-slate-800">Riwayat Perjalanan Dinas</h3>
        </div>
        <div className="overflow-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-slate-50 sticky top-0">
              <tr className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                <th className="px-5 py-3 border-b border-slate-100">Tanggal</th>
                <th className="px-5 py-3 border-b border-slate-100">Judul & Wilayah</th>
                <th className="px-5 py-3 border-b border-slate-100">Personil</th>
                <th className="px-5 py-3 border-b border-slate-100 text-right">Total Biaya</th>
                <th className="px-5 py-3 border-b border-slate-100 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="text-sm divide-y divide-slate-100">
              {pdTransactions.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-5 py-12 text-center text-slate-400">
                    Belum ada riwayat perjalanan dinas.
                  </td>
                </tr>
              ) : (
                pdTransactions.map((tx) => (
                  <tr key={tx.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-5 py-4 text-slate-600 whitespace-nowrap">{tx.tanggal}</td>
                    <td className="px-5 py-4">
                      <div className="font-semibold text-slate-700">{tx.judul}</div>
                      <div className="text-[10px] text-slate-500 flex items-center gap-1 mt-1 font-bold uppercase tracking-wider"><MapPin size={12}/> {tx.wilayah}</div>
                    </td>
                    <td className="px-5 py-4">
                      <div className="space-y-1.5 min-w-[200px]">
                        {tx.personil.map(p => (
                          <div key={p.id} className="text-xs flex justify-between gap-4 border-b border-slate-100 pb-1 last:border-0 last:pb-0">
                            <span className="text-slate-600">{p.nama}</span>
                            <span className="text-slate-500 font-medium">{formatRupiah(p.nominal)}</span>
                          </div>
                        ))}
                      </div>
                    </td>
                    <td className="px-5 py-4 font-bold text-slate-700 whitespace-nowrap text-right">{formatRupiah(tx.total)}</td>
                    <td className="px-5 py-4 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button 
                          onClick={() => handleOpenEdit(tx)}
                          className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Edit"
                        >
                          <Pencil size={16} />
                        </button>
                        <button 
                          onClick={() => handleOpenDelete(tx)}
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
              <h3 className="font-bold text-slate-800 text-lg">Edit SPPD</h3>
              <button 
                onClick={() => setIsEditModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 transition-colors"
              >
                <X size={20} />
              </button>
            </div>
            <div className="p-6 overflow-y-auto">
              <form id="edit-pd-form" onSubmit={handleEditSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Sub Kegiatan</label>
                    <select 
                      required
                      value={editSubKegiatanId}
                      onChange={e => setEditSubKegiatanId(e.target.value)}
                      className="w-full rounded-xl border border-slate-300 px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-colors bg-white"
                    >
                      <option value="">-- Pilih Sub Kegiatan --</option>
                      {subKegiatans.filter(sk => sk.anggaranMurniPD > 0 || sk.anggaranPerubahanPD > 0).map(sk => (
                        <option key={sk.id} value={sk.id}>{sk.nama}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Tanggal</label>
                    <div className="relative">
                      <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                      <input 
                        type="date" 
                        required
                        value={editTanggal}
                        onChange={e => setEditTanggal(e.target.value)}
                        className="w-full rounded-xl border border-slate-300 pl-10 pr-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-colors bg-white"
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Judul Kegiatan</label>
                    <div className="relative">
                      <FileText className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                      <input 
                        type="text" 
                        required
                        value={editJudul}
                        onChange={e => setEditJudul(e.target.value)}
                        className="w-full rounded-xl border border-slate-300 pl-10 pr-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-colors bg-white"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Wilayah Tujuan</label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                      <input 
                        type="text" 
                        required
                        value={editWilayah}
                        onChange={e => setEditWilayah(e.target.value)}
                        className="w-full rounded-xl border border-slate-300 pl-10 pr-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-colors bg-white"
                      />
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-100">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="font-semibold text-slate-800">Daftar Personil</h4>
                    <button 
                      type="button" 
                      onClick={addEditPersonil}
                      className="flex items-center gap-1 text-sm font-medium text-blue-600 hover:text-blue-700 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-lg transition-colors"
                    >
                      <Plus size={16} /> Tambah Personil
                    </button>
                  </div>
                  
                  <div className="space-y-3">
                    {editPersonilList.map((p, index) => (
                      <div key={p.id} className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
                        <div className="flex-1 w-full">
                          <input 
                            type="text" 
                            required
                            value={p.nama}
                            onChange={e => handleEditPersonilChange(p.id, 'nama', e.target.value)}
                            className="w-full rounded-lg border border-slate-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500"
                            placeholder={`Nama Personil ${index + 1}`}
                          />
                        </div>
                        <div className="flex-1 w-full flex gap-2">
                          <input 
                            type="text" 
                            required
                            value={p.nominal ? formatRupiah(p.nominal) : ''}
                            onChange={e => handleEditPersonilChange(p.id, 'nominal', e.target.value)}
                            className="w-full rounded-lg border border-slate-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500"
                            placeholder="Nominal (Rp)"
                          />
                          <button 
                            type="button"
                            onClick={() => removeEditPersonil(p.id)}
                            disabled={editPersonilList.length === 1}
                            className="p-2 text-slate-400 hover:text-red-500 disabled:opacity-50 transition-colors"
                          >
                            <Trash2 size={20} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  <div className="mt-6 flex justify-between bg-slate-50 p-4 rounded-xl border border-slate-200">
                    <span className="font-medium text-slate-600">Grand Total:</span>
                    <span className="font-bold text-slate-900">{formatRupiah(editGrandTotal)}</span>
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
                form="edit-pd-form"
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
              <h3 className="font-bold text-slate-800 text-xl mb-2">Hapus SPPD?</h3>
              <p className="text-slate-500 text-sm mb-1">
                Anda yakin ingin menghapus transaksi <span className="font-bold text-slate-700">"{deleteJudul}"</span>?
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
