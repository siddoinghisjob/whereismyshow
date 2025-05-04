import { NextResponse } from "next/server";
import JustWatchAPI from "justwatch-api-client";

// Initialize the JustWatch API client
const justWatchApi = new JustWatchAPI(5000); // 5 seconds timeout

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const itemFullPath = decodeURIComponent(searchParams.get("itemFullPath") || "");
  const country = searchParams.get("country") || "US";

  if (!itemFullPath) {
    return NextResponse.json(null, { status: 400 });
  }

  try {
    // Ensure path format is correct for the JustWatch API
    // The API expects the path to start with a single slash
    const path = itemFullPath.startsWith("/")
      ? itemFullPath
      : `/${itemFullPath}`;
    console.log(
      "Fetching streaming providers for path:",
      path,
      "in country:",
      country
    );
    const streamers = await justWatchApi.getData(path, country);
    return NextResponse.json(streamers);
  } catch (error) {
    console.error("Error getting streaming providers:", error);
    return NextResponse.json(null, { status: 500 });
  }
}
