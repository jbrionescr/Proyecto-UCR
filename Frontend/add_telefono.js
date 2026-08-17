const fs = require('fs');
const env = fs.readFileSync('.env.local', 'utf8');
const lines = env.split('\n');
const vars = {};
lines.forEach(line => {
  const [key, ...rest] = line.split('=');
  if (key && rest.length > 0) {
    vars[key.trim()] = rest.join('=').trim().replace(/^"|"$/g, '').replace(/^'|'$/g, '');
  }
});

const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(
  vars.NEXT_PUBLIC_SUPABASE_URL,
  vars.SUPABASE_SERVICE_ROLE_KEY || vars.SUPABASE_ANON_KEY
);

async function addCol() {
  const { data, error } = await supabase.rpc('exec_sql', {
    query: 'ALTER TABLE "USERS" ADD COLUMN IF NOT EXISTS "telefono" TEXT;'
  });
  console.log("RPC Result:", { data, error });
}

addCol();
