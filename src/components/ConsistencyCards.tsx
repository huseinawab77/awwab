import type { habitConsistency } from "@/lib/score";

type Result = ReturnType<typeof habitConsistency>;
type Stat = NonNullable<Result["best"]>;

/** Side-by-side cards: the daily habit done most often, and the one missed most often, in this period. */
export function ConsistencyCards({ best, worst }: Result) {
  return (
    <div className="grid grid-cols-2 gap-3">
      <StatCard title="Paling konsisten" tint="bg-mint" ink="text-mint-ink" stat={best} />
      <StatCard title="Paling sering bolong" tint="bg-peach" ink="text-tangerine-ink" stat={worst} />
    </div>
  );
}

function StatCard({ title, tint, ink, stat }: { title: string; tint: string; ink: string; stat: Stat | null }) {
  return (
    <section aria-label={title} className={`flex min-h-[128px] flex-col gap-1.5 rounded-panel p-4 ${tint}`}>
      <h2 className={`text-[13px] font-extrabold ${ink}`}>{title}</h2>
      {stat ? (
        <>
          <p className="font-display text-lg font-bold leading-snug">{stat.habit.name}</p>
          <p className="tabular mt-auto text-sm font-bold text-plum-soft">
            {stat.done} dari {stat.of} hari
          </p>
        </>
      ) : (
        <p className="text-sm font-semibold text-plum-soft">Belum cukup data</p>
      )}
    </section>
  );
}
