import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm'

const SUPABASE_URL = 'https://pbgwvszcynkueuaqffuo.supabase.co'
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBiZ3d2c3pjeW5rdWV1YXFmZnVvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzYzNTMyNzEsImV4cCI6MjA5MTkyOTI3MX0.HlAwsshSF_AIUXx0GMwXta41_hupdIOV8wlBUcm_8NA'

export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)
