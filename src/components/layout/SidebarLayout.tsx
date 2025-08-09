import { Link, Outlet, useLocation } from "react-router-dom"
import { useState, useEffect } from "react"
import ThemeToggle from "../ThemeToggle"
import ColorSchemeSelector from "../ColorSchemeSelector"
import ErrorBoundary from "../ErrorBoundary"
import { Home as HomeIcon, Cable, Menu, X } from "lucide-react"

const navItems = [
  { to: "/", label: "Home", Icon: HomeIcon },
  { to: "/apps/network-raps", label: "Network RAPs", Icon: Cable },
  { to: "/apps/prd-raps", label: "PRD RAPs", Icon: Cable },
  { to: "/apps/weird-raps", label: "Weird RAPs", Icon: Cable },
  { to: "/apps/mileage-calculator", label: "Mileage Calculator", Icon: Cable },
] as const

export default function SidebarLayout() {
  const { pathname } = useLocation()
  const [mobileOpen, setMobileOpen] = useState(false)

  useEffect(() => { setMobileOpen(false) }, [pathname])

  const NavList = () => (
    <nav className="space-y-2">
      {navItems.map(({ to, label, Icon }) => {
        const active = pathname === to
        return (
          <Link
            key={to}
            to={to}
            aria-current={active ? "page" : undefined}
            className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 \
              ${active ? "bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white" : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"}`}
          >
            <Icon size={16} />
            {label}
          </Link>
        )
      })}
    </nav>
  )

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex">
      {/* Sidebar for desktop */}
      <aside className="hidden lg:block w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 p-4 space-y-2">
        <div className="text-lg font-semibold text-gray-900 dark:text-white mb-4">RAP Sheet</div>
        <NavList />
      </aside>

      {/* Mobile overlay and drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-40 bg-black/40 lg:hidden" aria-hidden="true" onClick={() => setMobileOpen(false)} />
      )}
      <aside
        className={`fixed z-50 inset-y-0 left-0 w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 p-4 space-y-2 transform transition-transform lg:hidden \
          ${mobileOpen ? "translate-x-0" : "-translate-x-full"}`}
        role="dialog"
        aria-modal="true"
        aria-label="Sidebar"
      >
        <div className="flex items-center justify-between mb-4">
          <div className="text-lg font-semibold text-gray-900 dark:text-white">RAP Sheet</div>
          <button
            type="button"
            onClick={() => setMobileOpen(false)}
            className="p-2 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
            aria-label="Close sidebar"
          >
            <X size={20} />
          </button>
        </div>
        <NavList />
      </aside>

      {/* Content */}
      <div className="flex-1 flex flex-col">
        <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-4">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  className="p-2 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 lg:hidden"
                  onClick={() => setMobileOpen(true)}
                  aria-label="Open sidebar"
                >
                  <Menu size={20} />
                </button>
                <div className="text-xl font-bold text-gray-900 dark:text-white">RAP Sheet</div>
              </div>
              <div className="flex items-center gap-2">
                <ColorSchemeSelector />
                <ThemeToggle />
              </div>
            </div>
          </div>
        </header>

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
          <ErrorBoundary>
            <Outlet />
          </ErrorBoundary>
        </main>
      </div>
    </div>
  )
}
