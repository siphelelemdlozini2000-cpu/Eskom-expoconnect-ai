// app/admin/analytics/page.tsx
'use client';

import React, { useState } from 'react';
import { motion, Variants } from 'framer-motion';
import { 
  Users, FileText, CheckCircle, TrendingUp, 
  Download, Calendar, BrainCircuit, Sparkles, Loader2 
} from 'lucide-react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, PieChart, Pie, Cell
} from 'recharts';

// UI Components (Simulated shadcn/ui)
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

// --- MOCK DATA ---
const kpiData = [
  { title: 'Total Submissions', value: '1,248', trend: '+12%', icon: FileText, color: 'text-blue-600', bg: 'bg-blue-50' },
  { title: 'Registered Learners', value: '2,845', trend: '+18%', icon: Users, color: 'text-orange-500', bg: 'bg-orange-50' },
  { title: 'Evaluations Completed', value: '892', trend: '71% rate', icon: CheckCircle, color: 'text-green-600', bg: 'bg-green-50' },
  { title: 'Avg. Project Score', value: '76.4', trend: '+2.1 pts', icon: TrendingUp, color: 'text-purple-600', bg: 'bg-purple-50' },
];

const submissionTrends = [
  { month: 'Mar', submissions: 120 },
  { month: 'Apr', submissions: 250 },
  { month: 'May', submissions: 480 },
  { month: 'Jun', submissions: 850 },
  { month: 'Jul', submissions: 1100 },
  { month: 'Aug', submissions: 1248 },
];

const provinceData = [
  { name: 'Gauteng', participants: 850 },
  { name: 'KwaZulu-Natal', participants: 620 },
  { name: 'Western Cape', participants: 580 },
  { name: 'Eastern Cape', participants: 410 },
  { name: 'Limpopo', participants: 180 },
  { name: 'Mpumalanga', participants: 110 },
  { name: 'Free State', participants: 98 },
];

const completionData = [
  { name: 'Evaluated', value: 892, color: '#16a34a' },
  { name: 'Under Review', value: 245, color: '#2563eb' },
  { name: 'Draft Phase', value: 111, color: '#f97316' },
];

// Custom Premium Tooltip for Recharts
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white/95 backdrop-blur-sm p-3 rounded-lg shadow-sm border border-slate-100 text-sm">
        <p className="font-semibold text-slate-800 mb-1">{label}</p>
        {payload.map((entry: any, index: number) => (
          <p key={index} className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }} />
            <span className="text-slate-600">{entry.name}:</span>
            <span className="font-medium text-slate-900">{entry.value}</span>
          </p>
        ))}
      </div>
    );
  }
  return null;
};

export default function AdminAnalyticsDashboard() {
  // Added state for the export loading animation
  const [isExporting, setIsExporting] = useState(false);

  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } }
  };

  // NEW: The function that generates and downloads the CSV file
  const handleExport = () => {
    setIsExporting(true);

    // Simulate a brief delay so the user sees the loading spinner
    setTimeout(() => {
      // 1. Format the mock KPI data into a CSV string
      const headers = ["Metric", "Value", "Trend"];
      const rows = kpiData.map(kpi => `"${kpi.title}","${kpi.value}","${kpi.trend}"`);
      const csvContent = [headers.join(","), ...rows].join("\n");

      // 2. Create a secure Blob (file) from the string
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);

      // 3. Create a temporary hidden link to trigger the download
      const link = document.createElement("a");
      link.setAttribute("href", url);
      link.setAttribute("download", "Eskom_Expo_Analytics_2026.csv");
      document.body.appendChild(link);
      
      // 4. Click it and clean up
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      setIsExporting(false);
    }, 1200);
  };

  return (
    <div className="min-h-screen bg-slate-50 p-8">
      <motion.div 
        className="max-w-7xl mx-auto space-y-8"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Header */}
        <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 border-b border-slate-200 pb-6">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Platform Analytics</h1>
            <p className="text-slate-500 mt-1">Real-time insights into submissions, judge performance, and regional participation.</p>
          </div>
          <div className="flex gap-3">
            <button className="flex items-center gap-2 bg-white border border-slate-200 text-slate-700 px-4 py-2 rounded-lg font-medium hover:bg-slate-50 transition-colors shadow-sm">
              <Calendar size={16} /> 2026 Cycle
            </button>
            
            {/* FIXED: Added onClick handler and dynamic loading state */}
            <button 
              onClick={handleExport}
              disabled={isExporting}
              className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors shadow-sm disabled:opacity-70 min-w-[150px] justify-center"
            >
              {isExporting ? (
                <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: "linear" }}>
                  <Loader2 size={16} />
                </motion.div>
              ) : (
                <Download size={16} />
              )}
              {isExporting ? 'Generating...' : 'Export Report'}
            </button>
          </div>
        </header>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {kpiData.map((kpi, i) => (
            <motion.div key={i} variants={itemVariants}>
              <Card className="border-0 shadow-sm hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-sm font-medium text-slate-500 mb-1">{kpi.title}</p>
                      <h3 className="text-3xl font-bold text-slate-900">{kpi.value}</h3>
                    </div>
                    <div className={`p-3 rounded-xl ${kpi.bg}`}>
                      <kpi.icon size={20} className={kpi.color} />
                    </div>
                  </div>
                  <div className="mt-4 flex items-center text-sm">
                    <span className={`font-semibold ${kpi.title === 'Evaluations Completed' ? 'text-slate-600' : 'text-green-600'}`}>
                      {kpi.trend}
                    </span>
                    <span className="text-slate-400 ml-2">vs last month</span>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Submission Trends */}
          <motion.div variants={itemVariants} className="lg:col-span-2">
            <Card className="border-0 shadow-sm h-full">
              <CardHeader>
                <CardTitle className="text-lg text-slate-800">Submission Growth (2026)</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[300px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={submissionTrends} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <defs>
                        <linearGradient id="colorSubmissions" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#2563eb" stopOpacity={0.2}/>
                          <stop offset="95%" stopColor="#2563eb" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                      <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
                      <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
                      <Tooltip content={<CustomTooltip />} />
                      <Area type="monotone" dataKey="submissions" name="Submissions" stroke="#2563eb" strokeWidth={3} fillOpacity={1} fill="url(#colorSubmissions)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Completion Rates */}
          <motion.div variants={itemVariants}>
            <Card className="border-0 shadow-sm h-full">
              <CardHeader>
                <CardTitle className="text-lg text-slate-800">Evaluation Pipeline</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col items-center justify-center h-[300px]">
                <ResponsiveContainer width="100%" height={220}>
                  <PieChart>
                    <Pie
                      data={completionData}
                      cx="50%" cy="50%"
                      innerRadius={60} outerRadius={80}
                      paddingAngle={5} dataKey="value" stroke="none"
                    >
                      {completionData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
                  </PieChart>
                </ResponsiveContainer>
                {/* Custom Legend */}
                <div className="w-full mt-4 space-y-2">
                  {completionData.map((item, i) => (
                    <div key={i} className="flex justify-between items-center text-sm">
                      <div className="flex items-center gap-2">
                        <span className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }}></span>
                        <span className="text-slate-600">{item.name}</span>
                      </div>
                      <span className="font-semibold text-slate-800">{item.value}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Province Participation */}
          <motion.div variants={itemVariants} className="lg:col-span-2">
            <Card className="border-0 shadow-sm h-full">
              <CardHeader>
                <CardTitle className="text-lg text-slate-800">Provincial Participation</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[250px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={provinceData} layout="vertical" margin={{ top: 0, right: 30, left: 40, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e2e8f0" />
                      <XAxis type="number" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
                      <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#475569', fontWeight: 500 }} />
                      <Tooltip cursor={{ fill: '#f1f5f9' }} content={<CustomTooltip />} />
                      <Bar dataKey="participants" name="Learners" fill="#16a34a" radius={[0, 4, 4, 0]} barSize={20} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* AI Insights Panel */}
          <motion.div variants={itemVariants}>
            <Card className="border-0 shadow-md bg-slate-900 text-white h-full relative overflow-hidden">
              <BrainCircuit className="absolute -right-10 -bottom-10 text-white/5" size={180} />
              
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2 text-white">
                  <Sparkles size={18} className="text-orange-400" />
                  AI Insights
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 relative z-10">
                <div className="bg-slate-800 p-4 rounded-xl border border-slate-700 shadow-sm">
                  <h4 className="text-sm font-semibold text-blue-400 mb-1">Workload Imbalance Detected</h4>
                  <p className="text-sm text-slate-200 leading-relaxed">Chemistry judges in the Western Cape node are operating at 92% capacity. Recommend re-allocating 15 projects to the national pool.</p>
                </div>
                <div className="bg-slate-800 p-4 rounded-xl border border-slate-700 shadow-sm">
                  <h4 className="text-sm font-semibold text-green-400 mb-1">High-Performing Demographic</h4>
                  <p className="text-sm text-slate-200 leading-relaxed">Submissions from rural schools in the Eastern Cape have increased by 34% compared to 2025, largely driven by the Computer Sciences category.</p>
                </div>
              </CardContent>
            </Card>
          </motion.div>

        </div>
      </motion.div>
    </div>
  );
}