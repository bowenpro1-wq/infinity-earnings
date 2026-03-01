import React, { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Link2, AlertCircle } from 'lucide-react';

// This page handles /v?=custom-alias redirects for Pro users
export default function V() {
  const [error, setError] = useState(null);

  useEffect(() => {
    const handleAlias = async () => {
      const urlParams = new URLSearchParams(window.location.search);
      // The URL is /v?=alias, so the key is "=" and value is the alias
      const alias = urlParams.get('=') || urlParams.get('alias');

      if (!alias) {
        setError('No alias provided');
        return;
      }

      const links = await base44.entities.ShortenedLink.filter({ custom_alias: alias });
      if (links.length === 0) {
        setError('Custom link not found');
        return;
      }

      const link = links[0];
      if (!link.is_active) {
        setError('This link is no longer active');
        return;
      }

      // Redirect to the Redirect page which handles all the ad logic
      window.location.href = `${window.location.origin}/Redirect?code=${link.short_code}`;
    };

    handleAlias();
  }, []);

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-950 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-8 h-8 text-red-400" />
          </div>
          <h1 className="text-xl font-bold text-white mb-2">Link Not Found</h1>
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
        <p className="text-white">Resolving link...</p>
      </div>
    </div>
  );
}