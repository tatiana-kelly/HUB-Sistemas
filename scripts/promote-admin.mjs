#!/usr/bin/env node
/**
 * Promove um usuário existente ao perfil ADMIN.
 *
 *   npm run promote-admin -- pessoa@salexpress.com.br
 *
 * Só serve como saída de emergência (por exemplo, se o único ADMIN perder o
 * acesso). Requer SUPABASE_SERVICE_ROLE_KEY no ambiente local — a chave nunca é
 * lida de outro lugar nem gravada em disco por este script.
 */

import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'node:fs'

function loadLocalEnv() {
  for (const file of ['.env.local', '.env']) {
    try {
      const content = readFileSync(new URL(`../${file}`, import.meta.url), 'utf8')
      for (const line of content.split(/\r?\n/)) {
        const match = /^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/.exec(line)
        if (!match) continue
        const [, key, rawValue] = match
        if (process.env[key]) continue
        process.env[key] = rawValue.replace(/^["']|["']$/g, '')
      }
    } catch {
      // arquivo opcional
    }
  }
}

loadLocalEnv()

const email = process.argv[2]?.trim().toLowerCase()
const url = process.env.NEXT_PUBLIC_SUPABASE_URL
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!email) {
  console.error('Uso: npm run promote-admin -- email@dominio.com')
  process.exit(1)
}

if (!url || !serviceKey) {
  console.error(
    'Configure NEXT_PUBLIC_SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY antes de rodar este script.',
  )
  process.exit(1)
}

const supabase = createClient(url, serviceKey, {
  auth: { autoRefreshToken: false, persistSession: false },
})

const { data: role, error: roleError } = await supabase
  .from('roles')
  .select('id')
  .eq('name', 'ADMIN')
  .maybeSingle()

if (roleError || !role) {
  console.error(`Perfil ADMIN não encontrado: ${roleError?.message ?? 'rode as migrations primeiro'}`)
  process.exit(1)
}

const { data: profile, error: profileError } = await supabase
  .from('profiles')
  .select('id, email')
  .ilike('email', email)
  .maybeSingle()

if (profileError) {
  console.error(`Falha ao consultar o usuário: ${profileError.message}`)
  process.exit(1)
}

if (!profile) {
  console.error(
    `Nenhum usuário com o e-mail ${email}. Crie o usuário primeiro (painel do Supabase > Authentication > Users, ou pela tela /admin/users).`,
  )
  process.exit(1)
}

const { error: updateError } = await supabase
  .from('profiles')
  .update({ role_id: role.id, active: true })
  .eq('id', profile.id)

if (updateError) {
  console.error(`Falha ao promover: ${updateError.message}`)
  process.exit(1)
}

console.log(`${profile.email} agora é ADMIN do SAL HUB.`)
