import { SearchResult } from '@/lib/types/search';
import type { FuseResultMatch, IFuseOptions } from 'fuse.js';
import Fuse from 'fuse.js';

// Fuse.js configuration for different search types
const profileFuseOptions: IFuseOptions<any> = {
  keys: [
    { name: 'name', weight: 1.0 }, // Full weight for profile names
    { name: 'display_name', weight: 1.0 }, // Full weight for display names
    { name: 'nip05', weight: 1.0 }, // Full weight for domain verification (URL-like)
    { name: 'website', weight: 1.0 }, // Full weight for website URLs
    { name: 'about', weight: 0.3 }, // Reduced importance for descriptive text
    { name: 'lud06', weight: 0.5 }, // Medium weight for Lightning addresses
    { name: 'lud16', weight: 0.5 }, // Medium weight for Lightning addresses
  ],
  threshold: 0.5, // More lenient threshold to find more matches
  distance: 150, // Increased distance for more flexible matching
  minMatchCharLength: 2,
  shouldSort: true,
  includeScore: true,
  includeMatches: true,
};

const contentFuseOptions: IFuseOptions<any> = {
  keys: [
    { name: 'content', weight: 0.8 },
    { name: 'pubkey', weight: 0.2 },
  ],
  threshold: 0.6, // More lenient threshold to find more matches
  distance: 300, // Increased distance for more flexible matching
  minMatchCharLength: 2,
  shouldSort: true,
  includeScore: true,
  includeMatches: true,
};

/**
 * Perform fuzzy search on profile data
 * @param profiles - Array of profile objects to search
 * @param searchTerm - The search term
 * @returns Array of search results with scores
 */
export const fuzzySearchProfiles = (profiles: any[], searchTerm: string): any[] => {
  if (!searchTerm || searchTerm.length < 2) return profiles;

  const fuse = new Fuse(profiles, profileFuseOptions);
  const results = fuse.search(searchTerm);

  // If fuzzy search returns too few results, include more from the original dataset
  if (results.length < Math.min(profiles.length * 0.3, 10)) {
    console.log(`[FUZZY-SEARCH] Fuzzy search returned only ${results.length} results, adding more from original dataset`);

    // Add some original results that weren't caught by fuzzy search
    const fuzzyIds = new Set(results.map(r => r.item.event?.pubkey));
    const additionalResults = profiles
      .filter(profile => !fuzzyIds.has(profile.event?.pubkey))
      .slice(0, Math.max(10, profiles.length - results.length))
      .map(profile => ({
        ...profile,
        _fuseScore: 0.8, // Default score for non-fuzzy matches
        _fuseMatches: [],
      }));

    return [...results.map(result => ({
      ...result.item,
      _fuseScore: result.score,
      _fuseMatches: result.matches,
    })), ...additionalResults];
  }

  // Return the original objects with their scores
  return results.map(result => ({
    ...result.item,
    _fuseScore: result.score,
    _fuseMatches: result.matches,
  }));
};

/**
 * Perform fuzzy search on content data
 * @param events - Array of event objects to search
 * @param searchTerm - The search term
 * @returns Array of search results with scores
 */
export const fuzzySearchContent = (events: any[], searchTerm: string): any[] => {
  if (!searchTerm || searchTerm.length < 2) return events;

  const fuse = new Fuse(events, contentFuseOptions);
  const results = fuse.search(searchTerm);

  // If fuzzy search returns too few results, include more from the original dataset
  if (results.length < Math.min(events.length * 0.3, 10)) {
    console.log(`[FUZZY-SEARCH] Fuzzy search returned only ${results.length} results, adding more from original dataset`);

    // Add some original results that weren't caught by fuzzy search
    const fuzzyIds = new Set(results.map(r => r.item.id));
    const additionalResults = events
      .filter(event => !fuzzyIds.has(event.id))
      .slice(0, Math.max(10, events.length - results.length))
      .map(event => ({
        ...event,
        _fuseScore: 0.8, // Default score for non-fuzzy matches
        _fuseMatches: [],
      }));

    return [...results.map(result => ({
      ...result.item,
      _fuseScore: result.score,
      _fuseMatches: result.matches,
    })), ...additionalResults];
  }

  // Return the original objects with their scores
  return results.map(result => ({
    ...result.item,
    _fuseScore: result.score,
    _fuseMatches: result.matches,
  }));
};

/**
 * Perform fuzzy search on SearchResult objects
 * @param results - Array of SearchResult objects
 * @param searchTerm - The search term
 * @returns Array of filtered SearchResult objects
 */
export const fuzzySearchResults = (results: SearchResult[], searchTerm: string): SearchResult[] => {
  if (!searchTerm || searchTerm.length < 2) return results;

  const fuseOptions: IFuseOptions<SearchResult> = {
    keys: [
      { name: 'title', weight: 0.5 },
      { name: 'subtitle', weight: 0.3 },
      { name: 'description', weight: 0.2 },
      { name: 'metadata.author', weight: 0.1 },
    ],
    threshold: 0.4,
    distance: 150,
    minMatchCharLength: 2,
    shouldSort: true,
    includeScore: true,
    includeMatches: true,
  };

  const fuse = new Fuse(results, fuseOptions);
  const fuseResults = fuse.search(searchTerm);

  return fuseResults.map(result => ({
    ...result.item,
    _fuseScore: result.score,
    _fuseMatches: result.matches,
  }));
};

/**
 * Highlight matched text in search results
 * @param text - The original text
 * @param matches - Fuse.js match data
 * @returns Text with highlighted matches
 */
export const highlightMatches = (text: string, matches: FuseResultMatch[]): string => {
  if (!matches || matches.length === 0) return text;

  let highlightedText = text;
  const sortedMatches = matches
    .flatMap(match => match.indices)
    .sort((a, b) => b[0] - a[0]); // Sort in reverse order to avoid index shifting

  for (const [start, end] of sortedMatches) {
    const matchedText = text.substring(start, end + 1);
    const highlightedMatch = `**${matchedText}**`;
    highlightedText = highlightedText.substring(0, start) + highlightedMatch + highlightedText.substring(end + 1);
  }

  return highlightedText;
};

/**
 * Get search suggestions based on fuzzy matching
 * @param data - Array of data to search
 * @param searchTerm - The search term
 * @param maxSuggestions - Maximum number of suggestions to return
 * @returns Array of suggestion strings
 */
export const getSearchSuggestions = (
  data: any[],
  searchTerm: string,
  maxSuggestions: number = 5
): string[] => {
  if (!searchTerm || searchTerm.length < 2) return [];

  const fuseOptions: IFuseOptions<any> = {
    keys: [
      { name: 'name', weight: 1.0 }, // Full weight for profile names
      { name: 'display_name', weight: 1.0 }, // Full weight for display names
      { name: 'nip05', weight: 1.0 }, // Full weight for domain verification
      { name: 'website', weight: 1.0 }, // Full weight for website URLs
      { name: 'about', weight: 0.3 }, // Reduced importance for descriptive text
      { name: 'content', weight: 0.3 }, // Reduced importance for content
    ],
    threshold: 0.5,
    distance: 100,
    minMatchCharLength: 2,
    shouldSort: true,
    includeScore: true,
  };

  const fuse = new Fuse(data, fuseOptions);
  const results = fuse.search(searchTerm);

  const suggestions = new Set<string>();

  for (const result of results.slice(0, maxSuggestions * 2)) {
    // Extract relevant text for suggestions
    if (result.item.name) suggestions.add(result.item.name);
    if (result.item.display_name) suggestions.add(result.item.display_name);
    if (result.item.content && result.item.content.length < 50) {
      suggestions.add(result.item.content.substring(0, 50) + '...');
    }

    if (suggestions.size >= maxSuggestions) break;
  }

  return Array.from(suggestions).slice(0, maxSuggestions);
};
