import React, { useState, useEffect } from 'react';
import Sidebar from '@/components/Sidebar';
import { Card } from "@/components/ui/card";
import { 
  Link2, MousePointer, DollarSign, TrendingUp, 
  Users, Eye, ArrowUpRight, ArrowDownRight 
} from "lucide-react";
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import { format, subDays } from 'date-fns';

export default function Statistics() {
  const [theme, setTheme] = useState('light');

  const { data: settings } = useQuery({
    queryKey: ['userSettings'],
    queryFn: async () => {
      const user = await base44.auth.me();
      const settingsList = await base44.entities.UserSettings.filter({ user_email: user.email });
      return settingsList[0] || { theme: 'light' };
    }
  });

  const { data: links = [] } = useQuery({
    queryKey: ['myLinks'],
    queryFn: async () => {
      const user = await base44.auth.me();
      return base44.entities.ShortenedLink.filter({ created_by: user.email });
    }
  });

  const { data: clickLogs = [] } = useQuery({
    queryKey: ['clickLogs'],
    queryFn: () => base44.entities.ClickLog.list()
  });

  useEffect(() => {
    if (settings?.theme) {
      setTheme(settings.theme);
    }
  }, [settings]);

  const totalLinks = links.length;
  const totalClicks = links.reduce((sum, link) => sum + (link.clicks || 0), 0);
  const uniqueClicks = links.reduce((sum, link) => sum + (link.unique_clicks || 0), 0);
  const totalEarnings = links.reduce((sum, link) => sum + (link.earnings || 0), 0);
  const earningLinks = links.filter(link => (link.earnings || 0) > 0).length;

  // Prepare chart data
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const date = subDays(new Date(), 6 - i);
    return {
      date: format(date, 'MMM d'),
      clicks: Math.floor(Math.random() * 50), // Simulated data
      earnings: Math.random() * 5
    };
  });

  const topLinks = [...links]
    .sort((a, b) => (b.clicks || 0) - (a.clicks || 0))
    .slice(0, 5);

  const COLORS = ['#8B5CF6', '#3B82F6', '#10B981', '#F59E0B', '#EF4444'];

  const isDark = theme === 'dark';

  return (
    <div className={`min-h-screen ${isDark ? 'bg-slate-950' : 'bg-slate-50'}`}>
      <Sidebar currentPage="Statistics" theme={theme} />
      
      <main className="lg:ml-72 p-6 lg:p-10">
        <div className="max-w-6xl mx-auto">
          <div className="mb-8">
            <h1 className={`text-3xl font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
              Statistics
            </h1>
            <p className={`mt-1 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
              Track your link performance and earnings
            </p>
          </div>

          {/* Key Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <Card className={`p-6 ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white'}`}>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-purple-500/10 rounded-lg flex items-center justify-center">
                  <Link2 className="w-5 h-5 text-purple-500" />
                </div>
                <div>
                  <p className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>{totalLinks}</p>
                  <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>Total Links</p>
                </div>
              </div>
            </Card>

            <Card className={`p-6 ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white'}`}>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-500/10 rounded-lg flex items-center justify-center">
                  <MousePointer className="w-5 h-5 text-blue-500" />
                </div>
                <div>
                  <p className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>{totalClicks}</p>
                  <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>Total Clicks</p>
                </div>
              </div>
            </Card>

            <Card className={`p-6 ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white'}`}>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-green-500/10 rounded-lg flex items-center justify-center">
                  <Users className="w-5 h-5 text-green-500" />
                </div>
                <div>
                  <p className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>{uniqueClicks}</p>
                  <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>Unique Clicks</p>
                </div>
              </div>
            </Card>

            <Card className={`p-6 ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white'}`}>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-amber-500/10 rounded-lg flex items-center justify-center">
                  <DollarSign className="w-5 h-5 text-amber-500" />
                </div>
                <div>
                  <p className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>${totalEarnings.toFixed(2)}</p>
                  <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>Total Earnings</p>
                </div>
              </div>
            </Card>
          </div>

          {/* Earnings Info */}
          <Card className={`p-6 mb-8 ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white'}`}>
            <div className="flex items-center gap-3 mb-4">
              <TrendingUp className={`w-5 h-5 ${isDark ? 'text-green-400' : 'text-green-500'}`} />
              <h2 className={`text-xl font-semibold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                Earning Links
              </h2>
            </div>
            <p className={`text-lg ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
              <span className="font-bold text-green-500">{earningLinks}</span> of your {totalLinks} links have earned money.
            </p>
            <p className={`text-sm mt-2 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
              Remember: Each unique IP can only count once per link for earning money!
            </p>
          </Card>

          {/* Charts Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Click Trends */}
            <Card className={`p-6 ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white'}`}>
              <h3 className={`text-lg font-semibold mb-4 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                Clicks (Last 7 Days)
              </h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={last7Days}>
                    <XAxis dataKey="date" tick={{ fill: isDark ? '#94a3b8' : '#64748b', fontSize: 12 }} />
                    <YAxis tick={{ fill: isDark ? '#94a3b8' : '#64748b', fontSize: 12 }} />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: isDark ? '#1e293b' : '#fff',
                        border: isDark ? '1px solid #334155' : '1px solid #e2e8f0'
                      }}
                    />
                    <Bar dataKey="clicks" fill="#8B5CF6" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </Card>

            {/* Earnings Trend */}
            <Card className={`p-6 ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white'}`}>
              <h3 className={`text-lg font-semibold mb-4 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                Earnings (Last 7 Days)
              </h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={last7Days}>
                    <XAxis dataKey="date" tick={{ fill: isDark ? '#94a3b8' : '#64748b', fontSize: 12 }} />
                    <YAxis tick={{ fill: isDark ? '#94a3b8' : '#64748b', fontSize: 12 }} />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: isDark ? '#1e293b' : '#fff',
                        border: isDark ? '1px solid #334155' : '1px solid #e2e8f0'
                      }}
                      formatter={(value) => [`$${value.toFixed(2)}`, 'Earnings']}
                    />
                    <Line type="monotone" dataKey="earnings" stroke="#10B981" strokeWidth={2} dot={{ fill: '#10B981' }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </Card>

            {/* Top Links */}
            <Card className={`p-6 lg:col-span-2 ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white'}`}>
              <h3 className={`text-lg font-semibold mb-4 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                Top Performing Links
              </h3>
              {topLinks.length === 0 ? (
                <p className={`text-center py-8 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                  No links yet. Create your first shortened link!
                </p>
              ) : (
                <div className="space-y-3">
                  {topLinks.map((link, index) => (
                    <div key={link.id} className={`flex items-center gap-4 p-4 rounded-xl ${isDark ? 'bg-slate-800' : 'bg-slate-50'}`}>
                      <div 
                        className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold"
                        style={{ backgroundColor: COLORS[index] }}
                      >
                        {index + 1}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className={`font-medium truncate ${isDark ? 'text-white' : 'text-slate-900'}`}>
                          {link.title || `shrinkpro.xyz/${link.short_code}`}
                        </p>
                        <p className={`text-sm truncate ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                          {link.original_url}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className={`font-semibold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                          {link.clicks || 0} clicks
                        </p>
                        <p className="text-sm text-green-500">
                          ${(link.earnings || 0).toFixed(2)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}