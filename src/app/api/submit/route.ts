import { NextResponse } from "next/server";
import {
  calculateAssessmentCheck,
  fetchAssessmentForScoring,
  getApiBase,
} from "@/lib/assessment-scoring";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const API_BASE = getApiBase();
    const url = `${API_BASE}/v1/assessment_results/access_code/`;
    const score = await fetchAssessmentForScoring(API_BASE, body.access_code)
      .then((assessment) => assessment ? calculateAssessmentCheck(assessment, body.responses || {})?.score ?? null : null)
      .catch((error) => {
        console.error("[Proxy POST] Failed to calculate score:", error);
        return null;
      });
    const payload = typeof score === "number" ? { ...body, score } : body;

    console.log(`[Proxy POST] Submitting to backend: ${url}`);
    console.log(`[Proxy POST] Payload:`, JSON.stringify(payload, null, 2));

    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Accept": "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const errorText = await res.text();
      console.error(`[Proxy POST] Backend error ${res.status}:`, errorText);
      return NextResponse.json(
        {
          error: "Failed to submit assessment results",
          debug: {
            status: res.status,
            url,
            backendBody: payload,
            backendResponse: errorText
          }
        },
        { status: res.status }
      );
    }

    const data = await res.json();
    return NextResponse.json(typeof score === "number" ? { ...data, score } : data);
  } catch (error: any) {
    console.error(`[Proxy POST] Critical error:`, error);
    return NextResponse.json(
      { error: "Internal Server Error", message: error.message },
      { status: 500 }
    );
  }
}
