// Simple KV store implementation using Supabase Deno KV

const kv = await Deno.openKv();

export async function get(key: string) {
  const result = await kv.get([key]);
  return result.value;
}

export async function set(key: string, value: any) {
  await kv.set([key], value);
}

export async function del(key: string) {
  await kv.delete([key]);
}

export async function getByPrefix(prefix: string) {
  const entries = [];
  const iter = kv.list({ prefix: [prefix] });
  
  for await (const entry of iter) {
    entries.push({
      key: entry.key[0],
      value: entry.value
    });
  }
  
  return entries;
}

export async function mget(keys: string[]) {
  const results = await Promise.all(
    keys.map(key => get(key))
  );
  return results;
}
