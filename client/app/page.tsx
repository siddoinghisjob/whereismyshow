import Image from "next/image";
import Link from "next/link";
import Navigation from "./components/Navigation";

// Featured show for the hero section
const featuredContent = {
  title: "Stranger Things",
  description:
    "When a young boy vanishes, a small town uncovers a mystery involving secret experiments, terrifying supernatural forces, and one strange little girl.",
  imageUrl:
    "https://m.media-amazon.com/images/M/MV5BN2ZmYjg1YmItNWQ4OC00YWM0LWE0ZDktYThjOTZiZjhhN2Q2XkEyXkFqcGdeQXVyNjgxNTQ3Mjk@._V1_.jpg",
  fullPath: "shows/stranger-things",
};

export default function Home() {
  return (
    <>
      <Navigation />
      <main className="pb-8">
        {/* Hero Section */}
        <section className="relative h-screen min-h-[600px]">
          {/* Background gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-r from-black to-transparent z-10" />

          {/* Background image */}
          <div className="absolute inset-0">
            <Image
              src={featuredContent.imageUrl}
              alt={featuredContent.title}
              className="object-cover object-center"
              quality={90}
              priority
              fill
              sizes="100vw"
            />
          </div>

          {/* Content */}
          <div className="relative z-10 flex flex-col justify-center h-full max-w-3xl mx-auto px-6">
            <h1 className="text-4xl md:text-6xl font-bold mb-3">
              {featuredContent.title}
            </h1>
            <p className="text-lg text-gray-200 mb-6 max-w-xl">
              {featuredContent.description}
            </p>
            <div className="flex space-x-4">
              <Link
                href={`/search?q=stranger%20things`}
                className="bg-red-600 hover:bg-red-700 text-white py-3 px-6 rounded-md font-medium flex items-center"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 mr-2"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z"
                    clipRule="evenodd"
                  />
                </svg>
                Where to Watch
              </Link>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="py-10 px-6 text-center text-gray-400 text-sm">
        <p>© 2025 WhereIsMyShow. All rights reserved.</p>
        <p className="mt-2">
          Find your favorite shows and movies across all streaming platforms.
        </p>
      </footer>
    </>
  );
}
