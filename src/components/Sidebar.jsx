import React, { useState } from 'react';
import { Link2, Plus, Wallet, Settings, BarChart3, HelpCircle, Megaphone, Menu, X, Link } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Link as RouterLink } from 'react-router-dom';
import { createPageUrl } from '@/utils';

export default function Sidebar({ currentPage, theme, onLogoClick }) {
  const [isOpen, setIsOpen] = useState(false);

  const menuItems = [
    { name: 'My Shortened Links', page: 'MyLinks', icon: Link },
    { name: 'Shorten New Link', page: 'ShortenNew', icon: Plus },
    { name: 'Withdraw Payments', page: 'Withdraw', icon: Wallet },
    { name: 'Settings', page: 'Settings', icon: Settings },
    { name: 'Request an Ad', page: 'RequestAd', icon: Megaphone },
    { name: 'Statistics', page: 'Statistics', icon: BarChart3 },
    { name: 'Help', page: 'Help', icon: HelpCircle },
  ];

  const isDark = theme === 'dark';

  return (
    <>
      {/* Mobile Menu Button */}
      <Button
        variant="ghost"
        size="icon"
        className={`fixed top-4 left-4 z-50 lg:hidden ${isDark ? 'text-white' : 'text-slate-900'}`}
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
      </Button>

      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed left-0 top-0 h-full w-72 z-40 transform transition-transform duration-300 lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        } ${isDark ? 'bg-slate-900 border-r border-slate-800' : 'bg-white border-r border-slate-200'}`}
      >
        <div className="p-6">
          <button
            onClick={onLogoClick}
            className="flex items-center gap-3 mb-10"
          >
            <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-blue-500 rounded-xl flex items-center justify-center shadow-lg shadow-purple-500/25">
              <Link2 className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                shrinkpro<span className="text-purple-500">.xyz</span>
              </h1>
            </div>
          </button>

          <nav className="space-y-2">
            {menuItems.map((item) => (
              <RouterLink
                key={item.page}
                to={createPageUrl(item.page)}
                onClick={() => setIsOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                  currentPage === item.page
                    ? 'bg-gradient-to-r from-purple-500/20 to-blue-500/20 text-purple-500'
                    : isDark
                    ? 'text-slate-400 hover:text-white hover:bg-slate-800'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <item.icon className="w-5 h-5" />
                <span className="font-medium">{item.name}</span>
              </RouterLink>
            ))}
          </nav>
        </div>
      </aside>
    </>
  );
}