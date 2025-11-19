'use client';

import { useEffect, useState } from 'react';

export default function HealthStatusBadge() {
  const [label, setLabel] = useState('Health: checking...');
  const [className, setClassName] = useState('text-xs text-gray-500');

  useEffect(() => {
    let cancelled = false;

    async function check() {
      try {
        const res = await fetch('/api/health', { cache: 'no-store' });
        if (cancelled) return;

        if (!res.ok) {
          setLabel('Health: down');
          setClassName('text-xs text-red-600');
          return;
        }

        const json = await res.json();
        if (json.ok) {
          setLabel('Health: ok');
          setClassName('text-xs text-emerald-600');
        } else {
          setLabel('Health: degraded');
          setClassName('text-xs text-amber-600');
        }
      } catch (err) {
        if (!cancelled) {
          setLabel('Health: error');
          setClassName('text-xs text-red-600');
        }
      }
    }

    check();
    const id = setInterval(check, 60000);

    return () => {
      cancelled = true;
      clearInterval(id);
    };
  }, []);

  return (
    <div className="flex justify-end px-4 py-1">
      <span className={className}>{label}</span>
    </div>
  );
}
