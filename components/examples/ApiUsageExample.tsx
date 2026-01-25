'use client';

import React, { useState } from 'react';
import { useApi, useAuthState, useApiForm } from '@/hooks/useApi';
import { api } from '@/lib/api';

/**
 * Example component showing how to use the new V1 API
 * This demonstrates all the common patterns for API usage
 */
export default function ApiUsageExample() {
  const { user, isAuthenticated, login, logout } = useAuthState();
  
  // Example: Fetch job offers (public endpoint)
  const { 
    data: jobOffers, 
    loading: jobOffersLoading, 
    error: jobOffersError,
    refetch: refetchJobOffers 
  } = useApi('/offres', { 
    immediate: true, 
    requireAuth: false 
  });

  // Example: Fetch user profile (protected endpoint)
  const { 
    data: userProfile, 
    loading: profileLoading, 
    execute: fetchProfile 
  } = useApi('/user', { 
    immediate: isAuthenticated 
  });

  // Example: Contact form submission
  const contactForm = useApiForm('/contact', {
    onSuccess: (data) => {
      alert('Contact form submitted successfully!');
      setContactData({ name: '', email: '', message: '' });
    },
    onError: (error) => {
      alert(`Error: ${error}`);
    }
  });

  // Form state
  const [loginData, setLoginData] = useState({
    email: '',
    password: '',
    userType: 'candidate' as 'candidate' | 'entreprise'
  });

  const [contactData, setContactData] = useState({
    name: '',
    email: '',
    message: ''
  });

  // Handle login
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const result = await login(loginData, false);
    if (result.success) {
      alert('Login successful!');
    } else {
      alert(`Login failed: ${result.error}`);
    }
  };

  // Handle contact form
  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await contactForm.submit(contactData);
  };

  // Example: Manual API call
  const handleManualApiCall = async () => {
    try {
      const result = await api.getSectors();
      if (result.status === 200) {
        console.log('Sectors:', result.data);
        alert(`Found ${result.data?.length || 0} sectors`);
      } else {
        alert(`Error: ${result.error}`);
      }
    } catch (error) {
      alert('Network error');
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      <h1 className="text-3xl font-bold text-center">FaceJob API V1 Usage Examples</h1>
      
      {/* Authentication Status */}
      <div className="bg-gray-100 p-4 rounded-lg">
        <h2 className="text-xl font-semibold mb-2">Authentication Status</h2>
        {isAuthenticated ? (
          <div>
            <p className="text-green-600">✅ Authenticated</p>
            <p>User: {user?.email || 'Unknown'}</p>
            <button 
              onClick={logout}
              className="mt-2 px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
            >
              Logout
            </button>
          </div>
        ) : (
          <p className="text-red-600">❌ Not authenticated</p>
        )}
      </div>

      {/* Login Form (if not authenticated) */}
      {!isAuthenticated && (
        <div className="bg-white p-6 border rounded-lg">
          <h2 className="text-xl font-semibold mb-4">Login Example</h2>
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Email:</label>
              <input
                type="email"
                value={loginData.email}
                onChange={(e) => setLoginData({...loginData, email: e.target.value})}
                className="w-full p-2 border rounded"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Password:</label>
              <input
                type="password"
                value={loginData.password}
                onChange={(e) => setLoginData({...loginData, password: e.target.value})}
                className="w-full p-2 border rounded"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">User Type:</label>
              <select
                value={loginData.userType}
                onChange={(e) => setLoginData({...loginData, userType: e.target.value as 'candidate' | 'entreprise'})}
                className="w-full p-2 border rounded"
              >
                <option value="candidate">Candidate</option>
                <option value="entreprise">Enterprise</option>
              </select>
            </div>
            <button
              type="submit"
              className="w-full px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Login
            </button>
          </form>
        </div>
      )}

      {/* Public API Example - Job Offers */}
      <div className="bg-white p-6 border rounded-lg">
        <h2 className="text-xl font-semibold mb-4">Public API Example - Job Offers</h2>
        <div className="flex gap-2 mb-4">
          <button
            onClick={refetchJobOffers}
            className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
          >
            Refresh Job Offers
          </button>
          <button
            onClick={handleManualApiCall}
            className="px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600"
          >
            Get Sectors (Manual Call)
          </button>
        </div>
        
        {jobOffersLoading && <p>Loading job offers...</p>}
        {jobOffersError && <p className="text-red-600">Error: {jobOffersError}</p>}
        {jobOffers && (
          <div>
            <p className="text-green-600">✅ Found {jobOffers.length} job offers</p>
            <div className="mt-2 max-h-40 overflow-y-auto">
              {jobOffers.slice(0, 5).map((offer: any, index: number) => (
                <div key={index} className="p-2 border-b">
                  <p className="font-medium">{offer.name || offer.title}</p>
                  <p className="text-sm text-gray-600">{offer.company || offer.entreprise}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Protected API Example - User Profile */}
      {isAuthenticated && (
        <div className="bg-white p-6 border rounded-lg">
          <h2 className="text-xl font-semibold mb-4">Protected API Example - User Profile</h2>
          <button
            onClick={fetchProfile}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 mb-4"
          >
            Fetch Profile
          </button>
          
          {profileLoading && <p>Loading profile...</p>}
          {userProfile && (
            <div className="bg-gray-50 p-4 rounded">
              <h3 className="font-semibold">Profile Data:</h3>
              <pre className="text-sm mt-2 overflow-x-auto">
                {JSON.stringify(userProfile, null, 2)}
              </pre>
            </div>
          )}
        </div>
      )}

      {/* Form Submission Example - Contact Form */}
      {isAuthenticated && (
        <div className="bg-white p-6 border rounded-lg">
          <h2 className="text-xl font-semibold mb-4">Form Submission Example - Contact</h2>
          <form onSubmit={handleContactSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Name:</label>
              <input
                type="text"
                value={contactData.name}
                onChange={(e) => setContactData({...contactData, name: e.target.value})}
                className="w-full p-2 border rounded"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Email:</label>
              <input
                type="email"
                value={contactData.email}
                onChange={(e) => setContactData({...contactData, email: e.target.value})}
                className="w-full p-2 border rounded"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Message:</label>
              <textarea
                value={contactData.message}
                onChange={(e) => setContactData({...contactData, message: e.target.value})}
                className="w-full p-2 border rounded h-24"
                required
              />
            </div>
            <button
              type="submit"
              disabled={contactForm.loading}
              className="w-full px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:opacity-50"
            >
              {contactForm.loading ? 'Submitting...' : 'Submit Contact Form'}
            </button>
            {contactForm.error && (
              <p className="text-red-600">Error: {contactForm.error}</p>
            )}
            {contactForm.success && (
              <p className="text-green-600">✅ Contact form submitted successfully!</p>
            )}
          </form>
        </div>
      )}

      {/* API Endpoints Reference */}
      <div className="bg-gray-50 p-6 rounded-lg">
        <h2 className="text-xl font-semibold mb-4">API V1 Endpoints Reference</h2>
        <div className="grid md:grid-cols-2 gap-4 text-sm">
          <div>
            <h3 className="font-semibold text-green-600 mb-2">Public Endpoints (No Auth)</h3>
            <ul className="space-y-1">
              <li>GET /v1/sectors</li>
              <li>GET /v1/jobs</li>
              <li>GET /v1/offres</li>
              <li>GET /v1/plans</li>
              <li>POST /v1/auth/*/login</li>
              <li>POST /v1/auth/*/register</li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold text-blue-600 mb-2">Protected Endpoints (Auth Required)</h3>
            <ul className="space-y-1">
              <li>GET /v1/user</li>
              <li>GET /v1/offre/{id}</li>
              <li>GET /v1/candidate-profile/{id}</li>
              <li>POST /v1/contact</li>
              <li>POST /v1/email/send-mail</li>
              <li>PUT /v1/complete-*</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}