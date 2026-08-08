"use client";

import { Plus } from "lucide-react";
import { useState } from "react";

const questions = [
  {
    question: "Do I need the evidence server?",
    answer:
      "No. The skill pack works on its own. The optional Model Context Protocol server is the rendered-evidence lane: it adds browser capture, evaluation receipts, and decision trace validation.",
  },
  {
    question: "What changes in my project?",
    answer:
      "The system installs repo-local skill directories, Markdown guidance, templates, and verification scripts. It does not add a hosted service or send project files to an external account.",
  },
  {
    question: "Does the system decide when the interface ships?",
    answer:
      "No. The system makes the brief, rendered evidence, deterministic checks, and grader verdict inspectable. A human or the host workflow still owns the shipping decision.",
  },
  {
    question: "Will every evidence host behave the same way?",
    answer:
      "No. Host configuration and resource recovery differ. Use the acceptance ledger above as the claim boundary, then verify any unlisted host against the same render, evaluate, trace, and recovery contract.",
  },
];

export function ReleaseFaq() {
  const [openQuestions, setOpenQuestions] = useState<number[]>([]);

  function toggleQuestion(index: number) {
    setOpenQuestions((current) => (
      current.includes(index)
        ? current.filter((item) => item !== index)
        : [...current, index]
    ));
  }

  return (
    <section className="release-faq" aria-labelledby="release-faq-title">
      <header>
        <p>Before you install</p>
        <h3 id="release-faq-title">The useful questions.</h3>
      </header>
      <div className="release-faq-list">
        {questions.map((item, index) => {
          const isOpen = openQuestions.includes(index);
          const triggerId = `release-faq-trigger-${index}`;
          const panelId = `release-faq-panel-${index}`;

          return (
            <div className="release-faq-item" data-open={isOpen} key={item.question}>
              <h4>
                <button
                  aria-controls={panelId}
                  aria-expanded={isOpen}
                  className="focus-ring"
                  id={triggerId}
                  onClick={() => toggleQuestion(index)}
                  type="button"
                >
                  <span>{item.question}</span>
                  <span className="release-faq-icon" aria-hidden="true">
                    <Plus size={18} strokeWidth={2.25} />
                  </span>
                </button>
              </h4>
              <div
                aria-hidden={!isOpen}
                aria-labelledby={triggerId}
                className="release-faq-answer"
                id={panelId}
                role="region"
              >
                <div>
                  <p>{item.answer}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
