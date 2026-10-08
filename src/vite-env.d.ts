/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_APP_NAME: string
  readonly VITE_APP_ENV: 'development' | 'production'
  readonly VITE_BASE_PATH: string
  readonly VITE_GITHUB_REPO: string
  readonly VITE_ENABLE_SAMPLE_BILL: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
