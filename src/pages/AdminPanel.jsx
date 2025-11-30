import React, { useState } from 'react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { 
  Shield, Lock, Plus, Image as ImageIcon, 
  Search, Check, X, Trash2, ExternalLink,
  Loader2, Link2
} from "lucide-react";
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { format } from 'date-fns';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

const ADMIN_PASSWORD = '20140626';

export default function AdminPanel() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [searchPassword, setSearchPassword] = useState('');
  const [showCreateAd, setShowCreateAd] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [newAd, setNewAd] = useState({
    ad_type: 'popup',
    image_url: '',
    target_url: '',
    position: 'center',
    delay_seconds: 5,
    is_active: true
  });

  const queryClient = useQueryClient();

  const { data: withdrawals = [] } = useQuery({
    queryKey: ['allWithdrawals'],
    queryFn: () => base44.entities.WithdrawalRequest.list(),
    enabled: isAuthenticated
  });

  const { data: adRequests = [] } = useQuery({
    queryKey: ['allAdRequests'],
    queryFn: () => base44.entities.AdRequest.list(),
    enabled: isAuthenticated
  });

  const { data: ads = [] } = useQuery({
    queryKey: ['allAds'],
    queryFn: () => base44.entities.Advertisement.list(),
    enabled: isAuthenticated
  });

  const handleLogin = (e) => {
    e.preventDefault();
    if (password === ADMIN_PASSWORD) {
      setIsAuthenticated(true);
      setError('');
    } else {
      setError('Incorrect password');
    }
  };

  const updateWithdrawalMutation = useMutation({
    mutationFn: ({ id, status }) => base44.entities.WithdrawalRequest.update(id, { status }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['allWithdrawals'] })
  });

  const updateAdRequestMutation = useMutation({
    mutationFn: ({ id, status }) => base44.entities.AdRequest.update(id, { status }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['allAdRequests'] })
  });

  const createAdMutation = useMutation({
    mutationFn: (data) => base44.entities.Advertisement.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['allAds'] });
      setShowCreateAd(false);
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
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['allAds'] })
  });

  const toggleAdMutation = useMutation({
    mutationFn: ({ id, is_active }) => base44.entities.Advertisement.update(id, { is_active }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['allAds'] })
  });

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);
    const { file_url } = await base44.integrations.Core.UploadFile({ file });
    setNewAd(prev => ({ ...prev, image_url: file_url }));
    setUploading(false);
  };

  const filteredWithdrawals = searchPassword
    ? withdrawals.filter(w => w.password?.toLowerCase().includes(searchPassword.toLowerCase()))
    : withdrawals;

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
        <Card className="w-full max-w-md bg-slate-900 border-slate-800 p-8">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-gradient-to-br from-red-500 to-orange-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Shield className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-white">Admin Panel</h1>
            <p className="text-slate-400 mt-1">Enter password to continue</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
              <Input
                type="password"
                placeholder="Enter admin password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="pl-12 h-12 bg-slate-800 border-slate-700 text-white"
              />
            </div>
            {error && (
              <p className="text-red-500 text-sm">{error}</p>
            )}
            <Button
              type="submit"
              className="w-full h-12 bg-gradient-to-r from-red-600 to-orange-600"
            >
              Access Panel
            </Button>
          </form>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center gap-4 mb-8">
          <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-orange-500 rounded-xl flex items-center justify-center">
            <Shield className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">Admin Panel</h1>
            <p className="text-slate-400">shrinkpro.xyz administration</p>
          </div>
        </div>

        <Tabs defaultValue="withdrawals" className="space-y-6">
          <TabsList className="bg-slate-900 border border-slate-800">
            <TabsTrigger value="withdrawals">Withdrawals</TabsTrigger>
            <TabsTrigger value="ad-requests">Ad Requests</TabsTrigger>
            <TabsTrigger value="ads">Manage Ads</TabsTrigger>
          </TabsList>

          {/* Withdrawals Tab */}
          <TabsContent value="withdrawals">
            <Card className="bg-slate-900 border-slate-800 p-6">
              <div className="flex items-center gap-4 mb-6">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <Input
                    placeholder="Search by password..."
                    value={searchPassword}
                    onChange={(e) => setSearchPassword(e.target.value)}
                    className="pl-10 bg-slate-800 border-slate-700 text-white"
                  />
                </div>
              </div>

              <div className="space-y-3">
                {filteredWithdrawals.length === 0 ? (
                  <p className="text-center text-slate-500 py-8">No withdrawal requests found</p>
                ) : (
                  filteredWithdrawals.map((w) => (
                    <div key={w.id} className="bg-slate-800 rounded-xl p-4 flex items-center gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3">
                          <p className="text-white font-semibold">${w.amount?.toFixed(2)}</p>
                          <Badge variant={
                            w.status === 'completed' ? 'default' :
                            w.status === 'expired' ? 'destructive' : 'secondary'
                          }>
                            {w.status}
                          </Badge>
                        </div>
                        <p className="text-slate-400 text-sm">Password: {w.password}</p>
                        <p className="text-slate-500 text-xs">{w.user_email}</p>
                      </div>
                      {w.status === 'pending' && (
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            onClick={() => updateWithdrawalMutation.mutate({ id: w.id, status: 'completed' })}
                            className="bg-green-600 hover:bg-green-700"
                          >
                            <Check className="w-4 h-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => updateWithdrawalMutation.mutate({ id: w.id, status: 'expired' })}
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            </Card>
          </TabsContent>

          {/* Ad Requests Tab */}
          <TabsContent value="ad-requests">
            <Card className="bg-slate-900 border-slate-800 p-6">
              <div className="space-y-3">
                {adRequests.length === 0 ? (
                  <p className="text-center text-slate-500 py-8">No ad requests</p>
                ) : (
                  adRequests.map((req) => (
                    <div key={req.id} className="bg-slate-800 rounded-xl p-4">
                      <div className="flex items-start gap-4">
                        {req.image_url && (
                          <img src={req.image_url} alt="Ad" className="w-20 h-20 rounded-lg object-cover" />
                        )}
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <p className="text-white font-semibold">{req.requester_name}</p>
                            <Badge variant={
                              req.status === 'approved' ? 'default' :
                              req.status === 'rejected' ? 'destructive' : 'secondary'
                            }>
                              {req.status}
                            </Badge>
                          </div>
                          <p className="text-slate-400 text-sm">
                            Type: {req.ad_type} | Cost: ${req.cost} | Duration: {req.duration_days} days
                          </p>
                          <p className="text-slate-500 text-xs">
                            Age: {req.age} | From: {req.location}
                          </p>
                        </div>
                        {req.status === 'pending' && (
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              onClick={() => updateAdRequestMutation.mutate({ id: req.id, status: 'approved' })}
                              className="bg-green-600 hover:bg-green-700"
                            >
                              <Check className="w-4 h-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => updateAdRequestMutation.mutate({ id: req.id, status: 'rejected' })}
                            >
                              <X className="w-4 h-4" />
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </Card>
          </TabsContent>

          {/* Manage Ads Tab */}
          <TabsContent value="ads">
            <Card className="bg-slate-900 border-slate-800 p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold text-white">Active Advertisements</h2>
                <Dialog open={showCreateAd} onOpenChange={setShowCreateAd}>
                  <DialogTrigger asChild>
                    <Button className="bg-gradient-to-r from-purple-600 to-blue-600">
                      <Plus className="w-4 h-4 mr-2" />
                      Create Ad
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="bg-slate-900 border-slate-800 text-white">
                    <DialogHeader>
                      <DialogTitle>Create New Advertisement</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <Label>Ad Type</Label>
                        <Select
                          value={newAd.ad_type}
                          onValueChange={(value) => setNewAd(prev => ({ ...prev, ad_type: value }))}
                        >
                          <SelectTrigger className="bg-slate-800 border-slate-700">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="popup">Pop Up Ad</SelectItem>
                            <SelectItem value="homepage">Home Page Ad</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <Label>Target URL</Label>
                        <Input
                          value={newAd.target_url}
                          onChange={(e) => setNewAd(prev => ({ ...prev, target_url: e.target.value }))}
                          className="bg-slate-800 border-slate-700"
                          placeholder="https://..."
                        />
                      </div>

                      {newAd.ad_type === 'popup' && (
                        <div>
                          <Label>Delay (seconds)</Label>
                          <Input
                            type="number"
                            value={newAd.delay_seconds}
                            onChange={(e) => setNewAd(prev => ({ ...prev, delay_seconds: parseInt(e.target.value) }))}
                            className="bg-slate-800 border-slate-700"
                          />
                        </div>
                      )}

                      <div>
                        <Label>Position</Label>
                        <Select
                          value={newAd.position}
                          onValueChange={(value) => setNewAd(prev => ({ ...prev, position: value }))}
                        >
                          <SelectTrigger className="bg-slate-800 border-slate-700">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="top">Top</SelectItem>
                            <SelectItem value="bottom">Bottom</SelectItem>
                            <SelectItem value="center">Center</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <Label>Image</Label>
                        <div className="border-2 border-dashed border-slate-700 rounded-xl p-4 text-center">
                          {newAd.image_url ? (
                            <div>
                              <img src={newAd.image_url} alt="Preview" className="max-h-32 mx-auto rounded mb-2" />
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setNewAd(prev => ({ ...prev, image_url: '' }))}
                              >
                                Remove
                              </Button>
                            </div>
                          ) : (
                            <label className="cursor-pointer">
                              <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
                              {uploading ? (
                                <Loader2 className="w-6 h-6 animate-spin mx-auto" />
                              ) : (
                                <ImageIcon className="w-8 h-8 mx-auto text-slate-600" />
                              )}
                            </label>
                          )}
                        </div>
                      </div>

                      <Button
                        onClick={() => createAdMutation.mutate(newAd)}
                        disabled={createAdMutation.isPending}
                        className="w-full bg-gradient-to-r from-purple-600 to-blue-600"
                      >
                        Create Advertisement
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>

              <div className="space-y-3">
                {ads.length === 0 ? (
                  <p className="text-center text-slate-500 py-8">No advertisements created</p>
                ) : (
                  ads.map((ad) => (
                    <div key={ad.id} className="bg-slate-800 rounded-xl p-4 flex items-center gap-4">
                      {ad.image_url && (
                        <img src={ad.image_url} alt="Ad" className="w-16 h-16 rounded-lg object-cover" />
                      )}
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <Badge variant={ad.is_active ? 'default' : 'secondary'}>
                            {ad.ad_type}
                          </Badge>
                          <Badge variant={ad.is_active ? 'default' : 'outline'}>
                            {ad.is_active ? 'Active' : 'Inactive'}
                          </Badge>
                        </div>
                        <p className="text-slate-400 text-sm mt-1 truncate">{ad.target_url}</p>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="icon"
                          variant="outline"
                          onClick={() => toggleAdMutation.mutate({ id: ad.id, is_active: !ad.is_active })}
                          className="border-slate-700"
                        >
                          {ad.is_active ? <X className="w-4 h-4" /> : <Check className="w-4 h-4" />}
                        </Button>
                        <Button
                          size="icon"
                          variant="destructive"
                          onClick={() => deleteAdMutation.mutate(ad.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}