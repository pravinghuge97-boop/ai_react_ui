const SettingsPage = () => (
  <div className="space-y-4">
    <div>
      <h2 className="page-title">Settings</h2>
      <p className="page-subtitle">Environment and configuration notes for operations team.</p>
    </div>
    <section className="surface p-5">
      <h3 className="text-sm font-bold">Integration Configuration</h3>
      <p className="mt-2 text-sm text-slate-600">Configure Gemini and authentication keys in backend <code>.env</code>. Keep production secrets in a secure vault and rotate quarterly.</p>
    </section>
  </div>
)

export default SettingsPage
