import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { 
  Link2, 
  PlusCircle, 
  Wallet, 
  Settings, 
  Megaphone, 
  BarChart3, 
  HelpCircle,
  Menu,
  X,
  ChevronRight,
  Crown
} from 'lucide-react';
import { Button } from "@/components/ui/button";

export default function Sidebar({ currentPage, onLogoClick, clickCount }) {
  const [isOpen, setIsOpen] = useState(false);

  const menuItems = [
    { name: 'MyLinks', label: 'My Shortened Links', icon: Link2 },
    { name: 'ShortenNew', label: 'Shorten New Link', icon: PlusCircle },
    { name: 'Withdraw', label: 'Withdraw Payments', icon: Wallet },
    { name: 'GoPro', label: 'Go Pro', icon: Crown, highlight: true },
    { name: 'Settings', label: 'Settings', icon: Settings },
    { name: 'RequestAd', label: 'Request an Ad', icon: Megaphone },
    { name: 'Statistics', label: 'Statistics', icon: BarChart3 },
    { name: 'Help', label: 'Help', icon: HelpCircle },
  ];

  return (
    <>
      {/* Mobile menu button */}
      <Button
        variant="ghost"
        size="icon"
        className="fixed top-4 left-4 z-50 lg:hidden text-white"
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
      <aside className={`
        fixed top-0 left-0 h-full w-72 bg-slate-900/95 backdrop-blur-xl border-r border-white/10
        transform transition-transform duration-300 ease-out z-50
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        lg:translate-x-0
      `}>
        <div className="p-6">
          {/* Logo */}
          <button 
            onClick={onLogoClick}
            className="flex items-center gap-3 mb-10 cursor-pointer group"
          >
            <img 
              src="https://s3-eu-west-1.amazonaws.com/tpd/logos/5f5fa17054b2610001bcd1f9/0x0.png" 
              alt="ShrinkPro" 
              className="w-12 h-12 rounded-xl transition-transform group-hover:scale-105"
            />
            <div>
              <span className="text-xl font-bold text-white block">ShrinkPro</span>
              <span className="text-xs text-slate-500">URL Shortener</span>
            </div>
          </button>

          {/* Navigation */}
          <nav className="space-y-2">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentPage === item.name;
              
              return (
                <Link
                  key={item.name}
                  to={createPageUrl(item.name)}
                  onClick={() => setIsOpen(false)}
                  className={`
                    flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200
                    ${isActive 
                      ? 'bg-gradient-to-r from-cyan-500/20 to-purple-500/20 text-white border border-white/10' 
                      : item.highlight 
                        ? 'text-yellow-400 hover:text-yellow-300 hover:bg-yellow-500/10 border border-yellow-500/20'
                        : 'text-slate-400 hover:text-white hover:bg-white/5'
                    }
                  `}
                >
                  <Icon className={`w-5 h-5 ${isActive ? 'text-cyan-400' : item.highlight ? 'text-yellow-400' : ''}`} />
                  <span className="font-medium">{item.label}</span>
                  {isActive && <ChevronRight className="w-4 h-4 ml-auto text-cyan-400" />}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Bottom section */}
        <div className="absolute bottom-0 left-0 right-0 p-6 border-t border-white/10">
          <div className="text-center text-sm text-slate-500">
            <p>© 2024 ShrinkPro</p>
            <p className="text-xs mt-1">Version 1.0.0</p>
          </div>
        </div>
      </aside>
    </>
  );
}