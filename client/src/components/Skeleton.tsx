export function Skeleton({ w = "100%", h = 16, r = 6 }: { w?: string | number; h?: number; r?: number }) {
  return <span className="skeleton" style={{ width: w, height: h, borderRadius: r }} />;
}

export function SkeletonRows({ rows = 4 }: { rows?: number }) {
  return (
    <div className="skeleton-rows">
      {Array.from({ length: rows }).map((_, i) => (
        <div className="skeleton-row" key={i}>
          <Skeleton w={38} h={38} r={10} />
          <div className="skeleton-row__lines">
            <Skeleton w="55%" h={13} />
            <Skeleton w="80%" h={11} />
          </div>
        </div>
      ))}
    </div>
  );
}