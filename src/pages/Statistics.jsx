import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import Sidebar from '@/components/Sidebar';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { TrendingUp, DollarSign, Eye, MousePointerClick } from 'lucide-react';

export default function Statistics() {
  const [logoClicks, setLogoClicks] = useState(0);
  const navigate = useNavigate();

  const { data: links = [], isLoading } = useQuery({
    queryKey: ['statsLinks'],
    queryFn: () => base44.entities.ShortenedLink.list('-created_date')
  });

  const handleLogoClick = () => {
    const newCount = logoClicks + 1;
    setLogoClicks(newCount);
    if (newCount >= 10) {
      navigate(createPageUrl('AdminLogin'));
      setLogoClicks(0);
    }
  };

  const totalClicks = links.reduce((sum, link) => sum + (link.clicks || 0), 0);
  const totalUniqueClicks = links.reduce((sum, link) => sum + (link.unique_clicks || 0), 0);
  const totalEarnings = links.reduce((sum, link) => sum + (link.earnings || 0), 0);
  const linksWithEarnings = links.filter(link => (link.earnings || 0) > 0).length;

  const chartData = links.slice(0, 10).map(link => ({
    name: link.short_code,
    clicks: link.clicks || 0,
    unique: link.unique_clicks || 0,
    earnings: link.earnings || 0
  }));

  const pieData = [
    { name: 'Unique Clicks', value: totalUniqueClicks, color: '#22d3ee' },
    { name: 'Repeat Clicks', value: totalClicks - totalUniqueClicks, color: '#a855f7' }
  ];

  const stats = [
    { label: 'Total Clicks', value: totalClicks, icon: MousePointerClick, color: 'cyan' },
    { label: 'Unique Clicks', value: totalUniqueClicks, icon: Eye, color: 'purple' },
    { label: 'Total Earnings', value: `$${totalEarnings.toFixed(2)}`, icon: DollarSign, color: 'green' },
    { label: 'Links with Earnings', value: linksWithEarnings, icon: TrendingUp, color: 'pink' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-950">
      <Sidebar currentPage="Statistics" onLogoClick={handleLogoClick} />
      
      <main className="lg:ml-72 p-6 lg:p-10">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="mb-8 pt-12 lg:pt-0">
            <h1 className="text-3xl font-bold text-white mb-2">Statistics</h1>
            <p className="text-slate-400">Track your link performance and earnings</p>
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center py-20">
              <div className="w-8 h-8 border-2 border-cyan-400/30 border-t-cyan-400 rounded-full animate-spin" />
            </div>
          ) : (
            <>
              {/* Stats Grid */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                {stats.map((stat, index) => {
                  const Icon = stat.icon;
                  return (
                    <Card key={index} className="bg-white/5 border-white/10 backdrop-blur-xl">
                      <CardContent className="p-5">
                        <div className={`w-10 h-10 bg-${stat.color}-500/20 rounded-xl flex items-center justify-center mb-3`}>
                          <Icon className={`w-5 h-5 text-${stat.color}-400`} />
                        </div>
                        <p className="text-2xl font-bold text-white">{stat.value}</p>
                        <p className="text-sm text-slate-400">{stat.label}</p>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>

              {/* Info Note */}
              <Card className="bg-cyan-500/10 border-cyan-500/20 mb-8">
                <CardContent className="p-4">
                  <p className="text-cyan-400 text-sm">
                    <strong>Note:</strong> Only unique clicks (one per IP address) count towards your earnings. This prevents abuse and ensures fair monetization.
                  </p>
                </CardContent>
              </Card>

              {/* Charts */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                {/* Bar Chart */}
                <Card className="bg-white/5 border-white/10 backdrop-blur-xl lg:col-span-2">
                  <CardHeader>
                    <CardTitle className="text-white">Clicks by Link</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-64">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={chartData}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                          <XAxis dataKey="name" stroke="#9ca3af" fontSize={12} />
                          <YAxis stroke="#9ca3af" fontSize={12} />
                          <Tooltip
                            contentStyle={{
                              backgroundColor: '#1f2937',
                              border: '1px solid #374151',
                              borderRadius: '8px'
                            }}
                            labelStyle={{ color: '#fff' }}
                          />
                          <Bar dataKey="clicks" fill="#22d3ee" radius={[4, 4, 0, 0]} />
                          <Bar dataKey="unique" fill="#a855f7" radius={[4, 4, 0, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>

                {/* Pie Chart */}
                <Card className="bg-white/5 border-white/10 backdrop-blur-xl">
                  <CardHeader>
                    <CardTitle className="text-white">Click Distribution</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-64">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={pieData}
                            cx="50%"
                            cy="50%"
                            innerRadius={50}
                            outerRadius={80}
                            dataKey="value"
                          >
                            {pieData.map((entry, index) => (
                              <Cell key={index} fill={entry.color} />
                            ))}
                          </Pie>
                          <Tooltip
                            contentStyle={{
                              backgroundColor: '#1f2937',
                              border: '1px solid #374151',
                              borderRadius: '8px'
                            }}
                          />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                    <div className="flex justify-center gap-6 mt-4">
                      {pieData.map((item, index) => (
                        <div key={index} className="flex items-center gap-2">
                          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                          <span className="text-sm text-slate-400">{item.name}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Earnings Table */}
              <Card className="bg-white/5 border-white/10 backdrop-blur-xl">
                <CardHeader>
                  <CardTitle className="text-white">Earnings by Link</CardTitle>
                </CardHeader>
                <CardContent>
                  {links.length === 0 ? (
                    <p className="text-slate-400 text-center py-8">No links yet</p>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="border-b border-white/10">
                            <th className="text-left py-3 px-4 text-slate-400 font-medium">Short Code</th>
                            <th className="text-right py-3 px-4 text-slate-400 font-medium">Total Clicks</th>
                            <th className="text-right py-3 px-4 text-slate-400 font-medium">Unique Clicks</th>
                            <th className="text-right py-3 px-4 text-slate-400 font-medium">Earnings</th>
                          </tr>
                        </thead>
                        <tbody>
                          {links.map((link) => (
                            <tr key={link.id} className="border-b border-white/5 hover:bg-white/5">
                              <td className="py-3 px-4">
                                <code className="text-cyan-400 text-xs">/Redirect?code={link.short_code}</code>
                              </td>
                              <td className="py-3 px-4 text-right text-white">{link.clicks || 0}</td>
                              <td className="py-3 px-4 text-right text-white">{link.unique_clicks || 0}</td>
                              <td className="py-3 px-4 text-right text-green-400 font-medium">
                                ${(link.earnings || 0).toFixed(2)}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </CardContent>
              </Card>
            </>
          )}
        </div>
      </main>
    </div>
  );
}