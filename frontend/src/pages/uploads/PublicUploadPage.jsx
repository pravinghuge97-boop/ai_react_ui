import { useEffect, useMemo, useState } from 'react'
import { useParams } from 'react-router-dom'
import { resolveMediaUrl, uploadApi } from '../../api/services'

const PublicUploadPage = () => {
  const { token } = useParams()
  const [session, setSession] = useState(null)
  const [files, setFiles] = useState([])
  const [uploadedByName, setUploadedByName] = useState('')
  const [msg, setMsg] = useState('')
  const [error, setError] = useState('')
  const [uploading, setUploading] = useState(false)
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    uploadApi.session(token).then((res) => setSession(res.data)).catch(() => setMsg('Invalid or expired upload link'))
  }, [token])

  const previews = useMemo(() => files.map((file) => ({ file, previewUrl: URL.createObjectURL(file) })), [files])

  const onSelectFiles = (selectedFiles) => {
    const allowed = ['application/pdf', 'image/jpeg', 'image/png']
    const valid = selectedFiles.filter((file) => allowed.includes(file.type))
    setFiles(valid)
    setError(valid.length !== selectedFiles.length ? 'Only PDF, JPG, and PNG files are allowed.' : '')
  }

  const submit = async (e) => {
    e.preventDefault()
    setError('')
    setUploading(true)
    setProgress(18)
    const tick = setInterval(() => setProgress((p) => Math.min(92, p + 14)), 350)
    const fd = new FormData()
    fd.append('token', token)
    fd.append('uploaded_by_name', uploadedByName)
    for (const file of files) fd.append('files', file)

    try {
      const { data } = await uploadApi.submitPublic(fd)
      setProgress(100)
      setMsg(`Uploaded ${data.uploaded_count || files.length} document(s) successfully.`)
      setFiles([])
      setSession((prev) => ({ ...prev, documents: data.documents || prev?.documents || [] }))
    } catch (err) {
      setError(err?.response?.data?.detail || 'Upload failed. Please try again.')
    } finally {
      clearInterval(tick)
      setUploading(false)
    }
  }

  if (!session && !msg) return <div className="p-8">Loading upload form...</div>

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8">
      <form onSubmit={submit} className="surface mx-auto w-full max-w-3xl space-y-4 p-5">
        <h1 className="text-xl font-extrabold">Upload Documents for {session?.business_name || 'Business'}</h1>
        {session && (
          <>
            <p className="text-sm text-slate-600"><b>Required:</b> {session.required_documents.join(', ')}</p>
            <input className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm" placeholder="Your name" value={uploadedByName} onChange={(e) => setUploadedByName(e.target.value)} />
            <label className="block cursor-pointer rounded-lg border border-dashed border-slate-300 bg-slate-50 p-6 text-center text-sm text-slate-600 hover:bg-slate-100">
              Drag files here or click to browse
              <input type="file" multiple accept=".pdf,.png,.jpg,.jpeg" onChange={(e) => onSelectFiles(Array.from(e.target.files || []))} className="hidden" />
            </label>
            {uploading && <div><div className="mb-1 text-xs text-slate-500">Uploading... {progress}%</div><div className="h-2 rounded bg-slate-100"><div className="h-2 rounded bg-slate-800" style={{ width: `${progress}%` }} /></div></div>}
            {previews.length > 0 && (
              <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                {previews.map((item, idx) => <div key={`${item.file.name}-${idx}`} className="rounded-lg border border-slate-200 p-2 text-xs"><p className="font-semibold">{item.file.name}</p></div>)}
              </div>
            )}
            <button className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white">Upload Documents</button>

            {!!session.documents?.length && (
              <div className="space-y-2">
                <h3 className="text-sm font-bold">Uploaded Documents</h3>
                <div className="grid gap-3 md:grid-cols-2">
                  {session.documents.map((doc) => {
                    const src = resolveMediaUrl(doc.file_url || doc.file)
                    const isPdf = src.toLowerCase().includes('.pdf')
                    return (
                      <article key={doc.id} className="rounded-lg border border-slate-200 p-2 text-xs">
                        <p className="mb-1 font-semibold">{doc.name}</p>
                        {isPdf ? (
                          <a
                            href={src}
                            target="_blank"
                            rel="noreferrer"
                            className="flex h-40 w-full items-center justify-center rounded border bg-slate-50 font-semibold text-slate-700 hover:bg-slate-100"
                          >
                            Open PDF
                          </a>
                        ) : (
                          <img alt={doc.name} src={src} className="h-40 w-full rounded border object-cover" />
                        )}
                      </article>
                    )
                  })}
                </div>
              </div>
            )}
          </>
        )}
        {error && <p className="text-sm text-red-600">{error}</p>}
        {msg && <p className="rounded-lg border border-emerald-200 bg-emerald-50 p-2 text-sm text-emerald-700">{msg}</p>}
      </form>
    </div>
  )
}

export default PublicUploadPage
