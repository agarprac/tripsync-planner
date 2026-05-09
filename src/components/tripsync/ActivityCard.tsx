import { motion } from "framer-motion";
import { CATEGORY_EMOJI, colorForUser, initials } from "@/lib/tripsync/constants";

export type Activity = {
  id: string;
  title: string;
  description: string | null;
  category: string;
  ai_insight: string | null;
  is_ai_suggested: boolean;
  added_by: string | null;
};

export type Vote = { activity_id: string; user_id: string; vote_type: "must_do"|"interested"|"skip" };

const VOTE_META = {
  must_do: { emoji: "❤️", active: "bg-gradient-to-r from-accent to-orange-500 text-white border-accent/50", soft: "border-accent/30 text-accent bg-white/30 hover:bg-white/50" },
  interested: { emoji: "🤔", active: "bg-gradient-to-r from-primary to-purple-600 text-white border-primary/50", soft: "border-primary/30 text-primary bg-white/30 hover:bg-white/50" },
  skip: { emoji: "😐", active: "bg-muted-foreground text-white border-muted-foreground/50", soft: "border-muted-foreground/30 text-muted-foreground bg-white/30 hover:bg-white/50" },
} as const;

export function ActivityCard({
  activity, votes, currentUserId, addedByName, locked, onVote,
}: {
  activity: Activity;
  votes: Vote[];
  currentUserId: string | null;
  addedByName?: string;
  locked: boolean;
  onVote: (type: "must_do"|"interested"|"skip") => void;
}) {
  const myVote = votes.find((v) => v.user_id === currentUserId)?.vote_type;
  const counts = { must_do: 0, interested: 0, skip: 0 };
  for (const v of votes) counts[v.vote_type]++;

  const isLocked = locked || false;
  const hasVote = !!myVote;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      className={`relative rounded-2xl border transition-all duration-200 overflow-hidden group ${
        isLocked
          ? "premium-card opacity-50 pointer-events-none"
          : hasVote
          ? "premium-card ring-1 ring-primary/20"
          : "premium-card hover:ring-1 hover:ring-primary/30"
      }`}
    >
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300" style={{
        background: 'radial-gradient(circle at var(--mouse-x, 50%) var(--mouse-y, 50%), rgba(124, 58, 237, 0.05), transparent)',
      }} />

      <div className="relative p-5">
        {myVote && (
          <span className={`absolute left-0 top-0 h-full w-1 rounded-r ${myVote === "must_do" ? "bg-gradient-to-b from-accent to-orange-500" : "bg-gradient-to-b from-primary to-purple-600"}`} />
        )}

        <div className="flex items-start gap-3 mb-3">
          <span className="text-2xl leading-none flex-shrink-0">{CATEGORY_EMOJI[activity.category] ?? "🗺️"}</span>
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-bold text-foreground">{activity.title}</h3>
            {activity.description && (
              <p className="line-clamp-2 text-xs text-muted-foreground mt-1">{activity.description}</p>
            )}
          </div>
        </div>

        <div className="mt-3 mb-4">
          {activity.is_ai_suggested ? (
            activity.ai_insight && (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-accent/20 to-orange-500/20 px-3 py-1 text-[11px] font-semibold text-accent border border-accent/30">
                ✨ {activity.ai_insight}
              </span>
            )
          ) : (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-primary/20 to-purple-600/20 px-3 py-1 text-[11px] font-semibold text-primary border border-primary/30">
              ✦ Added by {addedByName ?? "Member"}
            </span>
          )}
        </div>

        <div className="grid grid-cols-3 gap-2">
          {(["must_do","interested","skip"] as const).map((t) => {
            const meta = VOTE_META[t];
            const active = myVote === t;
            return (
              <motion.button
                key={t}
                type="button"
                disabled={isLocked}
                onClick={() => onVote(t)}
                animate={{ scale: active ? 1.0 : 1 }}
                whileTap={{ scale: 1.05 }}
                transition={{ type: "spring", stiffness: 350, damping: 18 }}
                className={`flex items-center justify-center gap-1.5 rounded-lg border font-medium text-xs py-2 px-2 transition-all duration-150 ${active ? meta.active : meta.soft}`}
              >
                <span className="text-base">{meta.emoji}</span>
                <span className="font-bold">{counts[t]}</span>
              </motion.button>
            );
          })}
        </div>
      </div>
    </motion.div>
  );
}

export function MemberAvatar({ name, idx }: { name: string; idx: number }) {
  return (
    <motion.div
      whileHover={{ scale: 1.1 }}
      className={`grid h-8 w-8 place-items-center rounded-full text-xs font-bold text-white ring-2 ring-white shadow-lg cursor-pointer transition-all ${colorForUser(name, idx)}`}
      title={name}
    >
      {initials(name)}
    </motion.div>
  );
}
