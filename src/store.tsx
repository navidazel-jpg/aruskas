import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { SubKegiatan, PerjalananDinas, MakanMinum, AppUser } from './types';
import { loadDataFromSheets, saveDataToSheets, getOrCreateSpreadsheet } from './lib/sheets';
import { getAccessToken } from './lib/auth';

const STORAGE_KEY = 'monitoring_keuangan_data';
const USER_STORAGE_KEY = 'mak_current_user';
const USERS_LIST_KEY = 'mak_registered_users';

const defaultUsers: AppUser[] = [
  { id: '1', nama: 'Navi Dazel', jabatan: 'Bendahara Pengeluaran' },
  { id: '2', nama: 'Staf Pengelola Kas', jabatan: 'Operator Keuangan' },
  { id: '3', nama: 'PPTK Diskominfo', jabatan: 'Pejabat Pelaksana Teknis' },
];

export type AppData = {
  subKegiatan: SubKegiatan[];
  perjalananDinas: PerjalananDinas[];
  makanMinum: MakanMinum[];
};

const defaultData: AppData = {
  subKegiatan: [],
  perjalananDinas: [],
  makanMinum: [],
};

type StoreContextType = {
  data: AppData;
  isLoading: boolean;
  isSaving: boolean;
  spreadsheetId: string | null;
  currentUser: AppUser | null;
  registeredUsers: AppUser[];
  loginAsUser: (nama: string, jabatan?: string) => void;
  logoutUser: () => void;
  addRegisteredUser: (nama: string, jabatan: string) => void;
  deleteRegisteredUser: (id: string) => void;
  addSubKegiatan: (item: Omit<SubKegiatan, 'id'>) => void;
  updateSubKegiatan: (id: string, updates: Partial<SubKegiatan>) => void;
  deleteSubKegiatan: (id: string) => void;
  addPerjalananDinas: (item: Omit<PerjalananDinas, 'id' | 'createdAt'>) => void;
  updatePerjalananDinas: (id: string, updates: Partial<PerjalananDinas>) => void;
  addMakanMinum: (item: Omit<MakanMinum, 'id' | 'createdAt'>) => void;
  updateMakanMinum: (id: string, updates: Partial<MakanMinum>) => void;
  deletePerjalananDinas: (id: string) => void;
  deleteMakanMinum: (id: string) => void;
  syncToSheets: () => Promise<void>;
  initializeSheets: () => Promise<void>;
};

const StoreContext = createContext<StoreContextType | undefined>(undefined);

export function StoreProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<AppData>(defaultData);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [spreadsheetId, setSpreadsheetId] = useState<string | null>(null);

  const [registeredUsers, setRegisteredUsers] = useState<AppUser[]>(() => {
    const saved = localStorage.getItem(USERS_LIST_KEY);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return defaultUsers;
      }
    }
    return defaultUsers;
  });

  const [currentUser, setCurrentUser] = useState<AppUser | null>(() => {
    const saved = localStorage.getItem(USER_STORAGE_KEY);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return null;
      }
    }
    return null;
  });

  useEffect(() => {
    localStorage.setItem(USERS_LIST_KEY, JSON.stringify(registeredUsers));
  }, [registeredUsers]);

  const loginAsUser = (nama: string, jabatan: string = 'Staf Keuangan') => {
    const existing = registeredUsers.find(u => u.nama.toLowerCase() === nama.trim().toLowerCase());
    const userToSet: AppUser = existing || {
      id: crypto.randomUUID(),
      nama: nama.trim(),
      jabatan: jabatan.trim() || 'Staf Keuangan',
    };

    if (!existing) {
      setRegisteredUsers(prev => [...prev, userToSet]);
    }
    setCurrentUser(userToSet);
    localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(userToSet));
  };

  const logoutUser = () => {
    setCurrentUser(null);
    localStorage.removeItem(USER_STORAGE_KEY);
  };

  const addRegisteredUser = (nama: string, jabatan: string) => {
    const newUser: AppUser = {
      id: crypto.randomUUID(),
      nama: nama.trim(),
      jabatan: jabatan.trim() || 'Staf',
    };
    setRegisteredUsers(prev => [...prev, newUser]);
  };

  const deleteRegisteredUser = (id: string) => {
    setRegisteredUsers(prev => prev.filter(u => u.id !== id));
    if (currentUser?.id === id) {
      logoutUser();
    }
  };

  // Sync state changes to local storage immediately
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  }, [data]);

  // Debounced auto-save to Google Sheets
  useEffect(() => {
    if (!spreadsheetId) return;
    
    const timeoutId = setTimeout(() => {
      // Create a background save function to avoid async issues in useEffect
      const autoSave = async () => {
        try {
          setIsSaving(true);
          const token = await getAccessToken();
          if (!token) return;
          await saveDataToSheets(token, spreadsheetId, data);
        } catch (error) {
          console.error('Failed to auto-save to sheets', error);
        } finally {
          setIsSaving(false);
        }
      };
      
      // Only auto-save if we have some data
      if (data.subKegiatan.length > 0 || data.perjalananDinas.length > 0 || data.makanMinum.length > 0) {
        autoSave();
      }
    }, 2500); // 2.5 second debounce

    return () => clearTimeout(timeoutId);
  }, [data, spreadsheetId]);

  useEffect(() => {
    // Load locally first for quick access
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        setData(JSON.parse(saved));
      } catch (e) {
        // Ignore
      }
    }
  }, []);

  const initializeSheets = async () => {
    try {
      setIsLoading(true);
      const token = await getAccessToken();
      if (!token) throw new Error('No access token');
      
      const id = await getOrCreateSpreadsheet(token);
      setSpreadsheetId(id);
      
      const sheetData = await loadDataFromSheets(token, id);
      setData(sheetData);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(sheetData));
    } catch (error) {
      console.error('Failed to initialize sheets', error);
    } finally {
      setIsLoading(false);
    }
  };

  const syncToSheets = async () => {
    if (!spreadsheetId) return;
    try {
      setIsSaving(true);
      const token = await getAccessToken();
      if (!token) return;
      await saveDataToSheets(token, spreadsheetId, data);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (error) {
      console.error('Failed to sync to sheets', error);
    } finally {
      setIsSaving(false);
    }
  };

  const addSubKegiatan = (item: Omit<SubKegiatan, 'id'>) => {
    setData(prev => ({
      ...prev,
      subKegiatan: [...prev.subKegiatan, { ...item, id: crypto.randomUUID() }]
    }));
  };

  const updateSubKegiatan = (id: string, updates: Partial<SubKegiatan>) => {
    setData(prev => ({
      ...prev,
      subKegiatan: prev.subKegiatan.map(item => item.id === id ? { ...item, ...updates } : item)
    }));
  };

  const deleteSubKegiatan = (id: string) => {
    setData(prev => ({
      ...prev,
      subKegiatan: prev.subKegiatan.filter(item => item.id !== id)
    }));
  };

  const addPerjalananDinas = (item: Omit<PerjalananDinas, 'id' | 'createdAt'>) => {
    setData(prev => ({
      ...prev,
      perjalananDinas: [...prev.perjalananDinas, { ...item, id: crypto.randomUUID(), createdAt: Date.now() }]
    }));
  };

  const addMakanMinum = (item: Omit<MakanMinum, 'id' | 'createdAt'>) => {
    setData(prev => ({
      ...prev,
      makanMinum: [...prev.makanMinum, { ...item, id: crypto.randomUUID(), createdAt: Date.now() }]
    }));
  };

  const updatePerjalananDinas = (id: string, updates: Partial<PerjalananDinas>) => {
    setData(prev => ({
      ...prev,
      perjalananDinas: prev.perjalananDinas.map(item => item.id === id ? { ...item, ...updates } : item)
    }));
  };

  const updateMakanMinum = (id: string, updates: Partial<MakanMinum>) => {
    setData(prev => ({
      ...prev,
      makanMinum: prev.makanMinum.map(item => item.id === id ? { ...item, ...updates } : item)
    }));
  };

  const deletePerjalananDinas = (id: string) => {
    setData(prev => ({
      ...prev,
      perjalananDinas: prev.perjalananDinas.filter(item => item.id !== id)
    }));
  };

  const deleteMakanMinum = (id: string) => {
    setData(prev => ({
      ...prev,
      makanMinum: prev.makanMinum.filter(item => item.id !== id)
    }));
  };

  return (
    <StoreContext.Provider value={{
      data, isLoading, isSaving, spreadsheetId,
      currentUser, registeredUsers, loginAsUser, logoutUser, addRegisteredUser, deleteRegisteredUser,
      addSubKegiatan, updateSubKegiatan, deleteSubKegiatan,
      addPerjalananDinas, updatePerjalananDinas, addMakanMinum, updateMakanMinum, deletePerjalananDinas, deleteMakanMinum, syncToSheets, initializeSheets
    }}>
      {children}
    </StoreContext.Provider>
  );
}

export function useStore() {
  const context = useContext(StoreContext);
  if (!context) {
    throw new Error('useStore must be used within a StoreProvider');
  }
  return context;
}

export function formatRupiah(number: number) {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(number);
}

export function formatNumberInput(value: string | number) {
  const numberString = String(value).replace(/[^0-9]/g, '');
  if (!numberString) return '';
  return parseInt(numberString, 10).toLocaleString('id-ID');
}

export function parseNumberInput(value: string | number) {
  const numberString = String(value).replace(/[^0-9]/g, '');
  return numberString ? parseInt(numberString, 10) : 0;
}

import { format } from 'date-fns';

export function formatDateSafe(dateStr: string | undefined | null) {
  if (!dateStr) return '-';
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return '-';
  return format(d, 'dd MMM yyyy');
}

