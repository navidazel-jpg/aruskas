import { SubKegiatan, Personil, MakanMinum } from '../types';
import { AppData } from '../store';

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
      range: 'PerjalananDinas!A1:H1',
      values: [['ID', 'Sub Kegiatan ID', 'Judul', 'Wilayah', 'Tanggal', 'Total', 'Personil (JSON)', 'Created At']]
    },
    {
      range: 'MakanMinum!A1:H1',
      values: [['ID', 'Sub Kegiatan ID', 'Judul', 'Tanggal', 'Qty Snack', 'Qty Makan', 'Total', 'Created At']]
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
  const res = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values:batchGet?ranges=SubKegiatan!A2:F&ranges=PerjalananDinas!A2:H&ranges=MakanMinum!A2:H`, {
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
    judul: row[2] || '',
    wilayah: row[3] || '',
    tanggal: row[4] || '',
    total: Number(row[5]) || 0,
    personil: row[6] ? JSON.parse(row[6]) : [],
    createdAt: Number(row[7]) || Date.now()
  }));

  const makanMinum = mmRows.map((row: any) => ({
    id: row[0],
    subKegiatanId: row[1],
    judul: row[2] || '',
    tanggal: row[3] || '',
    qtySnack: Number(row[4]) || 0,
    qtyMakan: Number(row[5]) || 0,
    total: Number(row[6]) || 0,
    createdAt: Number(row[7]) || Date.now()
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
      ranges: ['SubKegiatan!A2:F', 'PerjalananDinas!A2:H', 'MakanMinum!A2:H']
    })
  });

  const skValues = data.subKegiatan.map(sk => [
    sk.id, sk.nama, sk.anggaranMurniPD, sk.anggaranPerubahanPD, sk.anggaranMurniMM, sk.anggaranPerubahanMM
  ]);

  const pdValues = data.perjalananDinas.map(pd => [
    pd.id, pd.subKegiatanId, pd.judul, pd.wilayah, pd.tanggal, pd.total, JSON.stringify(pd.personil), pd.createdAt
  ]);

  const mmValues = data.makanMinum.map(mm => [
    mm.id, mm.subKegiatanId, mm.judul, mm.tanggal, mm.qtySnack, mm.qtyMakan, mm.total, mm.createdAt
  ]);

  const updateData = [];
  if (skValues.length > 0) updateData.push({ range: 'SubKegiatan!A2:F', values: skValues });
  if (pdValues.length > 0) updateData.push({ range: 'PerjalananDinas!A2:H', values: pdValues });
  if (mmValues.length > 0) updateData.push({ range: 'MakanMinum!A2:H', values: mmValues });

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
