import { useEffect, useState } from 'react';

function useHashState() {
  const [state, setState] = useState('default');
  useEffect(() => {
    const read = () => setState((location.hash.match(/state=(\w+)/) || [])[1] || 'default');
    read();
    window.addEventListener('hashchange', read);
    return () => window.removeEventListener('hashchange', read);
  }, []);
  return state;
}

export default function SourcePassRenderFail() {
  const state = useHashState();
  return (
    <main className="md:max-w-4xl focus-visible:outline focus-visible:outline-2" style={{ padding: 24 }}>
      <h1>Orders</h1>
      {state === 'default' && (
        <section style={{ width: 1200, border: '1px solid #777', padding: 16 }}>
          Source checks see responsive classes. The browser sees a fixed 1,200px panel.
        </section>
      )}
      {state === 'loading' && <p role="status" aria-live="polite">Loading orders…</p>}
      {state === 'empty' && <p>No orders yet.</p>}
      {state === 'error' && <p role="alert">Orders could not be loaded.</p>}
    </main>
  );
}

