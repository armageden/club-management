import { Link } from "react-router-dom";
import { useAuth } from "../../app/providers";

export default function Navbar() {
  const { user, logout } = useAuth();

  return (
    <nav className="bg-gray-900 text-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <div className="flex items-center gap-6">
            <Link to="/" className="text-xl font-bold text-indigo-400">
              Hackathon Hub
            </Link>
            {user && (
              <div className="hidden md:flex items-center gap-4">
                <Link to="/dashboard" className="text-sm text-gray-300 hover:text-white transition-colors">
                  Dashboard
                </Link>
                <Link to="/teams" className="text-sm text-gray-300 hover:text-white transition-colors">
                  Teams
                </Link>
                <Link to="/itinerary" className="text-sm text-gray-300 hover:text-white transition-colors">
                  Schedule
                </Link>
                <Link to="/checkin" className="text-sm text-gray-300 hover:text-white transition-colors">
                  Check-in
                </Link>
                <Link to="/certificates" className="text-sm text-gray-300 hover:text-white transition-colors">
                  Certificates
                </Link>
              </div>
            )}
          </div>

          <div className="flex items-center gap-4">
            {user ? (
              <>
                <span className="text-gray-300 text-sm">
                  {user.full_name}
                  <span className="ml-2 text-xs px-2 py-0.5 rounded bg-indigo-600">
                    {user.global_role}
                  </span>
                </span>
                <button
                  onClick={logout}
                  className="px-4 py-2 text-sm bg-gray-700 hover:bg-gray-600 rounded transition-colors"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="px-4 py-2 text-sm hover:text-indigo-300 transition-colors"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-2 text-sm bg-indigo-600 hover:bg-indigo-500 rounded transition-colors"
                >
                  Register
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
