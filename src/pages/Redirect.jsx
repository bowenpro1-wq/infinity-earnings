import React, { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Link2, AlertCircle, Clock } from 'lucide-react';
import { Card, CardContent } from "@/components/ui/card";

export default function Redirect() {
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [countdown, setCountdown] = useState(0);
  const [waitMessage, setWaitMessage] = useState('Please wait...');
  const [targetUrl, setTargetUrl] = useState('');

  useEffect(() => {
    const handleRedirect = async () => {
      const urlParams = new URLSearchParams(window.location.search);
      const code = urlParams.get('code');

      if (!code) {
        setError('No link code provided');
        setLoading(false);
        return;
      }

      const links = await base44.entities.ShortenedLink.filter({ short_code: code });

      if (links.length === 0) {
        setError('Link not found');
        setLoading(false);
        return;
      }

      const link = links[0];

      if (!link.is_active) {
        setError('This link is no longer active');
        setLoading(false);
        return;
      }

      // Update click count
      await base44.entities.ShortenedLink.update(link.id, {
        clicks: (link.clicks || 0) + 1
      });

      // Check for active popup ad to get wait time
      const popupAds = await base44.entities.Advertisement.filter({ ad_type: 'popup', is_active: true });
      
      if (popupAds.length > 0) {
        const ad = popupAds[0];
        const delaySeconds = ad.delay_seconds || 5;
        
        setWaitMessage(ad.wait_message || 'Please wait...');
        setCountdown(delaySeconds);
        setTargetUrl(link.original_url);
        setLoading(false);

        // Start countdown
        const countdownInterval = setInterval(() => {
          setCountdown(prev => {
            if (prev <= 1) {
              clearInterval(countdownInterval);
              // Open ad in new tab
              window.open(ad.target_url, '_blank');
              // Redirect to original URL
              window.location.href = link.original_url;
              return 0;
            }
            return prev - 1;
          });
        }, 1000);
      } else {
        // No ad, redirect immediately
        window.location.href = link.original_url;
      }
    };

    handleRedirect();
  }, []);

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-950 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-8 h-8 text-red-400" />
          </div>
          <h1 className="text-xl font-bold text-white mb-2">Error</h1>
          <p className="text-slate-400">{error}</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-950 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-br from-cyan-400 to-purple-500 rounded-2xl flex items-center justify-center mx-auto mb-4 animate-pulse">
            <Link2 className="w-8 h-8 text-white" />
          </div>
          <p className="text-white">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-950 flex items-center justify-center p-4">
      <Card className="bg-white/10 border-white/20 backdrop-blur-xl max-w-md w-full">
        <CardContent className="p-8 text-center">
          <div className="w-20 h-20 bg-gradient-to-br from-cyan-400 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-6">
            <Clock className="w-10 h-10 text-white" />
          </div>
          <p className="text-xl text-white font-medium mb-6">{waitMessage}</p>
          <div className="text-6xl font-bold text-cyan-400 mb-2">{countdown}</div>
          <p className="text-slate-400 text-sm mb-6">seconds remaining</p>
          <div className="w-full bg-white/10 rounded-full h-2 overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-cyan-400 to-purple-500 transition-all duration-1000"
              style={{ width: `${(countdown / 10) * 100}%` }}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}