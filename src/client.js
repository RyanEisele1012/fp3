import { createClient } from '@supabase/supabase-js';


const supabaseUrl = 'https://jvrjqxrxfuarjjvcxcdl.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp2cmpxeHJ4ZnVhcmpqdmN4Y2RsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MTI3NTg1NjEsImV4cCI6MjAyODMzNDU2MX0.rN2WF0-YyS1BoxdJANOb-UiXG0ez50ku5Vj4d42b_IM';

// Create and configure the Supabase client
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export default supabase;
