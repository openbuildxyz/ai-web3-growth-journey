export default function ProtectedPage() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="max-w-2xl mx-auto p-8">
        <h1 className="text-4xl font-bold mb-4">Protected Content</h1>
        <p className="text-lg mb-4">
          Your payment was successful! Enjoy this video.
        </p>
        <video
          width="100%"
          controls
          autoPlay
          className="rounded-lg"
        >
          <source src="/thankyou.mp4" type="video/mp4" />
          Your browser does not support the video tag.
        </video>
      </div>
    </div>
  );
}

