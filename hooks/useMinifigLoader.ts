import { useState, useEffect, useMemo } from 'react';
import { Minifigure } from '../types';
import { supabase } from '../services/supabaseClient';

export interface LoaderConfig {
  ids?: string[];
  nameFilter?: string[];
  excludeFilter?: string[];
}

export function useMinifigLoader(allMinifigs: Minifigure[], configs: LoaderConfig[]) {
  const [loadedMinifigs, setLoadedMinifigs] = useState<Minifigure[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const allIds = useMemo(() => {
    const ids = new Set<string>();
    configs.forEach(c => {
      if (c.ids) c.ids.forEach(id => ids.add(id));
    });
    return Array.from(ids);
  }, [configs]);

  const allNameFilters = useMemo(() => {
    const filters = new Set<string>();
    configs.forEach(c => {
      if (c.nameFilter) c.nameFilter.forEach(f => filters.add(f));
    });
    return Array.from(filters);
  }, [configs]);

  useEffect(() => {
    if (allIds.length === 0 && allNameFilters.length === 0) return;

    const missingIds = allIds.filter(id => !allMinifigs.some(m => m.item_no === id));
    
    const fetchMissing = async () => {
      setIsLoading(true);
      try {
        const fetched: Minifigure[] = [];

        // Fetch by IDs
        if (missingIds.length > 0) {
          const chunkSize = 100;
          for (let i = 0; i < missingIds.length; i += chunkSize) {
            const chunk = missingIds.slice(i, i + chunkSize);
            const { data, error } = await supabase
              .from('minifigures')
              .select('*')
              .in('item_no', chunk);
            
            if (error) throw error;
            if (data) fetched.push(...data);
          }
        }

        // Fetch by Name Filters
        // This is a bit more expensive, so we only do it if we don't have enough data
        // For archive pages, we usually want all of them.
        if (allNameFilters.length > 0) {
          for (const filter of allNameFilters) {
            // Check if we already have some minifigs matching this filter in allMinifigs or fetched
            // Actually, it's safer to just fetch from Supabase to be sure we have the full list
            const { data, error } = await supabase
              .from('minifigures')
              .select('*')
              .ilike('name', `%${filter}%`);
            
            if (error) throw error;
            if (data) {
              data.forEach(m => {
                if (!fetched.some(f => f.item_no === m.item_no) && !allMinifigs.some(am => am.item_no === m.item_no)) {
                  fetched.push(m);
                }
              });
            }
          }
        }
        
        if (fetched.length > 0) {
          setLoadedMinifigs(prev => {
            const map = new Map<string, Minifigure>();
            prev.forEach(m => map.set(m.item_no, m));
            fetched.forEach(m => map.set(m.item_no, m));
            return Array.from(map.values());
          });
        }
      } catch (error) {
        console.error('Error loading missing minifigs:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchMissing();
  }, [allIds, allNameFilters, allMinifigs]);

  const combinedMinifigs = useMemo(() => {
    const map = new Map<string, Minifigure>();
    allMinifigs.forEach(m => map.set(m.item_no, m));
    loadedMinifigs.forEach(m => map.set(m.item_no, m));
    return Array.from(map.values());
  }, [allMinifigs, loadedMinifigs]);

  return { combinedMinifigs, isLoading };
}
