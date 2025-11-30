import React, { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';

export default function Layout({ children }) {
  const [theme, setTheme] = useState('dark');

  useEffect(() => {
    const loadTheme = async () => {
      try {
        const isAuth = await base44.auth.isAuthenticated();
        if (isAuth) {
          const user = await base44.auth.me();
          const settings = await base44.entities.UserSettings.filter({ user_email: user.email });
          if (settings.length > 0 && settings[0].theme) {
            setTheme(settings[0].theme);
          }
        }
      } catch (e) {
        // Not logged in, use default
      }
    };
    loadTheme();
  }, []);

  return (
    <div className={theme === 'light' ? 'light-theme' : 'dark-theme'}>
      <style>{`
        .light-theme {
          --bg-primary: #f8fafc;
          --bg-secondary: #e2e8f0;
          --text-primary: #0f172a;
          --text-secondary: #475569;
        }
        .dark-theme {
          --bg-primary: #0f172a;
          --bg-secondary: #1e293b;
          --text-primary: #f8fafc;
          --text-secondary: #94a3b8;
        }
        .light-theme .min-h-screen {
          background: linear-gradient(135deg, #f8fafc 0%, #e0e7ff 50%, #f8fafc 100%) !important;
        }
        .light-theme .bg-gradient-to-br.from-slate-950 {
          background: linear-gradient(135deg, #f8fafc 0%, #e0e7ff 50%, #f8fafc 100%) !important;
        }
        .light-theme .bg-white\\/5 {
          background-color: rgba(0, 0, 0, 0.05) !important;
        }
        .light-theme .bg-white\\/10 {
          background-color: rgba(0, 0, 0, 0.08) !important;
        }
        .light-theme .border-white\\/10 {
          border-color: rgba(0, 0, 0, 0.1) !important;
        }
        .light-theme .border-white\\/20 {
          border-color: rgba(0, 0, 0, 0.15) !important;
        }
        .light-theme .text-white {
          color: #0f172a !important;
        }
        .light-theme .text-slate-400 {
          color: #64748b !important;
        }
        .light-theme .text-slate-500 {
          color: #64748b !important;
        }
        .light-theme .bg-slate-900 {
          background-color: #f1f5f9 !important;
        }
        .light-theme .bg-slate-900\\/95 {
          background-color: rgba(241, 245, 249, 0.95) !important;
        }
        .light-theme aside {
          background-color: rgba(241, 245, 249, 0.95) !important;
        }
      `}</style>
      {children}
    </div>
  );
}