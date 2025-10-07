'use client';

import { useEffect, useState } from 'react';
import { apiClient } from '@/utils/api';
import useVisibilityAwareInterval from './useVisibilityAwareInterval';

export default function useSampleImages(jobID: string, reloadInterval: null | number = null) {
  const [sampleImages, setSampleImages] = useState<string[]>([]);
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

  const refreshSampleImages = () => {
    setStatus('loading');
    apiClient
      .get(`/api/jobs/${jobID}/samples`)
      .then(res => res.data)
      .then(data => {
        console.log('Fetched sample images:', data);
        if (data.samples) {
          setSampleImages(data.samples);
        }
        setStatus('success');
      })
      .catch(error => {
        console.error('Error fetching datasets:', error);
        setStatus('error');
      });
  };

  // Initial load
  useEffect(() => {
    refreshSampleImages();
  }, [jobID]);

  // Set up visibility-aware polling
  useVisibilityAwareInterval(refreshSampleImages, reloadInterval, [jobID]);

  return { sampleImages, setSampleImages, status, refreshSampleImages };
}
