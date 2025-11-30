import React, { useState, useEffect } from 'react';
import Sidebar from '@/components/Sidebar';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { 
  Megaphone, Upload, Loader2, Check, AlertCircle,
  Image as ImageIcon
} from "lucide-react";
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function RequestAd() {
  const [theme, setTheme] = useState('light');
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    requester_name: '',
    birth_date: '',
    age: '',
    location: '',
    ad_type: 'popup',
    cost: '',
    duration_days: '',
    image_url: '',
    target_url: ''
  });
  const [uploading, setUploading] = useState(false);

  const { data: settings } = useQuery({
    queryKey: ['userSettings'],
    queryFn: async () => {
      const user = await base44.auth.me();
      const settingsList = await base44.entities.UserSettings.filter({ user_email: user.email });
      return settingsList[0] || { theme: 'light' };
    }
  });

  useEffect(() => {
    if (settings?.theme) {
      setTheme(settings.theme);
    }
  }, [settings]);

  const submitMutation = useMutation({
    mutationFn: async (data) => {
      return base44.entities.AdRequest.create({
        ...data,
        status: 'pending'
      });
    },
    onSuccess: () => {
      setSubmitted(true);
    }
  });

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);
    const { file_url } = await base44.integrations.Core.UploadFile({ file });
    setFormData(prev => ({ ...prev, image_url: file_url }));
    setUploading(false);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    submitMutation.mutate(formData);
  };

  const isDark = theme === 'dark';

  if (submitted) {
    return (
      <div className={`min-h-screen ${isDark ? 'bg-slate-950' : 'bg-slate-50'}`}>
        <Sidebar currentPage="RequestAd" theme={theme} />
        
        <main className="lg:ml-72 p-6 lg:p-10">
          <div className="max-w-2xl mx-auto text-center">
            <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
              <Check className="w-10 h-10 text-white" />
            </div>
            <h1 className={`text-3xl font-bold mb-4 ${isDark ? 'text-white' : 'text-slate-900'}`}>
              Request Submitted!
            </h1>
            <p className={`text-lg mb-8 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
              Please wait, contact DevX at <strong>starproducer@atomicmail.io</strong> to check if the admin agrees!
            </p>
            <Button
              onClick={() => {
                setSubmitted(false);
                setFormData({
                  requester_name: '',
                  birth_date: '',
                  age: '',
                  location: '',
                  ad_type: 'popup',
                  cost: '',
                  duration_days: '',
                  image_url: '',
                  target_url: ''
                });
              }}
              className="bg-gradient-to-r from-purple-600 to-blue-600"
            >
              Submit Another Request
            </Button>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${isDark ? 'bg-slate-950' : 'bg-slate-50'}`}>
      <Sidebar currentPage="RequestAd" theme={theme} />
      
      <main className="lg:ml-72 p-6 lg:p-10">
        <div className="max-w-2xl mx-auto">
          <div className="mb-8">
            <h1 className={`text-3xl font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
              Request an Ad
            </h1>
            <p className={`mt-1 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
              Fill out the form below to request an advertisement
            </p>
          </div>

          <Card className={`p-8 ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white'}`}>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label className={isDark ? 'text-white' : ''}>Your Name *</Label>
                  <Input
                    value={formData.requester_name}
                    onChange={(e) => setFormData(prev => ({ ...prev, requester_name: e.target.value }))}
                    required
                    className={isDark ? 'bg-slate-800 border-slate-700 text-white' : ''}
                  />
                </div>

                <div className="space-y-2">
                  <Label className={isDark ? 'text-white' : ''}>Birth Date *</Label>
                  <Input
                    type="date"
                    value={formData.birth_date}
                    onChange={(e) => setFormData(prev => ({ ...prev, birth_date: e.target.value }))}
                    required
                    className={isDark ? 'bg-slate-800 border-slate-700 text-white' : ''}
                  />
                </div>

                <div className="space-y-2">
                  <Label className={isDark ? 'text-white' : ''}>Age *</Label>
                  <Input
                    type="number"
                    value={formData.age}
                    onChange={(e) => setFormData(prev => ({ ...prev, age: parseInt(e.target.value) }))}
                    required
                    className={isDark ? 'bg-slate-800 border-slate-700 text-white' : ''}
                  />
                </div>

                <div className="space-y-2">
                  <Label className={isDark ? 'text-white' : ''}>Where are you from? *</Label>
                  <Input
                    value={formData.location}
                    onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                    required
                    className={isDark ? 'bg-slate-800 border-slate-700 text-white' : ''}
                  />
                </div>
              </div>

              <div className="space-y-3">
                <Label className={isDark ? 'text-white' : ''}>Ad Type *</Label>
                <RadioGroup
                  value={formData.ad_type}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, ad_type: value }))}
                  className="flex gap-4"
                >
                  <label className={`flex-1 flex items-center gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                    formData.ad_type === 'popup'
                      ? 'border-purple-500 bg-purple-50'
                      : isDark
                      ? 'border-slate-700 bg-slate-800'
                      : 'border-slate-200'
                  }`}>
                    <RadioGroupItem value="popup" />
                    <div>
                      <p className={`font-medium ${isDark && formData.ad_type !== 'popup' ? 'text-white' : 'text-slate-900'}`}>
                        Pop Up Ad
                      </p>
                      <p className={`text-sm ${isDark && formData.ad_type !== 'popup' ? 'text-slate-400' : 'text-slate-600'}`}>
                        Opens in new tab after delay
                      </p>
                    </div>
                  </label>
                  <label className={`flex-1 flex items-center gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                    formData.ad_type === 'homepage'
                      ? 'border-purple-500 bg-purple-50'
                      : isDark
                      ? 'border-slate-700 bg-slate-800'
                      : 'border-slate-200'
                  }`}>
                    <RadioGroupItem value="homepage" />
                    <div>
                      <p className={`font-medium ${isDark && formData.ad_type !== 'homepage' ? 'text-white' : 'text-slate-900'}`}>
                        Home Page Ad
                      </p>
                      <p className={`text-sm ${isDark && formData.ad_type !== 'homepage' ? 'text-slate-400' : 'text-slate-600'}`}>
                        Displayed on dashboard
                      </p>
                    </div>
                  </label>
                </RadioGroup>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label className={isDark ? 'text-white' : ''}>Cost (USD) *</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={formData.cost}
                    onChange={(e) => setFormData(prev => ({ ...prev, cost: parseFloat(e.target.value) }))}
                    required
                    className={isDark ? 'bg-slate-800 border-slate-700 text-white' : ''}
                  />
                </div>

                <div className="space-y-2">
                  <Label className={isDark ? 'text-white' : ''}>Duration (Days) *</Label>
                  <Input
                    type="number"
                    value={formData.duration_days}
                    onChange={(e) => setFormData(prev => ({ ...prev, duration_days: parseInt(e.target.value) }))}
                    required
                    className={isDark ? 'bg-slate-800 border-slate-700 text-white' : ''}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label className={isDark ? 'text-white' : ''}>Target URL</Label>
                <Input
                  type="url"
                  placeholder="https://your-website.com"
                  value={formData.target_url}
                  onChange={(e) => setFormData(prev => ({ ...prev, target_url: e.target.value }))}
                  className={isDark ? 'bg-slate-800 border-slate-700 text-white' : ''}
                />
              </div>

              <div className="space-y-2">
                <Label className={isDark ? 'text-white' : ''}>Ad Image</Label>
                <div className={`border-2 border-dashed rounded-xl p-6 text-center ${isDark ? 'border-slate-700' : 'border-slate-300'}`}>
                  {formData.image_url ? (
                    <div>
                      <img 
                        src={formData.image_url} 
                        alt="Ad preview" 
                        className="max-h-40 mx-auto rounded-lg mb-3"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setFormData(prev => ({ ...prev, image_url: '' }))}
                        className={isDark ? 'border-slate-700' : ''}
                      >
                        Remove Image
                      </Button>
                    </div>
                  ) : (
                    <label className="cursor-pointer">
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleImageUpload}
                      />
                      {uploading ? (
                        <Loader2 className="w-8 h-8 animate-spin mx-auto text-purple-500" />
                      ) : (
                        <>
                          <ImageIcon className={`w-12 h-12 mx-auto mb-2 ${isDark ? 'text-slate-600' : 'text-slate-400'}`} />
                          <p className={`${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                            Click to upload an image
                          </p>
                        </>
                      )}
                    </label>
                  )}
                </div>
              </div>

              <Button
                type="submit"
                disabled={submitMutation.isPending}
                className="w-full h-14 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white text-lg font-semibold rounded-xl"
              >
                {submitMutation.isPending ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    <Megaphone className="w-5 h-5 mr-2" />
                    Submit Ad Request
                  </>
                )}
              </Button>
            </form>
          </Card>
        </div>
      </main>
    </div>
  );
}