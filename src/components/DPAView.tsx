import React, { useState, useEffect, useRef } from 'react';
import { Upload, FileText, Trash2, RefreshCw, CheckCircle, Plus } from 'lucide-react';
import { get, set } from 'idb-keyval';

type DPAFile = {
  id: string;
  name: string;
  dataUrl: string;
  uploadedAt: number;
};

export const DPAView = () => {
  const [dpaFiles, setDpaFiles] = useState<DPAFile[]>([]);
  const [selectedFileId, setSelectedFileId] = useState<string | null>(null);
  
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isReady, setIsReady] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Load existing DPAs from local IndexedDB on mount
    get('dpa_documents').then((data) => {
      if (data && Array.isArray(data)) {
        setDpaFiles(data);
        if (data.length > 0) {
          setSelectedFileId(data[0].id);
        }
      }
      setIsReady(true);
    });
  }, []);

  const processFiles = async (files: File[]) => {
    const pdfFiles = files.filter(f => f.type === 'application/pdf');
    if (pdfFiles.length === 0) {
      alert('Mohon unggah file dalam format PDF.');
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);

    // Simulate progress for UI feedback
    const interval = setInterval(() => {
      setUploadProgress(prev => (prev >= 90 ? 90 : prev + 10));
    }, 100);

    const newFiles: DPAFile[] = [];

    for (const file of pdfFiles) {
      const base64Str = await new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onload = (e) => resolve(e.target?.result as string);
        reader.readAsDataURL(file);
      });
      newFiles.push({
        id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
        name: file.name,
        dataUrl: base64Str,
        uploadedAt: Date.now(),
      });
    }

    clearInterval(interval);
    setUploadProgress(100);
    
    // Save locally
    const updatedList = [...dpaFiles, ...newFiles];
    setDpaFiles(updatedList);
    if (!selectedFileId && updatedList.length > 0) {
      setSelectedFileId(updatedList[0].id);
    }
    await set('dpa_documents', updatedList);
    
    setTimeout(() => {
      setIsUploading(false);
      setUploadProgress(0);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }, 600);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      processFiles(Array.from(e.target.files));
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processFiles(Array.from(e.dataTransfer.files));
    }
  };

  const handleDelete = async (idToDelete: string, e: React.MouseEvent) => {
    e.stopPropagation(); // prevent selecting the item while deleting
    if (confirm('Apakah Anda yakin ingin menghapus dokumen DPA ini?')) {
      const updatedList = dpaFiles.filter(f => f.id !== idToDelete);
      setDpaFiles(updatedList);
      
      if (selectedFileId === idToDelete) {
        setSelectedFileId(updatedList.length > 0 ? updatedList[0].id : null);
      }
      
      await set('dpa_documents', updatedList);
    }
  };

  if (!isReady) {
    return (
      <div className="flex items-center justify-center h-64 text-slate-500">
        <RefreshCw className="animate-spin mr-3" size={24} /> Memuat data...
      </div>
    );
  }

  const selectedFile = dpaFiles.find(f => f.id === selectedFileId);

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 lg:p-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <h3 className="font-bold text-slate-800 flex items-center gap-2 text-xl">
            <FileText className="text-blue-500" size={24} /> Dokumen Pelaksanaan Anggaran (DPA)
          </h3>
          
          {dpaFiles.length > 0 && !isUploading && (
            <button 
              onClick={() => fileInputRef.current?.click()}
              className="px-4 py-2 bg-blue-50 text-blue-600 hover:bg-blue-100 font-medium rounded-lg transition-colors flex items-center gap-2 text-sm"
            >
              <Plus size={18} /> Tambah DPA Baru
            </button>
          )}
        </div>
        
        {/* Upload Zone */}
        {(dpaFiles.length === 0 || isUploading) && (
          <div 
            className={`border-2 border-dashed rounded-2xl p-12 text-center transition-all relative ${
              isDragging ? 'border-blue-500 bg-blue-50 scale-[1.01]' : 'border-slate-300 bg-slate-50 hover:bg-slate-100'
            } ${dpaFiles.length === 0 ? 'cursor-pointer' : ''}`}
            onClick={() => { if (!isUploading) fileInputRef.current?.click() }}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            <input 
              type="file" 
              accept="application/pdf"
              multiple
              className="hidden" 
              ref={fileInputRef}
              onChange={handleFileUpload}
            />
            
            {isUploading ? (
              <div className="flex flex-col items-center justify-center">
                {uploadProgress < 100 ? (
                  <RefreshCw className="text-blue-500 animate-spin mb-4" size={40} />
                ) : (
                  <CheckCircle className="text-emerald-500 mb-4" size={40} />
                )}
                <h4 className="text-lg font-bold text-slate-700 mb-4">
                  {uploadProgress < 100 ? 'Mengunggah Dokumen...' : 'Selesai!'}
                </h4>
                <div className="w-full max-w-md bg-slate-200 rounded-full h-3 mb-2 overflow-hidden">
                  <div 
                    className="bg-blue-500 h-3 rounded-full transition-all duration-200 ease-out" 
                    style={{ width: `${uploadProgress}%` }}
                  ></div>
                </div>
                <p className="text-sm text-slate-500 font-medium">{uploadProgress}%</p>
              </div>
            ) : (
              <div>
                <div className={`mx-auto w-16 h-16 rounded-full flex items-center justify-center shadow-sm border mb-4 transition-colors ${
                  isDragging ? 'bg-blue-100 border-blue-200 text-blue-600' : 'bg-white border-slate-200 text-blue-500'
                }`}>
                  <Upload size={28} />
                </div>
                <h4 className="text-lg font-bold text-slate-700 mb-2">Unggah Dokumen DPA</h4>
                <p className="text-slate-500 text-sm mb-6 max-w-sm mx-auto">
                  Tarik dan lepas (drag & drop) file PDF di sini, atau klik untuk memilih file. Anda bisa mengunggah lebih dari 1 file sekaligus.
                </p>
                <button className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl transition-colors shadow-sm pointer-events-none">
                  Pilih File PDF
                </button>
              </div>
            )}
          </div>
        )}

        {/* Hidden File Input for the small Add button */}
        {dpaFiles.length > 0 && !isUploading && (
          <input 
            type="file" 
            accept="application/pdf"
            multiple
            className="hidden" 
            ref={fileInputRef}
            onChange={handleFileUpload}
          />
        )}

        {dpaFiles.length > 0 && (
          <div className={`mt-8 grid grid-cols-1 ${dpaFiles.length > 0 ? 'lg:grid-cols-4' : ''} gap-6`}>
            {/* List of Files */}
            <div className="lg:col-span-1 space-y-3">
              <h4 className="font-bold text-slate-700 text-sm uppercase tracking-wider mb-4 border-b border-slate-100 pb-2">
                Daftar Dokumen ({dpaFiles.length})
              </h4>
              <div className="space-y-3 max-h-[700px] overflow-y-auto pr-2 custom-scrollbar">
                {dpaFiles.slice().sort((a, b) => b.uploadedAt - a.uploadedAt).map(file => (
                  <div 
                    key={file.id}
                    onClick={() => setSelectedFileId(file.id)}
                    className={`p-4 rounded-xl border cursor-pointer transition-all flex flex-col gap-3 ${
                      selectedFileId === file.id 
                        ? 'bg-blue-50 border-blue-200 shadow-sm' 
                        : 'bg-white border-slate-200 hover:border-blue-300 hover:shadow-sm'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className={`p-2 rounded-lg ${selectedFileId === file.id ? 'bg-blue-100 text-blue-600' : 'bg-slate-100 text-slate-500'}`}>
                        <FileText size={20} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h5 className={`font-bold text-sm truncate ${selectedFileId === file.id ? 'text-blue-800' : 'text-slate-700'}`}>
                          {file.name}
                        </h5>
                        <p className="text-xs text-slate-500 mt-1">
                          {new Date(file.uploadedAt).toLocaleDateString('id-ID', {
                            day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
                          })}
                        </p>
                      </div>
                    </div>
                    <div className="flex justify-end pt-2 border-t border-slate-100">
                      <button 
                        onClick={(e) => handleDelete(file.id, e)}
                        className="text-slate-400 hover:text-red-500 p-1 rounded hover:bg-red-50 transition-colors"
                        title="Hapus file"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Document Viewer */}
            <div className="lg:col-span-3">
              {selectedFile ? (
                <div className="bg-slate-100 rounded-xl border border-slate-200 h-[700px] overflow-hidden flex flex-col shadow-inner">
                  <div className="bg-white border-b border-slate-200 p-3 flex justify-between items-center">
                    <span className="font-semibold text-slate-700 truncate max-w-md">{selectedFile.name}</span>
                    <a 
                      href={selectedFile.dataUrl} 
                      download={selectedFile.name}
                      className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-medium rounded-lg transition-colors"
                    >
                      Unduh PDF
                    </a>
                  </div>
                  <iframe 
                    src={selectedFile.dataUrl} 
                    className="w-full flex-1"
                    title={`DPA Viewer - ${selectedFile.name}`}
                  />
                </div>
              ) : (
                <div className="bg-slate-50 rounded-xl border border-slate-200 border-dashed h-[700px] flex items-center justify-center text-slate-400">
                  Pilih dokumen dari daftar untuk melihat isinya
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
