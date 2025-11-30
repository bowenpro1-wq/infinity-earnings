import React, { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Link2, AlertCircle } from 'lucide-react';

export default function Redirect() {
  const [error, setError] = useState(null);

  useEffect(() => {
    const handleRedirect = async () => {
      const urlParams = new URLSearchParams(window.location.search);
      const code = urlParams.get('code');

      if (!code) {
        setError('No link code provided');
        return;
      }

      const links = await base44.entities.ShortenedLink.filter({ short_code: code });

      if (links.length === 0) {
        setError('Link not found');
        return;
      }

      const link = links[0];

      if (!link.is_active) {
        setError('This link is no longer active');
        return;
      }

      // Update click count
      await base44.entities.ShortenedLink.update(link.id, {
        clicks: (link.clicks || 0) + 1
      });

      // Redirect to original URL
      window.location.href = link.original_url;
    };

    handleRedirect();
  }, []);

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-950 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-8 h-8 text-red-400" />
          </div>
          <h1 className="text-xl font-bold text-white mb-2">Error</h1>
          <p className="text-slate-400">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-950 flex items-center justify-center">
      <div className="text-center">
        <div className="w-16 h-16 bg-gradient-to-br from-cyan-400 to-purple-500 rounded-2xl flex items-center justify-center mx-auto mb-4 animate-pulse">
          <Link2 className="w-8 h-8 text-white" />
        </div>
        <p className="text-white">Redirecting...</p>
      </div>
    </div>
  );
}