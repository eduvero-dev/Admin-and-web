import { NextResponse } from "next/server";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ code: string }> }
) {
  const { code } = await params;
  const API_BASE = "https://spiced-cider-staging.up.railway.app";

  console.log(`[Proxy GET] Fetching assessment for code: ${code}`);

  try {
    // Try without trailing slash first (as in mobile app)
    const url = `${API_BASE}/v1/assessments/access_code/${code}`;
    const res = await fetch(url, {
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
    });

    if (!res.ok) {
      console.error(`[Proxy GET] Backend returned ${res.status} for ${url}`);
      const errorText = await res.text();
      return NextResponse.json(
        { 
          error: "Assessment not found", 
          debug: {
            status: res.status,
            url,
            backendResponse: errorText
          }
        },
        { status: res.status }
      );
    }

    const data = await res.json();
    return NextResponse.json(data);
  } catch (error: any) {
    console.error(`[Proxy GET] Internal error:`, error);
    return NextResponse.json(
      { error: "Internal Server Error", message: error.message },
      { status: 500 }
    );
  }
}
