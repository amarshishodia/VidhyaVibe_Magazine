import type { Env, Logger } from '@magazine/config';

type StorageAdapter = {
  upload: (key: string, buffer: Buffer, contentType?: string) => Promise<{ url: string; key: string }>;
  get?: (key: string) => Promise<Buffer | null | any>;
  presignGet?: (key: string, expires?: number) => Promise<{ url: string; key: string }>;
};

let adapter: StorageAdapter | null = null;

export function registerStorageAdapter(a: StorageAdapter) {
  adapter = a;
}

export function getStorageAdapter(): StorageAdapter {
  if (!adapter) throw new Error('Storage adapter not registered');
  return adapter;
}

export type { StorageAdapter };

