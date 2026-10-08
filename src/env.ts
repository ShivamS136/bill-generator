export const env = {
  appName: import.meta.env.VITE_APP_NAME,
  appEnv: import.meta.env.VITE_APP_ENV,
  isProduction: import.meta.env.VITE_APP_ENV === 'production',
  githubRepo: import.meta.env.VITE_GITHUB_REPO,
} as const
