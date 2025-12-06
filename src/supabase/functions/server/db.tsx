// Database helper functions using Supabase directly
import { createClient } from 'npm:@supabase/supabase-js@2';

const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
);

// Helper to query kv_store table
export async function get(key: string) {
  try {
    const { data, error } = await supabase
      .from('kv_store_1f0a837c')
      .select('value')
      .eq('key', key)
      .single();
    
    if (error || !data) {
      return null;
    }
    
    return data.value;
  } catch (err) {
    console.error('DB get error:', err);
    return null;
  }
}

export async function set(key: string, value: any) {
  try {
    const { error } = await supabase
      .from('kv_store_1f0a837c')
      .upsert({ key, value }, { onConflict: 'key' });
    
    if (error) {
      console.error('DB set error:', error);
      throw error;
    }
  } catch (err) {
    console.error('DB set error:', err);
    throw err;
  }
}

export async function del(key: string) {
  try {
    const { error } = await supabase
      .from('kv_store_1f0a837c')
      .delete()
      .eq('key', key);
    
    if (error) {
      console.error('DB delete error:', error);
      throw error;
    }
  } catch (err) {
    console.error('DB delete error:', err);
    throw err;
  }
}

export async function getByPrefix(prefix: string) {
  try {
    const { data, error } = await supabase
      .from('kv_store_1f0a837c')
      .select('key, value')
      .like('key', `${prefix}%`);
    
    if (error) {
      console.error('DB getByPrefix error:', error);
      return [];
    }
    
    return data || [];
  } catch (err) {
    console.error('DB getByPrefix error:', err);
    return [];
  }
}

export async function mget(keys: string[]) {
  try {
    const results = await Promise.all(keys.map(key => get(key)));
    return results;
  } catch (err) {
    console.error('DB mget error:', err);
    return [];
  }
}

export async function mset(entries: Array<{ key: string; value: any }>) {
  try {
    const { error } = await supabase
      .from('kv_store_1f0a837c')
      .upsert(entries, { onConflict: 'key' });
    
    if (error) {
      console.error('DB mset error:', error);
      throw error;
    }
  } catch (err) {
    console.error('DB mset error:', err);
    throw err;
  }
}

export async function mdel(keys: string[]) {
  try {
    const { error } = await supabase
      .from('kv_store_1f0a837c')
      .delete()
      .in('key', keys);
    
    if (error) {
      console.error('DB mdel error:', error);
      throw error;
    }
  } catch (err) {
    console.error('DB mdel error:', err);
    throw err;
  }
}
