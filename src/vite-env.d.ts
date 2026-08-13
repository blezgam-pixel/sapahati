/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_ADMIN_USERNAME?: string;
  readonly VITE_ADMIN_PASSWORD?: string;
  readonly VITE_GOOGLE_SHEETS_SERVICE_ACCOUNT_JSON?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
