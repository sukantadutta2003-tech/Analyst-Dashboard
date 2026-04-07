import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Database, FileText, Calendar, Trash2, ArrowRight, Loader } from 'lucide-react';
import { DatasetService } from '../services/api';

const Datasets = () => {
  const [datasets, setDatasets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState(null);

  useEffect(() => {
    fetchDatasets();
  }, []);

  const fetchDatasets = async () => {
    try {
      const data = await DatasetService.getAll();
      setDatasets(data);
    } catch (error) {
      console.error('Failed to fetch datasets:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this dataset?')) return;
    
    setDeletingId(id);
    try {
      await DatasetService.delete(id);
      setDatasets(datasets.filter(d => d.id !== id));
    } catch (error) {
      console.error('Failed to delete dataset:', error);
      alert('Failed to delete dataset');
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="p-8 w-full max-w-7xl mx-auto flex flex-col h-[calc(100vh-4rem)]">
      <div className="flex justify-between items-end mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">My Datasets</h1>
          <p className="text-slate-500">Manage your uploaded CSV files and jump into analysis.</p>
        </div>
        <Link 
          to="/upload" 
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-medium transition-colors shadow-lg shadow-blue-500/30 flex items-center gap-2"
        >
          <Database size={20} /> Upload New
        </Link>
      </div>

      <div className="flex-1 overflow-auto bg-white rounded-2xl shadow-sm border border-slate-100">
        <div className="p-0">
          {loading ? (
            <div className="flex justify-center flex-col items-center p-12 text-blue-600">
              <Loader className="animate-spin mb-4" size={32} />
              <p className="text-slate-500 font-medium animate-pulse">Loading datasets...</p>
            </div>
          ) : datasets.length === 0 ? (
            <div className="text-center p-16">
              <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6 text-slate-300">
                <Database size={40} />
              </div>
              <h3 className="text-xl font-bold text-slate-800 mb-2">Your workspace is empty</h3>
              <p className="text-slate-500 mb-8 max-w-md mx-auto">Upload a CSV file to start querying, creating visualizations, and gaining insights with AI.</p>
              <Link to="/upload" className="inline-flex items-center gap-2 bg-slate-800 hover:bg-slate-900 text-white px-6 py-3 rounded-xl font-medium transition-colors">
                Browse Files
              </Link>
            </div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/50 border-b border-slate-100 text-sm font-semibold text-slate-500 sticky top-0">
                  <th className="p-4 pl-6">Dataset Name</th>
                  <th className="p-4">Columns</th>
                  <th className="p-4">Rows</th>
                  <th className="p-4">Uploaded</th>
                  <th className="p-4 pr-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {datasets.map((dataset) => (
                  <tr key={dataset.id} className="border-b border-slate-50 hover:bg-slate-50 transition-colors group">
                    <td className="p-4 pl-6">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-colors shadow-inner">
                          <FileText size={20} />
                        </div>
                        <div>
                          <p className="font-bold text-slate-800">{dataset.name}</p>
                          <p className="text-xs text-slate-500 font-medium">{dataset.fileName}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex gap-1 max-w-[200px] flex-wrap">
                        <span className="text-xs font-semibold bg-slate-100 text-slate-600 px-2 py-1 rounded-md">{dataset.columnCount} columns</span>
                      </div>
                    </td>
                    <td className="p-4">
                      <span className="text-sm font-bold text-slate-700 bg-emerald-50 px-3 py-1 rounded-full text-emerald-700 border border-emerald-100">
                        {dataset.rowCount.toLocaleString()}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2 text-sm text-slate-500 font-medium">
                        <Calendar size={14} className="text-slate-400" />
                        {new Date(dataset.uploadedAt).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="p-4 pr-6">
                      <div className="flex items-center justify-end gap-2">
                        <button 
                          onClick={() => handleDelete(dataset.id)}
                          disabled={deletingId === dataset.id}
                          className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors flex items-center justify-center"
                          title="Delete dataset"
                        >
                          {deletingId === dataset.id ? <Loader size={18} className="animate-spin" /> : <Trash2 size={18} />}
                        </button>
                        <Link 
                          to={`/analysis/${dataset.id}`}
                          className="flex items-center gap-2 bg-slate-800 hover:bg-slate-900 text-white px-4 py-2 rounded-lg text-sm font-medium transition-transform hover:-translate-y-0.5"
                        >
                          Analyze <ArrowRight size={16} />
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};

export default Datasets;
