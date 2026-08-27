import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { syncToGAS, fetchFromGAS } from '../utils/gasSync';

export type SubKegiatan = {
  id: string;
  nama: string;
  anggaranMurniPD: number;
  anggaranPerubahanPD: number;
  anggaranMurniMM: number;
  anggaranPerubahanMM: number;
  userId?: string;
  tahun?: number;
};

export type Personil = {
  id: string;
  nama: string;
  nominal: number;
};

export type PDTransaction = {
  id: string;
  subKegiatanId: string;
  judul: string;
  wilayah: string;
  tanggal: string;
  personil: Personil[];
  total: number;
  userId?: string;
  tahun?: number;
};

export type MMTransaction = {
  id: string;
  subKegiatanId: string;
  judul: string;
  tanggal: string;
  qtySnack: number;
  qtyNasi: number;
  baseHarga: number;
  pajak: number;
  pph: number;
  grandTotal: number;
  userId?: string;
  tahun?: number;
};

export type DpaFile = {
  id: string;
  name: string;
  url: string;
  size: number;
  uploadedAt: string;
  tahun?: number;
};

type AppState = {
  subKegiatans: SubKegiatan[];
  pdTransactions: PDTransaction[];
  mmTransactions: MMTransaction[];
  dpaFiles: DpaFile[];
  addSubKegiatan: (item: SubKegiatan) => void;
  editSubKegiatan: (id: string, item: SubKegiatan) => void;
  deleteSubKegiatan: (id: string) => void;
  addPDTransaction: (item: PDTransaction) => void;
  editPDTransaction: (id: string, item: PDTransaction) => void;
  deletePDTransaction: (id: string) => void;
  addMMTransaction: (item: MMTransaction) => void;
  editMMTransaction: (id: string, item: MMTransaction) => void;
  deleteMMTransaction: (id: string) => void;
  addDpaFiles: (files: DpaFile[]) => void;
  deleteDpaFile: (id: string) => void;
  
  gasUrl: string;
  setGasUrl: (url: string) => void;
  isSyncing: boolean;
  manualSync: () => Promise<void>;
  isFirebaseReady: boolean;
  selectedYear: number;
  setSelectedYear: (year: number) => void;
};

const initialState: AppState = {
  subKegiatans: [],
  pdTransactions: [],
  mmTransactions: [],
  dpaFiles: [],
  addSubKegiatan: () => {},
  editSubKegiatan: () => {},
  deleteSubKegiatan: () => {},
  addPDTransaction: () => {},
  editPDTransaction: () => {},
  deletePDTransaction: () => {},
  addMMTransaction: () => {},
  editMMTransaction: () => {},
  deleteMMTransaction: () => {},
  addDpaFiles: () => {},
  deleteDpaFile: () => {},
  
  gasUrl: '',
  setGasUrl: () => {},
  isSyncing: false,
  manualSync: async () => {},
  isFirebaseReady: true,
  selectedYear: 2026,
  setSelectedYear: () => {}
};

const AppContext = createContext<AppState>(initialState);

export const AppProvider = ({ children }: { children: ReactNode }) => {
  const [allSubKegiatans, setAllSubKegiatans] = useState<SubKegiatan[]>([]);
  const [allPdTransactions, setAllPdTransactions] = useState<PDTransaction[]>([]);
  const [allMmTransactions, setAllMmTransactions] = useState<MMTransaction[]>([]);
  const [allDpaFiles, setAllDpaFiles] = useState<DpaFile[]>([]);
  
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear() === 2026 ? 2026 : 2026); // Default 2026
  
  // Derived state based on selected year. If a record lacks 'tahun', assume it belongs to 2026.
  const subKegiatans = allSubKegiatans.filter(sk => Number(sk.tahun || 2026) === selectedYear);
  const pdTransactions = allPdTransactions.filter(pd => Number(pd.tahun || 2026) === selectedYear);
  const mmTransactions = allMmTransactions.filter(mm => Number(mm.tahun || 2026) === selectedYear);
  const dpaFiles = allDpaFiles.filter(f => Number(f.tahun || 2026) === selectedYear);

  const HARDCODED_GAS_URL = "https://script.google.com/macros/s/AKfycbyfB3cqLWQp3SIauLPBmwY85HEpPXD9jRp5Hc2ln7ayENjYmfKdBfFsK42Gb274LQ/exec";
  const [gasUrl, setGasUrlState] = useState<string>(HARDCODED_GAS_URL);
  const [isSyncing, setIsSyncing] = useState(false);
  const [isFirebaseReady, setIsFirebaseReady] = useState(true);

  const setGasUrl = (url: string) => {
    setGasUrlState(url);
  };

  const loadFromGAS = async () => {
    if (!gasUrl) return;
    setIsSyncing(true);
    try {
      const data = await fetchFromGAS(gasUrl);
      setAllSubKegiatans(data.subKegiatans || []);
      setAllPdTransactions(data.pdTransactions || []);
      setAllMmTransactions(data.mmTransactions || []);
      setAllDpaFiles(data.dpaFiles || []);
    } catch (err) {
      console.error(err);
      alert('Gagal mengambil data dari Google Sheets. Pastikan URL Web App valid dan sudah diset ke "Execute as me, access to anyone".');
    } finally {
      setIsSyncing(false);
    }
  };

  useEffect(() => {
    loadFromGAS();
  }, [gasUrl]);

  const saveToGAS = async (newSk: SubKegiatan[], newPd: PDTransaction[], newMm: MMTransaction[], newDpa: DpaFile[]) => {
    if (!gasUrl) return;
    setIsSyncing(true);
    try {
      await syncToGAS(gasUrl, newSk, newPd, newMm, newDpa);
    } catch (err) {
      console.error(err);
      alert('Gagal menyimpan ke Google Sheets.');
    } finally {
      setIsSyncing(false);
    }
  };

  const manualSync = async () => {
    await loadFromGAS();
  };

  // -- CRUD SUB KEGIATAN --
  const addSubKegiatan = (item: SubKegiatan) => {
    const newItem = { ...item, tahun: item.tahun || selectedYear };
    const newData = [...allSubKegiatans, newItem];
    setAllSubKegiatans(newData);
    saveToGAS(newData, allPdTransactions, allMmTransactions, allDpaFiles);
  };
  const editSubKegiatan = (id: string, item: SubKegiatan) => {
    const newItem = { ...item, tahun: item.tahun || selectedYear };
    const newData = allSubKegiatans.map(sk => sk.id === id ? newItem : sk);
    setAllSubKegiatans(newData);
    saveToGAS(newData, allPdTransactions, allMmTransactions, allDpaFiles);
  };
  const deleteSubKegiatan = (id: string) => {
    const newData = allSubKegiatans.filter(sk => sk.id !== id);
    setAllSubKegiatans(newData);
    saveToGAS(newData, allPdTransactions, allMmTransactions, allDpaFiles);
  };
  
  // -- CRUD PD TRANSACTIONS --
  const addPDTransaction = (item: PDTransaction) => {
    const newItem = { ...item, tahun: selectedYear };
    const newData = [...allPdTransactions, newItem];
    setAllPdTransactions(newData);
    saveToGAS(allSubKegiatans, newData, allMmTransactions, allDpaFiles);
  };
  const editPDTransaction = (id: string, item: PDTransaction) => {
    const newItem = { ...item, tahun: item.tahun || selectedYear };
    const newData = allPdTransactions.map(tx => tx.id === id ? newItem : tx);
    setAllPdTransactions(newData);
    saveToGAS(allSubKegiatans, newData, allMmTransactions, allDpaFiles);
  };
  const deletePDTransaction = (id: string) => {
    const newData = allPdTransactions.filter(tx => tx.id !== id);
    setAllPdTransactions(newData);
    saveToGAS(allSubKegiatans, newData, allMmTransactions, allDpaFiles);
  };

  // -- CRUD MM TRANSACTIONS --
  const addMMTransaction = (item: MMTransaction) => {
    const newItem = { ...item, tahun: selectedYear };
    const newData = [...allMmTransactions, newItem];
    setAllMmTransactions(newData);
    saveToGAS(allSubKegiatans, allPdTransactions, newData, allDpaFiles);
  };
  const editMMTransaction = (id: string, item: MMTransaction) => {
    const newItem = { ...item, tahun: item.tahun || selectedYear };
    const newData = allMmTransactions.map(tx => tx.id === id ? newItem : tx);
    setAllMmTransactions(newData);
    saveToGAS(allSubKegiatans, allPdTransactions, newData, allDpaFiles);
  };
  const deleteMMTransaction = (id: string) => {
    const newData = allMmTransactions.filter(tx => tx.id !== id);
    setAllMmTransactions(newData);
    saveToGAS(allSubKegiatans, allPdTransactions, newData, allDpaFiles);
  };
  
  // -- CRUD DPA FILES --
  const addDpaFiles = (files: DpaFile[]) => {
    const newFiles = files.map(f => ({ ...f, tahun: f.tahun || selectedYear }));
    const newData = [...allDpaFiles, ...newFiles];
    setAllDpaFiles(newData);
    saveToGAS(allSubKegiatans, allPdTransactions, allMmTransactions, newData);
  };
  const deleteDpaFile = (id: string) => {
    const newData = allDpaFiles.filter(f => f.id !== id);
    setAllDpaFiles(newData);
    saveToGAS(allSubKegiatans, allPdTransactions, allMmTransactions, newData);
  };

  return (
    <AppContext.Provider value={{
      subKegiatans, pdTransactions, mmTransactions, dpaFiles,
      addSubKegiatan, editSubKegiatan, deleteSubKegiatan,
      addPDTransaction, editPDTransaction, deletePDTransaction,
      addMMTransaction, editMMTransaction, deleteMMTransaction,
      addDpaFiles, deleteDpaFile,
      gasUrl, setGasUrl, isSyncing, manualSync, isFirebaseReady,
      selectedYear, setSelectedYear
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => useContext(AppContext);

