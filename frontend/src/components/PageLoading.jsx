function PageLoading({
  message = "Loading..."
}) {
  return (
    <section className="page-loading-card">
      <div className="page-loading-spinner"></div>
      <p>{message}</p>
    </section>
  );
}

export default PageLoading;
