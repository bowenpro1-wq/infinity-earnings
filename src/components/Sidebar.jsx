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
  Crown } from
'lucide-react';
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
  { name: 'Help', label: 'Help', icon: HelpCircle }];

  return (
    <>
      <Button
        variant="ghost"
        size="icon"
        className="fixed top-4 left-4 z-50 lg:hidden text-white"
        onClick={() => setIsOpen(!isOpen)}>

        {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
      </Button>

      {/* Overlay */}
      {isOpen &&
      <div
        className="fixed inset-0 bg-black/50 z-40 lg:hidden"
        onClick={() => setIsOpen(false)} />

      }

      {/* Sidebar */}
      <aside className={`
        fixed top-0 left-0 h-full w-64 bg-gradient-to-b from-purple-900 via-purple-800 to-purple-900
        transform transition-transform duration-300 ease-in-out z-50
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        lg:translate-x-0 lg:static lg:z-auto
      `}>
        <div className="p-6">
          {/* Logo */}
          <button
            onClick={onLogoClick}
            className="flex items-center gap-3 mb-10 cursor-pointer group">

            <img
              src="https://s3-eu-west-1.amazonaws.com/tpd/logos/5f5fa17054b2610001bcd1f9/0x0.png"
              alt="ShrinkPro"
              className="w-12 h-12 rounded-xl transition-transform group-hover:scale-105"
            />
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
                  className={`
                    flex items-center justify-between px-4 py-3 rounded-xl text-sm font-medium
                    transition-all duration-200 group
                    ${isActive
                      ? 'bg-white text-purple-900 shadow-lg'
                      : 'text-purple-100 hover:bg-purple-700 hover:text-white'}
                    ${item.highlight ? 'bg-yellow-400 text-purple-900 hover:bg-yellow-300' : ''}
                  `}
                  onClick={() => setIsOpen(false)}
                >
                  <div className="flex items-center gap-3">
                    <Icon className="w-5 h-5" />
                    <span>{item.label}</span>
                  </div>
                  <ChevronRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                </Link>
              );
            })}
          </nav>
        </div>
      </aside>
    </>
  );
}