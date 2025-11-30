import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import Sidebar from '@/components/Sidebar';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Link2, MousePointerClick, DollarSign, TrendingUp } from 'lucide-react';

export default function Home() {
  const [logoClicks, setLogoClicks] = useState(0);
  const navigate = useNavigate();

  const { data: links = [] } = useQuery({
    queryKey: ['links'],
    queryFn: () => base44.entities.ShortenedLink.list()
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

  const stats = [
    { title: 'Total Links', value: links.length, icon: Link2, color: 'cyan' },
    { title: 'Total Clicks', value: totalClicks, icon: MousePointerClick, color: 'purple' },
    { title: 'Unique Clicks', value: totalUniqueClicks, icon: TrendingUp, color: 'pink' },
    { title: 'Total Earnings', value: `$${totalEarnings.toFixed(2)}`, icon: DollarSign, color: 'green' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-950">
      <Sidebar currentPage="Home" onLogoClick={handleLogoClick} clickCount={logoClicks} />
      
      <main className="lg:ml-72 p-6 lg:p-10">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="mb-10 pt-12 lg:pt-0">
            <h1 className="text-3xl lg:text-4xl font-bold text-white mb-2">Welcome back!</h1>
            <p className="text-slate-400">Here's an overview of your link performance</p>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
            {stats.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <Card key={index} className="bg-white/5 border-white/10 backdrop-blur-xl">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className={`w-12 h-12 rounded-xl bg-${stat.color}-500/20 flex items-center justify-center`}>
                        <Icon className={`w-6 h-6 text-${stat.color}-400`} />
                      </div>
                    </div>
                    <p className="text-3xl font-bold text-white mb-1">{stat.value}</p>
                    <p className="text-sm text-slate-400">{stat.title}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>



          {/* Recent Links */}
          <Card className="bg-white/5 border-white/10 backdrop-blur-xl">
            <CardHeader>
              <CardTitle className="text-white">Recent Links</CardTitle>
            </CardHeader>
            <CardContent>
              {links.length === 0 ? (
                <p className="text-slate-400 text-center py-8">No links created yet. Start shortening!</p>
              ) : (
                <div className="space-y-3">
                  {links.slice(0, 5).map((link) => (
                    <div key={link.id} className="flex items-center justify-between p-4 bg-white/5 rounded-xl">
                      <div className="flex-1 min-w-0">
                        <p className="text-white font-medium truncate text-sm">{window.location.host}/Redirect?code={link.short_code}</p>
                        <p className="text-sm text-slate-400 truncate">{link.original_url}</p>
                      </div>
                      <div className="text-right ml-4">
                        <p className="text-cyan-400 font-semibold">{link.clicks || 0} clicks</p>
                        <p className="text-xs text-slate-500">${(link.earnings || 0).toFixed(2)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>


    </div>
  );
}