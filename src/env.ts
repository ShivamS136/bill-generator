export const env = {
  appName: 'Bill Generator',
  appEnv: import.meta.env.MODE,
  isProduction: import.meta.env.MODE === 'production',
  githubRepo: import.meta.env.VITE_GITHUB_REPO || 'ShivamS136/bill-generator',
} as const
