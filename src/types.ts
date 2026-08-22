export type AppUser = {
  id: string;
  nama: string;
  jabatan: string;
};

export type SubKegiatan = {
  id: string;
  nama: string;
  anggaranMurniPD: number;
  anggaranPerubahanPD: number;
  anggaranMurniMM: number;
  anggaranPerubahanMM: number;
};

export type Personil = {
  id: string;
  nama: string;
  nominal: number;
};

export type PerjalananDinas = {
  id: string;
  subKegiatanId: string;
  judul: string;
  wilayah: string;
  tanggal: string;
  personil: Personil[];
  total: number;
  createdAt: number;
};

export type MakanMinum = {
  id: string;
  subKegiatanId: string;
  judul: string;
  tanggal: string;
  qtySnack: number;
  qtyMakan: number;
  total: number;
  createdAt: number;
};
