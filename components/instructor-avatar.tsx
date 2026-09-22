"use client";

import { useState } from "react";

export default function InstructorAvatar({
  url,
  emoji,
  name,
  size = 56,
}: {
  url: string | null;
  emoji: string;
  name: string;
  size?: number;
}) {
  const [failed, setFailed] = useState(false);

  if (!url || failed) {
    return (
      <div
        aria-label={name}
        className="grid shrink-0 place-items-center rounded-full bg-[var(--surface-2)] ring-1 ring-black/5"
        style={{ width: size, height: size, fontSize: size * 0.5 }}
      >
        {emoji}
      </div>
    );
  }

  return (
    // DiceBear가 내려주는 SVG라 next/image 최적화 대상이 아니다. 로드 실패 시 이모지로 대체한다.
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={url}
      alt={name}
      width={size}
      height={size}
      onError={() => setFailed(true)}
      className="shrink-0 rounded-full bg-white object-cover ring-1 ring-black/5"
      style={{ width: size, height: size }}
    />
  );
}
