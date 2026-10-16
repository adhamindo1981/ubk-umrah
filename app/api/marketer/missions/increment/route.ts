import { NextRequest, NextResponse } from "next/server";
import { POST as missionsPost } from "../route";

/**
 * Dedicated endpoint for incrementing mission progress with unique lead guard.
 * POST /api/marketer/missions/increment
 */
export async function POST(req: NextRequest) {
  return missionsPost(req);
}
