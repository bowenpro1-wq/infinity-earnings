import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import Sidebar from '@/components/Sidebar';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Sun, Moon, Check } from 'lucide-react';

export default function Settings() {
  const [logoClicks, setLogoClicks] = useState(0);
  const [theme, setTheme] = useState('dark');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const loadSettings = async () => {
      const user = await base44.auth.me();
      if (user?.theme) {
        setTheme(user.theme);
      }
    };
    loadSettings();
  }, []);

  const handleLogoClick = () => {
    const newCount = logoClicks + 1;
    setLogoClicks(newCount);
    if (newCount >= 10) {
      navigate(createPageUrl('AdminLogin'));
      setLogoClicks(0);
    }
  };

  const handleThemeChange = async (newTheme) => {
    setTheme(newTheme);
    setSaving(true);
    
    await base44.auth.updateMe({ theme: newTheme });
    
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className={`min-h-screen ${theme === 'dark' ? 'bg-gradient-to-br from-slate-950 via-purple-950 to-slate-950' : 'bg-gradient-to-br from-slate-100 via-purple-100 to-slate-100'}`}>
      <Sidebar currentPage="Settings" onLogoClick={handleLogoClick} />
      
      <main className="lg:ml-72 p-6 lg:p-10">
        <div className="max-w-2xl mx-auto">
          {/* Header */}
          <div className="mb-8 pt-12 lg:pt-0">
            <h1 className={`text-3xl font-bold mb-2 ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>Settings</h1>
            <p className={theme === 'dark' ? 'text-slate-400' : 'text-slate-600'}>Customize your ShrinkPro experience</p>
          </div>

          {/* Theme Selection */}
          <Card className={`${theme === 'dark' ? 'bg-white/5 border-white/10' : 'bg-white border-slate-200'} backdrop-blur-xl`}>
            <CardHeader>
              <CardTitle className={theme === 'dark' ? 'text-white' : 'text-slate-900'}>Theme</CardTitle>
            </CardHeader>
            <CardContent>
              <p className={`text-sm mb-6 ${theme === 'dark' ? 'text-slate-400' : 'text-slate-600'}`}>
                Choose your preferred color scheme
              </p>

              <div className="grid grid-cols-2 gap-4">
                {/* Light Theme */}
                <button
                  onClick={() => handleThemeChange('light')}
                  className={`relative p-6 rounded-2xl border-2 transition-all ${
                    theme === 'light' 
                      ? 'border-cyan-500 bg-gradient-to-br from-white to-slate-100' 
                      : 'border-transparent bg-gradient-to-br from-white to-slate-100 hover:border-slate-300'
                  }`}
                >
                  {theme === 'light' && (
                    <div className="absolute top-3 right-3 w-6 h-6 bg-cyan-500 rounded-full flex items-center justify-center">
                      <Check className="w-4 h-4 text-white" />
                    </div>
                  )}
                  <div className="w-14 h-14 bg-gradient-to-br from-amber-300 to-orange-400 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                    <Sun className="w-7 h-7 text-white" />
                  </div>
                  <p className="text-slate-900 font-semibold text-lg">Light</p>
                  <p className="text-slate-500 text-sm mt-1">Bright and clean</p>
                </button>

                {/* Dark Theme */}
                <button
                  onClick={() => handleThemeChange('dark')}
                  className={`relative p-6 rounded-2xl border-2 transition-all ${
                    theme === 'dark' 
                      ? 'border-purple-500 bg-gradient-to-br from-slate-800 to-slate-900' 
                      : 'border-transparent bg-gradient-to-br from-slate-800 to-slate-900 hover:border-slate-600'
                  }`}
                >
                  {theme === 'dark' && (
                    <div className="absolute top-3 right-3 w-6 h-6 bg-purple-500 rounded-full flex items-center justify-center">
                      <Check className="w-4 h-4 text-white" />
                    </div>
                  )}
                  <div className="w-14 h-14 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                    <Moon className="w-7 h-7 text-white" />
                  </div>
                  <p className="text-white font-semibold text-lg">Dark</p>
                  <p className="text-slate-400 text-sm mt-1">Easy on the eyes</p>
                </button>
              </div>

              {saved && (
                <div className="mt-6 flex items-center justify-center gap-2 text-green-400">
                  <Check className="w-5 h-5" />
                  <span>Settings saved!</span>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}