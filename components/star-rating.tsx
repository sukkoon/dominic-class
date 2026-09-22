/** 별점 표시 (읽기 전용). 0.5 단위로 반쯤 채워 보여준다. */
export default function StarRating({
  value,
  size = "sm",
  showValue = false,
}: {
  value: number;
  size?: "sm" | "md";
  showValue?: boolean;
}) {
  const px = size === "md" ? 18 : 14;

  return (
    <span className="inline-flex items-center gap-1" aria-label={`5점 만점에 ${value}점`}>
      <span className="star-rating" style={{ fontSize: px }} aria-hidden="true">
        <span className="star-rating__off">★★★★★</span>
        <span className="star-rating__on" style={{ width: (value / 5) * 100 + "%" }}>
          ★★★★★
        </span>
      </span>
      {showValue ? (
        <span className="text-sm font-bold">{value > 0 ? value.toFixed(1) : "-"}</span>
      ) : null}
    </span>
  );
}
