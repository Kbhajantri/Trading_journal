'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../contexts/AuthContext';
import AuthSection from '../components/AuthSection';
import LoadingSpinner from '../components/LoadingSpinner';

export default function HomePage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  // Redirect to dashboard if authenticated
  useEffect(() => {
    if (user) {
      router.push('/dashboard');
    }
  }, [user, router]);

  if (loading) {
    return <LoadingSpinner />;
  }

  // Show auth section if not authenticated
  if (!user) {
    return <AuthSection onLogin={() => {}} />;
  }

  // This will only show briefly before redirect
  return <LoadingSpinner />;

}
