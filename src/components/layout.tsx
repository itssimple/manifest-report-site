import type React from "react"
import Link from "next/link"

const Layout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="flex h-screen flex-col text-gray-200">
      {/* Header */}
      <header className="p-4 flex items-center border-b border-blue-200/20 destiny header">
        <div className="flex items-center w-full">
          {/* Placeholder for icon */}
          <div className="w-8 h-8 bg-blue-500/25 rounded-full mr-3"></div>
					<h1 className="text-xl font-bold text-destiny-gold"><Link href="/">Manifest.Report</Link></h1>
					<h2 className="text-l ml-auto">© {new Date().getFullYear()} NoLifeKing85#2914</h2>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <aside className="bg-gray-900 w-64 p-4 flex flex-col border-r border-blue-200/20">
          <nav>
						<ul className="space-y-2">
						<li>
                <Link
                  href="/"
                  className="flex items-center space-x-2 text-gray-300 hover:text-destiny-blue transition-colors duration-150"
                >
                  <span>Home</span>
                </Link>
              </li>
              <li>
                <Link
                  href="/manifests"
                  className="flex items-center space-x-2 text-gray-300 hover:text-destiny-blue transition-colors duration-150"
                >
                  <span>Manifest list</span>
                </Link>
              </li>
            </ul>
					</nav>
        </aside>

        {/* Main content */}
				<main className="flex-1 overflow-y-auto bg-destiny-dark p-6">
					<div className="max-w-7xl mx-auto">
						{children}
					</div>
				</main>
      </div>
    </div>
  )
}

export default Layout

