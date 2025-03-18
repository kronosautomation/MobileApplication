import { useState, useEffect, useCallback } from 'react';
import { GuidedMeditation } from '../../types';
import { meditationService } from '../../api';

interface UseMeditationsResult {
  meditations: GuidedMeditation[];
  categories: string[];
  loading: boolean;
  error: string | null;
  selectedCategory: string | null;
  setSelectedCategory: (category: string | null) => void;
  refreshMeditations: () => Promise<void>;
}

/**
 * Custom hook for handling meditation list functionality
 * @param initialCategory - Optional initial category filter
 * @returns Meditation data, categories, loading state, and filter functions
 */
export const useMeditations = (initialCategory: string | null = null): UseMeditationsResult => {
  const [meditations, setMeditations] = useState<GuidedMeditation[]>([]);
  const [filteredMeditations, setFilteredMeditations] = useState<GuidedMeditation[]>([]);
  const [categories, setCategories] = useState<string[]>(['All']);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(initialCategory);

  // Fetch meditations from API
  const fetchMeditations = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Get meditations from the API
      const response = await meditationService.getMeditations();
      const meditationList = response.meditations || [];
      
      // Extract unique categories
      const uniqueCategories = ['All', ...Array.from(new Set(
        meditationList.flatMap(m => m.categories || [])
      ))];
      
      setMeditations(meditationList);
      setCategories(uniqueCategories);
      
      // Apply category filter if selected
      if (selectedCategory && selectedCategory !== 'All') {
        const filtered = meditationList.filter(m => 
          m.categories && m.categories.includes(selectedCategory)
        );
        setFilteredMeditations(filtered);
      } else {
        setFilteredMeditations(meditationList);
      }
    } catch (error) {
      console.error('Error fetching meditations:', error);
      setError('Failed to load meditations. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [selectedCategory]);

  // Filter meditations when category changes
  useEffect(() => {
    if (selectedCategory && selectedCategory !== 'All') {
      const filtered = meditations.filter(m => 
        m.categories && m.categories.includes(selectedCategory)
      );
      setFilteredMeditations(filtered);
    } else {
      setFilteredMeditations(meditations);
    }
  }, [selectedCategory, meditations]);

  // Initial fetch on mount
  useEffect(() => {
    fetchMeditations();
  }, [fetchMeditations]);

  return {
    meditations: filteredMeditations,
    categories,
    loading,
    error,
    selectedCategory,
    setSelectedCategory,
    refreshMeditations: fetchMeditations,
  };
};

export default useMeditations;
