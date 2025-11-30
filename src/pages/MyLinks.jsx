import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import Sidebar from '@/components/Sidebar';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  Link2, Copy, ExternalLink, Trash2, Edit2, 
  Search, MoreVertical, Check, X, Eye
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export default function MyLinks() {
  const [logoClicks, setLogoClicks] = useState(0);
  const [search, setSearch] = useState('');
  const [copiedId, setCopiedId] = useState(null);
  const [editingLink, setEditingLink] = useState(null);
  const [editTitle, setEditTitle] = useState('');
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: links = [], isLoading } = useQuery({
    queryKey: ['myLinks'],
    queryFn: () => base44.entities.ShortenedLink.list('-created_date')
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.ShortenedLink.delete(id),
    onSuccess: () => queryClient.invalidateQueries(['myLinks'])
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.ShortenedLink.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['myLinks']);
      setEditingLink(null);
    }
  });

  const handleLogoClick = () => {
    const newCount = logoClicks + 1;
    setLogoClicks(newCount);
    if (newCount >= 10) {
      navigate(createPageUrl('AdminLogin'));
      setLogoClicks(0);
    }
  };

  const copyToClipboard = (shortCode, id) => {
    navigator.clipboard.writeText(`https://shrinkpro.xyz/${shortCode}`);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const filteredLinks = links.filter(link => 
    link.original_url?.toLowerCase().includes(search.toLowerCase()) ||
    link.short_code?.toLowerCase().includes(search.toLowerCase()) ||
    link.title?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-950">
      <Sidebar currentPage="MyLinks" onLogoClick={handleLogoClick} />
      
      <main className="lg:ml-72 p-6 lg:p-10">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8 pt-12 lg:pt-0">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">My Shortened Links</h1>
              <p className="text-slate-400">{links.length} total links</p>
            </div>
            <Button 
              onClick={() => navigate(createPageUrl('ShortenNew'))}
              className="bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-400 hover:to-purple-400"
            >
              <Link2 className="w-4 h-4 mr-2" /> Create New Link
            </Button>
          </div>

          {/* Search */}
          <div className="relative mb-6">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search links..."
              className="pl-12 bg-white/5 border-white/10 text-white placeholder:text-slate-500 h-12 rounded-xl"
            />
          </div>

          {/* Links List */}
          <Card className="bg-white/5 border-white/10 backdrop-blur-xl">
            <CardContent className="p-0">
              {isLoading ? (
                <div className="flex items-center justify-center py-20">
                  <div className="w-8 h-8 border-2 border-cyan-400/30 border-t-cyan-400 rounded-full animate-spin" />
                </div>
              ) : filteredLinks.length === 0 ? (
                <div className="text-center py-20">
                  <Link2 className="w-16 h-16 text-slate-600 mx-auto mb-4" />
                  <p className="text-slate-400 text-lg">No links found</p>
                  <p className="text-slate-500 text-sm mt-1">Create your first shortened link!</p>
                </div>
              ) : (
                <div className="divide-y divide-white/5">
                  {filteredLinks.map((link) => (
                    <div key={link.id} className="p-5 hover:bg-white/5 transition-colors">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-2">
                            {link.title && (
                              <span className="text-white font-medium">{link.title}</span>
                            )}
                            <Badge 
                              variant="outline" 
                              className={link.is_active ? 'border-green-500/50 text-green-400' : 'border-red-500/50 text-red-400'}
                            >
                              {link.is_active ? 'Active' : 'Inactive'}
                            </Badge>
                          </div>
                          
                          <div className="flex items-center gap-2 mb-2">
                            <code className="text-cyan-400 font-mono text-lg">
                              shrinkpro.xyz/{link.short_code}
                            </code>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-slate-400 hover:text-white"
                              onClick={() => copyToClipboard(link.short_code, link.id)}
                            >
                              {copiedId === link.id ? (
                                <Check className="w-4 h-4 text-green-400" />
                              ) : (
                                <Copy className="w-4 h-4" />
                              )}
                            </Button>
                          </div>
                          
                          <p className="text-slate-400 text-sm truncate">{link.original_url}</p>
                          
                          <div className="flex items-center gap-6 mt-3 text-sm">
                            <span className="text-slate-400">
                              <Eye className="w-4 h-4 inline mr-1" />
                              {link.clicks || 0} clicks
                            </span>
                            <span className="text-slate-400">
                              {link.unique_clicks || 0} unique
                            </span>
                            <span className="text-green-400 font-medium">
                              ${(link.earnings || 0).toFixed(2)}
                            </span>
                          </div>
                        </div>

                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="text-slate-400 hover:text-white">
                              <MoreVertical className="w-5 h-5" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="bg-slate-900 border-white/10">
                            <DropdownMenuItem
                              className="text-slate-300 hover:text-white focus:text-white"
                              onClick={() => window.open(link.original_url, '_blank')}
                            >
                              <ExternalLink className="w-4 h-4 mr-2" /> Visit Original
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              className="text-slate-300 hover:text-white focus:text-white"
                              onClick={() => {
                                setEditingLink(link);
                                setEditTitle(link.title || '');
                              }}
                            >
                              <Edit2 className="w-4 h-4 mr-2" /> Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              className="text-red-400 hover:text-red-300 focus:text-red-300"
                              onClick={() => deleteMutation.mutate(link.id)}
                            >
                              <Trash2 className="w-4 h-4 mr-2" /> Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>

      {/* Edit Dialog */}
      <Dialog open={!!editingLink} onOpenChange={() => setEditingLink(null)}>
        <DialogContent className="bg-slate-900 border-white/10">
          <DialogHeader>
            <DialogTitle className="text-white">Edit Link</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            <div>
              <label className="text-sm text-slate-400 mb-2 block">Title</label>
              <Input
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                placeholder="Link title..."
                className="bg-white/5 border-white/10 text-white"
              />
            </div>
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                className="flex-1 border-white/10 text-slate-400"
                onClick={() => setEditingLink(null)}
              >
                Cancel
              </Button>
              <Button
                className="flex-1 bg-gradient-to-r from-cyan-500 to-purple-500"
                onClick={() => updateMutation.mutate({ 
                  id: editingLink.id, 
                  data: { title: editTitle }
                })}
              >
                Save Changes
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}