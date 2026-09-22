import Image from "next/image";

/**
 * 언어별 랜드마크 실사 사진 (Unsplash).
 * .themed-photo 를 가진 요소 안에 넣으면 배경으로 깔리고,
 * 그 위에 계열색 스크림이 덮여 글자 가독성이 유지된다.
 */
export default function LandmarkPhoto({
  src,
  alt,
  priority = false,
  sizes = "100vw",
}: {
  src: string;
  alt: string;
  priority?: boolean;
  sizes?: string;
}) {
  if (!src) return null;

  return (
    <div className="themed-photo__media" aria-hidden="true">
      <Image src={src} alt={alt} fill priority={priority} sizes={sizes} />
    </div>
  );
}
