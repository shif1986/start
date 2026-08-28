/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_CONTACT_ENDPOINT?: string;
  readonly VITE_SUPABASE_URL?: string;
  readonly VITE_SUPABASE_ANON_KEY?: string;
  readonly VITE_DATA_SOURCE?: "static" | "supabase";
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

declare module "*.geojson" {
  const value: any;
  export default value;
}
