import { ShowResult } from "../index";

type ApiResponse = {
  data?: {
    popularTitles?: {
      edges?: Array<{
        node?: {
          content?: {
            title?: string;
            originalReleaseYear?: number;
            fullPath?: string;
          };
        };
      }>;
    };
  };
};

export default async function searchMovie(
  searchQuery: string, 
  Fetcher: (url: string, options: RequestInit) => Promise<Response>, 
  country: string = "IN"
): Promise<ShowResult[]> {
    const response = await Fetcher(`https://apis.justwatch.com/graphql`, {
      method: "POST",
      headers: {
        accept: "*/*",
        "accept-language": "en-US,en;q=0.7",
        "app-version": "3.9.3-web-web",
        "content-type": "application/json",
        "device-id": "w74RDcKnCcKDQRzCC1bDiM",
        priority: "u=1, i",
        "sec-ch-ua": '"Brave";v="135", "Not-A.Brand";v="8", "Chromium";v="135"',
        "sec-ch-ua-mobile": "?0",
        "sec-ch-ua-platform": '"macOS"',
        "sec-fetch-dest": "empty",
        "sec-fetch-mode": "cors",
        "sec-fetch-site": "same-site",
        "sec-gpc": "1",
        Referer: "https://www.justwatch.com/",
        "Referrer-Policy": "strict-origin-when-cross-origin",
      },
      body: JSON.stringify({
        operationName: "GetSuggestedTitles",
        variables: {
          country: country,
          language: "en",
          first: 4,
          filter: {
            searchQuery: searchQuery,
            includeTitlesWithoutUrl: true,
          },
        },
        query: `
            query GetSuggestedTitles($country: Country!, $language: Language!, $first: Int!, $filter: TitleFilter) {
              popularTitles(country: $country, first: $first, filter: $filter) {
                edges {
                  node {
                    ...SuggestedTitle
                    __typename
                  }
                  __typename
                }
                __typename
              }
            }
            
            fragment SuggestedTitle on MovieOrShow {
              __typename
              id
              objectType
              objectId
              content(country: $country, language: $language) {
                fullPath
                title
                originalReleaseYear
                posterUrl
                fullPath
                __typename
              }
              watchNowOffer(country: $country, platform: WEB) {
                id
                standardWebURL
                preAffiliatedStandardWebURL
                package {
                  id
                  packageId
                  __typename
                }
                __typename
              }
              offers(country: $country, platform: WEB, filter: {preAffiliate: true}) {
                monetizationType
                presentationType
                standardWebURL
                preAffiliatedStandardWebURL
                package {
                  id
                  packageId
                  __typename
                }
                id
                __typename
              }
            }
          `,
      }),
    });
  
    const data: ApiResponse = await response.json();
    const searchResults = data?.data?.popularTitles?.edges || [];
    const searchRes: ShowResult[] = [];
    
    for (const item of searchResults) {
      const jsonObj: ShowResult = { title: "", fullPath: "" };
      const itemContent = item?.node?.content;
      const itemFullPath = itemContent?.fullPath;
      
      if (itemFullPath) {
        jsonObj["title"] = itemContent?.title || "";
        jsonObj["originalReleaseYear"] = itemContent?.originalReleaseYear;
        jsonObj["fullPath"] = itemFullPath;
        searchRes.push(jsonObj);
      }
    }
    
    return searchRes;
  }