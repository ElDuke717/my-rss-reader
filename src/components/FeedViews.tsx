// src/components/FeedViews.tsx
'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useUser } from "@clerk/nextjs";

export function FeedViews() {
  const { user } = useUser();
  const [views, setViews] = useState([]);

  useEffect(() => {
    if (user) {
      fetchViews();
    }
  }, [user]);

  const fetchViews = async () => {
    const { data, error } = await supabase
      .from('feed_views')
      .select('*')
      .eq('user_id', user?.id);

    if (!error && data) {
      setViews(data);
    }
  };

  return (
    <div>
      {views.map(view => (
        <div key={view.id}>
          <h3>{view.name}</h3>
          {/* render feed sources */}
        </div>
      ))}
    </div>
  );
}