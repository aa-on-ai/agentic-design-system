export default function SourceGamedStates() {
  // Source greps see loading, empty, and error, but every hash renders this same default UI.
  const documentationOnly = 'loading empty error';
  return (
    <main className="md:max-w-4xl focus-visible:outline focus-visible:outline-2" style={{ padding: 24 }}>
      <h1>Orders</h1>
      <p>Three orders are ready for review.</p>
      <p hidden>{documentationOnly}</p>
    </main>
  );
}

