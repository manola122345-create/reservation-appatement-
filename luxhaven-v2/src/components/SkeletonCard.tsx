export default function SkeletonCard() {
  return (
    <div className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm animate-pulse">
      <div className="h-52 bg-slate-200" />
      <div className="p-5 space-y-3">
        <div className="h-5 w-3/4 rounded-lg bg-slate-200" />
        <div className="h-4 w-1/2 rounded-lg bg-slate-200" />
        <div className="flex gap-2">
          <div className="h-3 w-12 rounded bg-slate-200" />
          <div className="h-3 w-12 rounded bg-slate-200" />
          <div className="h-3 w-16 rounded bg-slate-200" />
        </div>
        <div className="h-3 w-1/3 rounded bg-slate-200" />
        <div className="mt-4 flex items-center justify-between">
          <div className="h-5 w-24 rounded-lg bg-slate-200" />
          <div className="h-7 w-20 rounded-full bg-slate-200" />
        </div>
      </div>
    </div>
  )
}
