import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import Sidebar from '@/components/Sidebar';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Wallet, Copy, Check, AlertCircle, MessageCircle, Mail } from 'lucide-react';

export default function Withdraw() {
  const [logoClicks, setLogoClicks] = useState(0);
  const [withdrawalResult, setWithdrawalResult] = useState(null);
  const [copied, setCopied] = useState(false);
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const loadUser = async () => {
      const userData = await base44.auth.me();
      setUser(userData);
    };
    loadUser();
  }, []);

  const { data: links = [] } = useQuery({
    queryKey: ['userLinks'],
    queryFn: () => base44.entities.ShortenedLink.list()
  });

  const { data: withdrawals = [] } = useQuery({
    queryKey: ['userWithdrawals'],
    queryFn: async () => {
      if (!user?.email) return [];
      return base44.entities.WithdrawalRequest.filter({ user_email: user.email });
    },
    enabled: !!user
  });

  const handleLogoClick = () => {
    const newCount = logoClicks + 1;
    setLogoClicks(newCount);
    if (newCount >= 10) {
      navigate(createPageUrl('AdminLogin'));
      setLogoClicks(0);
    }
  };

  const totalEarnings = links.reduce((sum, link) => sum + (link.earnings || 0), 0);
  const withdrawnAmount = withdrawals
    .filter(w => w.status === 'completed')
    .reduce((sum, w) => sum + (w.amount || 0), 0);
  const availableBalance = totalEarnings - withdrawnAmount;

  const generatePassword = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < 8; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  };

  const handleWithdraw = async () => {
    if (availableBalance <= 0) return;

    const password = generatePassword();
    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + 1);

    const withdrawal = await base44.entities.WithdrawalRequest.create({
      amount: availableBalance,
      password: password,
      verification_url: `${window.location.origin}/Verification?p=${password}`,
      expiry_date: expiryDate.toISOString(),
      status: 'pending',
      user_email: user?.email
    });

    setWithdrawalResult({
      url: `${window.location.origin}/Verification?p=${password}`,
      password: password,
      amount: availableBalance,
      expiryDate: expiryDate
    });
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-950">
      <Sidebar currentPage="Withdraw" onLogoClick={handleLogoClick} />
      
      <main className="lg:ml-72 p-6 lg:p-10">
        <div className="max-w-2xl mx-auto">
          {/* Header */}
          <div className="mb-8 pt-12 lg:pt-0">
            <h1 className="text-3xl font-bold text-white mb-2">Withdraw Payments</h1>
            <p className="text-slate-400">Request to withdraw your earnings</p>
          </div>

          {/* Balance Card */}
          <Card className="bg-gradient-to-br from-cyan-500/20 to-purple-500/20 border-white/10 backdrop-blur-xl mb-6">
            <CardContent className="p-8">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-16 h-16 bg-gradient-to-br from-cyan-400 to-purple-500 rounded-2xl flex items-center justify-center">
                  <Wallet className="w-8 h-8 text-white" />
                </div>
                <div>
                  <p className="text-slate-400 text-sm">Available Balance</p>
                  <p className="text-4xl font-bold text-white">${availableBalance.toFixed(2)}</p>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="bg-white/5 rounded-xl p-4">
                  <p className="text-slate-400">Total Earned</p>
                  <p className="text-xl font-semibold text-white">${totalEarnings.toFixed(2)}</p>
                </div>
                <div className="bg-white/5 rounded-xl p-4">
                  <p className="text-slate-400">Withdrawn</p>
                  <p className="text-xl font-semibold text-white">${withdrawnAmount.toFixed(2)}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {!withdrawalResult ? (
            <>
              {/* Withdraw Button */}
              <Button
                onClick={handleWithdraw}
                disabled={availableBalance <= 0}
                className="w-full h-14 bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-400 hover:to-purple-400 text-white font-semibold rounded-xl text-lg mb-6"
              >
                Request Withdrawal
              </Button>

              {availableBalance <= 0 && (
                <div className="flex items-center gap-3 p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-xl text-yellow-400">
                  <AlertCircle className="w-5 h-5 flex-shrink-0" />
                  <p className="text-sm">You need to earn some money first before withdrawing.</p>
                </div>
              )}
            </>
          ) : (
            <Card className="bg-white/5 border-white/10 backdrop-blur-xl mb-6">
              <CardContent className="p-6 space-y-6">
                <div className="text-center">
                  <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Check className="w-8 h-8 text-green-400" />
                  </div>
                  <h3 className="text-xl font-semibold text-white mb-2">Withdrawal Requested!</h3>
                  <p className="text-slate-400 text-sm">Amount: ${withdrawalResult.amount.toFixed(2)}</p>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="text-sm text-slate-400 mb-2 block">Verification URL</label>
                    <div className="flex gap-2">
                      <code className="flex-1 bg-white/5 text-cyan-400 p-3 rounded-lg text-sm break-all">
                        {withdrawalResult.url}
                      </code>
                      <Button
                        variant="outline"
                        size="icon"
                        className="border-white/10 text-slate-400"
                        onClick={() => copyToClipboard(withdrawalResult.url)}
                      >
                        {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                      </Button>
                    </div>
                  </div>

                  <div>
                    <label className="text-sm text-slate-400 mb-2 block">Verification Password</label>
                    <div className="flex gap-2">
                      <code className="flex-1 bg-white/5 text-purple-400 p-3 rounded-lg text-lg font-mono text-center">
                        {withdrawalResult.password}
                      </code>
                      <Button
                        variant="outline"
                        size="icon"
                        className="border-white/10 text-slate-400"
                        onClick={() => copyToClipboard(withdrawalResult.password)}
                      >
                        <Copy className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>

                  <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-xl p-4">
                    <div className="flex items-center gap-2 text-yellow-400 mb-2">
                      <AlertCircle className="w-5 h-5" />
                      <span className="font-medium">Important</span>
                    </div>
                    <p className="text-sm text-slate-300">
                      This URL will expire in 1 day. Please contact the admin with this verification URL and password.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Contact Info */}
          <Card className="bg-white/5 border-white/10 backdrop-blur-xl">
            <CardHeader>
              <CardTitle className="text-white text-lg">Contact for Withdrawal</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-4 p-4 bg-white/5 rounded-xl">
                <div className="w-12 h-12 bg-green-500/20 rounded-xl flex items-center justify-center">
                  <MessageCircle className="w-6 h-6 text-green-400" />
                </div>
                <div>
                  <p className="text-white font-medium">WeChat</p>
                  <p className="text-slate-400">Bowen: 17621774110</p>
                </div>
              </div>
              
              <div className="flex items-center gap-4 p-4 bg-white/5 rounded-xl">
                <div className="w-12 h-12 bg-cyan-500/20 rounded-xl flex items-center justify-center">
                  <Mail className="w-6 h-6 text-cyan-400" />
                </div>
                <div>
                  <p className="text-white font-medium">Email</p>
                  <p className="text-slate-400">starproduce@atomicmail.io</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}