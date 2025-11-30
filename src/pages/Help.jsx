import React, { useState, useEffect } from 'react';
import Sidebar from '@/components/Sidebar';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Mail, MessageCircle, HelpCircle, ExternalLink, Copy, Check } from "lucide-react";
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';

export default function Help() {
  const [theme, setTheme] = useState('light');
  const [copied, setCopied] = useState(null);

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

  const handleCopy = (text, id) => {
    navigator.clipboard.writeText(text);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  };

  const isDark = theme === 'dark';

  return (
    <div className={`min-h-screen ${isDark ? 'bg-slate-950' : 'bg-slate-50'}`}>
      <Sidebar currentPage="Help" theme={theme} />
      
      <main className="lg:ml-72 p-6 lg:p-10">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-12">
            <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-blue-500 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-purple-500/25">
              <HelpCircle className="w-10 h-10 text-white" />
            </div>
            <h1 className={`text-3xl font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
              Having trouble with shrinkpro?
            </h1>
            <p className={`text-xl mt-2 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
              Contact us!
            </p>
          </div>

          <div className="space-y-6">
            {/* Primary Email */}
            <Card className={`p-6 ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white'}`}>
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-purple-500/10 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Mail className="w-6 h-6 text-purple-500" />
                </div>
                <div className="flex-1">
                  <h3 className={`font-semibold mb-1 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                    Primary Email
                  </h3>
                  <p className={`text-sm mb-3 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                    Best for general inquiries and support
                  </p>
                  <div className="flex items-center gap-2">
                    <code className={`flex-1 p-3 rounded-lg ${isDark ? 'bg-slate-800 text-white' : 'bg-slate-100'}`}>
                      starproduce@atomicmail.io
                    </code>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => handleCopy('starproduce@atomicmail.io', 'primary')}
                      className={isDark ? 'border-slate-700' : ''}
                    >
                      {copied === 'primary' ? (
                        <Check className="w-4 h-4 text-green-500" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </Button>
                  </div>
                </div>
              </div>
            </Card>

            {/* Secondary Email */}
            <Card className={`p-6 ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white'}`}>
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-blue-500/10 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Mail className="w-6 h-6 text-blue-500" />
                </div>
                <div className="flex-1">
                  <h3 className={`font-semibold mb-1 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                    Secondary Email
                  </h3>
                  <p className={`text-sm mb-3 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                    Alternative contact for urgent matters
                  </p>
                  <div className="flex items-center gap-2">
                    <code className={`flex-1 p-3 rounded-lg ${isDark ? 'bg-slate-800 text-white' : 'bg-slate-100'}`}>
                      starproducer@atomicmail.io
                    </code>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => handleCopy('starproducer@atomicmail.io', 'secondary')}
                      className={isDark ? 'border-slate-700' : ''}
                    >
                      {copied === 'secondary' ? (
                        <Check className="w-4 h-4 text-green-500" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </Button>
                  </div>
                </div>
              </div>
            </Card>

            {/* FAQ Section */}
            <Card className={`p-6 ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white'}`}>
              <h3 className={`font-semibold mb-4 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                Frequently Asked Questions
              </h3>
              <div className="space-y-4">
                <div className={`p-4 rounded-xl ${isDark ? 'bg-slate-800' : 'bg-slate-50'}`}>
                  <p className={`font-medium ${isDark ? 'text-white' : 'text-slate-900'}`}>
                    How do I earn money?
                  </p>
                  <p className={`text-sm mt-1 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                    You earn money when unique visitors click on your shortened links. Each unique IP can only count once per link.
                  </p>
                </div>
                <div className={`p-4 rounded-xl ${isDark ? 'bg-slate-800' : 'bg-slate-50'}`}>
                  <p className={`font-medium ${isDark ? 'text-white' : 'text-slate-900'}`}>
                    How do I withdraw my earnings?
                  </p>
                  <p className={`text-sm mt-1 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                    Go to "Withdraw Payments" and request a withdrawal. You'll receive a verification URL and password to share with the admin.
                  </p>
                </div>
                <div className={`p-4 rounded-xl ${isDark ? 'bg-slate-800' : 'bg-slate-50'}`}>
                  <p className={`font-medium ${isDark ? 'text-white' : 'text-slate-900'}`}>
                    Can I request ads for my links?
                  </p>
                  <p className={`text-sm mt-1 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                    Yes! Go to "Request an Ad" to submit your advertisement request. The admin will review and approve it.
                  </p>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}