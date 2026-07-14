export default function SourceGamedStates() {
  // This comment says loading, empty, and error, but none of those states render.
  const documentationOnly = "loading empty error";

  return (
    <main>
      <h1>Orders</h1>
      <p hidden>{documentationOnly}</p>
    </main>
  );
}
