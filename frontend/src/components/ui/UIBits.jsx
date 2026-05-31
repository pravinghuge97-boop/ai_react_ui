export const StatusBadge = ({ status = '' }) => {
  const value = status.toLowerCase()
  const tone = value.includes('complete') || value.includes('converted')
    ? 'success'
    : value.includes('pending') || value.includes('follow')
      ? 'warning'
      : value.includes('fail') || value.includes('missed')
        ? 'danger'
        : 'neutral'

  return <span className={`status-badge status-${tone}`}>{status || 'Unknown'}</span>
}

export const SkeletonRow = ({ cols = 4 }) => (
  <tr>
    {Array.from({ length: cols }).map((_, idx) => (
      <td key={idx} className="px-4 py-3">
        <div className="h-3.5 w-full animate-pulse rounded bg-slate-200" />
      </td>
    ))}
  </tr>
)

export const EmptyState = ({ title, description }) => (
  <div className="empty-state">
    <p className="empty-title">{title}</p>
    <p className="empty-description">{description}</p>
  </div>
)
