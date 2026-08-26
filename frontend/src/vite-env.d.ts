/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_CONTACT_ENDPOINT?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

declare module "*.geojson" {
  const value: any;
  export default value;
}
