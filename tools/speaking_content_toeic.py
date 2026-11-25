# -*- coding: utf-8 -*-
"""토익스피킹(TOEIC Speaking) IH~AL 실전 콘텐츠.

시험 규격(ETS 공식):
  Part 1 (Q1-2) 지문 읽기      준비 45초 · 답변 45초
  Part 2 (Q3-4) 사진 묘사      준비 45초 · 답변 30초
  Part 3 (Q5-7) 질문 응답      준비 3초  · 답변 15/15/30초
  Part 4 (Q8-10) 표 보고 응답   지문 45초 + 문항당 준비 3초 · 답변 15/15/30초
  Part 5 (Q11) 의견 제시       준비 45초 · 답변 60초
"""

PARTS = [
    {
        "id": "toeic-p1",
        "part": 1,
        "title": "지문 읽기",
        "subtitle": "Read a text aloud",
        "range": "Q1 · Q2",
        "prepSec": 45,
        "answerSec": 45,
        "readSec": 0,
        "timingNote": "준비 45초 · 답변 45초",
        "tips": [
            "쉼표·마침표에서 끊고, 전치사구 뒤에서 짧게 쉰다 (뜻 단위로 끊기).",
            "중요 정보(시간·장소·가격·요일)는 세게, 기능어(the, of, to)는 약하게 읽는다.",
            "고유명사·숫자는 또박또박. 특히 30과 13, 15와 50의 강세 위치를 구분한다.",
            "마지막 문장은 살짝 낮추며 끝내 상대를 기다리게 하지 않는다. 속도보다 일정함이 점수다.",
        ],
        "questions": [
            {
                "id": "toeic-p1-1",
                "q": "Read the announcement below as if you were speaking to shoppers.",
                "qKo": "아래 안내 방송을 고객에게 말하듯 읽어 보세요.",
                "passage": (
                    "Attention, shoppers. Our store will close early today at 6 p.m. for a staff training session. "
                    "If you have items to return, please do so before 5:30. We apologize for the inconvenience and "
                    "will reopen tomorrow at our usual time, 9 a.m."
                ),
                "guide": "Attention, shoppers, / Our store will close early today / at 6 p.m. / for a staff training session. / If you have items to return, / please do so before 5:30. / We apologize for the inconvenience / and will reopen tomorrow / at our usual time, / 9 a.m.",
                "aKo": (
                    "고객 여러분께 안내 말씀 드립니다. 오늘 매장은 직원 교육으로 저녁 6시에 조기 마감합니다. "
                    "반품하실 물건이 있으시면 5시 30분 전에 처리해 주세요. 불편을 드려 죄송하며, 내일은 평소처럼 "
                    "오전 9시에 다시 문을 엽니다."
                ),
                "expr": [
                    {"en": "close early for a staff training session", "ko": "직원 교육으로 조기 마감하다"},
                    {"en": "please do so before 5:30", "ko": "5시 30분 전에 해 주세요"},
                    {"en": "We apologize for the inconvenience", "ko": "불편을 드려 죄송합니다"},
                ],
                "follow": [
                    {"q": "같은 지문을 1.1배 속도로 다시 읽어 보세요.", "qKo": "속도 버튼으로 1.1x를 골라 다시 읽어 봅니다."},
                ],
            },
            {
                "id": "toeic-p1-2",
                "q": "Read the advertisement below as if you were speaking to customers.",
                "qKo": "아래 광고를 고객에게 말하듯 읽어 보세요.",
                "passage": (
                    "Visit our booth this weekend at the City Fitness Expo and try the new smart rowing machine. "
                    "The first hundred visitors will receive a free one-month membership. For more information, "
                    "please check our website."
                ),
                "guide": "Visit our booth this weekend / at the City Fitness Expo / and try the new smart rowing machine. / The first hundred visitors / will receive a free one-month membership. / For more information, / please check our website.",
                "aKo": (
                    "이번 주말 시티 피트니스 박람회에서 저희 부스를 방문하시고 새 스마트 로잉 머신을 써 보세요. "
                    "먼저 오시는 100명에게는 무료 1개월 이용권을 드립니다. 자세한 내용은 홈페이지를 확인해 주세요."
                ),
                "expr": [
                    {"en": "the first hundred visitors", "ko": "먼저 오시는 100명"},
                    {"en": "a free one-month membership", "ko": "무료 1개월 이용권"},
                    {"en": "For more information, please check ~", "ko": "자세한 내용은 ~를 확인해 주세요"},
                ],
                "follow": [
                    {"q": "강조할 정보(100명·무료·1개월)를 크게 읽어 다시 녹음해 보세요.", "qKo": "숫자와 무료 혜택을 강조해 읽습니다."},
                ],
            },
        ],
    },
    {
        "id": "toeic-p2",
        "part": 2,
        "title": "사진 묘사",
        "subtitle": "Describe a picture",
        "range": "Q3 · Q4",
        "prepSec": 45,
        "answerSec": 30,
        "readSec": 0,
        "timingNote": "준비 45초 · 답변 30초",
        "tips": [
            "30초는 4~5문장이면 충분하다. 욕심내지 말고 순서대로.",
            "① 전체 인상(장소·분위기) → ② 앞/뒤 사람의 동작 → ③ 사물·배경 → ④ 마무리 한 문장.",
            "사람은 '누가+무엇을 입고+무엇을 하는지', 사물은 '어디에+어떤 상태로' 있는지로 말한다.",
            "모르는 단어는 피하고 아는 표현으로 우회한다 (예: 랙 → shelves where they keep the tools).",
        ],
        "sceneNote": "사진 대신 머릿속 장면으로 연습하거나, 사진을 하나 띄워 두고 같은 순서로 말해 보세요. 아래는 두 장면의 예시입니다.",
        "questions": [
            {
                "id": "toeic-p2-1",
                "q": "Describe this picture: an outdoor cafe terrace on a sunny afternoon where several people are sitting with coffee.",
                "qKo": "다음 장면을 묘사하세요: 화창한 오후, 야외 카페 테라스에 사람들이 커피를 들고 앉아 있는 모습.",
                "sceneKo": "테라스에 테이블 4개, 세 명이 앉아 이야기 중, 한 명은 노트북으로 일하는 중, 종업원이 쟁반을 들고 다가오는 중, 배경에는 가게 간판과 화분.",
                "a": (
                    "This picture shows the outdoor terrace of a cafe on a sunny afternoon. In the foreground, three "
                    "people are sitting around a wooden table, talking and holding cups of coffee. To the right, a man "
                    "is working on his laptop with his headphones on, and there's a half-finished cake next to him. In "
                    "the background, a server in a black apron is carrying a tray toward one of the tables. There are "
                    "several plants along the wall, and a large sign is hanging above the entrance. The whole place "
                    "looks relaxed and comfortable."
                ),
                "aKo": (
                    "이 사진은 화창한 오후의 카페 야외 테라스를 보여 줍니다. 앞쪽에는 세 사람이 나무 테이블에 둘러앉아 "
                    "커피잔을 들고 이야기하고 있습니다. 오른쪽에는 남자 한 명이 헤드폰을 낀 채 노트북으로 일하고 있고, "
                    "옆에는 다 먹다 남은 케이크가 있습니다. 배경에는 검은 앞치마를 한 종업원이 쟁반을 들고 테이블로 "
                    "다가가고 있습니다. 벽을 따라 화분이 여러 개 있고, 입구 위에는 큰 간판이 걸려 있습니다. 전체적으로 "
                    "편안해 보이는 공간입니다."
                ),
                "expr": [
                    {"en": "In the foreground, ~ / In the background, ~", "ko": "앞쪽에는 ~ / 배경에는 ~"},
                    {"en": "three people are sitting around a wooden table", "ko": "세 사람이 나무 테이블에 둘러앉아 있다"},
                    {"en": "To the right, a man is working on his laptop", "ko": "오른쪽에는 남자가 노트북으로 일하고 있다"},
                    {"en": "The whole place looks relaxed", "ko": "전체적으로 편안해 보인다"},
                ],
                "follow": [
                    {"q": "같은 장면을 20초 안에 3문장으로 줄여 말해 보세요.", "qKo": "핵심만 남겨 짧게 말하는 연습입니다."},
                ],
            },
            {
                "id": "toeic-p2-2",
                "q": "Describe this picture: a meeting room where a woman is giving a presentation while four coworkers watch.",
                "qKo": "다음 장면을 묘사하세요: 회의실에서 여성이 발표하고 네 명의 동료가 듣고 있는 모습.",
                "sceneKo": "긴 회의실, 앞에 스크린에 그래프, 발표자가 리모컨을 들고 서 있음, 테이블에 노트북과 커피·서류, 벽면 창문으로 햇빛.",
                "a": (
                    "This picture was taken in a meeting room, probably during a company presentation. In the center, a "
                    "woman is standing in front of a large screen and holding a small remote in her hand. A line graph "
                    "is on the screen, and she seems to be explaining the results. Four coworkers are sitting at a long "
                    "table, looking at the screen, and two of them have opened their laptops. There are cups of coffee "
                    "and some documents on the table, and sunlight is coming through the windows on the left. Everyone "
                    "looks focused."
                ),
                "aKo": (
                    "이 사진은 회의실에서 찍은 것으로, 아마 회사 발표 중인 것 같습니다. 가운데에는 여성 한 명이 큰 "
                    "화면 앞에 서서 작은 리모컨을 들고 있습니다. 화면에는 꺾은선 그래프가 있고, 그녀가 결과를 설명하고 "
                    "있는 것 같습니다. 네 명의 동료가 긴 테이블에 앉아 화면을 보고 있고, 그중 두 명은 노트북을 펼쳐 "
                    "두었습니다. 테이블에는 커피잔과 서류가 있고, 왼쪽 창문으로 햇빛이 들어옵니다. 모두 집중하고 있는 "
                    "모습입니다."
                ),
                "expr": [
                    {"en": "This picture was taken in ~", "ko": "이 사진은 ~에서 찍은 것입니다"},
                    {"en": "probably during ~", "ko": "아마 ~ 중일 것입니다"},
                    {"en": "she seems to be -ing", "ko": "그녀는 ~하고 있는 것 같다"},
                    {"en": "Everyone looks focused", "ko": "모두 집중하고 있는 것 같다"},
                ],
                "follow": [
                    {"q": "사진에 없는 것을 상상해 한 문장 덧붙여 보세요.", "qKo": "예: 'I guess the meeting will end around noon.'"},
                ],
            },
        ],
    },
    {
        "id": "toeic-p3",
        "part": 3,
        "title": "질문 응답",
        "subtitle": "Respond to questions",
        "range": "Q5 · Q6 · Q7",
        "prepSec": 3,
        "answerSec": 15,
        "readSec": 0,
        "timingNote": "문항당 준비 3초 · 답변 15·15·30초",
        "tips": [
            "15초 문항은 두 문장이면 만점 분량: 직접 답 → 짧은 이유/부연.",
            "30초 문항은 '답 → 이유 → 구체적 예시 → 마무리' 4단으로 간다.",
            "질문의 시제를 그대로 따라 쓴다 (Did you ~? → 과거, Do you ~? → 현재).",
            "3초 준비 동안 첫 문장만 정해 두면 말문이 안 막힌다.",
        ],
        "questions": [
            {
                "id": "toeic-p3-1",
                "q": "What time do you usually wake up, and what is the first thing you do?",
                "qKo": "보통 몇 시에 일어나며, 제일 먼저 무엇을 하나요?",
                "answerSec": 15,
                "a": (
                    "I usually wake up around seven, and the first thing I do is check the bus app on my phone. Then I "
                    "wash up and make a quick cup of coffee before class."
                ),
                "aKo": (
                    "보통 7시쯤 일어나고, 가장 먼저 하는 일은 휴대폰으로 버스 앱을 확인하는 것입니다. 그다음 씻고 수업 "
                    "전에 커피를 빠르게 한 잔 내려 마십니다."
                ),
                "expr": [
                    {"en": "The first thing I do is ~", "ko": "제일 먼저 하는 일은 ~"},
                    {"en": "before class", "ko": "수업 전에"},
                ],
                "follow": [
                    {"q": "Do you ever sleep in on weekends?", "qKo": "주말에는 늦잠을 자나요?"},
                ],
            },
            {
                "id": "toeic-p3-2",
                "q": "How do you usually get to school or work?",
                "qKo": "보통 학교나 직장에 어떻게 가나요?",
                "answerSec": 15,
                "a": (
                    "I usually take the bus. It takes about forty minutes, and I listen to music or review vocabulary on "
                    "the way. If I'm late, I take a taxi, but that's expensive, so I try to leave early."
                ),
                "aKo": (
                    "보통 버스를 탑니다. 40분 정도 걸리고, 가는 동안 음악을 듣거나 단어를 복습해요. 늦었을 때는 택시를 "
                    "타지만 비싸서 일찍 출발하려고 합니다."
                ),
                "expr": [
                    {"en": "on the way", "ko": "가는 길에"},
                    {"en": "If I'm late, I take a taxi", "ko": "늦으면 택시를 탄다"},
                ],
                "follow": [
                    {"q": "Is public transportation in your city convenient?", "qKo": "사는 도시의 대중교통은 편리한가요?"},
                ],
            },
            {
                "id": "toeic-p3-3",
                "q": "Tell me about a morning when things did not go as planned.",
                "qKo": "계획대로 되지 않았던 아침에 대해 말해 주세요.",
                "answerSec": 30,
                "a": (
                    "Sure. A few weeks ago I had an important exam, and I set three alarms, but I slept through all of "
                    "them. When I woke up, it was already twenty past eight, and the exam started at nine. I skipped "
                    "breakfast, ran to the bus stop, and luckily a bus came right away. I got to the classroom with "
                    "about five minutes to spare, but I had forgotten my student ID, so I had to ask the professor to "
                    "let me in. In the end I took the exam, but my hands were shaking for the first ten minutes. Since "
                    "then, I always put my phone across the room."
                ),
                "aKo": (
                    "네. 몇 주 전에 중요한 시험이 있었는데, 알람을 세 개 맞춰 놓고도 다 지나서 잤어요. 일어나 보니 이미 "
                    "8시 20분이었고 시험은 9시에 시작했습니다. 아침을 거르고 버스 정류장으로 뛰었는데 다행히 버스가 "
                    "바로 왔어요. 교실에는 5분쯤 여유 있게 도착했지만 학생증을 두고 와서 교수님께 부탁해 들어가야 "
                    "했습니다. 결국 시험은 봤지만 처음 10분은 손이 떨렸어요. 그 후로는 항상 휴대폰을 방 반대편에 "
                    "두고 자요."
                ),
                "expr": [
                    {"en": "I slept through all of them", "ko": "알람을 다 지나서 잤다"},
                    {"en": "with about five minutes to spare", "ko": "5분쯤 여유를 두고"},
                    {"en": "In the end, ~", "ko": "결국 ~"},
                    {"en": "Since then, I always ~", "ko": "그 후로 항상 ~한다"},
                ],
                "follow": [
                    {"q": "What do you do to avoid that kind of morning?", "qKo": "그런 아침을 피하려고 무엇을 하나요?"},
                ],
            },
        ],
    },
    {
        "id": "toeic-p4",
        "part": 4,
        "title": "표 보고 응답",
        "subtitle": "Respond using information provided",
        "range": "Q8 · Q9 · Q10",
        "prepSec": 3,
        "answerSec": 15,
        "readSec": 45,
        "timingNote": "지문 읽기 45초 · 문항당 준비 3초 · 답변 15·15·30초",
        "tips": [
            "45초 동안 표의 '시간·장소·요금·대상' 네 칸만 눈으로 훑는다.",
            "답할 때 표의 정보를 문장으로 옮겨 말한다 — 숫자를 읽는 연습이 곧 점수다.",
            "표에 없는 내용은 'I'm sorry, that information isn't listed'로 정중히 말한다.",
            "30초 문항은 두 항목을 비교하고 추천 이유를 붙이면 된다.",
        ],
        "table": {
            "title": "Riverside Community Center — Saturday Workshops",
            "columns": ["Time", "Program", "Room", "Fee"],
            "rows": [
                ["9:00", "Pottery class", "Studio B", "$20"],
                ["11:00", "Cooking demo", "Kitchen", "Free"],
                ["13:00", "Photography walk", "Meet at lobby", "$10"],
                ["15:00", "Book club", "Room 201", "Free"],
            ],
            "note": "Registration closes on Thursday. Children under 10 must come with an adult.",
        },
        "questions": [
            {
                "id": "toeic-p4-1",
                "q": "What time does the cooking demo start, and where is it held?",
                "qKo": "요리 시연은 몇 시에 시작하고 어디에서 하나요?",
                "answerSec": 15,
                "a": "The cooking demo starts at eleven in the morning, and it's held in the kitchen. It's free, so you don't need to pay.",
                "aKo": "요리 시연은 오전 11시에 시작하고 주방에서 진행됩니다. 무료라서 돈을 내지 않으셔도 됩니다.",
                "expr": [{"en": "It's held in ~", "ko": "~에서 열린다"}, {"en": "you don't need to pay", "ko": "돈을 낼 필요가 없다"}],
                "follow": [{"q": "Do I need to register in advance?", "qKo": "미리 등록해야 하나요?"}],
            },
            {
                "id": "toeic-p4-2",
                "q": "I'd like to do something with my daughter that costs less than fifteen dollars. What do you recommend?",
                "qKo": "딸과 함께 15달러 이하로 할 수 있는 것을 추천해 주시겠어요?",
                "answerSec": 15,
                "a": "I'd recommend the photography walk at one o'clock. It's only ten dollars, and children can join with an adult. If you prefer to stay indoors, the book club at three is free.",
                "aKo": "오후 1시 사진 산책을 추천합니다. 10달러밖에 안 하고, 어린이는 어른과 함께 참여할 수 있어요. 실내가 좋으시면 3시 북클럽은 무료입니다.",
                "expr": [{"en": "I'd recommend ~", "ko": "~을 추천합니다"}, {"en": "children can join with an adult", "ko": "어린이는 어른과 함께 참여할 수 있다"}],
                "follow": [{"q": "Where should we meet for that program?", "qKo": "그 프로그램은 어디서 만나나요?"}],
            },
            {
                "id": "toeic-p4-3",
                "q": "I want to join the photography walk. What should I do, and is there anything I need to know?",
                "qKo": "사진 산책에 참여하고 싶습니다. 무엇을 해야 하고 알아 둘 것이 있나요?",
                "answerSec": 30,
                "a": (
                    "First, you need to register by Thursday, because registration closes that day. The program starts "
                    "at one o'clock, and you should meet at the lobby. The fee is ten dollars, and you'll probably be "
                    "outside for about two hours, so I'd bring a jacket and, of course, your camera. If you have "
                    "children under ten, they need to come with an adult. If you need more information, you can call "
                    "the center."
                ),
                "aKo": (
                    "먼저 목요일까지 등록하셔야 합니다. 등록이 그날 마감되기 때문입니다. 프로그램은 1시에 시작하고 "
                    "로비에서 만나시면 됩니다. 참가비는 10달러이고, 두 시간 정도 야외에 계실 테니 겉옷과 물론 "
                    "카메라를 가져가시는 게 좋습니다. 10살 미만 어린이는 어른과 함께 와야 합니다. 더 필요한 정보가 "
                    "있으시면 센터로 전화하시면 됩니다."
                ),
                "expr": [
                    {"en": "you need to register by Thursday", "ko": "목요일까지 등록해야 한다"},
                    {"en": "you should meet at the lobby", "ko": "로비에서 만나야 한다"},
                    {"en": "I'd bring ~", "ko": "~을 가져갈 것 같다"},
                ],
                "follow": [{"q": "Can I pay at the door?", "qKo": "현장에서 결제할 수 있나요?"}],
            },
        ],
    },
    {
        "id": "toeic-p5",
        "part": 5,
        "title": "의견 제시",
        "subtitle": "Express an opinion",
        "range": "Q11",
        "prepSec": 45,
        "answerSec": 60,
        "readSec": 0,
        "timingNote": "준비 45초 · 답변 60초",
        "tips": [
            "60초 구조: 입장(10초) → 이유 1 + 예시(20초) → 이유 2(15초) → 반대 의견 인정(10초) → 마무리(5초).",
            "입장은 첫 문장에서 분명히. 'It depends'로 시작하면 60초를 버티기 어렵다.",
            "예시는 사람·회사·경험 하나만 구체적으로. 숫자나 상황을 넣으면 내용 점수가 올라간다.",
            "결론에서 첫 문장을 다른 말로 한 번 더 말하면 일관성 점수가 잡힌다.",
        ],
        "questions": [
            {
                "id": "toeic-p5-1",
                "q": "Some companies now let employees work from home permanently. Do you agree with this policy?",
                "qKo": "일부 기업은 직원들이 영구적으로 재택근무를 하도록 허용합니다. 이 정책에 동의하나요?",
                "a": (
                    "I agree with this policy, but only for jobs that don't require being physically present. My first "
                    "reason is time. When I worked on a group project last year, two members joined remotely, and they "
                    "saved almost two hours a day that they would have spent commuting. That time went into the work "
                    "itself. Second, working from home lets people focus on tasks that need deep thinking, like writing "
                    "or coding, without being interrupted every ten minutes. Of course, I understand the concerns — "
                    "some teams really do communicate better face to face, and new employees learn faster in an office. "
                    "So I think the best answer is a flexible policy: let people choose two or three days a week, and "
                    "bring everyone together for important meetings. That way, companies keep the benefits without "
                    "losing the team spirit."
                ),
                "aKo": (
                    "저는 이 정책에 동의하지만, 꼭 사무실에 있어야 하는 업무가 아닌 경우에만 그렇습니다. 첫 번째 이유는 "
                    "시간입니다. 작년에 팀 프로젝트를 할 때 두 명이 원격으로 참여했는데, 통근에 쓸 뻔한 시간을 하루 "
                    "두 시간 가까이 아꼈어요. 그 시간은 일 자체에 쓰였습니다. 둘째, 재택근무는 글쓰기나 코딩처럼 깊은 "
                    "사고가 필요한 일에 10분마다 방해받지 않고 집중할 수 있게 합니다. 물론 우려도 이해합니다. 어떤 "
                    "팀은 확실히 얼굴을 보고 소통할 때 더 잘 되고, 신입 사원은 사무실에서 더 빨리 배웁니다. 그래서 "
                    "가장 좋은 답은 유연한 정책이라고 생각합니다. 주 2~3일은 스스로 고르게 하고, 중요한 회의 때는 "
                    "모두 모이게 하는 것이죠. 그렇게 하면 회사는 장점을 지키면서 팀워크를 잃지 않을 수 있습니다."
                ),
                "expr": [
                    {"en": "I agree with this policy, but only for ~", "ko": "동의하지만 ~인 경우에만"},
                    {"en": "My first reason is ~", "ko": "첫 번째 이유는 ~"},
                    {"en": "I understand the concerns", "ko": "우려도 이해합니다"},
                    {"en": "That way, ~", "ko": "그렇게 하면 ~"},
                ],
                "follow": [
                    {"q": "Would you personally prefer working from home? Why?", "qKo": "본인은 재택근무를 선호하나요? 왜인가요?"},
                    {"q": "How can companies keep teamwork when people work remotely?", "qKo": "재택근무 때 팀워크를 어떻게 유지할 수 있을까요?"},
                ],
            },
        ],
    },
]
