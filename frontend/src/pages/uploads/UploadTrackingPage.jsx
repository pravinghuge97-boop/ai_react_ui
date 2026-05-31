import { useEffect, useMemo, useRef, useState } from 'react'
import { leadsApi, resolveMediaUrl } from '../../api/services'

const DocPreview = ({ doc }) => {
  const src = resolveMediaUrl(doc.file_url || doc.file)
  const isPdf = src.toLowerCase().includes('.pdf')
  if (isPdf) {
    return (
      <a
        href={src}
        target="_blank"
        rel="noreferrer"
        className="flex h-44 w-full items-center justify-center rounded border bg-slate-50 text-sm font-semibold text-slate-700 hover:bg-slate-100"
      >
        Open PDF
      </a>
    )
  }
  return <img alt={doc.name} src={src} className="h-44 w-full rounded border object-cover" />
}

const UploadTrackingPage = () => {
  const [leads, setLeads] = useState([])
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState('all') // all | uploaded | pending
  const [visibleCount, setVisibleCount] = useState(5)
  const pageSize = 5
  const loaderRef = useRef(null)

  useEffect(() => {
    leadsApi.list().then((res) => setLeads(res.data)).finally(() => setLoading(false))
  }, [])

  const filteredLeads = useMemo(() => {
    if (tab === 'uploaded') {
      return leads.filter((l) => l.status === 'uploaded' || (l.uploaded_documents?.length || 0) > 0)
    }
    if (tab === 'pending') {
      return leads.filter((l) => l.status === 'pending' && (l.uploaded_documents?.length || 0) === 0)
    }
    return leads
  }, [leads, tab])

  const paged = useMemo(() => filteredLeads.slice(0, visibleCount), [filteredLeads, visibleCount])
  const hasMore = visibleCount < filteredLeads.length

  useEffect(() => {
    setVisibleCount(pageSize)
  }, [tab])

  useEffect(() => {
    const node = loaderRef.current
    if (!node) return undefined

    const observer = new IntersectionObserver((entries) => {
      const entry = entries[0]
      if (!entry?.isIntersecting) return
      setVisibleCount((prev) => Math.min(prev + pageSize, filteredLeads.length))
    }, { rootMargin: '200px 0px' })

    observer.observe(node)
    return () => observer.disconnect()
  }, [filteredLeads.length])

  return (
    <div className="space-y-4">
      <div>
        <h2 className="page-title">Upload Tracking And Document Preview</h2>
        {/* <p className="page-subtitle">Track uploaded files with direct document previews.</p> */}
      </div>

      {loading && <section className="surface p-4 text-sm text-slate-500">Loading upload records...</section>}

      {!loading && (
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setTab('all')}
            className={`rounded-full border px-3 py-1 text-xs font-semibold ${tab === 'all' ? 'border-slate-900 bg-slate-900 text-white' : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'}`}
          >
            All ({leads.length})
          </button>
          <button
            type="button"
            onClick={() => setTab('uploaded')}
            className={`rounded-full border px-3 py-1 text-xs font-semibold ${tab === 'uploaded' ? 'border-slate-900 bg-slate-900 text-white' : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'}`}
          >
            Uploaded ({leads.filter((l) => l.status === 'uploaded' || (l.uploaded_documents?.length || 0) > 0).length})
          </button>
          <button
            type="button"
            onClick={() => setTab('pending')}
            className={`rounded-full border px-3 py-1 text-xs font-semibold ${tab === 'pending' ? 'border-slate-900 bg-slate-900 text-white' : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'}`}
          >
            Pending ({leads.filter((l) => l.status === 'pending' && (l.uploaded_documents?.length || 0) === 0).length})
          </button>
        </div>
      )}

      {!loading && !filteredLeads.length && (
        <section className="surface p-4 text-sm text-slate-500">
          No records found for this tab.
        </section>
      )}

      {!loading && paged.map((lead) => (
        <section key={lead.id} className="surface p-4">
          <div className="mb-3 flex items-center justify-between">
            <div>
              <p className="font-semibold">{lead.business_name}</p>
              <p className="text-xs text-slate-500">{lead.phone_number}</p>
            </div>
            <span className="status-badge status-neutral">{lead.status}</span>
          </div>

          {lead.uploaded_documents?.length ? (
            <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
              {lead.uploaded_documents.map((doc) => (
                <article key={doc.id} className="rounded-lg border border-slate-200 p-2">
                  <p className="mb-1 text-xs font-semibold">{doc.name}</p>
                  <DocPreview doc={doc} />
                  <p className="mt-1 text-[11px] text-slate-500">By {doc.uploaded_by_name || 'Unknown'}</p>
                </article>
              ))}
            </div>
          ) : (
            <p className="text-sm text-slate-500">No uploaded documents yet.</p>
          )}
        </section>
      ))}

      {!loading && hasMore && (
        <div ref={loaderRef} className="py-4 text-center text-xs text-slate-500">
          Loading more records...
        </div>
      )}
    </div>
  )
}

export default UploadTrackingPage
