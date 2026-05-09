import { Link } from "@tanstack/react-router";
import { Plane } from "lucide-react";

export function SiteHeader({ right }: { right?: React.ReactNode }) {
  return (
    <header className="sticky top-0 z-40 w-full glass border-b border-white/20">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
        <Link to="/" className="flex items-center gap-3 group">
          <div className="h-9 w-9 rounded-lg gradient-primary grid place-items-center text-white font-bold transition-transform group-hover:scale-110 shadow-lg">
            ✈️
          </div>
          <span className="text-lg font-bold tracking-tight bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            TripSync
          </span>
        </Link>
        <nav className="flex items-center gap-3">
          {right ?? (
            <>
              <Link
                to="/create"
                className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
              >
                Sign in
              </Link>
              <Link
                to="/create"
                className="group relative px-5 py-2 rounded-lg font-medium text-white text-sm overflow-hidden transition-all duration-300 hover:shadow-lg hover:shadow-primary/30"
                style={{ background: 'var(--gradient-primary)' }}
              >
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300" style={{ background: 'rgba(0,0,0,0.1)' }} />
                <span className="relative">Create Trip</span>
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
