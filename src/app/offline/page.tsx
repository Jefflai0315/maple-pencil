"use client";

export default function OfflinePage() {
  return (
<<<<<<< HEAD
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
        <div className="mb-6">
          <svg
            className="mx-auto h-16 w-16 text-gray-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192L5.636 18.364M12 2.25a9.75 9.75 0 109.75 9.75A9.75 9.75 0 0012 2.25z"
            />
          </svg>
        </div>

        <h1 className="text-2xl font-bold text-gray-900 mb-4">
          You&apos;re Offline
        </h1>

        <p className="text-gray-600 mb-6">
          It looks like you don&apos;t have an internet connection right now.
          Don&apos;t worry - you can still explore the parts of the site that
          are cached!
        </p>

        <div className="space-y-3">
          <button
            onClick={() => (window.location.href = "/")}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors"
          >
            Go to Homepage
          </button>

          <button
            onClick={() => window.location.reload()}
            className="w-full bg-gray-200 text-gray-800 py-2 px-4 rounded-md hover:bg-gray-300 transition-colors"
          >
            Try Again
          </button>
        </div>

        <div className="mt-6 text-sm text-gray-500">
          <p>Available offline features:</p>
          <ul className="mt-2 space-y-1">
            <li>• Homepage and main content</li>
            <li>• Game and interactive elements</li>
            <li>• Gallery and portfolio</li>
            <li>• Contact form (will queue for later)</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
=======
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="text-center p-8">
        <h1 className="text-2xl font-bold mb-4">You&apos;re Offline</h1>
        <p className="text-gray-600 mb-4">
          It looks like you&apos;re not connected to the internet. Please check your connection and try again.
        </p>
        <button 
          onClick={() => window.location.reload()} 
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          Try Again
        </button>
      </div>
    </div>
  );
}
>>>>>>> 79f7ed80bc781eca750829da3b82375667fe5456
