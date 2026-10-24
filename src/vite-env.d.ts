/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_BASE_PATH?: string
  readonly VITE_GITHUB_REPO?: string
  readonly VITE_DRIVER_SALARY_DRIVER_NAME?: string
  readonly VITE_DRIVER_SALARY_EMPLOYEE_NAME?: string
  readonly VITE_DRIVER_SALARY_LICENCE_NUMBER?: string
  readonly VITE_DRIVER_SALARY_VEHICLE_NUMBER?: string
  readonly VITE_DRIVER_SALARY_AMOUNT?: string
  readonly VITE_FUEL_BILL_STATION_NAME?: string
  readonly VITE_FUEL_BILL_STATION_ADDRESS?: string
  readonly VITE_FUEL_BILL_TELEPHONE?: string
  readonly VITE_FUEL_BILL_FCC_ID?: string
  readonly VITE_FUEL_BILL_VEHICLE_NUMBER?: string
  readonly VITE_FUEL_BILL_CUSTOMER_NAME?: string
  readonly VITE_FUEL_BILL_ROLL_SERIAL?: string
  readonly VITE_INTERNET_BILL_CUSTOMER_NAME?: string
  readonly VITE_INTERNET_BILL_CUSTOMER_ADDRESS?: string
  readonly VITE_INTERNET_BILL_ACCOUNT_NUMBER?: string
  readonly VITE_INTERNET_BILL_AMOUNT?: string
  readonly VITE_INTERNET_BILL_GST_NUMBER?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
