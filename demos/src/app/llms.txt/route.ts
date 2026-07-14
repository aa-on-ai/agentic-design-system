const llmsText = `# Agentic Design System

> An open-source control plane for coding agents that build UI. ADS helps an agent define intent, read the project baseline, attach rendered evidence, grade the result, and revise until it clears.

This file is a concise access path to the public project documentation. It does not imply discovery, ranking, endorsement, or preferred treatment by language models.

## Start here

- [Repository](https://github.com/aa-on-ai/agentic-design-system): Source, install paths, limitations, and license.
- [Create design workflow](https://github.com/aa-on-ai/agentic-design-system/blob/main/workflows/create-design-workflow.md): Route a design or review task into the appropriate ADS workflow.
- [Worked evidence loop](https://github.com/aa-on-ai/agentic-design-system/tree/main/docs/loop-demo): A preserved Orders-screen run across three iterations.
- [Run report](https://github.com/aa-on-ai/agentic-design-system/blob/main/docs/loop-demo/RUN-REPORT.md): Rendered gates, grader verdict, screenshots, and known limits for the worked run.
- [Agent instructions](https://github.com/aa-on-ai/agentic-design-system/blob/main/AGENTS.md): Repo-local routing and verification expectations.

## What ADS is

ADS is a repo-local set of skills, markdown templates, checks, examples, and workflow patterns. It is not a hosted design agent or a guarantee of universal portability. The current grader loop is workflow-driven rather than a hosted service.

## License

- [MIT License](https://github.com/aa-on-ai/agentic-design-system/blob/main/LICENSE)
`;

export function GET() {
  return new Response(llmsText, {
    headers: {
      "Content-Type": "text/markdown; charset=utf-8",
      "Cache-Control": "public, max-age=3600",
    },
  });
}
