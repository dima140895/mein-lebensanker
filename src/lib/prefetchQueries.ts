import { QueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { queryKeys } from './queryKeys';

export const prefetchPflegeEintraege = (queryClient: QueryClient, userId: string) => {
  queryClient.prefetchQuery({
    queryKey: queryKeys.pflegeEintraege(userId),
    queryFn: async () => {
      const { data } = await supabase
        .from('pflege_eintraege')
        .select('*')
        .eq('user_id', userId)
        .order('eintrags_datum', { ascending: false });
      return data || [];
    },
    staleTime: 1000 * 60 * 5,
  });
};

export const prefetchMedikamente = (queryClient: QueryClient, userId: string) => {
  queryClient.prefetchQuery({
    queryKey: queryKeys.medikamente(userId),
    queryFn: async () => {
      const { data } = await supabase
        .from('medikamente')
        .select('*')
        .eq('user_id', userId)
        .order('aktiv', { ascending: false })
        .order('name', { ascending: true });
      return data || [];
    },
    staleTime: 1000 * 60 * 5,
  });
};

export const prefetchSymptomCheckins = (queryClient: QueryClient, userId: string) => {
  queryClient.prefetchQuery({
    queryKey: queryKeys.symptomCheckins(userId),
    queryFn: async () => {
      const { data } = await supabase
        .from('symptom_checkins')
        .select('*')
        .eq('user_id', userId)
        .order('checkin_datum', { ascending: false });
      return data || [];
    },
    staleTime: 1000 * 60 * 5,
  });
};
