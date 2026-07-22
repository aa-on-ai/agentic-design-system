import { TRACE } from "../traceData";

export function GET() {
  return Response.json(TRACE);
}
