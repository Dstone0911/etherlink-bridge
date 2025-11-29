import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { MOCK_GAS_HISTORY } from '../constants';

const GasTracker: React.FC = () => {
  return (
    <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6 backdrop-blur-sm">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-slate-200 flex items-center gap-2">
          <span className="text-green-400">●</span> Network Congestion
        </h3>
        <span className="text-sm text-slate-400">Live Updates</span>
      </div>
      
      <div className="h-48 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={MOCK_GAS_HISTORY}>
            <defs>
              <linearGradient id="colorGas" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
            <XAxis dataKey="time" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
            <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} unit=" gwei" />
            <Tooltip 
              contentStyle={{ backgroundColor: '#1e293b', borderColor: '#475569', borderRadius: '8px', color: '#f8fafc' }}
              itemStyle={{ color: '#818cf8' }}
            />
            <Area type="monotone" dataKey="price" stroke="#6366f1" fillOpacity={1} fill="url(#colorGas)" strokeWidth={2} />
          </AreaChart>
        </ResponsiveContainer>
      </div>
      <div className="flex justify-between mt-4 text-sm">
        <div className="flex flex-col">
          <span className="text-slate-500">Low</span>
          <span className="text-green-400 font-medium">12 gwei</span>
        </div>
        <div className="flex flex-col text-center">
          <span className="text-slate-500">Average</span>
          <span className="text-blue-400 font-medium">21 gwei</span>
        </div>
        <div className="flex flex-col text-right">
          <span className="text-slate-500">High</span>
          <span className="text-red-400 font-medium">35 gwei</span>
        </div>
      </div>
    </div>
  );
};

export default GasTracker;