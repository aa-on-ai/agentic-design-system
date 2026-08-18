export function UtilityFontFixture({ state }: { state: string }) {
  const content = state === "loading"
    ? "Loading"
    : state === "empty"
      ? "No orders yet"
      : state === "error"
        ? "Error, try again"
        : "Ready";

  return (
    <main className="sm:p-4" style={{ fontFamily: "Inter, system-ui" }}>
      <h1>Orders</h1>
      <section>{content}</section>
    </main>
  );
}
