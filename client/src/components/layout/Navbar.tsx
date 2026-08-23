import { Link } from "react-router-dom";
import { useAuth } from "../../app/providers";

export default function Navbar() {
  const { user, logout } = useAuth();

  return (
    <nav className="bg-gray-900 text-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <Link to="/" className="text-xl font-bold text-indigo-400">
            Hackathon Hub
          </Link>

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
