"use client";
import React, { useState } from 'react';
import Cookies from 'js-cookie';
import { toast } from 'react-hot-toast';
import { useRouter } from 'next/navigation';
import { changeEntreprisePassword } from '@/lib/api';

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
      await changeEntreprisePassword(oldPassword, newPassword);
      toast.success('Password changed successfully');
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
      router.push('/dashboard/entreprise/profile');
    } catch (error) {
      console.error('Change password error:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to change password');
    }
  };

  return (
    <div className="max-w-md mx-auto mt-10 bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-4">Modifier le Mot de Passe</h2>
      <form onSubmit={handleChangePassword}>
        <div className="mb-4">
          <label htmlFor="oldPassword" className="block font-bold mb-2">Ancien Mot de Passe</label>
          <input
            type="password"
            id="oldPassword"
            name="oldPassword"
            value={oldPassword}
            onChange={(e) => setOldPassword(e.target.value)}
            className="w-full border-gray-300 rounded-md py-2 px-3"
            placeholder="Entrez votre ancien mot de passe"
            required
          />
        </div>
        <div className="mb-4">
          <label htmlFor="newPassword" className="block font-bold mb-2">Nouveau Mot de Passe</label>
          <input
            type="password"
            id="newPassword"
            name="newPassword"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            className="w-full border-gray-300 rounded-md py-2 px-3"
            placeholder="Entrez votre nouveau mot de passe"
            required
          />
        </div>
        <div className="mb-4">
          <label htmlFor="confirmPassword" className="block font-bold mb-2">Confirmer Nouveau Mot de Passe</label>
          <input
            type="password"
            id="confirmPassword"
            name="confirmPassword"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="w-full border-gray-300 rounded-md py-2 px-3"
            placeholder="Confirmez votre nouveau mot de passe"
            required
          />
        </div>
        <button
          type="submit"
          className="bg-primary hover:bg-primary-2 text-white font-bold py-2 px-4 rounded-md"
        >
          Sauvegarder
        </button>
      </form>
    </div>
  );
};

export default ChangePassword;
