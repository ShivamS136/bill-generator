/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_APP_NAME: string
  readonly VITE_APP_ENV: 'development' | 'production'
  readonly VITE_BASE_PATH: string
  readonly VITE_GITHUB_REPO: string
  readonly VITE_ENABLE_SAMPLE_BILL: string
  readonly VITE_DRIVER_SALARY_DRIVER_NAME?: string
  readonly VITE_DRIVER_SALARY_EMPLOYEE_NAME?: string
  readonly VITE_DRIVER_SALARY_VEHICLE_NUMBER?: string
  readonly VITE_DRIVER_SALARY_AMOUNT?: string
  readonly VITE_DRIVER_SALARY_USER_SIGNATURE?: string
  readonly VITE_DRIVER_SALARY_DRIVER_SIGNATURE?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
