import { createClient } from '@supabase/supabase-js';
import type { Database } from './database.types';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient<Database>(supabaseUrl, supabaseKey);

export const query = async (text: string, params?: any[]) => {
  try {
    const { data, error } = await supabase.rpc('query', { query_text: text, query_params: params });
    
    if (error) {
      console.error('Database query error:', error);
      throw error;
    }
    
    return { rows: data || [], rowCount: data?.length || 0 };
  } catch (error) {
    console.error('Database operation failed:', error);
    throw new Error(`Database error: ${error.message}`);
  }
};

export const db = {
  query,
  client: supabase
};