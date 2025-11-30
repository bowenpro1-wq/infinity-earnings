import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Link2, ArrowRight, Zap, Shield, BarChart3, Home } from "lucide-react";
import { base44 } from '@/api/base44Client';
import { createPageUrl } from '@/utils';

export default function Landing() {
  const [url, setUrl] = useState('');
  const [shortenedUrl, setShortenedUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      const auth = await base44.auth.isAuthenticated();
      setIsLoggedIn(auth);
    };
    checkAuth();
  }, []);

  const generateShortCode = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < 6; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  };

  const handleShorten = async () => {
    if (!url) {
      setError('Please enter a URL');
      return;
    }

    let processedUrl = url;
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      processedUrl = 'https://' + url;
    }

    setIsLoading(true);
    setError('');

    const shortCode = generateShortCode();
    
    await base44.entities.ShortenedLink.create({
      original_url: processedUrl,
      short_code: shortCode,
      clicks: 0,
      unique_clicks: 0,
      earnings: 0,
      is_active: true
    });

    const baseUrl = window.location.origin;
    setShortenedUrl(`${baseUrl}/Redirect?code=${shortCode}`);
    setIsLoading(false);
  };

  const handleVisit = () => {
    window.location.href = createPageUrl('Home');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-950 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-500/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-cyan-500/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl" />
      </div>

      {/* Header */}
      <header className="relative z-10 p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <img 
              src="https://s3-eu-west-1.amazonaws.com/tpd/logos/5f5fa17054b2610001bcd1f9/0x0.png" 
              alt="ShrinkPro" 
              className="w-10 h-10 rounded-xl"
            />
            <span className="text-2xl font-bold text-white tracking-tight">ShrinkPro</span>
          </div>
          {isLoggedIn && (
            <a href={createPageUrl('Home')}>
              <Button
                className="bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-400 hover:to-purple-400 text-white"
              >
                <Home className="w-4 h-4 mr-2" />
                Go to Dashboard
              </Button>
            </a>
          )}
        </div>
      </header>

      {/* Main content */}
      <main className="relative z-10 flex flex-col items-center justify-center px-4 pt-20 pb-32">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 leading-tight">
            Shorten a URL
            <span className="block bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
              Right Now!
            </span>
          </h1>
          <p className="text-lg text-slate-400 max-w-xl mx-auto">
            Transform long URLs into powerful, trackable short links. Earn money with every click.
          </p>
        </div>

        {/* URL Input Card */}
        <Card className="w-full max-w-2xl bg-white/5 backdrop-blur-xl border-white/10 p-2 rounded-2xl shadow-2xl">
          <div className="flex flex-col sm:flex-row gap-2">
            <div className="flex-1 relative">
              <Link2 className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <Input
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="Paste your long URL here..."
                className="w-full h-14 pl-12 pr-4 bg-white/10 border-0 text-white placeholder:text-slate-500 rounded-xl text-lg focus-visible:ring-2 focus-visible:ring-cyan-400"
              />
            </div>
            <Button
              onClick={handleShorten}
              disabled={isLoading}
              className="h-14 px-8 bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-400 hover:to-purple-400 text-white font-semibold rounded-xl transition-all duration-300 shadow-lg shadow-purple-500/25"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  Shorten <ArrowRight className="ml-2 w-5 h-5" />
                </>
              )}
            </Button>
          </div>

          {error && (
            <p className="text-red-400 text-sm mt-3 px-2">{error}</p>
          )}

          {shortenedUrl && (
            <div className="mt-4 p-4 bg-gradient-to-r from-green-500/20 to-emerald-500/20 rounded-xl border border-green-500/30">
              <p className="text-sm text-green-300 mb-2">Your shortened URL is ready!</p>
              <div className="flex items-center gap-3">
                <code className="flex-1 text-lg text-white font-mono bg-black/30 px-4 py-2 rounded-lg">
                  {shortenedUrl}
                </code>
                <Button
                  onClick={() => navigator.clipboard.writeText(shortenedUrl)}
                  variant="outline"
                  className="border-green-500/50 text-green-300 hover:bg-green-500/20"
                >
                  Copy
                </Button>
              </div>
              <Button
                onClick={handleVisit}
                className="mt-4 w-full bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-400 hover:to-emerald-400 text-white"
              >
                Continue to Dashboard
              </Button>
            </div>
          )}
        </Card>

        {/* Features */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-20 max-w-4xl w-full px-4">
          <div className="text-center p-6">
            <div className="w-14 h-14 bg-cyan-500/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Zap className="w-7 h-7 text-cyan-400" />
            </div>
            <h3 className="text-white font-semibold text-lg mb-2">Lightning Fast</h3>
            <p className="text-slate-400 text-sm">Instant URL shortening with zero delays</p>
          </div>
          <div className="text-center p-6">
            <div className="w-14 h-14 bg-purple-500/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Shield className="w-7 h-7 text-purple-400" />
            </div>
            <h3 className="text-white font-semibold text-lg mb-2">Secure & Reliable</h3>
            <p className="text-slate-400 text-sm">Your links are protected and always available</p>
          </div>
          <div className="text-center p-6">
            <div className="w-14 h-14 bg-pink-500/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <BarChart3 className="w-7 h-7 text-pink-400" />
            </div>
            <h3 className="text-white font-semibold text-lg mb-2">Earn Money</h3>
            <p className="text-slate-400 text-sm">Get paid for every unique click on your links</p>
          </div>
        </div>
      </main>
    </div>
  );
}