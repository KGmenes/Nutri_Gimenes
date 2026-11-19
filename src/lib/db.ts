import { neon } from '@neondatabase/serverless';

const databaseUrl = import.meta.env.VITE_DATABASE_URL;

if (!databaseUrl) {
  console.warn('Aviso: VITE_DATABASE_URL não configurada.');
}

export const sql = neon(databaseUrl || '');


