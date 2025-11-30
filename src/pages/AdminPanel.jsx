import React, { useState } from 'react';
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
import { 
  Shield, Megaphone, Wallet, Search, Plus, Trash2, 
  Check, X, ExternalLink, ArrowLeft
} from 'lucide-react';

export default function AdminPanel() {
  const [searchPassword, setSearchPassword] = useState('');
  const [newAd, setNewAd] = useState({
    ad_type: 'popup',
    image_url: '',
    description: '',
    target_url: '',
    position: 'bottom-right',
    width: 300,
    height: 250,
    wait_times: [5],
    wait_message: 'Please wait...',
    is_active: true
  });
  const [showPreview, setShowPreview] = useState(false);
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // Queries
  const { data: ads = [] } = useQuery({
    queryKey: ['adminAds'],
    queryFn: () => base44.entities.Advertisement.list('-created_date')
  });

  const { data: adRequests = [] } = useQuery({
    queryKey: ['adminAdRequests'],
    queryFn: () => base44.entities.AdRequest.list('-created_date')
  });

  const { data: withdrawals = [] } = useQuery({
    queryKey: ['adminWithdrawals'],
    queryFn: () => base44.entities.WithdrawalRequest.list('-created_date')
  });

  // Mutations
  const createAdMutation = useMutation({
    mutationFn: (data) => base44.entities.Advertisement.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries(['adminAds']);
      setNewAd({
        ad_type: 'popup',
        image_url: '',
        description: '',
        target_url: '',
        position: 'bottom-right',
        width: 300,
        height: 250,
        wait_times: [5],
        wait_message: 'Please wait...',
        is_active: true
      });
      setShowPreview(false);
    }
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
      // If declined, refund the money back to user's available balance
      if (status === 'declined' && userEmail && amount) {
        const userSettings = await base44.entities.UserSettings.filter({ user_email: userEmail });
        if (userSettings.length > 0) {
          const settings = userSettings[0];
          await base44.entities.UserSettings.update(settings.id, {
            withdrawn_amount: Math.max(0, (settings.withdrawn_amount || 0) - amount)
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

  const filteredWithdrawals = searchPassword 
    ? withdrawals.filter(w => w.password?.toLowerCase().includes(searchPassword.toLowerCase()))
    : withdrawals;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-red-950 to-slate-950 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate(createPageUrl('Home'))}
            className="text-slate-400 hover:text-white"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-orange-500 rounded-xl flex items-center justify-center">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">Admin Panel</h1>
              <p className="text-slate-400 text-sm">Manage ads and withdrawals</p>
            </div>
          </div>
        </div>

        <Tabs defaultValue="ads" className="space-y-6">
          <TabsList className="bg-white/5 border border-white/10">
            <TabsTrigger value="ads" className="data-[state=active]:bg-white/10">
              <Megaphone className="w-4 h-4 mr-2" />
              Advertisements
            </TabsTrigger>
            <TabsTrigger value="requests" className="data-[state=active]:bg-white/10">
              <Plus className="w-4 h-4 mr-2" />
              Ad Requests
            </TabsTrigger>
            <TabsTrigger value="withdrawals" className="data-[state=active]:bg-white/10">
              <Wallet className="w-4 h-4 mr-2" />
              Withdrawals
            </TabsTrigger>
          </TabsList>

          {/* Advertisements Tab */}
          <TabsContent value="ads" className="space-y-6">
            {/* Create New Ad */}
            <Card className="bg-white/5 border-white/10">
              <CardHeader>
                <CardTitle className="text-white">Create New Ad</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label className="text-slate-300 mb-2 block">Ad Type</Label>
                      <Select
                        value={newAd.ad_type}
                        onValueChange={(v) => setNewAd({ ...newAd, ad_type: v })}
                      >
                        <SelectTrigger className="bg-white/5 border-white/10 text-white">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-slate-900 border-white/10">
                          <SelectItem value="popup">Pop-up Ad (Redirect Page)</SelectItem>
                          <SelectItem value="homepage">Homepage Ad (With Image)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label className="text-slate-300 mb-2 block">Target URL</Label>
                      <Input
                        value={newAd.target_url}
                        onChange={(e) => setNewAd({ ...newAd, target_url: e.target.value })}
                        placeholder="https://example.com"
                        className="bg-white/5 border-white/10 text-white placeholder:text-slate-500"
                      />
                    </div>

                    {newAd.ad_type === 'homepage' && (
                      <>
                        <div>
                          <Label className="text-slate-300 mb-2 block">Image URL *</Label>
                          <Input
                            value={newAd.image_url}
                            onChange={(e) => setNewAd({ ...newAd, image_url: e.target.value })}
                            placeholder="https://example.com/ad-image.jpg"
                            className="bg-white/5 border-white/10 text-white placeholder:text-slate-500"
                          />
                        </div>

                        <div>
                          <Label className="text-slate-300 mb-2 block">Position</Label>
                          <Select
                            value={newAd.position}
                            onValueChange={(v) => setNewAd({ ...newAd, position: v })}
                          >
                            <SelectTrigger className="bg-white/5 border-white/10 text-white">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent className="bg-slate-900 border-white/10">
                              <SelectItem value="top-left">Top Left</SelectItem>
                              <SelectItem value="top-center">Top Center</SelectItem>
                              <SelectItem value="top-right">Top Right</SelectItem>
                              <SelectItem value="middle-left">Middle Left</SelectItem>
                              <SelectItem value="middle-center">Middle Center</SelectItem>
                              <SelectItem value="middle-right">Middle Right</SelectItem>
                              <SelectItem value="bottom-left">Bottom Left</SelectItem>
                              <SelectItem value="bottom-center">Bottom Center</SelectItem>
                              <SelectItem value="bottom-right">Bottom Right</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div>
                          <Label className="text-slate-300 mb-2 block">Width (px)</Label>
                          <Input
                            type="number"
                            value={newAd.width}
                            onChange={(e) => setNewAd({ ...newAd, width: parseInt(e.target.value) })}
                            placeholder="300"
                            className="bg-white/5 border-white/10 text-white"
                          />
                        </div>

                        <div>
                          <Label className="text-slate-300 mb-2 block">Height (px)</Label>
                          <Input
                            type="number"
                            value={newAd.height}
                            onChange={(e) => setNewAd({ ...newAd, height: parseInt(e.target.value) })}
                            placeholder="250"
                            className="bg-white/5 border-white/10 text-white"
                          />
                        </div>

                        <div className="md:col-span-2">
                          <Label className="text-slate-300 mb-2 block">Description</Label>
                          <Input
                            value={newAd.description}
                            onChange={(e) => setNewAd({ ...newAd, description: e.target.value })}
                            placeholder="Want amazing deals? Visit our sponsor!"
                            className="bg-white/5 border-white/10 text-white placeholder:text-slate-500"
                          />
                        </div>

                        <div className="md:col-span-2">
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => setShowPreview(!showPreview)}
                            className="w-full border-white/20 text-white hover:bg-white/10"
                          >
                            {showPreview ? 'Hide Preview' : 'Show Position Preview'}
                          </Button>
                        </div>

                        {showPreview && (
                          <div className="md:col-span-2 relative bg-slate-800 rounded-xl h-64 border border-white/10 overflow-hidden">
                            <p className="absolute top-2 left-2 text-xs text-slate-500">Homepage Preview</p>
                            {(() => {
                              const positionStyles = {
                                'top-left': 'top-2 left-2',
                                'top-center': 'top-2 left-1/2 -translate-x-1/2',
                                'top-right': 'top-2 right-2',
                                'middle-left': 'top-1/2 -translate-y-1/2 left-2',
                                'middle-center': 'top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2',
                                'middle-right': 'top-1/2 -translate-y-1/2 right-2',
                                'bottom-left': 'bottom-2 left-2',
                                'bottom-center': 'bottom-2 left-1/2 -translate-x-1/2',
                                'bottom-right': 'bottom-2 right-2'
                              };
                              const scale = 0.3;
                              return (
                                <div 
                                  className={`absolute ${positionStyles[newAd.position]} bg-gradient-to-br from-cyan-500/50 to-purple-500/50 border-2 border-cyan-400 rounded flex items-center justify-center`}
                                  style={{ 
                                    width: (newAd.width || 300) * scale, 
                                    height: (newAd.height || 250) * scale 
                                  }}
                                >
                                  <span className="text-white text-xs font-medium">AD</span>
                                </div>
                              );
                            })()}
                          </div>
                        )}
                      </>
                    )}

                    {newAd.ad_type === 'popup' && (
                      <>
                        <div className="md:col-span-2">
                          <Label className="text-slate-300 mb-2 block">Wait Times (seconds)</Label>
                          <div className="flex flex-wrap gap-2 mb-2">
                            {newAd.wait_times.map((time, index) => (
                              <div key={index} className="flex items-center gap-1 bg-white/10 rounded-lg px-3 py-1">
                                <span className="text-cyan-400 font-mono">{time}s</span>
                                <button 
                                  type="button"
                                  onClick={() => {
                                    const newTimes = newAd.wait_times.filter((_, i) => i !== index);
                                    setNewAd({ ...newAd, wait_times: newTimes.length ? newTimes : [5] });
                                  }}
                                  className="text-red-400 hover:text-red-300 ml-1"
                                >
                                  <X className="w-3 h-3" />
                                </button>
                              </div>
                            ))}
                          </div>
                          <div className="flex gap-2">
                            <Input
                              type="number"
                              placeholder="Add wait time"
                              className="bg-white/5 border-white/10 text-white w-32"
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                  e.preventDefault();
                                  const val = parseInt(e.target.value);
                                  if (val > 0) {
                                    setNewAd({ ...newAd, wait_times: [...newAd.wait_times, val] });
                                    e.target.value = '';
                                  }
                                }
                              }}
                            />
                            <Button
                              type="button"
                              variant="outline"
                              className="border-white/20 text-white"
                              onClick={(e) => {
                                const input = e.target.parentElement.querySelector('input');
                                const val = parseInt(input.value);
                                if (val > 0) {
                                  setNewAd({ ...newAd, wait_times: [...newAd.wait_times, val] });
                                  input.value = '';
                                }
                              }}
                            >
                              <Plus className="w-4 h-4" />
                            </Button>
                          </div>
                          <p className="text-slate-500 text-xs mt-1">Each wait time opens a new tab. Add multiple for multiple popups.</p>
                        </div>
                        <div className="md:col-span-2">
                          <Label className="text-slate-300 mb-2 block">Wait Message</Label>
                          <Input
                            value={newAd.wait_message}
                            onChange={(e) => setNewAd({ ...newAd, wait_message: e.target.value })}
                            placeholder="Please wait while we prepare your link..."
                            className="bg-white/5 border-white/10 text-white placeholder:text-slate-500"
                          />
                        </div>
                      </>
                    )}
                  </div>

                  <Button
                    onClick={() => createAdMutation.mutate(newAd)}
                    disabled={!newAd.target_url || (newAd.ad_type === 'homepage' && !newAd.image_url)}
                    className="bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-400 hover:to-orange-400"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Create Ad
                  </Button>
              </CardContent>
            </Card>

            {/* Existing Ads */}
            <Card className="bg-white/5 border-white/10">
              <CardHeader>
                <CardTitle className="text-white">Existing Ads ({ads.length})</CardTitle>
              </CardHeader>
              <CardContent>
                {ads.length === 0 ? (
                  <p className="text-slate-400 text-center py-8">No ads created yet</p>
                ) : (
                  <div className="space-y-3">
                    {ads.map((ad) => (
                      <div key={ad.id} className="flex items-center justify-between p-4 bg-white/5 rounded-xl">
                        <div className="flex items-center gap-4">
                          <Badge className={ad.ad_type === 'popup' ? 'bg-cyan-500/20 text-cyan-400' : 'bg-purple-500/20 text-purple-400'}>
                            {ad.ad_type}
                          </Badge>
                          <div>
                            <p className="text-white font-medium truncate max-w-xs">{ad.target_url}</p>
                            <p className="text-slate-400 text-sm">
                                  {ad.ad_type === 'popup' 
                                    ? `Wait ${(ad.wait_times || [5]).join('s → ')}s - "${ad.wait_message || 'Please wait...'}"` 
                                    : `${ad.position} (${ad.width || 300}x${ad.height || 250})`}
                                </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge className={ad.is_active ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}>
                            {ad.is_active ? 'Active' : 'Inactive'}
                          </Badge>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-red-400 hover:text-red-300"
                            onClick={() => deleteAdMutation.mutate(ad.id)}
                          >
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

          {/* Ad Requests Tab */}
          <TabsContent value="requests">
            <Card className="bg-white/5 border-white/10">
              <CardHeader>
                <CardTitle className="text-white">Ad Requests ({adRequests.length})</CardTitle>
              </CardHeader>
              <CardContent>
                {adRequests.length === 0 ? (
                  <p className="text-slate-400 text-center py-8">No ad requests</p>
                ) : (
                  <div className="space-y-4">
                    {adRequests.map((request) => (
                      <div key={request.id} className="p-5 bg-white/5 rounded-xl">
                        <div className="flex items-start justify-between mb-4">
                          <div>
                            <h3 className="text-white font-semibold text-lg">{request.requester_name}</h3>
                            <p className="text-slate-400 text-sm">{request.location} • Age: {request.age}</p>
                          </div>
                          <Badge className={
                            request.status === 'pending' ? 'bg-yellow-500/20 text-yellow-400' :
                            request.status === 'approved' ? 'bg-green-500/20 text-green-400' :
                            'bg-red-500/20 text-red-400'
                          }>
                            {request.status}
                          </Badge>
                        </div>
                        
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4 text-sm">
                          <div>
                            <p className="text-slate-400">Ad Type</p>
                            <p className="text-white">{request.ad_type}</p>
                          </div>
                          <div>
                            <p className="text-slate-400">Budget</p>
                            <p className="text-white">${request.cost}</p>
                          </div>
                          <div>
                            <p className="text-slate-400">Duration</p>
                            <p className="text-white">{request.duration_days} days</p>
                          </div>
                          <div>
                            <p className="text-slate-400">Birth Date</p>
                            <p className="text-white">{request.birth_date}</p>
                          </div>
                        </div>

                        {request.status === 'pending' && (
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              className="bg-green-500/20 text-green-400 hover:bg-green-500/30"
                              onClick={() => updateAdRequestMutation.mutate({ id: request.id, status: 'approved' })}
                            >
                              <Check className="w-4 h-4 mr-1" /> Approve
                            </Button>
                            <Button
                              size="sm"
                              className="bg-red-500/20 text-red-400 hover:bg-red-500/30"
                              onClick={() => updateAdRequestMutation.mutate({ id: request.id, status: 'rejected' })}
                            >
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

          {/* Withdrawals Tab */}
          <TabsContent value="withdrawals" className="space-y-6">
            {/* Search */}
            <Card className="bg-white/5 border-white/10">
              <CardContent className="p-4">
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <Input
                    value={searchPassword}
                    onChange={(e) => setSearchPassword(e.target.value)}
                    placeholder="Search by password..."
                    className="pl-12 bg-white/5 border-white/10 text-white placeholder:text-slate-500"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Withdrawals List */}
            <Card className="bg-white/5 border-white/10">
              <CardHeader>
                <CardTitle className="text-white">Withdrawal Requests ({filteredWithdrawals.length})</CardTitle>
              </CardHeader>
              <CardContent>
                {filteredWithdrawals.length === 0 ? (
                  <p className="text-slate-400 text-center py-8">No withdrawal requests found</p>
                ) : (
                  <div className="space-y-4">
                    {filteredWithdrawals.map((withdrawal) => (
                      <div key={withdrawal.id} className="p-5 bg-white/5 rounded-xl">
                        <div className="flex items-start justify-between mb-4">
                          <div>
                            <p className="text-2xl font-bold text-white">${withdrawal.amount?.toFixed(2)}</p>
                            <p className="text-slate-400 text-sm">{withdrawal.user_email}</p>
                          </div>
                          <Badge className={
                            withdrawal.status === 'pending' ? 'bg-yellow-500/20 text-yellow-400' :
                            withdrawal.status === 'completed' ? 'bg-green-500/20 text-green-400' :
                            'bg-red-500/20 text-red-400'
                          }>
                            {withdrawal.status}
                          </Badge>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                          <div>
                            <p className="text-slate-400 text-sm">Password</p>
                            <code className="text-cyan-400 font-mono">{withdrawal.password}</code>
                          </div>
                          <div>
                            <p className="text-slate-400 text-sm">Expires</p>
                            <p className="text-white">{new Date(withdrawal.expiry_date).toLocaleString()}</p>
                          </div>
                        </div>

                        {withdrawal.verification_url && (
                          <a
                            href={withdrawal.verification_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-2 text-cyan-400 hover:text-cyan-300 text-sm mb-4"
                          >
                            <ExternalLink className="w-4 h-4" />
                            View Verification
                          </a>
                        )}

                        <div className="flex gap-2 flex-wrap">
                          {withdrawal.status === 'pending' && (
                            <>
                              <Button
                                size="sm"
                                className="bg-green-500/20 text-green-400 hover:bg-green-500/30"
                                onClick={() => updateWithdrawalMutation.mutate({ id: withdrawal.id, status: 'completed' })}
                              >
                                <Check className="w-4 h-4 mr-1" /> Accept
                              </Button>
                              <Button
                                size="sm"
                                className="bg-yellow-500/20 text-yellow-400 hover:bg-yellow-500/30"
                                onClick={() => updateWithdrawalMutation.mutate({ 
                                  id: withdrawal.id, 
                                  status: 'declined',
                                  userEmail: withdrawal.user_email,
                                  amount: withdrawal.amount
                                })}
                              >
                                <X className="w-4 h-4 mr-1" /> Decline (Refund)
                              </Button>
                            </>
                          )}
                          <Button
                            size="sm"
                            className="bg-red-500/20 text-red-400 hover:bg-red-500/30"
                            onClick={() => deleteWithdrawalMutation.mutate(withdrawal.id)}
                          >
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
        </Tabs>
      </div>
    </div>
  );
}