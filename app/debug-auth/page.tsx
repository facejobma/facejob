'use client';

import { useState, useEffect } from 'react';
import Cookies from 'js-cookie';
import { 
  fetchUserData, 
  fetchNotifications, 
  fetchEntrepriseStats, 
  fetchLastPayment,
  fetchPostuleAll,
  authenticatedApiCall 
} from '@/lib/api';

export default function DebugAuth() {
  const [authInfo, setAuthInfo] = useState<any>({});
  const [testResults, setTestResults] = useState<any>({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Get current auth info
    const info = {
      localStorage_token: localStorage.getItem('access_token'),
      localStorage_user_type: localStorage.getItem('user_type'),
      localStorage_provider: localStorage.getItem('auth_provider'),
      cookies_authToken: Cookies.get('authToken'),
      cookies_user_type: Cookies.get('user_type'),
      sessionStorage_user: sessionStorage.getItem('user'),
    };
    setAuthInfo(info);
  }, []);

  const testEndpoint = async (name: string, testFn: () => Promise<any>) => {
    try {
      setTestResults((prev: any) => ({ ...prev, [name]: { loading: true } }));
      const result = await testFn();
      setTestResults((prev: any) => ({ 
        ...prev, 
        [name]: { success: true, data: result } 
      }));
    } catch (error: any) {
      setTestResults((prev: any) => ({ 
        ...prev, 
        [name]: { success: false, error: error.message } 
      }));
    }
  };

  const runAllTests = async () => {
    setLoading(true);
    setTestResults({});

    // Test user data
    await testEndpoint('user', () => fetchUserData());
    
    // Test notifications
    await testEndpoint('notifications', () => fetchNotifications());
    
    // Test entreprise stats (if user is entreprise)
    if (authInfo.localStorage_user_type === 'entreprise') {
      const userData = JSON.parse(sessionStorage.getItem('user') || '{}');
      if (userData.id) {
        await testEndpoint('entreprise-stats', () => fetchEntrepriseStats(userData.id.toString()));
        await testEndpoint('last-payment', () => fetchLastPayment(userData.id.toString()));
      }
    }
    
    // Test postule all
    await testEndpoint('postule-all', () => fetchPostuleAll());
    
    // Test raw API call
    await testEndpoint('raw-user-api', () => 
      authenticatedApiCall('/api/user').then(r => r.json())
    );

    setLoading(false);
  };

  const clearAuth = () => {
    localStorage.clear();
    sessionStorage.clear();
    // Clear cookies
    const allCookies = document.cookie.split(";");
    allCookies.forEach(cookie => {
      const eqPos = cookie.indexOf("=");
      const name = eqPos > -1 ? cookie.substr(0, eqPos).trim() : cookie.trim();
      Cookies.remove(name);
      Cookies.remove(name, { path: "/" });
    });
    window.location.reload();
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Authentication Debug</h1>
        
        {/* Auth Info */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Current Authentication State</h2>
          <pre className="bg-gray-100 p-4 rounded text-sm overflow-auto">
            {JSON.stringify(authInfo, null, 2)}
          </pre>
        </div>

        {/* Test Controls */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">API Tests</h2>
          <div className="flex gap-4 mb-4">
            <button
              onClick={runAllTests}
              disabled={loading}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? 'Testing...' : 'Run All Tests'}
            </button>
            <button
              onClick={clearAuth}
              className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
            >
              Clear Auth & Reload
            </button>
          </div>
        </div>

        {/* Test Results */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Test Results</h2>
          {Object.keys(testResults).length === 0 ? (
            <p className="text-gray-500">No tests run yet. Click "Run All Tests" to start.</p>
          ) : (
            <div className="space-y-4">
              {Object.entries(testResults).map(([name, result]: [string, any]) => (
                <div key={name} className="border rounded p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="font-medium">{name}</span>
                    {result.loading ? (
                      <span className="text-blue-600">Loading...</span>
                    ) : result.success ? (
                      <span className="text-green-600">✅ Success</span>
                    ) : (
                      <span className="text-red-600">❌ Failed</span>
                    )}
                  </div>
                  {result.error && (
                    <div className="text-red-600 text-sm mb-2">
                      Error: {result.error}
                    </div>
                  )}
                  {result.data && (
                    <pre className="bg-gray-100 p-2 rounded text-xs overflow-auto max-h-40">
                      {JSON.stringify(result.data, null, 2)}
                    </pre>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Instructions */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mt-6">
          <h3 className="text-lg font-semibold text-blue-900 mb-2">Instructions</h3>
          <ol className="list-decimal list-inside text-blue-800 space-y-1">
            <li>First, log in via OAuth (Google or LinkedIn) as an entreprise</li>
            <li>Come back to this page: <code>/debug-auth</code></li>
            <li>Check that authentication data is stored correctly</li>
            <li>Run the API tests to see which endpoints work</li>
            <li>If tests fail, check the browser console for detailed logs</li>
          </ol>
        </div>
      </div>
    </div>
  );
}