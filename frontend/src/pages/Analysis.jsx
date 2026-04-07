import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Send, ArrowLeft, Loader, Brain, Sparkles, MessageSquare, Database } from 'lucide-react';
import { DatasetService, AIService } from '../services/api';
import ChartDisplay from '../components/ChartDisplay';

const Analysis = () => {
  const { id } = useParams();
  const [dataset, setDataset] = useState(null);
  const [loading, setLoading] = useState(true);
  const [question, setQuestion] = useState('');
  const [chatHistory, setChatHistory] = useState([
    { type: 'ai', content: 'Hello! I am your AI Data Analyst. Ask me any question about your data.' }
  ]);
  const [asking, setAsking] = useState(false);
  const [activeResult, setActiveResult] = useState(null);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    const fetchDataset = async () => {
      try {
        const data = await DatasetService.getById(id);
        setDataset(data);
        // Show initial table view of raw data
        setActiveResult({
          chartTitle: 'Raw Data View',
          chartType: 'table',
          data: data.data
        });
      } catch (err) {
        console.error('Failed to load dataset:', err);
      } finally {
        setLoading(false);
      }
    };
    
    if (id) fetchDataset();
  }, [id]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatHistory]);

  const handleAsk = async (e) => {
    e.preventDefault();
    if (!question.trim() || asking) return;

    const currentQuestion = question;
    setQuestion('');
    setChatHistory(prev => [...prev, { type: 'user', content: currentQuestion }]);
    setAsking(true);

    try {
      const response = await AIService.query(id, currentQuestion);
      
      setActiveResult(response);
      
      setChatHistory(prev => [
        ...prev, 
        { 
          type: 'ai', 
          content: response.summary || 'Here is the analysis based on your question.',
          result: response
        }
      ]);
    } catch (err) {
      setChatHistory(prev => [
        ...prev, 
        { type: 'error', content: err.response?.data?.error || 'Sorry, I encountered an error processing that question.' }
      ]);
    } finally {
      setAsking(false);
    }
  };

  const handleSuggestionClick = (suggestion) => {
    setQuestion(suggestion);
  };

  if (loading) {
    return (
      <div className="h-full flex flex-col items-center justify-center p-8">
        <Loader className="animate-spin text-blue-600 mb-4" size={40} />
        <h2 className="text-xl font-bold text-slate-800">Loading Dataset...</h2>
      </div>
    );
  }

  if (!dataset) {
    return (
      <div className="h-full flex flex-col items-center justify-center p-8">
        <h2 className="text-2xl font-bold text-slate-800 mb-2">Dataset Not Found</h2>
        <Link to="/datasets" className="text-blue-600 hover:underline">Return to Datasets</Link>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      
      {/* Left Panel: Chat Interface */}
      <div className="w-[400px] flex flex-col border-r border-slate-200 bg-white shadow-xl z-10 shrink-0">
        
        {/* Header */}
        <div className="p-4 border-b border-slate-100 bg-white">
          <Link to="/datasets" className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-blue-600 mb-3 transition-colors">
            <ArrowLeft size={16} /> Back to Datasets
          </Link>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center">
              <Database size={20} />
            </div>
            <div>
              <h2 className="font-bold text-slate-800 truncate" title={dataset.name}>{dataset.name}</h2>
              <p className="text-xs text-slate-500 font-medium">{dataset.rowCount} rows • {dataset.columnCount} columns</p>
            </div>
          </div>
        </div>

        {/* Chat History */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {chatHistory.map((msg, idx) => (
            <div key={idx} className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}>
              
              <div className={`max-w-[85%] rounded-2xl p-4 ${
                msg.type === 'user' 
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20' 
                  : msg.type === 'error'
                    ? 'bg-red-50 text-red-600 border border-red-100'
                    : 'bg-slate-100 text-slate-800'
              }`}>
                
                {msg.type !== 'user' && msg.type !== 'error' && (
                  <div className="flex items-center gap-1.5 mb-1.5 text-xs font-bold text-blue-600 uppercase tracking-wider">
                    <Sparkles size={12} /> AI Analyst
                  </div>
                )}
                
                <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                
                {msg.result && idx > 0 && (
                  <button 
                    onClick={() => setActiveResult(msg.result)}
                    className="mt-3 text-xs bg-white text-blue-600 px-3 py-1.5 rounded-lg border border-slate-200 font-medium flex items-center gap-1 hover:bg-slate-50 transition-colors"
                  >
                    <BarChart2 size={12} /> View Chart
                  </button>
                )}
              </div>
            </div>
          ))}
          
          {asking && (
            <div className="flex justify-start">
              <div className="bg-slate-100 text-slate-800 rounded-2xl p-4 flex items-center gap-2">
                <div className="flex gap-1">
                  <div className="w-2 h-2 rounded-full bg-slate-400 animate-bounce" style={{animationDelay: '0ms'}}></div>
                  <div className="w-2 h-2 rounded-full bg-slate-400 animate-bounce" style={{animationDelay: '150ms'}}></div>
                  <div className="w-2 h-2 rounded-full bg-slate-400 animate-bounce" style={{animationDelay: '300ms'}}></div>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="p-4 border-t border-slate-100 bg-white">
          {chatHistory.length === 1 && (
            <div className="mb-3 flex flex-wrap gap-2">
              <button onClick={() => handleSuggestionClick(`Show me the total count Grouped By ${dataset.headers[0]}`)} className="text-xs bg-slate-100 hover:bg-slate-200 text-slate-700 px-3 py-1.5 rounded-full transition-colors font-medium border border-slate-200">
                Count by {dataset.headers[0]}
              </button>
              {dataset.headers.length > 1 && (
                <button onClick={() => handleSuggestionClick(`Average ${dataset.headers[1]}`)} className="text-xs bg-slate-100 hover:bg-slate-200 text-slate-700 px-3 py-1.5 rounded-full transition-colors font-medium border border-slate-200">
                  Average {dataset.headers[1]}
                </button>
              )}
            </div>
          )}
          
          <form onSubmit={handleAsk} className="relative flex items-center">
            <input
              type="text"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="Ask a question..."
              className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 pl-4 pr-12 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all font-medium text-slate-800 placeholder-slate-400"
              disabled={asking}
            />
            <button 
              type="submit" 
              disabled={!question.trim() || asking}
              className={`absolute right-2 p-2 rounded-lg transition-colors ${question.trim() && !asking ? 'bg-blue-600 text-white shadow-md shadow-blue-500/30 hover:bg-blue-700' : 'text-slate-400 bg-transparent'}`}
            >
              <Send size={16} />
            </button>
          </form>
          <div className="flex items-center gap-1.5 mt-2 justify-center text-[10px] text-slate-400 uppercase tracking-widest font-bold">
            <Brain size={12} /> Powered by OpenAI
          </div>
        </div>
      </div>

      {/* Right Panel: Visualization & Data */}
      <div className="flex-1 bg-slate-50 flex flex-col p-8 overflow-y-auto w-[calc(100%-400px)]">
        
        {/* Insight Summary Banner */}
        {activeResult?.summary && (
          <div className="mb-6 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl p-6 shadow-xl shadow-blue-600/10 text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 p-8 opacity-10">
              <Sparkles size={120} />
            </div>
            <div className="relative z-10">
              <div className="flex items-center gap-2 mb-2 text-blue-100 font-bold uppercase tracking-wider text-xs">
                <Brain size={16} /> AI Summary Insight
              </div>
              <p className="text-lg leading-relaxed font-medium">{activeResult.summary}</p>
            </div>
          </div>
        )}

        {/* Chart Area */}
        <div className="flex-1 bg-white rounded-2xl shadow-sm border border-slate-200 p-6 flex flex-col min-h-[500px]">
          <ChartDisplay result={activeResult} />
        </div>
      </div>

    </div>
  );
};

export default Analysis;
