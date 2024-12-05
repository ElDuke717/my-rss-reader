// src/app/test/page.tsx
'use client';

import { useUser } from "@clerk/nextjs";
import { useState, useEffect } from 'react';

export default function TestPage() {
  const { isLoaded, isSignedIn, user } = useUser();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return null; // or a loading spinner
  }

  if (!isLoaded) {
    return <div>Loading...</div>;
  }

  return (
    <div className="p-8 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Auth Test Page</h1>
      
      <div className="space-y-4 bg-white p-6 rounded-lg shadow">
        <div className="grid grid-cols-2 gap-2">
          <span className="font-medium">Is Loaded:</span>
          <span>{String(isLoaded)}</span>
          
          <span className="font-medium">Is Signed In:</span>
          <span>{String(isSignedIn)}</span>
        </div>

        {isSignedIn && user && (
          <div className="mt-4 pt-4 border-t">
            <h2 className="font-semibold mb-2">User Details</h2>
            <div className="grid grid-cols-2 gap-2">
              <span className="font-medium">User ID:</span>
              <span>{user.id}</span>
              
              <span className="font-medium">Email:</span>
              <span>{user.emailAddresses[0]?.emailAddress}</span>
            </div>
          </div>
        )}

        {!isSignedIn && (
          <div className="mt-4">
            <a 
              href="/sign-in"
              className="inline-block bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors"
            >
              Sign In
            </a>
          </div>
        )}
      </div>
    </div>
  );
}