// finish this file when full indexdb and mobile sqlite is implemented

export interface SearchPreferences {
  selectedFilters: string[];
  selectedSort: string;
  imageSizingStrategy?: string;
  postLengthMode?: string;
}

export const DEFAULT_SEARCH_PREFERENCES: SearchPreferences = {
  selectedFilters: ['people'],
  selectedSort: 'relevance',
};
