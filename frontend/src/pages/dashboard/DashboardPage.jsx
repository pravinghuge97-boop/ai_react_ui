import { useEffect, useState } from 'react'
import { dashboardApi } from '../../api/services'
import { EmptyState, StatusBadge } from '../../components/ui/UIBits'

const DashboardPage = () => {
  const [data, setData] = useState(null)

  useEffect(() => {
    dashboardApi.summary().then((res) => setData(res.data))
  }, [])

  const kpis = data
    ? [
        ['Total Leads', data.summary.total_leads],
        ['Pending Uploads', data.summary.pending_uploads],
        ['Completed Uploads', data.summary.completed_uploads],
        ['Follow-up Required', data.summary.follow_up_required],
      ]
    : []

  const recentCards = (data?.recent_uploads || []).slice(0, 6)
  const recentCalls = (data?.recent_activity || []).slice(0, 6)

  return (
    <div className="space-y-4">
      <div>
        <h2 className="page-title">Dashboard</h2>
        <p className="page-subtitle">Overview of onboarding pipeline and uploaded document activity.</p>
      </div>

      <section className="kpi-grid">
        {(data ? kpis : Array.from({ length: 4 }).map((_, i) => ['', i])).map(([label, value], idx) => (
          <article key={`${label}-${idx}`} className="surface kpi-card">
            <p className="kpi-label">{label || 'Loading metric'}</p>
            <p className="kpi-value">{data ? value : '...'}</p>
          </article>
        ))}
      </section>

      <section className="surface p-4">
        <h3 className="text-sm font-bold">Recent Call Logs</h3>
        {!data && <div className="mt-3 text-sm text-slate-500">Loading recent calls...</div>}

        {data && !!recentCalls.length && (
          <div className="mt-3 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {recentCalls.map((c) => (
              <article key={c.id} className="rounded-lg border border-slate-200 p-3">
                <p className="text-xs text-slate-500">{new Date(c.created_at).toLocaleString()}</p>
                <p className="mt-1 text-sm font-semibold">{c.lead__business_name}</p>
                <div className="mt-2"><StatusBadge status={c.status} /></div>
                <p className="mt-2 text-xs text-slate-600">WhatsApp: {c.whatsapp_link_sent ? 'Sent' : 'Not Sent'}</p>
              </article>
            ))}
          </div>
        )}

        {data && !recentCalls.length && (
          <EmptyState title="No call logs yet" description="Recent call records will appear here." />
        )}
      </section>

      <section className="surface p-4">
        <h3 className="text-sm font-bold">Recent Uploads</h3>
        {!data && <div className="mt-3 text-sm text-slate-500">Loading recent uploads...</div>}

        {data && !!recentCards.length && (
          <div className="mt-3 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {recentCards.map((u) => (
              <article key={u.id} className="rounded-lg border border-slate-200 p-3">
                <p className="text-xs text-slate-500">{new Date(u.uploaded_at).toLocaleString()}</p>
                <p className="mt-1 text-sm font-semibold">{u.session__lead__business_name}</p>
                <p className="mt-1 text-xs text-slate-600">By {u.uploaded_by_name || 'Unknown'}</p>
                <p className="mt-2 truncate text-xs text-sky-700">{u.file?.split('/').pop()}</p>
              </article>
            ))}
          </div>
        )}

        {data && !recentCards.length && (
          <EmptyState title="No uploads yet" description="Recent uploaded documents will appear here." />
        )}
      </section>
    </div>
  )
}

export default DashboardPage
