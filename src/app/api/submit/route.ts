import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const API_BASE = "https://spiced-cider-staging.up.railway.app";
    const url = `${API_BASE}/v1/assessment_results/access_code/`;

    console.log(`[Proxy POST] Submitting to backend: ${url}`);
    console.log(`[Proxy POST] Payload:`, JSON.stringify(body, null, 2));
    
    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Accept": "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
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
            backendBody: body,
            backendResponse: errorText
          }
        },
        { status: res.status }
      );
    }

    const data = await res.json();
    return NextResponse.json(data);
  } catch (error: any) {
    console.error(`[Proxy POST] Critical error:`, error);
    return NextResponse.json(
      { error: "Internal Server Error", message: error.message },
      { status: 500 }
    );
  }
}
