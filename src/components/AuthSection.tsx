'use client';

import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';

interface AuthSectionProps {
  onLogin: () => void;
}

export default function AuthSection({ onLogin }: AuthSectionProps) {
  const { signIn, signUp, resetPassword } = useAuth();
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [isLoading, setIsLoading] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Form data
  const [loginData, setLoginData] = useState({ email: '', password: '', rememberMe: false });
  const [signupData, setSignupData] = useState({ 
    name: '', 
    email: '', 
    password: '', 
    confirmPassword: '', 
    agreeTerms: false 
  });
  const [resetData, setResetData] = useState({ email: '' });

  // Password visibility
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [showSignupPassword, setShowSignupPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const validateEmail = (email: string) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  };

  const validatePassword = (password: string) => {
    return password.length >= 8;
  };

  const clearErrors = () => {
    setErrors({});
  };

  const setError = (field: string, message: string) => {
    setErrors(prev => ({ ...prev, [field]: message }));
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    clearErrors();
    
    let isValid = true;

    if (!loginData.email) {
      setError('loginEmail', 'Email is required');
      isValid = false;
    } else if (!validateEmail(loginData.email)) {
      setError('loginEmail', 'Please enter a valid email');
      isValid = false;
    }

    if (!loginData.password) {
      setError('loginPassword', 'Password is required');
      isValid = false;
    }

    if (isValid) {
      setIsLoading(true);
      
      const { error } = await signIn(loginData.email, loginData.password);
      
      if (error) {
        setError('loginEmail', error.message);
      } else {
        onLogin();
      }
      
      setIsLoading(false);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    clearErrors();
    
    let isValid = true;

    if (!signupData.name.trim()) {
      setError('signupName', 'Full name is required');
      isValid = false;
    }

    if (!signupData.email) {
      setError('signupEmail', 'Email is required');
      isValid = false;
    } else if (!validateEmail(signupData.email)) {
      setError('signupEmail', 'Please enter a valid email');
      isValid = false;
    }

    if (!signupData.password) {
      setError('signupPassword', 'Password is required');
      isValid = false;
    } else if (!validatePassword(signupData.password)) {
      setError('signupPassword', 'Password must be at least 8 characters');
      isValid = false;
    }

    if (!signupData.confirmPassword) {
      setError('confirmPassword', 'Please confirm your password');
      isValid = false;
    } else if (signupData.password !== signupData.confirmPassword) {
      setError('confirmPassword', 'Passwords do not match');
      isValid = false;
    }

    if (!signupData.agreeTerms) {
      setError('agreeTerms', 'Please agree to the Terms & Conditions');
      isValid = false;
    }

    if (isValid) {
      setIsLoading(true);
      
      const { error } = await signUp(signupData.email, signupData.password, signupData.name);
      
      if (error) {
        setError('signupEmail', error.message);
      } else {
        // Show success message for email confirmation
        alert('Please check your email to confirm your account before signing in.');
        setMode('login');
      }
      
      setIsLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    clearErrors();
    
    if (!resetData.email) {
      setError('resetEmail', 'Email is required');
      return;
    } else if (!validateEmail(resetData.email)) {
      setError('resetEmail', 'Please enter a valid email');
      return;
    }

    setIsLoading(true);
    
    const { error } = await resetPassword(resetData.email);
    
    if (error) {
      setError('resetEmail', error.message);
    } else {
      alert('Reset link sent! Check your email.');
      setShowForgotPassword(false);
    }
    
    setIsLoading(false);
  };

  const getPasswordStrength = (password: string) => {
    let strength = 0;
    if (password.length >= 8) strength++;
    if (/[a-z]/.test(password)) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/[0-9]/.test(password)) strength++;
    if (/[^A-Za-z0-9]/.test(password)) strength++;
    
    if (strength <= 1) return { text: 'Weak', class: 'strength-weak' };
    if (strength === 2) return { text: 'Fair', class: 'strength-fair' };
    if (strength <= 4) return { text: 'Good', class: 'strength-good' };
    return { text: 'Strong', class: 'strength-strong' };
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      {/* Main Authentication Card */}
      <div className="glass rounded-2xl p-8 w-full max-w-md blue-glow fade-in">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <i className="fas fa-chart-line text-2xl text-white"></i>
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">
            {mode === 'login' ? 'Welcome Back' : 'Create Account'}
          </h1>
          <p className="text-slate-400">
            {mode === 'login' ? 'Sign in to your trading account' : 'Sign up for a new trading account'}
          </p>
        </div>

        {/* Mode Toggle */}
        <div className="flex rounded-xl p-1 mb-8 glass-light">
          <button 
            className={`toggle-btn flex-1 py-3 px-4 rounded-lg font-medium text-sm ${mode === 'login' ? 'active' : ''}`}
            onClick={() => setMode('login')}
          >
            Login
          </button>
          <button 
            className={`toggle-btn flex-1 py-3 px-4 rounded-lg font-medium text-sm ${mode === 'signup' ? 'active' : ''}`}
            onClick={() => setMode('signup')}
          >
            Signup
          </button>
        </div>

        {/* Login Form */}
        {mode === 'login' && (
          <form onSubmit={handleLogin} className="space-y-6">
            {/* Email Field */}
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <i className="fas fa-envelope text-slate-400"></i>
              </div>
              <input 
                type="email" 
                value={loginData.email}
                onChange={(e) => setLoginData(prev => ({ ...prev, email: e.target.value }))}
                className={`input-field w-full pl-12 pr-4 py-4 rounded-xl text-white placeholder-slate-400 ${errors.loginEmail ? 'error' : ''}`}
                placeholder="Enter your email" 
                required 
              />
              {errors.loginEmail && (
                <div className="error-message text-red-400 text-sm mt-1">{errors.loginEmail}</div>
              )}
            </div>

            {/* Password Field */}
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <i className="fas fa-lock text-slate-400"></i>
              </div>
              <input 
                type={showLoginPassword ? "text" : "password"}
                value={loginData.password}
                onChange={(e) => setLoginData(prev => ({ ...prev, password: e.target.value }))}
                className={`input-field w-full pl-12 pr-12 py-4 rounded-xl text-white placeholder-slate-400 ${errors.loginPassword ? 'error' : ''}`}
                placeholder="Enter your password" 
                required 
              />
              <button 
                type="button" 
                className="absolute inset-y-0 right-0 pr-4 flex items-center" 
                onClick={() => setShowLoginPassword(!showLoginPassword)}
              >
                <i className={`fas ${showLoginPassword ? 'fa-eye-slash' : 'fa-eye'} text-slate-400 hover:text-blue-400 transition-colors`}></i>
              </button>
              {errors.loginPassword && (
                <div className="error-message text-red-400 text-sm mt-1">{errors.loginPassword}</div>
              )}
            </div>

            {/* Remember Me & Forgot Password */}
            <div className="flex items-center justify-between">
              <label className="flex items-center">
                <input 
                  type="checkbox" 
                  checked={loginData.rememberMe}
                  onChange={(e) => setLoginData(prev => ({ ...prev, rememberMe: e.target.checked }))}
                  className="w-4 h-4 text-blue-600 bg-slate-700 border-slate-600 rounded focus:ring-blue-500"
                />
                <span className="ml-2 text-sm text-slate-300">Remember me</span>
              </label>
              <button 
                type="button" 
                className="text-sm text-blue-400 hover:text-blue-300 transition-colors"
                onClick={() => setShowForgotPassword(true)}
              >
                Forgot Password?
              </button>
            </div>

            {/* Login Button */}
            <button 
              type="submit" 
              disabled={isLoading}
              className="btn-primary w-full py-4 rounded-xl font-semibold text-white flex items-center justify-center"
            >
              {isLoading ? (
                <>
                  <div className="spinner mr-2"></div>
                  Signing In...
                </>
              ) : (
                'Sign In'
              )}
            </button>

            {/* Divider */}
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-600"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-slate-900 text-slate-400">Or continue with</span>
              </div>
            </div>

            {/* Social Login */}
            <div className="grid grid-cols-2 gap-4">
              <button type="button" className="social-btn py-3 px-4 rounded-xl flex items-center justify-center">
                <i className="fab fa-google text-red-400 mr-2"></i>
                <span className="text-slate-300">Google</span>
              </button>
              <button type="button" className="social-btn py-3 px-4 rounded-xl flex items-center justify-center">
                <i className="fab fa-facebook text-blue-400 mr-2"></i>
                <span className="text-slate-300">Facebook</span>
              </button>
            </div>

            {/* Switch to Signup */}
            <p className="text-center text-slate-400">
              Don't have an account? 
              <button 
                type="button" 
                className="text-blue-400 hover:text-blue-300 transition-colors font-medium ml-1"
                onClick={() => setMode('signup')}
              >
                Sign up
              </button>
            </p>
          </form>
        )}

        {/* Signup Form */}
        {mode === 'signup' && (
          <form onSubmit={handleSignup} className="space-y-6">
            {/* Full Name Field */}
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <i className="fas fa-user text-slate-400"></i>
              </div>
              <input 
                type="text" 
                value={signupData.name}
                onChange={(e) => setSignupData(prev => ({ ...prev, name: e.target.value }))}
                className={`input-field w-full pl-12 pr-4 py-4 rounded-xl text-white placeholder-slate-400 ${errors.signupName ? 'error' : ''}`}
                placeholder="Enter your full name" 
                required 
              />
              {errors.signupName && (
                <div className="error-message text-red-400 text-sm mt-1">{errors.signupName}</div>
              )}
            </div>

            {/* Email Field */}
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <i className="fas fa-envelope text-slate-400"></i>
              </div>
              <input 
                type="email" 
                value={signupData.email}
                onChange={(e) => setSignupData(prev => ({ ...prev, email: e.target.value }))}
                className={`input-field w-full pl-12 pr-4 py-4 rounded-xl text-white placeholder-slate-400 ${errors.signupEmail ? 'error' : ''}`}
                placeholder="Enter your email" 
                required 
              />
              {errors.signupEmail && (
                <div className="error-message text-red-400 text-sm mt-1">{errors.signupEmail}</div>
              )}
            </div>

            {/* Password Field */}
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <i className="fas fa-lock text-slate-400"></i>
              </div>
              <input 
                type={showSignupPassword ? "text" : "password"}
                value={signupData.password}
                onChange={(e) => setSignupData(prev => ({ ...prev, password: e.target.value }))}
                className={`input-field w-full pl-12 pr-12 py-4 rounded-xl text-white placeholder-slate-400 ${errors.signupPassword ? 'error' : ''}`}
                placeholder="Enter your password" 
                required 
              />
              <button 
                type="button" 
                className="absolute inset-y-0 right-0 pr-4 flex items-center" 
                onClick={() => setShowSignupPassword(!showSignupPassword)}
              >
                <i className={`fas ${showSignupPassword ? 'fa-eye-slash' : 'fa-eye'} text-slate-400 hover:text-blue-400 transition-colors`}></i>
              </button>
              {errors.signupPassword && (
                <div className="error-message text-red-400 text-sm mt-1">{errors.signupPassword}</div>
              )}
              
              {/* Password Strength Indicator */}
              {signupData.password && (
                <div className="mt-2">
                  <div className="flex justify-between text-xs text-slate-400 mb-1">
                    <span>Password Strength</span>
                    <span>{getPasswordStrength(signupData.password).text}</span>
                  </div>
                  <div className="w-full bg-slate-700 rounded-full h-1">
                    <div className={`password-strength rounded-full ${getPasswordStrength(signupData.password).class}`}></div>
                  </div>
                </div>
              )}
            </div>

            {/* Confirm Password Field */}
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <i className="fas fa-lock text-slate-400"></i>
              </div>
              <input 
                type={showConfirmPassword ? "text" : "password"}
                value={signupData.confirmPassword}
                onChange={(e) => setSignupData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                className={`input-field w-full pl-12 pr-12 py-4 rounded-xl text-white placeholder-slate-400 ${errors.confirmPassword ? 'error' : ''}`}
                placeholder="Confirm your password" 
                required 
              />
              <button 
                type="button" 
                className="absolute inset-y-0 right-0 pr-4 flex items-center" 
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                <i className={`fas ${showConfirmPassword ? 'fa-eye-slash' : 'fa-eye'} text-slate-400 hover:text-blue-400 transition-colors`}></i>
              </button>
              {errors.confirmPassword && (
                <div className="error-message text-red-400 text-sm mt-1">{errors.confirmPassword}</div>
              )}
            </div>

            {/* Terms & Conditions */}
            <label className="flex items-start">
              <input 
                type="checkbox" 
                checked={signupData.agreeTerms}
                onChange={(e) => setSignupData(prev => ({ ...prev, agreeTerms: e.target.checked }))}
                className="w-4 h-4 text-blue-600 bg-slate-700 border-slate-600 rounded focus:ring-blue-500 mt-1" 
                required 
              />
              <span className="ml-2 text-sm text-slate-300">
                I agree to the 
                <a href="#" className="text-blue-400 hover:text-blue-300 transition-colors"> Terms & Conditions</a>
                and 
                <a href="#" className="text-blue-400 hover:text-blue-300 transition-colors"> Privacy Policy</a>
              </span>
            </label>

            {/* Signup Button */}
            <button 
              type="submit" 
              disabled={isLoading}
              className="btn-primary w-full py-4 rounded-xl font-semibold text-white flex items-center justify-center"
            >
              {isLoading ? (
                <>
                  <div className="spinner mr-2"></div>
                  Creating Account...
                </>
              ) : (
                'Create Account'
              )}
            </button>

            {/* Divider */}
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-600"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-slate-900 text-slate-400">Or continue with</span>
              </div>
            </div>

            {/* Social Login */}
            <div className="grid grid-cols-2 gap-4">
              <button type="button" className="social-btn py-3 px-4 rounded-xl flex items-center justify-center">
                <i className="fab fa-google text-red-400 mr-2"></i>
                <span className="text-slate-300">Google</span>
              </button>
              <button type="button" className="social-btn py-3 px-4 rounded-xl flex items-center justify-center">
                <i className="fab fa-facebook text-blue-400 mr-2"></i>
                <span className="text-slate-300">Facebook</span>
              </button>
            </div>

            {/* Switch to Login */}
            <p className="text-center text-slate-400">
              Already have an account? 
              <button 
                type="button" 
                className="text-blue-400 hover:text-blue-300 transition-colors font-medium ml-1"
                onClick={() => setMode('login')}
              >
                Sign in
              </button>
            </p>
          </form>
        )}
      </div>

      {/* Forgot Password Modal */}
      {showForgotPassword && (
        <div className="fixed inset-0 modal-overlay flex items-center justify-center p-4 z-50">
          <div className="glass rounded-2xl p-8 w-full max-w-md blue-glow slide-in">
            {/* Modal Header */}
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-white">Reset Password</h2>
              <button 
                type="button" 
                className="text-slate-400 hover:text-white transition-colors"
                onClick={() => setShowForgotPassword(false)}
              >
                <i className="fas fa-times text-xl"></i>
              </button>
            </div>

            {/* Reset Form */}
            <form onSubmit={handleResetPassword} className="space-y-6">
              <p className="text-slate-300 text-sm">Enter your email address and we'll send you a link to reset your password.</p>
              
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <i className="fas fa-envelope text-slate-400"></i>
                </div>
                <input 
                  type="email" 
                  value={resetData.email}
                  onChange={(e) => setResetData(prev => ({ ...prev, email: e.target.value }))}
                  className={`input-field w-full pl-12 pr-4 py-4 rounded-xl text-white placeholder-slate-400 ${errors.resetEmail ? 'error' : ''}`}
                  placeholder="Enter your email" 
                  required 
                />
                {errors.resetEmail && (
                  <div className="error-message text-red-400 text-sm mt-1">{errors.resetEmail}</div>
                )}
              </div>

              <button 
                type="submit" 
                disabled={isLoading}
                className="btn-primary w-full py-4 rounded-xl font-semibold text-white flex items-center justify-center"
              >
                {isLoading ? (
                  <>
                    <div className="spinner mr-2"></div>
                    Sending...
                  </>
                ) : (
                  'Send Reset Link'
                )}
              </button>

              <button 
                type="button" 
                className="w-full text-center text-blue-400 hover:text-blue-300 transition-colors"
                onClick={() => setShowForgotPassword(false)}
              >
                Back to Login
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
