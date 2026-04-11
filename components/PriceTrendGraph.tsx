import React, { useState } from 'react';
import { ComposedChart, Area, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, ReferenceLine } from 'recharts';

interface SalesHistory {
  date_ordered: string;
  unit_price: number;
  quantity: number;
  date?: string; // Added date property
}

interface Props {
  data: SalesHistory[];
}

const PriceTrendGraph: React.FC<Props> = ({ data }) => {
  const [selectedTransaction, setSelectedTransaction] = useState<SalesHistory | null>(null);

  const formattedData = data.map(item => ({
    ...item,
    date: new Date(item.date_ordered).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
    price: item.unit_price,
    quantity: item.quantity
  }));

  const prices = formattedData.map(d => d.price);
  const minPrice = Math.min(...prices);
  const maxPrice = Math.max(...prices);

  const handlePointClick = (state: any) => {
    if (state && state.activePayload && state.activePayload.length > 0) {
      setSelectedTransaction(state.activePayload[0].payload);
    }
  };

  return (
    <div className="bg-white rounded-[2rem] p-6 shadow-xl shadow-slate-900/5 border border-slate-100 mb-6">
      <h2 className="text-[11px] font-black text-slate-900 uppercase tracking-[0.1em] italic mb-6">Price & Volume Trend</h2>
      <ResponsiveContainer width="100%" height={200}>
        <ComposedChart data={formattedData} onClick={handlePointClick}>
          <defs>
            <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
              <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
          <XAxis dataKey="date" hide padding={{ right: 30 }} />
          <YAxis yAxisId="left" domain={['auto', 'auto']} tick={{fontSize: 8}} tickFormatter={(val) => `$${val}`} width={30} label={{ value: 'Price', position: 'insideBottomLeft', angle: 0, fontSize: 8, offset: 0 }} />
          <YAxis yAxisId="right" orientation="right" domain={[0, (dataMax: number) => dataMax * 8]} tick={{fontSize: 8}} width={20} label={{ value: 'Qty', position: 'insideBottomRight', angle: 0, fontSize: 8, offset: 0 }} />
          <Tooltip 
            contentStyle={{ borderRadius: '1rem', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
            formatter={(value: any, name: any) => {
              if (name === 'price') {
                return [`$${Number(value).toFixed(2)}`, 'Price'];
              }
              if (name === 'quantity') {
                return [value, 'Qty'];
              }
              return [value, name];
            }}
          />
          <ReferenceLine yAxisId="left" y={maxPrice} stroke="red" strokeDasharray="3 3" label={{ value: `$${maxPrice.toFixed(2)}`, position: 'right', fontSize: 8, fill: 'red' }} />
          <ReferenceLine yAxisId="left" y={minPrice} stroke="green" strokeDasharray="3 3" label={{ value: `$${minPrice.toFixed(2)}`, position: 'right', fontSize: 8, fill: 'green' }} />
          <Bar 
            yAxisId="right"
            dataKey="quantity" 
            name="quantity"
            fill="#f1f5f9"
          />
          <Area 
            yAxisId="left"
            type="monotone" 
            dataKey="price" 
            stroke="#6366f1" 
            fillOpacity={0.3} 
            fill="url(#colorPrice)" 
            activeDot={{ r: 6, cursor: 'pointer', fill: '#6366f1', stroke: '#fff', strokeWidth: 2 }}
          />
        </ComposedChart>
      </ResponsiveContainer>
      
      {selectedTransaction && (
        <div className="mt-4 p-4 bg-slate-50 rounded-2xl border border-slate-100 animate-in fade-in zoom-in duration-300">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Selected Transaction</p>
          <div className="flex justify-between items-center">
            <p className="text-sm font-bold text-slate-900">{selectedTransaction.date}</p>
            <div className="flex gap-4">
              <p className="text-sm font-black text-emerald-600">${selectedTransaction.unit_price.toFixed(2)}</p>
              <p className="text-sm font-black text-slate-900 bg-slate-200 px-2 py-0.5 rounded-md">Qty: {selectedTransaction.quantity}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PriceTrendGraph;
