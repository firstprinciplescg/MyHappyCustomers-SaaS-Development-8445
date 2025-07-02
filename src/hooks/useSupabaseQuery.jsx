import { useState, useEffect } from 'react';
import { runSupabaseQuery } from '../lib/supabase';

export const useSupabaseQuery = (query, dependencies = []) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      const result = await runSupabaseQuery(query);
      setData(result);
      setError(null);
    } catch (err) {
      setError(err);
      setData(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (query) {
      fetchData();
    }
  }, [query, ...dependencies]);

  return { data, loading, error, refetch: fetchData };
};