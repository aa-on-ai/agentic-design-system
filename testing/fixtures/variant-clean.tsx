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

export default function CleanOrders() {
  const state = useHashState();
  return (
    <main
      className="md:max-w-4xl focus-visible:outline focus-visible:outline-2"
      style={{ maxWidth: 720, margin: '0 auto', padding: 24, fontFamily: 'system-ui', color: '#171717' }}
    >
      <h1>Orders</h1>
      {state === 'default' && <p>Three orders are ready for review.</p>}
      {state === 'loading' && <p role="status" aria-live="polite">Loading orders…</p>}
      {state === 'empty' && <p>No orders yet.</p>}
      {state === 'error' && <p role="alert">Orders could not be loaded.</p>}
    </main>
  );
}

