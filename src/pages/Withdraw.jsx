import React, { useState, useEffect } from 'react';
import Sidebar from '@/components/Sidebar';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DollarSign, Copy, Check, Wallet, Clock, AlertCircle } from "lucide-react";
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { format, addDays } from 'date-fns';
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function Withdraw() {
  const [theme, setTheme] = useState('light');
  const [copied, setCopied] = useState(false);
  const [newWithdrawal, setNewWithdrawal] = useState(null);
  const queryClient = useQueryClient();

  const { data: settings } = useQuery({
    queryKey: ['userSettings'],
    queryFn: async () => {
      const user = await base44.auth.me();
      const settingsList = await base44.entities.UserSettings.filter({ user_email: user.email });
      return settingsList[0] || { theme: 'light' };
    }
  });

  const { data: links = [] } = useQuery({
    queryKey: ['myLinks'],
    queryFn: async () => {
      const user = await base44.auth.me();
      return base44.entities.ShortenedLink.filter({ created_by: user.email });
    }
  });

  const { data: withdrawals = [] } = useQuery({
    queryKey: ['withdrawals'],
    queryFn: async () => {
      const user = await base44.auth.me();
      return base44.entities.WithdrawalRequest.filter({ user_email: user.email });
    }
  });

  useEffect(() => {
    if (settings?.theme) {
      setTheme(settings.theme);
    }
  }, [settings]);

  const totalEarnings = links.reduce((sum, link) => sum + (link.earnings || 0), 0);
  const withdrawnAmount = withdrawals
    .filter(w => w.status === 'completed')
    .reduce((sum, w) => sum + w.amount, 0);
  const availableBalance = totalEarnings - withdrawnAmount;

  const generatePassword = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let password = '';
    for (let i = 0; i < 8; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return password;
  };

  const createWithdrawalMutation = useMutation({
    mutationFn: async () => {
      const user = await base44.auth.me();
      const password = generatePassword();
      const expiryDate = addDays(new Date(), 1);
      const verificationUrl = `shrinkpro.xyz/verify/${password}`;
      
      const withdrawal = await base44.entities.WithdrawalRequest.create({
        amount: availableBalance,
        password: password,
        verification_url: verificationUrl,
        expiry_date: expiryDate.toISOString(),
        status: 'pending',
        user_email: user.email
      });
      
      return { ...withdrawal, password, verificationUrl };
    },
    onSuccess: (data) => {
      setNewWithdrawal(data);
      queryClient.invalidateQueries({ queryKey: ['withdrawals'] });
    }
  });

  const handleCopy = (text) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const isDark = theme === 'dark';

  return (
    <div className={`min-h-screen ${isDark ? 'bg-slate-950' : 'bg-slate-50'}`}>
      <Sidebar currentPage="Withdraw" theme={theme} />
      
      <main className="lg:ml-72 p-6 lg:p-10">
        <div className="max-w-2xl mx-auto">
          <div className="mb-8">
            <h1 className={`text-3xl font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
              Withdraw Payments
            </h1>
            <p className={`mt-1 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
              Request withdrawal of your earnings
            </p>
          </div>

          {/* Balance Card */}
          <Card className={`p-8 mb-6 ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white'}`}>
            <div className="flex items-center gap-4 mb-6">
              <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-500 rounded-2xl flex items-center justify-center shadow-lg shadow-green-500/25">
                <Wallet className="w-8 h-8 text-white" />
              </div>
              <div>
                <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>Available Balance</p>
                <p className={`text-4xl font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                  ${availableBalance.toFixed(2)}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className={`p-4 rounded-xl ${isDark ? 'bg-slate-800' : 'bg-slate-50'}`}>
                <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>Total Earned</p>
                <p className={`text-xl font-semibold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                  ${totalEarnings.toFixed(2)}
                </p>
              </div>
              <div className={`p-4 rounded-xl ${isDark ? 'bg-slate-800' : 'bg-slate-50'}`}>
                <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>Withdrawn</p>
                <p className={`text-xl font-semibold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                  ${withdrawnAmount.toFixed(2)}
                </p>
              </div>
            </div>

            <Button
              onClick={() => createWithdrawalMutation.mutate()}
              disabled={availableBalance <= 0 || createWithdrawalMutation.isPending}
              className="w-full h-14 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white text-lg font-semibold rounded-xl"
            >
              <DollarSign className="w-5 h-5 mr-2" />
              Request Withdrawal
            </Button>
          </Card>

          {/* New Withdrawal Info */}
          {newWithdrawal && (
            <Card className={`p-6 mb-6 border-2 border-green-500 ${isDark ? 'bg-slate-900' : 'bg-white'}`}>
              <h3 className={`text-lg font-semibold mb-4 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                Withdrawal Request Created!
              </h3>
              
              <div className="space-y-4">
                <div>
                  <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>Verification URL (expires in 1 day):</p>
                  <div className="flex items-center gap-2 mt-1">
                    <code className={`flex-1 p-3 rounded-lg text-sm ${isDark ? 'bg-slate-800 text-white' : 'bg-slate-100'}`}>
                      {newWithdrawal.verificationUrl}
                    </code>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => handleCopy(newWithdrawal.verificationUrl)}
                    >
                      {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                    </Button>
                  </div>
                </div>

                <div>
                  <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>Password for verification:</p>
                  <div className="flex items-center gap-2 mt-1">
                    <code className={`flex-1 p-3 rounded-lg text-lg font-mono ${isDark ? 'bg-slate-800 text-white' : 'bg-slate-100'}`}>
                      {newWithdrawal.password}
                    </code>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => handleCopy(newWithdrawal.password)}
                    >
                      {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                    </Button>
                  </div>
                </div>

                <Alert className={isDark ? 'bg-slate-800 border-slate-700' : ''}>
                  <AlertCircle className="w-4 h-4" />
                  <AlertDescription>
                    Please contact Bowen via WeChat: <strong>17621774110</strong> or email: <strong>starproduce@atomicmail.io</strong>
                  </AlertDescription>
                </Alert>
              </div>
            </Card>
          )}

          {/* Previous Withdrawals */}
          {withdrawals.length > 0 && (
            <Card className={`p-6 ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white'}`}>
              <h3 className={`text-lg font-semibold mb-4 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                Withdrawal History
              </h3>
              <div className="space-y-3">
                {withdrawals.map((w) => (
                  <div key={w.id} className={`p-4 rounded-xl flex items-center justify-between ${isDark ? 'bg-slate-800' : 'bg-slate-50'}`}>
                    <div>
                      <p className={`font-semibold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                        ${w.amount.toFixed(2)}
                      </p>
                      <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                        Password: {w.password}
                      </p>
                    </div>
                    <div className="text-right">
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                        w.status === 'completed' 
                          ? 'bg-green-100 text-green-800' 
                          : w.status === 'expired'
                          ? 'bg-red-100 text-red-800'
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {w.status}
                      </span>
                      <p className={`text-xs mt-1 ${isDark ? 'text-slate-500' : 'text-slate-500'}`}>
                        {format(new Date(w.created_date), 'MMM d, yyyy')}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          )}
        </div>
      </main>
    </div>
  );
}