import React, { useEffect, useState, useRef } from 'react';
import { base44 } from '@/api/base44Client';
import { Link2, AlertCircle, Clock } from 'lucide-react';
import { Card, CardContent } from "@/components/ui/card";

const EARNINGS_PER_UNIQUE_CLICK = 0.04;

export default function Redirect() {
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [countdown, setCountdown] = useState(0);
  const [waitMessage, setWaitMessage] = useState('Please wait...');
  const [currentStep, setCurrentStep] = useState(0);
  const [totalSteps, setTotalSteps] = useState(0);
  const processedRef = useRef(false);

  useEffect(() => {
    if (processedRef.current) return;
    processedRef.current = true;

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

      // Get visitor IP for unique tracking
      let visitorIp = 'unknown';
      try {
        const ipResponse = await fetch('https://api.ipify.org?format=json');
        const ipData = await ipResponse.json();
        visitorIp = ipData.ip;
      } catch (e) {
        console.log('Could not get IP');
      }

      // Check if this IP already clicked today
      const today = new Date().toISOString().split('T')[0];
      const existingClicks = await base44.entities.ClickLog.filter({ 
        link_id: link.id, 
        ip_address: visitorIp 
      });
      
      const clickedToday = existingClicks.some(click => 
        click.created_date && click.created_date.startsWith(today)
      );

      // Update click count
      const updates = {
        clicks: (link.clicks || 0) + 1
      };

      // If unique click today, add earnings
      if (!clickedToday) {
        updates.unique_clicks = (link.unique_clicks || 0) + 1;
        updates.earnings = (link.earnings || 0) + EARNINGS_PER_UNIQUE_CLICK;
        
        // Log this click
        await base44.entities.ClickLog.create({
          link_id: link.id,
          ip_address: visitorIp
        });
      }

      await base44.entities.ShortenedLink.update(link.id, updates);

      // Check for active popup ad
      const popupAds = await base44.entities.Advertisement.filter({ ad_type: 'popup', is_active: true });
      
      if (popupAds.length > 0) {
        const ad = popupAds[0];
        const waitTimes = ad.wait_times || [5];
        
        setWaitMessage(ad.wait_message || 'Please wait...');
        setTotalSteps(waitTimes.length);
        setLoading(false);

        // Process each wait time sequentially
        for (let i = 0; i < waitTimes.length; i++) {
          setCurrentStep(i + 1);
          setCountdown(waitTimes[i]);
          
          // Countdown for this step
          await new Promise(resolve => {
            let remaining = waitTimes[i];
            const interval = setInterval(() => {
              remaining--;
              setCountdown(remaining);
              if (remaining <= 0) {
                clearInterval(interval);
                resolve();
              }
            }, 1000);
          });
          
          // Open ad in new tab after each wait
          window.open(ad.target_url, '_blank');
        }
        
        // After all steps, redirect to original URL
        window.location.href = link.original_url;
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
          <p className="text-xl text-white font-medium mb-4">{waitMessage}</p>
          {totalSteps > 1 && (
            <p className="text-slate-400 text-sm mb-4">Step {currentStep} of {totalSteps}</p>
          )}
          <div className="text-6xl font-bold text-cyan-400 mb-2">{countdown}</div>
          <p className="text-slate-400 text-sm mb-6">seconds remaining</p>
          <div className="w-full bg-white/10 rounded-full h-2 overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-cyan-400 to-purple-500 transition-all duration-1000"
              style={{ width: `${(countdown / 10) * 100}%` }}
            />
          </div>
          {totalSteps > 1 && (
            <div className="flex justify-center gap-2 mt-4">
              {Array.from({ length: totalSteps }).map((_, i) => (
                <div 
                  key={i}
                  className={`w-3 h-3 rounded-full ${i < currentStep ? 'bg-cyan-400' : 'bg-white/20'}`}
                />
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}