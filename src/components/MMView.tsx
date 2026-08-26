import React, { useState, useMemo } from 'react';
import { useAppContext, MMTransaction } from '../store/AppContext';
import { formatRupiah } from '../utils/formatters';
import { Coffee, Calendar, FileText, Package, ChevronRight, Pencil, Trash2, X } from 'lucide-react';

export const MMView = () => {
  const { subKegiatans, mmTransactions, addMMTransaction, editMMTransaction, deleteMMTransaction } = useAppContext();

  const [subKegiatanId, setSubKegiatanId] = useState('');
  const [judul, setJudul] = useState('');
  const [tanggal, setTanggal] = useState('');
  const [qtySnack, setQtySnack] = useState('');
  const [qtyNasi, setQtyNasi] = useState('');
  
  const [selectedHistoryGroup, setSelectedHistoryGroup] = useState<string | null>(null);

  // Edit Modal State
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editId, setEditId] = useState('');
  const [editSubKegiatanId, setEditSubKegiatanId] = useState('');
  const [editJudul, setEditJudul] = useState('');
  const [editTanggal, setEditTanggal] = useState('');
  const [editQtySnack, setEditQtySnack] = useState('');
  const [editQtyNasi, setEditQtyNasi] = useState('');

  // Delete Modal State
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deleteId, setDeleteId] = useState('');
  const [deleteJudul, setDeleteJudul] = useState('');

  const SNACK_PRICE = 15400;
  const NASI_PRICE = 46300;

  const numSnack = parseInt(qtySnack) || 0;
  const numNasi = parseInt(qtyNasi) || 0;
  const baseHarga = (numSnack * SNACK_PRICE) + (numNasi * NASI_PRICE);
  const pajak = baseHarga * 0.10;
  const pph = baseHarga * 0.005;
  const grandTotal = baseHarga + pajak;

  // Budget Validation
  const selectedSubKegiatan = subKegiatans.find(sk => String(sk.id) === String(subKegiatanId));
  const paguMM = selectedSubKegiatan ? (selectedSubKegiatan.anggaranPerubahanMM > 0 ? selectedSubKegiatan.anggaranPerubahanMM : selectedSubKegiatan.anggaranMurniMM) : 0;
  const realisasiMM = mmTransactions
    .filter(tx => String(tx.subKegiatanId) === String(subKegiatanId))
    .reduce((sum, tx) => sum + tx.grandTotal, 0);
  const sisaAnggaranMM = paguMM - realisasiMM;
  const isOverBudget = subKegiatanId !== '' && grandTotal > sisaAnggaranMM;

  const editNumSnack = parseInt(editQtySnack) || 0;
  const editNumNasi = parseInt(editQtyNasi) || 0;
  const editBaseHarga = (editNumSnack * SNACK_PRICE) + (editNumNasi * NASI_PRICE);
  const editPajak = editBaseHarga * 0.10;
  const editPph = editBaseHarga * 0.005;
  const editGrandTotal = editBaseHarga + editPajak;

  // Edit Budget Validation
  const editSelectedSubKegiatan = subKegiatans.find(sk => String(sk.id) === String(editSubKegiatanId));
  const editPaguMM = editSelectedSubKegiatan ? (editSelectedSubKegiatan.anggaranPerubahanMM > 0 ? editSelectedSubKegiatan.anggaranPerubahanMM : editSelectedSubKegiatan.anggaranMurniMM) : 0;
  const editRealisasiMM = mmTransactions
    .filter(tx => String(tx.subKegiatanId) === String(editSubKegiatanId) && String(tx.id) !== String(editId))
    .reduce((sum, tx) => sum + tx.grandTotal, 0);
  const editSisaAnggaranMM = editPaguMM - editRealisasiMM;
  const isEditOverBudget = editSubKegiatanId !== '' && editGrandTotal > editSisaAnggaranMM;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!subKegiatanId) {
      alert('Gagal menyimpan: Silakan pilih Sub Kegiatan terlebih dahulu. (Jika kosong, pastikan Anda sudah membuat Sub Kegiatan untuk tahun ini)');
      return;
    }
    if (numSnack < 0 || numNasi < 0) {
      alert('Gagal menyimpan: Jumlah tidak boleh minus.');
      return;
    }
    if (!judul || !tanggal) {
      alert('Gagal menyimpan: Pastikan judul dan tanggal sudah diisi.');
      return;
    }

    addMMTransaction({
      id: Date.now().toString(),
      subKegiatanId,
      judul,
      tanggal,
      qtySnack: numSnack,
      qtyNasi: numNasi,
      baseHarga,
      pajak,
      pph,
      grandTotal
    });

    setJudul('');
    setTanggal('');
    setQtySnack('');
    setQtyNasi('');
  };

  const handleOpenEdit = (tx: MMTransaction) => {
    setEditId(tx.id);
    setEditSubKegiatanId(tx.subKegiatanId);
    setEditJudul(tx.judul);
    setEditTanggal(tx.tanggal);
    setEditQtySnack(tx.qtySnack.toString());
    setEditQtyNasi(tx.qtyNasi.toString());
    setIsEditModalOpen(true);
  };

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editSubKegiatanId) {
      alert('Gagal menyimpan: Silakan pilih Sub Kegiatan.');
      return;
    }
    if (editNumSnack < 0 || editNumNasi < 0) {
      alert('Gagal menyimpan: Jumlah tidak boleh minus.');
      return;
    }
    if (!editJudul || !editTanggal) {
      alert('Gagal menyimpan: Pastikan judul dan tanggal sudah diisi.');
      return;
    }

    editMMTransaction(editId, {
      id: editId,
      subKegiatanId: editSubKegiatanId,
      judul: editJudul,
      tanggal: editTanggal,
      qtySnack: editNumSnack,
      qtyNasi: editNumNasi,
      baseHarga: editBaseHarga,
      pajak: editPajak,
      pph: editPph,
      grandTotal: editGrandTotal
    });
    setIsEditModalOpen(false);
  };

  const handleOpenDelete = (tx: MMTransaction) => {
    setDeleteId(tx.id);
    setDeleteJudul(tx.judul);
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = () => {
    deleteMMTransaction(deleteId);
    setIsDeleteModalOpen(false);
  };

  // Group by Sub Kegiatan
  const groupedTransactions = useMemo(() => {
    const groups: Record<string, MMTransaction[]> = {};
    mmTransactions.forEach(tx => {
      if (!groups[tx.subKegiatanId]) {
        groups[tx.subKegiatanId] = [];
      }
      groups[tx.subKegiatanId].push(tx);
    });
    return groups;
  }, [mmTransactions]);

  return (
    <div className="space-y-8">
      {/* Form Card */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 lg:p-8">
        <h3 className="font-bold text-slate-800 mb-6 flex items-center gap-2">
          <Coffee className="text-emerald-500" size={20} /> Input Pengeluaran Konsumsi
        </h3>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Sub Kegiatan</label>
              <select 
                required
                value={subKegiatanId}
                onChange={e => setSubKegiatanId(e.target.value)}
                className="w-full rounded-xl border border-slate-300 px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-colors bg-white"
              >
                <option value="">-- Pilih Sub Kegiatan --</option>
                {subKegiatans.filter(sk => sk.anggaranMurniMM > 0 || sk.anggaranPerubahanMM > 0).map(sk => (
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
                  className="w-full rounded-xl border border-slate-300 pl-10 pr-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-colors bg-white"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Judul Pengeluaran (Rapat/Kegiatan)</label>
            <div className="relative">
              <FileText className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input 
                type="text" 
                required
                value={judul}
                onChange={e => setJudul(e.target.value)}
                className="w-full rounded-xl border border-slate-300 pl-10 pr-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-colors bg-white"
                placeholder="Contoh: Rapat Evaluasi Kinerja"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-slate-50 p-6 rounded-xl border border-slate-200/60">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Qty Snack Box</label>
              <div className="relative">
                <Package className="absolute left-3 top-1/2 -translate-y-1/2 text-amber-500" size={18} />
                <input 
                  type="number" 
                  min="0"
                  value={qtySnack}
                  onChange={e => setQtySnack(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 pl-10 pr-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-colors bg-white"
                  placeholder="Jumlah (Rp 15.400 / box)"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Qty Nasi Kotak</label>
              <div className="relative">
                <Package className="absolute left-3 top-1/2 -translate-y-1/2 text-orange-500" size={18} />
                <input 
                  type="number" 
                  min="0"
                  value={qtyNasi}
                  onChange={e => setQtyNasi(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 pl-10 pr-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-colors bg-white"
                  placeholder="Jumlah (Rp 46.300 / box)"
                />
              </div>
            </div>
          </div>

          {baseHarga > 0 && (
            <div className={`p-5 rounded-xl border space-y-3 text-sm ${isOverBudget ? 'bg-red-50/50 border-red-200' : 'bg-emerald-50/50 border-emerald-100'}`}>
              <div className="flex justify-between text-slate-600">
                <span>Base Harga (Snack + Nasi)</span>
                <span>{formatRupiah(baseHarga)}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Pajak Daerah (10%)</span>
                <span>+ {formatRupiah(pajak)}</span>
              </div>
              <div className="flex justify-between text-slate-500 text-xs">
                <span>PPh 23 (0.5%) - Potongan</span>
                <span>- {formatRupiah(pph)}</span>
              </div>
              <div className={`pt-3 border-t flex justify-between font-bold text-lg ${isOverBudget ? 'border-red-200 text-red-700' : 'border-emerald-200 text-emerald-900'}`}>
                <span>Grand Total</span>
                <span>{formatRupiah(grandTotal)}</span>
              </div>
              {isOverBudget && (
                <div className="pt-2 text-red-600 font-medium text-xs flex justify-between">
                  <span>Peringatan: Anggaran tidak mencukupi!</span>
                  <span>Sisa saat ini: {formatRupiah(sisaAnggaranMM)}</span>
                </div>
              )}
            </div>
          )}

          <div className="flex justify-end pt-2">
            <button 
              type="submit" 
              disabled={isOverBudget}
              className={`w-full sm:w-auto px-8 py-3 text-white font-medium rounded-xl transition-colors shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                isOverBudget 
                  ? 'bg-slate-400 cursor-not-allowed focus:ring-slate-400' 
                  : 'bg-slate-900 hover:bg-slate-800 focus:ring-slate-900'
              }`}
            >
              Simpan Transaksi
            </button>
          </div>
        </form>
      </div>

      {/* History Accordion */}
      <div className="bg-white rounded-2xl border border-slate-200 flex flex-col overflow-hidden shadow-sm">
        <div className="p-5 border-b border-slate-100 flex justify-between items-center">
          <h3 className="font-bold text-slate-800">Riwayat Makan & Minum</h3>
        </div>
        
        <div className="divide-y divide-slate-100">
          {Object.keys(groupedTransactions).length === 0 ? (
            <div className="p-12 text-center text-slate-400">
              Belum ada riwayat transaksi makan & minum.
            </div>
          ) : (
            Object.entries(groupedTransactions).map(([subKegiatanId, txs]) => {
              const subKegiatan = subKegiatans.find(sk => String(sk.id) === String(subKegiatanId));
              const groupTotal = txs.reduce((sum, tx) => sum + tx.grandTotal, 0);

              return (
                <div key={subKegiatanId} className="bg-white">
                  <button 
                    onClick={() => setSelectedHistoryGroup(subKegiatanId)}
                    className="w-full px-6 py-4 flex items-center justify-between hover:bg-slate-50 transition-colors focus:outline-none"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-1 rounded-full transition-transform bg-slate-100 text-slate-400">
                        <ChevronRight size={18} />
                      </div>
                      <div className="text-left">
                        <h4 className="font-semibold text-slate-800">{subKegiatan?.nama || 'Sub Kegiatan Tidak Dikenal'}</h4>
                        <p className="text-xs text-slate-500 mt-0.5">{txs.length} Transaksi</p>
                      </div>
                    </div>
                    <div className="font-bold text-slate-900">
                      {formatRupiah(groupTotal)}
                    </div>
                  </button>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* History Details Modal */}
      {selectedHistoryGroup && groupedTransactions[selectedHistoryGroup] && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-slate-50 rounded-2xl shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
            <div className="p-6 border-b border-slate-200 flex justify-between items-center bg-white sticky top-0 z-10">
              <div>
                <h3 className="font-bold text-slate-800 text-lg">
                  {subKegiatans.find(sk => String(sk.id) === String(selectedHistoryGroup))?.nama || 'Sub Kegiatan Tidak Dikenal'}
                </h3>
                <p className="text-sm text-slate-500 mt-1">{groupedTransactions[selectedHistoryGroup].length} Transaksi Makan & Minum</p>
              </div>
              <button 
                onClick={() => setSelectedHistoryGroup(null)}
                className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
              >
                <X size={24} />
              </button>
            </div>
            <div className="p-6 overflow-y-auto">
              <div className="space-y-4">
                {groupedTransactions[selectedHistoryGroup].map(tx => (
                  <div key={tx.id} className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4 transition-all hover:shadow-md hover:border-emerald-200">
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-xs font-semibold px-2 py-0.5 bg-slate-100 text-slate-600 rounded-full flex items-center gap-1">
                          <Calendar size={12} /> {tx.tanggal}
                        </span>
                        <h5 className="font-bold text-slate-800 text-base">{tx.judul}</h5>
                      </div>
                      <div className="text-sm text-slate-600 flex items-center gap-5 mt-3 bg-slate-50 p-2 rounded-lg inline-flex">
                        <span className="flex items-center gap-1.5"><Package size={16} className="text-emerald-500"/> {tx.qtySnack} Snack Box</span>
                        <span className="w-px h-4 bg-slate-200"></span>
                        <span className="flex items-center gap-1.5"><Package size={16} className="text-emerald-500"/> {tx.qtyNasi} Nasi Kotak</span>
                      </div>
                    </div>
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 w-full md:w-auto mt-2 md:mt-0">
                      <div className="text-left md:text-right bg-slate-50 md:bg-transparent p-3 md:p-0 rounded-lg">
                        <div className="text-xs text-slate-500 mb-1">Base: {formatRupiah(tx.baseHarga)} | Pajak: {formatRupiah(tx.pajak)}</div>
                        <div className="text-xs text-rose-500 mb-1 font-medium">PPh 23: -{formatRupiah(tx.pph)}</div>
                        <div className="font-bold text-emerald-600 text-lg">{formatRupiah(tx.grandTotal)}</div>
                      </div>
                      <div className="flex items-center gap-2 md:pl-5 md:border-l border-slate-200 justify-end">
                        <button 
                          onClick={() => {
                            setSelectedHistoryGroup(null);
                            handleOpenEdit(tx);
                          }}
                          className="p-2 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-xl transition-colors"
                          title="Edit"
                        >
                          <Pencil size={18} />
                        </button>
                        <button 
                          onClick={() => {
                            setSelectedHistoryGroup(null);
                            handleOpenDelete(tx);
                          }}
                          className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors"
                          title="Hapus"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <h3 className="font-bold text-slate-800 text-lg">Edit Pengeluaran Makan & Minum</h3>
              <button 
                onClick={() => setIsEditModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 transition-colors"
              >
                <X size={20} />
              </button>
            </div>
            <div className="p-6 overflow-y-auto">
              <form id="edit-mm-form" onSubmit={handleEditSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Sub Kegiatan</label>
                    <select 
                      required
                      value={editSubKegiatanId}
                      onChange={e => setEditSubKegiatanId(e.target.value)}
                      className="w-full rounded-xl border border-slate-300 px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-colors bg-white"
                    >
                      <option value="">-- Pilih Sub Kegiatan --</option>
                      {subKegiatans.filter(sk => sk.anggaranMurniMM > 0 || sk.anggaranPerubahanMM > 0).map(sk => (
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
                        className="w-full rounded-xl border border-slate-300 pl-10 pr-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-colors bg-white"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Judul Pengeluaran (Rapat/Kegiatan)</label>
                  <div className="relative">
                    <FileText className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input 
                      type="text" 
                      required
                      value={editJudul}
                      onChange={e => setEditJudul(e.target.value)}
                      className="w-full rounded-xl border border-slate-300 pl-10 pr-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-colors bg-white"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-slate-50 p-6 rounded-xl border border-slate-200/60">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Qty Snack Box</label>
                    <div className="relative">
                      <Package className="absolute left-3 top-1/2 -translate-y-1/2 text-amber-500" size={18} />
                      <input 
                        type="number" 
                        min="0"
                        value={editQtySnack}
                        onChange={e => setEditQtySnack(e.target.value)}
                        className="w-full rounded-xl border border-slate-300 pl-10 pr-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-colors bg-white"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Qty Nasi Kotak</label>
                    <div className="relative">
                      <Package className="absolute left-3 top-1/2 -translate-y-1/2 text-orange-500" size={18} />
                      <input 
                        type="number" 
                        min="0"
                        value={editQtyNasi}
                        onChange={e => setEditQtyNasi(e.target.value)}
                        className="w-full rounded-xl border border-slate-300 pl-10 pr-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-colors bg-white"
                      />
                    </div>
                  </div>
                </div>

                {editBaseHarga > 0 && (
                  <div className={`p-5 rounded-xl border space-y-3 text-sm ${isEditOverBudget ? 'bg-red-50/50 border-red-200' : 'bg-emerald-50/50 border-emerald-100'}`}>
                    <div className="flex justify-between text-slate-600">
                      <span>Base Harga (Snack + Nasi)</span>
                      <span>{formatRupiah(editBaseHarga)}</span>
                    </div>
                    <div className="flex justify-between text-slate-600">
                      <span>Pajak Daerah (10%)</span>
                      <span>+ {formatRupiah(editPajak)}</span>
                    </div>
                    <div className="flex justify-between text-slate-500 text-xs">
                      <span>PPh 23 (0.5%) - Potongan</span>
                      <span>- {formatRupiah(editPph)}</span>
                    </div>
                    <div className={`pt-3 border-t flex justify-between font-bold text-lg ${isEditOverBudget ? 'border-red-200 text-red-700' : 'border-emerald-200 text-emerald-900'}`}>
                      <span>Grand Total</span>
                      <span>{formatRupiah(editGrandTotal)}</span>
                    </div>
                    {isEditOverBudget && (
                      <div className="pt-2 text-red-600 font-medium text-xs flex justify-between">
                        <span>Peringatan: Anggaran tidak mencukupi!</span>
                        <span>Sisa saat ini: {formatRupiah(editSisaAnggaranMM)}</span>
                      </div>
                    )}
                  </div>
                )}
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
                form="edit-mm-form"
                disabled={isEditOverBudget}
                className={`px-6 py-2.5 text-white font-medium rounded-xl transition-colors shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                  isEditOverBudget 
                    ? 'bg-slate-400 cursor-not-allowed focus:ring-slate-400' 
                    : 'bg-emerald-600 hover:bg-emerald-700 focus:ring-emerald-600'
                }`}
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
              <h3 className="font-bold text-slate-800 text-xl mb-2">Hapus Transaksi?</h3>
              <p className="text-slate-500 text-sm mb-1">
                Anda yakin ingin menghapus <span className="font-bold text-slate-700">"{deleteJudul}"</span>?
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
