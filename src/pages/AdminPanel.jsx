import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { 
  Shield, Megaphone, Wallet, Search, Plus, Trash2, 
  Check, X, ExternalLink, ArrowLeft, Smartphone, Monitor, Crown, Copy,
  Settings, ToggleLeft, ToggleRight
} from 'lucide-react';
import { Checkbox } from "@/components/ui/checkbox";

export default function AdminPanel() {
  const [searchPassword, setSearchPassword] = useState('');
  const [newAd, setNewAd] = useState({
    ad_type: 'popup', image_url: '', description: '', target_url: '',
    position: 'bottom-right', width: 300, height: 250,
    wait_steps: [{ wait_time: 5, target_url: '', button_text: '', button_url: '', require_button: false }],
    wait_message: 'Please wait...', is_active: true
  });
  const [showPreview, setShowPreview] = useState(false);
  const [previewDevice, setPreviewDevice] = useState('desktop');
  const [copiedCode, setCopiedCode] = useState(null);
  const [appSettingsForm, setAppSettingsForm] = useState({
    ip_limit_enabled: true,
    max_earns_per_ip_per_day: 1,
    withdraw_chat_message: 'Copy your money code and send it to admin in WeChat or Email to complete withdrawal.',
    withdraw_page_password: ''
  });
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: ads = [] } = useQuery({ queryKey: ['adminAds'], queryFn: () => base44.entities.Advertisement.list('-created_date') });
  const { data: promoCodes = [] } = useQuery({ queryKey: ['adminPromoCodes'], queryFn: () => base44.entities.PromoCode.list('-created_date') });
  const { data: adRequests = [] } = useQuery({ queryKey: ['adminAdRequests'], queryFn: () => base44.entities.AdRequest.list('-created_date') });
  const { data: withdrawals = [] } = useQuery({ queryKey: ['adminWithdrawals'], queryFn: () => base44.entities.WithdrawalRequest.list('-created_date') });
  const { data: appSettings } = useQuery({
    queryKey: ['adminAppSettings'],
    queryFn: async () => {
      const settings = await base44.entities.AppSettings.filter({ setting_key: 'global' });
      return settings[0] || null;
    },
    onSuccess: (data) => {
      if (data) {
        setAppSettingsForm({
          ip_limit_enabled: data.ip_limit_enabled !== false,
          max_earns_per_ip_per_day: data.max_earns_per_ip_per_day || 1,
          withdraw_chat_message: data.withdraw_chat_message || 'Copy your money code and send it to admin in WeChat or Email to complete withdrawal.',
          withdraw_page_password: data.withdraw_page_password || ''
        });
      }
    }
  });

  useEffect(() => {
    if (appSettings) {
      setAppSettingsForm({
        ip_limit_enabled: appSettings.ip_limit_enabled !== false,
        max_earns_per_ip_per_day: appSettings.max_earns_per_ip_per_day || 1,
        withdraw_chat_message: appSettings.withdraw_chat_message || 'Copy your money code and send it to admin in WeChat or Email to complete withdrawal.',
        withdraw_page_password: appSettings.withdraw_page_password || ''
      });
    }
  }, [appSettings]);

  const createAdMutation = useMutation({
    mutationFn: (data) => base44.entities.Advertisement.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries(['adminAds']);
      setNewAd({ ad_type: 'popup', image_url: '', description: '', target_url: '', position: 'bottom-right', width: 300, height: 250, wait_steps: [{ wait_time: 5, target_url: '', button_text: '', button_url: '', require_button: false }], wait_message: 'Please wait...', is_active: true });
      setShowPreview(false);
    }
  });

  const toggleAdMutation = useMutation({
    mutationFn: ({ id, is_active }) => base44.entities.Advertisement.update(id, { is_active }),
    onSuccess: () => queryClient.invalidateQueries(['adminAds'])
  });

  const deleteAdMutation = useMutation({
    mutationFn: (id) => base44.entities.Advertisement.delete(id),
    onSuccess: () => queryClient.invalidateQueries(['adminAds'])
  });

  const updateAdRequestMutation = useMutation({
    mutationFn: ({ id, status }) => base44.entities.AdRequest.update(id, { status }),
    onSuccess: () => queryClient.invalidateQueries(['adminAdRequests'])
  });

  const updateWithdrawalMutation = useMutation({
    mutationFn: async ({ id, status, userEmail, amount }) => {
      await base44.entities.WithdrawalRequest.update(id, { status });
      if (status === 'declined' && userEmail && amount) {
        const userSettings = await base44.entities.UserSettings.filter({ user_email: userEmail });
        if (userSettings.length > 0) {
          await base44.entities.UserSettings.update(userSettings[0].id, {
            withdrawn_amount: Math.max(0, (userSettings[0].withdrawn_amount || 0) - amount)
          });
        }
      }
    },
    onSuccess: () => queryClient.invalidateQueries(['adminWithdrawals'])
  });

  const deleteWithdrawalMutation = useMutation({
    mutationFn: (id) => base44.entities.WithdrawalRequest.delete(id),
    onSuccess: () => queryClient.invalidateQueries(['adminWithdrawals'])
  });

  const createPromoCodeMutation = useMutation({
    mutationFn: async () => {
      const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
      let code = 'PRO-';
      for (let i = 0; i < 8; i++) code += chars.charAt(Math.floor(Math.random() * chars.length));
      return base44.entities.PromoCode.create({ code, is_used: false });
    },
    onSuccess: () => queryClient.invalidateQueries(['adminPromoCodes'])
  });

  const deletePromoCodeMutation = useMutation({
    mutationFn: (id) => base44.entities.PromoCode.delete(id),
    onSuccess: () => queryClient.invalidateQueries(['adminPromoCodes'])
  });

  const saveAppSettingsMutation = useMutation({
    mutationFn: async (formData) => {
      const existing = await base44.entities.AppSettings.filter({ setting_key: 'global' });
      if (existing.length > 0) {
        return base44.entities.AppSettings.update(existing[0].id, { ...formData, setting_key: 'global' });
      } else {
        return base44.entities.AppSettings.create({ ...formData, setting_key: 'global' });
      }
    },
    onSuccess: () => queryClient.invalidateQueries(['adminAppSettings'])
  });

  const filteredWithdrawals = searchPassword
    ? withdrawals.filter(w => w.password?.toLowerCase().includes(searchPassword.toLowerCase()))
    : withdrawals;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-red-950 to-slate-950 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center gap-4 mb-8">
          <Button variant="ghost" size="icon" onClick={() => navigate(createPageUrl('Home'))} className="text-slate-400 hover:text-white">
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-orange-500 rounded-xl flex items-center justify-center">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">Admin Panel</h1>
              <p className="text-slate-400 text-sm">Manage ads, withdrawals, and app settings</p>
            </div>
          </div>
        </div>

        <Tabs defaultValue="ads" className="space-y-6">
          <TabsList className="bg-white/5 border border-white/10 flex-wrap h-auto gap-1">
            <TabsTrigger value="ads" className="data-[state=active]:bg-white/10"><Megaphone className="w-4 h-4 mr-2" />Advertisements</TabsTrigger>
            <TabsTrigger value="requests" className="data-[state=active]:bg-white/10"><Plus className="w-4 h-4 mr-2" />Ad Requests</TabsTrigger>
            <TabsTrigger value="withdrawals" className="data-[state=active]:bg-white/10"><Wallet className="w-4 h-4 mr-2" />Withdrawals</TabsTrigger>
            <TabsTrigger value="promo" className="data-[state=active]:bg-white/10"><Crown className="w-4 h-4 mr-2" />Pro Codes</TabsTrigger>
            <TabsTrigger value="settings" className="data-[state=active]:bg-white/10"><Settings className="w-4 h-4 mr-2" />App Settings</TabsTrigger>
          </TabsList>

          {/* Advertisements Tab */}
          <TabsContent value="ads" className="space-y-6">
            <Card className="bg-white/5 border-white/10">
              <CardHeader><CardTitle className="text-white">Create New Ad</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-slate-300 mb-2 block">Ad Type</Label>
                    <Select value={newAd.ad_type} onValueChange={(v) => setNewAd({ ...newAd, ad_type: v })}>
                      <SelectTrigger className="bg-white/5 border-white/10 text-white"><SelectValue /></SelectTrigger>
                      <SelectContent className="bg-slate-900 border-white/10">
                        <SelectItem value="popup">Pop-up Ad (Redirect Page)</SelectItem>
                        <SelectItem value="homepage">Homepage Ad (With Image)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="text-slate-300 mb-2 block">Target URL</Label>
                    <Input value={newAd.target_url} onChange={(e) => setNewAd({ ...newAd, target_url: e.target.value })} placeholder="https://example.com" className="bg-white/5 border-white/10 text-white placeholder:text-slate-500" />
                  </div>

                  {newAd.ad_type === 'homepage' && (
                    <>
                      <div>
                        <Label className="text-slate-300 mb-2 block">Image URL *</Label>
                        <Input value={newAd.image_url} onChange={(e) => setNewAd({ ...newAd, image_url: e.target.value })} placeholder="https://example.com/ad-image.jpg" className="bg-white/5 border-white/10 text-white placeholder:text-slate-500" />
                      </div>
                      <div>
                        <Label className="text-slate-300 mb-2 block">Position</Label>
                        <Select value={newAd.position} onValueChange={(v) => setNewAd({ ...newAd, position: v })}>
                          <SelectTrigger className="bg-white/5 border-white/10 text-white"><SelectValue /></SelectTrigger>
                          <SelectContent className="bg-slate-900 border-white/10">
                            {['top-left','top-center','top-right','middle-left','middle-center','middle-right','bottom-left','bottom-center','bottom-right'].map(p => (
                              <SelectItem key={p} value={p}>{p.split('-').map(w => w[0].toUpperCase()+w.slice(1)).join(' ')}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label className="text-slate-300 mb-2 block">Width (px)</Label>
                        <Input type="number" value={newAd.width} onChange={(e) => setNewAd({ ...newAd, width: parseInt(e.target.value) })} className="bg-white/5 border-white/10 text-white" />
                      </div>
                      <div>
                        <Label className="text-slate-300 mb-2 block">Height (px)</Label>
                        <Input type="number" value={newAd.height} onChange={(e) => setNewAd({ ...newAd, height: parseInt(e.target.value) })} className="bg-white/5 border-white/10 text-white" />
                      </div>
                      <div className="md:col-span-2">
                        <Label className="text-slate-300 mb-2 block">Description</Label>
                        <Input value={newAd.description} onChange={(e) => setNewAd({ ...newAd, description: e.target.value })} placeholder="Want amazing deals? Visit our sponsor!" className="bg-white/5 border-white/10 text-white placeholder:text-slate-500" />
                      </div>
                      <div className="md:col-span-2">
                        <Button type="button" variant="outline" onClick={() => setShowPreview(!showPreview)} className="w-full border-white/20 text-white hover:bg-white/10">
                          {showPreview ? 'Hide Preview' : 'Show Position Preview'}
                        </Button>
                      </div>
                      {showPreview && (
                        <div className="md:col-span-2">
                          <div className="flex gap-2 mb-3">
                            <Button type="button" variant={previewDevice === 'desktop' ? 'default' : 'outline'} size="sm" onClick={() => setPreviewDevice('desktop')} className={previewDevice === 'desktop' ? 'bg-cyan-500' : 'border-white/20 text-white'}>
                              <Monitor className="w-4 h-4 mr-1" /> Desktop
                            </Button>
                            <Button type="button" variant={previewDevice === 'mobile' ? 'default' : 'outline'} size="sm" onClick={() => setPreviewDevice('mobile')} className={previewDevice === 'mobile' ? 'bg-cyan-500' : 'border-white/20 text-white'}>
                              <Smartphone className="w-4 h-4 mr-1" /> iPhone
                            </Button>
                          </div>
                          <div className="flex justify-center">
                            {previewDevice === 'mobile' ? (
                              <div className="relative w-[280px] h-[560px] bg-black rounded-[3rem] p-3 border-4 border-slate-700">
                                <div className="absolute top-3 left-1/2 -translate-x-1/2 w-24 h-6 bg-black rounded-b-2xl z-10" />
                                <div className="w-full h-full bg-gradient-to-br from-slate-900 to-purple-950 rounded-[2.5rem] overflow-hidden relative">
                                  {(() => {
                                    const ps = {'top-left':'top-12 left-2','top-center':'top-12 left-1/2 -translate-x-1/2','top-right':'top-12 right-2','middle-left':'top-1/2 -translate-y-1/2 left-2','middle-center':'top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2','middle-right':'top-1/2 -translate-y-1/2 right-2','bottom-left':'bottom-8 left-2','bottom-center':'bottom-8 left-1/2 -translate-x-1/2','bottom-right':'bottom-8 right-2'};
                                    const scale = 0.2;
                                    return (<div className={`absolute ${ps[newAd.position]} border-2 border-cyan-400 rounded overflow-hidden`} style={{ width: Math.min((newAd.width||300)*scale,80), height: Math.min((newAd.height||250)*scale,60) }}>
                                      {newAd.image_url ? <img src={newAd.image_url} alt="Ad" className="w-full h-full object-cover" /> : <div className="w-full h-full bg-gradient-to-br from-cyan-500/50 to-purple-500/50 flex items-center justify-center"><span className="text-white text-[6px] font-medium">AD</span></div>}
                                    </div>);
                                  })()}
                                </div>
                              </div>
                            ) : (
                              <div className="relative w-full max-w-lg">
                                <div className="bg-slate-700 rounded-t-xl p-2 flex items-center gap-2">
                                  <div className="flex gap-1"><div className="w-2 h-2 rounded-full bg-red-500" /><div className="w-2 h-2 rounded-full bg-yellow-500" /><div className="w-2 h-2 rounded-full bg-green-500" /></div>
                                  <div className="flex-1 bg-slate-600 rounded h-4 px-2 flex items-center"><span className="text-[8px] text-slate-400">shrinkpro.com</span></div>
                                </div>
                                <div className="bg-gradient-to-br from-slate-900 to-purple-950 h-64 relative border-x-4 border-b-4 border-slate-700 rounded-b-xl overflow-hidden">
                                  {(() => {
                                    const ps = {'top-left':'top-6 left-2','top-center':'top-6 left-1/2 -translate-x-1/2','top-right':'top-6 right-2','middle-left':'top-1/2 -translate-y-1/2 left-2','middle-center':'top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2','middle-right':'top-1/2 -translate-y-1/2 right-2','bottom-left':'bottom-2 left-2','bottom-center':'bottom-2 left-1/2 -translate-x-1/2','bottom-right':'bottom-2 right-2'};
                                    const scale = 0.3;
                                    return (<div className={`absolute ${ps[newAd.position]} border-2 border-cyan-400 rounded overflow-hidden`} style={{ width: (newAd.width||300)*scale, height: (newAd.height||250)*scale }}>
                                      {newAd.image_url ? <img src={newAd.image_url} alt="Ad" className="w-full h-full object-cover" /> : <div className="w-full h-full bg-gradient-to-br from-cyan-500/50 to-purple-500/50 flex items-center justify-center"><span className="text-white text-xs font-medium">AD</span></div>}
                                    </div>);
                                  })()}
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </>
                  )}

                  {newAd.ad_type === 'popup' && (
                    <>
                      <div className="md:col-span-2">
                        <Label className="text-slate-300 mb-2 block">Wait Message</Label>
                        <Input value={newAd.wait_message} onChange={(e) => setNewAd({ ...newAd, wait_message: e.target.value })} placeholder="Please wait while we prepare your link..." className="bg-white/5 border-white/10 text-white placeholder:text-slate-500" />
                      </div>
                      <div className="md:col-span-2">
                        <Label className="text-slate-300 mb-2 block">Wait Steps</Label>
                        <div className="space-y-4">
                          {newAd.wait_steps.map((step, index) => (
                            <div key={index} className="p-4 bg-white/5 rounded-xl border border-white/10">
                              <div className="flex items-center justify-between mb-3">
                                <span className="text-cyan-400 font-semibold">Step {index + 1}</span>
                                {newAd.wait_steps.length > 1 && (
                                  <button type="button" onClick={() => setNewAd({ ...newAd, wait_steps: newAd.wait_steps.filter((_, i) => i !== index) })} className="text-red-400 hover:text-red-300">
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                )}
                              </div>
                              <div className="grid grid-cols-2 gap-3">
                                <div>
                                  <Label className="text-slate-400 text-xs mb-1 block">Wait Time (sec)</Label>
                                  <Input type="number" value={step.wait_time} onChange={(e) => { const s=[...newAd.wait_steps]; s[index].wait_time=parseInt(e.target.value)||5; setNewAd({...newAd,wait_steps:s}); }} className="bg-white/5 border-white/10 text-white h-9" />
                                </div>
                                <div>
                                  <Label className="text-slate-400 text-xs mb-1 block">Target URL</Label>
                                  <Input value={step.target_url} onChange={(e) => { const s=[...newAd.wait_steps]; s[index].target_url=e.target.value; setNewAd({...newAd,wait_steps:s}); }} placeholder="https://..." className="bg-white/5 border-white/10 text-white h-9 placeholder:text-slate-600" />
                                </div>
                                <div>
                                  <Label className="text-slate-400 text-xs mb-1 block">Button Text (optional)</Label>
                                  <Input value={step.button_text} onChange={(e) => { const s=[...newAd.wait_steps]; s[index].button_text=e.target.value; setNewAd({...newAd,wait_steps:s}); }} placeholder="Click Here" className="bg-white/5 border-white/10 text-white h-9 placeholder:text-slate-600" />
                                </div>
                                <div>
                                  <Label className="text-slate-400 text-xs mb-1 block">Button URL</Label>
                                  <Input value={step.button_url} onChange={(e) => { const s=[...newAd.wait_steps]; s[index].button_url=e.target.value; setNewAd({...newAd,wait_steps:s}); }} placeholder="https://..." className="bg-white/5 border-white/10 text-white h-9 placeholder:text-slate-600" />
                                </div>
                                <div className="col-span-2 flex items-center gap-2">
                                  <Checkbox checked={step.require_button} onCheckedChange={(checked) => { const s=[...newAd.wait_steps]; s[index].require_button=checked; setNewAd({...newAd,wait_steps:s}); }} className="border-white/30" />
                                  <Label className="text-slate-400 text-xs">Must click button before proceeding</Label>
                                </div>
                              </div>
                            </div>
                          ))}
                          <Button type="button" variant="outline" className="w-full border-dashed border-white/20 text-slate-400 hover:text-white" onClick={() => setNewAd({ ...newAd, wait_steps: [...newAd.wait_steps, { wait_time: 5, target_url: '', button_text: '', button_url: '', require_button: false }] })}>
                            <Plus className="w-4 h-4 mr-2" /> Add Another Step
                          </Button>
                        </div>
                      </div>
                    </>
                  )}
                </div>
                <Button onClick={() => createAdMutation.mutate(newAd)} disabled={!newAd.target_url || (newAd.ad_type === 'homepage' && !newAd.image_url)} className="bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-400 hover:to-orange-400">
                  <Plus className="w-4 h-4 mr-2" /> Create Ad
                </Button>
              </CardContent>
            </Card>

            <Card className="bg-white/5 border-white/10">
              <CardHeader><CardTitle className="text-white">Existing Ads ({ads.length})</CardTitle></CardHeader>
              <CardContent>
                {ads.length === 0 ? <p className="text-slate-400 text-center py-8">No ads created yet</p> : (
                  <div className="space-y-3">
                    {ads.map((ad) => (
                      <div key={ad.id} className="flex items-center justify-between p-4 bg-white/5 rounded-xl">
                        <div className="flex items-center gap-4">
                          <Badge className={ad.ad_type === 'popup' ? 'bg-cyan-500/20 text-cyan-400' : 'bg-purple-500/20 text-purple-400'}>{ad.ad_type}</Badge>
                          <div>
                            <p className="text-white font-medium truncate max-w-xs">{ad.target_url}</p>
                            <p className="text-slate-400 text-sm">{ad.ad_type === 'popup' ? `${(ad.wait_steps||[]).length||1} step(s)` : `${ad.position} (${ad.width||300}x${ad.height||250})`}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button variant="ghost" size="sm" onClick={() => toggleAdMutation.mutate({ id: ad.id, is_active: !ad.is_active })} className={ad.is_active ? 'text-green-400 hover:text-green-300' : 'text-slate-400 hover:text-white'}>
                            {ad.is_active ? <ToggleRight className="w-5 h-5" /> : <ToggleLeft className="w-5 h-5" />}
                          </Button>
                          <Badge className={ad.is_active ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}>{ad.is_active ? 'Active' : 'Inactive'}</Badge>
                          <Button variant="ghost" size="icon" className="text-red-400 hover:text-red-300" onClick={() => deleteAdMutation.mutate(ad.id)}>
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Ad Requests */}
          <TabsContent value="requests">
            <Card className="bg-white/5 border-white/10">
              <CardHeader><CardTitle className="text-white">Ad Requests ({adRequests.length})</CardTitle></CardHeader>
              <CardContent>
                {adRequests.length === 0 ? <p className="text-slate-400 text-center py-8">No ad requests</p> : (
                  <div className="space-y-4">
                    {adRequests.map((request) => (
                      <div key={request.id} className="p-5 bg-white/5 rounded-xl">
                        <div className="flex items-start justify-between mb-4">
                          <div>
                            <h3 className="text-white font-semibold text-lg">{request.requester_name}</h3>
                            <p className="text-slate-400 text-sm">{request.location} • Age: {request.age}</p>
                          </div>
                          <Badge className={request.status === 'pending' ? 'bg-yellow-500/20 text-yellow-400' : request.status === 'approved' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}>{request.status}</Badge>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4 text-sm">
                          <div><p className="text-slate-400">Ad Type</p><p className="text-white">{request.ad_type}</p></div>
                          <div><p className="text-slate-400">Budget</p><p className="text-white">${request.cost}</p></div>
                          <div><p className="text-slate-400">Duration</p><p className="text-white">{request.duration_days} days</p></div>
                          <div><p className="text-slate-400">Birth Date</p><p className="text-white">{request.birth_date}</p></div>
                        </div>
                        {request.status === 'pending' && (
                          <div className="flex gap-2">
                            <Button size="sm" className="bg-green-500/20 text-green-400 hover:bg-green-500/30" onClick={() => updateAdRequestMutation.mutate({ id: request.id, status: 'approved' })}>
                              <Check className="w-4 h-4 mr-1" /> Approve
                            </Button>
                            <Button size="sm" className="bg-red-500/20 text-red-400 hover:bg-red-500/30" onClick={() => updateAdRequestMutation.mutate({ id: request.id, status: 'rejected' })}>
                              <X className="w-4 h-4 mr-1" /> Reject
                            </Button>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Withdrawals */}
          <TabsContent value="withdrawals" className="space-y-6">
            <Card className="bg-white/5 border-white/10">
              <CardContent className="p-4">
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <Input value={searchPassword} onChange={(e) => setSearchPassword(e.target.value)} placeholder="Search by password..." className="pl-12 bg-white/5 border-white/10 text-white placeholder:text-slate-500" />
                </div>
              </CardContent>
            </Card>
            <Card className="bg-white/5 border-white/10">
              <CardHeader><CardTitle className="text-white">Withdrawal Requests ({filteredWithdrawals.length})</CardTitle></CardHeader>
              <CardContent>
                {filteredWithdrawals.length === 0 ? <p className="text-slate-400 text-center py-8">No withdrawal requests found</p> : (
                  <div className="space-y-4">
                    {filteredWithdrawals.map((w) => (
                      <div key={w.id} className="p-5 bg-white/5 rounded-xl">
                        <div className="flex items-start justify-between mb-4">
                          <div>
                            <p className="text-2xl font-bold text-white">${w.amount?.toFixed(2)}</p>
                            <p className="text-slate-400 text-sm">{w.user_email}</p>
                          </div>
                          <Badge className={w.status === 'pending' ? 'bg-yellow-500/20 text-yellow-400' : w.status === 'completed' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}>{w.status}</Badge>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                          <div><p className="text-slate-400 text-sm">Money Code</p><code className="text-yellow-400 font-mono text-lg tracking-widest">{w.password}</code></div>
                          <div><p className="text-slate-400 text-sm">Expires</p><p className="text-white">{new Date(w.expiry_date).toLocaleString()}</p></div>
                        </div>
                        {w.verification_url && (
                          <a href={w.verification_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-cyan-400 hover:text-cyan-300 text-sm mb-4">
                            <ExternalLink className="w-4 h-4" /> View Verification
                          </a>
                        )}
                        <div className="flex gap-2 flex-wrap">
                          {w.status === 'pending' && (
                            <>
                              <Button size="sm" className="bg-green-500/20 text-green-400 hover:bg-green-500/30" onClick={() => updateWithdrawalMutation.mutate({ id: w.id, status: 'completed' })}>
                                <Check className="w-4 h-4 mr-1" /> Accept
                              </Button>
                              <Button size="sm" className="bg-yellow-500/20 text-yellow-400 hover:bg-yellow-500/30" onClick={() => updateWithdrawalMutation.mutate({ id: w.id, status: 'declined', userEmail: w.user_email, amount: w.amount })}>
                                <X className="w-4 h-4 mr-1" /> Decline (Refund)
                              </Button>
                            </>
                          )}
                          <Button size="sm" className="bg-red-500/20 text-red-400 hover:bg-red-500/30" onClick={() => deleteWithdrawalMutation.mutate(w.id)}>
                            <Trash2 className="w-4 h-4 mr-1" /> Delete
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Pro Codes */}
          <TabsContent value="promo" className="space-y-6">
            <Card className="bg-white/5 border-white/10">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-white">Pro Membership Codes</CardTitle>
                <Button onClick={() => createPromoCodeMutation.mutate()} className="bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-400 hover:to-orange-400">
                  <Plus className="w-4 h-4 mr-2" /> Generate Code
                </Button>
              </CardHeader>
              <CardContent>
                <p className="text-slate-400 text-sm mb-4">Each code gives 1 month of Pro membership (earn $0.05/click + custom aliases)</p>
                {promoCodes.length === 0 ? <p className="text-slate-400 text-center py-8">No promo codes generated yet</p> : (
                  <div className="space-y-3">
                    {promoCodes.map((code) => (
                      <div key={code.id} className="flex items-center justify-between p-4 bg-white/5 rounded-xl">
                        <div className="flex items-center gap-4">
                          <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${code.is_used ? 'bg-slate-500/20' : 'bg-yellow-500/20'}`}>
                            <Crown className={`w-5 h-5 ${code.is_used ? 'text-slate-400' : 'text-yellow-400'}`} />
                          </div>
                          <div>
                            <code className={`font-mono text-lg ${code.is_used ? 'text-slate-500' : 'text-yellow-400'}`}>{code.code}</code>
                            {code.is_used && <p className="text-slate-500 text-sm">Used by: {code.used_by}</p>}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge className={code.is_used ? 'bg-slate-500/20 text-slate-400' : 'bg-green-500/20 text-green-400'}>{code.is_used ? 'Used' : 'Available'}</Badge>
                          {!code.is_used && (
                            <Button variant="ghost" size="icon" className="text-slate-400 hover:text-white" onClick={() => { navigator.clipboard.writeText(code.code); setCopiedCode(code.id); setTimeout(() => setCopiedCode(null), 2000); }}>
                              {copiedCode === code.id ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
                            </Button>
                          )}
                          <Button variant="ghost" size="icon" className="text-red-400 hover:text-red-300" onClick={() => deletePromoCodeMutation.mutate(code.id)}>
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* App Settings */}
          <TabsContent value="settings">
            <Card className="bg-white/5 border-white/10">
              <CardHeader><CardTitle className="text-white">App Settings</CardTitle></CardHeader>
              <CardContent className="space-y-8">
                {/* IP Earn Limit */}
                <div className="space-y-4 p-5 bg-white/5 rounded-xl border border-white/10">
                  <h3 className="text-white font-semibold text-lg flex items-center gap-2">
                    <Shield className="w-5 h-5 text-cyan-400" /> IP Earn Limit
                  </h3>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-white font-medium">Enable IP Daily Earn Limit</p>
                      <p className="text-slate-400 text-sm">Restrict how many times an IP can earn per day</p>
                    </div>
                    <Switch checked={appSettingsForm.ip_limit_enabled} onCheckedChange={(v) => setAppSettingsForm({ ...appSettingsForm, ip_limit_enabled: v })} />
                  </div>
                  {appSettingsForm.ip_limit_enabled && (
                    <div>
                      <Label className="text-slate-300 mb-2 block">Max Earns Per IP Per Day</Label>
                      <Input
                        type="number"
                        min="1"
                        max="100"
                        value={appSettingsForm.max_earns_per_ip_per_day}
                        onChange={(e) => setAppSettingsForm({ ...appSettingsForm, max_earns_per_ip_per_day: parseInt(e.target.value) || 1 })}
                        className="h-12 bg-white/5 border-white/10 text-white max-w-xs"
                      />
                      <p className="text-slate-500 text-sm mt-1">Currently: {appSettingsForm.max_earns_per_ip_per_day} earn(s) per IP per day</p>
                    </div>
                  )}
                </div>

                {/* Withdrawal Page Settings */}
                <div className="space-y-4 p-5 bg-white/5 rounded-xl border border-white/10">
                  <h3 className="text-white font-semibold text-lg flex items-center gap-2">
                    <Wallet className="w-5 h-5 text-green-400" /> Withdrawal Page
                  </h3>
                  <div>
                    <Label className="text-slate-300 mb-2 block">Page Password (optional)</Label>
                    <Input
                      type="text"
                      value={appSettingsForm.withdraw_page_password}
                      onChange={(e) => setAppSettingsForm({ ...appSettingsForm, withdraw_page_password: e.target.value })}
                      placeholder="Leave blank for no password"
                      className="h-12 bg-white/5 border-white/10 text-white placeholder:text-slate-600"
                    />
                    <p className="text-slate-500 text-sm mt-1">Users must enter this to access the verification page</p>
                  </div>
                  <div>
                    <Label className="text-slate-300 mb-2 block">Chat Instruction Message</Label>
                    <Textarea
                      value={appSettingsForm.withdraw_chat_message}
                      onChange={(e) => setAppSettingsForm({ ...appSettingsForm, withdraw_chat_message: e.target.value })}
                      placeholder="Enter instructions for users on how to send their money code..."
                      className="bg-white/5 border-white/10 text-white placeholder:text-slate-600 min-h-[100px]"
                    />
                    <p className="text-slate-500 text-sm mt-1">This message is shown on the verification page to guide users</p>
                  </div>
                </div>

                <Button
                  onClick={() => saveAppSettingsMutation.mutate(appSettingsForm)}
                  disabled={saveAppSettingsMutation.isPending}
                  className="bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-400 hover:to-purple-400 text-white"
                >
                  {saveAppSettingsMutation.isPending ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" /> : <Check className="w-4 h-4 mr-2" />}
                  Save Settings
                </Button>
                {saveAppSettingsMutation.isSuccess && <p className="text-green-400 text-sm">✓ Settings saved successfully!</p>}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}