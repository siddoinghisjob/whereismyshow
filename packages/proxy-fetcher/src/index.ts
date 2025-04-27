import timedFunction from 'timed-function';

/**
 * Fetches a list of proxy servers
 * @param time Timeout in milliseconds
 * @returns Array of proxy URLs
 */
async function getProxyList(time: number): Promise<string[]> {
  console.log("Getting proxy list...");
  
  // Fallback proxies if fetching fails
  const fallbackProxies = [
    "http://43.159.142.191:13001",
    "http://165.232.129.150:80",
    "http://113.175.44.30:8080",
    "http://40.76.69.94:8080",
  ];

  async function getRandomProxy(): Promise<Array<{url: string, google: string}>> {
    try {
      const res = await fetch(
        "https://free-proxy-list.net/anonymous-proxy.html"
      );
      const html = await res.text();
      const tableStart = html.indexOf("<table");
      const tableEnd = html.indexOf("</table>") + 8;
      
      // Ensure a table was found
      if (tableStart === -1 || tableEnd === -1) {
        console.error("Could not find the proxy table on the page.");
        return [];
      }
      const table = html.slice(tableStart, tableEnd);

      const proxyObject: Array<any> = [];

      // Parse table headers and body
      const thead = table.match(/<thead>[\s\S]*?<\/thead>/)?.[1] || "";
      const tbody = table.match(/<tbody>[\s\S]*?<\/tbody>/)?.[1] || "";

      // Get header columns, converting to camelCase for keys
      const headers =
        thead.match(/<th.*?>(.*?)<\/th>/g)?.map(
          (th) =>
            th
              .replace(/<.*?>/g, "") // Remove any inner tags like spans
              .trim()
              .toLowerCase()
              .replace(/\s(.)/g, (_, group1) => group1.toUpperCase()) // Convert to camelCase
        ) || [];

      // Get body rows
      const rows = tbody.match(/<tr.*?>(.*?)<\/tr>/g) || [];

      rows.forEach((row) => {
        const cols = row.match(/<td.*?>(.*?)<\/td>/g);
        if (cols && cols.length === headers.length) {
          // Ensure the number of columns matches headers
          const proxyData: Record<string, string> = {};
          cols.forEach((col, index) => {
            const headerKey = headers[index];
            if (headerKey) {
              // Only add if there's a corresponding header
              proxyData[headerKey] = col.replace(/<\/?td.*?>/g, "").trim(); // Extract text content
            }
          });
          // Ensure essential fields like ipAddress and port exist before adding
          if (proxyData.ipAddress && proxyData.port) {
            // Construct the full proxy URL
            const protocol = proxyData.https === "yes" ? "https" : "http";
            proxyData.url = `${protocol}://${proxyData.ipAddress}:${proxyData.port}`;
            proxyObject.push(proxyData);
          }
        }
      });

      return proxyObject;
    } catch (e) {
      return [];
    }
  }

  const list = await timedFunction(getRandomProxy, time, []);
  const filteredList = list.filter((proxy) => proxy.google === "yes").map(
    (proxy) => proxy.url
  );
  const finalList = filteredList.length === 0 ? fallbackProxies : filteredList;
  return finalList;
}

export default getProxyList;