export const syncToGAS = async (gasUrl: string, subKegiatans: any[], pdTransactions: any[], mmTransactions: any[]) => {
  if (!gasUrl) throw new Error('GAS URL is not set');
  try {
    const res = await fetch(gasUrl, {
      method: 'POST',
      body: JSON.stringify({
        action: 'SYNC_ALL',
        payload: {
          subKegiatans,
          pdTransactions,
          mmTransactions
        }
      })
    });
    const data = await res.json();
    if (data.status !== 'success') {
      throw new Error(data.message || 'Sync failed');
    }
    return data;
  } catch (err) {
    console.error('GAS Sync Error:', err);
    throw err;
  }
};

export const fetchFromGAS = async (gasUrl: string) => {
  if (!gasUrl) throw new Error('GAS URL is not set');
  try {
    const res = await fetch(gasUrl, { method: 'GET' });
    const data = await res.json();
    if (data.status !== 'success') {
      throw new Error(data.message || 'Fetch failed');
    }
    return data.data; // { subKegiatans, pdTransactions, mmTransactions, dpaFiles }
  } catch (err) {
    console.error('GAS Fetch Error:', err);
    throw err;
  }
};
