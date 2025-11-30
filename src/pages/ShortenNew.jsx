import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import Sidebar from '@/components/Sidebar';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Link2, ChevronDown, ChevronUp, Check, Copy, Lock, Calendar } from 'lucide-react';

export default function ShortenNew() {
  const [logoClicks, setLogoClicks] = useState(0);
  const [url, setUrl] = useState('');
  const [title, setTitle] = useState('');
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [passwordProtected, setPasswordProtected] = useState(false);
  const [password, setPassword] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [copied, setCopied] = useState(false);
  const navigate = useNavigate();

  const handleLogoClick = () => {
    const newCount = logoClicks + 1;
    setLogoClicks(newCount);
    if (newCount >= 10) {
      navigate(createPageUrl('AdminLogin'));
      setLogoClicks(0);
    }
  };

  const generateShortCode = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < 6; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!url) return;

    setIsLoading(true);

    let processedUrl = url;
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      processedUrl = 'https://' + url;
    }

    const shortCode = generateShortCode();
    
    await base44.entities.ShortenedLink.create({
      original_url: processedUrl,
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

    setResult({ shortCode });
    setIsLoading(false);
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(`${window.location.origin}/Redirect?code=${result.shortCode}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const resetForm = () => {
    setUrl('');
    setTitle('');
    setPasswordProtected(false);
    setPassword('');
    setExpiryDate('');
    setResult(null);
    setShowAdvanced(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-950">
      <Sidebar currentPage="ShortenNew" onLogoClick={handleLogoClick} />
      
      <main className="lg:ml-72 p-6 lg:p-10">
        <div className="max-w-2xl mx-auto">
          {/* Header */}
          <div className="mb-8 pt-12 lg:pt-0">
            <h1 className="text-3xl font-bold text-white mb-2">Shorten New Link</h1>
            <p className="text-slate-400">Create a new shortened URL with optional advanced settings</p>
          </div>

          {!result ? (
            <Card className="bg-white/5 border-white/10 backdrop-blur-xl">
              <CardContent className="p-6">
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* URL Input */}
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

                  {/* Title Input */}
                  <div>
                    <Label className="text-slate-300 mb-2 block">Title (optional)</Label>
                    <Input
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="My awesome link"
                      className="h-12 bg-white/5 border-white/10 text-white placeholder:text-slate-500 rounded-xl"
                    />
                  </div>

                  {/* Advanced Settings Toggle */}
                  <button
                    type="button"
                    onClick={() => setShowAdvanced(!showAdvanced)}
                    className="flex items-center gap-2 text-cyan-400 hover:text-cyan-300 transition-colors"
                  >
                    {showAdvanced ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    Advanced Settings
                  </button>

                  {/* Advanced Settings */}
                  {showAdvanced && (
                    <div className="space-y-6 p-5 bg-white/5 rounded-xl border border-white/10">
                      {/* Password Protection */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Lock className="w-5 h-5 text-slate-400" />
                          <div>
                            <p className="text-white font-medium">Password Protection</p>
                            <p className="text-sm text-slate-400">Require password to access link</p>
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
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          placeholder="Enter password"
                          className="h-12 bg-white/5 border-white/10 text-white placeholder:text-slate-500 rounded-xl"
                        />
                      )}

                      {/* Expiry Date */}
                      <div>
                        <div className="flex items-center gap-3 mb-3">
                          <Calendar className="w-5 h-5 text-slate-400" />
                          <div>
                            <p className="text-white font-medium">Expiry Date</p>
                            <p className="text-sm text-slate-400">Link will stop working after this date</p>
                          </div>
                        </div>
                        <Input
                          type="date"
                          value={expiryDate}
                          onChange={(e) => setExpiryDate(e.target.value)}
                          className="h-12 bg-white/5 border-white/10 text-white rounded-xl"
                        />
                      </div>
                    </div>
                  )}

                  {/* Submit Button */}
                  <Button
                    type="submit"
                    disabled={isLoading || !url}
                    className="w-full h-14 bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-400 hover:to-purple-400 text-white font-semibold rounded-xl text-lg"
                  >
                    {isLoading ? (
                      <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      'Create Shortened Link'
                    )}
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
                <p className="text-slate-400 mb-6">Your shortened URL is ready to use</p>

                <div className="bg-white/5 rounded-xl p-4 mb-6 overflow-hidden">
                  <code className="text-sm text-cyan-400 font-mono break-all">
                    {window.location.origin}/Redirect?code={result.shortCode}
                  </code>
                </div>

                <div className="flex gap-3">
                  <Button
                    onClick={copyToClipboard}
                    className="flex-1 bg-white/10 hover:bg-white/20 text-white"
                  >
                    {copied ? (
                      <>
                        <Check className="w-4 h-4 mr-2" /> Copied!
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4 mr-2" /> Copy Link
                      </>
                    )}
                  </Button>
                  <Button
                    onClick={resetForm}
                    className="flex-1 bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-400 hover:to-purple-400"
                  >
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