import React, { useState, useEffect } from 'react';
import Sidebar from '@/components/Sidebar';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Sun, Moon, Check, Loader2 } from "lucide-react";
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

export default function Settings() {
  const [theme, setTheme] = useState('light');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const queryClient = useQueryClient();

  const { data: settings, isLoading } = useQuery({
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

  useEffect(() => {
    if (settings?.theme) {
      setTheme(settings.theme);
    }
  }, [settings]);

  const updateSettingsMutation = useMutation({
    mutationFn: async (newTheme) => {
      return base44.entities.UserSettings.update(settings.id, { theme: newTheme });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['userSettings'] });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    }
  });

  const handleThemeChange = (newTheme) => {
    setTheme(newTheme);
    updateSettingsMutation.mutate(newTheme);
  };

  const isDark = theme === 'dark';

  if (isLoading) {
    return (
      <div className={`min-h-screen ${isDark ? 'bg-slate-950' : 'bg-slate-50'} flex items-center justify-center`}>
        <Loader2 className="w-8 h-8 animate-spin text-purple-500" />
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${isDark ? 'bg-slate-950' : 'bg-slate-50'}`}>
      <Sidebar currentPage="Settings" theme={theme} />
      
      <main className="lg:ml-72 p-6 lg:p-10">
        <div className="max-w-2xl mx-auto">
          <div className="mb-8">
            <h1 className={`text-3xl font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
              Settings
            </h1>
            <p className={`mt-1 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
              Customize your experience
            </p>
          </div>

          <Card className={`p-8 ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white'}`}>
            <h2 className={`text-xl font-semibold mb-6 ${isDark ? 'text-white' : 'text-slate-900'}`}>
              Appearance
            </h2>

            <RadioGroup value={theme} onValueChange={handleThemeChange} className="space-y-4">
              <label
                className={`flex items-center gap-4 p-4 rounded-xl cursor-pointer border-2 transition-all ${
                  theme === 'light'
                    ? 'border-purple-500 bg-purple-50'
                    : isDark
                    ? 'border-slate-700 hover:border-slate-600'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <RadioGroupItem value="light" id="light" className="hidden" />
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                  theme === 'light' ? 'bg-purple-500' : isDark ? 'bg-slate-800' : 'bg-slate-100'
                }`}>
                  <Sun className={`w-6 h-6 ${theme === 'light' ? 'text-white' : isDark ? 'text-slate-400' : 'text-slate-600'}`} />
                </div>
                <div className="flex-1">
                  <p className={`font-semibold ${isDark && theme !== 'light' ? 'text-white' : 'text-slate-900'}`}>
                    Light Theme
                  </p>
                  <p className={`text-sm ${isDark && theme !== 'light' ? 'text-slate-400' : 'text-slate-600'}`}>
                    Bright and clean interface
                  </p>
                </div>
                {theme === 'light' && <Check className="w-5 h-5 text-purple-500" />}
              </label>

              <label
                className={`flex items-center gap-4 p-4 rounded-xl cursor-pointer border-2 transition-all ${
                  theme === 'dark'
                    ? 'border-purple-500 bg-purple-500/10'
                    : isDark
                    ? 'border-slate-700 hover:border-slate-600'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <RadioGroupItem value="dark" id="dark" className="hidden" />
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                  theme === 'dark' ? 'bg-purple-500' : isDark ? 'bg-slate-800' : 'bg-slate-100'
                }`}>
                  <Moon className={`w-6 h-6 ${theme === 'dark' ? 'text-white' : isDark ? 'text-slate-400' : 'text-slate-600'}`} />
                </div>
                <div className="flex-1">
                  <p className={`font-semibold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                    Dark Theme
                  </p>
                  <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                    Easy on the eyes, perfect for night
                  </p>
                </div>
                {theme === 'dark' && <Check className="w-5 h-5 text-purple-500" />}
              </label>
            </RadioGroup>

            {saved && (
              <div className="mt-6 flex items-center gap-2 text-green-500">
                <Check className="w-5 h-5" />
                <span>Settings saved!</span>
              </div>
            )}
          </Card>
        </div>
      </main>
    </div>
  );
}