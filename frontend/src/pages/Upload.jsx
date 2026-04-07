import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { UploadCloud, FileText, CheckCircle, AlertCircle, X } from 'lucide-react';
import { DatasetService } from '../services/api';

const Upload = () => {
  const [file, setFile] = useState(null);
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef(null);
  const navigate = useNavigate();

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const droppedFile = e.dataTransfer.files[0];
      if (droppedFile.name.endsWith('.csv')) {
        setFile(droppedFile);
        if (!name) setName(droppedFile.name.replace('.csv', ''));
        setError(null);
      } else {
        setError('Please upload a valid CSV file.');
      }
    }
  };

  const handleChange = (e) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      if (selectedFile.name.endsWith('.csv')) {
        setFile(selectedFile);
        if (!name) setName(selectedFile.name.replace('.csv', ''));
        setError(null);
      } else {
        setError('Please upload a valid CSV file.');
      }
    }
  };

  const clearFile = () => {
    setFile(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file) {
      setError('Please select a file first.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const result = await DatasetService.uploadCsv(file, name);
      // Navigate to analysis page automatically
      navigate(`/analysis/${result.id}`);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to upload dataset. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div className="p-8 w-full max-w-4xl mx-auto flex flex-col h-[calc(100vh-4rem)]">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Upload Dataset</h1>
        <p className="text-slate-500">Upload your CSV file to begin analysis and visualization.</p>
      </div>

      <div className="flex-1 flex flex-col bg-white rounded-2xl shadow-sm border border-slate-100 p-8">
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-100 text-red-600 rounded-xl flex items-center gap-3">
            <AlertCircle size={20} />
            <p className="font-medium">{error}</p>
          </div>
        )}

        <form onSubmit={handleUpload} className="flex-1 flex flex-col max-w-2xl mx-auto w-full">
          
          <div className="mb-6">
            <label className="block text-sm font-semibold text-slate-700 mb-2">Dataset Name (Optional)</label>
            <input 
              type="text" 
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Q3 Sales Data"
              className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-slate-700 font-medium"
            />
          </div>

          {!file ? (
            <div 
              className={`flex-1 min-h-[300px] border-2 border-dashed rounded-2xl flex flex-col justify-center items-center p-8 transition-colors ${dragActive ? 'border-blue-500 bg-blue-50/50' : 'border-slate-200 hover:border-blue-400 hover:bg-slate-50'}`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv"
                className="hidden"
                onChange={handleChange}
              />
              <div className="w-20 h-20 bg-blue-50 text-blue-500 rounded-full flex justify-center items-center mb-6 shadow-inner">
                <UploadCloud size={40} />
              </div>
              <h3 className="text-xl font-bold text-slate-800 mb-2">Drag & Drop your CSV file here</h3>
              <p className="text-slate-500 mb-6 font-medium">or click to browse from your computer</p>
              
              <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider bg-slate-100 px-4 py-2 rounded-full">
                Maximum file size: 50MB
              </div>
            </div>
          ) : (
            <div className="flex-1 flex flex-col justify-center border-2 border-slate-100 bg-slate-50 rounded-2xl p-8 items-center text-center">
              <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex justify-center items-center mb-6 shadow-inner">
                <CheckCircle size={40} />
              </div>
              <h3 className="text-xl font-bold text-slate-800 mb-2">{file.name}</h3>
              <p className="text-slate-500 font-medium mb-6">{(file.size / 1024 / 1024).toFixed(2)} MB • Ready to upload</p>
              
              <button 
                type="button" 
                onClick={clearFile}
                className="flex items-center gap-2 text-red-500 bg-red-50 hover:bg-red-100 px-4 py-2 rounded-lg font-medium transition-colors"
                disabled={loading}
              >
                <X size={16} /> Remove File
              </button>
            </div>
          )}

          <div className="mt-8 pt-6 border-t border-slate-100 flex justify-end">
            <button 
              type="submit" 
              disabled={!file || loading}
              className={`flex justify-center items-center gap-2 py-4 px-8 rounded-xl font-bold text-lg transition-all shadow-lg shadow-blue-500/20 w-full sm:w-auto ${!file || loading ? 'bg-slate-200 text-slate-400 cursor-not-allowed shadow-none' : 'bg-blue-600 hover:bg-blue-700 text-white hover:shadow-blue-500/40 hover:-translate-y-0.5'}`}
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  Uploading & Parsing...
                </>
              ) : (
                <>
                  <UploadCloud size={20} />
                  Start Analysis
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Upload;
