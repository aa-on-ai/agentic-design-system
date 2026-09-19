# ADS workshop

The Next.js app behind the [Agentic Design System workshop](https://agentic-design-system-lovat.vercel.app).

It presents the public product story and supporting ADS examples. The app is a private workspace package; install ADS from the [repository install guide](../docs/INSTALL.md), not from this directory.

## Run locally

From the repository root:

```bash
npm --prefix demos ci
npm --prefix demos run dev
```

Open <http://localhost:3000>.

## Check the app

```bash
npm --prefix demos run lint
npm --prefix demos run build
```

Repository-level homepage, accessibility, trace, and runtime checks live in [`testing/`](../testing/README.md). Run the applicable focused check when changing a covered interaction, then verify meaningful visual changes in the browser at desktop and mobile sizes.

## App map

- `src/app/page.tsx`: public homepage
- `src/app/workbench/`: interactive workbench
- `src/app/trace/`: decision-trace product surface
- `src/app/mcp/`: MCP product surface
- `src/app/before/` and `src/app/after/`: worked comparison examples
- `public/`: workshop images and brand assets

The source checkout also contains preserved evidence and earlier experiments elsewhere in the repository. They are not alternate production homepages.
