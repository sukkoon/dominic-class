const ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

/** 토스 orderId 규격: 6~64자, 영문/숫자/-/_ */
export function makeOrderCode(now = new Date()): string {
  const kst = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Seoul",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  })
    .format(now)
    .replace(/-/g, "");

  const bytes = new Uint8Array(8);
  crypto.getRandomValues(bytes);
  const rand = Array.from(bytes, (b) => ALPHABET[b % ALPHABET.length]).join("");

  return `DC-${kst}-${rand}`;
}
