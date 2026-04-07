import React from 'react';
import { ResponsiveContainer, BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import { BarChart2 } from 'lucide-react';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#14b8a6', '#f97316'];

const ChartDisplay = ({ result }) => {
  if (!result || !result.data || result.data.length === 0) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-slate-400">
        <BarChart2 size={48} className="mb-4 opacity-50" />
        <p className="font-medium text-lg">No chart data to display</p>
        <p className="text-sm mt-1 text-center max-w-sm">Ask a question grouping data to see visualizations</p>
      </div>
    );
  }

  const { chartType, data, xAxis, yAxis, chartTitle } = result;

  // Simple table fallback
  if (chartType === 'table' || !xAxis || !yAxis) {
    return (
      <div className="w-full h-full flex flex-col">
        {chartTitle && <h3 className="text-lg font-bold text-slate-800 mb-4">{chartTitle}</h3>}
        <div className="flex-1 overflow-auto rounded-xl border border-slate-200">
          <table className="w-full text-left text-sm border-collapse">
            <thead className="bg-slate-50 sticky top-0">
              <tr>
                {Object.keys(data[0] || {}).map(key => (
                  <th key={key} className="p-3 border-b font-semibold text-slate-600 whitespace-nowrap">{key}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {data.slice(0, 100).map((row, i) => (
                <tr key={i} className="hover:bg-slate-50">
                  {Object.values(row).map((val, j) => (
                    <td key={j} className="p-3 text-slate-600 max-w-[200px] truncate" title={val?.toString()}>{val?.toString()}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
          {data.length > 100 && (
            <div className="p-3 text-center text-xs text-slate-500 bg-slate-50 border-t border-slate-100">
              Showing first 100 rows.
            </div>
          )}
        </div>
      </div>
    );
  }

  // Format data for Recharts
  const chartData = data.map(item => ({
    name: item[xAxis],
    value: item[yAxis]
  }));

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border border-slate-200 rounded-lg shadow-xl shadow-slate-200/50">
          <p className="font-bold text-slate-800 mb-1">{label}</p>
          <p className="font-medium text-blue-600">
            {yAxis}: {payload[0].value.toLocaleString()}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="w-full h-full flex flex-col pt-2">
      {chartTitle && <h3 className="text-lg font-bold text-slate-800 mb-6 text-center">{chartTitle}</h3>}
      
      <div className="flex-1 min-h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          {chartType === 'line' ? (
            <LineChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
              <XAxis dataKey="name" angle={-45} textAnchor="end" height={60} tick={{fill: '#64748b', fontSize: 12}} dy={10} stroke="#cbd5e1" />
              <YAxis tick={{fill: '#64748b', fontSize: 12}} stroke="#cbd5e1" />
              <Tooltip content={<CustomTooltip />} />
              <Line type="monotone" dataKey="value" stroke="#3b82f6" strokeWidth={3} dot={{r: 4, strokeWidth: 2}} activeDot={{r: 6}} />
            </LineChart>
          ) : chartType === 'pie' ? (
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                labelLine={false}
                outerRadius={120}
                innerRadius={60}
                fill="#8884d8"
                dataKey="value"
                paddingAngle={2}
                label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => value.toLocaleString()} />
              <Legend verticalAlign="bottom" height={36}/>
            </PieChart>
          ) : (
            // Default to Bar chart
            <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
              <XAxis dataKey="name" angle={-45} textAnchor="end" height={60} tick={{fill: '#64748b', fontSize: 12}} dy={10} stroke="#cbd5e1" />
              <YAxis tick={{fill: '#64748b', fontSize: 12}} stroke="#cbd5e1" />
              <Tooltip content={<CustomTooltip />} cursor={{fill: '#f1f5f9'}} />
              <Bar dataKey="value" fill="#3b82f6" radius={[4, 4, 0, 0]}>
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          )}
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default ChartDisplay;
