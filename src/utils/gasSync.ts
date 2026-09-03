export const syncToGAS = async (gasUrl: string, subKegiatans: any[], pdTransactions: any[], mmTransactions: any[], dpaFiles: any[] = []) => {
  if (!gasUrl) throw new Error('GAS URL is not set');
  try {
    const res = await fetch(gasUrl, {
      method: 'POST',
      mode: 'cors',
      redirect: 'follow',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify({
        action: 'SYNC_ALL',
        payload: { subKegiatans, pdTransactions, mmTransactions, dpaFiles }
      })
    });
    const text = await res.text();
    let data;
    try {
      data = JSON.parse(text);
    } catch (e) {
      throw new Error('Response is not valid JSON. Ensure GAS URL is correct and deployed as "Anyone".');
    }
    if (data.status !== 'success') {
      throw new Error(data.message || 'Sync failed');
    }
    return data;
  } catch (err: any) {
    console.error('GAS Sync Error:', err);
    throw new Error(err.message || 'NetworkError when attempting to fetch resource.');
  }
};

export const uploadFileToGAS = async (gasUrl: string, file: File): Promise<string> => {
  if (!gasUrl) throw new Error('GAS URL is not set');
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = async () => {
      try {
        const base64Data = (reader.result as string).split(',')[1];
        const res = await fetch(gasUrl, {
          method: 'POST',
          mode: 'cors',
          redirect: 'follow',
          headers: { 'Content-Type': 'text/plain;charset=utf-8' },
          body: JSON.stringify({
            action: 'UPLOAD_FILE',
            payload: {
              filename: file.name,
              mimeType: file.type,
              base64Data: base64Data
            }
          })
        });
        const text = await res.text();
        let data;
        try {
          data = JSON.parse(text);
        } catch (e) {
          throw new Error('Response is not valid JSON.');
        }
        if (data.status !== 'success') {
          throw new Error(data.message || 'Upload failed');
        }
        resolve(data.data.url);
      } catch (err: any) {
        reject(new Error(err.message || 'Upload failed due to network error.'));
      }
    };
    reader.onerror = (error) => reject(error);
    reader.readAsDataURL(file);
  });
};

export const fetchFromGAS = async (gasUrl: string) => {
  if (!gasUrl) throw new Error('GAS URL is not set');
  try {
    const res = await fetch(gasUrl, { 
      method: 'GET',
      mode: 'cors',
      redirect: 'follow'
    });
    const text = await res.text();
    let data;
    try {
      data = JSON.parse(text);
    } catch (e) {
      throw new Error('Response is not valid JSON. Ensure GAS URL is correct and deployed as "Anyone".');
    }
    if (data.status !== 'success') {
      throw new Error(data.message || 'Fetch failed');
    }
    return data.data; // { subKegiatans, pdTransactions, mmTransactions, dpaFiles }
  } catch (err: any) {
    console.error('GAS Fetch Error:', err);
    throw new Error(err.message || 'NetworkError when attempting to fetch resource.');
  }
};
