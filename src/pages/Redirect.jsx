import React, { useEffect, useState, useRef } from 'react';
import { base44 } from '@/api/base44Client';
import { Link2, AlertCircle, Clock } from 'lucide-react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const EARNINGS_PER_UNIQUE_CLICK = 0.04;
const PRO_EARNINGS_PER_UNIQUE_CLICK = 0.05;

export default function Redirect() {
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [countdown, setCountdown] = useState(0);
  const [waitMessage, setWaitMessage] = useState('Please wait...');
  const [currentStep, setCurrentStep] = useState(0);
  const [totalSteps, setTotalSteps] = useState(0);
  const [currentStepData, setCurrentStepData] = useState(null);
  const [waitingForButton, setWaitingForButton] = useState(false);
  const [allSteps, setAllSteps] = useState([]);
  const processedRef = useRef(false);
  const resolveButtonRef = useRef(null);

  useEffect(() => {
    if (processedRef.current) return;
    processedRef.current = true;
    handleRedirect();
  }, []);

  const handleRedirect = async () => {
    const urlParams = new URLSearchParams(window.location.search);
    // Support both ?code= and /v?= (custom alias via query param "=")
    const code = urlParams.get('code');
    const alias = urlParams.get('='); // /v?=myalias maps to ?== myalias

    let link = null;

    if (code) {
      const links = await base44.entities.ShortenedLink.filter({ short_code: code });
      link = links[0] || null;
    } else if (alias) {
      const links = await base44.entities.ShortenedLink.filter({ custom_alias: alias });
      link = links[0] || null;
    }

    if (!link) {
      setError('Link not found');
      setLoading(false);
      return;
    }

    if (!link.is_active) {
      setError('This link is no longer active');
      setLoading(false);
      return;
    }

    // Check expiry
    if (link.advanced_settings?.expiry_date && new Date(link.advanced_settings.expiry_date) < new Date()) {
      setError('This link has expired');
      setLoading(false);
      return;
    }

    // Password protection
    if (link.advanced_settings?.password_protected && link.advanced_settings?.password) {
      const enteredPw = prompt('This link is password protected. Enter password:');
      if (enteredPw !== link.advanced_settings.password) {
        setError('Incorrect password');
        setLoading(false);
        return;
      }
    }

    // Get visitor IP
    let visitorIp = 'unknown';
    try {
      const ipResponse = await fetch('https://api.ipify.org?format=json');
      const ipData = await ipResponse.json();
      visitorIp = ipData.ip;
    } catch (e) { }

    // Check app settings for IP limit
    let maxEarnsPerDay = 1;
    let ipLimitEnabled = true;
    try {
      const settings = await base44.entities.AppSettings.filter({ setting_key: 'global' });
      if (settings.length > 0) {
        ipLimitEnabled = settings[0].ip_limit_enabled !== false;
        maxEarnsPerDay = settings[0].max_earns_per_ip_per_day || 1;
      }
    } catch(e) {}

    // Count today's earnings for this IP
    const today = new Date().toISOString().split('T')[0];
    let earnsToday = 0;
    let clickedThisLink = false;

    if (ipLimitEnabled) {
      const existingClicks = await base44.entities.ClickLog.filter({ ip_address: visitorIp });
      const todayClicks = existingClicks.filter(c => c.created_date && c.created_date.startsWith(today));
      earnsToday = todayClicks.length;
      clickedThisLink = existingClicks.some(c => c.link_id === link.id && c.created_date && c.created_date.startsWith(today));
    }

    // Determine earnings
    let earningsRate = EARNINGS_PER_UNIQUE_CLICK;
    if (link.created_by) {
      const ownerSettings = await base44.entities.UserSettings.filter({ user_email: link.created_by });
      if (ownerSettings.length > 0 && ownerSettings[0].is_pro && new Date(ownerSettings[0].pro_expires) > new Date()) {
        earningsRate = PRO_EARNINGS_PER_UNIQUE_CLICK;
      }
    }

    const canEarn = !ipLimitEnabled || (!clickedThisLink && earnsToday < maxEarnsPerDay);

    const updates = { clicks: (link.clicks || 0) + 1 };
    if (canEarn) {
      updates.unique_clicks = (link.unique_clicks || 0) + 1;
      updates.earnings = (link.earnings || 0) + earningsRate;
      await base44.entities.ClickLog.create({ link_id: link.id, ip_address: visitorIp });
    }

    await base44.entities.ShortenedLink.update(link.id, updates);

    // Check for active popup ad
    const popupAds = await base44.entities.Advertisement.filter({ ad_type: 'popup', is_active: true });

    if (popupAds.length > 0) {
      const ad = popupAds[0];
      const waitSteps = ad.wait_steps || [{ wait_time: 5, target_url: ad.target_url }];

      setWaitMessage(ad.wait_message || 'Please wait...');
      setTotalSteps(waitSteps.length);
      setAllSteps(waitSteps);
      setLoading(false);

      for (let i = 0; i < waitSteps.length; i++) {
        const step = waitSteps[i];
        setCurrentStep(i + 1);
        setCurrentStepData(step);
        setCountdown(step.wait_time || 5);
        setWaitingForButton(false);

        await new Promise(resolve => {
          let remaining = step.wait_time || 5;
          const interval = setInterval(() => {
            remaining--;
            setCountdown(remaining);
            if (remaining <= 0) { clearInterval(interval); resolve(); }
          }, 1000);
        });

        if (step.target_url) window.open(step.target_url, '_blank');

        if (step.require_button && step.button_text) {
          setWaitingForButton(true);
          await new Promise(resolve => { resolveButtonRef.current = resolve; });
          setWaitingForButton(false);
        }
      }
      window.location.href = link.original_url;
    } else {
      window.location.href = link.original_url;
    }
  };

  const handleButtonClick = () => {
    if (currentStepData?.button_url) window.open(currentStepData.button_url, '_blank');
    if (resolveButtonRef.current) { resolveButtonRef.current(); resolveButtonRef.current = null; }
    setWaitingForButton(false);
  };

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
          {totalSteps > 1 && <p className="text-slate-400 text-sm mb-4">Step {currentStep} of {totalSteps}</p>}

          {waitingForButton ? (
            <div className="space-y-4">
              <p className="text-yellow-400 text-sm">Click the button below to continue</p>
              <Button onClick={handleButtonClick} className="bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-400 hover:to-purple-400 text-white font-semibold px-8 py-3">
                {currentStepData?.button_text || 'Continue'}
              </Button>
            </div>
          ) : (
            <>
              <div className="text-6xl font-bold text-cyan-400 mb-2">{countdown}</div>
              <p className="text-slate-400 text-sm mb-6">seconds remaining</p>
              <div className="w-full bg-white/10 rounded-full h-2 overflow-hidden">
                <div className="h-full bg-gradient-to-r from-cyan-400 to-purple-500 transition-all duration-1000" style={{ width: `${(countdown / (currentStepData?.wait_time || 10)) * 100}%` }} />
              </div>
              {currentStepData?.button_text && !currentStepData?.require_button && countdown > 0 && (
                <Button onClick={() => { if (currentStepData?.button_url) window.open(currentStepData.button_url, '_blank'); }} variant="outline" className="mt-4 border-white/30 text-white hover:bg-white/10">
                  {currentStepData.button_text}
                </Button>
              )}
            </>
          )}

          {totalSteps > 1 && (
            <div className="flex justify-center gap-2 mt-4">
              {Array.from({ length: totalSteps }).map((_, i) => (
                <div key={i} className={`w-3 h-3 rounded-full ${i < currentStep ? 'bg-cyan-400' : 'bg-white/20'}`} />
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}