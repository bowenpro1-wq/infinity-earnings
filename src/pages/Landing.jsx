import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Link2, ArrowRight, Zap, Shield, BarChart3, Home, Sparkles, Copy, Check } from "lucide-react";
import { base44 } from '@/api/base44Client';
import { createPageUrl } from '@/utils';

export default function Landing() {
  const [url, setUrl] = useState('');
  const [customAlias, setCustomAlias] = useState('');
  const [shortenedUrl, setShortenedUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSummarizing, setIsSummarizing] = useState(false);
  const [error, setError] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isPro, setIsPro] = useState(false);
  const [copied, setCopied] = useState(false);
  const [aiSummary, setAiSummary] = useState(null);
  const [showAiOption, setShowAiOption] = useState(false);
  const [lastCreatedLink, setLastCreatedLink] = useState(null);

  useEffect(() => {
    const checkAuth = async () => {
      const auth = await base44.auth.isAuthenticated();
      setIsLoggedIn(auth);
      if (auth) {
        const user = await base44.auth.me();
        const settings = await base44.entities.UserSettings.filter({ user_email: user.email });
        if (settings.length > 0 && settings[0].is_pro && new Date(settings[0].pro_expires) > new Date()) {
          setIsPro(true);
        }
      }
    };
    checkAuth();
  }, []);

  const generateShortCode = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < 6; i++) result += chars.charAt(Math.floor(Math.random() * chars.length));
    return result;
  };

  const handleShorten = async () => {
    if (!url) { setError('Please enter a URL'); return; }
    let processedUrl = url;
    if (!url.startsWith('http://') && !url.startsWith('https://')) processedUrl = 'https://' + url;

    setIsLoading(true);
    setError('');
    setAiSummary(null);

    const shortCode = generateShortCode();
    const alias = isPro && customAlias.trim() ? customAlias.trim().replace(/\s+/g, '-') : null;

    const linkData = {
      original_url: processedUrl,
      short_code: shortCode,
      clicks: 0,
      unique_clicks: 0,
      earnings: 0,
      is_active: true
    };
    if (alias) linkData.custom_alias = alias;

    const created = await base44.entities.ShortenedLink.create(linkData);
    setLastCreatedLink(created);

    const baseUrl = window.location.origin;
    const finalUrl = alias
      ? `${baseUrl}/v?=${alias}`
      : `${baseUrl}/Redirect?code=${shortCode}`;
    setShortenedUrl(finalUrl);
    setShowAiOption(true);
    setIsLoading(false);

    // If not logged in, redirect to login
    if (!isLoggedIn) {
      setTimeout(() => {
        window.location.href = '/login';
      }, 3000);
    } else {
      setTimeout(() => {
        window.location.href = createPageUrl('Home');
      }, 3000);
    }
  };

  const handleSummarize = async () => {
    if (!lastCreatedLink) return;
    setIsSummarizing(true);
    try {
      const response = await base44.functions.invoke('summarizeUrl', { url: lastCreatedLink.original_url });
      const data = response.data;
      setAiSummary(data.summary);
      if (lastCreatedLink?.id) {
        await base44.entities.ShortenedLink.update(lastCreatedLink.id, { ai_summary: data.summary });
      }
    } catch(e) {
      setAiSummary('Could not generate summary for this URL.');
    }
    setIsSummarizing(false);
  };

  const copyUrl = () => {
    navigator.clipboard.writeText(shortenedUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-950 relative overflow-hidden">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-500/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-cyan-500/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl" />
      </div>

      <header className="relative z-10 p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <img src="https://s3-eu-west-1.amazonaws.com/tpd/logos/5f5fa17054b2610001bcd1f9/0x0.png" alt="ShrinkPro" className="w-10 h-10 rounded-xl" />
            <span className="text-2xl font-bold text-white tracking-tight">ShrinkPro</span>
          </div>
          {isLoggedIn && (
            <a href={createPageUrl('Home')}>
              <Button className="bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-400 hover:to-purple-400 text-white">
                <Home className="w-4 h-4 mr-2" /> Go to Dashboard
              </Button>
            </a>
          )}
        </div>
      </header>

      <main className="relative z-10 flex flex-col items-center justify-center px-4 pt-16 pb-32">
        <div className="text-center max-w-3xl mx-auto mb-10">
          <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 leading-tight">
            Shorten a URL
            <span className="block bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">Right Now!</span>
          </h1>
          <p className="text-lg text-slate-400 max-w-xl mx-auto">
            Transform long URLs into powerful, trackable short links. Earn money with every click.
          </p>
          {isPro && (
            <div className="inline-flex items-center gap-2 mt-4 px-4 py-2 bg-yellow-500/10 border border-yellow-500/30 rounded-full">
              <span className="text-yellow-400 text-sm font-medium">✨ Pro: Custom aliases enabled</span>
            </div>
          )}
        </div>

        <Card className="w-full max-w-2xl bg-white/5 backdrop-blur-xl border-white/10 p-4 rounded-2xl shadow-2xl">
          <div className="flex flex-col sm:flex-row gap-2">
            <div className="flex-1 relative">
              <Link2 className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <Input
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleShorten()}
                placeholder="Paste your long URL here..."
                className="w-full h-14 pl-12 pr-4 bg-white/10 border-0 text-white placeholder:text-slate-500 rounded-xl text-lg focus-visible:ring-2 focus-visible:ring-cyan-400"
              />
            </div>
            <Button
              onClick={handleShorten}
              disabled={isLoading}
              className="h-14 px-8 bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-400 hover:to-purple-400 text-white font-semibold rounded-xl"
            >
              {isLoading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <>Shorten <ArrowRight className="ml-2 w-5 h-5" /></>}
            </Button>
          </div>

          {isPro && (
            <div className="mt-3">
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-yellow-400 text-sm font-mono">/v?=</span>
                <Input
                  value={customAlias}
                  onChange={(e) => setCustomAlias(e.target.value)}
                  placeholder="your-custom-alias (Pro only)"
                  className="h-11 pl-16 bg-yellow-500/5 border border-yellow-500/20 text-white placeholder:text-slate-600 rounded-xl"
                />
              </div>
            </div>
          )}

          {error && <p className="text-red-400 text-sm mt-3 px-2">{error}</p>}

          {shortenedUrl && (
            <div className="mt-4 p-4 bg-gradient-to-r from-green-500/20 to-emerald-500/20 rounded-xl border border-green-500/30">
              <p className="text-sm text-green-300 mb-2">
                {isLoggedIn ? '✅ Redirecting to dashboard...' : '✅ Link created! Redirecting to login...'}
              </p>
              <div className="flex items-center gap-3">
                <code className="flex-1 text-base text-white font-mono bg-black/30 px-3 py-2 rounded-lg break-all">
                  {shortenedUrl}
                </code>
                <Button onClick={copyUrl} variant="outline" className="border-green-500/50 text-green-300 hover:bg-green-500/20 shrink-0">
                  {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                </Button>
              </div>

              {showAiOption && !aiSummary && (
                <Button
                  onClick={handleSummarize}
                  disabled={isSummarizing}
                  className="mt-3 w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white text-sm"
                >
                  {isSummarizing ? (
                    <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />Generating AI Summary...</>
                  ) : (
                    <><Sparkles className="w-4 h-4 mr-2" />Generate AI Summary of this page</>
                  )}
                </Button>
              )}

              {aiSummary && (
                <div className="mt-3 p-3 bg-purple-500/10 border border-purple-500/20 rounded-xl">
                  <div className="flex items-center gap-2 mb-2">
                    <Sparkles className="w-4 h-4 text-purple-400" />
                    <span className="text-purple-400 text-sm font-medium">AI Summary</span>
                  </div>
                  <p className="text-slate-300 text-sm">{aiSummary}</p>
                </div>
              )}
            </div>
          )}
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-16 max-w-4xl w-full px-4">
          {[
            { icon: Zap, color: 'cyan', title: 'Lightning Fast', desc: 'Instant URL shortening with zero delays' },
            { icon: Shield, color: 'purple', title: 'Secure & Reliable', desc: 'Your links are protected and always available' },
            { icon: BarChart3, color: 'pink', title: 'Earn Money', desc: 'Get paid for every unique click on your links' },
          ].map(({ icon: Icon, color, title, desc }) => (
            <div key={title} className="text-center p-6">
              <div className={`w-14 h-14 bg-${color}-500/20 rounded-2xl flex items-center justify-center mx-auto mb-4`}>
                <Icon className={`w-7 h-7 text-${color}-400`} />
              </div>
              <h3 className="text-white font-semibold text-lg mb-2">{title}</h3>
              <p className="text-slate-400 text-sm">{desc}</p>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}