"use client";

import { useEffect, useRef, useState } from "react";
import type { CourseSample } from "@/lib/types";

/**
 * 15초 샘플 강의.
 * media_url 에 녹음/영상 파일이 있으면 그걸 재생하고,
 * 없으면 브라우저 음성 합성(Web Speech API)으로 해당 언어 문장을 읽어 준다.
 */
export default function SamplePlayer({
  sample,
  speechLang,
  languageName,
}: {
  sample: CourseSample;
  speechLang: string;
  languageName: string;
}) {
  const [supported, setSupported] = useState<boolean | null>(null);
  const [playing, setPlaying] = useState(false);
  const [current, setCurrent] = useState(-1);
  const cancelledRef = useRef(false);

  useEffect(() => {
    setSupported(typeof window !== "undefined" && "speechSynthesis" in window);
    return () => {
      if (typeof window !== "undefined" && "speechSynthesis" in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  function speak(text: string): Promise<void> {
    return new Promise((resolve) => {
      const u = new SpeechSynthesisUtterance(text);
      u.lang = speechLang || "en-US";
      u.rate = 0.92;
      u.onend = () => resolve();
      u.onerror = () => resolve();
      window.speechSynthesis.speak(u);
    });
  }

  async function play() {
    if (!("speechSynthesis" in window)) return;
    cancelledRef.current = false;
    window.speechSynthesis.cancel();
    setPlaying(true);

    for (let i = 0; i < sample.script_native.length; i++) {
      if (cancelledRef.current) break;
      setCurrent(i);
      await speak(sample.script_native[i]);
      if (cancelledRef.current) break;
      await new Promise((r) => setTimeout(r, 350));
    }

    setPlaying(false);
    setCurrent(-1);
  }

  function stop() {
    cancelledRef.current = true;
    window.speechSynthesis.cancel();
    setPlaying(false);
    setCurrent(-1);
  }

  // 실제 파일이 올라와 있으면 그것을 우선 재생한다.
  if (sample.media_url) {
    return (
      <div>
        <p className="text-sm font-bold">{sample.headline_ko}</p>
        {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
        <audio src={sample.media_url} controls className="mt-3 w-full" />
        <ScriptList sample={sample} current={-1} />
      </div>
    );
  }

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm font-bold">{sample.headline_ko}</p>
        <span className="chip">약 {sample.duration_seconds}초</span>
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={playing ? stop : play}
          disabled={supported === false}
          className="btn btn-primary !px-5 !py-2.5 !text-sm"
        >
          {playing ? "■ 정지" : "▶ 15초 맛보기 듣기"}
        </button>
        <span className="text-xs text-[var(--muted)]">
          {supported === false
            ? "이 브라우저는 음성 재생을 지원하지 않습니다. 아래 스크립트를 읽어보세요."
            : `${languageName} 원어 발음으로 읽어 드립니다`}
        </span>
      </div>

      <ScriptList sample={sample} current={current} />
    </div>
  );
}

function ScriptList({ sample, current }: { sample: CourseSample; current: number }) {
  return (
    <ol className="mt-4 space-y-2">
      {sample.script_native.map((line, i) => (
        <li
          key={line}
          className={
            "rounded-lg border p-3 transition " +
            (current === i
              ? "border-[var(--accent)] bg-[color-mix(in_srgb,var(--accent)_10%,transparent)]"
              : "border-[var(--border)] bg-[var(--surface-2)]")
          }
        >
          <p className="display-native text-base font-bold">{line}</p>
          <p className="mt-1 text-sm text-[var(--muted)]">{sample.script_ko[i]}</p>
        </li>
      ))}
    </ol>
  );
}
