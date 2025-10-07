'use client';

import { GPUApiResponse, GpuInfo } from '@/types';
import { useEffect, useState } from 'react';
import { apiClient } from '@/utils/api';
import useVisibilityAwareInterval from './useVisibilityAwareInterval';

export default function useGPUInfo(gpuIds: null | number[] = null, reloadInterval: null | number = null) {
  const [gpuList, setGpuList] = useState<GpuInfo[]>([]);
  const [isGPUInfoLoaded, setIsLoaded] = useState(false);
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

  const fetchGpuInfo = async () => {
    setStatus('loading');
    try {
      const data: GPUApiResponse = await apiClient.get('/api/gpu').then(res => res.data);
      let gpus = data.gpus.sort((a, b) => a.index - b.index);
      if (gpuIds) {
        gpus = gpus.filter(gpu => gpuIds.includes(gpu.index));
      }
      setGpuList(gpus);
      setStatus('success');
    } catch (err) {
      console.error(`Failed to fetch GPU data: ${err instanceof Error ? err.message : String(err)}`);
      setStatus('error');
    } finally {
      setIsLoaded(true);
    }
  };

  // Initial load
  useEffect(() => {
    fetchGpuInfo();
  }, [gpuIds]);

  // Set up visibility-aware polling
  useVisibilityAwareInterval(fetchGpuInfo, reloadInterval, [gpuIds]);

  return { gpuList, setGpuList, isGPUInfoLoaded, status, refreshGpuInfo: fetchGpuInfo };
}
