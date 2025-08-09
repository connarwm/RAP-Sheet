import { Link } from "react-router-dom"

export default function NotFound() {
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">Page not found</h1>
      <p className="text-gray-700 dark:text-gray-300">The page you’re looking for doesn’t exist.</p>
      <Link to="/" className="inline-flex px-3 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-700">Go Home</Link>
    </div>
  )
}
