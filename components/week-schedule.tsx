const DAYS = ["월", "화", "수", "목", "금", "토", "일"];

/**
 * 주간 수업 일정 그리드.
 * 수업이 있는 요일을 강조하고, 그 요일에 몇 교시가 있는지 막대로 보여준다.
 * 월·수·금은 하루 1칸, 토요일 전일제는 하루 3칸이 찬다.
 */
export default function WeekSchedule({
  daysOfWeek,
  periodsPerDay,
  maxPeriods = 3,
}: {
  daysOfWeek: number[];
  periodsPerDay: number;
  maxPeriods?: number;
}) {
  return (
    <div className="week-grid" role="img" aria-label={`수업 요일 ${daysOfWeek.length}일, 하루 ${periodsPerDay}교시`}>
      {DAYS.map((label, idx) => {
        const iso = idx + 1;
        const on = daysOfWeek.includes(iso);
        return (
          <div key={label} className="week-cell" data-on={on ? "" : undefined}>
            <span className="week-day">{label}</span>
            <div className="week-slots">
              {Array.from({ length: maxPeriods }, (_, i) => (
                <span
                  key={i}
                  className="week-slot"
                  data-filled={on && i < periodsPerDay ? "" : undefined}
                />
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
