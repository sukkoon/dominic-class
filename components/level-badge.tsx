import type { Level } from "@/lib/types";

/**
 * 레벨 뱃지. 옆의 미터가 초급 1칸 → 중급 2칸 → 고급 3칸으로 차올라
 * 색 명도 계단(옅음 → 짙음)과 같은 정보를 한 번 더 보여준다.
 */
export default function LevelBadge({
  level,
  tone = "plain",
}: {
  level: Level;
  tone?: "plain" | "onBrand";
}) {
  const filled = level.sort_order;

  return (
    <span className={tone === "onBrand" ? "chip chip-on-brand" : "chip chip-level"}>
      <span className="level-meter" aria-hidden="true">
        {[1, 2, 3].map((i) => (
          <i key={i} data-on={i <= filled ? "" : undefined} />
        ))}
      </span>
      {level.name_ko}
    </span>
  );
}
