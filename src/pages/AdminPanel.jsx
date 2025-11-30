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
    target_url: '',
    position: 'center',
    delay_seconds: 5,
    is_active: true
  });
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
        target_url: '',
        position: 'center',
        delay_seconds: 5,
        is_active: true
      });
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
    mutationFn: ({ id, status }) => base44.entities.WithdrawalRequest.update(id, { status }),
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
                        <SelectItem value="popup">Pop-up Ad</SelectItem>
                        <SelectItem value="homepage">Homepage Ad</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {newAd.ad_type === 'homepage' && (
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
                          <SelectItem value="top">Top</SelectItem>
                          <SelectItem value="center">Center</SelectItem>
                          <SelectItem value="bottom">Bottom</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  )}

                  {newAd.ad_type === 'popup' && (
                    <div>
                      <Label className="text-slate-300 mb-2 block">Delay (seconds)</Label>
                      <Input
                        type="number"
                        value={newAd.delay_seconds}
                        onChange={(e) => setNewAd({ ...newAd, delay_seconds: parseInt(e.target.value) })}
                        className="bg-white/5 border-white/10 text-white"
                      />
                    </div>
                  )}

                  <div>
                    <Label className="text-slate-300 mb-2 block">Image URL</Label>
                    <Input
                      value={newAd.image_url}
                      onChange={(e) => setNewAd({ ...newAd, image_url: e.target.value })}
                      placeholder="https://example.com/ad-image.jpg"
                      className="bg-white/5 border-white/10 text-white placeholder:text-slate-500"
                    />
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
                </div>

                <Button
                  onClick={() => createAdMutation.mutate(newAd)}
                  disabled={!newAd.target_url}
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
                              {ad.ad_type === 'popup' ? `${ad.delay_seconds}s delay` : ad.position}
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

                        {withdrawal.status === 'pending' && (
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              className="bg-green-500/20 text-green-400 hover:bg-green-500/30"
                              onClick={() => updateWithdrawalMutation.mutate({ id: withdrawal.id, status: 'completed' })}
                            >
                              <Check className="w-4 h-4 mr-1" /> Mark Completed
                            </Button>
                            <Button
                              size="sm"
                              className="bg-red-500/20 text-red-400 hover:bg-red-500/30"
                              onClick={() => updateWithdrawalMutation.mutate({ id: withdrawal.id, status: 'expired' })}
                            >
                              <X className="w-4 h-4 mr-1" /> Mark Expired
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
        </Tabs>
      </div>
    </div>
  );
}