import { useAuth } from "../app/providers";
import { Link } from "react-router-dom";

const features = [
  { name: "Teams & Profiles", path: "/teams", desc: "Create or join teams, manage your profile" },
  { name: "Schedule", path: "/itinerary", desc: "View event schedule and sessions" },
  { name: "Check-in", path: "/checkin", desc: "Check in to the event" },
  { name: "Certificates", path: "/certificates", desc: "View and issue certificates" },
];

export default function DashboardPage() {
  const { user } = useAuth();

  if (!user) return null;

  return (
    <div>
      <h1 className="text-3xl font-bold text-white mb-6">Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-gray-900 rounded-lg p-6 shadow-lg">
          <h2 className="text-lg font-semibold text-indigo-400 mb-2">
            Welcome back
          </h2>
          <p className="text-gray-300">{user.full_name}</p>
          <p className="text-gray-500 text-sm">{user.email}</p>
        </div>

        <div className="bg-gray-900 rounded-lg p-6 shadow-lg">
          <h2 className="text-lg font-semibold text-indigo-400 mb-2">
            Your Role
          </h2>
          <span className="inline-block px-3 py-1 bg-indigo-600 rounded text-sm">
            {user.global_role}
          </span>
        </div>

        <div className="bg-gray-900 rounded-lg p-6 shadow-lg">
          <h2 className="text-lg font-semibold text-indigo-400 mb-2">
            Account Status
          </h2>
          <p className="text-green-400">Active</p>
          <p className="text-gray-500 text-xs mt-1">
            Member since {new Date(user.created_at).toLocaleDateString()}
          </p>
        </div>
      </div>

      <div className="mt-8 bg-gray-900 rounded-lg p-6 shadow-lg">
        <h2 className="text-lg font-semibold text-indigo-400 mb-4">
          Feature Modules
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {features.map((f) => (
            <Link
              key={f.name}
              to={f.path}
              className="block px-5 py-4 bg-gray-800 hover:bg-gray-700 rounded-lg text-left transition-colors group"
            >
              <span className="text-indigo-400 font-medium group-hover:text-indigo-300">
                {f.name}
              </span>
              <p className="text-gray-500 text-xs mt-1">{f.desc}</p>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
