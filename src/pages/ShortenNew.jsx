import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import Sidebar from '@/components/Sidebar';
import { base44 } from '@/api/base44Client';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Link2, ChevronDown, ChevronUp, Check, Copy, Lock, Calendar, Sparkles, Crown } from 'lucide-react';

export default function ShortenNew() {
  const [logoClicks, setLogoClicks] = useState(0);
  const [url, setUrl] = useState('');
  const [title, setTitle] = useState('');
  const [customAlias, setCustomAlias] = useState('');
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [passwordProtected, setPasswordProtected] = useState(false);
  const [password, setPassword] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSummarizing, setIsSummarizing] = useState(false);
  const [result, setResult] = useState(null);
  const [copied, setCopied] = useState(false);
  const [isPro, setIsPro] = useState(false);
  const [aiSummary, setAiSummary] = useState(null);
  const [lastCreatedId, setLastCreatedId] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const checkPro = async () => {
      const user = await base44.auth.me();
      const settings = await base44.entities.UserSettings.filter({ user_email: user.email });
      if (settings.length > 0 && settings[0].is_pro && new Date(settings[0].pro_expires) > new Date()) {
        setIsPro(true);
      }
    };
    checkPro();
  }, []);

  const handleLogoClick = () => {
    const newCount = logoClicks + 1;
    setLogoClicks(newCount);
    if (newCount >= 10) { navigate(createPageUrl('AdminLogin')); setLogoClicks(0); }
  };

  const generateShortCode = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let r = '';
    for (let i = 0; i < 6; i++) r += chars.charAt(Math.floor(Math.random() * chars.length));
    return r;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!url) return;
    setIsLoading(true);

    let processedUrl = url;
    if (!url.startsWith('http://') && !url.startsWith('https://')) processedUrl = 'https://' + url;

    const shortCode = generateShortCode();
    const alias = isPro && customAlias.trim() ? customAlias.trim().replace(/\s+/g, '-') : null;

    const created = await base44.entities.ShortenedLink.create({
      original_url: processedUrl,
      short_code: shortCode,
      custom_alias: alias || undefined,
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

    setLastCreatedId(created.id);
    setResult({ shortCode, alias });
    setIsLoading(false);
  };

  const handleSummarize = async () => {
    if (!url) return;
    setIsSummarizing(true);
    try {
      let processedUrl = url;
      if (!url.startsWith('http://') && !url.startsWith('https://')) processedUrl = 'https://' + url;
      const response = await base44.functions.invoke('summarizeUrl', { url: processedUrl });
      const data = response.data;
      setAiSummary(data.summary);
      if (lastCreatedId) {
        await base44.entities.ShortenedLink.update(lastCreatedId, { ai_summary: data.summary });
      }
    } catch(e) {
      setAiSummary('Could not generate a summary for this URL.');
    }
    setIsSummarizing(false);
  };

  const copyToClipboard = () => {
    const shortUrl = result.alias
      ? `${window.location.origin}/v?=${result.alias}`
      : `${window.location.origin}/Redirect?code=${result.shortCode}`;
    navigator.clipboard.writeText(shortUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getShortUrl = () => result?.alias
    ? `${window.location.origin}/v?=${result.alias}`
    : `${window.location.origin}/Redirect?code=${result?.shortCode}`;

  const resetForm = () => {
    setUrl(''); setTitle(''); setCustomAlias(''); setPasswordProtected(false);
    setPassword(''); setExpiryDate(''); setResult(null); setShowAdvanced(false);
    setAiSummary(null); setLastCreatedId(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-950">
      <Sidebar currentPage="ShortenNew" onLogoClick={handleLogoClick} />
      <main className="lg:ml-72 p-6 lg:p-10">
        <div className="max-w-2xl mx-auto">
          <div className="mb-8 pt-12 lg:pt-0">
            <h1 className="text-3xl font-bold text-white mb-2">Shorten New Link</h1>
            <p className="text-slate-400">Create a new shortened URL with optional advanced settings</p>
          </div>

          {!result ? (
            <Card className="bg-white/5 border-white/10 backdrop-blur-xl">
              <CardContent className="p-6">
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <Label className="text-slate-300 mb-2 block">URL to shorten *</Label>
                    <div className="relative">
                      <Link2 className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                      <Input
                        value={url}
                        onChange={(e) => setUrl(e.target.value)}
                        placeholder="https://example.com/very-long-url"
                        required
                        className="pl-12 h-14 bg-white/5 border-white/10 text-white placeholder:text-slate-500 rounded-xl text-lg"
                      />
                    </div>
                  </div>

                  <div>
                    <Label className="text-slate-300 mb-2 block">Title (optional)</Label>
                    <Input
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="My awesome link"
                      className="h-12 bg-white/5 border-white/10 text-white placeholder:text-slate-500 rounded-xl"
                    />
                  </div>

                  {isPro && (
                    <div>
                      <Label className="text-slate-300 mb-2 block flex items-center gap-2">
                        <Crown className="w-4 h-4 text-yellow-400" />
                        Custom Alias <span className="text-yellow-400 text-xs">(Pro)</span>
                      </Label>
                      <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-yellow-400 text-sm font-mono">/v?=</span>
                        <Input
                          value={customAlias}
                          onChange={(e) => setCustomAlias(e.target.value)}
                          placeholder="my-custom-link"
                          className="pl-16 h-12 bg-yellow-500/5 border border-yellow-500/20 text-white placeholder:text-slate-600 rounded-xl"
                        />
                      </div>
                    </div>
                  )}

                  <button type="button" onClick={() => setShowAdvanced(!showAdvanced)} className="flex items-center gap-2 text-cyan-400 hover:text-cyan-300">
                    {showAdvanced ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    Advanced Settings
                  </button>

                  {showAdvanced && (
                    <div className="space-y-6 p-5 bg-white/5 rounded-xl border border-white/10">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Lock className="w-5 h-5 text-slate-400" />
                          <div>
                            <p className="text-white font-medium">Password Protection</p>
                            <p className="text-sm text-slate-400">Require password to access link</p>
                          </div>
                        </div>
                        <Switch checked={passwordProtected} onCheckedChange={setPasswordProtected} />
                      </div>
                      {passwordProtected && (
                        <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Enter password" className="h-12 bg-white/5 border-white/10 text-white placeholder:text-slate-500 rounded-xl" />
                      )}
                      <div>
                        <div className="flex items-center gap-3 mb-3">
                          <Calendar className="w-5 h-5 text-slate-400" />
                          <div>
                            <p className="text-white font-medium">Expiry Date</p>
                            <p className="text-sm text-slate-400">Link stops working after this date</p>
                          </div>
                        </div>
                        <Input type="date" value={expiryDate} onChange={(e) => setExpiryDate(e.target.value)} className="h-12 bg-white/5 border-white/10 text-white rounded-xl" />
                      </div>
                    </div>
                  )}

                  <Button type="submit" disabled={isLoading || !url} className="w-full h-14 bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-400 hover:to-purple-400 text-white font-semibold rounded-xl text-lg">
                    {isLoading ? <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : 'Create Shortened Link'}
                  </Button>
                </form>
              </CardContent>
            </Card>
          ) : (
            <Card className="bg-white/5 border-white/10 backdrop-blur-xl">
              <CardContent className="p-8 text-center">
                <div className="w-20 h-20 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Check className="w-10 h-10 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-white mb-2">Link Created!</h2>
                {result.alias && <p className="text-yellow-400 text-sm mb-2">✨ Custom alias active</p>}
                <p className="text-slate-400 mb-6">Your shortened URL is ready to use</p>

                <div className="bg-white/5 rounded-xl p-4 mb-6 overflow-hidden">
                  <code className="text-sm text-cyan-400 font-mono break-all">{getShortUrl()}</code>
                </div>

                {/* AI Summary */}
                {!aiSummary ? (
                  <Button
                    onClick={handleSummarize}
                    disabled={isSummarizing}
                    className="w-full mb-4 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white"
                  >
                    {isSummarizing ? (
                      <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />Generating AI Summary...</>
                    ) : (
                      <><Sparkles className="w-4 h-4 mr-2" />Generate AI Summary</>
                    )}
                  </Button>
                ) : (
                  <div className="mb-4 p-4 bg-purple-500/10 border border-purple-500/20 rounded-xl text-left">
                    <div className="flex items-center gap-2 mb-2">
                      <Sparkles className="w-4 h-4 text-purple-400" />
                      <span className="text-purple-400 text-sm font-medium">AI Summary</span>
                    </div>
                    <p className="text-slate-300 text-sm">{aiSummary}</p>
                  </div>
                )}

                <div className="flex gap-3">
                  <Button onClick={copyToClipboard} className="flex-1 bg-white/10 hover:bg-white/20 text-white">
                    {copied ? <><Check className="w-4 h-4 mr-2" />Copied!</> : <><Copy className="w-4 h-4 mr-2" />Copy Link</>}
                  </Button>
                  <Button onClick={resetForm} className="flex-1 bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-400 hover:to-purple-400">
                    Create Another
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </main>
    </div>
  );
}