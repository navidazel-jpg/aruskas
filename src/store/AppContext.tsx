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
};

type AppState = {
  subKegiatans: SubKegiatan[];
  pdTransactions: PDTransaction[];
  mmTransactions: MMTransaction[];
  addSubKegiatan: (item: SubKegiatan) => void;
  editSubKegiatan: (id: string, item: SubKegiatan) => void;
  deleteSubKegiatan: (id: string) => void;
  addPDTransaction: (item: PDTransaction) => void;
  editPDTransaction: (id: string, item: PDTransaction) => void;
  deletePDTransaction: (id: string) => void;
  addMMTransaction: (item: MMTransaction) => void;
  editMMTransaction: (id: string, item: MMTransaction) => void;
  deleteMMTransaction: (id: string) => void;
  
  gasUrl: string;
  setGasUrl: (url: string) => void;
  isSyncing: boolean;
  manualSync: () => Promise<void>;
  isFirebaseReady: boolean;
};

const initialState: AppState = {
  subKegiatans: [],
  pdTransactions: [],
  mmTransactions: [],
  addSubKegiatan: () => {},
  editSubKegiatan: () => {},
  deleteSubKegiatan: () => {},
  addPDTransaction: () => {},
  editPDTransaction: () => {},
  deletePDTransaction: () => {},
  addMMTransaction: () => {},
  editMMTransaction: () => {},
  deleteMMTransaction: () => {},
  
  gasUrl: '',
  setGasUrl: () => {},
  isSyncing: false,
  manualSync: async () => {},
  isFirebaseReady: true,
};

const AppContext = createContext<AppState>(initialState);

export const AppProvider = ({ children }: { children: ReactNode }) => {
  const [subKegiatans, setSubKegiatans] = useState<SubKegiatan[]>([]);
  const [pdTransactions, setPdTransactions] = useState<PDTransaction[]>([]);
  const [mmTransactions, setMmTransactions] = useState<MMTransaction[]>([]);
  const HARDCODED_GAS_URL = "https://script.google.com/macros/s/AKfycbw4U-jbwpBbZHA0AlZzMw5rJy5REtu0BIjGMf88X7ViPt8NgfOiRE5N7xU-JrUp9CPY/exec";
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
      setSubKegiatans(data.subKegiatans || []);
      setPdTransactions(data.pdTransactions || []);
      setMmTransactions(data.mmTransactions || []);
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

  const saveToGAS = async (newSk: SubKegiatan[], newPd: PDTransaction[], newMm: MMTransaction[]) => {
    if (!gasUrl) return;
    setIsSyncing(true);
    try {
      await syncToGAS(gasUrl, newSk, newPd, newMm);
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
    const newData = [...subKegiatans, item];
    setSubKegiatans(newData);
    saveToGAS(newData, pdTransactions, mmTransactions);
  };
  const editSubKegiatan = (id: string, item: SubKegiatan) => {
    const newData = subKegiatans.map(sk => sk.id === id ? item : sk);
    setSubKegiatans(newData);
    saveToGAS(newData, pdTransactions, mmTransactions);
  };
  const deleteSubKegiatan = (id: string) => {
    const newData = subKegiatans.filter(sk => sk.id !== id);
    setSubKegiatans(newData);
    saveToGAS(newData, pdTransactions, mmTransactions);
  };
  
  // -- CRUD PD TRANSACTIONS --
  const addPDTransaction = (item: PDTransaction) => {
    const newData = [...pdTransactions, item];
    setPdTransactions(newData);
    saveToGAS(subKegiatans, newData, mmTransactions);
  };
  const editPDTransaction = (id: string, item: PDTransaction) => {
    const newData = pdTransactions.map(tx => tx.id === id ? item : tx);
    setPdTransactions(newData);
    saveToGAS(subKegiatans, newData, mmTransactions);
  };
  const deletePDTransaction = (id: string) => {
    const newData = pdTransactions.filter(tx => tx.id !== id);
    setPdTransactions(newData);
    saveToGAS(subKegiatans, newData, mmTransactions);
  };

  // -- CRUD MM TRANSACTIONS --
  const addMMTransaction = (item: MMTransaction) => {
    const newData = [...mmTransactions, item];
    setMmTransactions(newData);
    saveToGAS(subKegiatans, pdTransactions, newData);
  };
  const editMMTransaction = (id: string, item: MMTransaction) => {
    const newData = mmTransactions.map(tx => tx.id === id ? item : tx);
    setMmTransactions(newData);
    saveToGAS(subKegiatans, pdTransactions, newData);
  };
  const deleteMMTransaction = (id: string) => {
    const newData = mmTransactions.filter(tx => tx.id !== id);
    setMmTransactions(newData);
    saveToGAS(subKegiatans, pdTransactions, newData);
  };

  return (
    <AppContext.Provider value={{
      subKegiatans, pdTransactions, mmTransactions,
      addSubKegiatan, editSubKegiatan, deleteSubKegiatan,
      addPDTransaction, editPDTransaction, deletePDTransaction,
      addMMTransaction, editMMTransaction, deleteMMTransaction,
      gasUrl, setGasUrl, isSyncing, manualSync, isFirebaseReady
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => useContext(AppContext);

