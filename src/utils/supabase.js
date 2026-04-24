import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://wldshwuvmhayizndlvel.supabase.co'
const supabaseAnonKey = 'sb_publishable_onfQlKlkOUOLN0XFBA1blg_MBkOBvdR'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
