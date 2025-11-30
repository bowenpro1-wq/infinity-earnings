import React, { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Loader2, Link2 } from 'lucide-react';

export default function Redirect() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const handleRedirect = async () => {
      const urlParams = new URLSearchParams(window.location.search);
      const code = urlParams.get('code');

      if (!code) {
        setError('No link code provided');
        setLoading(false);
        return;
      }

      const links = await base44.entities.ShortenedLink.filter({ short_code: code });
      
      if (links.length === 0) {
        setError('Link not found');
        setLoading(false);
        return;
      }

      const link = links[0];

      if (!link.is_active) {
        setError('This link is no longer active');
        setLoading(false);
        return;
      }

      // Update click count
      await base44.entities.ShortenedLink.update(link.id, {
        clicks: (link.clicks || 0) + 1
      });

      // Redirect to the original URL
      window.location.href = link.original_url;
    };

    handleRedirect();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
      <div className="text-center">
        <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-blue-500 rounded-2xl flex items-center justify-center mx-auto mb-6">
          <Link2 className="w-8 h-8 text-white" />
        </div>
        
        {loading ? (
          <>
            <Loader2 className="w-8 h-8 text-white animate-spin mx-auto mb-4" />
            <p className="text-white/80">Redirecting...</p>
          </>
        ) : error ? (
          <>
            <h1 className="text-2xl font-bold text-white mb-2">Oops!</h1>
            <p className="text-white/80">{error}</p>
          </>
        ) : null}
      </div>
    </div>
  );
}