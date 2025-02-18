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
					<h1 className="text-lg md:text-xl font-bold text-destiny-gold"><Link href="/">Manifest.Report</Link></h1>
					<h2 className="text-sm md:text-lg ml-auto">© {new Date().getFullYear()} NoLifeKing85#2914</h2>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">

        {/* Main content */}
				<main className="flex-1 overflow-y-auto bg-destiny-dark p-6">
					<div className="max-w-7xl mx-auto text-xs md:text-base">
						{children}
					</div>
				</main>
      </div>
    </div>
  )
}

export default Layout

