import { useEffect, useMemo, useState } from 'react'
import { callApi } from '../../api/services'
import { EmptyState, SkeletonRow, StatusBadge } from '../../components/ui/UIBits'

const pageSize = 5

const CallLogsPage = () => {
  const [logs, setLogs] = useState([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)

  useEffect(() => {
    callApi.logs().then((res) => setLogs(res.data)).finally(() => setLoading(false))
  }, [])

  const pages = Math.max(1, Math.ceil(logs.length / pageSize))
  const paged = useMemo(() => logs.slice((page - 1) * pageSize, page * pageSize), [logs, page])

  return (
    <div className="space-y-4">
      <div>
        <h2 className="page-title">Call Logs</h2>
        <p className="page-subtitle">Audit trail for AI-customer conversations, follow-up state, and WhatsApp delivery.</p>
      </div>
      <section className="surface">
        <div className="table-wrap">
          <table className="crm-table">
            <thead><tr><th>Lead</th><th>Status</th><th>Follow-up</th><th>WhatsApp</th><th>Failure Reason</th><th>Timestamp</th></tr></thead>
            <tbody>
              {loading && Array.from({ length: 5 }).map((_, i) => <SkeletonRow key={i} cols={6} />)}
              {!loading && paged.map((log) => (
                <tr key={log.id}>
                  <td className="font-semibold">{log.lead_name}</td>
                  <td><StatusBadge status={log.status} /></td>
                  <td><StatusBadge status={log.follow_up_status || log.lead_status || 'none'} /></td>
                  <td>{log.whatsapp_link_sent ? <StatusBadge status="Sent" /> : <StatusBadge status="Not Sent" />}</td>
                  <td className="text-xs text-slate-600">{log.whatsapp_failure_reason || '-'}</td>
                  <td>{new Date(log.created_at).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {!loading && !logs.length && <EmptyState title="No call logs yet" description="Run your first call and activity will appear here." />}
        </div>
        {!loading && logs.length > 0 && (
          <div className="flex items-center justify-end gap-2 p-3 text-xs">
            <button className="rounded border px-2 py-1 disabled:opacity-40" disabled={page === 1} onClick={() => setPage((p) => p - 1)}>Prev</button>
            <span>Page {page} / {pages}</span>
            <button className="rounded border px-2 py-1 disabled:opacity-40" disabled={page === pages} onClick={() => setPage((p) => p + 1)}>Next</button>
          </div>
        )}
      </section>
    </div>
  )
}

export default CallLogsPage
