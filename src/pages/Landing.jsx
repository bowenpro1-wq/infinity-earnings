import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Link2, ArrowRight, Loader2, Copy, Check, ExternalLink } from "lucide-react";
import { base44 } from '@/api/base44Client';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';

export default function Landing() {
  const [url, setUrl] = useState('');
  const [shortUrl, setShortUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const navigate = useNavigate();

  const generateShortCode = () => {
    const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = '';
    for (let i = 0; i < 6; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
  };

  const handleShorten = async () => {
    if (!url) return;
    
    setIsLoading(true);
    const shortCode = generateShortCode();
    
    await base44.entities.ShortenedLink.create({
      original_url: url.startsWith('http') ? url : `https://${url}`,
      short_code: shortCode,
      clicks: 0,
      unique_clicks: 0,
      earnings: 0,
      is_active: true
    });

    setShortUrl(`shrinkpro.xyz/${shortCode}`);
    setIsLoading(false);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(`https://${shortUrl}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleContinue = () => {
    base44.auth.redirectToLogin(createPageUrl('Home'));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wMyI+PGNpcmNsZSBjeD0iMzAiIGN5PSIzMCIgcj0iMiIvPjwvZz48L2c+PC9zdmc+')] opacity-40"></div>
      
      <Card className="w-full max-w-xl bg-white/5 backdrop-blur-xl border-white/10 p-8 md:p-12 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-purple-500/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-500/20 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2"></div>
        
        <div className="relative z-10">
          <div className="flex items-center justify-center mb-8">
            <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-blue-500 rounded-2xl flex items-center justify-center shadow-lg shadow-purple-500/25">
              <Link2 className="w-8 h-8 text-white" />
            </div>
          </div>
          
          <h1 className="text-4xl md:text-5xl font-bold text-center text-white mb-4 tracking-tight">
            shrinkpro<span className="text-purple-400">.xyz</span>
          </h1>
          
          <p className="text-xl md:text-2xl text-center text-white/80 mb-10 font-light">
            Shorten a URL right now!
          </p>

          {!shortUrl ? (
            <div className="space-y-4">
              <div className="relative">
                <Input
                  type="url"
                  placeholder="Enter your long URL here..."
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  className="w-full h-14 bg-white/10 border-white/20 text-white placeholder:text-white/40 rounded-xl px-5 text-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>
              
              <Button
                onClick={handleShorten}
                disabled={!url || isLoading}
                className="w-full h-14 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white text-lg font-semibold rounded-xl shadow-lg shadow-purple-500/25 transition-all duration-300 hover:shadow-xl hover:shadow-purple-500/30"
              >
                {isLoading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    Shorten URL
                    <ArrowRight className="ml-2 w-5 h-5" />
                  </>
                )}
              </Button>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="bg-white/10 rounded-xl p-5 border border-white/20">
                <p className="text-white/60 text-sm mb-2">Your shortened URL:</p>
                <div className="flex items-center gap-3">
                  <p className="text-white text-lg font-medium flex-1 truncate">{shortUrl}</p>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={handleCopy}
                    className="text-white hover:bg-white/10"
                  >
                    {copied ? <Check className="w-5 h-5 text-green-400" /> : <Copy className="w-5 h-5" />}
                  </Button>
                </div>
              </div>

              <div className="flex flex-col gap-3">
                <Button
                  onClick={() => window.open(url.startsWith('http') ? url : `https://${url}`, '_blank')}
                  variant="outline"
                  className="w-full h-12 border-white/20 text-white hover:bg-white/10 rounded-xl"
                >
                  <ExternalLink className="mr-2 w-4 h-4" />
                  Visit Original URL
                </Button>
                
                <Button
                  onClick={handleContinue}
                  className="w-full h-14 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white text-lg font-semibold rounded-xl shadow-lg shadow-purple-500/25"
                >
                  Continue to Dashboard
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </div>
            </div>
          )}

          <p className="text-white/40 text-center text-sm mt-8">
            Create an account to manage your links and earn money
          </p>
        </div>
      </Card>
    </div>
  );
}