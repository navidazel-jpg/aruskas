import { AppData, SubKegiatan, Personil, MakanMinumData } from '../types';

const SHEET_NAME = 'KasFlow Data';

export async function getOrCreateSpreadsheet(accessToken: string): Promise<string> {
  // 1. Search for existing spreadsheet created by this app
  const query = encodeURIComponent(`name='${SHEET_NAME}' and mimeType='application/vnd.google-apps.spreadsheet' and trashed=false`);
  try {
    const searchRes = await fetch(`https://www.googleapis.com/drive/v3/files?q=${query}`, {
      headers: { Authorization: `Bearer ${accessToken}` }
    });
    if (!searchRes.ok) {
      const text = await searchRes.text();
      throw new Error(`Drive API error: ${searchRes.status} ${text}`);
    }
    const searchData = await searchRes.json();
    
    if (searchData.files && searchData.files.length > 0) {
      return searchData.files[0].id;
    }

    // 2. Create a new spreadsheet
    const createRes = await fetch(`https://sheets.googleapis.com/v4/spreadsheets`, {
      method: 'POST',
      headers: { 
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        properties: { title: SHEET_NAME },
        sheets: [
          { properties: { title: 'SubKegiatan' } },
          { properties: { title: 'PerjalananDinas' } },
          { properties: { title: 'MakanMinum' } }
        ]
      })
    });
    
    if (!createRes.ok) {
      const text = await createRes.text();
      throw new Error(`Sheets API create error: ${createRes.status} ${text}`);
    }
    const createData = await createRes.json();
    
    // Initialize with headers
    const spreadsheetId = createData.spreadsheetId;
    await initHeaders(accessToken, spreadsheetId);
    return spreadsheetId;
  } catch (error) {
    console.error('getOrCreateSpreadsheet error:', error);
    throw error;
  }
}

async function initHeaders(accessToken: string, spreadsheetId: string) {
  const data = [
    {
      range: 'SubKegiatan!A1:F1',
      values: [['ID', 'Nama', 'Anggaran Murni PD', 'Anggaran Perubahan PD', 'Anggaran Murni MM', 'Anggaran Perubahan MM']]
    },
    {
      range: 'PerjalananDinas!A1:G1',
      values: [['ID', 'Sub Kegiatan ID', 'Tanggal Berangkat', 'Tanggal Kembali', 'Tujuan', 'Total', 'Personil (JSON)']]
    },
    {
      range: 'MakanMinum!A1:G1',
      values: [['ID', 'Sub Kegiatan ID', 'Tanggal', 'Keterangan', 'Jenis Pesanan', 'Jumlah Pesanan', 'Total']]
    }
  ];

  await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values:batchUpdate`, {
    method: 'POST',
    headers: { 
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      valueInputOption: 'USER_ENTERED',
      data
    })
  });
}

export async function loadDataFromSheets(accessToken: string, spreadsheetId: string): Promise<AppData> {
  const res = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values:batchGet?ranges=SubKegiatan!A2:F&ranges=PerjalananDinas!A2:G&ranges=MakanMinum!A2:G`, {
    headers: { Authorization: `Bearer ${accessToken}` }
  });
  const data = await res.json();
  
  const valueRanges = data.valueRanges || [];
  
  const subKegiatanRows = valueRanges[0]?.values || [];
  const pdRows = valueRanges[1]?.values || [];
  const mmRows = valueRanges[2]?.values || [];

  const subKegiatan: SubKegiatan[] = subKegiatanRows.map((row: any) => ({
    id: row[0],
    nama: row[1],
    anggaranMurniPD: Number(row[2]) || 0,
    anggaranPerubahanPD: Number(row[3]) || 0,
    anggaranMurniMM: Number(row[4]) || 0,
    anggaranPerubahanMM: Number(row[5]) || 0,
  }));

  const perjalananDinas = pdRows.map((row: any) => ({
    id: row[0],
    subKegiatanId: row[1],
    tanggalBerangkat: row[2],
    tanggalKembali: row[3],
    tujuan: row[4],
    total: Number(row[5]) || 0,
    personil: row[6] ? JSON.parse(row[6]) : []
  }));

  const makanMinum = mmRows.map((row: any) => ({
    id: row[0],
    subKegiatanId: row[1],
    tanggal: row[2],
    keterangan: row[3],
    jenisPesanan: row[4],
    jumlahPesanan: Number(row[5]) || 0,
    total: Number(row[6]) || 0
  }));

  return { subKegiatan, perjalananDinas, makanMinum };
}

export async function saveDataToSheets(accessToken: string, spreadsheetId: string, data: AppData) {
  // Clear existing data (except headers)
  await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values:batchClear`, {
    method: 'POST',
    headers: { 
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      ranges: ['SubKegiatan!A2:F', 'PerjalananDinas!A2:G', 'MakanMinum!A2:G']
    })
  });

  const skValues = data.subKegiatan.map(sk => [
    sk.id, sk.nama, sk.anggaranMurniPD, sk.anggaranPerubahanPD, sk.anggaranMurniMM, sk.anggaranPerubahanMM
  ]);

  const pdValues = data.perjalananDinas.map(pd => [
    pd.id, pd.subKegiatanId, pd.tanggalBerangkat, pd.tanggalKembali, pd.tujuan, pd.total, JSON.stringify(pd.personil)
  ]);

  const mmValues = data.makanMinum.map(mm => [
    mm.id, mm.subKegiatanId, mm.tanggal, mm.keterangan, mm.jenisPesanan, mm.jumlahPesanan, mm.total
  ]);

  const updateData = [];
  if (skValues.length > 0) updateData.push({ range: 'SubKegiatan!A2:F', values: skValues });
  if (pdValues.length > 0) updateData.push({ range: 'PerjalananDinas!A2:G', values: pdValues });
  if (mmValues.length > 0) updateData.push({ range: 'MakanMinum!A2:G', values: mmValues });

  if (updateData.length === 0) return; // Nothing to save

  await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values:batchUpdate`, {
    method: 'POST',
    headers: { 
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      valueInputOption: 'USER_ENTERED',
      data: updateData
    })
  });
}
