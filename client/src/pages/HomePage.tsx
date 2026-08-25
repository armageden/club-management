import { Link } from "react-router-dom";
import { useAuth } from "../app/providers";

export default function HomePage() {
  const { user } = useAuth();

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
      <h1 className="text-5xl font-bold text-white mb-4">
        Hackathon Operations Hub
      </h1>
      <p className="text-xl text-gray-400 mb-8 max-w-2xl">
        Manage events, teams, hardware, budgets, and more — all in one place.
      </p>

      {user ? (
        <Link
          to="/dashboard"
          className="px-8 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-medium rounded-lg transition-colors text-lg"
        >
          Go to Dashboard
        </Link>
      ) : (
        <div className="flex gap-4">
          <Link
            to="/login"
            className="px-8 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-medium rounded-lg transition-colors text-lg"
          >
            Login
          </Link>
          <Link
            to="/register"
            className="px-8 py-3 bg-gray-700 hover:bg-gray-600 text-white font-medium rounded-lg transition-colors text-lg"
          >
            Register
          </Link>
        </div>
      )}
    </div>
  );
}
