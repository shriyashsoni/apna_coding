import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';

export function useSupabaseQuery<T>(
  table: string,
  queryBuilder: (query: any) => any,
  dependencies: any[] = []
) {
  const [data, setData] = useState<T[] | null>(null);
  const [error, setError] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const baseQuery = supabase.from(table).select('*');
      const { data, error } = await queryBuilder(baseQuery);
      if (error) throw error;
      setData(data);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  }, [table, ...dependencies]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, error, loading, refetch: fetchData };
}

export function useSupabaseMutation(table: string) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<any>(null);

  const mutate = async (action: 'insert' | 'update' | 'delete', values: any, match?: any) => {
    setLoading(true);
    setError(null);
    try {
      let result;
      if (action === 'insert') {
        result = await supabase.from(table).insert(values).select();
      } else if (action === 'update') {
        result = await supabase.from(table).update(values).match(match).select();
      } else if (action === 'delete') {
        result = await supabase.from(table).delete().match(match);
      }
      if (result?.error) throw result.error;
      return result?.data;
    } catch (err) {
      setError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { mutate, loading, error };
}
