'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase/client';

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadUser() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.push('/signin');
        return;
      }

      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .maybeSingle();

      setUser({
        ...user,
        name: profile?.name || '',
      });
      setLoading(false);
    }

    loadUser();
  }, [router]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push('/signin');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-white to-gray-50 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-6 py-12">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl p-8">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h1 className="text-3xl font-bold">Dashboard</h1>
                <p className="text-gray-600 dark:text-gray-400 mt-2">
                  Welcome back, {user?.name || 'User'}
                </p>
              </div>
              <button
                onClick={handleSignOut}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
              >
                Sign Out
              </button>
            </div>

            <div className="grid gap-6">
              <div className="p-6 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <h2 className="text-xl font-semibold mb-4">Account Information</h2>
                <dl className="space-y-2">
                  <div>
                    <dt className="text-sm text-gray-600 dark:text-gray-400">Name</dt>
                    <dd className="text-lg">{user?.name}</dd>
                  </div>
                  <div>
                    <dt className="text-sm text-gray-600 dark:text-gray-400">Email</dt>
                    <dd className="text-lg">{user?.email}</dd>
                  </div>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
