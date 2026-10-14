export type CacheMetadata<T extends object> = {
  _version: number;
  _created: number;
  _created_at: string;
  _expires: number;
  _expires_at: string;
  data: T;
};

export async function read_cached_object<T extends object>(key: string): Promise<T | null> {
  const file = Bun.file(`./src/.cache/${key}.json`);
  if (!(await file.exists())) return null;
  try {
    const json = (await file.json()) as CacheMetadata<T>;
    return json.data;
  } catch {
    return null;
  }
}

export async function read_cached_object_with_meta<T extends object>(key: string): Promise<CacheMetadata<T> | null> {
  const file = Bun.file(`./src/.cache/${key}.json`);
  if (!(await file.exists())) return null;
  try {
    return (await file.json()) as CacheMetadata<T>;
  } catch {
    return null;
  }
}

export async function write_cached_object(key: string, obj: object, expires_at = -1): Promise<void> {
  const file = Bun.file(`./src/.cache/${key}.json`);

  const created = Date.now();
  const expires = expires_at === -1 ? -1 : created + expires_at;

  await Bun.write(
    file,
    JSON.stringify(
      {
        _version: 1,
        _created: created,
        _created_at: new Date(created).toISOString(),
        _expires: expires,
        _expires_at: new Date(expires).toISOString(),
        data: obj,
      } as CacheMetadata<object>,
      null,
      2
    )
  );
}
