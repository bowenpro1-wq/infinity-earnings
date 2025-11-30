import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Shield, Lock, AlertCircle } from 'lucide-react';

export default function AdminLogin() {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    // Check password
    if (password === '20140626') {
      navigate(createPageUrl('AdminPanel'));
    } else {
      setError('Incorrect password');
    }
    
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-950 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-gradient-to-br from-red-500 to-orange-500 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-2xl">
            <Shield className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white">Admin Access</h1>
          <p className="text-slate-400 mt-2">Enter password to continue</p>
        </div>

        <Card className="bg-white/5 border-white/10 backdrop-blur-xl">
          <CardContent className="p-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <Input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter admin password"
                    className="pl-12 h-14 bg-white/5 border-white/10 text-white placeholder:text-slate-500 rounded-xl text-lg"
                  />
                </div>
              </div>

              {error && (
                <div className="flex items-center gap-2 p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400">
                  <AlertCircle className="w-5 h-5" />
                  <span>{error}</span>
                </div>
              )}

              <Button
                type="submit"
                disabled={isLoading || !password}
                className="w-full h-14 bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-400 hover:to-orange-400 text-white font-semibold rounded-xl text-lg"
              >
                {isLoading ? (
                  <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  'Access Admin Panel'
                )}
              </Button>
            </form>

            <Button
              variant="ghost"
              onClick={() => navigate(createPageUrl('Home'))}
              className="w-full mt-4 text-slate-400 hover:text-white"
            >
              Back to Home
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}