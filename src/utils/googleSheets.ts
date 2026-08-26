import { getAccessToken } from './auth';

export const exportToGoogleSheets = async (data: any[], sheetName: string): Promise<string> => {
  const token = await getAccessToken();
  if (!token) throw new Error('Authentication required for exporting to Google Sheets.');

  // 1. Create a new spreadsheet
  const createRes = await fetch('https://sheets.googleapis.com/v4/spreadsheets', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      properties: { title: sheetName }
    })
  });
  
  if (!createRes.ok) throw new Error('Failed to create spreadsheet');
  const sheet = await createRes.json();
  const spreadsheetId = sheet.spreadsheetId;
  const sheetUrl = sheet.spreadsheetUrl;

  // 2. Format data to row values
  const headers = Object.keys(data[0] || {});
  const rows = [headers, ...data.map(item => headers.map(key => item[key]))];

  // 3. Update the spreadsheet with data
  const updateRes = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/Sheet1!A1:Z?valueInputOption=USER_ENTERED`, {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      range: 'Sheet1!A1:Z',
      majorDimension: 'ROWS',
      values: rows
    })
  });

  if (!updateRes.ok) throw new Error('Failed to write data to spreadsheet');
  
  return sheetUrl;
};
