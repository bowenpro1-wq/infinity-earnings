import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Check, X, Clock, AlertCircle, Lock, Copy, MessageCircle } from 'lucide-react';

export default function Verification() {
  const urlParams = new URLSearchParams(window.location.search);
  const password = urlParams.get('p');

  const [enteredPassword, setEnteredPassword] = useState('');
  const [pageUnlocked, setPageUnlocked] = useState(false);
  const [pageError, setPageError] = useState('');
  const [copied, setCopied] = useState(false);

  const { data: appSettings } = useQuery({
    queryKey: ['appSettingsVerify'],
    queryFn: async () => {
      const settings = await base44.entities.AppSettings.filter({ setting_key: 'global' });
      return settings[0] || null;
    }
  });

  const { data: withdrawal, isLoading } = useQuery({
    queryKey: ['verification', password],
    queryFn: async () => {
      if (!password) return null;
      const withdrawals = await base44.entities.WithdrawalRequest.filter({ password });
      return withdrawals[0] || null;
    },
    enabled: !!password && pageUnlocked
  });

  const pagePassword = appSettings?.withdraw_page_password;

  const handleUnlock = () => {
    if (!pagePassword || enteredPassword === pagePassword) {
      setPageUnlocked(true);
    } else {
      setPageError('Incorrect password');
    }
  };

  // If page password is configured and not yet unlocked
  if (pagePassword && !pageUnlocked) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-950 flex items-center justify-center p-4">
        <Card className="w-full max-w-sm bg-white/5 border-white/10 backdrop-blur-xl">
          <CardContent className="p-8 text-center">
            <div className="w-16 h-16 bg-purple-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
              <Lock className="w-8 h-8 text-purple-400" />
            </div>
            <h2 className="text-xl font-bold text-white mb-2">Protected Page</h2>
            <p className="text-slate-400 text-sm mb-6">Enter the page password to continue</p>
            <Input
              type="password"
              value={enteredPassword}
              onChange={(e) => setEnteredPassword(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleUnlock()}
              placeholder="Enter password"
              className="mb-4 h-12 bg-white/5 border-white/10 text-white placeholder:text-slate-500"
            />
            {pageError && <p className="text-red-400 text-sm mb-3">{pageError}</p>}
            <Button onClick={handleUnlock} className="w-full bg-gradient-to-r from-purple-500 to-cyan-500 text-white">
              Unlock
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const isExpired = withdrawal?.expiry_date && new Date(withdrawal.expiry_date) < new Date();
  const chatInstruction = appSettings?.withdraw_chat_message || 'Send the money code to admin in the chat to complete your withdrawal.';

  const copyCode = () => {
    if (withdrawal?.password) {
      navigator.clipboard.writeText(withdrawal.password);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-950 flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-white/5 border-white/10 backdrop-blur-xl">
        <CardContent className="p-8 text-center">
          {isLoading ? (
            <div className="py-8">
              <div className="w-12 h-12 border-2 border-cyan-400/30 border-t-cyan-400 rounded-full animate-spin mx-auto mb-4" />
              <p className="text-slate-400">Verifying...</p>
            </div>
          ) : !password ? (
            <>
              <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                <AlertCircle className="w-8 h-8 text-red-400" />
              </div>
              <h2 className="text-xl font-bold text-white mb-2">Invalid Link</h2>
              <p className="text-slate-400">No verification password provided.</p>
            </>
          ) : !withdrawal ? (
            <>
              <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                <X className="w-8 h-8 text-red-400" />
              </div>
              <h2 className="text-xl font-bold text-white mb-2">Not Found</h2>
              <p className="text-slate-400">This withdrawal request does not exist.</p>
            </>
          ) : isExpired ? (
            <>
              <div className="w-16 h-16 bg-yellow-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                <Clock className="w-8 h-8 text-yellow-400" />
              </div>
              <h2 className="text-xl font-bold text-white mb-2">Link Expired</h2>
              <p className="text-slate-400">This verification link has expired.</p>
            </>
          ) : (
            <>
              <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                <Check className="w-8 h-8 text-green-400" />
              </div>
              <h2 className="text-xl font-bold text-white mb-4">Withdrawal Verified</h2>

              <div className="space-y-4 text-left bg-white/5 rounded-xl p-5 mb-6">
                <div>
                  <p className="text-slate-400 text-sm">Amount</p>
                  <p className="text-2xl font-bold text-white">${withdrawal.amount?.toFixed(2)}</p>
                </div>
                <div>
                  <p className="text-slate-400 text-sm">Status</p>
                  <span className={`inline-block px-3 py-1 rounded-full text-sm ${
                    withdrawal.status === 'pending' ? 'bg-yellow-500/20 text-yellow-400' :
                    withdrawal.status === 'completed' ? 'bg-green-500/20 text-green-400' :
                    'bg-red-500/20 text-red-400'
                  }`}>{withdrawal.status}</span>
                </div>
                <div>
                  <p className="text-slate-400 text-sm mb-2">Your Money Code (copy & send to admin)</p>
                  <div className="flex items-center gap-2">
                    <code className="flex-1 text-center text-xl text-yellow-400 font-mono bg-yellow-500/10 border border-yellow-500/20 px-4 py-3 rounded-xl tracking-widest">
                      {withdrawal.password}
                    </code>
                    <Button onClick={copyCode} variant="outline" className="border-yellow-500/30 text-yellow-400 hover:bg-yellow-500/10">
                      {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    </Button>
                  </div>
                </div>
              </div>

              <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4">
                <div className="flex items-start gap-3">
                  <MessageCircle className="w-5 h-5 text-blue-400 mt-0.5 shrink-0" />
                  <p className="text-blue-300 text-sm text-left">{chatInstruction}</p>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}