import { NextResponse } from "next/server";
import { loadWorkbenchSession } from "../loadWorkbenchSession";
import { applyProjectIdentity } from "../projectIdentity.server";
import { PRESET_IDS, type PresetId } from "../workbenchSession";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    if (!request.headers.get("content-type")?.startsWith("application/json")) {
      return NextResponse.json({ message: "Expected an application/json request." }, { status: 415 });
    }
    const body = await request.json() as Record<string, unknown>;
    if (
      Object.keys(body).some((key) => !["preset", "expectedCurrentHash", "expectedDraft"].includes(key))
      || typeof body.preset !== "string"
      || !PRESET_IDS.includes(body.preset as PresetId)
      || (body.expectedCurrentHash !== null && typeof body.expectedCurrentHash !== "string")
      || typeof body.expectedDraft !== "string"
      || body.expectedDraft.length > 524_288
    ) {
      return NextResponse.json({ message: "The approved identity payload is invalid." }, { status: 400 });
    }
    const session = await loadWorkbenchSession();
    const result = await applyProjectIdentity(session, {
      preset: body.preset as PresetId,
      expectedCurrentHash: body.expectedCurrentHash as string | null,
      expectedDraft: body.expectedDraft,
    });
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json({ message: error instanceof Error ? error.message : "Project identity apply failed." }, { status: 409 });
  }
}
