import type { Metadata } from "next";
import "./globals.css";
import SiteHeader from "@/components/site-header";
import SiteFooter from "@/components/site-footer";

export const metadata: Metadata = {
  title: {
    default: "Dominic Class — 외국어 수강 쇼핑몰",
    template: "%s | Dominic Class",
  },
  description:
    "영어·일본어·스페인어·중국어를 초급·중급·고급으로. 문법 / 회화 / OPIc 시험반. 주 3회 월·수·금 1시간 또는 토요일 전일제 3시간 연속 수업.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Nanum+Gothic:wght@400;700;800&family=Noto+Color+Emoji&family=Noto+Serif+JP:wght@400;700&family=Noto+Serif+SC:wght@400;700&family=Oswald:wght@500;700&family=Playfair+Display:ital,wght@0,700;1,600&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="flex min-h-screen flex-col">
        <SiteHeader />
        <main className="flex-1">{children}</main>
        <SiteFooter />
      </body>
    </html>
  );
}
