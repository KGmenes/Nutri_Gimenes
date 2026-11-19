import { createAuthClient } from '@neondatabase/auth';

const authUrl = import.meta.env.VITE_NEON_AUTH_URL;

if (!authUrl) {
  console.warn('Aviso: VITE_NEON_AUTH_URL não configurada.');
}

export const authClient = createAuthClient(authUrl || '');


