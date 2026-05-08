type RequiredEnvKey = 'VITE_API_BASE_URL';

export function requireEnv(key: RequiredEnvKey) {
  const value = import.meta.env[key];

  if (typeof value !== 'string' || !value.trim()) {
    throw new Error(`Missing required environment variable: ${key}`);
  }

  return value.trim();
}

export function getOptionalEnv(key: string) {
  const value = import.meta.env[key];
  return typeof value === 'string' && value.trim() ? value.trim() : undefined;
}
