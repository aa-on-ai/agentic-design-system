// Deterministic fixture variant for render-eval. A real generated variant would look like
// this: a self-contained default-export React page. This one is intentionally offline-safe
// (inline styles, no Tailwind/icon imports) so the fixture path needs no network, and it
// honors #state= so capture.mjs can exercise multi-state capture. It carries ONE deliberate
// a11y violation (an <img> with no alt) so axe must find it on the RENDERED DOM.
import { useEffect, useState } from 'react';

function useHashState(): string {
  const [state, setState] = useState('default');
  useEffect(() => {
    const read = () => setState((location.hash.match(/state=(\w+)/) || [])[1] || 'default');
    read();
    window.addEventListener('hashchange', read);
    return () => window.removeEventListener('hashchange', read);
  }, []);
  return state;
}

const wrap: React.CSSProperties = { maxWidth: 720, margin: '0 auto', padding: '32px 20px', fontFamily: '"Spline Sans", ui-sans-serif, system-ui, sans-serif', color: '#1a1a1a' };
const row: React.CSSProperties = { padding: '14px 0', borderBottom: '1px solid #e7e4dd' };

export default function OrdersPage() {
  const state = useHashState();
  return (
    <div style={{ background: '#f7f6f3', minHeight: '100vh' }}>
      <header><nav aria-label="Primary" style={{ padding: '16px 20px', fontWeight: 600 }}>Acme Orders</nav></header>
      <main style={wrap}>
        <h1 style={{ fontSize: 24, margin: '0 0 16px' }}>Orders</h1>

        {state === 'default' && (
          <section>
            <div style={row}>#1042 — Maya Chen — shipped</div>
            <div style={row}>#1041 — Devon Park — processing</div>
            <div style={row}>#1040 — Lena Ortiz — delivered</div>
            {/* DELIBERATE a11y violation: image with no alt text */}
            <img src="data:image/gif;base64,R0lGODlhAQABAAAAACw=" width={1} height={1} />
          </section>
        )}
        {state === 'loading' && <div role="status" aria-live="polite" aria-busy="true">Loading your orders…</div>}
        {state === 'empty' && <p style={{ color: '#6b6b6b' }}>No orders yet. When customers buy, they'll show up here.</p>}
        {state === 'error' && <div role="alert">Couldn't load orders. Check your connection and retry.</div>}
      </main>
    </div>
  );
}
