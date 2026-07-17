type ScreenState = "failed" | "fixed";

const orders = [
  { id: "#4821", customer: "Mara Chen", status: "Delayed", time: "38m" },
  { id: "#4819", customer: "Field Notes Co.", status: "Packing", time: "1h" },
  { id: "#4816", customer: "Owen Bell", status: "Shipped", time: "2h" },
];

export function OrderScreenPreview({ state }: { state: ScreenState }) {
  const fixed = state === "fixed";

  return (
    <div
      className={`run-screen run-screen--${state}`}
      aria-label={fixed ? "Corrected Orders screen" : "First Orders screen with failed checks"}
    >
      <div className="run-screen-bar">
        <span>northstar / orders</span>
        <b>390px</b>
      </div>
      <div className="run-screen-body">
        <div className="run-screen-title">
          <div>
            <span>Operations</span>
            <strong>{fixed ? "Orders at risk" : "Orders"}</strong>
          </div>
          <i>{fixed ? "3 urgent" : "12 open"}</i>
        </div>

        {fixed && (
          <div className="run-screen-summary">
            <span><b>03</b> at risk</span>
            <span><b>2h 14m</b> dispatch closes</span>
          </div>
        )}

        <div className="run-order-list" role="table" aria-label={fixed ? "Corrected order priority" : "Initial order priority"}>
          {orders.map((order, index) => (
            <div
              className={fixed && index === 0 ? "run-order run-order--urgent" : "run-order"}
              role="row"
              key={order.id}
            >
              <strong role="cell">{order.id}</strong>
              <span role="cell">{order.customer}</span>
              <span role="cell">{order.status}</span>
              <small role="cell">{order.time}</small>
            </div>
          ))}
        </div>

        <p className={fixed ? "run-screen-result run-screen-result--pass" : "run-screen-result run-screen-result--fail"}>
          {fixed ? "FIXED · urgent work leads" : "FAIL · delayed order is buried"}
        </p>
      </div>
    </div>
  );
}
