import { RecommendationResult } from "../index";

type ApiResponse = {
  data?: {
    node?: {
      similarTitlesV2?: {
        edges?: Array<{
          node?: {
            id?: string;
            objectType?: string;
            content?: {
              title?: string;
              posterUrl?: string;
              fullPath?: string;
              genres?: Array<{
                translation?: string;
              }>;
              backdrops?: Array<{
                backdropUrl?: string;
              }>;
              scoring?: {
                imdbVotes?: number;
                imdbScore?: number;
                tomatoMeter?: number;
              };
            };
          };
        }>;
      };
    };
  };
};

export default async function getRecomendations(
  showid: string,
  Fetcher: (url: string, options: RequestInit) => Promise<Response>,
  country: string = "IN"
): Promise<RecommendationResult[]> {
  const response = await Fetcher("https://apis.justwatch.com/graphql", {
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
    body: `{"operationName":"GetSimilarTitles","variables":{"includeOffers":false,"first":8,"offerFilters":{"preAffiliate":true},"language":"en","country":"${country}","filters":{"excludeIrrelevantTitles":false},"titleId":"${showid}"},"query":"query GetSimilarTitles($country: Country!, $titleId: ID!, $language: Language!, $filters: TitleFilter, $includeOffers: Boolean! = false, $first: Int! = 12, $offerFilters: OfferFilter! = {packages: [\\"atp\\"]}) {\\n  node(id: $titleId) {\\n    id\\n    ... on MovieOrShow {\\n      similarTitlesV2(country: $country, filter: $filters, first: $first) {\\n        edges {\\n          node {\\n            ...SimilarTitle\\n            offers(country: $country, platform: WEB, filter: $offerFilters) @include(if: $includeOffers) {\\n              ...TitleOffer\\n              __typename\\n            }\\n            __typename\\n          }\\n          __typename\\n        }\\n        __typename\\n      }\\n      __typename\\n    }\\n    __typename\\n  }\\n}\\n\\nfragment SimilarTitle on MovieOrShow {\\n  id\\n  objectId\\n  objectType\\n  content(country: $country, language: $language) {\\n    title\\n    posterUrl\\n    fullPath\\n    genres {\\n      translation(language: $language)\\n      __typename\\n    }\\n    backdrops {\\n      backdropUrl\\n      __typename\\n    }\\n    scoring {\\n      imdbVotes\\n      imdbScore\\n      tomatoMeter\\n      certifiedFresh\\n      jwRating\\n      __typename\\n    }\\n    interactions {\\n      votesNumber\\n      __typename\\n    }\\n    __typename\\n  }\\n  watchlistEntryV2 {\\n    createdAt\\n    __typename\\n  }\\n  likelistEntry {\\n    createdAt\\n    __typename\\n  }\\n  dislikelistEntry {\\n    createdAt\\n    __typename\\n  }\\n  ... on Movie {\\n    seenlistEntry {\\n      createdAt\\n      __typename\\n    }\\n    __typename\\n  }\\n  ... on Show {\\n    seenState(country: $country) {\\n      progress\\n      seenEpisodeCount\\n      __typename\\n    }\\n    __typename\\n  }\\n  __typename\\n}\\n\\nfragment TitleOffer on Offer {\\n  id\\n  presentationType\\n  monetizationType\\n  newElementCount\\n  retailPrice(language: $language)\\n  retailPriceValue\\n  currency\\n  lastChangeRetailPriceValue\\n  type\\n  package {\\n    id\\n    packageId\\n    clearName\\n    shortName\\n    technicalName\\n    icon(profile: S100)\\n    iconWide(profile: S160)\\n    planOffers(country: $country, platform: WEB) {\\n      title\\n      retailPrice(language: $language)\\n      isTrial\\n      durationDays\\n      retailPriceValue\\n      children {\\n        title\\n        retailPrice(language: $language)\\n        isTrial\\n        durationDays\\n        retailPriceValue\\n        __typename\\n      }\\n      __typename\\n    }\\n    __typename\\n  }\\n  standardWebURL\\n  preAffiliatedStandardWebURL\\n  streamUrl\\n  elementCount\\n  availableTo\\n  subtitleLanguages\\n  videoTechnology\\n  audioTechnology\\n  audioLanguages(language: $language)\\n  __typename\\n}\\n"}`,
    method: "POST",
  });
  
  const data: ApiResponse = await response.json();
  const ListOfShows = data?.data?.node?.similarTitlesV2?.edges || [];
  
  const finalList: RecommendationResult[] = ListOfShows.map((show) => ({
    id: show?.node?.id || "",
    type: show?.node?.objectType || "",
    title: show?.node?.content?.title || "",
    poster: show?.node?.content?.posterUrl || "",
    fullPath: show?.node?.content?.fullPath || "",
    genres: show?.node?.content?.genres?.map((genre) => genre?.translation || "") || [],
    backdrops: show?.node?.content?.backdrops?.map(
      (backdrop) => backdrop?.backdropUrl || ""
    ) || [],
    scoring: {
      imdbVotes: show?.node?.content?.scoring?.imdbVotes,
      imdbScore: show?.node?.content?.scoring?.imdbScore,
      tomatoMeter: show?.node?.content?.scoring?.tomatoMeter,
    },
  }));
  
  return finalList;
}