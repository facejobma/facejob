'use client';

import { useState } from 'react';
import Cookies from 'js-cookie';

export default function TestAuth() {
  const [userId, setUserId] = useState('18');
  const [userType, setUserType] = useState('entreprise');
  const [token, setToken] = useState('');
  const [loading, setLoading] = useState(false);

  const generateTestToken = async () => {
    setLoading(true);
    try {
      const apiVersion = process.env.NEXT_PUBLIC_API_VERSION || 'v1';
      const response = await fetch(`http://localhost:8000/api/${apiVersion}/debug/generate-token/${userId}/${userType}`);
      const data = await response.json();
      
      if (data.token) {
        setToken(data.token);
        
        // Store the token like OAuth would
        localStorage.setItem('access_token', data.token);
        localStorage.setItem('user_type', data.user_type);
        localStorage.setItem('auth_provider', 'debug');
        
        Cookies.set('authToken', data.token, { expires: 7 });
        Cookies.set('user_type', data.user_type, { expires: 7 });
        
        // Store user data
        sessionStorage.setItem('user', JSON.stringify(data.user));
        
        alert('Test token generated and stored! You can now test API endpoints.');
      } else {
        alert('Error: ' + (data.error || 'Unknown error'));
      }
    } catch (error) {
      alert('Error generating token: ' + error);
    }
    setLoading(false);
  };

  const testApiCall = async () => {
    try {
      const token = localStorage.getItem('access_token');
      if (!token) {
        alert('No token found. Generate one first.');
        return;
      }

      const apiVersion = process.env.NEXT_PUBLIC_API_VERSION || 'v1';
      const response = await fetch(`http://localhost:8000/api/${apiVersion}/user`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        alert('API call successful! Check console for data.');
        console.log('User data:', data);
      } else {
        alert(`API call failed: ${response.status} ${response.statusText}`);
      }
    } catch (error) {
      alert('Error making API call: ' + error);
    }
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
    setToken('');
    alert('Authentication cleared!');
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-2xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Authentication Test Utility</h1>
        
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Generate Test Token</h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                User ID
              </label>
              <input
                type="text"
                value={userId}
                onChange={(e) => setUserId(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                placeholder="Enter user ID (e.g., 18)"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                User Type
              </label>
              <select
                value={userType}
                onChange={(e) => setUserType(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              >
                <option value="entreprise">Entreprise</option>
                <option value="candidate">Candidate</option>
              </select>
            </div>
            
            <button
              onClick={generateTestToken}
              disabled={loading}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? 'Generating...' : 'Generate Test Token'}
            </button>
          </div>
          
          {token && (
            <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded">
              <p className="text-sm text-green-800">
                Token generated successfully! It has been stored in localStorage and cookies.
              </p>
              <p className="text-xs text-green-600 mt-1 break-all">
                Token: {token.substring(0, 50)}...
              </p>
            </div>
          )}
        </div>

        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Test API Calls</h2>
          
          <div className="space-y-3">
            <button
              onClick={testApiCall}
              className="w-full bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700"
            >
              Test /api/user Endpoint
            </button>
            
            <button
              onClick={() => window.open('/debug-auth', '_blank')}
              className="w-full bg-purple-600 text-white py-2 px-4 rounded-md hover:bg-purple-700"
            >
              Open Full Debug Page
            </button>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Clear Authentication</h2>
          
          <button
            onClick={clearAuth}
            className="w-full bg-red-600 text-white py-2 px-4 rounded-md hover:bg-red-700"
          >
            Clear All Auth Data
          </button>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mt-6">
          <h3 className="text-lg font-semibold text-blue-900 mb-2">How to Use</h3>
          <ol className="list-decimal list-inside text-blue-800 space-y-1 text-sm">
            <li>Enter the user ID (18 for your entreprise account)</li>
            <li>Select the user type (entreprise)</li>
            <li>Click "Generate Test Token" to create and store a valid token</li>
            <li>Click "Test /api/user Endpoint" to verify the token works</li>
            <li>Use "Open Full Debug Page" to test all API endpoints</li>
            <li>Use "Clear All Auth Data" to reset and start over</li>
          </ol>
          
          <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded">
            <p className="text-sm text-yellow-800">
              <strong>Note:</strong> This debug utility only works in development mode. 
              The token generator endpoint is disabled in production.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}