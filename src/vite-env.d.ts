/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_BASE_PATH?: string
  readonly VITE_GITHUB_REPO?: string
  readonly VITE_DRIVER_SALARY_DRIVER_NAME?: string
  readonly VITE_DRIVER_SALARY_EMPLOYEE_NAME?: string
  readonly VITE_DRIVER_SALARY_VEHICLE_NUMBER?: string
  readonly VITE_DRIVER_SALARY_AMOUNT?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
