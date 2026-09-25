import type { Metadata } from 'next'
import { requireAdmin } from '@/lib/auth'
import { getAccessLogs, getAllSystems, getProfiles } from '@/lib/queries'
import {
  EmptyState,
  Field,
  Panel,
  TableWrapper,
  buttonClass,
  inputClass,
  selectClass,
  tdClass,
  thClass,
} from '@/components/ui'

export const metadata: Metadata = { title: 'Auditoria de acessos — SAL HUB' }

interface SearchParams {
  usuario?: string
  sistema?: string
  de?: string
  ate?: string
}

export default async function AdminAccessLogsPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>
}) {
  await requireAdmin()
  const filters = await searchParams

  const [profiles, systems, logs] = await Promise.all([
    getProfiles(),
    getAllSystems(),
    getAccessLogs({
      userId: filters.usuario || undefined,
      systemId: filters.sistema || undefined,
      from: filters.de || undefined,
      to: filters.ate || undefined,
    }),
  ])

  return (
    <div className="space-y-4">
      <Panel title="Filtros" description="A consulta roda no servidor, com RLS restrito a ADMIN.">
        {/* GET simples: os filtros ficam na URL e podem ser compartilhados. */}
        <form className="grid grid-cols-1 gap-3.5 sm:grid-cols-2 lg:grid-cols-5">
          <Field label="Usuário" htmlFor="filtro-usuario">
            <select
              id="filtro-usuario"
              name="usuario"
              defaultValue={filters.usuario ?? ''}
              className={selectClass}
            >
              <option value="">Todos</option>
              {profiles.map((profile) => (
                <option key={profile.id} value={profile.id}>
                  {profile.name ?? profile.email ?? profile.id}
                </option>
              ))}
            </select>
          </Field>

          <Field label="Sistema" htmlFor="filtro-sistema">
            <select
              id="filtro-sistema"
              name="sistema"
              defaultValue={filters.sistema ?? ''}
              className={selectClass}
            >
              <option value="">Todos</option>
              {systems.map((system) => (
                <option key={system.id} value={system.id}>
                  {system.name}
                </option>
              ))}
            </select>
          </Field>

          <Field label="De" htmlFor="filtro-de">
            <input
              id="filtro-de"
              name="de"
              type="date"
              defaultValue={filters.de ?? ''}
              className={inputClass}
            />
          </Field>

          <Field label="Até" htmlFor="filtro-ate">
            <input
              id="filtro-ate"
              name="ate"
              type="date"
              defaultValue={filters.ate ?? ''}
              className={inputClass}
            />
          </Field>

          <div className="flex items-end">
            <button type="submit" className={`${buttonClass('primary')} w-full`}>
              Filtrar
            </button>
          </div>
        </form>
      </Panel>

      <Panel title="Acessos registrados" description={`${logs.length} registros exibidos`}>
        {logs.length === 0 ? (
          <EmptyState title="Nenhum acesso registrado para os filtros selecionados.">
            Ajuste o período ou limpe os filtros para ver o histórico completo.
          </EmptyState>
        ) : (
          <TableWrapper>
            <thead>
              <tr>
                <th className={thClass}>Usuário</th>
                <th className={thClass}>E-mail</th>
                <th className={thClass}>Sistema</th>
                <th className={thClass}>Data</th>
                <th className={thClass}>Horário</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((log) => {
                const moment = new Date(log.accessed_at)
                return (
                  <tr key={log.id}>
                    <td className={`${tdClass} font-medium`}>{log.user_name ?? '—'}</td>
                    <td className={`${tdClass} text-muted`}>{log.user_email ?? '—'}</td>
                    <td className={tdClass}>{log.system_name ?? '—'}</td>
                    <td className={`${tdClass} tabular-nums`}>
                      {moment.toLocaleDateString('pt-BR')}
                    </td>
                    <td className={`${tdClass} tabular-nums`}>
                      {moment.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </TableWrapper>
        )}
      </Panel>
    </div>
  )
}
