import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Send, ArrowLeft, Loader, Brain, Sparkles, MessageSquare, Database, BarChart2 } from 'lucide-react';
import { DatasetService, AIService } from '../services/api';
import ChartDisplay from '../components/ChartDisplay';

const Analysis = () => {
  const { id } = useParams();
  const [dataset, setDataset] = useState(null);
  const [loading, setLoading] = useState(true);
  const [question, setQuestion] = useState('');
  const [chatHistory, setChatHistory] = useState([
    { type: 'ai', content: 'Hello! I am your AI Data Analyst. Ask me any question about your data and I will generate insights for you.' }
  ]);
  const [asking, setAsking] = useState(false);
  const [activeResult, setActiveResult] = useState(null);
  const [chatOpen, setChatOpen] = useState(true);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    const fetchDataset = async () => {
      try {
        const data = await DatasetService.getById(id);
        setDataset(data);
        setActiveResult({
          chartTitle: 'Raw Data View',
          chartType: 'table',
          data: data.data || []
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

      // Safeguard: ensure data array exists
      if (response && response.data && Array.isArray(response.data)) {
        setActiveResult(response);
      } else {
        // If no structured data, just show the summary
        setActiveResult({
          chartType: 'table',
          data: [],
          summary: response?.summary || 'No data results for this query.'
        });
      }

      setChatHistory(prev => [
        ...prev,
        {
          type: 'ai',
          content: response?.summary || 'Analysis complete. See the chart on the left.',
          result: response
        }
      ]);
    } catch (err) {
      const errorMsg = err.response?.data?.error || 'Sorry, something went wrong processing your question. Please try rephrasing.';
      setChatHistory(prev => [
        ...prev,
        { type: 'error', content: errorMsg }
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
    <div className="flex h-full overflow-hidden relative">

      {/* LEFT: Main Visualization Canvas */}
      <div className="flex-1 flex flex-col p-6 overflow-y-auto bg-slate-50">
        {/* Dataset header */}
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link to="/datasets" className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-blue-600 transition-colors">
              <ArrowLeft size={16} /> Back
            </Link>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center">
                <Database size={20} />
              </div>
              <div>
                <h2 className="font-bold text-slate-800">{dataset.name}</h2>
                <p className="text-xs text-slate-500">{dataset.rowCount} rows • {dataset.columnCount} columns</p>
              </div>
            </div>
          </div>

          {/* Toggle Chat button (mobile) */}
          <button
            onClick={() => setChatOpen(!chatOpen)}
            className="lg:hidden p-2 rounded-lg bg-blue-600 text-white shadow-lg"
          >
            <MessageSquare size={20} />
          </button>
        </div>

        {/* Insight Summary Banner */}
        {activeResult?.summary && (
          <div className="mb-4 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl p-5 shadow-xl shadow-blue-600/10 text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 p-6 opacity-10">
              <Sparkles size={80} />
            </div>
            <div className="relative z-10">
              <div className="flex items-center gap-2 mb-1.5 text-blue-100 font-bold uppercase tracking-wider text-[10px]">
                <Brain size={14} /> AI Insight
              </div>
              <p className="text-sm leading-relaxed font-medium">{activeResult.summary}</p>
            </div>
          </div>
        )}

        {/* Chart Area */}
        <div className="flex-1 bg-white rounded-2xl shadow-sm border border-slate-200 p-6 flex flex-col min-h-[400px]">
          <ChartDisplay result={activeResult} />
        </div>
      </div>

      {/* RIGHT: Chat Panel (naukri.com style) */}
      <div className={`${chatOpen ? 'w-[360px]' : 'w-0'} transition-all duration-300 shrink-0 border-l border-slate-200 bg-white flex flex-col overflow-hidden shadow-xl`}>

        {/* Chat Header */}
        <div className="p-4 border-b border-slate-100 bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-white/20 rounded-xl flex items-center justify-center">
              <Sparkles size={18} />
            </div>
            <div>
              <h3 className="font-bold text-sm">AI Data Analyst</h3>
              <p className="text-[10px] text-blue-100">Ask questions in plain English</p>
            </div>
          </div>
        </div>

        {/* Chat Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {chatHistory.map((msg, idx) => (
            <div key={idx} className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[85%] rounded-2xl p-3 text-sm ${
                msg.type === 'user'
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                  : msg.type === 'error'
                    ? 'bg-red-50 text-red-600 border border-red-100'
                    : 'bg-slate-100 text-slate-700'
              }`}>
                {msg.type === 'ai' && (
                  <div className="flex items-center gap-1 mb-1 text-[10px] font-bold text-blue-600 uppercase tracking-wider">
                    <Sparkles size={10} /> AI Analyst
                  </div>
                )}
                <p className="leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                {msg.result && idx > 0 && (
                  <button
                    onClick={() => setActiveResult(msg.result)}
                    className="mt-2 text-xs bg-white text-blue-600 px-3 py-1 rounded-lg border border-slate-200 font-medium flex items-center gap-1 hover:bg-slate-50 transition-colors"
                  >
                    <BarChart2 size={12} /> View Chart
                  </button>
                )}
              </div>
            </div>
          ))}

          {asking && (
            <div className="flex justify-start">
              <div className="bg-slate-100 text-slate-700 rounded-2xl p-3 flex items-center gap-2">
                <div className="flex gap-1">
                  <div className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce" style={{animationDelay: '0ms'}}></div>
                  <div className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce" style={{animationDelay: '150ms'}}></div>
                  <div className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce" style={{animationDelay: '300ms'}}></div>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Suggestions */}
        {chatHistory.length <= 1 && dataset?.headers && (
          <div className="px-4 pb-2 flex flex-wrap gap-1.5">
            {dataset.headers.length >= 2 && (
              <button onClick={() => handleSuggestionClick(`Average ${dataset.headers[1]} by ${dataset.headers[0]}`)} className="text-[11px] bg-slate-100 hover:bg-slate-200 text-slate-600 px-2.5 py-1.5 rounded-full transition-colors font-medium border border-slate-200">
                Average {dataset.headers[1]}
              </button>
            )}
            <button onClick={() => handleSuggestionClick(`Count by ${dataset.headers[0]}`)} className="text-[11px] bg-slate-100 hover:bg-slate-200 text-slate-600 px-2.5 py-1.5 rounded-full transition-colors font-medium border border-slate-200">
              Count by {dataset.headers[0]}
            </button>
          </div>
        )}

        {/* Input */}
        <div className="p-3 border-t border-slate-100 bg-white">
          <form onSubmit={handleAsk} className="relative flex items-center">
            <input
              type="text"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="Ask a question..."
              className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 pl-4 pr-11 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all text-sm font-medium text-slate-800 placeholder-slate-400"
              disabled={asking}
            />
            <button
              type="submit"
              disabled={!question.trim() || asking}
              className={`absolute right-2 p-1.5 rounded-lg transition-colors ${question.trim() && !asking ? 'bg-blue-600 text-white shadow-md shadow-blue-500/30 hover:bg-blue-700' : 'text-slate-400 bg-transparent'}`}
            >
              <Send size={14} />
            </button>
          </form>
          <div className="flex items-center gap-1 mt-1.5 justify-center text-[9px] text-slate-400 uppercase tracking-widest font-bold">
            <Brain size={10} /> Powered by AI
          </div>
        </div>
      </div>

      {/* Floating chat toggle when closed */}
      {!chatOpen && (
        <button
          onClick={() => setChatOpen(true)}
          className="fixed bottom-6 right-6 w-14 h-14 bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-2xl shadow-blue-600/40 flex items-center justify-center transition-all hover:scale-110 z-50"
        >
          <MessageSquare size={24} />
        </button>
      )}
    </div>
  );
};

export default Analysis;
