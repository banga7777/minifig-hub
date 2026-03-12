
import { useQuery } from '@tanstack/react-query';
import { supabase } from '../../services/supabaseClient';
import { Minifigure } from '../../types';
import { generateSlug } from '../../utils/slug';
import { decodeHTMLEntities } from '../../utils/text';

export const useOwnedMinifigs = (userId: string | undefined) => {
  return useQuery({
    queryKey: ['ownedMinifigs', userId],
    queryFn: async () => {
      if (!userId) return [];
      
      const { data, error } = await supabase
        .from('user_owned_minifigs')
        .select(`
          minifig_id,
          minifigures (
            item_no,
            main_category,
            sub_category,
            name_en,
            category_id,
            year_released,
            image_url,
            last_stock_min_price,
            last_stock_avg_price,
            stock_updated_at
          )
        `)
        .eq('user_id', userId);

      if (error) throw error;

      return (data || []).map((item: any) => {
        const m = item.minifigures;
        const itemNo = m.item_no || 'unknown';
        const themeName = m.main_category || 'Other';
        const name = m.name_en || 'Untitled';
        
        return {
          item_no: itemNo,
          name: name,
          decoded_name: decodeHTMLEntities(name),
          theme_name: themeName,
          theme_slug: generateSlug(themeName),
          sub_category: m.sub_category || '',
          image_url: m.image_url || `https://img.bricklink.com/ItemImage/MN/0/${itemNo.toUpperCase()}.png`,
          category_id: m.category_id || 0,
          year_released: m.year_released || 0,
          owned: true,
          last_stock_min_price: m.last_stock_min_price,
          last_stock_avg_price: m.last_stock_avg_price,
          stock_updated_at: m.stock_updated_at
        } as Minifigure;
      });
    },
    enabled: !!userId,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};

export const useThemeMinifigs = (themeName: string, userId?: string) => {
  return useQuery({
    queryKey: ['themeMinifigs', themeName, userId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('minifigures')
        .select('*')
        .eq('main_category', themeName)
        .order('year_released', { ascending: false });

      if (error) throw error;

      let ownedIds = new Set<string>();
      if (userId) {
        const { data: owned, error: ownedError } = await supabase
          .from('user_owned_minifigs')
          .select('minifig_id')
          .eq('user_id', userId);
        if (!ownedError && owned) owned.forEach(o => ownedIds.add(o.minifig_id));
      }

      return (data || []).map((m: any) => {
        const itemNo = m.item_no || 'unknown';
        const name = m.name_en || 'Untitled';
        return {
          item_no: itemNo,
          name: name,
          decoded_name: decodeHTMLEntities(name),
          theme_name: m.main_category || 'Other',
          theme_slug: generateSlug(m.main_category || 'Other'),
          sub_category: m.sub_category || '',
          image_url: m.image_url || `https://img.bricklink.com/ItemImage/MN/0/${itemNo.toUpperCase()}.png`,
          category_id: m.category_id || 0,
          year_released: m.year_released || 0,
          owned: ownedIds.has(itemNo),
          last_stock_min_price: m.last_stock_min_price,
          last_stock_avg_price: m.last_stock_avg_price,
          stock_updated_at: m.stock_updated_at
        } as Minifigure;
      });
    },
    staleTime: 1000 * 60 * 10, // 10 minutes
  });
};

export const useMinifigStats = () => {
  return useQuery({
    queryKey: ['minifigStats'],
    queryFn: async () => {
      const { count, error } = await supabase
        .from('minifigures')
        .select('*', { count: 'exact', head: true });
      
      if (error) throw error;
      return { totalCount: count || 0 };
    },
    staleTime: 1000 * 60 * 60, // 1 hour
  });
};

export const useRecentMinifigs = (limit: number = 10) => {
  return useQuery({
    queryKey: ['recentMinifigs', limit],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('minifigures')
        .select('*')
        .order('year_released', { ascending: false })
        .order('stock_updated_at', { ascending: false })
        .limit(limit);

      if (error) throw error;

      return (data || []).map((m: any) => {
        const itemNo = m.item_no || 'unknown';
        const themeName = m.main_category || 'Other';
        const name = m.name_en || 'Untitled';
        return {
          item_no: itemNo,
          name: name,
          decoded_name: decodeHTMLEntities(name),
          theme_name: themeName,
          theme_slug: generateSlug(themeName),
          sub_category: m.sub_category || '',
          image_url: m.image_url || `https://img.bricklink.com/ItemImage/MN/0/${itemNo.toUpperCase()}.png`,
          category_id: m.category_id || 0,
          year_released: m.year_released || 0,
          owned: false,
          last_stock_min_price: m.last_stock_min_price,
          last_stock_avg_price: m.last_stock_avg_price,
          stock_updated_at: m.stock_updated_at
        } as Minifigure;
      });
    },
    staleTime: 1000 * 60 * 30, // 30 minutes
  });
};

export const useSearchMinifigs = (query: string, userId?: string) => {
  return useQuery({
    queryKey: ['searchMinifigs', query, userId],
    queryFn: async () => {
      if (!query || query.length < 2) return [];
      
      const { data, error } = await supabase
        .from('minifigures')
        .select('*')
        .or(`name_en.ilike.%${query}%,item_no.ilike.%${query}%,main_category.ilike.%${query}%`)
        .limit(100);

      if (error) throw error;

      let ownedIds = new Set<string>();
      if (userId) {
        const { data: owned, error: ownedError } = await supabase
          .from('user_owned_minifigs')
          .select('minifig_id')
          .eq('user_id', userId);
        if (!ownedError && owned) owned.forEach(o => ownedIds.add(o.minifig_id));
      }

      return (data || []).map((m: any) => {
        const itemNo = m.item_no || 'unknown';
        const themeName = m.main_category || 'Other';
        const name = m.name_en || 'Untitled';
        return {
          item_no: itemNo,
          name: name,
          decoded_name: decodeHTMLEntities(name),
          theme_name: themeName,
          theme_slug: generateSlug(themeName),
          sub_category: m.sub_category || '',
          image_url: m.image_url || `https://img.bricklink.com/ItemImage/MN/0/${itemNo.toUpperCase()}.png`,
          category_id: m.category_id || 0,
          year_released: m.year_released || 0,
          owned: ownedIds.has(itemNo),
          last_stock_min_price: m.last_stock_min_price,
          last_stock_avg_price: m.last_stock_avg_price,
          stock_updated_at: m.stock_updated_at
        } as Minifigure;
      });
    },
    enabled: query.length >= 2,
    staleTime: 1000 * 60 * 5,
  });
};

export const useTopMinifigs = () => {
  return useQuery({
    queryKey: ['topMinifigs'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('popular_minifigs_view')
        .select('*')
        .limit(10);

      if (error) throw error;
      return (data || []).map((m: any, idx: number) => ({
        item_no: m.item_no,
        name: m.name_en || 'Untitled',
        decoded_name: decodeHTMLEntities(m.name_en || 'Untitled'),
        theme_name: m.main_category || 'Other',
        theme_slug: generateSlug(m.main_category || 'Other'),
        sub_category: m.sub_category || '',
        image_url: m.image_url || '',
        category_id: m.category_id || 0,
        year_released: m.year_released || 0,
        owned: false,
        rank: idx + 1,
        owner_count: parseInt(m.owner_count || 0),
        last_stock_min_price: m.last_stock_min_price,
        last_stock_avg_price: m.last_stock_avg_price
      }));
    },
    staleTime: 1000 * 60 * 60, // 1 hour
  });
};

export const useCollectorRanking = () => {
  return useQuery({
    queryKey: ['collectorRanking'],
    queryFn: async () => {
      const { data, error } = await supabase.rpc('get_collector_ranking', {});
      if (error) throw error;
      return (data || []).map((item: any, index: number) => ({
        rank: index + 1,
        user_id: item.user_id,
        username: item.username,
        owned_count: item.owned_count,
        avatar_url: item.avatar_url
      }));
    },
    staleTime: 1000 * 60 * 60,
  });
};

export const useMarketMovers = () => {
  return useQuery({
    queryKey: ['marketMovers'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('market_movers_view')
        .select('item_no, name, image_url, current_price, change_percent, total_quantity')
        .not('change_percent', 'is', null)
        .order('change_percent', { ascending: false })
        .limit(20);

      if (error) throw error;
      return (data || []).map(m => ({
        item_no: m.item_no,
        name: m.name || 'Unknown',
        image_url: m.image_url,
        current_price: parseFloat(m.current_price || 0),
        change_percent: parseFloat(m.change_percent || 0),
        total_quantity: parseInt(m.total_quantity || 0)
      }));
    },
    staleTime: 1000 * 60 * 60,
  });
};

export const useHomeStats = () => {
  return useQuery({
    queryKey: ['homeStats'],
    queryFn: async () => {
      // Fetch trending characters (most owned)
      const { data: trendingChars, error: charError } = await supabase
        .from('popular_minifigs_view')
        .select('*')
        .limit(20);
      
      if (charError) throw charError;

      // Fetch some popular themes
      const { data: popularThemes, error: themeError } = await supabase
        .from('minifigures')
        .select('main_category')
        .limit(1000); // Sample for themes
      
      if (themeError) throw themeError;

      return {
        trendingChars: (trendingChars || []).map((m: any) => ({
          name: m.name_en,
          image_url: m.image_url,
          count: parseInt(m.owner_count || 0)
        })),
        themeCounts: (popularThemes || []).reduce((acc: any, curr: any) => {
          const theme = curr.main_category || 'Other';
          acc[theme] = (acc[theme] || 0) + 1;
          return acc;
        }, {})
      };
    },
    staleTime: 1000 * 60 * 60,
  });
};

export const useThemes = () => {
  return useQuery({
    queryKey: ['themes'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('minifigures')
        .select('main_category');
      
      if (error) throw error;

      const counts = (data || []).reduce((acc: any, curr: any) => {
        const theme = curr.main_category || 'Other';
        acc[theme] = (acc[theme] || 0) + 1;
        return acc;
      }, {});

      return Object.entries(counts).map(([name, count]) => ({
        name,
        minifig_count: count as number,
        slug: generateSlug(name),
        image_url: `https://img.bricklink.com/ItemImage/MN/0/sw0001.png` // Placeholder or fetch latest
      })).sort((a, b) => b.minifig_count - a.minifig_count);
    },
    staleTime: 1000 * 60 * 60,
  });
};

export const useThemeProgress = (userId: string | undefined) => {
  return useQuery({
    queryKey: ['themeProgress', userId],
    queryFn: async () => {
      if (!userId) return {};
      
      const { data, error } = await supabase
        .from('user_owned_minifigs')
        .select(`
          minifig_id,
          minifigures (
            main_category
          )
        `)
        .eq('user_id', userId);
      
      if (error) throw error;

      return (data || []).reduce((acc: any, curr: any) => {
        const theme = curr.minifigures?.main_category || 'Other';
        acc[theme] = (acc[theme] || 0) + 1;
        return acc;
      }, {});
    },
    enabled: !!userId,
    staleTime: 1000 * 60 * 5,
  });
};

export const useMinifigDetail = (id: string, userId?: string) => {
  return useQuery({
    queryKey: ['minifigDetail', id, userId],
    queryFn: async () => {
      // Try to find by item_no or slug
      let itemNo = id;
      if (id.includes('-')) {
        itemNo = id.split('-')[0];
      }

      const { data, error } = await supabase
        .from('minifigures')
        .select('*')
        .eq('item_no', itemNo)
        .single();

      if (error) throw error;

      let owned = false;
      if (userId) {
        const { data: ownedData, error: ownedError } = await supabase
          .from('user_owned_minifigs')
          .select('minifig_id')
          .eq('user_id', userId)
          .eq('minifig_id', itemNo)
          .single();
        if (!ownedError && ownedData) owned = true;
      }

      const name = data.name_en || 'Untitled';
      return {
        item_no: data.item_no,
        name: name,
        decoded_name: decodeHTMLEntities(name),
        theme_name: data.main_category || 'Other',
        theme_slug: generateSlug(data.main_category || 'Other'),
        sub_category: data.sub_category || '',
        image_url: data.image_url || `https://img.bricklink.com/ItemImage/MN/0/${data.item_no.toUpperCase()}.png`,
        category_id: data.category_id || 0,
        year_released: data.year_released || 0,
        owned: owned,
        last_stock_min_price: data.last_stock_min_price,
        last_stock_avg_price: data.last_stock_avg_price,
        stock_updated_at: data.stock_updated_at
      } as Minifigure;
    },
    staleTime: 1000 * 60 * 10,
  });
};
