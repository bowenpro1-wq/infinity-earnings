import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import Sidebar from '@/components/Sidebar';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Crown, Check, Sparkles, DollarSign, Zap, AlertCircle } from 'lucide-react';

export default function GoPro() {
  const [logoClicks, setLogoClicks] = useState(0);
  const [promoCode, setPromoCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [user, setUser] = useState(null);
  const [userSettings, setUserSettings] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const loadData = async () => {
      const userData = await base44.auth.me();
      setUser(userData);
      const settings = await base44.entities.UserSettings.filter({ user_email: userData.email });
      if (settings.length > 0) {
        setUserSettings(settings[0]);
      }
    };
    loadData();
  }, []);

  const handleLogoClick = () => {
    const newCount = logoClicks + 1;
    setLogoClicks(newCount);
    if (newCount >= 10) {
      navigate(createPageUrl('AdminLogin'));
      setLogoClicks(0);
    }
  };

  const handleRedeem = async () => {
    if (!promoCode.trim()) {
      setError('Please enter a promo code');
      return;
    }

    setIsLoading(true);
    setError('');

    const codes = await base44.entities.PromoCode.filter({ code: promoCode.trim().toUpperCase() });
    
    if (codes.length === 0) {
      setError('Invalid promo code');
      setIsLoading(false);
      return;
    }

    const code = codes[0];
    if (code.is_used) {
      setError('This promo code has already been used');
      setIsLoading(false);
      return;
    }

    // Mark code as used
    await base44.entities.PromoCode.update(code.id, {
      is_used: true,
      used_by: user.email
    });

    // Update user settings to Pro
    const expiryDate = new Date();
    expiryDate.setMonth(expiryDate.getMonth() + 1);

    if (userSettings) {
      await base44.entities.UserSettings.update(userSettings.id, {
        is_pro: true,
        pro_expires: expiryDate.toISOString()
      });
    } else {
      await base44.entities.UserSettings.create({
        user_email: user.email,
        is_pro: true,
        pro_expires: expiryDate.toISOString()
      });
    }

    setSuccess(true);
    setIsLoading(false);
  };

  const isPro = userSettings?.is_pro && new Date(userSettings.pro_expires) > new Date();

  const benefits = [
    { icon: DollarSign, text: 'Earn $0.05 per unique click (vs $0.04)' },
    { icon: Zap, text: '25% more earnings on every link' },
    { icon: Crown, text: 'Pro badge on your profile' },
    { icon: Sparkles, text: 'Priority support' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-950">
      <Sidebar currentPage="GoPro" onLogoClick={handleLogoClick} />
      
      <main className="lg:ml-72 p-6 lg:p-10">
        <div className="max-w-2xl mx-auto">
          {/* Header */}
          <div className="mb-8 pt-12 lg:pt-0 text-center">
            <div className="w-20 h-20 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-yellow-500/30">
              <Crown className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-white mb-2">Go Pro</h1>
            <p className="text-slate-400">Upgrade your account and earn more per click</p>
          </div>

          {isPro ? (
            <Card className="bg-gradient-to-br from-yellow-500/20 to-orange-500/20 border-yellow-500/30">
              <CardContent className="p-8 text-center">
                <div className="w-16 h-16 bg-yellow-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Crown className="w-8 h-8 text-yellow-400" />
                </div>
                <h2 className="text-2xl font-bold text-white mb-2">You're a Pro!</h2>
                <p className="text-slate-300 mb-4">You're earning $0.05 per unique click</p>
                <p className="text-yellow-400 text-sm">
                  Expires: {new Date(userSettings.pro_expires).toLocaleDateString()}
                </p>
              </CardContent>
            </Card>
          ) : success ? (
            <Card className="bg-gradient-to-br from-green-500/20 to-emerald-500/20 border-green-500/30">
              <CardContent className="p-8 text-center">
                <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Check className="w-8 h-8 text-green-400" />
                </div>
                <h2 className="text-2xl font-bold text-white mb-2">Welcome to Pro!</h2>
                <p className="text-slate-300">You now earn $0.05 per unique click. Your membership is active for 1 month.</p>
              </CardContent>
            </Card>
          ) : (
            <>
              {/* Pricing Card */}
              <Card className="bg-gradient-to-br from-yellow-500/10 to-orange-500/10 border-yellow-500/20 mb-6">
                <CardContent className="p-8">
                  <div className="text-center mb-6">
                    <p className="text-slate-400 text-sm">Monthly Membership</p>
                    <div className="flex items-center justify-center gap-1 mt-2">
                      <span className="text-5xl font-bold text-white">$30</span>
                      <span className="text-slate-400">/month</span>
                    </div>
                  </div>

                  <div className="space-y-4 mb-8">
                    {benefits.map((benefit, index) => {
                      const Icon = benefit.icon;
                      return (
                        <div key={index} className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-yellow-500/20 rounded-xl flex items-center justify-center">
                            <Icon className="w-5 h-5 text-yellow-400" />
                          </div>
                          <span className="text-white">{benefit.text}</span>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>

              {/* Redeem Code */}
              <Card className="bg-white/5 border-white/10">
                <CardHeader>
                  <CardTitle className="text-white">Redeem Promo Code</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-slate-400 text-sm">
                    Contact admin to purchase a Pro membership code, then enter it below.
                  </p>
                  <Input
                    value={promoCode}
                    onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
                    placeholder="Enter promo code"
                    className="bg-white/5 border-white/10 text-white placeholder:text-slate-500 font-mono text-center text-lg tracking-widest"
                  />
                  
                  {error && (
                    <div className="flex items-center gap-2 p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400">
                      <AlertCircle className="w-5 h-5" />
                      <span>{error}</span>
                    </div>
                  )}

                  <Button
                    onClick={handleRedeem}
                    disabled={isLoading || !promoCode}
                    className="w-full h-12 bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-400 hover:to-orange-400 text-white font-semibold"
                  >
                    {isLoading ? (
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      'Redeem Code'
                    )}
                  </Button>
                </CardContent>
              </Card>
            </>
          )}
        </div>
      </main>
    </div>
  );
}