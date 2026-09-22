-- ============================================================================
-- Dominic Class 시드 데이터
--   언어 4 / 레벨 3 / 유형 3 / 강사 36 / 강의 36 / 트랙 72 / 차시 432 / 숙제 864
--
-- 432개 차시와 864개 숙제는 손으로 쓰지 않고,
--   · 유형×레벨 주제 축 108개 문자열
--   · 언어×레벨 학습 포인트 축 144개 문자열
-- 을 SQL에서 합성해 생성한다.
--
-- 모든 INSERT가 on conflict do nothing 이므로 여러 번 실행해도 안전하다.
-- ============================================================================

insert into public.dc_languages
 (code,name_ko,name_native,flag_emoji,flag_emoji_alt,country_code,country_name_ko,
  theme_key,theme_mood_ko,hero_color,accent_color,ink_color,pattern_key,font_key,tagline_ko,sort_order) values
-- hero_color / accent_color / ink_color / pattern_key / font_key 는 참고값이다.
-- 실제 렌더링 색과 서체, 모티프는 app/globals.css 의 [data-lang] 토큰이 담당한다.
 ('en','영어','English','🇺🇸',null,'US','미국','brooklyn','뉴욕의 코발트 블루와 성조기 레드',
  '#1D56B8','#EF3B4E','#F3F7FF','star','oswald','세계 어디서든 통하는 무기, 영어',1),
 ('ja','일본어','日本語','🇯🇵',null,'JP','일본','sakura','벚꽃빛 로즈와 남색 藍의 대비',
  '#C9456C','#3A5EA8','#FFF5F7','seigaiha','notoserifjp','가장 가까운 나라, 가장 섬세한 언어',2),
 ('es','스페인어','Español','🇪🇸',null,'ES','스페인','andalusia','안달루시아의 사프란빛 태양',
  '#B5620A','#E03131','#FFF8EE','arch','playfair','21개국 5억 명이 쓰는 뜨거운 언어',3),
 ('zh','중국어','中文','🇨🇳',null,'CN','중국','shanghai','상하이의 홍(紅)과 금(金)',
  '#C81E2B','#F0B429','#FFF5F2','moongate','notoserifsc','가장 큰 시장을 여는 열쇠, 중국어',4)
on conflict (code) do nothing;

insert into public.dc_levels (code,name_ko,price_krw,instructor_rule_ko,summary_ko,badge_emoji,sort_order) values
 ('beginner','초급',90000,'한국인 선생님','문자와 발음부터 한국어로 차근차근. 처음 배우는 분께 딱 맞는 과정입니다.','🌱',1),
 ('intermediate','중급',120000,'한국어·현지어 모두 능통한 선생님','설명은 한국어로, 연습은 현지어로. 막힘 없이 넘어가는 중급 과정입니다.','🔥',2),
 ('advanced','고급',150000,'현지 원어민 강사 전담','수업 전체가 현지어. 원어민 강사와 실전 감각을 완성합니다.','👑',3)
on conflict (code) do nothing;

insert into public.dc_class_types (code,name_ko,tagline_ko,summary_ko,icon_emoji,sort_order) values
 ('grammar','문법','기초부터 탄탄하게','규칙을 이해하고 문장을 스스로 만들어 내는 힘을 기릅니다.','📐',1),
 ('conversation','회화','입이 트이는 실전 대화','현지 상황극과 1:1 스피킹으로 말하기 근육을 만듭니다.','💬',2),
 ('exam','시험','OPIc 대비','모든 시험 클래스는 OPIc 기준으로 설계된 실전 대비 과정입니다.','🎯',3)
on conflict (code) do nothing;

insert into public.dc_instructors
 (language_code,level_code,class_type_code,name_ko,name_native,nationality,nationality_ko,is_native,speaks_korean,
  avatar_url,avatar_emoji,headline_ko,bio_ko,years_experience) values
 ('en','beginner','grammar','김서연',null,'KR','한국',false,true,
  'https://api.dicebear.com/9.x/notionists/svg?seed=en-beginner&backgroundColor=ffd5dc','👩‍🏫',
  '영문학 전공 · 왕초보 전문','알파벳도 낯선 분들을 위해 모든 설명을 한국어로 드립니다. 한국인이 어려워하는 지점을 정확히 알고 짚어드려요.',8),
 ('en','intermediate','grammar','박준호',null,'KR','한국',false,true,
  'https://api.dicebear.com/9.x/notionists/svg?seed=en-intermediate&backgroundColor=c0aede','👨‍🏫',
  '시애틀 10년 거주 · 한영 이중언어','설명은 한국어로, 연습은 영어로. 두 언어를 오가며 중급의 벽을 넘겨드립니다.',10),
 ('en','advanced','grammar','마이클 카터','Michael Carter','US','미국',true,false,
  'https://api.dicebear.com/9.x/notionists/svg?seed=en-advanced&backgroundColor=d1d4f9','🧑‍🏫',
  '시카고 출신 원어민 · OPIc 코치','From day one, English only. 미국 현지 뉘앙스와 시험 전략을 동시에 잡아드립니다.',12),
 ('ja','beginner','grammar','이지훈',null,'KR','한국',false,true,
  'https://api.dicebear.com/9.x/notionists/svg?seed=ja-beginner&backgroundColor=ffdfbf','👨‍🏫',
  'JLPT N1 · 히라가나부터 친절하게','오십음도부터 시작합니다. 한국인에게 익숙한 한자 지식을 지렛대로 삼아 빠르게 올라갑니다.',7),
 ('ja','intermediate','grammar','최유리',null,'KR','한국',false,true,
  'https://api.dicebear.com/9.x/notionists/svg?seed=ja-intermediate&backgroundColor=ffd5dc','👩‍🏫',
  '오사카 8년 거주 · 한일 이중언어','경어와 보통체의 경계, 조사의 미묘한 차이를 한국어로 명쾌하게 정리해 드립니다.',9),
 ('ja','advanced','grammar','사토 미나미','佐藤 みなみ','JP','일본',true,false,
  'https://api.dicebear.com/9.x/notionists/svg?seed=ja-advanced&backgroundColor=c0aede','👩‍🏫',
  '도쿄 출신 원어민 · 비즈니스 일본어','授業はすべて日本語で。현지에서 실제로 쓰는 표현과 敬語를 몸에 익히도록 이끕니다.',11),
 ('es','beginner','grammar','정민아',null,'KR','한국',false,true,
  'https://api.dicebear.com/9.x/notionists/svg?seed=es-beginner&backgroundColor=d1d4f9','👩‍🏫',
  '서어서문학 전공 · 발음 교정 전문','스페인어는 읽는 대로 발음됩니다. 그 규칙부터 한국어로 확실하게 잡아드릴게요.',6),
 ('es','intermediate','grammar','한도윤',null,'KR','한국',false,true,
  'https://api.dicebear.com/9.x/notionists/svg?seed=es-intermediate&backgroundColor=ffdfbf','👨‍🏫',
  '마드리드 7년 거주 · 한서 이중언어','두 개의 과거 시제, 접속법. 중급의 고비를 한국어 설명으로 가볍게 넘깁니다.',8),
 ('es','advanced','grammar','카를로스 라미레스','Carlos Ramírez','MX','멕시코',true,false,
  'https://api.dicebear.com/9.x/notionists/svg?seed=es-advanced&backgroundColor=ffd5dc','🧑‍🏫',
  '멕시코시티 출신 원어민 · 중남미 스페인어','¡Solo español! 스페인과 중남미의 표현 차이까지 함께 익혀갑니다.',13),
 ('zh','beginner','grammar','오세진',null,'KR','한국',false,true,
  'https://api.dicebear.com/9.x/notionists/svg?seed=zh-beginner&backgroundColor=c0aede','👨‍🏫',
  'HSK 6급 · 성조부터 탄탄하게','중국어의 8할은 성조입니다. 한국어로 원리를 설명하고 입에 붙을 때까지 반복합니다.',7),
 ('zh','intermediate','grammar','배하늘',null,'KR','한국',false,true,
  'https://api.dicebear.com/9.x/notionists/svg?seed=zh-intermediate&backgroundColor=ffdfbf','👩‍🏫',
  '베이징 9년 거주 · 한중 이중언어','把구문과 보어, 한국어로 이해하고 중국어로 반복하면 어렵지 않습니다.',9),
 ('zh','advanced','grammar','왕메이','王梅','CN','중국',true,false,
  'https://api.dicebear.com/9.x/notionists/svg?seed=zh-advanced&backgroundColor=d1d4f9','👩‍🏫',
  '베이징 출신 원어민 · 표준 보통화','全程中文授课。표준 보통화 발음과 성어까지, 현지인처럼 말하도록 만들어 드립니다.',12)
on conflict (language_code, level_code, class_type_code) do nothing;


-- 회화 / 시험 담당 강사 24명 (초급 한국인 / 중급 이중언어 / 고급 원어민 규칙 동일)
insert into public.dc_instructors
 (language_code,level_code,class_type_code,name_ko,name_native,nationality,nationality_ko,
  is_native,speaks_korean,avatar_url,avatar_emoji,headline_ko,bio_ko,years_experience) values
 ('en','beginner','conversation','윤하늘',null,'KR','한국',false,true,
  'https://api.dicebear.com/9.x/notionists/svg?seed=en-beginner-conv&backgroundColor=b6e3f4','👩‍🏫',
  '첫 한마디를 떼는 수업','틀려도 괜찮다는 분위기를 먼저 만듭니다. 한 문장이라도 소리 내어 말하고 나가는 것이 목표예요.',6),
 ('en','beginner','exam','장서우',null,'KR','한국',false,true,
  'https://api.dicebear.com/9.x/notionists/svg?seed=en-beginner-exam&backgroundColor=ffd5dc','👨‍🏫',
  'OPIc IM 첫 도전 전문','시험이 처음이라면 배경설문부터 같이 짭니다. 외울 문장을 최소로 줄여 드려요.',7),
 ('en','intermediate','conversation','강예린',null,'KR','한국',false,true,
  'https://api.dicebear.com/9.x/notionists/svg?seed=en-intermediate-conv&backgroundColor=c0aede','👩‍🏫',
  '밴쿠버 6년 · 프리토킹 진입','할 말이 떠오르는데 입이 안 떨어지는 구간을 집중적으로 뚫어 드립니다.',8),
 ('en','intermediate','exam','조민혁',null,'KR','한국',false,true,
  'https://api.dicebear.com/9.x/notionists/svg?seed=en-intermediate-exam&backgroundColor=ffdfbf','👨‍🏫',
  'OPIc IH 공략 · 롤플레이 전문','11~13번 롤플레이에서 점수가 갈립니다. 상황별 대응 틀을 몸에 붙여 드립니다.',9),
 ('en','advanced','conversation','에밀리 브룩스','Emily Brooks','US','미국',true,false,
  'https://api.dicebear.com/9.x/notionists/svg?seed=en-advanced-conv&backgroundColor=d1d4f9','👩‍🏫',
  '보스턴 출신 원어민 · 토론과 발표','Let us argue, not recite. 근거를 세워 말하는 훈련을 English only로 진행합니다.',10),
 ('en','advanced','exam','다니엘 리브스','Daniel Reeves','US','미국',true,false,
  'https://api.dicebear.com/9.x/notionists/svg?seed=en-advanced-exam&backgroundColor=b6e3f4','🧑‍🏫',
  '시애틀 출신 원어민 · OPIc AL 전략','AL은 어휘가 아니라 구조입니다. 답변 설계부터 자기 수정까지 다듬습니다.',11),
 ('ja','beginner','conversation','노아린',null,'KR','한국',false,true,
  'https://api.dicebear.com/9.x/notionists/svg?seed=ja-beginner-conv&backgroundColor=ffd5dc','👩‍🏫',
  '첫 인사부터 또박또박','です·ます체로 인사하고 주문하는 것부터. 발음은 한국어와 비교해 짚어 드립니다.',6),
 ('ja','beginner','exam','백건우',null,'KR','한국',false,true,
  'https://api.dicebear.com/9.x/notionists/svg?seed=ja-beginner-exam&backgroundColor=c0aede','👨‍🏫',
  'OPIc 일본어 IM 입문','30초 자기소개 템플릿 하나로 시작합니다. 문장 재활용법을 알려 드려요.',7),
 ('ja','intermediate','conversation','홍세아',null,'KR','한국',false,true,
  'https://api.dicebear.com/9.x/notionists/svg?seed=ja-intermediate-conv&backgroundColor=ffdfbf','👩‍🏫',
  '교토 6년 · 반말과 경어 사이','상대에 따라 말투를 바꾸는 감각을 실제 대화로 익힙니다.',8),
 ('ja','intermediate','exam','구본영',null,'KR','한국',false,true,
  'https://api.dicebear.com/9.x/notionists/svg?seed=ja-intermediate-exam&backgroundColor=d1d4f9','👨‍🏫',
  'OPIc 일본어 IH 공략','돌발 질문에서 말이 끊기지 않게 연결어와 시간 벌기 표현을 훈련합니다.',9),
 ('ja','advanced','conversation','다나카 유타','田中 悠太','JP','일본',true,false,
  'https://api.dicebear.com/9.x/notionists/svg?seed=ja-advanced-conv&backgroundColor=b6e3f4','🧑‍🏫',
  '오사카 출신 원어민 · 회의와 발표','会議でそのまま使える日本語。완곡 표현과 뉘앙스를 실전으로 다룹니다.',10),
 ('ja','advanced','exam','기무라 아오이','木村 あおい','JP','일본',true,false,
  'https://api.dicebear.com/9.x/notionists/svg?seed=ja-advanced-exam&backgroundColor=ffd5dc','👩‍🏫',
  '요코하마 출신 원어민 · AL 전략','추상적인 주제도 구조를 잡으면 말할 수 있습니다. 그 틀을 만들어 드립니다.',11),
 ('es','beginner','conversation','서지우',null,'KR','한국',false,true,
  'https://api.dicebear.com/9.x/notionists/svg?seed=es-beginner-conv&backgroundColor=ffdfbf','👩‍🏫',
  '¡Hola! 부터 편하게','스페인어는 읽는 대로 발음되니 첫 대화가 빠릅니다. 바로 말하게 만들어 드려요.',5),
 ('es','beginner','exam','문태윤',null,'KR','한국',false,true,
  'https://api.dicebear.com/9.x/notionists/svg?seed=es-beginner-exam&backgroundColor=b6e3f4','👨‍🏫',
  'OPIc 스페인어 IM 입문','응시자가 적은 언어일수록 전략이 통합니다. 출제 범위를 좁혀 드립니다.',6),
 ('es','intermediate','conversation','남유진',null,'KR','한국',false,true,
  'https://api.dicebear.com/9.x/notionists/svg?seed=es-intermediate-conv&backgroundColor=c0aede','👩‍🏫',
  '바르셀로나 5년 · 생활 회화','현지에서 진짜 쓰는 표현만 골라 옵니다. 교재에 없는 말들이요.',7),
 ('es','intermediate','exam','심우재',null,'KR','한국',false,true,
  'https://api.dicebear.com/9.x/notionists/svg?seed=es-intermediate-exam&backgroundColor=ffd5dc','👨‍🏫',
  'OPIc 스페인어 IH 공략','두 과거 시제를 시험에서 어떻게 쓰는지가 관건입니다. 그 지점만 팝니다.',8),
 ('es','advanced','conversation','루시아 페르난데스','Lucía Fernández','ES','스페인',true,false,
  'https://api.dicebear.com/9.x/notionists/svg?seed=es-advanced-conv&backgroundColor=d1d4f9','👩‍🏫',
  '세비야 출신 원어민 · 토론 회화','¡Sin miedo! 안달루시아 억양까지 들려드리며 실전 토론을 합니다.',12),
 ('es','advanced','exam','하비에르 모랄레스','Javier Morales','ES','스페인',true,false,
  'https://api.dicebear.com/9.x/notionists/svg?seed=es-advanced-exam&backgroundColor=ffdfbf','🧑‍🏫',
  '마드리드 출신 원어민 · AL 전략','접속법을 자연스럽게 쓰면 등급이 올라갑니다. 그 감각을 만들어 드립니다.',11),
 ('zh','beginner','conversation','임다온',null,'KR','한국',false,true,
  'https://api.dicebear.com/9.x/notionists/svg?seed=zh-beginner-conv&backgroundColor=b6e3f4','👩‍🏫',
  '성조부터 입으로','눈으로 보는 대신 입으로 외웁니다. 짧은 문장을 소리로 반복해 성조를 몸에 붙입니다.',6),
 ('zh','beginner','exam','신재호',null,'KR','한국',false,true,
  'https://api.dicebear.com/9.x/notionists/svg?seed=zh-beginner-exam&backgroundColor=ffd5dc','👨‍🏫',
  'OPIc 중국어 IM 입문','성조가 흔들리면 점수가 흔들립니다. 답변 문장부터 성조로 잡습니다.',7),
 ('zh','intermediate','conversation','고은별',null,'KR','한국',false,true,
  'https://api.dicebear.com/9.x/notionists/svg?seed=zh-intermediate-conv&backgroundColor=c0aede','👩‍🏫',
  '상하이 6년 · 실전 회화','교과서 중국어와 현지 중국어의 차이를 매 시간 알려 드립니다.',8),
 ('zh','intermediate','exam','류정한',null,'KR','한국',false,true,
  'https://api.dicebear.com/9.x/notionists/svg?seed=zh-intermediate-exam&backgroundColor=ffdfbf','👨‍🏫',
  'OPIc 중국어 IH 공략','把구문과 보어를 시험 답변에 넣는 법을 집중적으로 다룹니다.',9),
 ('zh','advanced','conversation','리웨이','李伟','CN','중국',true,false,
  'https://api.dicebear.com/9.x/notionists/svg?seed=zh-advanced-conv&backgroundColor=d1d4f9','🧑‍🏫',
  '상하이 출신 원어민 · 비즈니스 회화','全程中文。협상과 미팅에서 쓰는 표현을 실제 상황극으로 익힙니다.',10),
 ('zh','advanced','exam','장샤오위','张小雨','CN','중국',true,false,
  'https://api.dicebear.com/9.x/notionists/svg?seed=zh-advanced-exam&backgroundColor=b6e3f4','👩‍🏫',
  '베이징 출신 원어민 · AL 전략','성어를 한두 개만 제대로 쓰면 인상이 달라집니다. 그 선택을 도와 드립니다.',11)
on conflict (language_code, level_code, class_type_code) do nothing;

-- 강의 36개 = 4 x 3 x 3
insert into public.dc_courses
 (slug,language_code,level_code,class_type_code,instructor_id,title_ko,subtitle_ko,description_ko,
  price_krw,highlights,sort_order)
select lg.code || '-' || lv.code || '-' || ct.code,
       lg.code, lv.code, ct.code, ins.id,
       lg.name_ko || ' ' || lv.name_ko || ' ' || ct.name_ko,
       lg.name_ko || ' ' || lv.name_ko || ' 학습자를 위한 ' || ct.name_ko || ' 집중 클래스',
       ins.name_ko || ' 강사와 함께하는 ' || lg.name_ko || ' ' || lv.name_ko || ' ' || ct.name_ko ||
       ' 과정입니다. 월 12차시(총 12시간) 커리큘럼으로, 주 3회 월·수·금 1시간 수업 또는 토요일 전일제 3시간 연속 수업 중 원하는 일정을 고를 수 있습니다. ' ||
       case ct.code
         when 'exam' then '시험 클래스는 전 언어 공통으로 OPIc 기준에 맞춰 설계되었습니다. '
         when 'grammar' then '규칙을 외우는 대신 스스로 문장을 만들어 보는 방식으로 진행합니다. '
         else '매 차시 절반 이상을 학생이 직접 말하는 시간으로 채웁니다. ' end ||
       '차시마다 강사가 숙제를 내고, 마이페이지에서 진도와 숙제 완료 여부를 확인할 수 있습니다.',
       lv.price_krw,
       array[ct.tagline_ko, lv.instructor_rule_ko, '월 12차시 · 총 12시간', '차시별 숙제 + 진도 관리'],
       (lv.sort_order * 10 + ct.sort_order)::smallint
  from public.dc_languages lg
  cross join public.dc_levels lv
  cross join public.dc_class_types ct
  join public.dc_instructors ins
    on ins.language_code = lg.code and ins.level_code = lv.code and ins.class_type_code = ct.code
on conflict (slug) do nothing;

-- 트랙 72개 (강의당 월수금 / 토요일 전일제)
insert into public.dc_schedule_tracks
 (course_id,track_type,label_ko,days_label_ko,time_label_ko,days_of_week,start_time,end_time,
  hours_per_day,periods_per_day,days_per_month)
select c.id,'MWF'::public.dc_track_type,'주 3회 · 월·수·금 (1시간)','월·수·금','19:00 ~ 20:00',
       '{1,3,5}'::smallint[], time '19:00', time '20:00', 1.0, 1::smallint, 12::smallint
  from public.dc_courses c
union all
select c.id,'SAT'::public.dc_track_type,'토요일 전일제 · 3시간 연속','토요일','10:00 ~ 13:00 (3교시 연속)',
       '{6}'::smallint[], time '10:00', time '13:00', 3.0, 3::smallint, 4::smallint
  from public.dc_courses c
on conflict (course_id, track_type) do nothing;

-- 차시 432개 = 36강의 x 12차시 (주제 축 + 언어 포인트 축 합성)
with topics(class_type_code, level_code, arr) as (values
 ('grammar','beginner', array['문자와 발음 익히기','기본 어순과 인칭 대명사','이것·저것 지시 표현','현재 시제로 말하기','의문문 만들기','부정문 만들기','수와 날짜 표현','위치와 장소 표현','형용사로 묘사하기','과거 시제 첫걸음','미래 계획 말하기','초급 문법 총정리']),
 ('grammar','intermediate', array['시제 체계 한눈에 정리','과거와 완료 구분하기','관계절로 문장 확장하기','수동태와 능동태','조건문과 가정 표현','접속사로 논리 연결하기','간접화법 전환','비교와 최상 표현','사역과 지각 구문','명사절과 부사절','자주 틀리는 문법 클리닉','중급 문법 실전 점검']),
 ('grammar','advanced', array['가정법과 시제 일치','문어체 접속 표현','도치와 강조 구문','분사구문 자유자재로','관용적 전치사 용법','담화 표지와 응집성','뉘앙스를 바꾸는 서법','격식과 비격식 레지스터','장문 구조 분석','에세이 문장 다듬기','원어민이 쓰는 생략 구문','고급 문법 통합 리뷰']),
 ('conversation','beginner', array['인사와 자기소개','숫자와 시간 말하기','카페에서 주문하기','길 묻고 답하기','쇼핑과 가격 묻기','취미와 좋아하는 것','가족과 친구 소개','날씨와 계절 이야기','식당에서 주문하기','교통수단 이용하기','전화로 약속 잡기','초급 회화 롤플레이 데이']),
 ('conversation','intermediate', array['주말과 여가 이야기','직장과 업무 소개','여행 경험 나누기','감정과 의견 표현하기','문제 상황 설명하고 도움 요청','초대하고 정중히 거절하기','전화와 이메일 응대','건강과 병원 대화','문화 차이 이야기하기','인터넷과 SNS 주제 토크','인터뷰 형식 질의응답','중급 회화 프리토킹 데이']),
 ('conversation','advanced', array['시사 이슈 토론','찬반 논증 펼치기','협상과 설득의 기술','발표와 Q&A 대응','유머와 뉘앙스 살리기','비즈니스 미팅 진행','갈등 조정과 중재','스토리텔링으로 몰입시키기','추상적 주제 논평','인터뷰어 되어보기','즉흥 스피치 훈련','고급 회화 실전 세미나']),
 ('exam','beginner', array['OPIc 시험 구조와 배경설문 설계','IM 목표 전략 세우기','자기소개 30초 템플릿','우리 집 묘사하기','동네와 지역 소개','취미 활동 설명하기','하루 일과 말하기','좋아하는 장소 설명','간단한 경험 이야기','기초 롤플레이 대응','모의고사 1회 체험','IM 등급 최종 점검']),
 ('exam','intermediate', array['IH 목표 전략과 시간 배분','배경설문 최적 조합 만들기','묘사와 설명 콤보 답변','과거 경험 3단 구성','롤플레이 11~13번 공략','문제 상황 해결 응답','비교와 변화 설명하기','돌발 질문 대처법','연결어로 답변 늘리기','발음과 억양 교정 클리닉','실전 모의고사 2회','IH 등급 최종 점검']),
 ('exam','advanced', array['AL 등급 채점 기준 해부','고급 어휘와 표현 업그레이드','추상 주제 의견 전개','사회 이슈 논평하기','가정 상황 상세 묘사','롤플레이 고난도 변주','답변 구조화 템플릿 완성','자연스러운 자기 수정 기술','유창성과 정확성 균형 잡기','원어민 톤 스피치 연습','실전 모의고사 3회','AL 등급 최종 점검'])
), points(language_code, level_code, arr) as (values
 ('en','beginner', array['be동사','일반동사 현재형','관사 a/an/the','명사의 복수형','인칭대명사 I·you·he','의문사 wh-','조동사 can','전치사 in·on·at','형용사 어순','과거형 -ed','be going to','초급 필수 어휘 300']),
 ('en','intermediate', array['현재완료','과거완료','관계대명사 who·which','수동태','조건문 1형과 2형','접속사 although·while','간접화법','비교급과 최상급','사역동사 make·let','to부정사와 동명사','자주 틀리는 전치사','중급 필수 어휘 800']),
 ('en','advanced', array['가정법 과거완료','도치 구문','분사구문','it-cleft 강조 구문','구동사 뉘앙스','담화 표지 however·nonetheless','서법 조동사 뉘앙스','격식체 어휘 선택','명사화 표현','고빈도 콜로케이션','축약과 생략','고급 어휘 1500']),
 ('ja','beginner', array['히라가나와 가타카나','です·ます체','조사 は와 が','조사 を·に·で','지시어 これ·それ·あれ','い형용사와 な형용사','수사와 조수사','동사 ます형','과거형 ました','부정형 ません','て형 기초','초급 한자 100']),
 ('ja','intermediate', array['보통체(반말) 전환','동사 て형 활용','가능형','의지형과 의뢰 표현','조건 と·ば·たら·なら','수수 표현 あげる·くれる·もらう','경어 기초','수동형과 사역형','명사 수식절','접속 표현','자동사와 타동사 쌍','중급 한자 500']),
 ('ja','advanced', array['경어 3종 완전 정리','사역수동','문어체 표현','뉘앙스 조사 さえ·こそ','관용구와 사자성어','敬体와 常体 전환','완곡 표현','논설문 접속사','비즈니스 경어','구어 축약 표현','미묘한 뉘앙스 차이','고급 한자 1000']),
 ('es','beginner', array['알파벳과 발음 규칙','명사의 성과 수','관사 el·la·los·las','ser와 estar','규칙 동사 현재형','불규칙 동사 tener·ir','숫자와 시간','형용사 일치','gustar 구문','전치사 a·de·en','재귀동사 기초','초급 필수 어휘 300']),
 ('es','intermediate', array['단순과거 pretérito','불완료과거 imperfecto','두 과거 시제 구분','현재완료','미래와 조건법','직접·간접 목적격 대명사','명령형','접속법 현재 입문','por와 para','관계대명사 que·quien','비교 표현','중급 필수 어휘 800']),
 ('es','advanced', array['접속법 과거','si 조건문','양보와 가정 표현','관용 표현 modismos','스페인과 중남미 변이','문어체 접속사','수동 se 구문','완곡과 공손 표현','담화 표지','연어 colocaciones','서법 뉘앙스','고급 어휘 1500']),
 ('zh','beginner', array['성조와 병음','기본 어순 주술목','是 구문','有 구문','양사 个·本·杯','지시대명사 这·那','숫자와 날짜','의문사 什么·哪儿','구조조사 的','장소 표현 在','了의 기초 용법','초급 한자 300']),
 ('zh','intermediate', array['把 구문','被 피동문','결과보어와 방향보어','정도보어','比 비교문','연동문과 겸어문','了·着·过 구분','복문 접속사','이합동사','어기조사 呢·吧·吗','부사어 어순','중급 한자 800']),
 ('zh','advanced', array['성어(成语) 활용','서면어 표현','겸양과 존경 표현','복합 보어 구조','신문·논설 문체','구어 관용표현','어감 차이 분석','비즈니스 서신체','수사법과 대구','문언 잔재 표현','고급 접속 구조','고급 한자 1500'])
)
insert into public.dc_lessons (course_id, lesson_no, title_ko, objective_ko, content_ko, keywords)
select c.id,
       i::smallint,
       i || '강. ' || t.arr[i],
       '이번 차시에서는 「' || p.arr[i] || '」 포인트를 익히고, 「' || t.arr[i] || '」 과제를 스스로 수행합니다.',
       case c.class_type_code
         when 'grammar' then '오늘의 문법 포인트는 「' || p.arr[i] || '」입니다. 개념 설명 → 예문 20개 분석 → 즉석 작문 → 오류 교정 순서로 진행합니다.'
         when 'conversation' then '현지 상황극으로 시작해 「' || t.arr[i] || '」에 필요한 표현을 익힙니다. 핵심 포인트는 「' || p.arr[i] || '」이며, 수업 시간의 절반 이상을 직접 말하는 데 씁니다.'
         else 'OPIc 「' || t.arr[i] || '」 유형을 분석하고 나만의 모범 답변을 설계합니다. 실전 타이머 응답 후 「' || p.arr[i] || '」 중심으로 교정 피드백을 받습니다.'
       end,
       array[lg.name_ko, lv.name_ko, ct.name_ko, p.arr[i]]
  from public.dc_courses c
  join public.dc_languages   lg on lg.code = c.language_code
  join public.dc_levels      lv on lv.code = c.level_code
  join public.dc_class_types ct on ct.code = c.class_type_code
  join topics t on t.class_type_code = c.class_type_code and t.level_code = c.level_code
  join points p on p.language_code   = c.language_code   and p.level_code = c.level_code
  cross join generate_series(1, 12) i
on conflict (course_id, lesson_no) do nothing;

-- 차시별 숙제 2개(필수 + 심화) = 864행
insert into public.dc_lesson_homework (lesson_id, seq, title_ko, description_ko, est_minutes, is_required)
select l.id, 1::smallint,
       case c.class_type_code
         when 'grammar'      then '「' || l.keywords[4] || '」 연습문제 15문항'
         when 'conversation' then '「' || split_part(l.title_ko, '. ', 2) || '」 1분 말하기 녹음'
         else 'OPIc 「' || split_part(l.title_ko, '. ', 2) || '」 모범답안 작성'
       end,
       case c.class_type_code
         when 'grammar'      then '배부된 학습지 1~15번을 풀고, 틀린 문제는 문장 전체를 다시 써서 제출하세요.'
         when 'conversation' then '오늘 배운 표현을 최소 3개 넣어 1분 동안 말하고 녹음 파일을 올려 주세요.'
         else '오늘 설계한 답변 구조에 맞춰 90초 분량 스크립트를 작성해 제출하세요.'
       end,
       (case c.class_type_code when 'grammar' then 25 when 'conversation' then 20 else 30 end)::smallint,
       true
  from public.dc_lessons l join public.dc_courses c on c.id = l.course_id
union all
select l.id, 2::smallint,
       case c.class_type_code
         when 'grammar'      then '「' || l.keywords[4] || '」로 내 문장 5개 만들기'
         when 'conversation' then '핵심 표현 10개 암기 + 셀프 테스트'
         else '실전 3문항 타이머 응답 녹음'
       end,
       case c.class_type_code
         when 'grammar'      then '오늘 배운 문법으로 내 이야기를 담은 문장 5개를 만들어 오세요. 다음 시간에 한 명씩 발표합니다.'
         when 'conversation' then '오늘의 표현 카드 10장을 외우고, 보지 않고 말할 수 있는지 스스로 점검하세요.'
         else '타이머를 켜고 준비 시간 없이 3문항에 답한 뒤 녹음본을 제출하세요. 다음 시간에 함께 교정합니다.'
       end,
       (case c.class_type_code when 'grammar' then 15 when 'conversation' then 15 else 20 end)::smallint,
       false
  from public.dc_lessons l join public.dc_courses c on c.id = l.course_id
on conflict (lesson_id, seq) do nothing;
