import React, { useState, useEffect } from 'react';
import Sidebar from '@/components/Sidebar';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { 
  Copy, Check, ExternalLink, Trash2, Search, 
  MousePointer, DollarSign, Calendar, Edit2, X
} from "lucide-react";
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { format } from 'date-fns';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";

export default function MyLinks() {
  const [theme, setTheme] = useState('light');
  const [search, setSearch] = useState('');
  const [copiedId, setCopiedId] = useState(null);
  const [editingLink, setEditingLink] = useState(null);
  const queryClient = useQueryClient();

  const { data: settings } = useQuery({
    queryKey: ['userSettings'],
    queryFn: async () => {
      const user = await base44.auth.me();
      const settingsList = await base44.entities.UserSettings.filter({ user_email: user.email });
      return settingsList[0] || { theme: 'light' };
    }
  });

  const { data: links = [], isLoading } = useQuery({
    queryKey: ['myLinks'],
    queryFn: async () => {
      const user = await base44.auth.me();
      return base44.entities.ShortenedLink.filter({ created_by: user.email });
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.ShortenedLink.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['myLinks'] })
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.ShortenedLink.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['myLinks'] });
      setEditingLink(null);
    }
  });

  useEffect(() => {
    if (settings?.theme) {
      setTheme(settings.theme);
    }
  }, [settings]);

  const handleCopy = (shortCode) => {
    navigator.clipboard.writeText(`https://shrinkpro.xyz/${shortCode}`);
    setCopiedId(shortCode);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleToggleActive = (link) => {
    updateMutation.mutate({
      id: link.id,
      data: { is_active: !link.is_active }
    });
  };

  const filteredLinks = links.filter(link =>
    link.original_url?.toLowerCase().includes(search.toLowerCase()) ||
    link.title?.toLowerCase().includes(search.toLowerCase()) ||
    link.short_code?.toLowerCase().includes(search.toLowerCase())
  );

  const isDark = theme === 'dark';

  return (
    <div className={`min-h-screen ${isDark ? 'bg-slate-950' : 'bg-slate-50'}`}>
      <Sidebar currentPage="MyLinks" theme={theme} />
      
      <main className="lg:ml-72 p-6 lg:p-10">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
            <div>
              <h1 className={`text-3xl font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                My Shortened Links
              </h1>
              <p className={`mt-1 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                Manage and track all your shortened URLs
              </p>
            </div>
            <div className="relative w-full md:w-72">
              <Search className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 ${isDark ? 'text-slate-500' : 'text-slate-400'}`} />
              <Input
                placeholder="Search links..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className={`pl-10 ${isDark ? 'bg-slate-900 border-slate-800 text-white' : ''}`}
              />
            </div>
          </div>

          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map(i => (
                <Card key={i} className={`p-6 animate-pulse ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white'}`}>
                  <div className="h-6 bg-slate-200 rounded w-1/3 mb-4"></div>
                  <div className="h-4 bg-slate-200 rounded w-2/3"></div>
                </Card>
              ))}
            </div>
          ) : filteredLinks.length === 0 ? (
            <Card className={`p-12 text-center ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white'}`}>
              <p className={`text-lg ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                No shortened links found
              </p>
            </Card>
          ) : (
            <div className="space-y-4">
              {filteredLinks.map((link) => (
                <Card key={link.id} className={`p-6 ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white'}`}>
                  <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className={`font-semibold truncate ${isDark ? 'text-white' : 'text-slate-900'}`}>
                          {link.title || `shrinkpro.xyz/${link.short_code}`}
                        </h3>
                        <Badge variant={link.is_active ? 'default' : 'secondary'}>
                          {link.is_active ? 'Active' : 'Inactive'}
                        </Badge>
                      </div>
                      <p className={`text-sm truncate ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                        {link.original_url}
                      </p>
                      <div className="flex flex-wrap items-center gap-4 mt-3 text-sm">
                        <span className={`flex items-center gap-1 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                          <MousePointer className="w-4 h-4" />
                          {link.clicks || 0} clicks
                        </span>
                        <span className={`flex items-center gap-1 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                          <DollarSign className="w-4 h-4" />
                          ${(link.earnings || 0).toFixed(2)}
                        </span>
                        <span className={`flex items-center gap-1 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                          <Calendar className="w-4 h-4" />
                          {format(new Date(link.created_date), 'MMM d, yyyy')}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 flex-wrap">
                      <div className="flex items-center gap-2 mr-4">
                        <span className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>Active</span>
                        <Switch
                          checked={link.is_active}
                          onCheckedChange={() => handleToggleActive(link)}
                        />
                      </div>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => handleCopy(link.short_code)}
                        className={isDark ? 'border-slate-700 hover:bg-slate-800' : ''}
                      >
                        {copiedId === link.short_code ? (
                          <Check className="w-4 h-4 text-green-500" />
                        ) : (
                          <Copy className="w-4 h-4" />
                        )}
                      </Button>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => window.open(link.original_url, '_blank')}
                        className={isDark ? 'border-slate-700 hover:bg-slate-800' : ''}
                      >
                        <ExternalLink className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => setEditingLink(link)}
                        className={isDark ? 'border-slate-700 hover:bg-slate-800' : ''}
                      >
                        <Edit2 className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => deleteMutation.mutate(link.id)}
                        className="text-red-500 hover:text-red-600 hover:bg-red-50"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Edit Dialog */}
      <Dialog open={!!editingLink} onOpenChange={() => setEditingLink(null)}>
        <DialogContent className={isDark ? 'bg-slate-900 border-slate-800 text-white' : ''}>
          <DialogHeader>
            <DialogTitle>Edit Link</DialogTitle>
          </DialogHeader>
          {editingLink && (
            <div className="space-y-4">
              <div>
                <Label>Title</Label>
                <Input
                  value={editingLink.title || ''}
                  onChange={(e) => setEditingLink({...editingLink, title: e.target.value})}
                  className={isDark ? 'bg-slate-800 border-slate-700' : ''}
                />
              </div>
              <div>
                <Label>Original URL</Label>
                <Input
                  value={editingLink.original_url || ''}
                  onChange={(e) => setEditingLink({...editingLink, original_url: e.target.value})}
                  className={isDark ? 'bg-slate-800 border-slate-700' : ''}
                />
              </div>
              <Button
                onClick={() => updateMutation.mutate({
                  id: editingLink.id,
                  data: { title: editingLink.title, original_url: editingLink.original_url }
                })}
                className="w-full bg-gradient-to-r from-purple-600 to-blue-600"
              >
                Save Changes
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}