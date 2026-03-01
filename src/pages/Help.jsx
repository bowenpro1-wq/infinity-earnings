import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import Sidebar from '@/components/Sidebar';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { HelpCircle, Mail, MessageCircle, ExternalLink } from 'lucide-react';

export default function Help() {
  const [logoClicks, setLogoClicks] = useState(0);
  const navigate = useNavigate();

  const handleLogoClick = () => {
    const newCount = logoClicks + 1;
    setLogoClicks(newCount);
    if (newCount >= 10) {
      navigate(createPageUrl('AdminLogin'));
      setLogoClicks(0);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-950">
      <Sidebar currentPage="Help" onLogoClick={handleLogoClick} />
      
      <main className="lg:ml-72 p-6 lg:p-10">
        <div className="max-w-2xl mx-auto">
          {/* Header */}
          <div className="mb-8 pt-12 lg:pt-0">
            <h1 className="text-3xl font-bold text-white mb-2">Help & Support</h1>
            <p className="text-slate-400">We're here to help you</p>
          </div>

          {/* Main Card */}
          <Card className="bg-white/5 border-white/10 backdrop-blur-xl">
            <CardContent className="p-8 text-center">
              <div className="w-20 h-20 bg-gradient-to-br from-cyan-400 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-6">
                <HelpCircle className="w-10 h-10 text-white" />
              </div>
              
              <h2 className="text-2xl font-bold text-white mb-3">
                Having trouble with ShrinkPro?
              </h2>
              
              <p className="text-slate-400 text-lg mb-8">
                Contact us!
              </p>

              {/* Contact Options */}
              <div className="space-y-4">
                {/* Primary Email */}
                <a
                  href="mailto:starproduce@atomicmail.io"
                  className="flex items-center justify-between p-5 bg-gradient-to-r from-cyan-500/20 to-cyan-500/10 rounded-xl border border-cyan-500/20 hover:border-cyan-500/40 transition-all group">

                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-cyan-500/20 rounded-xl flex items-center justify-center">
                      <Mail className="w-6 h-6 text-cyan-400" />
                    </div>
                    <div className="text-left">
                      <p className="text-white font-medium">Primary Email</p>
                      <p className="text-cyan-400">infinitytech@atomicmail.io</p>
                    </div>
                  </div>
                  <ExternalLink className="w-5 h-5 text-slate-400 group-hover:text-white transition-colors" />
                </a>

                {/* Secondary Email */}
                <a
                  href="mailto:starproducer@atomicmail.io"
                  className="flex items-center justify-between p-5 bg-gradient-to-r from-purple-500/20 to-purple-500/10 rounded-xl border border-purple-500/20 hover:border-purple-500/40 transition-all group">

                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-purple-500/20 rounded-xl flex items-center justify-center">
                      <Mail className="w-6 h-6 text-purple-400" />
                    </div>
                    <div className="text-left">
                      <p className="text-white font-medium">Secondary Email</p>
                      <p className="text-purple-400">49855744@qq.com</p>
                    </div>
                  </div>
                  <ExternalLink className="w-5 h-5 text-slate-400 group-hover:text-white transition-colors" />
                </a>
              </div>

              {/* Additional Info */}
              <div className="mt-8 p-4 bg-white/5 rounded-xl">
                <p className="text-slate-400 text-sm">We typically respond within 10-48 hours. Please include your account email and a detailed description of your issue.

                </p>
              </div>
            </CardContent>
          </Card>

          {/* FAQ Section */}
          <Card className="bg-white/5 border-white/10 backdrop-blur-xl mt-6">
            <CardHeader>
              <CardTitle className="text-white">Frequently Asked Questions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 bg-white/5 rounded-xl">
                <h4 className="text-white font-medium mb-2">How do I earn money?</h4>
                <p className="text-slate-400 text-sm">You earn money for each unique click on your shortened links. Only one click per IP address counts.</p>
              </div>
              <div className="p-4 bg-white/5 rounded-xl">
                <h4 className="text-white font-medium mb-2">How do I withdraw?</h4>
                <p className="text-slate-400 text-sm">Go to Withdraw Payments, request a withdrawal, then contact Bowen via WeChat or email with your verification details.</p>
              </div>
              <div className="p-4 bg-white/5 rounded-xl">
                <h4 className="text-white font-medium mb-2">How do ads work?</h4>
                <p className="text-slate-400 text-sm">You can request to advertise on ShrinkPro. Submit a request with your details and wait for admin approval.</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>);

}