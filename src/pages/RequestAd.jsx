import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import Sidebar from '@/components/Sidebar';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Megaphone, Check, Mail } from 'lucide-react';

export default function RequestAd() {
  const [logoClicks, setLogoClicks] = useState(0);
  const [submitted, setSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  React.useEffect(() => {
    const checkAdmin = async () => {
      const user = await base44.auth.me();
      if (user?.role === 'admin') setIsAdmin(true);
    };
    checkAdmin();
  }, []);

  const [formData, setFormData] = useState({
    name: '',
    birthDate: '',
    age: '',
    location: '',
    adType: 'popup',
    cost: '',
    duration: ''
  });
  const navigate = useNavigate();

  const handleLogoClick = () => {
    const newCount = logoClicks + 1;
    setLogoClicks(newCount);
    if (newCount >= 10) {
      navigate(createPageUrl('AdminLogin'));
      setLogoClicks(0);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    await base44.entities.AdRequest.create({
      requester_name: formData.name,
      birth_date: formData.birthDate,
      age: parseInt(formData.age),
      location: formData.location,
      ad_type: formData.adType,
      cost: parseFloat(formData.cost),
      duration_days: parseInt(formData.duration),
      status: 'pending'
    });

    setIsLoading(false);
    setSubmitted(true);
  };

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  if (isAdmin) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-950">
        <Sidebar currentPage="RequestAd" onLogoClick={handleLogoClick} />
        <main className="lg:ml-72 p-6 lg:p-10 flex items-center justify-center">
          <div className="text-center max-w-sm">
            <div className="w-20 h-20 bg-red-500/20 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <Megaphone className="w-10 h-10 text-red-400" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-3">Not Available for Admins</h2>
            <p className="text-slate-400">Admins cannot submit ad requests. Use the Admin Panel to create ads directly.</p>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-950">
      <Sidebar currentPage="RequestAd" onLogoClick={handleLogoClick} />
      
      <main className="lg:ml-72 p-6 lg:p-10">
        <div className="max-w-2xl mx-auto">
          {/* Header */}
          <div className="mb-8 pt-12 lg:pt-0">
            <h1 className="text-3xl font-bold text-white mb-2">Request an Ad</h1>
            <p className="text-slate-400">Advertise your product or service on ShrinkPro</p>
          </div>

          {!submitted ? (
            <Card className="bg-white/5 border-white/10 backdrop-blur-xl">
              <CardContent className="p-6">
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Name */}
                  <div>
                    <Label className="text-slate-300 mb-2 block">Your Name *</Label>
                    <Input
                      value={formData.name}
                      onChange={(e) => handleChange('name', e.target.value)}
                      placeholder="John Doe"
                      required
                      className="h-12 bg-white/5 border-white/10 text-white placeholder:text-slate-500 rounded-xl"
                    />
                  </div>

                  {/* Birth Date */}
                  <div>
                    <Label className="text-slate-300 mb-2 block">Birth Date *</Label>
                    <Input
                      type="date"
                      value={formData.birthDate}
                      onChange={(e) => handleChange('birthDate', e.target.value)}
                      required
                      className="h-12 bg-white/5 border-white/10 text-white rounded-xl"
                    />
                  </div>

                  {/* Age */}
                  <div>
                    <Label className="text-slate-300 mb-2 block">Age *</Label>
                    <Input
                      type="number"
                      value={formData.age}
                      onChange={(e) => handleChange('age', e.target.value)}
                      placeholder="25"
                      required
                      min="18"
                      className="h-12 bg-white/5 border-white/10 text-white placeholder:text-slate-500 rounded-xl"
                    />
                  </div>

                  {/* Location */}
                  <div>
                    <Label className="text-slate-300 mb-2 block">Where are you from? *</Label>
                    <Input
                      value={formData.location}
                      onChange={(e) => handleChange('location', e.target.value)}
                      placeholder="City, Country"
                      required
                      className="h-12 bg-white/5 border-white/10 text-white placeholder:text-slate-500 rounded-xl"
                    />
                  </div>

                  {/* Ad Type */}
                  <div>
                    <Label className="text-slate-300 mb-4 block">Type of Ad *</Label>
                    <RadioGroup
                      value={formData.adType}
                      onValueChange={(value) => handleChange('adType', value)}
                      className="grid grid-cols-2 gap-4"
                    >
                      <div className={`relative p-4 rounded-xl border-2 cursor-pointer transition-all ${
                        formData.adType === 'popup' 
                          ? 'border-cyan-500 bg-cyan-500/10' 
                          : 'border-white/10 bg-white/5 hover:border-white/20'
                      }`}>
                        <RadioGroupItem value="popup" id="popup" className="sr-only" />
                        <label htmlFor="popup" className="cursor-pointer">
                          <p className="text-white font-medium mb-1">Pop-up Ad</p>
                          <p className="text-slate-400 text-sm">Opens in new tab after delay</p>
                        </label>
                      </div>
                      <div className={`relative p-4 rounded-xl border-2 cursor-pointer transition-all ${
                        formData.adType === 'homepage' 
                          ? 'border-purple-500 bg-purple-500/10' 
                          : 'border-white/10 bg-white/5 hover:border-white/20'
                      }`}>
                        <RadioGroupItem value="homepage" id="homepage" className="sr-only" />
                        <label htmlFor="homepage" className="cursor-pointer">
                          <p className="text-white font-medium mb-1">Homepage Ad</p>
                          <p className="text-slate-400 text-sm">Displayed on dashboard</p>
                        </label>
                      </div>
                    </RadioGroup>
                  </div>

                  {/* Cost */}
                  <div>
                    <Label className="text-slate-300 mb-2 block">Budget (USD) *</Label>
                    <Input
                      type="number"
                      value={formData.cost}
                      onChange={(e) => handleChange('cost', e.target.value)}
                      placeholder="100"
                      required
                      min="1"
                      className="h-12 bg-white/5 border-white/10 text-white placeholder:text-slate-500 rounded-xl"
                    />
                  </div>

                  {/* Duration */}
                  <div>
                    <Label className="text-slate-300 mb-2 block">Duration *</Label>
                    <Select
                      value={formData.duration}
                      onValueChange={(value) => handleChange('duration', value)}
                    >
                      <SelectTrigger className="h-12 bg-white/5 border-white/10 text-white rounded-xl">
                        <SelectValue placeholder="Select duration" />
                      </SelectTrigger>
                      <SelectContent className="bg-slate-900 border-white/10">
                        <SelectItem value="7">7 days</SelectItem>
                        <SelectItem value="14">14 days</SelectItem>
                        <SelectItem value="30">30 days</SelectItem>
                        <SelectItem value="60">60 days</SelectItem>
                        <SelectItem value="90">90 days</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Submit */}
                  <Button
                    type="submit"
                    disabled={isLoading}
                    className="w-full h-14 bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-400 hover:to-purple-400 text-white font-semibold rounded-xl text-lg"
                  >
                    {isLoading ? (
                      <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <>
                        <Megaphone className="w-5 h-5 mr-2" />
                        Submit Request
                      </>
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
          ) : (
            <Card className="bg-white/5 border-white/10 backdrop-blur-xl">
              <CardContent className="p-8 text-center">
                <div className="w-20 h-20 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Check className="w-10 h-10 text-white" />
                </div>
                
                <h2 className="text-2xl font-bold text-white mb-4">Request Submitted!</h2>
                
                <p className="text-slate-400 mb-6">
                  Please wait for admin approval. Contact DevX to check the status of your request.
                </p>

                <div className="bg-white/5 rounded-xl p-5 text-left">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 bg-cyan-500/20 rounded-xl flex items-center justify-center">
                      <Mail className="w-5 h-5 text-cyan-400" />
                    </div>
                    <div>
                      <p className="text-white font-medium">Email</p>
                      <a href="mailto:starproducer@atomicmail.io" className="text-cyan-400 hover:underline">
                        starproducer@atomicmail.io
                      </a>
                    </div>
                  </div>
                </div>

                <Button
                  onClick={() => {
                    setSubmitted(false);
                    setFormData({
                      name: '',
                      birthDate: '',
                      age: '',
                      location: '',
                      adType: 'popup',
                      cost: '',
                      duration: ''
                    });
                  }}
                  variant="outline"
                  className="mt-6 border-white/10 text-slate-400 hover:text-white"
                >
                  Submit Another Request
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </main>
    </div>
  );
}