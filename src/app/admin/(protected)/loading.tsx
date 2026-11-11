export default function AdminLoading() {
  return (
    <div className="admin-loading" role="status" aria-live="polite">
      <div className="admin-heading">
        <div>
          <div className="admin-loading-line title" />
          <div className="admin-loading-line subtitle" />
        </div>
      </div>
      <div className="admin-loading-panel">
        <span className="admin-loading-label">Membuka halaman…</span>
        <div className="admin-loading-line wide" />
        <div className="admin-loading-line medium" />
        <div className="admin-loading-line wide" />
        <div className="admin-loading-line short" />
      </div>
    </div>
  );
}
