import React, { useState, useCallback } from 'react';
import { useAppContext } from '../store/AppContext';
import { UploadCloud, FileText, Trash2, CheckCircle2, Loader2, X, Eye } from 'lucide-react';
import { uploadFileToGAS } from '../utils/gasSync';
import type { DpaFile } from '../store/AppContext';

export const DPAView = () => {
  const { dpaFiles, addDpaFiles, deleteDpaFile, selectedYear, gasUrl } = useAppContext();
  const [isDragging, setIsDragging] = useState(false);
  const [uploadingFiles, setUploadingFiles] = useState<{ name: string; progress: number; error?: string }[]>([]);
  const [previewFile, setPreviewFile] = useState<DpaFile | null>(null);

  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const onDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const onDrop = useCallback(async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFiles(Array.from(e.dataTransfer.files));
    }
  }, []);

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFiles(Array.from(e.target.files));
    }
  };

  const handleFiles = async (files: File[]) => {
    const pdfFiles = files.filter(f => f.type === 'application/pdf');
    if (pdfFiles.length !== files.length) {
      alert('Beberapa file diabaikan karena bukan file PDF.');
    }
    
    if (pdfFiles.length === 0) return;

    const uploadedDpas: DpaFile[] = [];

    for (const file of pdfFiles) {
      const fileId = `${Date.now()}_${file.name.replace(/[^a-zA-Z0-9.]/g, '')}`;
      
      setUploadingFiles(prev => [...prev, { name: file.name, progress: 50 }]); // Show intermediate progress

      try {
        const downloadURL = await uploadFileToGAS(gasUrl, file);
        
        setUploadingFiles(prev => 
          prev.map(f => f.name === file.name ? { ...f, progress: 100 } : f)
        );

        uploadedDpas.push({
          id: fileId,
          name: file.name,
          url: downloadURL,
          size: file.size,
          uploadedAt: new Date().toISOString(),
          tahun: selectedYear
        });
        
        setTimeout(() => {
          setUploadingFiles(prev => prev.filter(f => f.name !== file.name));
        }, 1000);
        
      } catch (error: any) {
        console.error('Upload error:', error);
        setUploadingFiles(prev => 
          prev.map(f => f.name === file.name ? { ...f, error: error.message || 'Gagal mengunggah' } : f)
        );
      }
    }

    if (uploadedDpas.length > 0) {
      addDpaFiles(uploadedDpas);
    }
  };

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    else if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
    else return (bytes / 1048576).toFixed(1) + ' MB';
  };

  const getPreviewUrl = (url: string) => {
    if (url.includes('/view')) {
      return url.replace('/view', '/preview');
    }
    if (url.includes('open?id=')) {
      const id = url.split('id=')[1].split('&')[0];
      return `https://drive.google.com/file/d/${id}/preview`;
    }
    return url;
  };

  return (
    <div className="space-y-8">
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 lg:p-8">
        <div className="flex justify-between items-center mb-6">
          <h3 className="font-bold text-slate-800 text-lg flex items-center gap-2">
            <FileText className="text-blue-500" size={24} />
            Dokumen Pelaksanaan Anggaran (DPA) {selectedYear}
          </h3>
        </div>

        {/* Drag & Drop Area */}
        <div 
          className={`border-2 border-dashed rounded-2xl p-10 flex flex-col items-center justify-center transition-colors cursor-pointer relative ${
            isDragging ? 'border-blue-500 bg-blue-50' : 'border-slate-300 hover:border-blue-400 hover:bg-slate-50'
          }`}
          onDragOver={onDragOver}
          onDragLeave={onDragLeave}
          onDrop={onDrop}
        >
          <input 
            type="file" 
            multiple 
            accept=".pdf,application/pdf" 
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            onChange={handleFileInput}
            title="Pilih file PDF DPA"
          />
          <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mb-4">
            <UploadCloud size={32} />
          </div>
          <h4 className="text-slate-800 font-bold mb-2">Tarik & Lepas File DPA di sini</h4>
          <p className="text-slate-500 text-sm mb-4">Atau klik untuk memilih file (Bisa lebih dari 1 file)</p>
          <div className="px-4 py-1 bg-slate-100 rounded-full text-xs font-semibold text-slate-600">
            Hanya File PDF
          </div>
        </div>

        {/* Uploading List */}
        {uploadingFiles.length > 0 && (
          <div className="mt-8 space-y-3">
            <h4 className="font-semibold text-slate-700 text-sm">Sedang Mengunggah...</h4>
            {uploadingFiles.map((uf, idx) => (
              <div key={idx} className="flex items-center gap-4 bg-slate-50 p-4 rounded-xl border border-slate-100">
                <FileText className="text-blue-400" size={20} />
                <div className="flex-1">
                  <div className="flex justify-between text-sm mb-1">
                    <span className="font-medium text-slate-700 truncate">{uf.name}</span>
                    <span className="text-slate-500">{uf.error ? 'Gagal' : `${Math.round(uf.progress)}%`}</span>
                  </div>
                  <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
                    <div 
                      className={`h-full rounded-full transition-all duration-300 ${uf.error ? 'bg-red-500' : 'bg-blue-500'}`}
                      style={{ width: `${uf.progress}%` }}
                    />
                  </div>
                  {uf.error && <p className="text-red-500 text-xs mt-1">{uf.error}</p>}
                </div>
                {!uf.error && <Loader2 className="animate-spin text-blue-500" size={18} />}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Uploaded Files List */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 flex flex-col overflow-hidden">
        <div className="p-5 border-b border-slate-100">
          <h3 className="font-bold text-slate-800">Daftar File DPA {selectedYear}</h3>
        </div>
        <div className="p-5">
          {dpaFiles.length === 0 ? (
            <div className="text-center py-12 text-slate-400">
              Belum ada dokumen DPA yang diunggah.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {dpaFiles.map((file) => (
                <div key={file.id} className="group relative bg-white border border-slate-200 rounded-xl p-4 hover:border-blue-300 hover:shadow-md transition-all flex flex-col">
                  <div className="flex items-start justify-between mb-3">
                    <div className="w-10 h-10 bg-red-50 text-red-500 rounded-lg flex items-center justify-center shrink-0">
                      <FileText size={20} />
                    </div>
                  </div>
                  <h4 className="font-bold text-slate-800 text-sm mb-1 truncate relative z-10 pointer-events-none" title={file.name}>
                    {file.name}
                  </h4>
                  <div className="flex justify-between items-center text-xs text-slate-500 mt-auto pt-4 border-t border-slate-50 relative z-10 pointer-events-none">
                    <span>{formatSize(file.size)}</span>
                    <span>{new Date(file.uploadedAt).toLocaleDateString('id-ID')}</span>
                  </div>
                  <button 
                    onClick={(e) => { e.preventDefault(); setPreviewFile(file); }}
                    className="absolute inset-0 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-left w-full h-full"
                    aria-label={`Lihat file ${file.name}`}
                  >
                    <span className="sr-only">Lihat</span>
                  </button>
                  <div className="absolute top-3 right-3 z-10">
                     <button 
                      onClick={(e) => { e.preventDefault(); e.stopPropagation(); deleteDpaFile(file.id); }}
                      className="p-1.5 text-slate-400 opacity-0 group-hover:opacity-100 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                      title="Hapus"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* PDF Preview Modal */}
      {previewFile && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-5xl h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between p-4 border-b border-slate-100 bg-white z-10">
              <h3 className="font-bold text-slate-800 flex items-center gap-2 truncate pr-4">
                <FileText className="text-blue-500 shrink-0" size={20} />
                <span className="truncate">{previewFile.name}</span>
              </h3>
              <div className="flex items-center gap-2 shrink-0">
                <a 
                  href={previewFile.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors text-sm font-semibold flex items-center gap-2"
                >
                  <Eye size={16} /> Buka Tab Baru
                </a>
                <button 
                  onClick={() => setPreviewFile(null)}
                  className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                >
                  <X size={20} />
                </button>
              </div>
            </div>
            <div className="flex-1 bg-slate-100 p-2 relative">
              <div className="absolute inset-0 flex items-center justify-center">
                 <Loader2 className="animate-spin text-slate-400" size={32} />
              </div>
              <iframe
                src={getPreviewUrl(previewFile.url)}
                className="w-full h-full rounded-xl border border-slate-200 relative z-10 bg-white"
                title={previewFile.name}
                allow="autoplay"
              ></iframe>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
