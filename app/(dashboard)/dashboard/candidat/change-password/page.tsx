"use client";
import React, { useState } from 'react';
import Cookies from 'js-cookie';
import { toast } from 'react-hot-toast';
import { useRouter } from 'next/navigation';

const ChangePassword: React.FC = () => {
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const authToken = Cookies.get('authToken')?.replace(/["']/g, '');
  const router = useRouter();

  const handleChangePassword = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (newPassword !== confirmPassword) {
      toast.error('New password and confirm password do not match');
      return;
    }

    try {
      const response = await fetch(
        process.env.NEXT_PUBLIC_BACKEND_URL + '/api/candidat/change-password',
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${authToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            old_password: oldPassword,
            new_password: newPassword,
          }),
        },
      );

      if (response.ok) {
        toast.success('Password changed successfully');
        setOldPassword('');
        setNewPassword('');
        setConfirmPassword('');
        router.push('/dashboard/candidat/profile');
      } else {
        const errorData = await response.json();
        toast.error(errorData.message || 'Failed to change password');
      }
    } catch (error) {
      toast.error('Error changing password');
      console.error('Error changing password:', error);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-10 bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-4">Change Password</h2>
      <form onSubmit={handleChangePassword}>
        <div className="mb-4">
          <label htmlFor="oldPassword" className="block font-bold mb-2">Old Password</label>
          <input
            type="password"
            id="oldPassword"
            name="oldPassword"
            value={oldPassword}
            onChange={(e) => setOldPassword(e.target.value)}
            className="w-full border-gray-300 rounded-md py-2 px-3"
            required
          />
        </div>
        <div className="mb-4">
          <label htmlFor="newPassword" className="block font-bold mb-2">New Password</label>
          <input
            type="password"
            id="newPassword"
            name="newPassword"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            className="w-full border-gray-300 rounded-md py-2 px-3"
            required
          />
        </div>
        <div className="mb-4">
          <label htmlFor="confirmPassword" className="block font-bold mb-2">Confirm New Password</label>
          <input
            type="password"
            id="confirmPassword"
            name="confirmPassword"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="w-full border-gray-300 rounded-md py-2 px-3"
            required
          />
        </div>
        <button
          type="submit"
          className="bg-primary hover:bg-primary-2 text-white font-bold py-2 px-4 rounded-md"
        >
          Change Password
        </button>
      </form>
    </div>
  );
};

export default ChangePassword;
