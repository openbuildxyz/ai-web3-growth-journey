import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 text-gray-900 flex flex-col">
      <div className="flex-grow flex items-center justify-center">
        <Link href="/protected" className="cursor-pointer">
          <video
            src="/cat.mp4"
            autoPlay
            loop
            muted
            playsInline
            className="hover:opacity-90 transition-opacity max-w-full max-h-screen"
            style={{ width: "400px", height: "auto" }}
          />
        </Link>
      </div>
      <footer className="py-8 text-center text-sm text-gray-500">
        By using this site, you agree to be bound by the{" "}
        <a
          href="https://www.coinbase.com/legal/developer-platform/terms-of-service"
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-500"
        >
          CDP Terms of Service
        </a>{" "}
        and{" "}
        <a
          href="https://www.coinbase.com/legal/privacy"
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-500"
        >
          Global Privacy Policy
        </a>
        .
      </footer>
    </div>
  );
}
