function doGet(e) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const data = {
    subKegiatans: getSheetData(ss, 'SubKegiatan'),
    pdTransactions: getSheetData(ss, 'PDTransactions'),
    mmTransactions: getSheetData(ss, 'MMTransactions'),
    dpaFiles: getSheetData(ss, 'DPAFiles')
  };
  
  // Format MMTransactions json strings back to objects (if applicable) or leave as is.
  // Note: MMTransactions might have nested arrays or objects, but in our TS it's mostly primitives except PDTransaction.personil
  
  // Parse personil JSON strings back to arrays
  data.pdTransactions = data.pdTransactions.map(tx => {
    if (tx.personil && typeof tx.personil === 'string') {
      try {
        tx.personil = JSON.parse(tx.personil);
      } catch (e) {
        tx.personil = [];
      }
    }
    return tx;
  });

  return ContentService.createTextOutput(JSON.stringify({ status: 'success', data }))
    .setMimeType(ContentService.MimeType.JSON);
}

function doPost(e) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let req;
  try {
    req = JSON.parse(e.postData.contents);
  } catch(err) {
    return ContentService.createTextOutput(JSON.stringify({ status: 'error', message: 'Invalid JSON' })).setMimeType(ContentService.MimeType.JSON);
  }

  const { action, payload } = req;
  let result = null;

  try {
    if (action === 'SYNC_ALL') {
      // Stringify personil arrays for PDTransactions before saving
      const pdTrans = payload.pdTransactions.map(tx => {
        return {
          ...tx,
          personil: tx.personil ? JSON.stringify(tx.personil) : '[]'
        };
      });
      
      overwriteSheet(ss, 'SubKegiatan', payload.subKegiatans);
      overwriteSheet(ss, 'PDTransactions', pdTrans);
      overwriteSheet(ss, 'MMTransactions', payload.mmTransactions);
      if (payload.dpaFiles) {
        overwriteSheet(ss, 'DPAFiles', payload.dpaFiles);
      }
      result = 'Synced successfully';
    } else if (action === 'UPLOAD_FILE') {
      var blob = Utilities.newBlob(Utilities.base64Decode(payload.base64Data), payload.mimeType, payload.filename);
      var folderIter = DriveApp.getFoldersByName("DPA_Files");
      var folder = folderIter.hasNext() ? folderIter.next() : DriveApp.createFolder("DPA_Files");
      var file = folder.createFile(blob);
      file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
      result = { url: file.getUrl() };
    }
  } catch (err) {
      return ContentService.createTextOutput(JSON.stringify({ status: 'error', message: err.toString() })).setMimeType(ContentService.MimeType.JSON);
  }

  return ContentService.createTextOutput(JSON.stringify({ status: 'success', data: result }))
    .setMimeType(ContentService.MimeType.JSON);
}

// OPTIONS handler for CORS preflight
function doOptions(e) {
  const headers = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Max-Age": "86400"
  };
  return ContentService.createTextOutput("")
    .setMimeType(ContentService.MimeType.TEXT)
    .setHeaders(headers);
}

function getSheetData(ss, sheetName) {
  const sheet = ss.getSheetByName(sheetName);
  if (!sheet) return [];
  const data = sheet.getDataRange().getValues();
  if (data.length < 2) return [];
  const headers = data[0];
  const rows = [];
  for (let i = 1; i < data.length; i++) {
    const rowData = {};
    for (let j = 0; j < headers.length; j++) {
      rowData[headers[j]] = data[i][j];
    }
    rows.push(rowData);
  }
  return rows;
}

function overwriteSheet(ss, sheetName, dataArray) {
  let sheet = ss.getSheetByName(sheetName);
  if (!sheet) {
    sheet = ss.insertSheet(sheetName);
  }
  sheet.clear();
  if (!dataArray || dataArray.length === 0) return;
  
  const headers = Object.keys(dataArray[0]);
  const values = [headers];
  for (let i = 0; i < dataArray.length; i++) {
    const row = [];
    for (let j = 0; j < headers.length; j++) {
      row.push(dataArray[i][headers[j]]);
    }
    values.push(row);
  }
  sheet.getRange(1, 1, values.length, headers.length).setValues(values);
}
