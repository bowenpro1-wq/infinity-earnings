import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import Sidebar from '@/components/Sidebar';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Link2, ArrowRight, Loader2, ChevronDown, ChevronUp, Lock, Calendar } from "lucide-react";
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

export default function ShortenNew() {
  const navigate = useNavigate();
  const [theme, setTheme] = useState('light');
  const [url, setUrl] = useState('');
  const [title, setTitle] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [passwordProtected, setPasswordProtected] = useState(false);
  const [password, setPassword] = useState('');
  const [expiryDate, setExpiryDate] = useState('');

  const { data: settings } = useQuery({
    queryKey: ['userSettings'],
    queryFn: async () => {
      const user = await base44.auth.me();
      const settingsList = await base44.entities.UserSettings.filter({ user_email: user.email });
      return settingsList[0] || { theme: 'light' };
    }
  });

  useEffect(() => {
    if (settings?.theme) {
      setTheme(settings.theme);
    }
  }, [settings]);

  const generateShortCode = () => {
    const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = '';
    for (let i = 0; i < 6; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!url) return;

    setIsLoading(true);
    const shortCode = generateShortCode();

    await base44.entities.ShortenedLink.create({
      original_url: url.startsWith('http') ? url : `https://${url}`,
      short_code: shortCode,
      title: title || null,
      clicks: 0,
      unique_clicks: 0,
      earnings: 0,
      is_active: true,
      advanced_settings: {
        password_protected: passwordProtected,
        password: passwordProtected ? password : null,
        expiry_date: expiryDate || null
      }
    });

    setIsLoading(false);
    navigate(createPageUrl('MyLinks'));
  };

  const isDark = theme === 'dark';

  return (
    <div className={`min-h-screen ${isDark ? 'bg-slate-950' : 'bg-slate-50'}`}>
      <Sidebar currentPage="ShortenNew" theme={theme} />
      
      <main className="lg:ml-72 p-6 lg:p-10">
        <div className="max-w-2xl mx-auto">
          <div className="mb-8">
            <h1 className={`text-3xl font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
              Shorten New Link
            </h1>
            <p className={`mt-1 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
              Create a new shortened URL with optional advanced settings
            </p>
          </div>

          <Card className={`p-8 ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white'}`}>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label className={isDark ? 'text-white' : ''}>URL to shorten *</Label>
                <div className="relative">
                  <Link2 className={`absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 ${isDark ? 'text-slate-500' : 'text-slate-400'}`} />
                  <Input
                    type="url"
                    placeholder="https://example.com/very-long-url"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    required
                    className={`pl-12 h-14 text-lg ${isDark ? 'bg-slate-800 border-slate-700 text-white' : ''}`}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label className={isDark ? 'text-white' : ''}>Link title (optional)</Label>
                <Input
                  type="text"
                  placeholder="My awesome link"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className={`h-12 ${isDark ? 'bg-slate-800 border-slate-700 text-white' : ''}`}
                />
              </div>

              <Collapsible open={showAdvanced} onOpenChange={setShowAdvanced}>
                <CollapsibleTrigger asChild>
                  <Button
                    type="button"
                    variant="ghost"
                    className={`w-full justify-between ${isDark ? 'text-slate-300 hover:bg-slate-800' : ''}`}
                  >
                    <span>Advanced Settings</span>
                    {showAdvanced ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </Button>
                </CollapsibleTrigger>
                <CollapsibleContent className="space-y-4 pt-4">
                  <div className={`p-4 rounded-xl ${isDark ? 'bg-slate-800' : 'bg-slate-50'}`}>
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <Lock className={`w-5 h-5 ${isDark ? 'text-slate-400' : 'text-slate-600'}`} />
                        <div>
                          <p className={`font-medium ${isDark ? 'text-white' : 'text-slate-900'}`}>Password Protection</p>
                          <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>Require password to access</p>
                        </div>
                      </div>
                      <Switch
                        checked={passwordProtected}
                        onCheckedChange={setPasswordProtected}
                      />
                    </div>
                    {passwordProtected && (
                      <Input
                        type="password"
                        placeholder="Enter password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className={isDark ? 'bg-slate-700 border-slate-600 text-white' : ''}
                      />
                    )}
                  </div>

                  <div className={`p-4 rounded-xl ${isDark ? 'bg-slate-800' : 'bg-slate-50'}`}>
                    <div className="flex items-center gap-3 mb-4">
                      <Calendar className={`w-5 h-5 ${isDark ? 'text-slate-400' : 'text-slate-600'}`} />
                      <div>
                        <p className={`font-medium ${isDark ? 'text-white' : 'text-slate-900'}`}>Expiry Date</p>
                        <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>Link will stop working after this date</p>
                      </div>
                    </div>
                    <Input
                      type="date"
                      value={expiryDate}
                      onChange={(e) => setExpiryDate(e.target.value)}
                      className={isDark ? 'bg-slate-700 border-slate-600 text-white' : ''}
                    />
                  </div>
                </CollapsibleContent>
              </Collapsible>

              <Button
                type="submit"
                disabled={!url || isLoading}
                className="w-full h-14 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white text-lg font-semibold rounded-xl shadow-lg shadow-purple-500/25"
              >
                {isLoading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    Create Shortened Link
                    <ArrowRight className="ml-2 w-5 h-5" />
                  </>
                )}
              </Button>
            </form>
          </Card>
        </div>
      </main>
    </div>
  );
}