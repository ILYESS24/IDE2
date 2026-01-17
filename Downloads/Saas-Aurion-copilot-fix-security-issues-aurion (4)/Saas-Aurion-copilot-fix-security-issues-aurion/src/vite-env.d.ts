/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_SUPABASE_URL: string
  readonly VITE_SUPABASE_ANON_KEY: string
  readonly VITE_SUPABASE_SERVICE_ROLE_KEY: string
  readonly VITE_CLERK_PUBLISHABLE_KEY: string
  readonly VITE_STRIPE_PUBLISHABLE_KEY: string
  readonly VITE_STRIPE_SECRET_KEY: string
  readonly VITE_STRIPE_WEBHOOK_SECRET: string
  readonly VITE_OPENROUTER_API_KEY: string
  readonly VITE_FREEPIK_API_KEY: string
  readonly VITE_ALERT_WEBHOOK_URL: string
  readonly VITE_METRICS_ENDPOINT: string
  readonly DEV: boolean
  readonly PROD: boolean
  readonly BASE_URL: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
