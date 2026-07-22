import { MCP_CONTRACT } from "../mcpData";

export function GET() {
  return Response.json(MCP_CONTRACT, {
    headers: {
      "cache-control": "public, max-age=300, s-maxage=3600",
    },
  });
}
