const questions = [
  {
    question: "Do I need the MCP server?",
    answer:
      "No. The skill pack works on its own. The local MCP is the rendered-evidence lane: it adds browser capture, evaluation receipts, and decision trace validation.",
  },
  {
    question: "What changes in my project?",
    answer:
      "ADS installs repo-local skill directories, Markdown guidance, templates, and verification scripts. It does not add a hosted service or send project files to an ADS account.",
  },
  {
    question: "Does ADS decide when the UI ships?",
    answer:
      "No. ADS makes the brief, rendered evidence, deterministic checks, and grader verdict inspectable. A human or the host workflow still owns the shipping decision.",
  },
  {
    question: "Will every MCP host behave the same way?",
    answer:
      "No. Host configuration and resource recovery differ. Use the acceptance ledger above as the claim boundary, then verify any unlisted host against the same render, evaluate, trace, and recovery contract.",
  },
];

export function ReleaseFaq() {
  return (
    <section className="release-faq" aria-labelledby="release-faq-title">
      <header>
        <p>Before you install</p>
        <h3 id="release-faq-title">The useful questions.</h3>
      </header>
      <div className="release-faq-list">
        {questions.map((item) => (
          <details key={item.question}>
            <summary className="focus-ring">{item.question}</summary>
            <p>{item.answer}</p>
          </details>
        ))}
      </div>
    </section>
  );
}
