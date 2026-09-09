import { NextResponse } from "next/server";
import {
  calculateAssessmentCheck,
  fetchAssessmentForScoring,
  getApiBase,
} from "@/lib/assessment-scoring";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ code: string }> }
) {
  try {
    const { code } = await params;
    const body = await request.json();
    const assessment = await fetchAssessmentForScoring(getApiBase(), code);

    if (!assessment) {
      return NextResponse.json({ error: "Assessment not found" }, { status: 404 });
    }

    const result = calculateAssessmentCheck(assessment, body.responses || {});
    if (!result) {
      return NextResponse.json({ error: "Unable to check assessment" }, { status: 422 });
    }

    return NextResponse.json(result);
  } catch (error: any) {
    console.error("[Assessment Check] Internal error:", error);
    return NextResponse.json(
      { error: "Internal Server Error", message: error.message },
      { status: 500 }
    );
  }
}
