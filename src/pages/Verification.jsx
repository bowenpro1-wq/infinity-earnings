import React from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent } from "@/components/ui/card";
import { Check, X, Clock, AlertCircle } from 'lucide-react';

export default function Verification() {
  const urlParams = new URLSearchParams(window.location.search);
  const password = urlParams.get('p');

  const { data: withdrawal, isLoading } = useQuery({
    queryKey: ['verification', password],
    queryFn: async () => {
      if (!password) return null;
      const withdrawals = await base44.entities.WithdrawalRequest.filter({ password });
      return withdrawals[0] || null;
    },
    enabled: !!password
  });



  const isExpired = withdrawal?.expiry_date && new Date(withdrawal.expiry_date) < new Date();

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
              <h2 className="text-xl font-bold text-white mb-4">Verified Withdrawal Request</h2>
              
              <div className="space-y-4 text-left bg-white/5 rounded-xl p-5">
                <div>
                  <p className="text-slate-400 text-sm">Amount</p>
                  <p className="text-2xl font-bold text-white">${withdrawal.amount?.toFixed(2)}</p>
                </div>
                <div>
                  <p className="text-slate-400 text-sm">User</p>
                  <p className="text-white">{withdrawal.user_email}</p>
                </div>
                <div>
                  <p className="text-slate-400 text-sm">Password</p>
                  <code className="text-cyan-400 font-mono">{withdrawal.password}</code>
                </div>
                <div>
                  <p className="text-slate-400 text-sm">Status</p>
                  <span className={`inline-block px-3 py-1 rounded-full text-sm ${
                    withdrawal.status === 'pending' ? 'bg-yellow-500/20 text-yellow-400' :
                    withdrawal.status === 'completed' ? 'bg-green-500/20 text-green-400' :
                    'bg-red-500/20 text-red-400'
                  }`}>
                    {withdrawal.status}
                  </span>
                </div>
                <div>
                  <p className="text-slate-400 text-sm">Expires</p>
                  <p className="text-white">{new Date(withdrawal.expiry_date).toLocaleString()}</p>
                </div>
              </div>

              <p className="text-slate-400 text-sm mt-6">
                This is a valid withdrawal request. Please verify with the admin.
              </p>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}