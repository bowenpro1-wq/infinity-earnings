import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import Sidebar from '@/components/Sidebar';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link2, TrendingUp, DollarSign, MousePointer, Plus, ArrowRight, X } from "lucide-react";
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';

export default function Home() {
  const navigate = useNavigate();
  const [logoClicks, setLogoClicks] = useState(0);
  const [theme, setTheme] = useState('light');
  const [popupAd, setPopupAd] = useState(null);
  const [showPopup, setShowPopup] = useState(false);

  const { data: settings } = useQuery({
    queryKey: ['userSettings'],
    queryFn: async () => {
      const user = await base44.auth.me();
      const settingsList = await base44.entities.UserSettings.filter({ user_email: user.email });
      if (settingsList.length > 0) {
        return settingsList[0];
      }
      const newSettings = await base44.entities.UserSettings.create({
        user_email: user.email,
        theme: 'light',
        total_earnings: 0,
        withdrawn_amount: 0
      });
      return newSettings;
    }
  });

  const { data: links = [] } = useQuery({
    queryKey: ['links'],
    queryFn: () => base44.entities.ShortenedLink.list()
  });

  const { data: ads = [] } = useQuery({
    queryKey: ['activeAds'],
    queryFn: () => base44.entities.Advertisement.filter({ is_active: true })
  });

  useEffect(() => {
    if (settings?.theme) {
      setTheme(settings.theme);
    }
  }, [settings]);

  useEffect(() => {
    const popupAds = ads.filter(ad => ad.ad_type === 'popup');
    if (popupAds.length > 0) {
      const ad = popupAds[0];
      setPopupAd(ad);
      const delay = (ad.delay_seconds || 5) * 1000;
      const timer = setTimeout(() => {
        setShowPopup(true);
      }, delay);
      return () => clearTimeout(timer);
    }
  }, [ads]);

  const handleLogoClick = () => {
    const newClicks = logoClicks + 1;
    setLogoClicks(newClicks);
    if (newClicks >= 10) {
      navigate(createPageUrl('AdminPanel'));
      setLogoClicks(0);
    }
  };

  const handlePopupClick = () => {
    if (popupAd?.target_url) {
      window.open(popupAd.target_url, '_blank');
    }
    setShowPopup(false);
  };

  const totalClicks = links.reduce((sum, link) => sum + (link.clicks || 0), 0);
  const totalEarnings = links.reduce((sum, link) => sum + (link.earnings || 0), 0);
  const isDark = theme === 'dark';

  const homepageAds = ads.filter(ad => ad.ad_type === 'homepage' && ad.is_active);

  return (
    <div className={`min-h-screen ${isDark ? 'bg-slate-950' : 'bg-slate-50'}`}>
      <Sidebar currentPage="Home" theme={theme} onLogoClick={handleLogoClick} />
      
      <main className="lg:ml-72 p-6 lg:p-10">
        <div className="max-w-6xl mx-auto">
          <div className="mb-10">
            <h1 className={`text-3xl font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
              Welcome back!
            </h1>
            <p className={`mt-2 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
              Here's an overview of your link performance
            </p>
          </div>

          {/* Homepage Ads */}
          {homepageAds.map((ad) => (
            <a
              key={ad.id}
              href={ad.target_url}
              target="_blank"
              rel="noopener noreferrer"
              className="block mb-6"
            >
              <Card className={`overflow-hidden ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white'}`}>
                {ad.image_url && (
                  <img src={ad.image_url} alt="Advertisement" className="w-full h-32 object-cover" />
                )}
              </Card>
            </a>
          ))}

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
            <Card className={`p-6 ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white'}`}>
              <div className="flex items-center justify-between">
                <div>
                  <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>Total Links</p>
                  <p className={`text-3xl font-bold mt-1 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                    {links.length}
                  </p>
                </div>
                <div className="w-12 h-12 bg-purple-500/10 rounded-xl flex items-center justify-center">
                  <Link2 className="w-6 h-6 text-purple-500" />
                </div>
              </div>
            </Card>

            <Card className={`p-6 ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white'}`}>
              <div className="flex items-center justify-between">
                <div>
                  <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>Total Clicks</p>
                  <p className={`text-3xl font-bold mt-1 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                    {totalClicks}
                  </p>
                </div>
                <div className="w-12 h-12 bg-blue-500/10 rounded-xl flex items-center justify-center">
                  <MousePointer className="w-6 h-6 text-blue-500" />
                </div>
              </div>
            </Card>

            <Card className={`p-6 ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white'}`}>
              <div className="flex items-center justify-between">
                <div>
                  <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>Total Earnings</p>
                  <p className={`text-3xl font-bold mt-1 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                    ${totalEarnings.toFixed(2)}
                  </p>
                </div>
                <div className="w-12 h-12 bg-green-500/10 rounded-xl flex items-center justify-center">
                  <DollarSign className="w-6 h-6 text-green-500" />
                </div>
              </div>
            </Card>
          </div>

          {/* Quick Actions */}
          <Card className={`p-6 ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white'}`}>
            <h2 className={`text-xl font-semibold mb-4 ${isDark ? 'text-white' : 'text-slate-900'}`}>
              Quick Actions
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Button
                onClick={() => navigate(createPageUrl('ShortenNew'))}
                className="h-16 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white justify-start px-6"
              >
                <Plus className="w-5 h-5 mr-3" />
                <span className="text-lg">Shorten New Link</span>
                <ArrowRight className="w-5 h-5 ml-auto" />
              </Button>
              <Button
                onClick={() => navigate(createPageUrl('MyLinks'))}
                variant="outline"
                className={`h-16 justify-start px-6 ${isDark ? 'border-slate-700 text-white hover:bg-slate-800' : ''}`}
              >
                <Link2 className="w-5 h-5 mr-3" />
                <span className="text-lg">View My Links</span>
                <ArrowRight className="w-5 h-5 ml-auto" />
              </Button>
            </div>
          </Card>
        </div>
      </main>

      {/* Popup Ad */}
      {showPopup && popupAd && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
          <Card className="relative max-w-lg w-full bg-white overflow-hidden">
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-2 right-2 z-10"
              onClick={() => setShowPopup(false)}
            >
              <X className="w-5 h-5" />
            </Button>
            <button onClick={handlePopupClick} className="w-full">
              {popupAd.image_url && (
                <img src={popupAd.image_url} alt="Advertisement" className="w-full" />
              )}
              <div className="p-4 text-center">
                <p className="text-sm text-slate-500">Click to visit</p>
              </div>
            </button>
          </Card>
        </div>
      )}
    </div>
  );
}