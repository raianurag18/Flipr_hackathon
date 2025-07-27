"use client";

import { useState, useEffect } from 'react';
import {
  ComposedChart, Bar, Line, Dot, LineChart, ScatterChart, Scatter, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer, PieChart, Pie
} from 'recharts';
import { motion, AnimatePresence } from 'framer-motion';
import { DollarSign, TrendingUp, AlertTriangle, Percent, LoaderCircle, RotateCcw, Award, XCircle } from 'lucide-react';
import { toast } from 'react-hot-toast';

// We no longer import Layout here

const COLORS = ['#3b82f6', '#82ca9d', '#facc15', '#fb923c', '#8884d8', '#2dd4bf', '#ef4444', '#a855f7', '#14b8a6', '#64748b'];
const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const formatCurrency = (value) => new Intl.NumberFormat('en-IN', {
  style: 'currency', currency: 'INR', maximumFractionDigits: 0,
}).format(value);

const formatHour = (hour) => {
    if (hour === 0) return '12AM';
    if (hour === 12) return '12PM';
    if (hour < 12) return `${hour}AM`;
    return `${hour - 12}PM`;
};

const getHeatmapColor = (value) => `rgba(59, 130, 246, ${value < 0.1 && value > 0 ? 0.1 : value})`;

const getStockColor = (current, min) => {
  if (current === undefined || min === undefined || min === 0) {
    return '#64748b';
  }
  if (current < min) {
    return '#ef4444';
  }
  if (current <= min * 1.1) {
    return '#facc15';
  }
  return '#82ca9d';
};

const StatCard = ({ icon, title, value, unit, onIconClick }) => (
  <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
    className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
    <div className="flex items-center gap-4">
        <div className={`p-3 rounded-lg cursor-pointer ${title === 'Items on Alert' && value > 0 ? 'bg-red-100 text-red-600 border border-red-200 animate-pulse' : 'bg-blue-100 text-blue-600'}`}
         onClick={onIconClick} role="button">
         {icon}
      </div>
      <div>
        <p className="text-sm text-gray-500 truncate">{title}</p>
        <p className="text-xl font-bold text-gray-800 truncate">
          {value}<span className="text-md font-medium text-gray-500">{unit}</span>
        </p>
      </div>
    </div>
  </motion.div>
);

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="p-3 bg-white border border-gray-200 rounded-lg text-sm text-gray-800 shadow-xl">
        <p className="font-semibold text-blue-600 mb-2">{label || payload[0].name}</p>
        {payload.map((p, i) => (
          <div key={i} className="flex items-center text-sm space-x-2">
            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: p.color || p.payload.fill }}></div>
            <span>{p.name}:</span>
            <span className="font-medium">
              {['totalValue', 'totalProfit', 'value'].includes(p.dataKey) ? formatCurrency(p.value) : p.value}
            </span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

const CustomHeatmapTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="p-2 bg-white border border-gray-200 rounded-lg text-sm text-gray-800 shadow-xl">
        <p className="font-semibold text-blue-600 mb-1">{`${DAYS[data.day]} at ${formatHour(data.hour)}`}</p>
        <p>Sales Count: <span className="font-medium">{data.value}</span></p>
      </div>
    );
  }
  return null;
};

const CustomizedStockDot = (props) => {
  const { cx, cy, payload } = props;
  const { currentStock, minimumStock } = payload;
  const color = getStockColor(currentStock, minimumStock);
  return <Dot cx={cx} cy={cy} r={5} fill={color} stroke="#fff" strokeWidth={2} />;
};

export default function ReportsClient() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showLowStockPopup, setShowLowStockPopup] = useState(false);

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/reports');
      if (!res.ok) throw new Error(`API Error: ${res.status}`);
      const result = await res.json();
      setData(result);
    } catch (error) {
      console.error("Failed to fetch report data:", error);
      toast.error("Could not load report data.");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <LoaderCircle className="w-12 h-12 animate-spin text-blue-500" />
      </div>
    );
  }

  if (!data) {
    return <div className="text-center text-red-500">Could not load report data. Please try again.</div>;
  }

  const {
    keyMetrics, mostReorderedProduct, stockTurnoverRate,
    productValueDistribution = [], profitabilityByProduct = [], lowStockProducts = [], 
    salesActivityHeatmap = []
  } = data;

  return (
    <div className="space-y-6">
      {/* Title is now inside the client component, styled like ProductsPage */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Inventory Reports</h1>
        <p className="text-gray-600 mt-1">
          Key insights into your inventory's performance.
        </p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-6 gap-5">
        <div className="col-span-2 lg:col-span-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <StatCard icon={<DollarSign size={22} />} title="Total Inventory Value" value={formatCurrency(keyMetrics.totalValue)} />
            <StatCard icon={<TrendingUp size={22} />} title="GMROI" value={keyMetrics.gmroi.toFixed(1)} unit="%" />
            <StatCard icon={<Percent size={22} />} title="Avg. Profit Margin" value={keyMetrics.avgProfitMargin.toFixed(1)} unit="%" />
            <StatCard icon={<AlertTriangle size={22} />} title="Items on Alert" value={keyMetrics.lowStockCount} unit=" items" onIconClick={() => setShowLowStockPopup(true)} />
          </div>
        </div>
        <div className="col-span-2">
          <div className="grid grid-cols-1 gap-5">
              <StatCard icon={<Award size={22} />} title="Best Seller" value={mostReorderedProduct?.name || 'N/A'} />
              <StatCard icon={<RotateCcw size={22} />} title="Stock Turnover Rate" value={stockTurnoverRate.toFixed(2)} unit="x" />
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div className="p-4 bg-white rounded-xl shadow-sm border border-gray-100">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Profitability (Top 10 Products)</h2>
          <ResponsiveContainer width="100%" height={280}>
            <ComposedChart data={profitabilityByProduct} margin={{ top: 5, right: 5, left: 10, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.4} stroke="#e5e7eb"/>
              <XAxis dataKey="name" stroke="#6b7280" fontSize={10} tick={{ angle: -25, textAnchor: 'end' }} height={50} />
              <YAxis yAxisId="left" stroke="#6b7280" fontSize={10} tickFormatter={(value) => `₹${value / 1000}k`} />
              <Tooltip content={<CustomTooltip />} />
              <Legend wrapperStyle={{fontSize: "12px"}}/>
              <Bar yAxisId="left" dataKey="totalValue" name="Value">
                {profitabilityByProduct.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={getStockColor(entry.currentStock, entry.minimumStock)} />
                ))}
              </Bar>
              <Line yAxisId="left" dataKey="totalProfit" stroke={COLORS[1]} name="Profit" strokeWidth={2} dot={{r: 3}} activeDot={{r: 5}} />
            </ComposedChart>
          </ResponsiveContainer>
        </motion.div>
        <motion.div className="p-4 bg-white rounded-xl shadow-sm border border-gray-100">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Stock Levels (Top 10 Products)</h2>
            <ResponsiveContainer width="100%" height={280}>
              <LineChart data={profitabilityByProduct} margin={{ top: 5, right: 5, left: -10, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.4} stroke="#e5e7eb"/>
                  <XAxis dataKey="name" stroke="#6b7280" fontSize={10} tick={{ angle: -25, textAnchor: 'end' }} height={50} />
                  <YAxis fontSize={10} stroke="#6b7280" />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend wrapperStyle={{fontSize: "12px"}}/>
                  <Line dataKey="currentStock" name="Current Stock" stroke={COLORS[4]} strokeWidth={2} dot={<CustomizedStockDot />} activeDot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <motion.div className="p-4 bg-white rounded-xl shadow-sm border border-gray-100">
          <h2 className="text-lg font-semibold text-gray-800 mb-4 text-center">Inventory Value by Product</h2>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie data={productValueDistribution} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} labelLine={false}>
                {productValueDistribution.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} /> )}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
              <Legend wrapperStyle={{fontSize: "12px"}} formatter={(value) => value.length > 20 ? `${value.substring(0, 20)}...` : value} />
            </PieChart>
          </ResponsiveContainer>
        </motion.div>
        
        <motion.div className="p-4 bg-white rounded-xl shadow-sm border border-gray-100">
          <h2 className="text-lg font-semibold text-gray-800 mb-1">Sales Activity Heatmap</h2>
          <p className="text-xs text-gray-500 mb-4">Shows sales volume by day of the week and hour.</p>
          <ResponsiveContainer width="100%" height={250}>
              <ScatterChart margin={{ top: 10, right: 10, bottom: 30, left: 15 }}>
                  <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.4} stroke="#e5e7eb"/>
                  <XAxis 
                      dataKey="hour" 
                      type="number" 
                      name="Hour" 
                      domain={[0, 23]} 
                      ticks={[0, 6, 12, 18, 23]} 
                      tickFormatter={formatHour}
                      stroke="#6b7280" 
                      fontSize={10}
                  />
                  <YAxis
                      dataKey="day"
                      type="category"
                      name="Day"
                      domain={[0, 6]}
                      tickFormatter={(day) => DAYS[day]}
                      stroke="#6b7280"
                      fontSize={10}
                      width={35}
                      tickLine={false}
                      axisLine={false}
                  />
                  <Tooltip cursor={{ strokeDasharray: '3 3' }} content={<CustomHeatmapTooltip />} />
                  <Scatter name="Sales Activity" data={salesActivityHeatmap} shape="square" isAnimationActive={false}>
                      {salesActivityHeatmap.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={getHeatmapColor(entry.normalizedValue)} />
                      ))}
                  </Scatter>
              </ScatterChart>
          </ResponsiveContainer>
        </motion.div>
      </div>

      <AnimatePresence>
        {showLowStockPopup && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 backdrop-blur-sm bg-black/20 flex justify-center items-center p-4"
            onClick={() => setShowLowStockPopup(false)}>
            <motion.div initial={{ scale: 0.95, y: -20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: -20 }}
              className="bg-white rounded-xl shadow-xl w-full max-w-lg p-6 relative"
              onClick={(e) => e.stopPropagation()}>
              <button onClick={() => setShowLowStockPopup(false)} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600">
                <XCircle size={24} />
              </button>
              <h2 className="text-xl font-bold text-gray-800 mb-4">Low Stock Items ({lowStockProducts.length})</h2>
              <div className="space-y-3 max-h-[40vh] overflow-y-auto pr-2">
                {lowStockProducts.map((item, idx) => (
                  <div key={idx} className="flex justify-between items-center text-sm text-gray-700 border-b pb-2">
                    <span className="font-medium">{item.name}</span>
                    <span className="text-xs font-mono bg-red-100 text-red-700 px-2 py-1 rounded">
                      {item.currentStock} units (Min: {item.minimumStock})
                    </span>
                  </div>
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
