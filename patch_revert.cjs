const fs = require('fs');

// 1. Revert AppContext.tsx
let appCtx = fs.readFileSync('src/store/AppContext.tsx', 'utf-8');

appCtx = appCtx.replace(/export type DPAFile = {[\s\S]*?};\n\n/, '');
appCtx = appCtx.replace(/  dpaFiles: DPAFile\[\];\n  setDpaFiles: \(files: DPAFile\[\]\) => void;\n/, '');
appCtx = appCtx.replace(/  dpaFiles: \[\],\n  setDpaFiles: \(\) => {},\n/, '');
appCtx = appCtx.replace(/  const \[dpaFiles, setDpaFilesState\] = useState<DPAFile\[\]>\(\[\]\);\n/, '');
appCtx = appCtx.replace(/      setDpaFilesState\(data.dpaFiles \|\| \[\]\);\n/, '');
appCtx = appCtx.replace(/, newDpa: DPAFile\[\] = dpaFiles/, '');
appCtx = appCtx.replace(/, newDpa/, '');
appCtx = appCtx.replace(/  const setDpaFiles = \(files: DPAFile\[\]\) => {[\s\S]*?};\n\n/, '');
appCtx = appCtx.replace(/ dpaFiles, setDpaFiles,/, '');

fs.writeFileSync('src/store/AppContext.tsx', appCtx);

// 2. Revert gasSync.ts
let gasSync = fs.readFileSync('src/utils/gasSync.ts', 'utf-8');
gasSync = gasSync.replace(/, dpaFiles: any\[\] = \[\]/, '');
gasSync = gasSync.replace(/,\n          dpaFiles/, '');
fs.writeFileSync('src/utils/gasSync.ts', gasSync);

