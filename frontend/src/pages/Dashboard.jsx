import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Database, FileText, BarChart2, TrendingUp, Calendar, ArrowRight, Loader, UploadCloud } from 'lucide-react';
import { DatasetService } from '../services/api';

const Dashboard = () => {
  const [datasets, setDatasets] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDatasets = async () => {
      try {
        const data = await DatasetService.getAll();
        setDatasets(data.slice(0, 5)); // Last 5 datasets
      } catch (error) {
        console.error('Failed to fetch datasets:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchDatasets();
  }, []);

  const totalRows = datasets.reduce((acc, curr) => acc + curr.rowCount, 0);

  return (
    <div className="p-8 w-full max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Welcome to AI Analyst</h1>
        <p className="text-slate-500">Your intelligent data companion. Upload CSVs and ask questions in plain English.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-4 transition-transform hover:-translate-y-1">
          <div className="w-14 h-14 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center">
            <Database size={28} />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500">Total Datasets</p>
            <h3 className="text-3xl font-bold">{datasets.length}</h3>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-4 transition-transform hover:-translate-y-1">
          <div className="w-14 h-14 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center">
            <FileText size={28} />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500">Rows Processed</p>
            <h3 className="text-3xl font-bold">{totalRows.toLocaleString()}</h3>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-4 transition-transform hover:-translate-y-1">
          <div className="w-14 h-14 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center">
            <BarChart2 size={28} />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500">Insights Generated</p>
            <h3 className="text-3xl font-bold">12</h3>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <TrendingUp size={20} className="text-blue-500" /> 
            Recent Datasets
          </h2>
          <Link to="/upload" className="text-sm font-medium text-blue-600 hover:text-blue-700 flex items-center gap-1">
            Upload New <ArrowRight size={16} />
          </Link>
        </div>
        
        <div className="p-0">
          {loading ? (
            <div className="flex justify-center flex-col items-center p-12 text-blue-600">
              <Loader className="animate-spin mb-4" size={32} />
              <p className="text-slate-500 animate-pulse">Loading workspace...</p>
            </div>
          ) : datasets.length === 0 ? (
            <div className="text-center p-12">
              <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-400">
                <Database size={32} />
              </div>
              <h3 className="text-lg font-medium text-slate-800 mb-1">No datasets found</h3>
              <p className="text-slate-500 mb-6">Start by uploading your first CSV file to unleash the AI.</p>
              <Link to="/upload" className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-medium transition-colors shadow-lg shadow-blue-500/30">
                <UploadCloud size={20} /> Upload CSV File
              </Link>
            </div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/50 text-sm font-semibold text-slate-500">
                  <th className="p-4 pl-6">Name</th>
                  <th className="p-4 hidden md:table-cell">Filename</th>
                  <th className="p-4">Size</th>
                  <th className="p-4 hidden sm:table-cell">Uploaded Date</th>
                  <th className="p-4 pr-6 text-right">Action</th>
                </tr>
              </thead>
              <tbody>
                {datasets.map((dataset) => (
                  <tr key={dataset.id} className="border-b border-slate-50 hover:bg-blue-50/50 transition-colors group">
                    <td className="p-4 pl-6 font-medium text-slate-900">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-colors">
                          <FileText size={16} />
                        </div>
                        {dataset.name}
                      </div>
                    </td>
                    <td className="p-4 text-slate-500 text-sm hidden md:table-cell">{dataset.fileName}</td>
                    <td className="p-4 text-slate-500 text-sm">
                      <span className="bg-slate-100 text-slate-600 py-1 px-2 rounded-md font-medium">
                        {dataset.rowCount} rows
                      </span>
                    </td>
                    <td className="p-4 text-slate-500 text-sm hidden sm:table-cell flex items-center gap-2">
                       {new Date(dataset.uploadedAt).toLocaleDateString()}
                    </td>
                    <td className="p-4 pr-6 text-right">
                      <Link 
                        to={`/analysis/${dataset.id}`}
                        className="inline-flex items-center gap-1 text-sm font-medium bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white px-4 py-2 rounded-lg transition-colors"
                      >
                        Analyze <ArrowRight size={14} />
                      </Link>
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

export default Dashboard;
