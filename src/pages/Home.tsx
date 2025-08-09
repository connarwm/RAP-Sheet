import { Link } from "react-router-dom"

export default function Home() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Welcome</h1>
      <p className="text-gray-700 dark:text-gray-300">
        Choose a feature from the sidebar to get started. This home page can host quick actions, recent items, and tips.
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Link
          to="/apps/network-raps"
          className="block bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 hover:shadow transition"
        >
          <div className="text-lg font-semibold text-gray-900 dark:text-white">Network RAPs</div>
          <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Upload cable links and generate RAP mappings.
          </div>
        </Link>
      </div>
    </div>
  )
}
