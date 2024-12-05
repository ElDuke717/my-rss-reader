// src/app/page.tsx
import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto p-8">
        <h1 className="text-4xl font-bold mb-8">RSS Reader</h1>
        
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-semibold mb-4">Welcome to Your RSS Reader</h2>
              <p className="text-gray-600">
                Stay updated with all your favorite content in one place.
              </p>
            </div>

            <div className="flex gap-4">
              <Link
                href="/sign-in"
                className="inline-block bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 transition-colors"
              >
                Sign In
              </Link>
              <Link
                href="/sign-up"
                className="inline-block bg-gray-500 text-white px-6 py-2 rounded-lg hover:bg-gray-600 transition-colors"
              >
                Sign Up
              </Link>
              <Link
                href="/test"
                className="inline-block border border-gray-300 px-6 py-2 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Test Page
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}