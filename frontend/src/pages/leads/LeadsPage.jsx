import { useEffect, useMemo, useRef, useState } from 'react'
import { callApi, leadsApi } from '../../api/services'
import { EmptyState, SkeletonRow, StatusBadge } from '../../components/ui/UIBits'
import { useToast } from '../../context/ToastContext'

const defaultForm = { business_name: '', phone_number: '', required_documents: 'GST Certificate,Company Profile' }
const pageSize = 6

const LeadsPage = () => {
  const [leads, setLeads] = useState([])
  const [loading, setLoading] = useState(true)
  const [form, setForm] = useState(defaultForm)
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState('all')
  const [page, setPage] = useState(1)
  const [modalOpen, setModalOpen] = useState(false)
  const [liveSession, setLiveSession] = useState(null)
  const [liveTurns, setLiveTurns] = useState([])
  const [userReply, setUserReply] = useState('')
  const [liveUploadUrl, setLiveUploadUrl] = useState('')
  const [liveError, setLiveError] = useState('')
  const [callPhase, setCallPhase] = useState('idle')
  const [aiLoading, setAiLoading] = useState(false)
  const recognitionRef = useRef(null)
  const { pushToast } = useToast()

  const load = async () => {
    setLoading(true)
    const { data } = await leadsApi.list()
    setLeads(data)
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  const addLead = async (e) => {
    e.preventDefault()
    await leadsApi.create({ ...form, required_documents: form.required_documents.split(',').map((s) => s.trim()) })
    setForm(defaultForm)
    pushToast('Lead created successfully', 'success')
    load()
  }

  const closeCallModal = () => {
    setModalOpen(false)
    setLiveSession(null)
    setLiveTurns([])
    setLiveError('')
    setLiveUploadUrl('')
    setCallPhase('idle')
    setAiLoading(false)
    if (window.speechSynthesis) window.speechSynthesis.cancel()
  }

  const speakNatural = (message) => {
    if (!window.speechSynthesis) return
    const voice = window.speechSynthesis.getVoices().find((v) => v.lang.startsWith('en'))
    const utterance = new SpeechSynthesisUtterance(message)
    if (voice) utterance.voice = voice
    utterance.rate = 1
    utterance.pitch = 1
    utterance.onstart = () => setCallPhase('speaking')
    utterance.onend = () => setCallPhase('listening')
    window.speechSynthesis.speak(utterance)
  }

  const startCall = async (id, provider = 'gemini') => {
    try {
      const { data } = await callApi.start(id, provider)
      pushToast(`${provider.toUpperCase()} start_call done. ${data.message}`, 'success')
      if (data?.transcript) {
        setModalOpen(true)
        setCallPhase('speaking')
        setLiveSession({ lead_name: provider.toUpperCase() + ' Call' })
        setLiveTurns([{ speaker: 'ai', message: data.transcript }])
        speakNatural(data.transcript)
      }
      load()
    } catch (e) {
      pushToast(e?.response?.data?.detail || `${provider.toUpperCase()} start_call failed`, 'error')
    }
  }

  const startGroqCall = async (id) => {
    await startCall(id, 'groq')
  }

  const startLiveChat = async (id) => {
    try {
      setModalOpen(true)
      setCallPhase('ringing')
      setLiveError('')
      setLiveUploadUrl('')
      const { data } = await callApi.startConversation(id)
      setLiveSession(data)
      setLiveTurns([{ speaker: 'ai', message: data.ai_message }])
      setTimeout(() => {
        setCallPhase('speaking')
        speakNatural(data.ai_message)
      }, 900)
      pushToast('Live conversation started', 'success')
    } catch (e) {
      setModalOpen(false)
      pushToast(e?.response?.data?.detail || 'Failed to start live conversation', 'error')
    }
  }

  const sendLiveReply = async () => {
    if (!liveSession?.session_id) {
      setLiveError('This call is summary-only. Start a live conversation to send replies.')
      return
    }
    if (!userReply.trim()) return
    const message = userReply.trim()
    setUserReply('')
    setAiLoading(true)
    setLiveError('')
    try {
      const { data } = await callApi.sendConversationMessage(liveSession.session_id, message)
      setLiveTurns(data.turns)
      setLiveUploadUrl(data.upload_url || '')
      setLiveError(data.ai_error || '')
      if (data.upload_url) pushToast('WhatsApp upload link sent to lead', 'success')
      speakNatural(data.ai_message)
      load()
    } catch (e) {
      setLiveError(e?.response?.data?.detail || 'Failed to send message')
    } finally {
      setAiLoading(false)
    }
  }

  const startVoiceInput = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
    if (!SpeechRecognition) return setLiveError('Voice input is not supported in this browser.')
    const recognition = new SpeechRecognition()
    recognition.lang = 'en-US'
    recognition.onresult = (event) => setUserReply(event.results[0][0].transcript)
    recognition.onerror = () => setLiveError('Voice recognition failed. Please type your reply.')
    recognitionRef.current = recognition
    recognition.start()
  }

  const deleteLead = async (id) => { await leadsApi.remove(id); pushToast('Lead removed', 'info'); load() }

  const filtered = useMemo(() => leads.filter((lead) => {
    const bySearch = lead.business_name.toLowerCase().includes(search.toLowerCase()) || lead.phone_number.includes(search)
    const byStatus = filter === 'all' || lead.status === filter
    return bySearch && byStatus
  }), [leads, search, filter])

  const statuses = useMemo(() => ['all', ...new Set(leads.map((l) => l.status))], [leads])
  const pages = Math.max(1, Math.ceil(filtered.length / pageSize))
  const paged = filtered.slice((page - 1) * pageSize, page * pageSize)

  return (
    <div className="space-y-4">
      <div>
        <h2 className="page-title">Lead Management</h2>
        <p className="page-subtitle">Add leads, run calls, and monitor document collection journey.</p>
      </div>

      <form onSubmit={addLead} className="surface grid gap-3 p-4 md:grid-cols-4">
        <input className="rounded-lg border border-slate-200 px-3 py-2 text-sm" placeholder="Business name" value={form.business_name} onChange={(e) => setForm({ ...form, business_name: e.target.value })} />
        <input className="rounded-lg border border-slate-200 px-3 py-2 text-sm" placeholder="Phone number" value={form.phone_number} onChange={(e) => setForm({ ...form, phone_number: e.target.value })} />
        <input className="rounded-lg border border-slate-200 px-3 py-2 text-sm md:col-span-2" placeholder="Required docs (comma-separated)" value={form.required_documents} onChange={(e) => setForm({ ...form, required_documents: e.target.value })} />
        <button className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white md:col-span-4">Add Lead</button>
      </form>

      <section className="surface p-4">
        <div className="mb-3 flex flex-wrap items-center gap-2">
          <input className="min-w-56 rounded-lg border border-slate-200 px-3 py-2 text-sm" placeholder="Search name or phone" value={search} onChange={(e) => { setSearch(e.target.value); setPage(1) }} />
          <select className="rounded-lg border border-slate-200 px-3 py-2 text-sm" value={filter} onChange={(e) => { setFilter(e.target.value); setPage(1) }}>
            {statuses.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
        <div className="table-wrap">
          <table className="crm-table">
            <thead><tr><th>Business</th><th>Phone</th><th>Status</th><th>Required Documents</th><th>Actions</th></tr></thead>
            <tbody>
              {loading && Array.from({ length: 5 }).map((_, i) => <SkeletonRow key={i} cols={5} />)}
              {!loading && paged.map((lead) => (
                <tr key={lead.id}>
                  <td className="font-semibold">{lead.business_name}</td>
                  <td>{lead.phone_number}</td>
                  <td><StatusBadge status={lead.status} /></td>
                  <td>{lead.required_documents.join(', ')}</td>
                  <td className="space-x-2 whitespace-nowrap">
                    {/* <button onClick={() => startCall(lead.id, 'gemini')} className="rounded-md border border-slate-200 px-2 py-1 text-xs font-semibold hover:bg-slate-50">Start Call</button>
                    <button onClick={() => startGroqCall(lead.id)} className="rounded-md border border-emerald-200 px-2 py-1 text-xs font-semibold text-emerald-700 hover:bg-emerald-50">Start Groq Call</button> */}
                    <button onClick={() => startLiveChat(lead.id)} className="rounded-md border border-sky-200 px-2 py-1 text-xs font-semibold text-sky-700 hover:bg-sky-50">Start Call</button>
                    <button onClick={() => deleteLead(lead.id)} className="rounded-md border border-rose-200 px-2 py-1 text-xs font-semibold text-rose-700 hover:bg-rose-50">Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {!loading && !paged.length && <EmptyState title="No leads match your filter" description="Try clearing search or switching status filter." />}
        </div>
        <div className="mt-3 flex items-center justify-between text-xs text-slate-600">
          <p>Showing {paged.length} of {filtered.length} leads</p>
          <div className="space-x-2">
            <button className="rounded border px-2 py-1 disabled:opacity-40" disabled={page === 1} onClick={() => setPage((p) => p - 1)}>Prev</button>
            <span>Page {page} / {pages}</span>
            <button className="rounded border px-2 py-1 disabled:opacity-40" disabled={page === pages} onClick={() => setPage((p) => p + 1)}>Next</button>
          </div>
        </div>
      </section>

      {modalOpen && (
        <div className="call-modal">
          <div className="surface call-panel p-4">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <p className="text-xs uppercase text-slate-500">AI Calling Session</p>
                <p className="text-base font-bold">{liveSession?.lead_name || 'Connecting...'}</p>
              </div>
              <button className="rounded-md border px-2 py-1 text-sm" onClick={closeCallModal}>Close</button>
            </div>
            <div className="mb-4 flex items-center gap-3 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2">
              {callPhase === 'ringing' && <span className="ringing-dot" />}
              {(callPhase === 'speaking' || aiLoading) && <span className="wave"><i /><i /><i /><i /></span>}
              <p className="text-sm font-semibold">{aiLoading ? 'AI is typing a response...' : callPhase === 'ringing' ? 'Ringing lead...' : callPhase === 'speaking' ? 'AI speaking' : 'Waiting for customer response'}</p>
            </div>
            <div className="max-h-64 overflow-auto rounded-lg border border-slate-200 p-3">
              {liveTurns.map((t, i) => (
                <div key={`${t.created_at || i}-${i}`} className="mb-2">
                  <p className="text-xs font-bold uppercase text-slate-500">{t.speaker}</p>
                  <p className="text-sm">{t.message}</p>
                </div>
              ))}
              {aiLoading && <p className="text-xs text-slate-500">AI is composing reply...</p>}
            </div>
            <div className="mt-3 flex gap-2">
              <input
                className="flex-1 rounded-lg border border-slate-200 px-3 py-2 text-sm"
                value={userReply}
                onChange={(e) => setUserReply(e.target.value)}
                placeholder={liveSession?.session_id ? 'Type customer reply' : 'Live reply disabled for start_call summary'}
                disabled={!liveSession?.session_id}
              />
              <button type="button" onClick={startVoiceInput} aria-label="Start microphone input" className="rounded-lg border border-slate-200 px-3 py-2 text-sm hover:bg-slate-50">
                <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <rect x="9" y="2" width="6" height="12" rx="3" />
                  <path d="M5 10a7 7 0 0 0 14 0" />
                  <path d="M12 17v5" />
                  <path d="M8 22h8" />
                </svg>
              </button>
              <button type="button" disabled={aiLoading || !liveSession?.session_id} onClick={sendLiveReply} className="rounded-lg bg-slate-900 px-3 py-2 text-sm font-semibold text-white disabled:opacity-50">Send</button>
            </div>
            {liveUploadUrl && <p className="mt-3 rounded-lg border border-emerald-200 bg-emerald-50 p-2 text-sm text-emerald-700">WhatsApp upload link sent successfully.</p>}
            {liveError && <p className="mt-3 text-sm text-red-700">{liveError}</p>}
          </div>
        </div>
      )}
    </div>
  )
}

export default LeadsPage
