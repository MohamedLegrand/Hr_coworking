export default function SqueletteCarteEspace() {
  return (
    <div className="overflow-hidden rounded-2xl border border-ligne bg-white">
      <div className="aspect-[4/3] animate-pulse bg-lavande" />
      <div className="p-5">
        <div className="h-3 w-1/3 animate-pulse rounded bg-lavande" />
        <div className="mt-3.5 h-5 w-4/5 animate-pulse rounded bg-lavande [animation-delay:100ms]" />
        <div className="mt-3 h-3 w-1/2 animate-pulse rounded bg-lavande [animation-delay:200ms]" />
        <div className="my-4 h-px bg-ligne" />
        <div className="flex items-center justify-between">
          <div className="h-6 w-24 animate-pulse rounded bg-lavande" />
          <div className="h-9 w-28 animate-pulse rounded-md bg-lavande [animation-delay:150ms]" />
        </div>
      </div>
    </div>
  )
}
