"use client";
import React, { useState } from 'react';
import Cookies from 'js-cookie';
import { toast } from 'react-hot-toast';
import { useRouter } from 'next/navigation';
import { changeCandidatePassword } from '@/lib/api';
import { FaLock, FaEye, FaEyeSlash, FaShieldAlt, FaCheckCircle } from 'react-icons/fa';

const ChangePassword: React.FC = () => {
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const authToken = Cookies.get('authToken')?.replace(/["']/g, '');
  const router = useRouter();

  // Password strength checker
  const getPasswordStrength = (password: string) => {
    if (password.length === 0) return { strength: 0, label: '', color: '' };
    if (password.length < 6) return { strength: 25, label: 'Faible', color: 'bg-red-500' };
    if (password.length < 8) return { strength: 50, label: 'Moyen', color: 'bg-orange-500' };
    if (password.length < 12 && /[A-Z]/.test(password) && /[0-9]/.test(password)) {
      return { strength: 75, label: 'Bon', color: 'bg-yellow-500' };
    }
    if (password.length >= 12 && /[A-Z]/.test(password) && /[0-9]/.test(password) && /[!@#$%^&*]/.test(password)) {
      return { strength: 100, label: 'Excellent', color: 'bg-green-500' };
    }
    return { strength: 60, label: 'Acceptable', color: 'bg-blue-500' };
  };

  const passwordStrength = getPasswordStrength(newPassword);

  const handleChangePassword = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (newPassword !== confirmPassword) {
      toast.error('Les mots de passe ne correspondent pas');
      return;
    }

    if (newPassword.length < 6) {
      toast.error('Le mot de passe doit contenir au moins 6 caractères');
      return;
    }

    setIsSubmitting(true);

    try {
      await changeCandidatePassword(oldPassword, newPassword);
      toast.success('Mot de passe modifié avec succès !');
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
      
      setTimeout(() => {
        router.push('/dashboard/candidat/profile');
      }, 1500);
    } catch (error) {
      console.error('Change password error:', error);
      toast.error(error instanceof Error ? error.message : 'Erreur lors du changement de mot de passe');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl border border-gray-200 p-4 md:p-6">
        <div className="flex items-center gap-3">
          <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-green-100 to-emerald-100 flex items-center justify-center">
            <FaLock className="text-green-600 text-xl" />
          </div>
          <div>
            <h1 className="text-xl md:text-2xl font-bold text-gray-900">Modifier le Mot de Passe</h1>
            <p className="text-sm md:text-base text-gray-600 mt-0.5">Sécurisez votre compte avec un nouveau mot de passe</p>
          </div>
        </div>
      </div>

      {/* Security Tips */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-xl p-4 md:p-5">
        <div className="flex items-start gap-3">
          <div className="h-10 w-10 rounded-lg bg-blue-100 flex items-center justify-center flex-shrink-0">
            <FaShieldAlt className="text-blue-600 text-lg" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-blue-900 text-sm md:text-base mb-2">Conseils de sécurité</h3>
            <ul className="text-xs md:text-sm text-blue-800 space-y-1.5">
              <li className="flex items-start gap-2">
                <span className="text-blue-600 mt-0.5">•</span>
                <span>Utilisez au moins 8 caractères avec des majuscules, minuscules et chiffres</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-600 mt-0.5">•</span>
                <span>Évitez d'utiliser des informations personnelles évidentes</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-600 mt-0.5">•</span>
                <span>Ne réutilisez pas le même mot de passe sur plusieurs sites</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Form */}
      <div className="bg-white rounded-xl border border-gray-200 p-4 md:p-6">
        <form onSubmit={handleChangePassword} className="space-y-6">
          {/* Old Password */}
          <div>
            <label htmlFor="oldPassword" className="block text-sm font-semibold text-gray-700 mb-2">
              Ancien Mot de Passe <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                <FaLock className="text-lg" />
              </div>
              <input
                type={showOldPassword ? "text" : "password"}
                id="oldPassword"
                name="oldPassword"
                value={oldPassword}
                onChange={(e) => setOldPassword(e.target.value)}
                className="w-full border-2 border-gray-300 focus:border-green-500 focus:ring-2 focus:ring-green-200 rounded-lg py-2.5 pl-11 pr-11 outline-none transition-all"
                placeholder="Entrez votre ancien mot de passe"
                required
              />
              <button
                type="button"
                onClick={() => setShowOldPassword(!showOldPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
              >
                {showOldPassword ? <FaEyeSlash className="text-lg" /> : <FaEye className="text-lg" />}
              </button>
            </div>
          </div>

          {/* New Password */}
          <div>
            <label htmlFor="newPassword" className="block text-sm font-semibold text-gray-700 mb-2">
              Nouveau Mot de Passe <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                <FaLock className="text-lg" />
              </div>
              <input
                type={showNewPassword ? "text" : "password"}
                id="newPassword"
                name="newPassword"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full border-2 border-gray-300 focus:border-green-500 focus:ring-2 focus:ring-green-200 rounded-lg py-2.5 pl-11 pr-11 outline-none transition-all"
                placeholder="Entrez votre nouveau mot de passe"
                required
              />
              <button
                type="button"
                onClick={() => setShowNewPassword(!showNewPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
              >
                {showNewPassword ? <FaEyeSlash className="text-lg" /> : <FaEye className="text-lg" />}
              </button>
            </div>
            
            {/* Password Strength Indicator */}
            {newPassword && (
              <div className="mt-3">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs font-medium text-gray-600">Force du mot de passe</span>
                  <span className={`text-xs font-semibold ${
                    passwordStrength.strength >= 75 ? 'text-green-600' :
                    passwordStrength.strength >= 50 ? 'text-yellow-600' :
                    'text-red-600'
                  }`}>
                    {passwordStrength.label}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full transition-all duration-300 ${passwordStrength.color}`}
                    style={{ width: `${passwordStrength.strength}%` }}
                  ></div>
                </div>
              </div>
            )}
          </div>

          {/* Confirm Password */}
          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-semibold text-gray-700 mb-2">
              Confirmer Nouveau Mot de Passe <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                <FaLock className="text-lg" />
              </div>
              <input
                type={showConfirmPassword ? "text" : "password"}
                id="confirmPassword"
                name="confirmPassword"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className={`w-full border-2 ${
                  confirmPassword && newPassword !== confirmPassword
                    ? 'border-red-500 focus:border-red-500 focus:ring-red-200'
                    : 'border-gray-300 focus:border-green-500 focus:ring-green-200'
                } focus:ring-2 rounded-lg py-2.5 pl-11 pr-11 outline-none transition-all`}
                placeholder="Confirmez votre nouveau mot de passe"
                required
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
              >
                {showConfirmPassword ? <FaEyeSlash className="text-lg" /> : <FaEye className="text-lg" />}
              </button>
            </div>
            
            {/* Password Match Indicator */}
            {confirmPassword && (
              <div className="mt-2">
                {newPassword === confirmPassword ? (
                  <p className="text-xs text-green-600 flex items-center gap-1.5">
                    <FaCheckCircle />
                    <span>Les mots de passe correspondent</span>
                  </p>
                ) : (
                  <p className="text-xs text-red-600 flex items-center gap-1.5">
                    <span>⚠️</span>
                    <span>Les mots de passe ne correspondent pas</span>
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={() => router.push('/dashboard/candidat/profile')}
              disabled={isSubmitting}
              className="flex-1 px-4 py-2.5 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium disabled:opacity-50"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !oldPassword || !newPassword || !confirmPassword || newPassword !== confirmPassword}
              className="flex-1 px-4 py-2.5 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white rounded-lg transition-colors font-medium shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>Enregistrement...</span>
                </>
              ) : (
                <>
                  <FaCheckCircle />
                  <span>Sauvegarder</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ChangePassword;
