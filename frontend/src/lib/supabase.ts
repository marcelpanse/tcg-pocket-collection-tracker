import { createClient } from '@supabase/supabase-js'

export const SUPABASE_URL = 'https://vcwloujmsjuacqpwthee.supabase.co'
export const SUPABASE_ANON_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZjd2xvdWptc2p1YWNxcHd0aGVlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDE4MTM2NjAsImV4cCI6MjA1NzM4OTY2MH0.a4Hyi9PsyLQ-MxtS_20cSs4KWgDNh39w-uJo0cQa_qQ'

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
