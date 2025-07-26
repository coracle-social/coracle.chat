import { useState } from 'react';

export interface UseSearchFiltersReturn {
  selectedFilters: string[];
  selectedSort: string;
  handleFilterToggle: (filterId: string) => void;
  handleFilterRemove: (filterId: string) => void;
  isSortDisabled: (filterId: string) => boolean;
}

export const useSearchFilters = (): UseSearchFiltersReturn => {
  const [selectedFilters, setSelectedFilters] = useState<string[]>(['people']);
  const [selectedSort, setSelectedSort] = useState('relevance');

  // Handle filter/sort selection
  const handleFilterToggle = (filterId: string) => {
    if (['relevance', 'date', 'popularity', 'trust'].includes(filterId)) {
      setSelectedSort(filterId);
    } else {
      setSelectedFilters([filterId]);
    }
  };

  const handleFilterRemove = (filterId: string) => {
    if (!['relevance', 'date', 'popularity', 'trust'].includes(filterId)) {
      setSelectedFilters(['people']); // Default to people if no filter is selected
    }
  };

  // Check if sort option should be disabled
  const isSortDisabled = (filterId: string) => {
    //for the future
    return false;
  };

  return {
    selectedFilters,
    selectedSort,
    handleFilterToggle,
    handleFilterRemove,
    isSortDisabled,
  };
};
