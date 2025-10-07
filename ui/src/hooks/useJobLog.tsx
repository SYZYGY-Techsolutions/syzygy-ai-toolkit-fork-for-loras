'use client';

import { useEffect, useState, useRef } from 'react';
import { apiClient } from '@/utils/api';
import useVisibilityAwareInterval from './useVisibilityAwareInterval';

const clean = (text: string): string => {
  // remove \x1B[A\x1B[A
  text = text.replace(/\x1B\[A/g, '');
  return text;
};

export default function useJobLog(jobID: string, reloadInterval: null | number = null) {
  const [log, setLog] = useState<string>('');
  const didInitialLoadRef = useRef(false);
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error' | 'refreshing'>('idle');

  const refresh = () => {
    let loadStatus: 'loading' | 'refreshing' = 'loading';
    if (didInitialLoadRef.current) {
      loadStatus = 'refreshing';
    }
    setStatus(loadStatus);
    apiClient
      .get(`/api/jobs/${jobID}/log`)
      .then(res => res.data)
      .then(data => {
        if (data.log) {
          let cleanLog = clean(data.log);
          setLog(cleanLog);
        }
        setStatus('success');
        didInitialLoadRef.current = true;
      })
      .catch(error => {
        console.error('Error fetching log:', error);
        setStatus('error');
      });
  };

  // Initial load
  useEffect(() => {
    refresh();
  }, [jobID]);

  // Set up visibility-aware polling
  useVisibilityAwareInterval(refresh, reloadInterval, [jobID]);

  return { log, setLog, status, refresh };
}
