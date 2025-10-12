import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://eonwyoaxkyfmkqznhrwh.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVvbnd5b2F4a3lmbWtxem5ocndoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjAwMjgwNDUsImV4cCI6MjA3NTYwNDA0NX0.ABvuJ5SO9apKw9DoB37G8HmcLOQ8KXnnRwgm394MPFw'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
