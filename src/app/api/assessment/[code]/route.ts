import { NextResponse } from "next/server";

function getApiBase() {
  const configured = process.env.NEXT_PUBLIC_API_URL || "https://d3bqxy57prpkdk.cloudfront.net";
  return configured.replace(/^http:(?!\/\/)/, "http://").replace(/\/$/, "");
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ code: string }> }
) {
  const { code } = await params;
  const API_BASE = getApiBase();

  console.log(`[Proxy GET] Fetching assessment for code: ${code}`);

  try {
    const headers = {
      Accept: "application/json",
      "Content-Type": "application/json",
    };
    const urls = [
      `${API_BASE}/v1/access_codes/${code}`,
      `${API_BASE}/v1/assessments/access_code/${code}`,
    ];

    let res: Response | null = null;
    let url = "";

    for (const candidateUrl of urls) {
      url = candidateUrl;
      res = await fetch(candidateUrl, { headers });
      if (res.ok) break;
    }

    if (!res || !res.ok) {
      const status = res?.status ?? 500;
      console.error(`[Proxy GET] Backend returned ${status} for ${url}`);
      const errorText = res ? await res.text() : "No backend response";
      return NextResponse.json(
        {
          error: "Assessment not found",
          debug: {
            status,
            url,
            backendResponse: errorText
          }
        },
        { status }
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
