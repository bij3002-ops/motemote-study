# -*- coding: utf-8 -*-
"""오픽(OPIc) AL 실전 콘텐츠 — tools/build-speaking-data.py가 읽어 JSON으로 만든다.

승철님 상황(인천대 산업경영공학과 3학년, 공기업 기술직 준비, 아침 영어 통화)에
맞춘 소재를 쓰되, 개인 신상은 확인된 범위(송도 거주·공기업 준비·아침 영어)만 쓴다.
"""

TOPICS = [
    {
        "id": "opic-intro",
        "title": "자기소개",
        "emoji": "🙋",
        "questions": [
            {
                "id": "opic-intro-1",
                "q": "Let's start with a little self-introduction. Tell me about yourself.",
                "qKo": "간단한 자기소개로 시작해 볼까요. 자신에 대해 말해 주세요.",
                "a": (
                    "Sure, I'd be happy to. My name is Seungcheol, and I'm a junior at Incheon National University, "
                    "majoring in industrial engineering. These days I'm mostly focused on getting a job at a public "
                    "energy company, so I'm studying for two certifications — one in quality management and one in "
                    "industrial safety. I'm also trying to improve my English, so I have a short speaking session on the "
                    "phone every morning before class. In my free time I like working out and watching documentaries. "
                    "People around me say I'm pretty organized, and that I don't give up easily once I start something."
                ),
                "aKo": (
                    "네, 좋아요. 제 이름은 승철이고, 인천대학교 산업경영공학과 3학년입니다. 요즘은 주로 공기업 에너지 회사에 "
                    "취업하는 데 집중하고 있어서, 품질경영과 산업안전 두 가지 자격증을 준비하고 있습니다. 영어 실력도 "
                    "늘리려고 수업 전에 매일 아침 짧게 전화로 말하기 연습을 하고 있어요. 여가 시간에는 운동하는 것과 "
                    "다큐멘터리 보는 것을 좋아합니다. 주변 사람들은 제가 꽤 정리정돈을 잘하고, 한번 시작하면 쉽게 "
                    "포기하지 않는다고 말해요."
                ),
                "expr": [
                    {"en": "I'd be happy to.", "ko": "기꺼이요. (자기소개 시작할 때 자연스러운 첫 문장)"},
                    {"en": "These days I'm mostly focused on ~", "ko": "요즘은 주로 ~에 집중하고 있어요"},
                    {"en": "People around me say I'm ~", "ko": "주변 사람들은 제가 ~라고 말해요"},
                    {"en": "once I start something", "ko": "한번 시작하면"},
                ],
                "follow": [
                    {"q": "What kind of person are you? Tell me about your personality.", "qKo": "어떤 성격인가요? 성격에 대해 말해 주세요."},
                    {"q": "How do you usually start your day?", "qKo": "보통 하루를 어떻게 시작하나요?"},
                ],
            },
            {
                "id": "opic-intro-2",
                "q": "What are you studying these days, and why did you choose it?",
                "qKo": "요즘 무엇을 공부하고 있나요? 그리고 왜 그것을 선택했나요?",
                "a": (
                    "Right now I'm studying for the engineer certificates I mentioned, and I'm also working on my "
                    "English speaking. I chose this path for a couple of reasons. First, I've always been interested in "
                    "how factories and companies make their products safer and more efficient, and that's basically what "
                    "industrial engineering is about. Second, the company I want to join hires people with engineering "
                    "certificates, so getting them is the most realistic way for me to get in. It's a lot of work, but I "
                    "can see myself improving every week, and honestly that keeps me going."
                ),
                "aKo": (
                    "지금은 앞서 말한 기사 자격증 공부를 하고 있고, 영어 말하기도 함께 하고 있습니다. 이 길을 선택한 데는 "
                    "몇 가지 이유가 있어요. 첫째, 공장이나 기업이 제품을 어떻게 더 안전하고 효율적으로 만드는지 늘 "
                    "관심이 있었는데, 그게 바로 산업공학이 다루는 일이거든요. 둘째, 제가 가고 싶은 회사가 기사 자격증이 "
                    "있는 사람을 뽑기 때문에, 자격증을 따는 것이 가장 현실적인 방법입니다. 일이 많지만 매주 실력이 "
                    "늘고 있다는 게 느껴지고, 솔직히 그게 저를 계속 움직이게 합니다."
                ),
                "expr": [
                    {"en": "for a couple of reasons", "ko": "몇 가지 이유로"},
                    {"en": "that's basically what ~ is about", "ko": "그게 바로 ~이 다루는 일이에요"},
                    {"en": "the most realistic way for me to ~", "ko": "제가 ~하는 가장 현실적인 방법"},
                    {"en": "that keeps me going", "ko": "그게 저를 계속 나아가게 해요"},
                ],
                "follow": [
                    {"q": "What is the most interesting subject you've studied?", "qKo": "가장 흥미로웠던 과목은 무엇인가요?"},
                    {"q": "What do you want to do after you graduate?", "qKo": "졸업 후에 무엇을 하고 싶나요?"},
                ],
            },
        ],
    },
    {
        "id": "opic-housing",
        "title": "집 · 주거",
        "emoji": "🏠",
        "questions": [
            {
                "id": "opic-housing-1",
                "q": "Tell me about your home. What does it look like?",
                "qKo": "집에 대해 말해 주세요. 어떤 집인가요?",
                "a": (
                    "I live in an apartment in Songdo, which is a relatively new district in Incheon. It's a mid-sized "
                    "place — three bedrooms, a living room, a kitchen, and a small balcony. What I like most about it is "
                    "how bright it is, because the living room faces south and there's a big window. The furniture is "
                    "pretty simple: a gray sofa, a low bookshelf, and a desk by the window where I study. It's not fancy "
                    "at all, but it's clean and quiet, which is exactly what I need when I'm preparing for exams."
                ),
                "aKo": (
                    "저는 인천의 비교적 새로운 지역인 송도의 아파트에 살고 있습니다. 방 세 개, 거실, 주방, 작은 베란다가 "
                    "있는 중간 크기 집이에요. 가장 마음에 드는 점은 집이 아주 밝다는 건데, 거실이 남향이고 큰 창이 "
                    "있기 때문입니다. 가구는 꽤 단순한 편이에요. 회색 소파, 낮은 책장, 그리고 창가에 공부하는 책상이 "
                    "있습니다. 전혀 화려하지는 않지만 깨끗하고 조용해서, 시험을 준비할 때 제가 필요로 하는 조건과 딱 "
                    "맞습니다."
                ),
                "expr": [
                    {"en": "a relatively new district", "ko": "비교적 새로운 지역"},
                    {"en": "What I like most about it is ~", "ko": "가장 마음에 드는 점은 ~입니다"},
                    {"en": "It's not fancy at all, but ~", "ko": "전혀 화려하지는 않지만 ~"},
                    {"en": "which is exactly what I need", "ko": "그게 바로 제게 필요한 것입니다"},
                ],
                "follow": [
                    {"q": "Is there anything you want to change about your home?", "qKo": "집에서 바꾸고 싶은 점이 있나요?"},
                    {"q": "How long have you lived there?", "qKo": "그곳에서 얼마나 살았나요?"},
                ],
            },
            {
                "id": "opic-housing-2",
                "q": "Which room in your home do you use the most? Describe it in detail.",
                "qKo": "집에서 가장 많이 쓰는 방은 어디인가요? 자세히 묘사해 주세요.",
                "a": (
                    "That would definitely be my room. It's not very big, but I've set it up so that everything I need is "
                    "within arm's reach. There's a long desk against the wall with my laptop, a second monitor, and a "
                    "small lamp. Right next to the desk I have a bookshelf full of exam prep books, and above it there's a "
                    "whiteboard where I write down my weekly plan. On the other side there's my bed and a small speaker I "
                    "use for music. I usually keep the window open a little, because fresh air helps me stay awake when "
                    "I'm studying late."
                ),
                "aKo": (
                    "당연히 제 방입니다. 아주 크지는 않지만, 필요한 것이 모두 손 닿는 곳에 있도록 꾸며 놨어요. 벽을 따라 "
                    "긴 책상이 있고 그 위에 노트북, 두 번째 모니터, 작은 스탠드가 있습니다. 책상 바로 옆에는 시험 "
                    "대비서가 가득한 책장이 있고, 그 위에는 주간 계획을 적는 화이트보드가 있어요. 반대편에는 침대와 "
                    "음악을 듣는 작은 스피커가 있습니다. 창문은 보통 조금 열어 두는데, 늦게까지 공부할 때 신선한 "
                    "공기가 잠을 쫓는 데 도움이 되거든요."
                ),
                "expr": [
                    {"en": "set it up so that ~", "ko": "~하도록 꾸며 놓다"},
                    {"en": "within arm's reach", "ko": "손이 닿는 곳에"},
                    {"en": "against the wall", "ko": "벽을 따라 / 벽에 붙여"},
                    {"en": "helps me stay awake", "ko": "잠을 깨는 데 도움이 된다"},
                ],
                "follow": [
                    {"q": "Do you share the room with anyone?", "qKo": "누군가와 방을 함께 쓰나요?"},
                    {"q": "What would you like to add to your room?", "qKo": "방에 무엇을 더 두고 싶나요?"},
                ],
            },
        ],
    },
    {
        "id": "opic-neighborhood",
        "title": "동네 · 이웃",
        "emoji": "🏙️",
        "questions": [
            {
                "id": "opic-neighborhood-1",
                "q": "Tell me about your neighborhood. What is it like?",
                "qKo": "사는 동네에 대해 말해 주세요. 어떤 곳인가요?",
                "a": (
                    "My neighborhood is in Songdo, and it's a mix of new apartment buildings and a lot of green space. "
                    "The best part is Central Park — it takes me about ten minutes to walk there, and there's a canal "
                    "where people ride bikes on weekends. There are also plenty of cafes and small restaurants around, "
                    "so I never have to go far to grab something to eat. The downside is that it's a bit expensive "
                    "compared to older parts of Incheon, and it gets pretty quiet at night. Still, it's safe and very "
                    "walkable, so I'm happy living here."
                ),
                "aKo": (
                    "제 동네는 송도에 있고, 새 아파트 단지와 녹지가 섞여 있는 곳입니다. 가장 좋은 점은 센트럴파크예요. "
                    "걸어서 10분 정도면 닿고, 주말에는 사람들이 자전거를 타는 운하도 있습니다. 주변에 카페와 작은 "
                    "식당도 많아서 먹을 것을 사러 멀리 갈 필요가 없어요. 단점은 인천의 오래된 지역에 비해 물가가 좀 "
                    "비싸고, 밤에는 꽤 조용해진다는 것입니다. 그래도 안전하고 걸어 다니기 좋아서 여기 사는 게 "
                    "만족스럽습니다."
                ),
                "expr": [
                    {"en": "a mix of A and B", "ko": "A와 B가 섞인"},
                    {"en": "it takes me about ten minutes to walk there", "ko": "걸어서 10분 정도 걸린다"},
                    {"en": "The downside is that ~", "ko": "단점은 ~라는 것입니다"},
                    {"en": "it's safe and very walkable", "ko": "안전하고 걸어 다니기 좋다"},
                ],
                "follow": [
                    {"q": "What do you usually do in your neighborhood on weekends?", "qKo": "주말에 동네에서 보통 무엇을 하나요?"},
                    {"q": "What would you change about your neighborhood?", "qKo": "동네에서 바꾸고 싶은 점이 있나요?"},
                ],
            },
        ],
    },
    {
        "id": "opic-leisure",
        "title": "여가 · 운동",
        "emoji": "🏃",
        "questions": [
            {
                "id": "opic-leisure-1",
                "q": "How do you usually spend your free time?",
                "qKo": "여가 시간을 보통 어떻게 보내나요?",
                "a": (
                    "It depends on the day, but I'd say I have three main things. First, I work out three or four times a "
                    "week — usually running in the park or doing weights at a small gym near my place. Second, I watch "
                    "documentaries or YouTube videos on science and business, because I like learning things that aren't "
                    "for an exam. And lately I've been spending a lot of my free time on English, since it's the part I'm "
                    "weakest at. When I really need to rest, I just meet a friend for coffee and we talk for a couple of "
                    "hours without doing anything productive."
                ),
                "aKo": (
                    "그날그날 다르지만 크게 세 가지라고 할 수 있어요. 첫째, 일주일에 서너 번 운동합니다. 보통 공원에서 "
                    "달리거나 집 근처 작은 헬스장에서 근력 운동을 해요. 둘째, 과학이나 비즈니스 관련 다큐멘터리나 "
                    "유튜브를 봅니다. 시험을 위한 게 아닌 것을 배우는 걸 좋아하거든요. 그리고 최근에는 여가 시간을 "
                    "영어에 많이 쓰고 있어요. 제가 가장 약한 부분이니까요. 정말 쉬어야 할 때는 친구를 만나 커피를 "
                    "마시며 두어 시간 아무 생산적인 일 없이 이야기만 하기도 합니다."
                ),
                "expr": [
                    {"en": "It depends on the day, but ~", "ko": "그날그날 다르지만 ~"},
                    {"en": "I'd say ~", "ko": "제 생각에는 ~인 것 같아요"},
                    {"en": "lately I've been spending a lot of my time on ~", "ko": "요즘 ~에 시간을 많이 쓰고 있어요"},
                    {"en": "without doing anything productive", "ko": "아무 생산적인 일 없이"},
                ],
                "follow": [
                    {"q": "Do you prefer spending free time alone or with other people?", "qKo": "여가 시간을 혼자 보내는 것과 함께 보내는 것 중 어느 쪽을 선호하나요?"},
                    {"q": "Is there a new hobby you want to start?", "qKo": "새로 시작하고 싶은 취미가 있나요?"},
                ],
            },
            {
                "id": "opic-leisure-2",
                "q": "Tell me about a sport or exercise you do regularly. How did you start it?",
                "qKo": "규칙적으로 하는 운동에 대해 말해 주세요. 어떻게 시작하게 됐나요?",
                "a": (
                    "I run about three times a week, usually along the park near my apartment. I started about two years "
                    "ago, when I realized I was sitting at my desk almost all day studying and my back was hurting all "
                    "the time. At first I could barely run for ten minutes, so I used a simple app that told me when to "
                    "run and when to walk. Now I can comfortably do five kilometers, and on good days I do eight. It's "
                    "the one hour of the day when I don't look at my phone at all, so it clears my head better than "
                    "anything else."
                ),
                "aKo": (
                    "일주일에 세 번 정도 달립니다. 보통 아파트 근처 공원을 따라 뛰어요. 2년쯤 전에 시작했는데, 하루 종일 "
                    "책상에 앉아 공부하다 보니 허리가 계속 아팠기 때문입니다. 처음에는 10분도 겨우 뛰었기 때문에, 언제 "
                    "뛰고 언제 걸을지 알려 주는 간단한 앱을 썼어요. 지금은 5km를 편하게 뛰고, 컨디션이 좋은 날은 "
                    "8km도 뜁니다. 하루 중 휴대폰을 전혀 보지 않는 한 시간이라, 무엇보다 머리를 맑게 해 줍니다."
                ),
                "expr": [
                    {"en": "I started about two years ago, when ~", "ko": "2년쯤 전에 ~했을 때 시작했어요"},
                    {"en": "I could barely run for ten minutes", "ko": "10분도 겨우 뛰었어요"},
                    {"en": "on good days I do eight", "ko": "좋은 날은 8km를 해요"},
                    {"en": "it clears my head", "ko": "머리를 맑게 해 준다"},
                ],
                "follow": [
                    {"q": "Do you prefer exercising alone or in a group?", "qKo": "운동을 혼자 하는 것과 여럿이 하는 것 중 어느 쪽을 좋아하나요?"},
                    {"q": "Have you ever tried any other sports?", "qKo": "다른 운동을 해 본 적이 있나요?"},
                ],
            },
        ],
    },
    {
        "id": "opic-cafe",
        "title": "카페 · 맛집",
        "emoji": "☕",
        "questions": [
            {
                "id": "opic-cafe-1",
                "q": "Tell me about a cafe you often go to.",
                "qKo": "자주 가는 카페에 대해 말해 주세요.",
                "a": (
                    "There's a small cafe about five minutes from my campus that I go to at least twice a week. It's run "
                    "by an older couple, and it looks more like someone's living room than a chain cafe — wooden tables, "
                    "a lot of plants, and jazz playing quietly in the background. I always order an iced Americano and "
                    "sit at the corner table by the window, because it has a power outlet and nobody walks past me. I "
                    "usually stay for two or three hours and get through a whole chapter of my textbook. The staff "
                    "already know my order, which is a small thing but it makes the place feel comfortable."
                ),
                "aKo": (
                    "캠퍼스에서 5분 거리에 일주일에 두 번은 가는 작은 카페가 있습니다. 부부가 운영하는 곳인데, 체인 "
                    "카페보다 누군가의 거실처럼 보여요. 나무 테이블, 많은 화분, 조용히 흐르는 재즈가 있습니다. 저는 "
                    "항상 아이스 아메리카노를 시키고 창가 구석 테이블에 앉는데, 콘센트가 있고 지나가는 사람이 없기 "
                    "때문입니다. 보통 두세 시간 머물며 교재 한 챕터를 끝냅니다. 직원분들이 이미 제 주문을 알고 "
                    "계신데, 사소한 일이지만 그 덕분에 편안하게 느껴집니다."
                ),
                "expr": [
                    {"en": "It's run by ~", "ko": "~가 운영하는 곳이에요"},
                    {"en": "it looks more like A than B", "ko": "B보다 A처럼 보인다"},
                    {"en": "I always order ~ and sit at ~", "ko": "항상 ~를 시키고 ~에 앉아요"},
                    {"en": "get through a whole chapter", "ko": "한 챕터를 다 끝내다"},
                ],
                "follow": [
                    {"q": "What kind of cafes do you dislike?", "qKo": "어떤 카페를 싫어하나요?"},
                    {"q": "Do you ever study at cafes with friends?", "qKo": "친구들과 카페에서 공부하기도 하나요?"},
                ],
            },
            {
                "id": "opic-cafe-2",
                "q": "Describe a memorable meal you had with other people.",
                "qKo": "다른 사람들과 했던 기억에 남는 식사에 대해 묘사해 주세요.",
                "a": (
                    "The first meal that comes to mind is a dinner I had with three classmates after we finished a big "
                    "team project last semester. We went to a small Korean barbecue place near the campus, and honestly "
                    "we were exhausted, so we ordered way too much food. I remember the owner kept bringing us extra "
                    "side dishes and telling us to eat more. We talked about everything except the project — the "
                    "professor, our plans after graduation, and how none of us had slept for two days. The food was "
                    "simple, but the mood was great, and it felt like a reward for all the work we'd done."
                ),
                "aKo": (
                    "가장 먼저 떠오르는 식사는 지난 학기에 큰 팀 프로젝트를 끝낸 뒤 세 명의 동기와 함께한 저녁입니다. "
                    "캠퍼스 근처 작은 고깃집에 갔는데, 솔직히 너무 지쳐 있어서 음식을 터무니없이 많이 시켰어요. "
                    "사장님이 계속 반찬을 더 가져다주시고 더 먹으라고 하시던 게 기억납니다. 우리는 프로젝트를 빼고 "
                    "모든 이야기를 했어요. 교수님 이야기, 졸업 후 계획, 이틀 동안 아무도 못 잤다는 이야기까지요. "
                    "음식은 평범했지만 분위기가 좋았고, 우리가 한 일에 대한 보상처럼 느껴졌습니다."
                ),
                "expr": [
                    {"en": "The first thing that comes to mind is ~", "ko": "가장 먼저 떠오르는 것은 ~"},
                    {"en": "we ordered way too much food", "ko": "음식을 너무 많이 시켰다"},
                    {"en": "everything except ~", "ko": "~을 빼고 모든 것"},
                    {"en": "it felt like a reward for ~", "ko": "~에 대한 보상처럼 느껴졌다"},
                ],
                "follow": [
                    {"q": "Do you usually eat out or cook at home?", "qKo": "보통 외식하나요, 집에서 요리하나요?"},
                    {"q": "What food would you recommend to a foreign friend?", "qKo": "외국인 친구에게 어떤 음식을 추천하고 싶나요?"},
                ],
            },
        ],
    },
    {
        "id": "opic-music",
        "title": "음악",
        "emoji": "🎧",
        "questions": [
            {
                "id": "opic-music-1",
                "q": "What kind of music do you listen to? When do you listen to it?",
                "qKo": "어떤 음악을 듣나요? 언제 듣나요?",
                "a": (
                    "I listen to a pretty wide range, but mostly hip-hop and lo-fi these days. I'm not the kind of person "
                    "who knows every artist or album — I just keep a playlist of songs I like and let it run. I listen "
                    "when I'm on the bus in the morning, because it makes a forty-minute ride feel much shorter, and "
                    "when I'm doing simple tasks like cleaning or organizing my notes. I can't listen to lyrics while "
                    "I'm studying something difficult, so for that I switch to instrumental music or just silence."
                ),
                "aKo": (
                    "꽤 다양한 음악을 듣지만 요즘은 주로 힙합과 로파이를 듣습니다. 모든 가수나 앨범을 아는 타입은 아니고, "
                    "좋아하는 곡 목록을 만들어 두고 그냥 재생해요. 아침에 버스에 있을 때 듣는데, 40분 통학이 훨씬 "
                    "짧게 느껴지기 때문이고, 청소나 노트 정리 같은 단순한 일을 할 때도 듣습니다. 어려운 걸 공부할 "
                    "때는 가사가 있는 음악을 들을 수 없어서, 그럴 때는 연주곡으로 바꾸거나 그냥 조용히 합니다."
                ),
                "expr": [
                    {"en": "a pretty wide range", "ko": "꽤 넓은 범위"},
                    {"en": "I'm not the kind of person who ~", "ko": "저는 ~하는 타입이 아니에요"},
                    {"en": "it makes the ride feel much shorter", "ko": "이동 시간이 훨씬 짧게 느껴진다"},
                    {"en": "I switch to ~", "ko": "~로 바꾼다"},
                ],
                "follow": [
                    {"q": "Have your music tastes changed over time?", "qKo": "음악 취향이 시간이 지나면서 바뀌었나요?"},
                    {"q": "Is there a song that reminds you of a specific memory?", "qKo": "특정 기억이 떠오르는 노래가 있나요?"},
                ],
            },
        ],
    },
    {
        "id": "opic-movie",
        "title": "영화 · 공연",
        "emoji": "🎬",
        "questions": [
            {
                "id": "opic-movie-1",
                "q": "Tell me about a movie you enjoyed recently.",
                "qKo": "최근에 재미있게 본 영화에 대해 말해 주세요.",
                "a": (
                    "Recently I watched a documentary about artificial intelligence, and it stuck with me more than any "
                    "movie I've seen this year. It followed a few researchers and showed how quickly the technology is "
                    "changing, but it also asked uncomfortable questions — what happens to people whose jobs disappear, "
                    "and who decides what these systems are allowed to do. I watched it alone on a Sunday evening, and "
                    "afterwards I spent almost an hour just thinking about my own plans. I usually prefer light movies "
                    "to relax, but once in a while something like this makes me look at my studies differently."
                ),
                "aKo": (
                    "최근에 인공지능에 관한 다큐멘터리를 봤는데, 올해 본 어떤 영화보다 오래 기억에 남았습니다. 몇 명의 "
                    "연구자를 따라가며 기술이 얼마나 빨리 변하는지 보여 주면서도, 불편한 질문도 던졌어요. 일자리를 "
                    "잃은 사람들은 어떻게 되는지, 이런 시스템이 무엇을 하도록 허용할지는 누가 정하는지 말이죠. 일요일 "
                    "저녁에 혼자 봤는데, 보고 나서 한 시간 가까이 제 계획에 대해 생각만 했습니다. 보통은 쉬기 위해 "
                    "가벼운 영화를 선호하지만, 가끔 이런 작품을 보면 제 공부를 다르게 보게 됩니다."
                ),
                "expr": [
                    {"en": "it stuck with me", "ko": "오래 기억에 남았다"},
                    {"en": "It followed a few researchers", "ko": "몇 명의 연구자를 따라갔다"},
                    {"en": "it asked uncomfortable questions", "ko": "불편한 질문을 던졌다"},
                    {"en": "once in a while", "ko": "가끔"},
                ],
                "follow": [
                    {"q": "Do you prefer watching movies at home or at the theater?", "qKo": "영화를 집에서 보는 것과 극장에서 보는 것 중 어느 쪽을 선호하나요?"},
                    {"q": "Who do you usually watch movies with?", "qKo": "보통 누구와 영화를 보나요?"},
                ],
            },
        ],
    },
]

TOPICS += [
    {
        "id": "opic-travel-domestic",
        "title": "국내여행",
        "emoji": "🚆",
        "questions": [
            {
                "id": "opic-travel-domestic-1",
                "q": "Tell me about a memorable trip you took in Korea.",
                "qKo": "국내에서 했던 기억에 남는 여행에 대해 말해 주세요.",
                "a": (
                    "The trip I remember best was a two-day trip to Gangneung with two friends last summer. We took the "
                    "train early in the morning, and as soon as we arrived we went straight to the beach. The plan was "
                    "simple: eat, walk, and do nothing for two days. What made it special was the timing — we had all "
                    "just finished our exams, so we were completely relaxed. We ended up sitting on the sand until it "
                    "got dark and talking about what we wanted to do after graduation. It rained a little on the second "
                    "day, so we spent the afternoon in a small cafe, but honestly nobody minded."
                ),
                "aKo": (
                    "가장 기억에 남는 여행은 지난여름 친구 두 명과 다녀온 강릉 1박 2일 여행입니다. 아침 일찍 기차를 타고 "
                    "도착하자마자 바로 바다로 갔어요. 계획은 단순했습니다. 먹고, 걷고, 이틀 동안 아무것도 안 하기요. "
                    "특별했던 이유는 시기였습니다. 막 시험을 끝낸 참이라 완전히 편안한 상태였어요. 결국 해가 질 때까지 "
                    "모래 위에 앉아 졸업 후 무엇을 하고 싶은지 이야기했습니다. 둘째 날 비가 조금 와서 오후는 작은 "
                    "카페에서 보냈는데, 솔직히 아무도 신경 쓰지 않았어요."
                ),
                "expr": [
                    {"en": "as soon as we arrived", "ko": "도착하자마자"},
                    {"en": "What made it special was ~", "ko": "특별하게 만든 것은 ~였다"},
                    {"en": "we ended up sitting on the sand", "ko": "결국 모래 위에 앉아 있었다"},
                    {"en": "nobody minded", "ko": "아무도 신경 쓰지 않았다"},
                ],
                "follow": [
                    {"q": "Do you prefer traveling alone or with other people?", "qKo": "혼자 여행하는 것과 함께 여행하는 것 중 어느 쪽을 선호하나요?"},
                    {"q": "What do you usually prepare before a trip?", "qKo": "여행 전에 보통 무엇을 준비하나요?"},
                ],
            },
            {
                "id": "opic-travel-domestic-2",
                "q": "Where would you like to travel in Korea? Why?",
                "qKo": "국내에서 어디로 여행하고 싶나요? 왜인가요?",
                "a": (
                    "I'd really like to visit Jeju Island, but not the way most people do it. Instead of staying in a "
                    "hotel and moving by taxi, I want to walk a part of the Jeju Olle Trail for three or four days. I've "
                    "heard the courses along the coast are beautiful, and the whole point is to move slowly, so you end "
                    "up talking to local people and eating at small places. I'd also like to go in late autumn, when the "
                    "weather is cool and the island is less crowded. It might be tiring, but it's the kind of trip I "
                    "think I'd remember for a long time."
                ),
                "aKo": (
                    "제주도에 꼭 가 보고 싶은데, 대부분의 사람들이 하는 방식은 아니고 싶어요. 호텔에 묵고 택시로 "
                    "이동하는 대신, 제주 올레길을 사흘에서 나흘 정도 걸어 보고 싶습니다. 해안을 따라가는 코스가 "
                    "아름답다고 들었고, 핵심은 천천히 걷는 것이라 결국 지역 사람들과 이야기하고 작은 식당에서 먹게 "
                    "된다고 해요. 날씨가 서늘하고 섬이 덜 붐비는 늦가을에 가고 싶습니다. 힘들 수는 있지만, 오래 "
                    "기억에 남을 여행이 될 것 같아요."
                ),
                "expr": [
                    {"en": "I'd really like to ~", "ko": "정말 ~하고 싶어요"},
                    {"en": "Instead of -ing, I want to ~", "ko": "~하는 대신 ~하고 싶다"},
                    {"en": "the whole point is to ~", "ko": "핵심은 ~하는 것이다"},
                    {"en": "it's the kind of trip I'd remember", "ko": "오래 기억할 만한 여행이다"},
                ],
                "follow": [
                    {"q": "What do you usually do to prepare for a trip?", "qKo": "여행 준비로 보통 무엇을 하나요?"},
                    {"q": "Is there a place in Korea you would not recommend?", "qKo": "추천하고 싶지 않은 국내 여행지가 있나요?"},
                ],
            },
        ],
    },
    {
        "id": "opic-travel-overseas",
        "title": "해외여행",
        "emoji": "✈️",
        "questions": [
            {
                "id": "opic-travel-overseas-1",
                "q": "Have you ever traveled abroad? Tell me about your trip.",
                "qKo": "해외여행을 해 본 적이 있나요? 여행에 대해 말해 주세요.",
                "a": (
                    "Yes, I went to Osaka in Japan for four days about two years ago. It was my first time traveling "
                    "without my family, and I went with a friend, so we had to figure everything out ourselves. We stayed "
                    "in a small guesthouse near the station, which was cheap but very clean. The highlight for me was "
                    "the food — we ate takoyaki, ramen, and something like a pancake with cabbage in it that I still "
                    "think about. What surprised me most was how quiet the streets were at night. I'd love to go back, "
                    "but next time I'd like to visit a smaller city instead of a big one."
                ),
                "aKo": (
                    "네, 2년쯤 전에 일본 오사카에 4일간 다녀왔습니다. 가족 없이 여행한 첫 경험이었고 친구와 함께 갔기 "
                    "때문에 모든 것을 스스로 해결해야 했어요. 역 근처 작은 게스트하우스에 묵었는데, 저렴했지만 아주 "
                    "깨끗했습니다. 저에게 하이라이트는 음식이었어요. 타코야키, 라멘, 그리고 지금도 생각나는 양배추가 "
                    "들어간 팬케이크 같은 것을 먹었습니다. 가장 놀란 점은 밤에 거리가 아주 조용하다는 것이었어요. "
                    "다시 가고 싶지만, 다음에는 큰 도시보다 작은 도시를 가 보고 싶습니다."
                ),
                "expr": [
                    {"en": "It was my first time -ing", "ko": "~하는 것은 처음이었다"},
                    {"en": "we had to figure everything out ourselves", "ko": "모든 것을 우리가 직접 해결해야 했다"},
                    {"en": "The highlight for me was ~", "ko": "저에게 하이라이트는 ~였다"},
                    {"en": "What surprised me most was ~", "ko": "가장 놀라웠던 것은 ~"},
                ],
                "follow": [
                    {"q": "What was the most difficult part of traveling abroad?", "qKo": "해외여행에서 가장 어려웠던 점은 무엇인가요?"},
                    {"q": "Which country would you like to visit next?", "qKo": "다음에 어느 나라에 가 보고 싶나요?"},
                ],
            },
        ],
    },
    {
        "id": "opic-technology",
        "title": "기술 · 스마트폰",
        "emoji": "📱",
        "questions": [
            {
                "id": "opic-technology-1",
                "q": "How do you use your smartphone in your daily life?",
                "qKo": "일상에서 스마트폰을 어떻게 사용하나요?",
                "a": (
                    "Honestly, I use it for almost everything except studying. In the morning I check the bus app to see "
                    "when the next bus comes, and I use a timer app when I study — it's actually a study planner that "
                    "records how long I focus on each subject. During the day I use it for messages, and I keep a note "
                    "app where I put ideas and vocabulary I want to review. I also set an alarm for my morning English "
                    "call, because if I don't, I'll definitely oversleep. The only thing I try not to do is watch short "
                    "videos, since I noticed they eat up an hour without me realizing it."
                ),
                "aKo": (
                    "솔직히 공부할 때를 빼면 거의 모든 것에 씁니다. 아침에는 다음 버스가 언제 오는지 버스 앱으로 확인하고, "
                    "공부할 때는 타이머 앱을 써요. 실제로 과목별로 얼마나 집중했는지 기록하는 공부 플래너입니다. "
                    "낮에는 메시지에 쓰고, 아이디어와 복습할 단어를 적어 두는 메모 앱도 사용합니다. 아침 영어 통화를 "
                    "위한 알람도 맞추는데, 안 그러면 분명히 늦잠을 잘 거예요. 유일하게 하지 않으려고 하는 것은 짧은 "
                    "영상 시청입니다. 나도 모르게 한 시간이 사라지는 걸 느꼈거든요."
                ),
                "expr": [
                    {"en": "Honestly, I use it for almost everything except ~", "ko": "솔직히 ~를 빼면 거의 모든 것에 씁니다"},
                    {"en": "I keep a note app where I put ~", "ko": "~을 적는 메모 앱을 쓴다"},
                    {"en": "if I don't, I'll definitely oversleep", "ko": "안 그러면 분명 늦잠잘 거예요"},
                    {"en": "they eat up an hour without me realizing it", "ko": "나도 모르게 한 시간을 잡아먹는다"},
                ],
                "follow": [
                    {"q": "How much time do you spend on your phone every day?", "qKo": "하루에 휴대폰을 얼마나 쓰나요?"},
                    {"q": "Is there an app you can't live without?", "qKo": "없으면 안 되는 앱이 있나요?"},
                ],
            },
            {
                "id": "opic-technology-2",
                "q": "What do you think about artificial intelligence? How has it changed your life?",
                "qKo": "인공지능에 대해 어떻게 생각하나요? 삶이 어떻게 바뀌었나요?",
                "a": (
                    "I have mixed feelings about it, but overall I'm positive. On the practical side, it has saved me a "
                    "lot of time. When I'm reading a long report for class, I ask an AI tool to summarize it first, and "
                    "then I read the parts that matter. It's also useful for English — I can ask why a sentence sounds "
                    "awkward and get an explanation immediately. At the same time, I worry that students like me start to "
                    "skip the thinking part. If AI gives you the answer every time, you never learn how to find it "
                    "yourself. So I try to use it as a helper, not as a replacement for my own brain."
                ),
                "aKo": (
                    "복합적인 감정이지만 대체로 긍정적입니다. 실용적인 면에서 시간을 많이 아껴 줍니다. 수업용 긴 보고서를 "
                    "읽을 때 AI 도구로 먼저 요약하고, 중요한 부분만 읽어요. 영어에도 유용합니다. 왜 어떤 문장이 "
                    "어색하게 들리는지 물으면 바로 설명을 받을 수 있거든요. 동시에 저 같은 학생이 생각하는 단계를 "
                    "건너뛰게 되는 건 아닐까 걱정됩니다. AI가 매번 답을 주면 스스로 답을 찾는 법을 배우지 못하니까요. "
                    "그래서 저는 두뇌를 대신하는 것이 아니라 돕는 도구로 쓰려고 합니다."
                ),
                "expr": [
                    {"en": "I have mixed feelings about it", "ko": "복합적인 감정이 든다"},
                    {"en": "On the practical side, ~", "ko": "실용적인 면에서는 ~"},
                    {"en": "At the same time, I worry that ~", "ko": "동시에 ~가 걱정된다"},
                    {"en": "as a helper, not as a replacement", "ko": "대체물이 아니라 도우미로"},
                ],
                "follow": [
                    {"q": "Do you think AI will change the way people work?", "qKo": "AI가 사람들의 일하는 방식을 바꿀 것이라고 생각하나요?"},
                    {"q": "Have you ever had a problem because of AI?", "qKo": "AI 때문에 문제를 겪은 적이 있나요?"},
                ],
            },
        ],
    },
    {
        "id": "opic-past-experience",
        "title": "과거 경험",
        "emoji": "💪",
        "questions": [
            {
                "id": "opic-past-experience-1",
                "q": "Tell me about a difficult situation you experienced and how you handled it.",
                "qKo": "힘들었던 경험과 그것을 어떻게 해결했는지 말해 주세요.",
                "a": (
                    "The hardest thing I dealt with recently was a team project last semester. We were a group of four, "
                    "but one member stopped showing up about two weeks before the deadline. At first I was angry, but "
                    "then I realized being angry wouldn't finish the project. So I called the other two members, and we "
                    "split his part into three pieces based on what each of us was good at. I took the data analysis and "
                    "the presentation, which meant staying in the library until midnight for a week. We submitted on "
                    "time and got a good grade. What I learned was that the fastest way out of a problem is usually to "
                    "stop complaining and make a list."
                ),
                "aKo": (
                    "최근에 겪은 가장 힘든 일은 지난 학기 팀 프로젝트였습니다. 네 명이 한 조였는데, 마감 2주 전쯤부터 한 "
                    "명이 나오지 않기 시작했어요. 처음에는 화가 났지만, 화낸다고 프로젝트가 끝나지는 않는다는 걸 "
                    "깨달았습니다. 그래서 나머지 두 명에게 전화해 그의 파트를 각자 잘하는 것에 따라 세 부분으로 "
                    "나눴어요. 저는 데이터 분석과 발표를 맡았고, 그건 일주일 동안 자정까지 도서관에 있어야 한다는 "
                    "뜻이었습니다. 우리는 제때 제출했고 좋은 성적을 받았어요. 배운 것은, 문제에서 가장 빨리 "
                    "벗어나는 방법은 보통 불평을 멈추고 목록을 만드는 것이라는 점입니다."
                ),
                "expr": [
                    {"en": "The hardest thing I dealt with was ~", "ko": "제가 겪은 가장 힘든 일은 ~"},
                    {"en": "being angry wouldn't finish the project", "ko": "화낸다고 프로젝트가 끝나지 않는다"},
                    {"en": "we split his part into three pieces", "ko": "그의 몫을 세 부분으로 나눴다"},
                    {"en": "the fastest way out of a problem is to ~", "ko": "문제에서 벗어나는 가장 빠른 길은 ~"},
                ],
                "follow": [
                    {"q": "How did you feel when the project was over?", "qKo": "프로젝트가 끝났을 때 기분이 어땠나요?"},
                    {"q": "Would you work with that team again?", "qKo": "그 팀과 다시 일할 의향이 있나요?"},
                ],
            },
        ],
    },
    {
        "id": "opic-roleplay-call",
        "title": "롤플레이 1 · 문의 전화",
        "emoji": "☎️",
        "questions": [
            {
                "id": "opic-roleplay-call-1",
                "q": (
                    "You want to reserve a study room at the city library this Saturday. Call the library and ask three "
                    "or four questions about the reservation."
                ),
                "qKo": "이번 토요일에 시립도서관 학습실을 예약하려고 합니다. 도서관에 전화해서 예약에 관해 세 네 가지를 물어보세요.",
                "a": (
                    "Hi, hello. I'm calling because I'd like to reserve a study room at your library this Saturday. "
                    "First, could you tell me what time the library opens on weekends? And how long can I use the room "
                    "for — is there a time limit? I'd also like to know if I need to bring my ID card, or if I can just "
                    "give you my name and phone number. One more thing: is there a fee for using the room, or is it "
                    "free for students? Sorry, I have one last question — can I reserve it online, or do I have to come "
                    "in person? Thank you, that's all I needed."
                ),
                "aKo": (
                    "안녕하세요. 이번 토요일에 도서관 학습실을 예약하고 싶어서 전화드렸습니다. 먼저 주말에 도서관이 몇 "
                    "시에 문을 여는지 알려 주시겠어요? 그리고 방을 얼마나 오래 쓸 수 있는지, 이용 시간 제한이 "
                    "있나요? 신분증을 가져와야 하는지, 아니면 이름과 전화번호만 알려 드리면 되는지도 알고 싶습니다. "
                    "하나 더, 이용 요금이 있는지, 학생은 무료인지도요. 죄송하지만 마지막 질문이 하나 더 있습니다. "
                    "온라인으로 예약할 수 있나요, 아니면 직접 방문해야 하나요? 감사합니다. 궁금한 건 다 물어봤습니다."
                ),
                "expr": [
                    {"en": "I'm calling because ~", "ko": "~때문에 전화드렸습니다"},
                    {"en": "Could you tell me what time ~?", "ko": "~이 몇 시인지 알려 주시겠어요?"},
                    {"en": "Is there a time limit?", "ko": "시간 제한이 있나요?"},
                    {"en": "One more thing: ~", "ko": "하나 더 있는데요, ~"},
                ],
                "follow": [
                    {"q": "The librarian says the room is fully booked. Ask for another option.", "qKo": "사서가 방이 모두 예약됐다고 합니다. 다른 방법을 물어보세요."},
                    {"q": "Ask what you can bring into the room.", "qKo": "방에 무엇을 가져갈 수 있는지 물어보세요."},
                ],
            },
            {
                "id": "opic-roleplay-call-2",
                "q": (
                    "You ordered a book online, but the store sent you the wrong one. Call the store, explain the "
                    "problem, and ask what they can do about it."
                ),
                "qKo": "온라인으로 책을 주문했는데 매장에서 다른 책을 보냈습니다. 매장에 전화해서 문제를 설명하고 어떻게 해 줄 수 있는지 물어보세요.",
                "a": (
                    "Hello, this is Seungcheol. I ordered a book from your website last week, and it arrived yesterday, "
                    "but it's not the one I ordered. I ordered a statistics textbook, and I received a novel instead. I "
                    "checked the invoice, and it says the right title, so I think it was a packing mistake. Could you "
                    "check my order number and send the correct book? I'd also like to know what I should do with the "
                    "wrong one — should I send it back, or can I drop it off at your store? And if it's possible, could "
                    "you send the right book by Friday? I need it for a class next week. Thank you."
                ),
                "aKo": (
                    "안녕하세요, 승철입니다. 지난주에 홈페이지에서 책을 주문했는데 어제 도착했고, 주문한 책이 아닙니다. "
                    "통계학 교재를 주문했는데 소설이 왔어요. 송장을 확인해 보니 제목은 맞게 적혀 있어서 포장 실수인 것 "
                    "같습니다. 제 주문 번호를 확인하시고 맞는 책을 보내 주시겠어요? 잘못 온 책은 어떻게 해야 하는지도 "
                    "알고 싶습니다. 반송해야 하나요, 아니면 매장에 가져다 드리면 되나요? 그리고 가능하다면 금요일까지 "
                    "맞는 책을 보내 주실 수 있을까요? 다음 주 수업에 필요합니다. 감사합니다."
                ),
                "expr": [
                    {"en": "it's not the one I ordered", "ko": "제가 주문한 것이 아닙니다"},
                    {"en": "I think it was a packing mistake", "ko": "포장 실수인 것 같습니다"},
                    {"en": "Could you check my order number?", "ko": "제 주문 번호를 확인해 주시겠어요?"},
                    {"en": "if it's possible, could you ~?", "ko": "가능하다면 ~해 주시겠어요?"},
                ],
                "follow": [
                    {"q": "The store says you must pay for the return shipping. Respond.", "qKo": "매장에서 반송 배송비를 내야 한다고 합니다. 대응해 보세요."},
                    {"q": "Ask when the correct book will arrive.", "qKo": "맞는 책이 언제 도착하는지 물어보세요."},
                ],
            },
        ],
    },
    {
        "id": "opic-roleplay-suggest",
        "title": "롤플레이 3 · 대안 제안",
        "emoji": "🧩",
        "questions": [
            {
                "id": "opic-roleplay-suggest-1",
                "q": (
                    "You and a friend planned to go hiking this weekend, but the weather forecast says it will rain. "
                    "Call your friend and suggest other things to do."
                ),
                "qKo": "이번 주말에 친구와 등산을 가기로 했는데 일기예보에 비가 온다고 합니다. 친구에게 전화해 다른 할 일을 제안하세요.",
                "a": (
                    "Hey, it's me. Listen, I just checked the weather for Saturday, and it's supposed to rain all "
                    "afternoon, so I don't think hiking is a good idea. What do you think about doing something indoors "
                    "instead? There's a new exhibition at the museum near the station — I heard it's pretty good, and "
                    "it's only about ten thousand won. Or, if you'd rather relax, we could go to that barbecue place we "
                    "talked about and then watch a movie. Either way, let's keep Sunday open as a backup, because the "
                    "forecast says it should be clear by then. Which one sounds better to you?"
                ),
                "aKo": (
                    "어, 나야. 금요일이 아니라 토요일 날씨를 방금 봤는데 오후 내내 비가 온대. 그래서 등산은 별로인 것 "
                    "같아. 대신 실내에서 뭐 하는 건 어때? 역 근처 미술관에서 새 전시를 하는데 꽤 괜찮다고 들었고, "
                    "만 원 정도밖에 안 한대. 아니면 좀 쉬고 싶으면 우리가 이야기했던 그 고깃집에 가서 영화를 봐도 "
                    "되고. 어느 쪽이든 일요일은 예비로 비워 두자. 그때는 맑을 거래. 어느 쪽이 더 좋아?"
                ),
                "expr": [
                    {"en": "it's supposed to rain all afternoon", "ko": "오후 내내 비가 온다고 한다"},
                    {"en": "What do you think about -ing instead?", "ko": "대신 ~하는 건 어때?"},
                    {"en": "if you'd rather relax, we could ~", "ko": "차라리 쉬고 싶다면 ~해도 좋아"},
                    {"en": "let's keep Sunday open as a backup", "ko": "일요일은 예비로 비워 두자"},
                ],
                "follow": [
                    {"q": "Your friend says he has to work on Saturday. Respond.", "qKo": "친구가 토요일에 일해야 한다고 합니다. 대응해 보세요."},
                    {"q": "Ask your friend what time he wants to meet.", "qKo": "친구에게 몇 시에 만나고 싶은지 물어보세요."},
                ],
            },
        ],
    },
    {
        "id": "opic-surprise-transport",
        "title": "돌발 · 교통 · 통학",
        "emoji": "🚌",
        "questions": [
            {
                "id": "opic-surprise-transport-1",
                "q": "How do you usually get to school? Describe your commute.",
                "qKo": "보통 학교에 어떻게 가나요? 통학에 대해 묘사해 주세요.",
                "a": (
                    "I usually take the bus, and it takes about forty minutes door to door. I walk five minutes to the "
                    "stop, take bus 46, and then walk another ten minutes from the campus gate. In the morning the bus "
                    "is always crowded, so I usually stand and listen to music. The good thing is that it comes every "
                    "ten minutes or so, so even if I miss one, it's not a big deal. When I'm running late or it's "
                    "raining, I take a taxi, but it costs about fifteen thousand won, so I try not to do that too often."
                ),
                "aKo": (
                    "보통 버스를 타고, 집에서 학교까지 40분 정도 걸립니다. 정류장까지 5분 걸어가서 46번 버스를 타고, "
                    "정문에서 다시 10분 정도 걸어요. 아침에는 버스가 항상 붐비기 때문에 보통 서서 음악을 듣습니다. "
                    "좋은 점은 10분마다 오기 때문에 한 대를 놓쳐도 큰 문제가 아니라는 것이에요. 늦었거나 비가 올 때는 "
                    "택시를 타지만 만 오천 원 정도 해서 자주는 안 하려고 합니다."
                ),
                "expr": [
                    {"en": "it takes about forty minutes door to door", "ko": "문에서 문까지 40분쯤 걸린다"},
                    {"en": "even if I miss one, it's not a big deal", "ko": "한 대 놓쳐도 큰 문제는 아니다"},
                    {"en": "When I'm running late, ~", "ko": "시간이 촉박할 때는 ~"},
                    {"en": "I try not to do that too often", "ko": "자주는 안 하려고 한다"},
                ],
                "follow": [
                    {"q": "What do you usually do on the bus?", "qKo": "버스에서 보통 무엇을 하나요?"},
                    {"q": "How could public transportation in your city be improved?", "qKo": "사는 도시의 대중교통은 어떻게 개선될 수 있을까요?"},
                ],
            },
        ],
    },
    {
        "id": "opic-surprise-season",
        "title": "돌발 · 계절 · 날씨",
        "emoji": "🍂",
        "questions": [
            {
                "id": "opic-surprise-season-1",
                "q": "What is your favorite season? Tell me why.",
                "qKo": "가장 좋아하는 계절은 언제인가요? 이유를 말해 주세요.",
                "a": (
                    "My favorite season is definitely autumn. The main reason is the weather — it's cool enough to walk "
                    "around without sweating, but not so cold that you need a heavy coat. I also like the colors; in "
                    "Korea the leaves turn red and yellow in October, and there are a few streets near my place that "
                    "look amazing for about two weeks. Another thing is that autumn feels like a fresh start to me, "
                    "because the new semester begins and the weather makes me want to study. The only downside is that "
                    "it's too short — it feels like summer suddenly turns into winter."
                ),
                "aKo": (
                    "가장 좋아하는 계절은 단연 가을입니다. 주된 이유는 날씨예요. 땀 흘리지 않고 걸을 수 있을 만큼 "
                    "서늘하지만, 두꺼운 코트가 필요할 만큼 춥지는 않습니다. 색깔도 좋아해요. 한국에서는 10월에 나뭇잎이 "
                    "빨갛고 노랗게 물드는데, 우리 집 근처 몇몇 길이 2주 정도 정말 멋있어집니다. 또 가을은 저에게 "
                    "새로운 시작처럼 느껴집니다. 새 학기가 시작되고 날씨가 공부하고 싶게 만들거든요. 유일한 단점은 "
                    "너무 짧다는 것입니다. 여름이 갑자기 겨울이 되는 것 같아요."
                ),
                "expr": [
                    {"en": "My favorite season is definitely ~", "ko": "제가 가장 좋아하는 계절은 단연 ~입니다"},
                    {"en": "cool enough to walk around without sweating", "ko": "땀 흘리지 않고 걸을 만큼 서늘한"},
                    {"en": "Another thing is that ~", "ko": "또 다른 점은 ~이라는 것입니다"},
                    {"en": "The only downside is that ~", "ko": "유일한 단점은 ~"},
                ],
                "follow": [
                    {"q": "What do you usually do on rainy days?", "qKo": "비 오는 날에는 보통 무엇을 하나요?"},
                    {"q": "Has the weather in Korea changed in recent years?", "qKo": "최근 몇 년간 한국의 날씨가 변했나요?"},
                ],
            },
        ],
    },
    {
        "id": "opic-surprise-shopping",
        "title": "돌발 · 쇼핑",
        "emoji": "🛒",
        "questions": [
            {
                "id": "opic-surprise-shopping-1",
                "q": "Do you prefer shopping online or in person? Tell me why.",
                "qKo": "온라인 쇼핑과 직접 쇼핑 중 어느 쪽을 선호하나요? 이유를 말해 주세요.",
                "a": (
                    "It depends on what I'm buying. For things like books, phone cases, or anything I already know the "
                    "exact model of, I order online, because it's cheaper and it arrives in a day or two. But for "
                    "clothes and shoes, I still prefer going to the store. I've ordered shoes online before and they "
                    "were the right size on paper but uncomfortable when I actually wore them, and returning them was a "
                    "hassle. When I shop in person I can try things on, and I also like that I can ask the staff "
                    "questions. So overall, online for simple things, offline for anything I need to see and touch."
                ),
                "aKo": (
                    "무엇을 사는지에 따라 다릅니다. 책, 휴대폰 케이스처럼 정확한 모델을 이미 아는 물건은 온라인으로 "
                    "주문해요. 더 저렴하고 하루 이틀이면 도착하니까요. 하지만 옷과 신발은 여전히 매장에 가는 편을 "
                    "선호합니다. 예전에 신발을 온라인으로 주문했는데, 표기상으로는 맞는 사이즈였지만 실제로 신으니 "
                    "불편했고 반품도 번거로웠어요. 직접 사면 입어 볼 수 있고, 직원에게 물어볼 수 있다는 점도 "
                    "좋습니다. 그래서 종합하면 단순한 물건은 온라인, 직접 보고 만져야 하는 것은 오프라인입니다."
                ),
                "expr": [
                    {"en": "It depends on what I'm buying", "ko": "무엇을 사는지에 따라 다르다"},
                    {"en": "the right size on paper", "ko": "표기상으로는 맞는 사이즈"},
                    {"en": "returning them was a hassle", "ko": "반품이 번거로웠다"},
                    {"en": "online for simple things, offline for ~", "ko": "간단한 것은 온라인, ~은 오프라인"},
                ],
                "follow": [
                    {"q": "What was the last thing you bought online?", "qKo": "최근에 온라인으로 산 마지막 물건은 무엇인가요?"},
                    {"q": "Do you ever regret buying something online?", "qKo": "온라인 구매를 후회한 적이 있나요?"},
                ],
            },
        ],
    },
]

TOPICS.append(
    {
        "id": "opic-roleplay-problem",
        "title": "롤플레이 2 · 문제 해결",
        "emoji": "🔧",
        "questions": [
            {
                "id": "opic-roleplay-problem-1",
                "q": (
                    "You bought a used laptop from a neighbor two weeks ago, but now the battery does not charge. "
                    "Call the neighbor, explain the problem, and ask what he can do."
                ),
                "qKo": "2주 전에 이웃에게서 중고 노트북을 샀는데 지금 배터리가 충전되지 않습니다. 이웃에게 전화해 문제를 설명하고 어떻게 해 줄 수 있는지 물어보세요.",
                "a": (
                    "Hi, it's Seungcheol from next door. I'm sorry to call you about this, but I think there's a problem "
                    "with the laptop I bought from you two weeks ago. It worked fine at first, but since yesterday the "
                    "battery doesn't charge at all — the screen says it's plugged in, but the percentage doesn't go up. "
                    "I tried a different cable, so I don't think it's the charger. Would it be okay if I brought it over "
                    "so you could take a look? Or if you know a repair shop nearby, could you recommend one? I'm not "
                    "asking for a refund — I just want to know what my options are. Thanks for understanding."
                ),
                "aKo": (
                    "안녕하세요, 옆집 승철입니다. 이런 이야기로 전화드려 죄송한데, 2주 전에 사 간 노트북에 문제가 있는 것 "
                    "같습니다. 처음에는 잘 됐는데 어제부터 배터리가 전혀 충전되지 않아요. 화면에는 연결됐다고 나오는데 "
                    "충전 퍼센트가 올라가지 않습니다. 다른 케이블로도 해 봤으니 충전기 문제는 아닌 것 같아요. 제가 "
                    "노트북을 가져가면 한번 봐 주실 수 있을까요? 아니면 근처에 수리점을 아시면 추천해 주실 수 있나요? "
                    "환불을 요구하는 것은 아니고, 제가 어떤 선택지를 가질 수 있는지 알고 싶습니다. 이해해 주셔서 "
                    "감사합니다."
                ),
                "expr": [
                    {"en": "I'm sorry to call you about this, but ~", "ko": "이런 걸로 전화드려 죄송하지만 ~"},
                    {"en": "It worked fine at first, but since yesterday ~", "ko": "처음엔 잘 됐는데 어제부터 ~"},
                    {"en": "Would it be okay if I brought it over?", "ko": "제가 가져가도 괜찮을까요?"},
                    {"en": "I'm not asking for a refund", "ko": "환불을 요구하는 것은 아닙니다"},
                ],
                "follow": [
                    {"q": "The neighbor says it's not his responsibility now. Respond politely.", "qKo": "이웃이 이제 자기 책임이 아니라고 합니다. 정중하게 대응해 보세요."},
                    {"q": "Ask if he still has the receipt or warranty information.", "qKo": "영수증이나 보증서 정보가 아직 있는지 물어보세요."},
                ],
            },
        ],
    }
)
