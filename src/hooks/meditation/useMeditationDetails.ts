import { useState, useEffect, useCallback } from 'react';
import { GuidedMeditation, DifficultyLevel } from '../../types';
import { meditationService } from '../../api';

interface UseMeditationDetailsResult {
  meditation: GuidedMeditation | null;
  isLoading: boolean;
  error: string | null;
  formatDuration: (seconds: number) => string;
  getDifficultyLabel: (level: DifficultyLevel) => string;
  refreshMeditation: () => Promise<void>;
}

/**
 * Custom hook for handling meditation details functionality
 * @param meditationId - The ID of the meditation to fetch
 * @returns Meditation data, loading state, error state, and utility functions
 */
export const useMeditationDetails = (meditationId: string): UseMeditationDetailsResult => {
  const [meditation, setMeditation] = useState<GuidedMeditation | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch meditation data
  const fetchMeditation = useCallback(async () => {
    if (!meditationId) return;
    
    setIsLoading(true);
    try {
      const meditationData = await meditationService.getMeditationById(meditationId);
      setMeditation(meditationData);
      setError(null);
    } catch (err) {
      console.error('Error fetching meditation:', err);
      setError('Failed to load meditation details. Please try again.');
      setMeditation(null);
    } finally {
      setIsLoading(false);
    }
  }, [meditationId]);

  // Format duration from seconds to minutes
  const formatDuration = useCallback((seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    return `${minutes} min`;
  }, []);

  // Get difficulty level label
  const getDifficultyLabel = useCallback((level: DifficultyLevel): string => {
    switch (level) {
      case DifficultyLevel.Beginner:
        return 'Beginner';
      case DifficultyLevel.Intermediate:
        return 'Intermediate';
      case DifficultyLevel.Advanced:
        return 'Advanced';
      default:
        return 'Unknown';
    }
  }, []);

  // Fetch meditation on mount or ID change
  useEffect(() => {
    fetchMeditation();
  }, [fetchMeditation]);

  return {
    meditation,
    isLoading,
    error,
    formatDuration,
    getDifficultyLabel,
    refreshMeditation: fetchMeditation,
  };
};

export default useMeditationDetails;
