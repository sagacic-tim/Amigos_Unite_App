/// <reference types="vite/client" />``

// Whitelist your VITE_ environment variables here:
interface ImportMetaEnv {
  readonly VITE_API_BASE_URL?: string;
  // add other VITE_… vars here as needed
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
