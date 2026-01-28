"use client";

import React, { useState } from 'react';
import { Eye, EyeOff, Lock, CheckCircle, XCircle } from 'lucide-react';

const PasswordValidationDemo = () => {
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showRequirements, setShowRequirements] = useState(false);

  const getPasswordRequirements = (password: string) => {
    return {
      minLength: password.length >= 8,
      hasLowercase: /(?=.*[a-z])/.test(password),
      hasUppercase: /(?=.*[A-Z])/.test(password),
      hasNumber: /(?=.*\d)/.test(password),
      hasSpecialChar: /(?=.*[@$!%*?&])/.test(password)
    };
  };

  const requirements = getPasswordRequirements(password);
  const allRequirementsMet = Object.values(requirements).every(req => req);

  return (
    <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-lg">
      <h2 className="text-xl font-bold text-gray-800 mb-4">
        Validation du Mot de Passe
      </h2>
      
      <div className="space-y-4">
        {/* Password Fields in Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
              Mot de passe *
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Lock className="h-5 w-5 text-gray-400" />
              </div>
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onFocus={() => setShowRequirements(true)}
                onBlur={() => setShowRequirements(false)}
                className="block w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                placeholder="Tapez votre mot de passe..."
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
              >
                {showPassword ? (
                  <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                ) : (
                  <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                )}
              </button>
            </div>
          </div>

          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
              Confirmer le mot de passe *
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Lock className="h-5 w-5 text-gray-400" />
              </div>
              <input
                id="confirmPassword"
                type="password"
                className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                placeholder="Confirmez votre mot de passe..."
              />
            </div>
          </div>
        </div>

        {/* Password Requirements - Under both password fields */}
        {(showRequirements || password) && (
          <div className="p-3 bg-gray-50 rounded-lg border">
            <p className="text-xs font-medium text-gray-700 mb-2">
              Exigences du mot de passe :
            </p>
            <div className="space-y-1">
              <div className="flex items-center text-xs">
                {requirements.minLength ? (
                  <CheckCircle className="h-3 w-3 text-green-500 mr-2" />
                ) : (
                  <XCircle className="h-3 w-3 text-red-500 mr-2" />
                )}
                <span className={requirements.minLength ? "text-green-700" : "text-red-700"}>
                  Au moins 8 caractères
                </span>
              </div>
              <div className="flex items-center text-xs">
                {requirements.hasLowercase ? (
                  <CheckCircle className="h-3 w-3 text-green-500 mr-2" />
                ) : (
                  <XCircle className="h-3 w-3 text-red-500 mr-2" />
                )}
                <span className={requirements.hasLowercase ? "text-green-700" : "text-red-700"}>
                  Une lettre minuscule (a-z)
                </span>
              </div>
              <div className="flex items-center text-xs">
                {requirements.hasUppercase ? (
                  <CheckCircle className="h-3 w-3 text-green-500 mr-2" />
                ) : (
                  <XCircle className="h-3 w-3 text-red-500 mr-2" />
                )}
                <span className={requirements.hasUppercase ? "text-green-700" : "text-red-700"}>
                  Une lettre majuscule (A-Z)
                </span>
              </div>
              <div className="flex items-center text-xs">
                {requirements.hasNumber ? (
                  <CheckCircle className="h-3 w-3 text-green-500 mr-2" />
                ) : (
                  <XCircle className="h-3 w-3 text-red-500 mr-2" />
                )}
                <span className={requirements.hasNumber ? "text-green-700" : "text-red-700"}>
                  Un chiffre (0-9)
                </span>
              </div>
              <div className="flex items-center text-xs">
                {requirements.hasSpecialChar ? (
                  <CheckCircle className="h-3 w-3 text-green-500 mr-2" />
                ) : (
                  <XCircle className="h-3 w-3 text-red-500 mr-2" />
                )}
                <span className={requirements.hasSpecialChar ? "text-green-700" : "text-red-700"}>
                  Un caractère spécial (@$!%*?&)
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Password Strength Indicator */}
        {password && (
          <div className="mt-3">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-medium text-gray-700">Force du mot de passe</span>
              <span className={`text-xs font-medium ${
                allRequirementsMet ? 'text-green-600' : 'text-red-600'
              }`}>
                {allRequirementsMet ? 'Fort' : 'Faible'}
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className={`h-2 rounded-full transition-all duration-300 ${
                  allRequirementsMet ? 'bg-green-500' : 'bg-red-500'
                }`}
                style={{ 
                  width: `${(Object.values(requirements).filter(Boolean).length / 5) * 100}%` 
                }}
              ></div>
            </div>
          </div>
        )}

        {/* Test Examples */}
        <div className="mt-6 p-3 bg-blue-50 rounded-lg">
          <p className="text-xs font-medium text-blue-800 mb-2">Exemples de mots de passe :</p>
          <div className="space-y-1 text-xs">
            <button
              onClick={() => setPassword('password')}
              className="block text-left text-red-600 hover:text-red-800"
            >
              ❌ password (trop simple)
            </button>
            <button
              onClick={() => setPassword('Password1')}
              className="block text-left text-orange-600 hover:text-orange-800"
            >
              ⚠️ Password1 (manque caractère spécial)
            </button>
            <button
              onClick={() => setPassword('Password1!')}
              className="block text-left text-green-600 hover:text-green-800"
            >
              ✅ Password1! (valide)
            </button>
            <button
              onClick={() => setPassword('MonMotDePasse2024@')}
              className="block text-left text-green-600 hover:text-green-800"
            >
              ✅ MonMotDePasse2024@ (très fort)
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PasswordValidationDemo;