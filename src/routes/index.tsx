import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteHeader } from "@/components/tripsync/Header";
import { Sparkles, Users, Zap } from "lucide-react";

export const Route = createFileRoute("/")({
  component: Landing,
  head: () => ({ meta: [
    { title: "TripSync AI — Plan trips together" },
    { name: "description", content: "Real-time collaborative group travel planner. Join with a nickname, vote, and let AI build a fair itinerary." },
  ]}),
});

function FloatingReaction({ emoji, delay, offset }: { emoji: string; delay: number; offset: number }) {
  return (
    <div
      className="absolute text-2xl animate-float"
      style={{
        animation: `float 3s ease-in-out infinite`,
        animationDelay: `${delay}s`,
        left: `${offset}%`,
        top: '20%',
      }}
    >
      {emoji}
    </div>
  );
}

function Landing() {
  return (
    <div className="min-h-screen bg-background overflow-hidden">
      <SiteHeader />
      <main className="mx-auto max-w-7xl px-6 py-16">
        {/* Hero Section */}
        <section className="relative pb-20">
          {/* Animated background gradient */}
          <div className="absolute inset-0 -z-10 h-96 bg-gradient-to-b from-purple-100/40 via-transparent to-transparent blur-3xl" />

          <div className="relative text-center">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-white/50 px-4 py-2 backdrop-blur-sm border border-white/30">
              <Sparkles className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium text-foreground">AI-powered group travel planning</span>
            </div>

            <h1 className="text-6xl sm:text-7xl font-bold tracking-tight text-foreground leading-tight mb-6">
              Plan trips<br />
              <span className="bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
                born in the group chat
              </span>
            </h1>

            <p className="mx-auto max-w-2xl text-lg text-muted-foreground mb-12 leading-relaxed">
              No back-and-forth chaos. No decision fatigue. Just drop in, vote in seconds, and let AI craft a trip everyone's actually excited about.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
              <Link
                to="/create"
                className="group relative px-8 py-4 rounded-xl font-semibold text-white overflow-hidden transition-all duration-300 hover:shadow-xl hover:scale-105"
                style={{ background: 'var(--gradient-primary)' }}
              >
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300" style={{ background: 'rgba(0,0,0,0.1)' }} />
                <span className="relative flex items-center gap-2">
                  Create a Trip <span className="group-hover:translate-x-1 transition-transform">→</span>
                </span>
              </Link>
              <Link
                to="/demo"
                className="px-8 py-4 rounded-xl font-semibold text-foreground border-2 border-foreground/20 hover:border-primary hover:bg-primary/5 transition-all duration-300 glass"
              >
                See it in action
              </Link>
            </div>

            {/* Floating reactions */}
            <div className="relative h-32 hidden sm:block">
              <FloatingReaction emoji="✈️" delay={0} offset={15} />
              <FloatingReaction emoji="❤️" delay={0.3} offset={25} />
              <FloatingReaction emoji="🎉" delay={0.6} offset={35} />
              <FloatingReaction emoji="🌴" delay={0.9} offset={55} />
              <FloatingReaction emoji="😍" delay={0.4} offset={65} />
              <FloatingReaction emoji="🗺️" delay={0.8} offset={75} />
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="grid md:grid-cols-3 gap-6 mt-24">
          {[
            {
              emoji: "⚡",
              title: "Zero Friction",
              desc: "No sign-ups. Just drop in with a nickname and start voting in seconds. That's it.",
              icon: Zap,
            },
            {
              emoji: "🗳️",
              title: "Vote + Create",
              desc: "React to AI suggestions with ❤️ 🤔 😐 or pitch your own ideas. Everyone's voice matters.",
              icon: Users,
            },
            {
              emoji: "🎯",
              title: "Fair by AI",
              desc: "One click creates a balanced itinerary everyone loves — backed by a Harmony Score.",
              icon: Sparkles,
            },
          ].map((feature, i) => (
            <div
              key={feature.title}
              className="premium-card p-8 group cursor-pointer"
              style={{
                animation: `slide-up 0.6s ease-out`,
                animationDelay: `${i * 0.1}s`,
              }}
            >
              <div className="mb-4 text-4xl transform transition-transform group-hover:scale-110">
                {feature.emoji}
              </div>
              <h3 className="text-xl font-bold text-foreground mb-3">{feature.title}</h3>
              <p className="text-muted-foreground leading-relaxed">{feature.desc}</p>
              <div className="mt-4 h-1 w-0 group-hover:w-8 bg-gradient-to-r from-primary to-accent transition-all duration-300" />
            </div>
          ))}
        </section>

        {/* Social Proof Section */}
        <section className="mt-24 py-12 px-8 rounded-3xl glass-dark border-2 border-white/20 text-center">
          <p className="text-sm font-semibold text-secondary/80 mb-4">Trusted by group travelers worldwide</p>
          <div className="flex items-center justify-center gap-8 flex-wrap">
            {['👥 5K+ trips planned', '✈️ 50K+ travelers', '🌍 180+ cities'].map((stat) => (
              <div key={stat} className="text-lg font-medium text-white/80">
                {stat}
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
