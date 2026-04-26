import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  BookOpen,
  DoorOpen,
  Footprints,
  MessageSquare,
  RefreshCcw,
  ScrollText,
  Search,
  Send,
  Shield,
  Users,
  Volume2,
  VolumeX,
} from "lucide-react";
import mummyCharacterTemplate from "../assets/mummy-character-template.jpeg";
import mummySpaceTemplate from "../assets/mummy-space-template.jpg";
import defaultBgm from "../assets/audio/default-bgm.wav";

const STORAGE_KEY = "multiverse-boardgame-react-state-v1";
const GAME_DATA_KEY = "multiverse-boardgame-react-gamedata-v1";
const STAGE_WIDTH = 1920;
const STAGE_HEIGHT = 1080;
const STAGE_ASPECT_RATIO = STAGE_WIDTH / STAGE_HEIGHT;
const TABLE_SAFE_LEFT = 300;
const TABLE_SAFE_TOP = 120;
const TABLE_SAFE_RIGHT = 1620;
const TABLE_SAFE_BOTTOM = 900;
const SPRITE_FRAME_SIZE = 32;
const SPRITE_DISPLAY_SCALE = 2;
const SPRITE_FRAME_COUNT = 5;
const SPRITE_ROWS = { down: 0, left: 1, right: 2, up: 3 };
const PLAYER_STEP = 14;
const HAND_DROP_MIN_DISTANCE = 16;
const WALK_CONFIRM_DISTANCE = 26;
const JUMP_DURATION = 210;
const MOVE_TICK_MS = 40;
const TAKE_ANIMATION_MS = 260;
const SPEECH_BUBBLE_DURATION = 4000;
const GM_NOTICE_DURATION = 6500;
const SYSTEM_NOTICE_DURATION = 4200;
const CHAT_ITEM_VISIBLE_MS = 3000;
const CHAT_ITEM_FADE_MS = 300;
const CARD_ATTENTION_MS = 3000;
const BOARD_CARD_WIDTH = 45;
const BOARD_CARD_HEIGHT = 60;
const CHARACTER_KEY_TOLERANCE = 70;
const CHARACTER_KEY_FEATHER = 40;
const CHARACTER_TRIM_PADDING = 10;

const bodyPresets = {
  porcelain: { label: "밝은 톤", skin: "#f2d7c6", skinShadow: "#ddb8a3" },
  peach: { label: "피치 톤", skin: "#efc8af", skinShadow: "#d6ab8d" },
  honey: { label: "허니 톤", skin: "#d8a780", skinShadow: "#bb865c" },
  mocha: { label: "모카 톤", skin: "#9a6a4c", skinShadow: "#754a33" },
};

const hairPresets = {
  auburnBob: { label: "단발", hair: "#754034", hairBack: "#4d291f", shine: "#9a604f", shape: "bob" },
  noirParted: { label: "가르마", hair: "#2b2b35", hairBack: "#1b1c24", shine: "#505562", shape: "parted" },
  goldShort: { label: "숏컷", hair: "#c39a3a", hairBack: "#8c6920", shine: "#e2c973", shape: "crop" },
  plumWave: { label: "웨이브", hair: "#5a416e", hairBack: "#3e2d4d", shine: "#7e6194", shape: "wave" },
};

const outfitPresets = {
  burgundyCoat: { label: "버건디 코트", coat: "#7b2f2d", shirt: "#f7efe2", pants: "#2c2738", shoes: "#251e27", accent: "#c99d3d", accentSoft: "#ead8b0", silhouette: "coat" },
  tealVest: { label: "틸 베스트", coat: "#2f6c63", shirt: "#eef3f3", pants: "#2d3340", shoes: "#1b1f29", accent: "#8fd0be", accentSoft: "#d4eee7", silhouette: "vest" },
  amberCape: { label: "앰버 케이프", coat: "#b98b2d", shirt: "#f4ecde", pants: "#43302b", shoes: "#2a1f1c", accent: "#6c3d22", accentSoft: "#edd5a3", silhouette: "cape" },
  violetTailor: { label: "바이올렛 수트", coat: "#6a5aa6", shirt: "#f4f0f5", pants: "#2f2c38", shoes: "#1e1b24", accent: "#cbb9ff", accentSoft: "#ebe2ff", silhouette: "tailored" },
};

const accessoryPresets = {
  none: { label: "없음", kind: "none" },
  brooch: { label: "브로치", kind: "brooch" },
  scarf: { label: "스카프", kind: "scarf" },
  satchel: { label: "가방", kind: "satchel" },
};

const defaultAppearanceByPlayer = {
  p1: { body: "porcelain", hair: "auburnBob", outfit: "burgundyCoat", accessory: "brooch" },
  p2: { body: "peach", hair: "noirParted", outfit: "tealVest", accessory: "satchel" },
  p3: { body: "honey", hair: "goldShort", outfit: "amberCape", accessory: "scarf" },
  p4: { body: "peach", hair: "plumWave", outfit: "violetTailor", accessory: "none" },
  p5: { body: "mocha", hair: "noirParted", outfit: "burgundyCoat", accessory: "scarf" },
};

const characterProfiles = {
  p1: {
    characterName: "문목사",
    tagline: "열린 교회의 담임 목사",
    bio: "개척자. 성직자의 가면 뒤에 욕망과 공포를 숨기고 있다.",
    storybook: `좋은 인상의 남성. 열린 교회의 담임 목사다.

이곳 ‘열린 교회’는 내가 세웠다. 처음 개척할 때만 해도 나는 낮이나 밤이나 예배당을 열어둔 채 성전을 지켰다. 홀로 눈물 흘리며 기도하러 방문하는 사람들의 등을 쓸어내리며, 나와 ‘송장로’는 참으로 순수하게 기도하고 성도들을 사랑했다. 헌신적인 송장로의 활약은 눈부셨다. 궂은일을 도맡아 하던 그녀의 직분은 점차 확장되었고, 어느새 그녀는 우리 교회를 지탱하는 단단한 기둥이 되어 있었다.
늘 열려있는 예배당 덕에 우리 교회는 꽤 유명해졌다. 호기심에 방문하는 낯선 새신자들은 물론이고, 얼굴이 알려져 큰 교회를 가기 부담스러워하는 정계, 법조계, 연예계 사람들도 야심한 시각에 부담 없이 찾아오곤 했다.
하지만 교회가 커지고 헌금이 무섭게 쌓이면서, 나는 더 큰 성전과 더 높은 자리를 갈망하게 되었다. 겉으로는 고귀한 성자처럼 보이려 애썼지만, 내 속은 이미 세속의 욕망으로 곪아있었다. 예전엔 처음 방문한 새신자의 이름을 한 명 한 명 외우며 기도했지만, 이제 스쳐 지나가는 사람들의 얼굴은 잘 기억조차 나지 않는다. 최근 우리 교회에 앙심을 품고 이상한 취재를 하겠다며 들락날락하다가 내게 출입 금지 처분을 받은 '박기자'라는 작자 정도만 겨우 기억날 뿐이다. 내가 성도들에게 무관심해져도 교회가 잘 돌아갔던 건, 사람을 싹싹하게 잘 챙기는 송장로가 든든하게 버티고 있었기 때문이다.
그런데 최근, 한 통의 익명 이메일 제보가 내 삶을 뒤흔들었다. 내가 그토록 신뢰하며 교회 재정을 통째로 맡겼던 송장로가, 내 뒤에서 엄청난 규모의 교회 자금을 빼돌리고 있다는 충격적인 내용이었다. 내 피땀으로 세운 교회의 돈을! 오늘 밤, 나는 교역자실에 홀로 남아 재정 기록을 샅샅이 뒤졌고, 결국 그 더러운 진실을 두 눈으로 확인하고야 말았다.
분노를 참지 못한 나는 당장 송장로에게 전화를 걸었다. 뚜르르- 신호음이 가는데, 이상하게도 고요한 대예배실 쪽에서 희미한 진동 소리가 울려 퍼졌다. 아무리 밤낮없이 교회에서 봉사를 하고 기도하는 그녀라지만, 이 야심한 새벽에 예배당에 있다고?
나는 씩씩거리며 칠흑같이 어두운 예배당으로 향했다. 십자가의 붉은 불빛 아래, 의자에 기대어 앉아있는 실루엣. 분명한 송장로였다. 이성을 잃은 나는 다짜고짜 그녀에게 달려들어 주먹을 휘둘렀다. "네가 감히 내 돈을!" 퍽, 퍽. 내 거친 주먹이 그녀의 얼굴을 무자비하게 짓이기고 있었다. 힘없이 흔들리던 그녀가 툭, 하고 바닥으로 고꾸라졌다. 가쁜 숨을 몰아쉬며 그녀를 내려다보았다. 끈적한 선홍색 피가 그녀의 얼굴을 타고 흘러내리고 있었다. 아무리 강인하게 교회 일을 도맡아 하던 그녀였지만, 건장한 남성인 나와의 체급 차이는 어쩔 수 없었을 것이다. 그녀는 숨을 쉬지 않았다.
'내가... 사람을 죽였나?'
머리가 하얗게 질렸다. 공포에 질린 내 머릿속엔 오직 바닥에 끌린 흔적이나 핏자국을 지우고 시신을 은닉해야겠다는 생각뿐이었다. 나는 황급히 교역자실로 달려가 청소 도구와 운반할 거리를 챙겼다. 교역자실 문이 예배당 교단 앞쪽과 바로 연결되어 있다는 사실이 천만다행이었다. 숨을 고르고, 다시 예배당 문을 열었다.
그 순간, 예배당의 불이 환하게 켜졌다.
"저 사람이 사람을 죽였어요!"
누군가의 외침. 눈부신 조명 아래, 어찌 된 영문인지 낯선 이들이 가득했다. 죽은 송장로 앞에는 안경을 쓴 낯선 남자 ‘이판사’가 당황한 채 서 있었고, 그를 가리키며 소리치는 자는 며칠 전 내가 내쫓았던 박기자였다. 구석에는 웬 ‘노숙자’까지 헝클어진 모습으로 일어나고 있었다.
큰일이다. 이 중 누군가 내가 송장로를 패 죽이는 걸 봤나? 아니, 잠깐. 상황을 보니 이건 오히려 기회다. 박기자는 내가 아니라 이판사를 범인으로 지목하고 있다. 어떻게든 저 남자에게 죄를 덮어씌워야 한다. 최악의 경우, 내 주머니에 있는 ‘교회 뒷문 열쇠’를 이용해 교역자실 뒷문을 통해 도망칠 수도 있다. 하지만 평생을 바쳐 일궈놓은 내 거대한 사업터를 이렇게 허무하게 잃을 순 없다.
일단은, 가장 자애롭고 고귀한 성직자의 가면을 쓰고 저들을 철저히 속여야만 한다.

[ 당신의 죄 : 송장로를 폭행해 죽였다 ]
살인 용의자가 되어 죄에 대한 처벌을 받는다 : 0점
교회를 버리고 도망 다닌다 : 2점 (*단, [교회 뒷문 열쇠] 최종 소유 시)
죄를 처벌받지 않고 교회 목사로 잘 지낸다 : 5점`,
  },
  p2: {
    characterName: "이판사",
    tagline: "정의의 저울을 쥔 법관",
    bio: "법복 아래 감춰진 비리와 생존 본능. 살인 누명을 벗고 살아남아야 한다.",
    storybook: `안경 쓴 남성. 정의의 저울을 쥔 법관이다.
나는 판사다. 세상 사람들은 나를 법과 정의를 수호하는 강직한 판사라 칭송하지만, 법복 아래 감춰진 내 진짜 모습은 다르다. 내가 이 은밀하고 더러운 세계에 발을 들인 건 20년 전, 술에 취한 선배 부장판사의 한마디 때문이었다.
"이보게 이 판사, 법으로 안 되는 일을 해결해 줄 '보이지 않는 손'이 필요하면 그곳을 찾아가 보게. [열린 교회]의 송장로라고... 아주 확실한 사람이 있지."
그렇게 만난 송장로는 입이 무겁고 철두철미한 최고의 사업 파트너였다. 우리는 아무도 의심하지 않는 이 예배당에서 지난 20년간 수많은 재력가와 정치인들의 재판을 조작해주며 뒷돈을 챙겨왔다. 수법은 늘 같았다. 인적 없는 심야 시간, 나는 홀로 조용히 기도하는 신자인 척 예배당에 앉아 있고, 송장로는 내 옆에 다가와 헌금 봉투로 위장한 돈을 두고 사라졌다. 어둠은 우리의 가장 완벽한 공범이었고, 그 비밀은 단 한 번도 새어나간 적이 없었다.
하지만 이번엔 상황이 꼬였다. 최근 내가 맡은 사건이 언론의 엄청난 집중 포화를 받으면서, 국민적 여론이 들끓기 시작한 것이다. 도저히 송장로의 의뢰대로 판결을 덮어줄 수 없는 상황이었다. 결국 나는 내 안위를 위해 원칙대로 판결을 내릴 수밖에 없었고, 의뢰인에게 신뢰를 잃은 송장로는 짐승처럼 분노했다.
"이 판사, 당신 미쳤어? 받은 돈에 위약금까지 얹어서 당장 환불해 놔요. 안 그러면 당신이랑 나눈 대화들, 전부 세상에 뿌릴 줄 알아!"
협박에 가까운 텔레그램 메시지. 나는 20년간 쌓아온 내 명예를 지키기 위해 어쩔 수 없이 거액의 현금을 챙겨 이 새벽, 예배당으로 향했다. 칠흑 같이 어두운 대예배실. 늘 앉아있던 그 자리, 십자가의 희미한 붉은 불빛 아래 송장로의 실루엣이 보였다.
"가져왔습니다. 이제 그만하시죠."
짜증 섞인 목소리로 다가가 시신 옆에 돈 봉투를 내려놓는 순간, 발끝에 끈적한 액체가 닿았다. 비릿한 냄새. 피였다. 자세히 보니 송장로는 피투성이가 된 채 널브러져 있었다. 죽은 것이다. 심장이 덜컹 내려앉았다. 그 철두철미한 브로커가 대체 누구에게, 왜? 머릿속이 하얘지며 당황해 시신을 살피던 그때, 갑자기 예배당 전체에 눈이 멀 듯 환한 조명이 켜졌다.
"사... 사람이 죽었어!! 저기 살인자가 있다!!"
고개를 돌려보니, 예전 내가 횡령범으로 엮어 유죄 판결을 내리고 쫓아냈던 전직 기자 놈(박기자)이 나를 손가락질하며 악을 쓰고 있었다. 이어서 교단 앞 문이 열리며 청소 도구를 든 목사가 파랗게 질린 표정으로 서 있었고, 구석에는 더러운 노숙자 하나가 놀란 눈으로 이쪽을 보고 있었다.
함정이다. 누군가 나를 완벽하게 옭아매려 작정했다. 이대로 경찰이 오면 살인죄를 뒤집어쓰는 것은 물론이고, 내 모든 비리와 명예까지 산산조각이 난다. 나는 분명 악질 판사일지는 몰라도, 살인자는 아니다!
하지만 여기 있는 그 누구도 내 결백을 믿어주지 않을 것이다. 그렇다면 방법은 하나뿐이다. 내 품에는 내 서명 하나면 누구든 무죄로 만들어 줄 수 있는 무소불위의 권력, **[사법거래 각서]**가 있다. 어차피 내가 살아야 이 사법거래 각서도 쓸모가 있으니, 이 권력이 필요한 자라면 반드시 내 편이 되어줄 것이다. 이걸 미끼로 저 목사나 노숙자를 완벽하게 내 편으로 포섭해야 한다. 살기 위해서는 수단과 방법을 가려선 안 된다. 내가 살아야 법도 있는 것이다.

[당신의 죄 : 송장로를 통해 사법 거래 비리를 저질렀다]
살인 용의자로 지목되어 모든 비리가 까발려지고 구속된다 : 0점
살인 누명은 벗었으나 사법 비리가 발각되어 모든 것을 잃는다 : 2점
살인 누명을 벗고 다수결을 장악해 완벽하게 생존한다 : 5점`,
  },
  p3: {
    characterName: "박기자",
    tagline: "진실을 좇던 기자",
    bio: "추락한 기자. 복수를 위해 증거를 모으다 살인을 저질렀다.",
    storybook: `집요한 인상의 여성. 진실을 좇던 기자다.
나는 한때 정의를 좇는 기자였다. 소속 언론사의 추악한 내부 비리를 고발했을 때, 나는 세상이 내 편을 들어줄 줄 알았다. 하지만 그 오만한 '이판사'가 내린 편파적인 판결 하나가 내 인생을 처참하게 박살 냈다. 그들은 오히려 나를 회사 자금을 빼돌린 횡령범으로 둔갑시켰고, 나는 언론계에서 영원히 퇴출당했다.
나는 이판사를 무너뜨리기 위해 미친 듯이 놈의 뒤를 캤다. 그리고 마침내, 놈이 누군가에게 두툼한 헌금 봉투를 건네는 밀회 현장을 포착했다. 이판사는 이 [열린 교회]의 '송장로'라는 여자를 브로커 삼아 불법적인 사법 거래를 해왔던 것이다. 회사와 짜고 나를 횡령범으로 만든 것 역시 이판사와 송장로의 짓이었다.
하지만 고작 사진 몇 장으로 고발해 봤자, 이 거대한 카르텔 윗선에서 꼬리 자르기로 끝날 게 뻔했다. 나는 결심했다. 모을 수 있는 모든 증거를 긁어모아, 누구도 반박할 수 없는 완벽한 고발 다큐멘터리를 만들어 세상에 뿌려버리겠다고.
나는 가짜 성경 앱 QR코드를 이용해 브로커 송장로의 휴대폰을 해킹했고, 그들의 모든 텔레그램 대화를 실시간으로 훔쳐보았다.
그들의 더러운 대화 속에서, 나는 이판사가 현재 덮으려 하는 재판의 핵심 증거를 포착했다. 나는 이 증거를 다른 언론사들에 익명으로 제보했고, 세상은 발칵 뒤집혔다. 여론의 매서운 눈치를 보던 이판사는 결국 송장로와 약속한 판결을 내리지 못했다.
이 일로 송장로는 크게 곤란해졌다. 사법 거래를 의뢰한 클라이언트에게 어마어마한 위약금을 물어주게 된 것이다. 신뢰 유지가 생명이라나 뭐라나. 송장로는 이판사에게 위약금을 당장 물어내라며 협박했고, 오늘 새벽 인적 없는 예배당으로 놈을 불러냈다.
한편, 조사를 하던 중 나는 송장로가 이 교회의 헌금도 엄청나게 횡령하고 있다는 사실을 알아냈다. 그러던 중 눈치 없는 문목사가 나를 불량한 사람 취급하며 교회에서 내쫓았고, 나는 그 멍청한 목사에게 자비로운 선물을 하나 주기로 했다. 바로 오늘 밤, 송장로의 횡령 사실을 폭로하는 익명의 메일을 문목사에게 보낸 것이다.
그리고 오늘 새벽. 이판사와 송장로의 거래 현장을 다큐멘터리에 담기 위해, 나는 일찍부터 예배당에 숨어들었다. 나이트비전 카메라를 세팅하고 어둠 속에서 숨죽여 기다렸다.
그런데, 칠흑 같은 어둠 속에서 송장로가 내 기척을 눈치채고 말았다.
"누구야!"
다가오는 그녀와 거친 몸싸움이 벌어졌다. 이대로 내 복수극을 망칠 수 없다는 본능, 그리고 내 인생을 망친 일당을 향한 분노가 한꺼번에 폭발했다. 극도로 흥분한 나는 손에 들고 있던 무거운 카메라로 그녀의 뒷머리를 힘껏 내리쳤다.
'퍽!'
소름 끼치는 둔탁한 소리와 함께 검은 플라스틱 파편이 사방으로 튀었고, 송장로는 바닥으로 고꾸라져 즉사하고 말았다.
손이 덜덜 떨렸다. 놈들의 비리를 폭로하려다가, 내가 살인자가 되어버리다니.
바로 그때, 예배당 문이 덜컹 열렸다. 나는 황급히 어둠 속 구석으로 몸을 숨겼다. 들어온 사람은 뜻밖에도 아까 내가 메일을 보냈던 문목사였다. 그는 씩씩거리며 걸어오더니, 이미 숨이 끊어진 송장로를 발견하고는 분노를 이기지 못해 시신을 마구잡이로 패기 시작했다.
나는 숨죽인 채 카메라를 들어 그 장면을 고스란히 녹화했다. 아까 내리친 충격으로 메모리 카드가 고장 나 화면이 자꾸 끊겼지만, 이 영상은 내 목숨줄이다.
'저 미친 목사가... 자기가 사람을 죽인 줄 아는 건가?'
목사가 시체를 치우려는 듯 허둥지둥 밖으로 나간 사이, 드디어 이판사가 예배당에 들어왔다. 놈이 헌금 봉투를 송장로의 시신 옆에 내려놓다가 그녀가 죽은 것을 발견하고 그 자리에 얼어붙은 순간, 나는 확신했다. 신이 내게 완벽한 복수의 기회를 주었다는 것을.
나는 예배당 정문 쪽으로 걸어가 조명 스위치를 단번에 올리고, 문을 철컥 잠그며 있는 힘껏 소리쳤다. 구석에서 자고 있던 웬 더러운 노숙자 하나가 소스라치게 놀라 깨어났다. 모두의 시선이 나를 향했다.
"사... 사람이 죽었어!! 저기 살인자가 있다!!"

[당신의 죄 : 카메라로 송장로를 내리쳐 살해했다]
살인 용의자가 되어 범행이 발각되고 처벌을 받는다 : 0점
진범인 것은 들키지 않았으나 복수(이판사 구속)에 실패한다 : 2점
이판사에게 완벽한 누명을 씌워 구속시키고 복수를 완성한다 : 5점`,
  },
  p4: {
    characterName: "노숙자",
    tagline: "갈 곳 없는 도망자",
    bio: "과거 범죄를 숨긴 채 사건에 휘말렸다. 열쇠/면죄부를 찾아야 한다.",
    storybook: `수염난 지저분한 남성. 갈 곳 없는 부랑자다.
추웠다. 뼛속까지 시린 바람이 불었다. 나는 아주 먼 외딴섬, '흑월도'에서 바다를 건너 이 낯선 도시까지 도망쳐 왔다. 보름 전, 내 눈길을 끄는 한 여성이 있었다. 이름도 모르는 그녀였지만, 나는 흥미를 느끼고 그녀의 일거수일투족을 몰래 지켜보며 관찰 일기까지 써왔다. 그러다 결국 그 삐뚤어진 집착을 참지 못하고 그녀에게 씻을 수 없는 짓(강간 및 폭행)을 저지르고 말았다. 수배망이 좁혀오자 나는 그 섬을 벗어나 기나긴 도주를 시작했다.
경찰의 눈을 피해 상가 복도와 빈 건물의 잠긴 문들을 수없이 흔들어보았지만, 어디에서도 몸을 누일 온기를 찾을 수 없었다. 주머니 속의 핫팩마저 차갑게 식어버려 절망하고 있을 때, 저 멀리 십자가 불빛이 보였다.
요즘 세상에 문이 열려 있는 교회라니. 조심스럽게 밀어본 대예배실 문은 정말 열려 있었고, 내부는 놀랍도록 따뜻했다. 이 야심한 새벽에 누가 오겠는가. 나 같은 죄인도 잠시 쉴 곳은 필요하다. 나는 안도하며 구석진 의자 밑에 몸을 웅크렸고, 살기 위해 얕은 잠에 빠져들었다.
얼마나 지났을까. 기묘하고도 지독한 악몽이 시작되었다. 꿈속에서 나는 거룩하고도 두려운 천사의 목소리를 듣게 되었다.
*"가련한 도망자여. 네 지은 죄의 무게를 피해 달아나려거든, **[열쇠]*를 품으라. 허나 기억하라. 죄를 등진 도주가 비록 달콤할지라도, 그것은 영원히 안식을 잃고 떠돌아야 할 더 무거운 형벌이 될지니."
*"네 죄를 마주할 줌의 용기조차 없는 타락한 영혼이여. 차라리 천사에게 엎드려 **[면죄부]*를 구하라. 천사의 날개가 온전히 하늘에 붙어 있는 한, 네 더러운 죄는 눈 녹듯 사함 받을 것이다. 허나 명심하라. 그 용서는, 타락한 천사가 다른 인간을 잔인하게 짓밟고 피를 빼앗아 쥐여주는 기만적인 용서이니라."
그 웅장한 목소리가 끝남과 동시에, 현실인지 꿈인지 모를 생생한 소리들이 귓가를 때렸다. 누군가 단단한 것으로 머리를 내리치는 듯한 '퉁!' 하는 둔탁한 소리. 이어서 무언가 바닥에 부딪혀 산산조각 나는 '빠직!' 하는 소리였다. 그리고 나는 꿈속에서, 그 타락한 천사에게 숨을 쉴 수 없을 만큼 얼굴을 흠씬 두들겨 맞는 끔찍한 고통에 시달렸다.
번쩍! 누군가의 비명과 함께 눈이 멀 듯한 조명이 켜졌다. "여... 여기가 천국인가? 심판의 천사들인가...?" 나는 꿈에서 덜 깬 채로 멍하니 중얼거리며 몸을 일으켰다. 하지만 눈을 비비고 초점을 맞춘 순간, 천국은 산산조각 났다.
예배당 한가운데, 피투성이가 된 여자의 시체가 널브러져 있었다. 그리고 내 앞에는 당황한 기색의 양복 입은 남자, 교단 앞의 목사, 스위치를 잡고 있는 또 다른 사람이 대치하고 있었다.
"사... 사람이 죽었어!! 저기 살인자가 있다!!"
스위치를 잡은 남자가 소리쳤다. 그제야 어안이 벙벙하던 내 머릿속에 차가운 현실이 내리꽂혔다. 살인사건이다. 미치고 환장할 노릇이다. 왜 하필 내가 몸을 숨긴 곳에서, 내가 잠든 사이에 이런 끔찍한 일이 벌어진 거란 말인가! 내가 대체 왜 이런 일에 휘말려야 한단 말인가!
분명 누군가 경찰을 부를 것이다. 이대로 사건에 휘말려 경찰에게 신원이 조회되면 끝장이다. 이 살인사건의 범인으로 몰리는 건 둘째치고, 내가 보름 전 흑월도에서 저지른 강간 수배범이라는 사실이 들통나면 평생 감옥에서 썩어야 한다. 심지어 저들은 만만한 나 같은 놈에게 이 살인죄까지 뒤집어씌우려 들지도 모른다.
어떻게든 살아서 이곳을 빠져나가야 한다. 내 낡은 가방 속에는 그 여자를 미행했던 스토킹 일지와 칼이 들어있다. 이게 들통나면 꼼짝없이 범인으로 몰린다. 그때, 꿈속에서 들었던 목소리가 머리를 스쳤다. **'열쇠'**와 '면죄부'. 그게 진짜 열쇠 모양인지, 종이 쪼가리인지, 아니면 어떤 상징인지 나는 도무지 알 길이 없다. 하지만 살길은 그것뿐이다. 이 예배당 안에 있는 저 사람들 중 누군가가 분명 나를 구원해 줄 그 '열쇠'나 '면죄부'를 가지고 있을 것이다. 무슨 짓을 해서라도 그것을 찾아내야 한다. 나는 아무것도 모르는, 그저 재수 없게 휘말린 불쌍한 노숙자 행세를 해야 한다.

[당신의 죄 : 15일 전 흑월도에서, 강간 및 폭행을 저질렀다]
살인 용의자로 지목되거나, 과거 범죄가 발각되어 구속된다 : 0점
누군가에게 [열쇠]를 얻어내 다시 도망자 신세로 살아남는다 : 2점
누군가에게 [면죄부]를 얻어내 과거의 죄를 완전히 사면받는다 : 5점`,
  },
};

const sharedRulebook = {
  title: "열린 교회 닫힌 문",
  body: `| OPENING
문목사
“ 교회는 죄인이 오는 곳입니다. 여러분 모두에게 열려 있습니다. ”

개척자 문목사가 세운 이곳 [열린 교회]는 그 이름처럼 24시간 대예배실의 문을 닫지 않습니다. 평일 늦은 밤부터 새벽까지, 이곳은 관리하는 이조차 없이 텅 비어 있는 날이 허다합니다. 지치고 방황하는 영혼들이 언제든 찾아와 무릎 꿇고 기도할 수 있도록, 늘 짙은 어둠 속에 오직 희미한 십자가 하나만이 붉게 켜져 있을 뿐입니다.
하지만 오늘 밤, 이 고요한 안식은 끔찍한 비명과 함께 깨졌습니다. 모두의 존경을 한 몸에 받던 교회의 기둥, 송장로가 예배당 한복판에서 차가운 송장으로 발견된 것입니다. 경찰이 도착하기 전, 굳게 잠긴 예배당 문 안에서— 절대적인 신의 음성이 여러분의 귓가를 울립니다.

“너희는 들으라.
재물을 탐하고, 정욕에 눈멀며, 네 형제를 치고, 원수를 살해함은 죄로되,

내가 진실로 진실로 너희에게 이르노니

'네 허물을 덮지 말라.' '공의를 저버리지 말라.'
'형벌에서 도망치지 말라.' '죄를 네 형제에게 전가하지 말라.'

죄는 사함받을 수 있으나 죄를 외면하는 것은 가증한 일이니라.
(정죄록 1장 1-3절)”

예배당의 모든 조명이 일제히 환하게 켜졌습니다. 눈부신 조명 아래, 송장로의 시신을 둘러싼 네 사람의 모습이 드러납니다. 예배당 가운데 의자에 사망한 [송장로]가 쓰러져있고, 머리맡에는 정죄록 말씀이 펼쳐져 있습니다.
송장로 바로 옆에는 당황한 기색을 감추지 못한 채 [이판사]가 서 있습니다. 교단 맨 앞쪽 교역자실 문앞에는 청소 도구를 챙겨 든 [문목사]의 손이 파르르 떨리고 있습니다. 예배당 구석, 헝클어진 모습으로 몸을 일으킨 [노숙자]는 황급히 출구를 바라봅니다. 그리고 맨 뒤쪽 예배당 정문 앞, 조명 스위치를 올린 [박기자]가 시신 옆에 선 이판사를 가리켜 외칩니다.

박기자
“ 사… 사람이 죽었어 !! 저기 살인자가 있다 ! ”

박기자가 예배당 정문을 굳게 잠갔습니다. 이제 누구도 이 문을 나갈 수 없습니다. 신은 말했습니다. 죄를 지은 것보다 가증한 것은 그 죄를 부인하는 것이라고. 여러분은 이제 서로의 치부를 들춰내고, 누군가를 심판대에 세워야 합니다. 그것이 진실이든, 거짓이든 말입니다.

| RULE
게임의 규칙입니다.

[기억]
스토리북에는 당신의 기억이 적혀 있습니다. 스토리북의 내용을 타인에게 직접 보여주는 행위는 금지되며, 오직 대화로만 정보를 전달해야 합니다. 내용을 그대로 읽지 말고 본인의 기억을 되짚어 말하듯 자연스럽게 증언해 주십시오.

[거짓말]
자신의 손익에 따라 자유롭게 거짓말을 할 수 있습니다. 하지만 증거에 의해 거짓이 밝혀질 경우 범인으로 몰릴 강력한 빌미가 되며, 무리한 거짓말은 게임 진행에 어려움을 초래할 수 있으니 신중해야 합니다.

[소지품]
플레이어는 개인 소지품을 각각 4개씩 소유합니다. 총 16개의 소지품 중 승리 조건에 직접적인 영향을 미치는 아이템 2개가 존재합니다. 이 아이템의 최종 소유 여부가 승패를 결정지을 수 있습니다. 본인이 소유한 소지품 카드 내용은 절대 상대에게 직접 보여줘서는 안 됩니다.

총 4번의 라운드를 진행합니다.
한 라운드는 “5분의 밀담 - 10분의 전체 토론”으로 구성되어 있습니다.

[ 밀담 ]
매 라운드 2명씩 나누어 5분간 짧은 1:1 밀담을 진행합니다. 교회 출석일 순으로, 1라운드는 문목사가, 2라운드는 이판사가, 3라운드는 박기자가, 4라운드는 노숙자가 밀담할 상대를 먼저 지목합니다. 지목 받지 못한 사람들은 자동으로 서로의 밀담 상대가 됩니다. 네번의 라운드 동안 모든 사람과 최소 한 번씩은 파트너가 되어야 합니다.

[ 밀담 中 소지품 교환 ]
밀담이 끝나면 상대의 소지품 카드 뒷면만 본 채로 1개의 소지품을 선택해 가져옵니다. 획득한 소지품의 내용을 반드시 밀담이 아닌 예배당(로비)에서 확인해야합니다.

[ 전체 토론 ]
밀담과 소지품 교환이 끝나면 예배당(로비)에 모두 모여 10분간 자유롭게 공개 토론을 진행합니다.

[ 전체 토론 中 신의 음성 공개 ]
공개 토론에 앞서, 새로운 신의 음성이 제공됩니다. 신의 음성은 아이템에 대한 추가 정보입니다.

[ 전체 토론 中 단서 조사 ]
10분의 토론 시간 동안 인당 1장의 단서를 조사해야 하며, 조사한 단서는 반드시 전체 공개됩니다. 단서 내용은 직접 조사한 것처럼 설명해 주십시오.

[ 전체 토론 中 소지품 소유권 포기 ]
예배당 공개토론 중에는 언제든 소지품의 소유권을 포기하고 전체 공개할 수 있습니다. 소유권을 포기한 카드는 교환이 불가능하며 승리 조건에 영향을 미치지 못합니다. 단, 최소 1장의 카드는 보유해야 합니다.

[ 최종 지목 ]
모든 라운드가 종료되면 살인자라고 생각하는 사람을 지목합니다.`,
};

const gmRulebook = {
  title: "GM 메모",
  body: `- 이 시나리오는 “기억(스토리북) + 소지품 교환 + 단서 공개 + 최종 지목”으로 긴장을 끌어올립니다.
- 플레이어가 규칙을 어렵게 느끼면, “스토리북은 보여주지 말고 말로만” / “소지품은 뒷면만 보고 교환” / “단서는 반드시 공개” 3가지만 먼저 강조하세요.
- 맵 배치(초기 리스폰)를 미리 잡아두면 진행이 매끄럽습니다.`,
};

const roomAccent = {
  lobby: "from-slate-900/80 via-slate-900/50 to-sky-950/70",
  study: "from-amber-900/80 via-zinc-900/60 to-stone-950/80",
  dining: "from-emerald-900/80 via-teal-950/60 to-slate-950/80",
  garden: "from-lime-900/75 via-emerald-950/60 to-slate-950/80",
};

const initialState = loadState();
const spriteSheetCache = new Map();
let spriteSheetPromise = null;

function makeId(prefix) {
  try {
    return `${prefix}_${crypto.randomUUID()}`;
  } catch {
    return `${prefix}_${Math.random().toString(16).slice(2)}_${Date.now()}`;
  }
}

function loadGameData() {
  const saved = localStorage.getItem(GAME_DATA_KEY);
  if (!saved) return normalizeGameData(createDefaultGameData());
  try {
    return normalizeGameData(JSON.parse(saved));
  } catch {
    return normalizeGameData(createDefaultGameData());
  }
}

function saveGameData(gameData) {
  localStorage.setItem(GAME_DATA_KEY, JSON.stringify(gameData));
}

function createDefaultGameData() {
  const seed = createInitialStateFromSeed();
  const nonGmCharacters = Object.entries(characterProfiles).map(([id, profile]) => ({
    id,
    name: profile.characterName ?? "캐릭터",
    tagline: profile.tagline ?? "",
    bio: profile.bio ?? "",
    tags: [],
    storybook: profile.storybook ?? "",
  }));

  const categories = Array.from(new Set((seed.cards ?? []).map((card) => String(card.type ?? "").trim()).filter(Boolean)));

  const items = (seed.cards ?? []).map((card) => ({
    id: card.id,
    title: card.title ?? card.summary ?? "",
    description: card.description ?? "",
    category: card.type ?? "",
    spawn: { x: card.x ?? 0, y: card.y ?? 0 },
  }));

  return {
    version: 1,
    meta: { id: "default", title: "열린 교회 닫힌 문" },
    gmEnabled: true,
    characters: nonGmCharacters,
    books: {
      sharedRulebook: { title: sharedRulebook.title, body: sharedRulebook.body },
      gmRulebook: { title: gmRulebook.title, body: gmRulebook.body },
    },
    cards: {
      categories: categories.length ? categories : ["단서"],
      items,
    },
    map: {
      mapSize: seed.mapSize,
      movementBounds: seed.movementBounds,
      rooms: seed.rooms,
      spawns: {
        players: Object.fromEntries(seed.players.map((player) => [player.id, { x: player.x, y: player.y, currentRoom: player.currentRoom }])),
        cards: Object.fromEntries(seed.cards.map((card) => [card.id, { x: card.x, y: card.y }])),
      },
    },
  };
}

function normalizeGameData(data) {
  const fallback = createDefaultGameData();
  if (!data || typeof data !== "object") return fallback;

  const meta = data.meta && typeof data.meta === "object" ? data.meta : {};
  const metaId = typeof meta.id === "string" && meta.id.trim() ? meta.id.trim() : fallback.meta.id;
  const metaTitle = typeof meta.title === "string" && meta.title.trim() ? meta.title.trim() : fallback.meta.title;
  const gmEnabled = "gmEnabled" in data ? Boolean(data.gmEnabled) : fallback.gmEnabled;

  const characters = Array.isArray(data.characters) ? data.characters : [];
  const normalizedCharacters = characters
    .filter((item) => item && typeof item === "object" && typeof item.id === "string" && item.id.trim())
    .map((item) => ({
      id: item.id.trim(),
      name: typeof item.name === "string" ? item.name : "캐릭터",
      tagline: typeof item.tagline === "string" ? item.tagline : "",
      bio: typeof item.bio === "string" ? item.bio : "",
      tags: Array.isArray(item.tags) ? item.tags.map((tag) => String(tag ?? "").trim()).filter(Boolean) : [],
      storybook: typeof item.storybook === "string" ? item.storybook : "",
    }));

  const books = data.books && typeof data.books === "object" ? data.books : {};
  const sharedRulebookData = books.sharedRulebook && typeof books.sharedRulebook === "object" ? books.sharedRulebook : {};
  const gmRulebookData = books.gmRulebook && typeof books.gmRulebook === "object" ? books.gmRulebook : {};

  const cards = data.cards && typeof data.cards === "object" ? data.cards : {};
  const categories = Array.isArray(cards.categories) ? cards.categories.map((c) => String(c ?? "").trim()).filter(Boolean) : [];
  const items = Array.isArray(cards.items) ? cards.items : [];
  const normalizedCards = items
    .filter((item) => item && typeof item === "object" && typeof item.id === "string" && item.id.trim())
    .map((item) => ({
      id: item.id.trim(),
      title: typeof item.title === "string" && item.title.trim().length ? item.title : (typeof item.summary === "string" ? item.summary : ""),
      description: typeof item.description === "string" ? item.description : "",
      category: typeof item.category === "string" ? item.category : "",
      spawn: { x: typeof item.spawn?.x === "number" ? item.spawn.x : 0, y: typeof item.spawn?.y === "number" ? item.spawn.y : 0 },
    }));

  const map = data.map && typeof data.map === "object" ? data.map : {};
  const mapSize = normalizeMapSize(map.mapSize);
  const movementBounds = {
    left: typeof map.movementBounds?.left === "number" ? map.movementBounds.left : TABLE_SAFE_LEFT,
    top: typeof map.movementBounds?.top === "number" ? map.movementBounds.top : TABLE_SAFE_TOP,
    right: typeof map.movementBounds?.right === "number" ? map.movementBounds.right : TABLE_SAFE_RIGHT,
    bottom: typeof map.movementBounds?.bottom === "number" ? map.movementBounds.bottom : TABLE_SAFE_BOTTOM,
  };
  const rooms = Array.isArray(map.rooms) ? map.rooms : [];
  const normalizedRooms = rooms
    .filter((room) => room && typeof room === "object" && typeof room.id === "string" && room.id.trim())
    .map((room) => ({
      id: room.id,
      name: typeof room.name === "string" ? room.name : "방",
      x: typeof room.x === "number" ? room.x : 0,
      y: typeof room.y === "number" ? room.y : 0,
      width: typeof room.width === "number" ? room.width : 300,
      height: typeof room.height === "number" ? room.height : 260,
    }));

  return {
    version: 1,
    meta: { id: metaId, title: metaTitle },
    gmEnabled,
    characters: normalizedCharacters.length ? normalizedCharacters : fallback.characters,
    books: {
      sharedRulebook: {
        title: typeof sharedRulebookData.title === "string" ? sharedRulebookData.title : fallback.books.sharedRulebook.title,
        body: typeof sharedRulebookData.body === "string" ? sharedRulebookData.body : fallback.books.sharedRulebook.body,
      },
      gmRulebook: {
        title: typeof gmRulebookData.title === "string" ? gmRulebookData.title : fallback.books.gmRulebook.title,
        body: typeof gmRulebookData.body === "string" ? gmRulebookData.body : fallback.books.gmRulebook.body,
      },
    },
    cards: {
      categories: categories.length ? categories : fallback.cards.categories,
      items: normalizedCards.length ? normalizedCards : fallback.cards.items,
    },
    map: {
      mapSize,
      movementBounds,
      rooms: normalizedRooms.length ? normalizedRooms : fallback.map.rooms,
      spawns: map.spawns && typeof map.spawns === "object" ? map.spawns : fallback.map.spawns,
    },
  };
}

function createInitialStateFromSeed() {
  const sessionStart = Date.now();
  return {
    gameData: null,
    activePlayerId: "p1",
    modalCardId: null,
    profileModalPlayerId: null,
    documentModalType: null,
    tableActionCardId: null,
    pendingAction: null,
    storybookModalPlayerId: null,
    storybookPageIndex: 0,
    selectedRoomId: "study",
    mapSize: { width: STAGE_WIDTH, height: STAGE_HEIGHT },
    stopwatchLabel: "조사 페이즈",
    stopwatchStartedAt: null,
    stopwatchElapsedMs: 0,
    timeMode: "timer",
    timerDurationSec: 300,
    timerPanelDismissed: false,
    walkTarget: null,
    pendingWalkTarget: null,
    movementBounds: { left: TABLE_SAFE_LEFT, top: TABLE_SAFE_TOP, right: TABLE_SAFE_RIGHT, bottom: TABLE_SAFE_BOTTOM },
    bgmPlaying: true,
    bgmVolume: 0.6,
    bgmMuted: false,
    decisionSession: null,
    lastDecisionOutcome: null,
    lastDecisionModalOpen: false,
    rooms: [
      { id: "study", name: "교역자실", x: 400, y: 118, width: 382, height: 323 },
      { id: "dining", name: "예배당 정문", x: 1315, y: 118, width: 374, height: 323 },
      { id: "garden", name: "예배당 구석", x: 1315, y: 575, width: 374, height: 287 },
    ],
    players: [
      { id: "p1", name: "문목사", role: "PL", appearance: { ...defaultAppearanceByPlayer.p1 }, facing: "down", stepCycle: 0, lastMovedAt: 0, jumpUntil: 0, x: 850, y: 520, currentRoom: "lobby", joinedRoomAt: { lobby: sessionStart } },
      { id: "p2", name: "이판사", role: "PL", appearance: { ...defaultAppearanceByPlayer.p2 }, facing: "down", stepCycle: 0, lastMovedAt: 0, jumpUntil: 0, x: 980, y: 520, currentRoom: "lobby", joinedRoomAt: { lobby: sessionStart } },
      { id: "p3", name: "박기자", role: "PL", appearance: { ...defaultAppearanceByPlayer.p3 }, facing: "down", stepCycle: 0, lastMovedAt: 0, jumpUntil: 0, x: 1110, y: 520, currentRoom: "lobby", joinedRoomAt: { lobby: sessionStart } },
      { id: "p4", name: "노숙자", role: "PL", appearance: { ...defaultAppearanceByPlayer.p4 }, facing: "down", stepCycle: 0, lastMovedAt: 0, jumpUntil: 0, x: 1240, y: 520, currentRoom: "lobby", joinedRoomAt: { lobby: sessionStart } },
      { id: "gm", name: "GM", role: "GM", appearance: { ...defaultAppearanceByPlayer.p5 }, facing: "down", stepCycle: 0, lastMovedAt: 0, jumpUntil: 0, x: 1020, y: 330, currentRoom: "lobby", joinedRoomAt: { lobby: sessionStart } },
    ],
    cards: [
      { id: "c1", title: "정죄록 1장 1-3절", description: "“네 허물을 덮지 말라… 죄를 네 형제에게 전가하지 말라.” 사건 현장 머리맡에 펼쳐져 있었다.", x: 830, y: 380, isFaceUp: false, handFaceUp: false, ownerId: null, type: "시체 조사" },
      { id: "c2", title: "헌금 봉투(현금)", description: "두툼한 봉투. 겉에는 ‘감사 헌금’이라 적혀 있으나, 안에는 현금 다발이 들어 있다.", x: 930, y: 380, isFaceUp: false, handFaceUp: false, ownerId: null, type: "이판사 조사" },
      { id: "c3", title: "카메라 파편", description: "검은 플라스틱 파편. 둔탁한 타격 뒤에 튄 것처럼 보인다.", x: 1030, y: 380, isFaceUp: false, handFaceUp: false, ownerId: null, type: "박기자 조사" },
      { id: "c4", title: "익명 이메일 출력본", description: "송장로의 횡령을 폭로하는 익명 메일. 수신자는 문목사.", x: 1130, y: 380, isFaceUp: false, handFaceUp: false, ownerId: null, type: "문목사 조사" },

      { id: "c5", title: "교회 뒷문 열쇠", description: "교역자실 뒤편으로 통하는 문을 열 수 있는 열쇠. 탈출과 생존에 영향을 줄 수 있다.", x: 760, y: 470, isFaceUp: false, handFaceUp: false, ownerId: null, type: "문목사 조사" },
      { id: "c6", title: "사법거래 각서", description: "서명 하나면 누군가를 무죄로 만들 수 있는 권력의 증표. 표를 사거나 협박하는 데 쓰일 수 있다.", x: 820, y: 470, isFaceUp: false, handFaceUp: false, ownerId: null, type: "이판사 조사" },
      { id: "c7", title: "면죄부", description: "죄를 ‘사함받았다’는 상징적 문서. 누군가에게는 구원, 누군가에게는 거래의 미끼.", x: 880, y: 470, isFaceUp: false, handFaceUp: false, ownerId: null, type: "노숙자 조사" },
      { id: "c8", title: "스토킹 일지", description: "관찰 일기. 타인의 행적을 기록한 노트로, 들키면 치명적이다.", x: 940, y: 470, isFaceUp: false, handFaceUp: false, ownerId: null, type: "노숙자 조사" },
      { id: "c9", title: "칼", description: "낡았지만 날이 서 있다. 위협과 공포를 불러올 물건.", x: 1000, y: 470, isFaceUp: false, handFaceUp: false, ownerId: null, type: "노숙자 조사" },
      { id: "c10", title: "고장 난 메모리 카드", description: "영상이 끊겨 저장되지만, 결정적 장면의 일부가 남아 있을지도 모른다.", x: 1060, y: 470, isFaceUp: false, handFaceUp: false, ownerId: null, type: "박기자 조사" },
      { id: "c11", title: "나이트비전 카메라", description: "어둠 속 촬영 장비. 사건 전후의 움직임을 기록했을 가능성이 있다.", x: 1120, y: 470, isFaceUp: false, handFaceUp: false, ownerId: null, type: "박기자 조사" },
      { id: "c12", title: "청소 도구(표백제)", description: "핏자국을 지우고 흔적을 없애는 데 쓸 수 있는 도구.", x: 1180, y: 470, isFaceUp: false, handFaceUp: false, ownerId: null, type: "문목사 조사" },
      { id: "c13", title: "재정 장부", description: "헌금과 지출 내역. 횡령의 증거가 숨어 있을 수 있다.", x: 1240, y: 470, isFaceUp: false, handFaceUp: false, ownerId: null, type: "문목사 조사" },
      { id: "c14", title: "출입 금지 통보서", description: "박기자에게 내려진 출입 금지. 교회가 숨기는 것이 있음을 시사한다.", x: 1300, y: 470, isFaceUp: false, handFaceUp: false, ownerId: null, type: "문목사 조사" },
      { id: "c15", title: "텔레그램 대화 캡처", description: "송장로와 누군가의 거래 메시지. 폭로되면 모두가 무너진다.", x: 1360, y: 470, isFaceUp: false, handFaceUp: false, ownerId: null, type: "이판사 조사" },
      { id: "c16", title: "위약금 청구서", description: "사법 거래 실패로 발생한 거액의 위약금. 누군가에게는 동기다.", x: 1420, y: 470, isFaceUp: false, handFaceUp: false, ownerId: null, type: "이판사 조사" },
      { id: "c17", title: "가짜 성경 앱 QR코드", description: "휴대폰을 속여 접속시키는 코드. 해킹의 실마리.", x: 760, y: 540, isFaceUp: false, handFaceUp: false, ownerId: null, type: "박기자 조사" },
      { id: "c18", title: "핫팩", description: "차가운 밤, 몸을 녹이던 흔한 물건. 하지만 ‘누가’ 있었다는 단서가 될 수 있다.", x: 820, y: 540, isFaceUp: false, handFaceUp: false, ownerId: null, type: "노숙자 조사" },
      { id: "c19", title: "낡은 가방", description: "도망자의 가방. 안의 내용은 절대 들키면 안 된다.", x: 880, y: 540, isFaceUp: false, handFaceUp: false, ownerId: null, type: "노숙자 조사" },
      { id: "c20", title: "헌금 봉투 사진", description: "거래 현장을 찍은 흔적. 진실과 협박 사이의 도구.", x: 940, y: 540, isFaceUp: false, handFaceUp: false, ownerId: null, type: "박기자 조사" },

      { id: "c21", title: "신의 음성 1", description: "“형벌에서 도망치지 말라.” 아이템/도주에 대한 힌트가 숨겨져 있다.", x: 1030, y: 540, isFaceUp: false, handFaceUp: false, ownerId: null, type: "신의 음성" },
      { id: "c22", title: "신의 음성 2", description: "“죄를 네 형제에게 전가하지 말라.” 누명과 전가에 대한 경고처럼 들린다.", x: 1130, y: 540, isFaceUp: false, handFaceUp: false, ownerId: null, type: "신의 음성" },
    ],
    cardAttention: {},
    messages: [],
    logs: [
      { id: "l1", roomId: "lobby", text: "세션 시작: ‘열린 교회 닫힌 문’ — 예배당 문은 잠겼고, 네 사람은 서로를 심판해야 합니다.", timestamp: Date.now() - 1000 * 25 },
    ],
    feeds: {},
  };
}

function createInitialStateFromGameData(gameData) {
  const sessionStart = Date.now();
  const seed = createInitialStateFromSeed();
  const safeGameData = normalizeGameData(gameData);
  const characters = safeGameData.characters ?? [];

  const players = characters.map((character, index) => {
    const presetKey = ["p1", "p2", "p3", "p4", "p5"][index] ?? "p1";
    const appearancePreset = defaultAppearanceByPlayer[presetKey] ?? defaultAppearanceByPlayer.p1;
    const spawn = safeGameData.map?.spawns?.players?.[character.id];
    const currentRoom = typeof spawn?.currentRoom === "string" ? spawn.currentRoom : "lobby";
    return {
      id: character.id,
      name: character.name,
      role: "PL",
      appearance: { ...appearancePreset },
      facing: "down",
      stepCycle: 0,
      lastMovedAt: 0,
      jumpUntil: 0,
      x: typeof spawn?.x === "number" ? spawn.x : 930,
      y: typeof spawn?.y === "number" ? spawn.y : 520,
      currentRoom,
      joinedRoomAt: { [currentRoom]: sessionStart },
    };
  });

  if (safeGameData.gmEnabled) {
    const gmSpawn = safeGameData.map?.spawns?.players?.gm;
    const gmRoom = typeof gmSpawn?.currentRoom === "string" ? gmSpawn.currentRoom : "lobby";
    players.push({
      id: "gm",
      name: "GM",
      role: "GM",
      appearance: { ...(defaultAppearanceByPlayer.p5 ?? defaultAppearanceByPlayer.p1) },
      facing: "down",
      stepCycle: 0,
      lastMovedAt: 0,
      jumpUntil: 0,
      x: typeof gmSpawn?.x === "number" ? gmSpawn.x : 1120,
      y: typeof gmSpawn?.y === "number" ? gmSpawn.y : 330,
      currentRoom: gmRoom,
      joinedRoomAt: { [gmRoom]: sessionStart },
    });
  }

  const cards = safeGameData.cards.items.map((card) => {
    const spawn = safeGameData.map?.spawns?.cards?.[card.id];
    return {
      id: card.id,
      title: card.title,
      description: card.description,
      x: typeof spawn?.x === "number" ? spawn.x : card.spawn.x,
      y: typeof spawn?.y === "number" ? spawn.y : card.spawn.y,
      isFaceUp: false,
      handFaceUp: false,
      ownerId: null,
      type: card.category,
    };
  });

  return normalizeState({
    ...seed,
    gameData: safeGameData,
    activePlayerId: players[0]?.id ?? seed.activePlayerId,
    players,
    cards,
    rooms: safeGameData.map.rooms,
    mapSize: safeGameData.map.mapSize,
    movementBounds: safeGameData.map.movementBounds,
    feeds: Object.fromEntries(players.map((player) => [player.id, []])),
  });
}

function normalizeAppearance(playerId, appearance) {
  const defaults = defaultAppearanceByPlayer[playerId] ?? defaultAppearanceByPlayer.p1;
  const nextAppearance = { ...defaults, ...(appearance ?? {}) };
  if (!bodyPresets[nextAppearance.body]) nextAppearance.body = defaults.body;
  if (!hairPresets[nextAppearance.hair]) nextAppearance.hair = defaults.hair;
  if (!outfitPresets[nextAppearance.outfit]) nextAppearance.outfit = defaults.outfit;
  if (!accessoryPresets[nextAppearance.accessory]) nextAppearance.accessory = defaults.accessory;
  return nextAppearance;
}

function normalizeDecisionSession(session) {
  if (!session || typeof session !== "object") return null;
  const type = session.type === "nomination" ? "nomination" : session.type === "vote" ? "vote" : null;
  if (!type) return null;
  return {
    type,
    status: session.status === "complete" ? "complete" : "collecting",
    responses: session.responses && typeof session.responses === "object" ? session.responses : {},
    result: session.result ?? null,
  };
}

function normalizeDecisionOutcome(outcome) {
  if (!outcome || typeof outcome !== "object") return null;
  const type = outcome.type === "nomination" ? "nomination" : outcome.type === "vote" ? "vote" : null;
  if (!type) return null;
  const completedAt = typeof outcome.completedAt === "number" ? outcome.completedAt : Date.now();
  const result = outcome.result ?? null;
  if (!result || typeof result !== "object") return null;
  return { type, completedAt, result };
}

function normalizeMapSize(mapSize) {
  const width = clamp(typeof mapSize?.width === "number" ? Math.round(mapSize.width) : STAGE_WIDTH, 960, 3200);
  return { width, height: Math.round(width / STAGE_ASPECT_RATIO) };
}

function loadState() {
  const gameData = loadGameData();
  const saved = localStorage.getItem(STORAGE_KEY);
  if (!saved) return createInitialStateFromGameData(gameData);
  try {
    const parsed = JSON.parse(saved);
    if (parsed?.gameDataId && parsed.gameDataId === gameData.meta.id && parsed?.state && typeof parsed.state === "object") {
      return normalizeState({ ...createInitialStateFromGameData(gameData), ...parsed.state, gameData });
    }
    return createInitialStateFromGameData(gameData);
  } catch {
    return createInitialStateFromGameData(gameData);
  }
}

function normalizeState(state) {
  const normalized = {
    ...state,
    tableActionCardId: typeof state.tableActionCardId === "string" ? state.tableActionCardId : null,
    profileModalPlayerId: typeof state.profileModalPlayerId === "string" ? state.profileModalPlayerId : null,
    documentModalType: typeof state.documentModalType === "string" ? state.documentModalType : null,
    storybookModalPlayerId: typeof state.storybookModalPlayerId === "string" ? state.storybookModalPlayerId : null,
    storybookPageIndex: typeof state.storybookPageIndex === "number" ? clamp(Math.floor(state.storybookPageIndex), 0, 999) : 0,
    selectedRoomId: typeof state.selectedRoomId === "string" ? state.selectedRoomId : "study",
    mapSize: normalizeMapSize(state.mapSize),
    stopwatchLabel: typeof state.stopwatchLabel === "string" ? state.stopwatchLabel : "조사 페이즈",
    stopwatchStartedAt: typeof state.stopwatchStartedAt === "number" ? state.stopwatchStartedAt : null,
    stopwatchElapsedMs: typeof state.stopwatchElapsedMs === "number" ? state.stopwatchElapsedMs : 0,
    timeMode: "timer",
    timerDurationSec: typeof state.timerDurationSec === "number" ? state.timerDurationSec : 300,
    timerPanelDismissed: false,
    walkTarget: state.walkTarget && typeof state.walkTarget.x === "number" && typeof state.walkTarget.y === "number" ? state.walkTarget : null,
    pendingWalkTarget: state.pendingWalkTarget && typeof state.pendingWalkTarget.x === "number" && typeof state.pendingWalkTarget.y === "number" ? state.pendingWalkTarget : null,
    cardAttention: state.cardAttention && typeof state.cardAttention === "object" ? state.cardAttention : {},
    movementBounds: {
      left: typeof state.movementBounds?.left === "number" ? state.movementBounds.left : TABLE_SAFE_LEFT,
      top: typeof state.movementBounds?.top === "number" ? state.movementBounds.top : TABLE_SAFE_TOP,
      right: typeof state.movementBounds?.right === "number" ? state.movementBounds.right : TABLE_SAFE_RIGHT,
      bottom: typeof state.movementBounds?.bottom === "number" ? state.movementBounds.bottom : TABLE_SAFE_BOTTOM,
    },
    bgmPlaying: true,
    bgmVolume: typeof state.bgmVolume === "number" ? clamp(state.bgmVolume, 0, 1) : 0.6,
    bgmMuted: Boolean(state.bgmMuted),
    decisionSession: normalizeDecisionSession(state.decisionSession),
    lastDecisionOutcome: normalizeDecisionOutcome(state.lastDecisionOutcome),
    lastDecisionModalOpen: Boolean(state.lastDecisionModalOpen),
    players: state.players.map((player) => ({
      ...player,
      name: typeof player.name === "string" ? player.name : "플레이어",
      role: player.role === "GM" ? "GM" : "PL",
      appearance: normalizeAppearance(player.id, player.appearance),
      facing: player.facing ?? "down",
      stepCycle: typeof player.stepCycle === "number" ? player.stepCycle : 0,
      lastMovedAt: typeof player.lastMovedAt === "number" ? player.lastMovedAt : 0,
      jumpUntil: typeof player.jumpUntil === "number" ? player.jumpUntil : 0,
      joinedRoomAt: player.joinedRoomAt && typeof player.joinedRoomAt === "object" ? player.joinedRoomAt : { [player.currentRoom]: Date.now() },
    })),
    logs: (state.logs ?? []).map((log) => ({
      ...log,
      roomId: typeof log.roomId === "string" ? log.roomId : "lobby",
    })),
  };

  const feeds = normalized.feeds && typeof normalized.feeds === "object" ? normalized.feeds : {};
  const nextFeeds = { ...feeds };
  for (const player of normalized.players ?? []) {
    if (!nextFeeds[player.id] || !Array.isArray(nextFeeds[player.id])) nextFeeds[player.id] = [];
  }
  normalized.feeds = nextFeeds;
  return normalized;
}

function syncStateToGameData(currentState, gameData) {
  const sessionStart = Date.now();
  const existingById = Object.fromEntries((currentState.players ?? []).map((player) => [player.id, player]));
  const nextPlayers = [];
  const presetOrder = ["p1", "p2", "p3", "p4", "p5"];

  (gameData.characters ?? []).forEach((character, index) => {
    const existing = existingById[character.id];
    if (existing && existing.role !== "GM") {
      nextPlayers.push({ ...existing, id: character.id, name: character.name, role: "PL" });
      return;
    }
    const presetKey = presetOrder[index] ?? "p1";
    const appearancePreset = defaultAppearanceByPlayer[presetKey] ?? defaultAppearanceByPlayer.p1;
    nextPlayers.push({
      id: character.id,
      name: character.name,
      role: "PL",
      appearance: { ...appearancePreset },
      facing: "down",
      stepCycle: 0,
      lastMovedAt: 0,
      jumpUntil: 0,
      x: STAGE_WIDTH / 2,
      y: STAGE_HEIGHT / 2,
      currentRoom: "lobby",
      joinedRoomAt: { lobby: sessionStart },
    });
  });

  if (gameData.gmEnabled) {
    const existing = existingById.gm;
    if (existing && existing.role === "GM") {
      nextPlayers.push({ ...existing, id: "gm", role: "GM", name: existing.name ?? "GM" });
    } else {
      nextPlayers.push({
        id: "gm",
        name: "GM",
        role: "GM",
        appearance: { ...(defaultAppearanceByPlayer.p5 ?? defaultAppearanceByPlayer.p1) },
        facing: "down",
        stepCycle: 0,
        lastMovedAt: 0,
        jumpUntil: 0,
        x: STAGE_WIDTH / 2,
        y: STAGE_HEIGHT / 2,
        currentRoom: "lobby",
        joinedRoomAt: { lobby: sessionStart },
      });
    }
  }

  const existingCardsById = Object.fromEntries((currentState.cards ?? []).map((card) => [card.id, card]));
  const nextCards = (gameData.cards?.items ?? []).map((card) => {
    const existing = existingCardsById[card.id];
    if (existing) {
      return {
        ...existing,
        id: card.id,
        title: card.title,
        description: card.description,
        type: card.category,
      };
    }
    return {
      id: card.id,
      title: card.title,
      description: card.description,
      x: card.spawn?.x ?? STAGE_WIDTH / 2,
      y: card.spawn?.y ?? STAGE_HEIGHT / 2,
      isFaceUp: false,
      handFaceUp: false,
      ownerId: null,
      type: card.category,
    };
  });

  const nextFeeds = { ...(currentState.feeds ?? {}) };
  for (const player of nextPlayers) {
    if (!nextFeeds[player.id] || !Array.isArray(nextFeeds[player.id])) nextFeeds[player.id] = [];
  }

  const nextActivePlayerId = nextPlayers.some((p) => p.id === currentState.activePlayerId)
    ? currentState.activePlayerId
    : (nextPlayers[0]?.id ?? currentState.activePlayerId);

  return normalizeState({
    ...currentState,
    gameData,
    players: nextPlayers,
    cards: nextCards,
    rooms: gameData.map?.rooms ?? currentState.rooms,
    mapSize: gameData.map?.mapSize ?? currentState.mapSize,
    movementBounds: gameData.map?.movementBounds ?? currentState.movementBounds,
    feeds: nextFeeds,
    activePlayerId: nextActivePlayerId,
  });
}

function App() {
  const [state, setState] = useState(loadState);
  const [chatDraft, setChatDraft] = useState("");
  const [chatCursorIndex, setChatCursorIndex] = useState(0);
  const [chatAutocompleteIndex, setChatAutocompleteIndex] = useState(0);
  const [chatAutocompleteUserSelected, setChatAutocompleteUserSelected] = useState(false);
  const [isChatAutocompleteOpen, setIsChatAutocompleteOpen] = useState(false);
  const [gmChatRoomId, setGmChatRoomId] = useState("lobby");
  const [gmTopNotice, setGmTopNotice] = useState(null);
  const [dragCardId, setDragCardId] = useState(null);
  const [dragPreview, setDragPreview] = useState(null);
  const [dragPointer, setDragPointer] = useState(null);
  const [dragHint, setDragHint] = useState(null);
  const [takeAnimation, setTakeAnimation] = useState(null);
  const [cursorState, setCursorState] = useState({ x: 0, y: 0, visible: false, interactive: false });
  const [cursorTooltipText, setCursorTooltipText] = useState("");
  const [viewportPointer, setViewportPointer] = useState({ x: 0, y: 0, visible: false });
  const [isChatFocused, setIsChatFocused] = useState(false);
  const [hoveredHandCardId, setHoveredHandCardId] = useState(null);
  const [hoveredProfileCardId, setHoveredProfileCardId] = useState(null);
  const [viewportScale, setViewportScale] = useState(1);
  const [isAltZooming, setIsAltZooming] = useState(false);
  const [cursorFocus, setCursorFocus] = useState({ x: STAGE_WIDTH / 2, y: STAGE_HEIGHT / 2 });
  const [gmPeekFaceUp, setGmPeekFaceUp] = useState(false);
  const [resizeSession, setResizeSession] = useState(null);
  const [playerDragSession, setPlayerDragSession] = useState(null);
  const [rightPanelOpen] = useState(false);
  const [mapEditMode, setMapEditMode] = useState(false);
  const [uiMode, setUiMode] = useState("play");
  const [modalZoomFocus, setModalZoomFocus] = useState(null);
  const [now, setNow] = useState(Date.now());
  const [isTimerEditing, setIsTimerEditing] = useState(false);
  const [timerDraft, setTimerDraft] = useState({ label: "", h: 0, m: 5, s: 0 });
  const [timerDragSession, setTimerDragSession] = useState(null);
  const [actionPopover, setActionPopover] = useState(null);
  const stageRef = useRef(null);
  const viewportRef = useRef(null);
  const bgmAudioRef = useRef(null);
  const chatInputRef = useRef(null);
  const chatScrollRef = useRef(null);
  const chatPinnedToBottomRef = useRef(true);
  const contactCardRef = useRef(null);
  const handTrayRef = useRef(null);
  const dragMetaRef = useRef(null);
  const suppressClickRef = useRef(false);
  const pressedKeysRef = useRef(new Set());
  const jumpHeldRef = useRef(false);
  const prevStopwatchStartedAtRef = useRef(null);
  const allowChatFocusRef = useRef(false);
  const importInputRef = useRef(null);
  const [editorTab, setEditorTab] = useState("characters");
  const [selectedCharacterId, setSelectedCharacterId] = useState(null);
  const [selectedCardId, setSelectedCardId] = useState(null);
  const [categoryDraft, setCategoryDraft] = useState("");
  const gameData = state.gameData ?? loadGameData();
  const isEditorMode = uiMode === "edit";
  const activePlayer = getActivePlayer(state);
  const isCardAttentionActive = (cardId) => (state.cardAttention?.[cardId] ?? 0) > now;
  const effectiveChatRoomId = activePlayer.role === "GM" ? gmChatRoomId : activePlayer.currentRoom;
  const characterById = useMemo(() => Object.fromEntries((gameData.characters ?? []).map((c) => [c.id, c])), [gameData.characters]);
  const characterNameOptions = useMemo(() => {
    const names = state.players
      .filter((player) => player?.role !== "GM")
      .map((player) => player.name)
      .filter((name) => typeof name === "string" && name.trim().length > 0)
      .map((name) => name.trim());
    return [...new Set(names)].sort((a, b) => b.length - a.length || a.localeCompare(b, "ko"));
  }, [state.players]);

  useEffect(() => {
    if (!selectedCharacterId) {
      const firstId = gameData.characters?.[0]?.id ?? null;
      if (firstId) setSelectedCharacterId(firstId);
    }
    if (!selectedCardId) {
      const firstCardId = gameData.cards?.items?.[0]?.id ?? null;
      if (firstCardId) setSelectedCardId(firstCardId);
    }
  }, [gameData.characters, gameData.cards, selectedCardId, selectedCharacterId]);

  const roomNameOptions = useMemo(() => {
    const names = state.rooms
      .map((room) => room?.name)
      .filter((name) => typeof name === "string" && name.trim().length > 0)
      .map((name) => name.trim());
    return [...new Set([...names, "로비"])].sort((a, b) => b.length - a.length || a.localeCompare(b, "ko"));
  }, [state.rooms]);

  const chatAutocomplete = useMemo(() => {
    const cursor = clamp(chatCursorIndex, 0, chatDraft.length);
    const beforeCursor = chatDraft.slice(0, cursor);
    const lastOpen = beforeCursor.lastIndexOf("[");
    const lastClose = beforeCursor.lastIndexOf("]");
    const isBracketQuery = lastOpen > lastClose;
    let tokenStart = cursor;
    let tokenEnd = cursor;
    let query = "";

    if (isBracketQuery) {
      tokenStart = lastOpen + 1;
      query = beforeCursor.slice(tokenStart);
      const closingBracketIndex = chatDraft.indexOf("]", cursor);
      tokenEnd = closingBracketIndex === -1 ? cursor : closingBracketIndex + 1;
    } else {
      let bestPrefixMatch = "";
      for (const name of characterNameOptions) {
        const maxLength = Math.min(name.length, beforeCursor.length);
        for (let length = maxLength; length > bestPrefixMatch.length; length -= 1) {
          const fragment = beforeCursor.slice(beforeCursor.length - length);
          if (!fragment.trim()) continue;
          if (name.toLowerCase().startsWith(fragment.toLowerCase())) {
            bestPrefixMatch = fragment;
            break;
          }
        }
      }

      if (bestPrefixMatch) {
        tokenStart = cursor - bestPrefixMatch.length;
        query = bestPrefixMatch;
      } else {
        while (tokenStart > 0) {
          const previousChar = chatDraft[tokenStart - 1];
          if (/\s/.test(previousChar) || previousChar === "[") break;
          tokenStart -= 1;
        }
        query = chatDraft.slice(tokenStart, cursor);
      }

      tokenEnd = cursor;
    }

    const normalizedQuery = query.trim().toLowerCase();

    if (!isChatFocused || normalizedQuery.length === 0) {
      return { open: false, isBracketQuery: false, tokenStart: cursor, tokenEnd: cursor, query: "", suggestions: [] };
    }

    const suggestions = characterNameOptions
      .filter((name) => name.toLowerCase().includes(normalizedQuery))
      .slice(0, 6);

    if (!suggestions.length) {
      return { open: false, isBracketQuery, tokenStart, tokenEnd, query: normalizedQuery, suggestions: [] };
    }

    return { open: true, isBracketQuery, tokenStart, tokenEnd, query: normalizedQuery, suggestions };
  }, [chatDraft, chatCursorIndex, characterNameOptions, isChatFocused]);

  const applyChatAutocomplete = useCallback((name, draftOverride = null, cursorOverride = null) => {
    const draft = typeof draftOverride === "string" ? draftOverride : chatInputRef.current?.value ?? chatDraft;
    const rawCursor = typeof cursorOverride === "number"
      ? cursorOverride
      : chatInputRef.current?.selectionStart ?? draft.length;
    const cursor = clamp(rawCursor, 0, draft.length);
    const beforeCursor = draft.slice(0, cursor);
    const lastOpen = beforeCursor.lastIndexOf("[");
    const lastClose = beforeCursor.lastIndexOf("]");
    const isBracketQuery = lastOpen > lastClose;
    let replaceStart = chatAutocomplete.tokenStart;
    let replaceEnd = chatAutocomplete.tokenEnd;
    let insertion = `${name} `;

    if (isBracketQuery) {
      replaceStart = lastOpen + 1;
      const closingBracketIndex = draft.indexOf("]", cursor);
      replaceEnd = closingBracketIndex === -1 ? cursor : closingBracketIndex + 1;
      insertion = `${name}] `;
    } else {
      const lowerName = name.toLowerCase();
      let matchedLength = 0;
      const maxLength = Math.min(name.length, beforeCursor.length);

      for (let length = maxLength; length > 0; length -= 1) {
        const fragment = beforeCursor.slice(beforeCursor.length - length);
        if (!fragment.trim()) continue;
        if (lowerName.startsWith(fragment.toLowerCase())) {
          matchedLength = length;
          break;
        }
      }

      if (matchedLength > 0) {
        replaceStart = cursor - matchedLength;
        replaceEnd = cursor;
      }

      while (replaceEnd < draft.length && replaceEnd - replaceStart < name.length) {
        const candidate = draft.slice(replaceStart, replaceEnd + 1).toLowerCase();
        if (!lowerName.startsWith(candidate)) break;
        replaceEnd += 1;
      }
    }

    const after = draft.slice(replaceEnd);
    const finalInsertion = after.startsWith(" ") ? insertion.trimEnd() : insertion;
    const before = draft.slice(0, replaceStart);
    const nextDraft = `${before}${finalInsertion}${after}`;
    const nextCursor = (before + finalInsertion).length;

    setChatDraft(nextDraft);
    setChatCursorIndex(nextCursor);
    setChatAutocompleteIndex(0);
    setChatAutocompleteUserSelected(false);
    setIsChatAutocompleteOpen(false);
    window.requestAnimationFrame(() => {
      const node = chatInputRef.current;
      if (!node) return;
      node.focus();
      node.setSelectionRange(nextCursor, nextCursor);
    });
  }, [chatAutocomplete, chatDraft]);

  const openProfile = useCallback((playerId) => {
    setState((current) => ({ ...current, profileModalPlayerId: playerId, modalCardId: null, documentModalType: null, storybookModalPlayerId: null, storybookPageIndex: 0, pendingWalkTarget: null, tableActionCardId: null, pendingAction: null }));
  }, []);

  const getPlayerIdByDisplayName = useCallback((displayName) => {
    const target = (displayName ?? "").trim();
    if (!target) return null;
    for (const player of state.players ?? []) {
      if (player?.role === "GM") continue;
      const candidate = (player.name ?? "").trim();
      if (candidate && candidate === target) return player.id;
    }
    return null;
  }, [state.players]);

  const renderChatLine = useCallback((text, keyPrefix = "seg") => {
    if (!text) return null;
    if (!characterNameOptions.length) {
      return (
        <span className="chat-text-outline chat-text-outline-inline" data-text={text}>
          {text}
        </span>
      );
    }

    const candidates = characterNameOptions;
    const pieces = [];
    let index = 0;
    while (index < text.length) {
      let match = null;
      for (const name of candidates) {
        if (!name) continue;
        if (text.startsWith(name, index)) {
          match = name;
          break;
        }
      }
      if (match) {
        pieces.push({ text: match, highlight: true });
        index += match.length;
        continue;
      }
      pieces.push({ text: text[index], highlight: false });
      index += 1;
    }

    const merged = [];
    for (const piece of pieces) {
      const last = merged[merged.length - 1];
      if (last && last.highlight === piece.highlight) {
        last.text += piece.text;
      } else {
        merged.push({ ...piece });
      }
    }

    return merged.map((segment, segmentIndex) => {
      const playerId = segment.highlight ? getPlayerIdByDisplayName(segment.text) : null;
      const className = `chat-text-outline chat-text-outline-inline ${segment.highlight ? "chat-name-highlight" : ""}`;

      if (playerId) {
        return (
          <button
            key={`${keyPrefix}-${segmentIndex}`}
            type="button"
            className={`${className} bg-transparent p-0 text-inherit`}
            data-text={segment.text}
            title="프로필 보기"
            onClick={() => openProfile(playerId)}
          >
            {segment.text}
          </button>
        );
      }

      return (
        <span
          key={`${keyPrefix}-${segmentIndex}`}
          className={className}
          data-text={segment.text}
        >
          {segment.text}
        </span>
      );
    });
  }, [characterNameOptions, getPlayerIdByDisplayName, openProfile]);

  const renderNoticeLine = useCallback((text, kind, keyPrefix = "notice") => {
    if (!text) return null;

    const candidates = [
      ...characterNameOptions.map((name) => ({ name, type: "character" })),
      ...roomNameOptions.map((name) => ({ name, type: "room" })),
    ].filter((item) => item.name);

    if (!candidates.length) {
      return (
        <span className={`chat-text-outline chat-text-outline-inline ${kind === "gm" ? "notice-outline-gm" : "notice-outline-system"}`} data-text={text}>
          {text}
        </span>
      );
    }

    const pieces = [];
    let index = 0;
    while (index < text.length) {
      let bestMatch = null;
      for (const candidate of candidates) {
        if (text.startsWith(candidate.name, index)) {
          if (!bestMatch || candidate.name.length > bestMatch.name.length) {
            bestMatch = candidate;
          }
        }
      }

      if (bestMatch) {
        pieces.push({ text: bestMatch.name, type: bestMatch.type });
        index += bestMatch.name.length;
        continue;
      }

      pieces.push({ text: text[index], type: "normal" });
      index += 1;
    }

    const merged = [];
    for (const piece of pieces) {
      const last = merged[merged.length - 1];
      if (last && last.type === piece.type) {
        last.text += piece.text;
      } else {
        merged.push({ ...piece });
      }
    }

    return merged.map((segment, segmentIndex) => (
      <span
        key={`${keyPrefix}-${segmentIndex}`}
        className={[
          "chat-text-outline",
          "chat-text-outline-inline",
          kind === "gm" ? "notice-outline-gm" : "notice-outline-system",
          segment.type === "character" ? "notice-character-highlight" : "",
          segment.type === "room" ? "notice-room-highlight" : "",
        ].filter(Boolean).join(" ")}
        data-text={segment.text.replace(/ /g, "\u00A0")}
      >
        {segment.text.replace(/ /g, "\u00A0")}
      </span>
    ));
  }, [characterNameOptions, roomNameOptions]);

  const feedForActivePlayer = state.feeds?.[activePlayer.id] ?? [];
  const visibleFeedItems = useMemo(() => {
    const gmChatItems = feedForActivePlayer.filter((item) => item.kind === "gm_chat");
    if (activePlayer.role === "GM") {
      const roomItems = feedForActivePlayer.filter((item) => item.roomId === effectiveChatRoomId);
      return [...roomItems, ...gmChatItems].sort((a, b) => a.timestamp - b.timestamp);
    }
    return [...feedForActivePlayer].sort((a, b) => a.timestamp - b.timestamp);
  }, [activePlayer.role, effectiveChatRoomId, feedForActivePlayer]);

  const latestGmMessage = useMemo(() => {
    const gmIds = new Set(state.players.filter((player) => player.role === "GM").map((player) => player.id));
    for (let index = feedForActivePlayer.length - 1; index >= 0; index -= 1) {
      const item = feedForActivePlayer[index];
      if (item.kind === "gm_chat") return item;
      if (item.senderId && gmIds.has(item.senderId) && item.kind === "chat") return item;
    }
    return null;
  }, [feedForActivePlayer, state.players]);
  const tableCards = state.cards.filter((card) => card.ownerId === null);
  const activeHandCards = state.cards.filter((card) => card.ownerId === activePlayer.id);
  const cardSequenceById = useMemo(
    () => Object.fromEntries((state.cards ?? []).map((card, index) => [card.id, index + 1])),
    [state.cards],
  );
  const cardCategorySequenceById = useMemo(() => {
    const counts = {};
    const map = {};
    (state.cards ?? []).forEach((card) => {
      const category = String(card.type ?? "").trim() || "미분류";
      counts[category] = (counts[category] ?? 0) + 1;
      map[card.id] = counts[category];
    });
    return map;
  }, [state.cards]);
  const activeStorybookText = characterById[activePlayer.id]?.storybook ?? "";
  const otherHands = state.players.filter((player) => player.id !== activePlayer.id && player.role !== "GM");
  const modalCard = state.cards.find((card) => card.id === state.modalCardId) ?? null;
  const dragCard = dragCardId ? state.cards.find((card) => card.id === dragCardId) ?? null : null;
  const hoveredHandCard = hoveredHandCardId ? state.cards.find((card) => card.id === hoveredHandCardId && card.ownerId === activePlayer.id) ?? null : null;
  const hoveredProfileCard = hoveredProfileCardId ? state.cards.find((card) => card.id === hoveredProfileCardId) ?? null : null;
  const profilePlayer = state.players.find((player) => player.id === state.profileModalPlayerId) ?? null;
  const storybookPlayer = state.players.find((player) => player.id === state.storybookModalPlayerId) ?? null;
  const viewRoomId = activePlayer.role === "GM" ? effectiveChatRoomId : activePlayer.currentRoom;
  const activeRoomZone = state.rooms.find((room) => room.id === viewRoomId) ?? null;
  const activePlayerProfile = characterById[activePlayer.id] ?? null;
  const selectedRoom = state.rooms.find((room) => room.id === state.selectedRoomId) ?? state.rooms[0];
  const renderPlayers = state.players.filter((player) => player.role !== "GM");
  const isMapEditing = isEditorMode ? editorTab === "map" : (activePlayer.role === "GM" && mapEditMode);
  const stageWidth = state.mapSize.width;
  const stageHeight = state.mapSize.height;
  const chatRoomMembers = useMemo(() => {
    const roomIdForMembers = activePlayer.role === "GM" ? effectiveChatRoomId : activePlayer.currentRoom;
    return state.players
      .filter((player) => player.role !== "GM" && player.currentRoom === roomIdForMembers)
      .map((player) => ({ id: player.id, name: player.name }))
      .filter((player) => typeof player.name === "string" && player.name.trim().length > 0);
  }, [activePlayer.currentRoom, activePlayer.role, effectiveChatRoomId, state.players]);
  const elapsedTimerMs = state.stopwatchStartedAt ? state.stopwatchElapsedMs + (now - state.stopwatchStartedAt) : state.stopwatchElapsedMs;
  const effectiveTimeMs = Math.max(0, state.timerDurationSec * 1000 - elapsedTimerMs);
  const nonGmPlayers = state.players.filter((player) => player.role !== "GM");
  const activeDecision = state.decisionSession;
  const activeDecisionResponse = activeDecision ? activeDecision.responses?.[activePlayer.id] ?? null : null;
  const isDecisionParticipant = activePlayer.role !== "GM";
  const hasCollectingDecision = activeDecision?.status === "collecting";
  const lastDecisionOutcome = state.lastDecisionOutcome;
  const hasRunningTimer = Boolean(state.stopwatchStartedAt);
  const showTimerPanel = true;
  const contactCard = getContactCard(tableCards, activePlayer);
  const visibleSpeechByPlayer = Object.fromEntries(
    state.messages
      .filter((message) => message.roomId === activePlayer.currentRoom && now - message.timestamp <= SPEECH_BUBBLE_DURATION)
      .sort((a, b) => b.timestamp - a.timestamp)
      .reduce((accumulator, message) => {
        if (!accumulator.some((item) => item.senderId === message.senderId)) {
          accumulator.push(message);
        }
        return accumulator;
      }, [])
      .map((message) => [message.senderId, truncateSpeech(message.text)]),
  );
  const roomNameById = useMemo(() => Object.fromEntries(state.rooms.map((room) => [room.id, room.name])), [state.rooms]);
  const currentRoomName = roomNameById[effectiveChatRoomId] ?? "";

  const chatFeedItems = visibleFeedItems;

  const visibleChatFeedItems = useMemo(() => {
    if (isChatFocused) return chatFeedItems;
    const maxAge = CHAT_ITEM_VISIBLE_MS + CHAT_ITEM_FADE_MS;
    return chatFeedItems.filter((item) => now - item.timestamp <= maxAge);
  }, [chatFeedItems, isChatFocused, now]);

  useEffect(() => {
    const { gameData, ...persistable } = state;
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        gameDataId: gameData?.meta?.id ?? null,
        state: persistable,
      }),
    );
  }, [state]);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setNow(Date.now());
    }, 80);
    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    setState((current) => {
      const attention = current.cardAttention;
      if (!attention) return current;
      const entries = Object.entries(attention);
      if (!entries.length) return current;
      let shouldPrune = false;
      for (const [, until] of entries) {
        if (typeof until !== "number" || until <= now) {
          shouldPrune = true;
          break;
        }
      }
      if (!shouldPrune) return current;
      const nextAttention = {};
      for (const [cardId, until] of entries) {
        if (typeof until === "number" && until > now) nextAttention[cardId] = until;
      }
      return { ...current, cardAttention: nextAttention };
    });
  }, [now]);

  useEffect(() => {
    prevStopwatchStartedAtRef.current = state.stopwatchStartedAt;
  }, [state.stopwatchStartedAt]);

  useEffect(() => {
    if (!timerDragSession) return;
    const handleMove = (event) => {
      setTimerDraft((current) => {
        const deltaY = timerDragSession.startY - event.clientY;
        const steps = Math.trunc(deltaY / 8);
        if (!steps) return current;
        const nextValue = clamp(timerDragSession.startValue + steps, timerDragSession.min, timerDragSession.max);
        return { ...current, [timerDragSession.field]: nextValue };
      });
    };
    const handleUp = () => {
      setTimerDragSession(null);
    };
    window.addEventListener("pointermove", handleMove);
    window.addEventListener("pointerup", handleUp, { once: true });
    return () => {
      window.removeEventListener("pointermove", handleMove);
      window.removeEventListener("pointerup", handleUp);
    };
  }, [timerDragSession]);

  const openTimerEditor = () => {
    setState((current) => {
      if (current.stopwatchStartedAt) {
        return { ...current, stopwatchStartedAt: null, stopwatchElapsedMs: current.stopwatchElapsedMs + (Date.now() - current.stopwatchStartedAt) };
      }
      return current;
    });
    const total = clamp(Math.floor(state.timerDurationSec), 0, 359999);
    const h = Math.floor(total / 3600);
    const m = Math.floor((total % 3600) / 60);
    const s = total % 60;
    setTimerDraft({ label: state.stopwatchLabel || "타이머", h, m, s });
    setIsTimerEditing(true);
  };

  const applyTimerDraft = () => {
    const h = clamp(Number(timerDraft.h) || 0, 0, 99);
    const m = clamp(Number(timerDraft.m) || 0, 0, 59);
    const s = clamp(Number(timerDraft.s) || 0, 0, 59);
    const total = h * 3600 + m * 60 + s;
    setState((current) => ({
      ...current,
      stopwatchLabel: typeof timerDraft.label === "string" ? timerDraft.label : current.stopwatchLabel,
      timerDurationSec: clamp(total, 0, 359999),
    }));
    setIsTimerEditing(false);
    setTimerDragSession(null);
  };

  const cancelTimerDraft = () => {
    setIsTimerEditing(false);
    setTimerDragSession(null);
  };

  useEffect(() => {
    const audio = bgmAudioRef.current;
    if (!audio) return;
    audio.loop = true;
    const effectiveMuted = Boolean(state.bgmMuted || state.bgmVolume <= 0);
    audio.muted = effectiveMuted;
    audio.volume = effectiveMuted ? 0 : clamp(state.bgmVolume, 0, 1);
    if (state.bgmPlaying) {
      audio.play().catch(() => {});
    }
  }, [state.bgmPlaying, state.bgmMuted, state.bgmVolume]);

  const scrollChatToBottom = useCallback(() => {
    const chatNode = chatScrollRef.current;
    if (!chatNode) return;
    chatNode.scrollTop = chatNode.scrollHeight;
  }, []);

  useEffect(() => {
    const chatNode = chatScrollRef.current;
    if (!chatNode) return;

    const handleScroll = () => {
      const distanceFromBottom = chatNode.scrollHeight - chatNode.scrollTop - chatNode.clientHeight;
      chatPinnedToBottomRef.current = distanceFromBottom <= 24;
    };

    chatNode.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => chatNode.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    // 활성/비활성 전환 순간에는 항상 최신(바닥)으로 고정
    scrollChatToBottom();
    chatPinnedToBottomRef.current = true;
  }, [isChatFocused, scrollChatToBottom]);

  useEffect(() => {
    // 기본은 최신 유지. 사용자가 위로 올려둔 상태면 유지.
    if (chatPinnedToBottomRef.current) {
      scrollChatToBottom();
    }
  }, [activePlayer.currentRoom, chatFeedItems.length, effectiveChatRoomId, scrollChatToBottom]);

  useEffect(() => {
    contactCardRef.current = contactCard;
  }, [contactCard]);

  useEffect(() => {
    if (!latestGmMessage) return;
    setGmTopNotice({ id: latestGmMessage.id, text: latestGmMessage.text, timestamp: latestGmMessage.timestamp });
  }, [latestGmMessage?.id]);

  useEffect(() => {
    setGmPeekFaceUp(false);
  }, [state.modalCardId]);

  useEffect(() => {
    if (!modalCard) {
      setModalZoomFocus(null);
      setCursorTooltipText("");
      setActionPopover(null);
    }
  }, [modalCard]);

  const openActionPopover = (type, event) => {
    const target = event?.currentTarget;
    const rect = target && typeof target.getBoundingClientRect === "function" ? target.getBoundingClientRect() : null;
    const x = rect ? rect.left + rect.width / 2 : event?.clientX ?? window.innerWidth / 2;
    const y = rect ? rect.top + rect.height : event?.clientY ?? window.innerHeight / 2;
    setState((current) => ({ ...current, pendingAction: current.pendingAction === type ? null : type }));
    setActionPopover((current) => (current?.type === type ? null : { type, x, y }));
  };

  useEffect(() => {
    const updateViewportScale = () => {
      const availableWidth = Math.max(window.innerWidth, 1);
      const availableHeight = Math.max(window.innerHeight, 1);
      setViewportScale(Math.min(availableWidth / stageWidth, availableHeight / stageHeight));
    };
    updateViewportScale();
    window.addEventListener("resize", updateViewportScale);
    return () => window.removeEventListener("resize", updateViewportScale);
  }, [stageHeight, stageWidth]);

  useEffect(() => {
    const handlePointerMove = (event) => {
      const viewportNode = viewportRef.current;
      const interactiveTarget = event.target instanceof Element
        ? event.target.closest("button, select, input, textarea, [role='button'], [data-hoverable='true']")
        : null;

      setCursorState({
        x: event.clientX,
        y: event.clientY,
        visible: true,
        interactive: Boolean(interactiveTarget),
      });

      if (viewportNode) {
        const viewportBounds = viewportNode.getBoundingClientRect();
        setViewportPointer({
          x: clamp(event.clientX - viewportBounds.left, 0, viewportBounds.width),
          y: clamp(event.clientY - viewportBounds.top, 0, viewportBounds.height),
          visible: true,
        });
        const nextFocus = {
          x: clamp((event.clientX - viewportBounds.left) / Math.max(viewportScale, 0.001), 0, stageWidth),
          y: clamp((event.clientY - viewportBounds.top) / Math.max(viewportScale, 0.001), 0, stageHeight),
        };
        setCursorFocus(nextFocus);
      }
    };

    const handlePointerLeave = () => {
      setCursorState((current) => ({ ...current, visible: false, interactive: false }));
      setViewportPointer((current) => ({ ...current, visible: false }));
    };

    window.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("pointerdown", handlePointerMove);
    window.addEventListener("blur", handlePointerLeave);
    document.addEventListener("mouseleave", handlePointerLeave);
    return () => {
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerdown", handlePointerMove);
      window.removeEventListener("blur", handlePointerLeave);
      document.removeEventListener("mouseleave", handlePointerLeave);
    };
  }, [stageHeight, stageWidth, viewportScale]);

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === "Alt") {
        setIsAltZooming(true);
      }
      if (event.key === "Enter" && !event.metaKey && !event.ctrlKey && !event.altKey) {
        if (event.target?.tagName === "INPUT" && event.target === chatInputRef.current) {
          const text = chatInputRef.current.value.trim();
          if (!text) {
            event.preventDefault();
            chatInputRef.current.blur();
          }
          return;
        }
        if (!["INPUT", "TEXTAREA", "SELECT"].includes(event.target?.tagName)) {
          event.preventDefault();
          setState((current) => (current.pendingWalkTarget ? { ...current, pendingWalkTarget: null, walkTarget: null } : current));
          allowChatFocusRef.current = true;
          chatInputRef.current?.focus();
        }
        return;
      }
      if (event.key === "Escape") {
        event.preventDefault();
        event.stopPropagation();
        setState((current) => ({
          ...current,
          modalCardId: null,
          profileModalPlayerId: null,
          documentModalType: null,
          storybookModalPlayerId: null,
          storybookPageIndex: 0,
          lastDecisionModalOpen: false,
          tableActionCardId: null,
          pendingAction: null,
        }));
        return;
      }
      if (["INPUT", "TEXTAREA", "SELECT"].includes(event.target?.tagName)) return;
      if (event.key === " " || event.code === "Space") {
        event.preventDefault();
        if (!jumpHeldRef.current) {
          jumpHeldRef.current = true;
          setState((current) => jumpPlayerState(current.pendingWalkTarget ? { ...current, pendingWalkTarget: null, walkTarget: null } : current));
        }
        return;
      }
      const direction = getDirectionFromKey(event.key);
      if (!direction) return;
      event.preventDefault();
      setState((current) => (current.pendingWalkTarget ? { ...current, pendingWalkTarget: null, walkTarget: null } : current));
      pressedKeysRef.current.add(event.key.toLowerCase());
    };

    const handleKeyUp = (event) => {
      if (event.key === "Alt") {
        setIsAltZooming(false);
      }
      if (event.key === " " || event.code === "Space") {
        jumpHeldRef.current = false;
      }
      const direction = getDirectionFromKey(event.key);
      if (direction) {
        pressedKeysRef.current.delete(event.key.toLowerCase());
      }
    };

    const handleWindowBlur = () => {
      setIsAltZooming(false);
      jumpHeldRef.current = false;
      pressedKeysRef.current.clear();
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    window.addEventListener("blur", handleWindowBlur);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
      window.removeEventListener("blur", handleWindowBlur);
    };
  }, []);

  useEffect(() => {
    const handlePointerDownCapture = (event) => {
      if (activePlayer.role !== "GM") return;
      if (isAltZooming) return;
      if (isMapEditing) return;
      const viewportNode = viewportRef.current;
      if (!viewportNode) return;
      const rect = viewportNode.getBoundingClientRect();
      const withinViewport = event.clientX >= rect.left && event.clientX <= rect.right && event.clientY >= rect.top && event.clientY <= rect.bottom;
      if (!withinViewport) return;

      const element = event.target instanceof Element ? event.target : null;
      const roomNode = element ? element.closest("[data-room-id]") : null;
      if (!roomNode) {
        if (isChatFocused) {
          event.preventDefault();
        }
        setGmChatRoomId("lobby");
        if (isChatFocused) {
          window.requestAnimationFrame(() => chatInputRef.current?.focus());
        }
      }
    };

    window.addEventListener("pointerdown", handlePointerDownCapture, { capture: true });
    return () => window.removeEventListener("pointerdown", handlePointerDownCapture, { capture: true });
  }, [activePlayer.role, isAltZooming, isChatFocused, isMapEditing]);

  useEffect(() => {
    const moveTimer = window.setInterval(() => {
      const vector = getMovementVectorFromKeys(pressedKeysRef.current);
      if (vector) {
        setState((current) => movePlayerState(current.pendingWalkTarget ? { ...current, pendingWalkTarget: null, walkTarget: null } : current, vector.dx, vector.dy));
        return;
      }
      setState((current) => movePlayerTowardTargetState(current));
    }, MOVE_TICK_MS);

    return () => window.clearInterval(moveTimer);
  }, []);

  useEffect(() => {
    if (!dragPointer) return undefined;

    const handlePointerMove = (event) => {
      if (event.pointerId !== dragPointer.pointerId) return;
      const movedEnough = Math.hypot(event.clientX - dragPointer.startX, event.clientY - dragPointer.startY) >= HAND_DROP_MIN_DISTANCE;
      if (!movedEnough && !dragPointer.active) return;

      setDragPointer((current) => {
        if (!current || current.pointerId !== event.pointerId) return current;
        return {
          ...current,
          active: true,
          currentX: event.clientX,
          currentY: event.clientY,
        };
      });
      setDragCardId(dragPointer.cardId);
      setDragPreview({ x: event.clientX, y: event.clientY });

      const finalTarget = document.elementFromPoint(event.clientX, event.clientY);
      const handDropTarget = finalTarget?.closest?.("[data-hand-dropzone='true']");
      const stageDropTarget = finalTarget?.closest?.("[data-stage-dropzone='true']");
      const playerDropTarget = finalTarget?.closest?.("[data-player-dropzone]");
      const dragCardLocal = state.cards.find((item) => item.id === dragPointer.cardId) ?? null;
      let nextHint = null;
      let nextTargetPlayerId = null;

      if (dragCardLocal?.ownerId === null) {
        if (handDropTarget) nextHint = "내 손에 가져오기";
      } else if (dragCardLocal?.ownerId === activePlayer.id) {
        if (playerDropTarget) {
          nextHint = "양도하기";
          nextTargetPlayerId = playerDropTarget.getAttribute("data-player-dropzone");
        } else if (stageDropTarget) {
          nextHint = "덮은 채로 내려놓기";
        }
      }

      setDragHint(nextHint ? { text: nextHint, targetPlayerId: nextTargetPlayerId } : null);
    };

    const handlePointerUp = (event) => {
      if (event.pointerId !== dragPointer.pointerId) return;

      const finalTarget = document.elementFromPoint(event.clientX, event.clientY);
      const handDropTarget = finalTarget?.closest?.("[data-hand-dropzone='true']");
      const handCardTarget = finalTarget?.closest?.("[data-hand-card-id]");
      const stageDropTarget = finalTarget?.closest?.("[data-stage-dropzone='true']");
      const playerDropTarget = finalTarget?.closest?.("[data-player-dropzone]");

        if (dragPointer.active) {
          suppressClickRef.current = true;
          window.setTimeout(() => {
            suppressClickRef.current = false;
          }, 0);
        if (playerDropTarget) {
          const targetPlayerId = playerDropTarget.getAttribute("data-player-dropzone");
          if (targetPlayerId && targetPlayerId !== activePlayer.id) {
            setState((current) => {
              const player = getActivePlayer(current);
              const card = current.cards.find((item) => item.id === dragPointer.cardId && item.ownerId === player.id);
              const targetPlayer = current.players.find((item) => item.id === targetPlayerId);
              if (!card || !targetPlayer || targetPlayer.role === "GM") return current;
              return {
                ...current,
                cards: current.cards.map((item) => (item.id === dragPointer.cardId ? { ...item, ownerId: targetPlayerId } : item)),
                cardAttention: { ...current.cardAttention, [dragPointer.cardId]: Date.now() + CARD_ATTENTION_MS },
                logs: addLog(current.logs, `${player.name} 님이 ${card.title} 카드를 ${targetPlayer.name} 님에게 양도했습니다.`),
                pendingAction: null,
                modalCardId: current.modalCardId === dragPointer.cardId ? null : current.modalCardId,
              };
            });
          }
        } else if (handDropTarget) {
          const targetCardId = handCardTarget?.getAttribute("data-hand-card-id") ?? null;
          moveCardToHand(dragPointer.cardId, targetCardId);
        } else if (stageDropTarget) {
          dropCardAtPoint(dragPointer.cardId, event.clientX, event.clientY);
        }
      }

      setDragPointer(null);
      setDragCardId(null);
      setDragPreview(null);
      setDragHint(null);
      dragMetaRef.current = null;
    };

    window.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("pointerup", handlePointerUp);
    window.addEventListener("pointercancel", handlePointerUp);
    return () => {
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerup", handlePointerUp);
      window.removeEventListener("pointercancel", handlePointerUp);
    };
  }, [dragPointer, activePlayer.id, activePlayer.currentRoom, state.cards]);

  useEffect(() => {
    if (!resizeSession) return undefined;

    const handlePointerMove = (event) => {
      setState((current) => applyResizeSession(current, resizeSession, event.clientX, event.clientY, viewportScale));
    };

    const handlePointerUp = () => {
      setResizeSession(null);
    };

    window.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("pointerup", handlePointerUp);
    window.addEventListener("pointercancel", handlePointerUp);
    return () => {
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerup", handlePointerUp);
      window.removeEventListener("pointercancel", handlePointerUp);
    };
  }, [resizeSession, viewportScale]);

  useEffect(() => {
    if (!playerDragSession) return undefined;

    const handlePointerMove = (event) => {
      const stageRect = stageRef.current?.getBoundingClientRect();
      if (!stageRect) return;
      setState((current) => movePlayerByDrag(current, playerDragSession.playerId, event.clientX, event.clientY, stageRect));
    };

    const handlePointerUp = () => {
      setPlayerDragSession(null);
    };

    window.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("pointerup", handlePointerUp);
    window.addEventListener("pointercancel", handlePointerUp);
    return () => {
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerup", handlePointerUp);
      window.removeEventListener("pointercancel", handlePointerUp);
    };
  }, [playerDragSession]);

  const setGameDataDraft = useCallback((updater, { sync = true } = {}) => {
    setState((current) => {
      const nextGameData = normalizeGameData(updater(current.gameData ?? gameData));
      if (!sync) return { ...current, gameData: nextGameData };
      return syncStateToGameData(current, nextGameData);
    });
  }, [gameData]);

  const persistGameDataDraft = useCallback(() => {
    setState((current) => {
      const normalized = normalizeGameData(current.gameData ?? gameData);
      saveGameData(normalized);
      return { ...current, gameData: normalized };
    });
  }, [gameData]);

  const buildGameDataWithCurrentMap = useCallback((baseGameData, currentState) => {
    const players = Object.fromEntries(
      (currentState.players ?? []).map((player) => [player.id, { x: player.x, y: player.y, currentRoom: player.currentRoom }]),
    );
    const cards = Object.fromEntries((currentState.cards ?? []).map((card) => [card.id, { x: card.x, y: card.y }]));
    return normalizeGameData({
      ...baseGameData,
      map: {
        ...baseGameData.map,
        mapSize: currentState.mapSize,
        movementBounds: currentState.movementBounds,
        rooms: currentState.rooms,
        spawns: { players, cards },
      },
    });
  }, []);

  const downloadGameData = useCallback(() => {
    const payload = normalizeGameData(state.gameData ?? gameData);
    const filenameBase = (payload.meta?.title ?? "custom-game").trim() || "custom-game";
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${filenameBase}.murdergame.json`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  }, [gameData, state.gameData]);

  const importGameDataFromFile = useCallback(async (file) => {
    if (!file) return;
    const text = await file.text();
    const parsed = JSON.parse(text);
    const normalized = normalizeGameData(parsed);
    saveGameData(normalized);
    localStorage.removeItem(STORAGE_KEY);
    spriteSheetCache.clear();
    setState(syncStateToGameData(createInitialStateFromGameData(normalized), normalized));
  }, []);

  const startPlayFromGameData = useCallback(() => {
    let normalized = normalizeGameData(state.gameData ?? gameData);
    if (isEditorMode && editorTab === "map") {
      normalized = buildGameDataWithCurrentMap(normalized, state);
    }
    saveGameData(normalized);
    localStorage.removeItem(STORAGE_KEY);
    spriteSheetCache.clear();
    setState(createInitialStateFromGameData(normalized));
    setUiMode("play");
    setIsChatFocused(false);
  }, [buildGameDataWithCurrentMap, editorTab, gameData, isEditorMode, state]);

  const resetGame = () => {
    const next = createInitialStateFromGameData(state.gameData ?? loadGameData());
    spriteSheetCache.clear();
    localStorage.removeItem(STORAGE_KEY);
    setState(next);
    setChatDraft("");
  };

  const submitChat = (event) => {
    event.preventDefault();
    const text = chatDraft.trim();
    if (!text) return;
    setState((current) => {
      const player = getActivePlayer(current);
      const timestamp = Date.now();
      const messageId = `m-${crypto.randomUUID()}`;
      const gmIds = gmPlayerIds(current);
      const sender = current.players.find((p) => p.id === player.id) ?? player;
      const isGmSender = sender.role === "GM";
      const roomId = player.currentRoom;
      const feedItem = { id: `f-${crypto.randomUUID()}`, kind: isGmSender ? "gm_chat" : "chat", roomId: isGmSender ? null : roomId, senderId: player.id, text, timestamp };

      let nextFeeds = current.feeds ?? {};
      if (isGmSender) {
        const allPlayerIds = current.players.map((p) => p.id);
        for (const id of allPlayerIds) {
          nextFeeds = addFeedItem(nextFeeds, id, feedItem);
        }
      } else {
        const observers = [
          ...nonGmPlayersInRoom(current, roomId).map((p) => p.id),
          ...gmIds,
        ];
        for (const id of observers) {
          nextFeeds = addFeedItem(nextFeeds, id, feedItem);
        }
      }
      return {
        ...current,
        messages: [
          ...current.messages,
          { id: messageId, roomId: player.currentRoom, senderId: player.id, text, timestamp },
        ],
        feeds: nextFeeds,
        logs: current.logs,
      };
    });
    setChatDraft("");
  };

  const openCard = (cardId) => {
    setState((current) => ({
      ...current,
      modalCardId: cardId,
      profileModalPlayerId: null,
      documentModalType: null,
      storybookModalPlayerId: null,
      storybookPageIndex: 0,
      pendingWalkTarget: null,
      tableActionCardId: null,
      pendingAction: null,
    }));
  };

  const openHandCard = (cardId) => {
    setState((current) => {
      const player = getActivePlayer(current);
      const card = current.cards.find((item) => item.id === cardId) ?? null;
      if (!card) return current;
      const shouldFlipFaceUp = card.ownerId === player.id && !card.handFaceUp;
      return {
        ...current,
        cards: shouldFlipFaceUp
          ? current.cards.map((item) => (item.id === cardId ? { ...item, handFaceUp: true } : item))
          : current.cards,
        modalCardId: cardId,
        profileModalPlayerId: null,
        documentModalType: null,
        storybookModalPlayerId: null,
        storybookPageIndex: 0,
        pendingWalkTarget: null,
        tableActionCardId: null,
        pendingAction: null,
      };
    });
  };

  const openDocument = (documentModalType) => {
    setState((current) => ({
      ...current,
      documentModalType,
      storybookModalPlayerId: null,
      storybookPageIndex: 0,
      profileModalPlayerId: null,
      modalCardId: null,
      pendingWalkTarget: null,
      tableActionCardId: null,
      pendingAction: null,
    }));
  };

  const toggleTableActionCard = (cardId) => {
    setState((current) => ({
      ...current,
      modalCardId: null,
      pendingAction: null,
      tableActionCardId: current.tableActionCardId === cardId ? null : cardId,
    }));
  };

  const toggleTableCardById = (cardId) => {
    setState((current) => {
      const player = getActivePlayer(current);
      const card = current.cards.find((item) => item.id === cardId && item.ownerId === null);
      if (!card || player.currentRoom !== "lobby") return current;
      const nextIsFaceUp = !card.isFaceUp;
      return {
        ...current,
        cards: current.cards.map((item) => (item.id === cardId ? { ...item, isFaceUp: !item.isFaceUp } : item)),
        cardAttention: nextIsFaceUp ? { ...current.cardAttention, [cardId]: Date.now() + CARD_ATTENTION_MS } : current.cardAttention,
        modalCardId: current.modalCardId === cardId ? null : current.modalCardId,
        tableActionCardId: current.tableActionCardId === cardId ? null : current.tableActionCardId,
        logs: addLog(current.logs, `${player.name} 님이 ${card.title} 카드를 ${card.isFaceUp ? "비공개" : "공개"} 상태로 전환했습니다.`),
      };
    });
  };

  const animateCardToHand = (card, onComplete) => {
    const stageNode = stageRef.current;
    const handNode = handTrayRef.current;
    if (!stageNode || !handNode) {
      onComplete();
      return;
    }

    const stageRect = stageNode.getBoundingClientRect();
    const handRect = handNode.getBoundingClientRect();
    const startX = card.ownerId === null ? stageRect.left + (card.x + 34) * viewportScale : window.innerWidth / 2;
    const startY = card.ownerId === null ? stageRect.top + (card.y + 46) * viewportScale : window.innerHeight / 2;
    const endX = handRect.left + Math.min(88 + activeHandCards.length * 20, Math.max(handRect.width - 56, 88));
    const endY = handRect.top + handRect.height / 2;

    setTakeAnimation({
      card,
      startX,
      startY,
      endX,
      endY,
      started: false,
    });

    window.requestAnimationFrame(() => {
      window.requestAnimationFrame(() => {
        setTakeAnimation((current) => (current ? { ...current, started: true } : current));
      });
    });

    window.setTimeout(() => {
      setTakeAnimation(null);
      onComplete();
    }, TAKE_ANIMATION_MS);
  };

  const takeTableCardById = (cardId) => {
    const card = state.cards.find((item) => item.id === cardId && item.ownerId === null);
    if (!card || activePlayer.currentRoom !== "lobby") return;
    animateCardToHand(card, () => {
      setState((current) => {
        const player = getActivePlayer(current);
        const nextCard = current.cards.find((item) => item.id === cardId && item.ownerId === null);
        if (!nextCard || player.currentRoom !== "lobby") return current;
        return {
          ...current,
          cards: current.cards.map((item) => (item.id === cardId ? { ...item, ownerId: player.id, isFaceUp: false, handFaceUp: nextCard.isFaceUp } : item)),
          cardAttention: { ...current.cardAttention, [cardId]: Date.now() + CARD_ATTENTION_MS },
          modalCardId: current.modalCardId === cardId ? null : current.modalCardId,
          tableActionCardId: current.tableActionCardId === cardId ? null : current.tableActionCardId,
          logs: addLog(current.logs, `${player.name} 님이 ${nextCard.title} 카드를 손패로 가져갔습니다.`),
        };
      });
    });
  };

  const movePlayerToPoint = (clientX, clientY) => {
    if (isEditorMode) return;
    if (activePlayer.role === "GM") return;
    const stage = stageRef.current;
    if (!stage) return;
    const rect = stage.getBoundingClientRect();
    const targetX = clamp(((clientX - rect.left) / rect.width) * stageWidth, 0, stageWidth);
    const targetY = clamp(((clientY - rect.top) / rect.height) * stageHeight, 0, stageHeight);
    setState((current) => {
      const pending = current.pendingWalkTarget;
      const next = { x: targetX, y: targetY };
      if (pending) {
        const distance = Math.hypot(pending.x - next.x, pending.y - next.y);
        if (distance <= WALK_CONFIRM_DISTANCE) {
          return { ...current, walkTarget: next, pendingWalkTarget: null };
        }
      }
      return { ...current, pendingWalkTarget: next, walkTarget: null };
    });
  };

  const updateRoomValue = (roomId, key, value) => {
    setState((current) => ({
      ...current,
      rooms: current.rooms.map((room) => (room.id === roomId ? { ...room, [key]: Number(value) } : room)),
    }));
  };

  const updateMovementBound = (key, value) => {
    setState((current) => ({
      ...current,
      movementBounds: { ...current.movementBounds, [key]: Number(value) },
    }));
  };

  const updateMapSize = (key, value) => {
    setState((current) => {
      const numericValue = Number(value);
      const nextWidth = key === "width" ? numericValue : numericValue * STAGE_ASPECT_RATIO;
      return {
        ...current,
        mapSize: normalizeMapSize({ width: nextWidth }),
      };
    });
  };

  const beginRoomResize = (event, roomId, handle) => {
    event.preventDefault();
    event.stopPropagation();
    setResizeSession(createResizeSession("room", roomId, handle, state, event.clientX, event.clientY, viewportScale));
  };

  const beginMapResize = (event, handle) => {
    event.preventDefault();
    event.stopPropagation();
    setResizeSession(createResizeSession("map", null, handle, state, event.clientX, event.clientY, viewportScale));
  };

  const beginBoundsResize = (event, handle) => {
    event.preventDefault();
    event.stopPropagation();
    setResizeSession(createResizeSession("bounds", null, handle, state, event.clientX, event.clientY, viewportScale));
  };

  const beginPlayerDrag = (event, playerId) => {
    event.preventDefault();
    event.stopPropagation();
    setPlayerDragSession({ playerId });
  };

  const startDecisionSession = (type) => {
    setState((current) => {
      const player = getActivePlayer(current);
      return {
        ...current,
        decisionSession: {
          type,
          status: "collecting",
          responses: {},
          result: null,
        },
        logs: addLog(current.logs, `${player.name} 님이 ${type === "nomination" ? "지목" : "투표"} 진행을 시작했습니다.`),
      };
    });
  };

  const submitDecisionResponse = (targetId) => {
    if (!activeDecision || !isDecisionParticipant) return;
    setState((current) => resolveDecisionSubmission(current, activePlayer.id, targetId));
  };

  const toggleTableCard = () => {
    if (!modalCard) return;
    setState((current) => {
      const player = getActivePlayer(current);
      const nextIsFaceUp = !modalCard.isFaceUp;
      return {
        ...current,
        cards: current.cards.map((card) => {
          if (card.id !== modalCard.id || card.ownerId !== null) return card;
          return { ...card, isFaceUp: !card.isFaceUp };
        }),
        cardAttention: nextIsFaceUp ? { ...current.cardAttention, [modalCard.id]: Date.now() + CARD_ATTENTION_MS } : current.cardAttention,
        logs: addLog(current.logs, `${player.name} 님이 ${modalCard.title} 카드를 ${modalCard.isFaceUp ? "비공개" : "공개"} 상태로 전환했습니다.`),
      };
    });
  };

  const toggleHandCardFace = () => {
    if (!modalCard) return;
    setState((current) => {
      const player = getActivePlayer(current);
      return {
        ...current,
        cards: current.cards.map((card) => {
          if (card.id !== modalCard.id || card.ownerId !== player.id) return card;
          return { ...card, handFaceUp: !card.handFaceUp };
        }),
      };
    });
  };

  const takeCard = () => {
    if (!modalCard) return;
    animateCardToHand(modalCard, () => {
      setState((current) => {
        const player = getActivePlayer(current);
        return {
          ...current,
          cards: current.cards.map((card) => {
            if (card.id !== modalCard.id) return card;
            return { ...card, ownerId: player.id, isFaceUp: false, handFaceUp: modalCard.isFaceUp };
          }),
          cardAttention: { ...current.cardAttention, [modalCard.id]: Date.now() + CARD_ATTENTION_MS },
          modalCardId: null,
          logs: addLog(current.logs, `${player.name} 님이 ${modalCard.title} 카드를 손패로 가져갔습니다.`),
        };
      });
    });
  };

  const placeCardOnTable = (faceUp) => {
    if (!modalCard) return;
    setState((current) => {
      const player = getActivePlayer(current);
      return {
        ...current,
        cards: current.cards.map((card) => {
          if (card.id !== modalCard.id || card.ownerId !== player.id) return card;
          return { ...card, ownerId: null, isFaceUp: faceUp, handFaceUp: false };
        }),
        cardAttention: { ...current.cardAttention, [modalCard.id]: Date.now() + CARD_ATTENTION_MS },
        pendingAction: null,
        modalCardId: null,
        tableActionCardId: null,
        logs: addLog(current.logs, `${player.name} 님이 ${modalCard.title} 카드를 테이블에 ${faceUp ? "펼친 채" : "덮은 채"} 내려놓았습니다.`),
      };
    });
  };

  const openStorybook = () => {
    setState((current) => ({
      ...current,
      storybookModalPlayerId: activePlayer.id,
      storybookPageIndex: 0,
      documentModalType: null,
      modalCardId: null,
      profileModalPlayerId: null,
      pendingWalkTarget: null,
      tableActionCardId: null,
      pendingAction: null,
    }));
  };

  const openSharedRulebook = () => {
    openDocument("shared-rulebook");
  };

  const openGmRulebook = () => {
    if (activePlayer.role !== "GM") return;
    openDocument("gm-rulebook");
  };

  const dropCardAtPoint = (cardId, clientX, clientY) => {
    const stage = stageRef.current;
    if (!stage) return;
    const rect = stage.getBoundingClientRect();
    const rawX = ((clientX - rect.left) / rect.width) * stageWidth;
    const rawY = ((clientY - rect.top) / rect.height) * stageHeight;
    const targetX = clamp(rawX - 34, 0, stageWidth - 68);
    const targetY = clamp(rawY - 46, 0, stageHeight - 92);

    setState((current) => {
      const player = getActivePlayer(current);
      if (player.currentRoom !== "lobby") return current;
      const card = current.cards.find((item) => item.id === cardId);
      if (!card) return current;

      if (card.ownerId === player.id) {
        return {
          ...current,
          cards: current.cards.map((item) => (item.id === cardId ? { ...item, ownerId: null, isFaceUp: false, handFaceUp: false, x: targetX, y: targetY } : item)),
          cardAttention: { ...current.cardAttention, [cardId]: Date.now() + CARD_ATTENTION_MS },
          modalCardId: current.modalCardId === cardId ? null : current.modalCardId,
          pendingAction: null,
          tableActionCardId: null,
          logs: addLog(current.logs, `${player.name} 님이 ${card.title} 카드를 드래그해서 테이블에 내려놓았습니다.`),
        };
      }

      if (card.ownerId === null) {
        return {
          ...current,
          cards: current.cards.map((item) => (item.id === cardId ? { ...item, x: targetX, y: targetY } : item)),
          tableActionCardId: null,
          logs: current.logs,
        };
      }

      return current;
    });
  };

  const handleCardPointerDown = (event, cardId) => {
    if (activePlayer.currentRoom !== "lobby") return;
    if (event.button !== 0) return;
    dragMetaRef.current = { cardId, startX: event.clientX, startY: event.clientY };
    setDragPointer({
      cardId,
      pointerId: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      currentX: event.clientX,
      currentY: event.clientY,
      active: false,
    });
  };

  const reorderCardsForOwner = (cards, ownerId, sourceCardId, targetCardId) => {
    if (!targetCardId || sourceCardId === targetCardId) return cards;
    const sourceIndex = cards.findIndex((card) => card.id === sourceCardId && card.ownerId === ownerId);
    const targetIndex = cards.findIndex((card) => card.id === targetCardId && card.ownerId === ownerId);
    if (sourceIndex === -1 || targetIndex === -1) return cards;
    const nextCards = [...cards];
    const [sourceCard] = nextCards.splice(sourceIndex, 1);
    const insertIndex = sourceIndex < targetIndex ? targetIndex - 1 : targetIndex;
    nextCards.splice(insertIndex, 0, sourceCard);
    return nextCards;
  };

  const moveCardToHand = (cardId, targetCardId = null) => {
    setState((current) => {
      const player = getActivePlayer(current);
      if (player.currentRoom !== "lobby") return current;
      const card = current.cards.find((item) => item.id === cardId);
      if (!card) return current;

      if (card.ownerId === player.id) {
        if (!targetCardId || targetCardId === cardId) return current;
        return {
          ...current,
          cards: reorderCardsForOwner(current.cards, player.id, cardId, targetCardId),
          logs: addLog(current.logs, `${player.name} 님이 손패 순서를 정리했습니다.`),
        };
      }

      if (card.ownerId === null) {
        let nextCards = current.cards.map((item) => (item.id === cardId ? { ...item, ownerId: player.id, isFaceUp: false, handFaceUp: card.isFaceUp } : item));
        nextCards = reorderCardsForOwner(nextCards, player.id, cardId, targetCardId);
        return {
          ...current,
          cards: nextCards,
          modalCardId: current.modalCardId === cardId ? null : current.modalCardId,
          pendingAction: null,
          tableActionCardId: null,
          logs: addLog(current.logs, `${player.name} 님이 ${card.title} 카드를 손패로 끌어왔습니다.`),
        };
      }

      return current;
    });
  };

  const transferCard = (targetPlayerId) => {
    if (!modalCard) return;
    setState((current) => {
      const player = getActivePlayer(current);
      const targetPlayer = current.players.find((item) => item.id === targetPlayerId);
      if (!targetPlayer || targetPlayer.role === "GM") return current;
      return {
        ...current,
        cards: current.cards.map((card) => {
          if (card.id !== modalCard.id || card.ownerId !== player.id) return card;
          return { ...card, ownerId: targetPlayer.id };
        }),
        cardAttention: { ...current.cardAttention, [modalCard.id]: Date.now() + CARD_ATTENTION_MS },
        pendingAction: null,
        modalCardId: null,
        tableActionCardId: null,
        logs: addLog(current.logs, `${player.name} 님이 ${modalCard.title} 카드를 ${targetPlayer.name} 님에게 양도했습니다.`),
      };
    });
  };

  const canSeeModalCard = modalCard
    ? modalCard.ownerId === null
      ? modalCard.isFaceUp
      : modalCard.ownerId === activePlayer.id
        ? Boolean(modalCard.handFaceUp)
        : activePlayer.role === "GM" ? gmPeekFaceUp : false
    : false;
  const hasOverlayModal = Boolean(
    modalCard
    || profilePlayer
    || storybookPlayer
    || state.documentModalType
    || (activeDecision && activeDecision.status === "complete")
    || (activeDecision && isDecisionParticipant && activeDecision.status === "collecting" && !activeDecisionResponse),
  );
  const isFieldLensZooming = isAltZooming && !hasOverlayModal;
  const totalStageScale = 1;
  const stageTransformOrigin = "center center";
  const modalCardScale = 1;
  const chatOpacity = 1;

  const renderStageScene = ({ isLens }) => (
    <>
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.06),transparent_55%)]" />

      {state.pendingWalkTarget ? (
        <div
          className="pointer-events-none absolute z-[6] -translate-x-1/2 -translate-y-1/2"
          style={{ left: state.pendingWalkTarget.x, top: state.pendingWalkTarget.y }}
        >
          <div className="absolute left-1/2 top-0 -translate-x-1/2 -translate-y-[130%] whitespace-nowrap rounded-full border border-white/10 bg-black/55 px-3 py-1 text-[12px] font-semibold text-white/90 shadow-[0_12px_24px_rgba(0,0,0,0.22)] backdrop-blur-sm">
            이동하기
          </div>
          <div className="h-10 w-10 rounded-full border-2 border-amber-200/90 bg-amber-100/10 shadow-[0_0_0_6px_rgba(253,230,138,0.12)]" />
          <div className="absolute left-1/2 top-1/2 h-2 w-2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-amber-100/80" />
        </div>
      ) : null}

	      <div className="absolute inset-0 z-10">
	        {viewRoomId === "lobby" ? (
	          <>
	            {state.rooms.map((room) => (
	              <div
	                key={`lobby-dim-${room.id}`}
	                className="pointer-events-none absolute bg-black/42"
	                style={{ left: room.x, top: room.y, width: room.width, height: room.height }}
	              />
	            ))}
	          </>
	        ) : activeRoomZone ? (
	          <>
	            <div className="pointer-events-none absolute left-0 top-0 bg-black/42" style={{ width: stageWidth, height: activeRoomZone.y }} />
	            <div
	              className="pointer-events-none absolute left-0 bg-black/42"
	              style={{ top: activeRoomZone.y, width: activeRoomZone.x, height: activeRoomZone.height }}
            />
            <div
              className="pointer-events-none absolute bg-black/42"
              style={{
                left: activeRoomZone.x + activeRoomZone.width,
                top: activeRoomZone.y,
                width: stageWidth - (activeRoomZone.x + activeRoomZone.width),
                height: activeRoomZone.height,
              }}
            />
            <div
              className="pointer-events-none absolute left-0 bg-black/42"
              style={{
                top: activeRoomZone.y + activeRoomZone.height,
                width: stageWidth,
                height: stageHeight - (activeRoomZone.y + activeRoomZone.height),
              }}
            />
            <div
              className="pointer-events-none absolute border border-white/20 shadow-[0_0_0_9999px_rgba(0,0,0,0.08)]"
              style={{
                left: activeRoomZone.x,
                top: activeRoomZone.y,
                width: activeRoomZone.width,
                height: activeRoomZone.height,
              }}
            />
          </>
        ) : null}

        {state.rooms.map((room) => {
          return (
            <div
              key={room.id}
              data-room-id={room.id}
              className={`absolute border-4 border-dashed bg-white/6 text-left text-white/95 ${
                isMapEditing
                  ? "pointer-events-auto border-amber-300 shadow-[0_0_0_3px_rgba(252,211,77,0.32)]"
                  : activePlayer.role === "GM" && !isLens
                    ? "pointer-events-auto border-cyan-200/90 shadow-[0_0_0_2px_rgba(165,243,252,0.16)] hover:bg-white/10"
                    : "pointer-events-none border-cyan-200/90 shadow-[0_0_0_2px_rgba(165,243,252,0.16)]"
              }`}
              style={{ left: room.x, top: room.y, width: room.width, height: room.height }}
              data-hoverable={!isLens && isMapEditing ? "true" : undefined}
              onPointerDown={!isLens && !isMapEditing && activePlayer.role === "GM" && isChatFocused ? (event) => {
                event.preventDefault();
              } : undefined}
              onClick={!isLens && !isMapEditing && activePlayer.role === "GM" ? (event) => {
                event.stopPropagation();
                setGmChatRoomId(room.id);
                if (isChatFocused) {
                  window.requestAnimationFrame(() => chatInputRef.current?.focus());
                }
              } : undefined}
            >
              <button
                type="button"
                className="ml-5 mt-4 inline-flex rounded-full bg-amber-200/85 px-4 py-2 text-xl font-semibold text-stone-900"
                onPointerDown={!isLens && isMapEditing ? (event) => beginRoomResize(event, room.id, "move") : undefined}
                onClick={(event) => event.stopPropagation()}
                data-hoverable={!isLens ? "true" : undefined}
              >
                {room.name}
              </button>
              {!isLens && isMapEditing ? (
                <>
                  <ResizeHandle position="nw" onPointerDown={(event) => beginRoomResize(event, room.id, "nw")} />
                  <ResizeHandle position="ne" onPointerDown={(event) => beginRoomResize(event, room.id, "ne")} />
                  <ResizeHandle position="sw" onPointerDown={(event) => beginRoomResize(event, room.id, "sw")} />
                  <ResizeHandle position="se" onPointerDown={(event) => beginRoomResize(event, room.id, "se")} />
                </>
              ) : null}
            </div>
          );
        })}

        {renderPlayers.map((player) => (
          <div key={player.id} className="absolute z-30 -translate-x-1/2 -translate-y-1/2" style={{ left: player.x, top: player.y }}>
            <div className="relative h-24 w-20" style={{ transform: `translateY(${getJumpOffset(player, now)}px)` }}>
              {visibleSpeechByPlayer[player.id] ? (
                <div className="absolute left-1/2 top-[-84px] z-30 min-w-[180px] max-w-[330px] max-h-[320px] -translate-x-1/2 overflow-y-auto rounded-[16px] bg-[#fff8ec] px-3 py-2 text-center text-[13px] leading-[1.45] text-stone-800 shadow-[0_12px_24px_rgba(0,0,0,0.18)] whitespace-pre-wrap break-words">
                  <div className="absolute left-1/2 top-full h-2 w-2 -translate-x-1/2 -translate-y-1/2 rotate-45 bg-[#fff8ec]" />
                  {visibleSpeechByPlayer[player.id]}
                </div>
              ) : null}
              {player.id === activePlayer.id ? <div className="absolute left-1/2 top-8 h-11 w-11 -translate-x-1/2 rounded-full border-2 border-amber-300/65" /> : null}
              <PlayerSprite player={player} />
              <button
                type="button"
                onClick={!isLens ? () => openProfile(player.id) : undefined}
                onPointerDown={!isLens && isMapEditing ? (event) => beginPlayerDrag(event, player.id) : undefined}
                onPointerEnter={() => setCursorTooltipText(!isLens ? "프로필 보기" : "")}
                onPointerLeave={() => setCursorTooltipText("")}
                className="group absolute left-1/2 top-[-26px] z-20 -translate-x-1/2 transition"
                data-hoverable={!isLens ? "true" : undefined}
              >
                <span className="inline-block whitespace-nowrap px-1 py-1 text-[13px] font-extrabold leading-none tracking-[-0.01em] text-white drop-shadow-[0_2px_10px_rgba(0,0,0,0.25)]">
                  <span
                    className="chat-text-outline chat-text-outline-inline"
                    data-text={`${player.name}${player.role === "GM" ? " • GM" : ""}`}
                  >
                    {player.name}{player.role === "GM" ? " • GM" : ""}
                  </span>
                </span>
              </button>
            </div>
          </div>
        ))}

        {tableCards.map((card) => (
          <div key={card.id} className={`absolute z-10 ${isCardAttentionActive(card.id) ? "attention-wiggle" : ""}`} style={{ left: card.x, top: card.y }}>
            <div className="w-[45px]">
              <CardTile
                card={card}
                visible={card.isFaceUp}
                sequenceNumber={cardSequenceById[card.id]}
                categorySequenceNumber={cardCategorySequenceById[card.id]}
                actionLabel="카드 상세"
                highlighted={contactCard?.id === card.id}
                disabled={isEditorMode ? false : (activePlayer.currentRoom !== "lobby" && !card.isFaceUp)}
                onClick={!isLens ? () => {
                  if (isEditorMode) return openCard(card.id);
                  if (card.isFaceUp || activePlayer.currentRoom === "lobby") openCard(card.id);
                } : undefined}
                draggable={!isLens && (isEditorMode || activePlayer.currentRoom === "lobby")}
                onPointerDown={!isLens ? (event) => handleCardPointerDown(event, card.id) : undefined}
                dragging={!isLens && dragCardId === card.id}
                suppressClickRef={suppressClickRef}
                board
              />
            </div>
          </div>
        ))}
      </div>
    </>
  );

	  return (
	    <div className="flex h-screen w-screen select-none items-center justify-center overflow-hidden bg-black p-0 text-stone-100">
	      {gmTopNotice && now - gmTopNotice.timestamp <= CHAT_ITEM_VISIBLE_MS ? (
	        <div className="pointer-events-none fixed left-1/2 top-10 z-[115] w-[min(980px,92vw)] -translate-x-1/2 text-center">
	          <div className="inline-flex max-w-full items-center justify-center px-6 py-2 text-[22px] font-extrabold text-white/90">
	            <span className="chat-text-outline chat-text-outline-inline chat-gm-notice" data-text={gmTopNotice.text}>
	              {gmTopNotice.text}
	            </span>
	          </div>
	        </div>
	      ) : null}

        {!isEditorMode ? (
          <div className="pointer-events-none fixed bottom-5 left-5 z-[114]">
            <div className="inline-flex flex-col gap-1 rounded-[14px] border border-white/10 bg-black/35 px-3 py-2 text-[11px] font-semibold text-white/75 shadow-[0_14px_34px_rgba(0,0,0,0.22)] backdrop-blur-sm">
              <div><span className="font-extrabold text-white/85">WASD</span> 이동</div>
              <div>클릭 이동</div>
              <div><span className="font-extrabold text-white/85">Alt</span> 확대</div>
              <div><span className="font-extrabold text-white/85">Enter</span> 채팅</div>
            </div>
          </div>
        ) : null}
	      <div
	        className={`pointer-events-none fixed z-[120] -translate-x-1/2 -translate-y-1/2 rounded-full transition-[width,height,background-color,border-color,box-shadow,transform,opacity] duration-150 ${cursorState.visible ? "opacity-100" : "opacity-0"} ${cursorState.interactive ? "h-12 w-12 border border-amber-200/80 bg-amber-100/14 shadow-[0_0_0_6px_rgba(253,230,138,0.12)]" : "h-5 w-5 border border-white/75 bg-white/10 shadow-[0_0_0_2px_rgba(255,255,255,0.08)]"}`}
	        style={{ left: cursorState.x, top: cursorState.y }}
	      >
        <div className={`absolute left-1/2 top-1/2 rounded-full bg-white/85 transition-all duration-150 ${cursorState.interactive ? "h-1.5 w-1.5 -translate-x-1/2 -translate-y-1/2" : "h-1 w-1 -translate-x-1/2 -translate-y-1/2"}`} />
      </div>

      {cursorState.visible && cursorTooltipText ? (
        <div
          className="pointer-events-none fixed z-[121] whitespace-nowrap rounded-full border border-white/10 bg-black/55 px-4 py-1.5 text-[13px] font-semibold text-white/90 shadow-[0_12px_24px_rgba(0,0,0,0.22)] backdrop-blur-sm"
          style={{
            left: cursorState.x,
            top: cursorState.y,
            transform: "translate(18px, -44px)",
          }}
        >
          {cursorTooltipText}
        </div>
      ) : null}

	      <div
	        ref={viewportRef}
	        className="relative shrink-0 overflow-hidden outline-none"
          tabIndex={-1}
		        style={{ width: stageWidth * viewportScale, height: stageHeight * viewportScale }}
		        onPointerDownCapture={(event) => {
		          if (activePlayer.role !== "GM") return;
		          if (isAltZooming) return;
		          if (isMapEditing) return;
		          const element = event.target instanceof Element ? event.target : null;
		          const roomNode = element ? element.closest("[data-room-id]") : null;
		          if (!roomNode) {
		            if (isChatFocused) {
		              event.preventDefault();
		            }
		            setGmChatRoomId("lobby");
		            if (isChatFocused) {
		              window.requestAnimationFrame(() => chatInputRef.current?.focus());
		            }
		          }
		        }}
		        onClickCapture={(event) => {
		          if (activePlayer.role !== "GM") return;
		          if (isAltZooming) return;
		          if (isMapEditing) return;
		          const element = event.target instanceof Element ? event.target : null;
		          const roomNode = element ? element.closest("[data-room-id]") : null;
		          if (!roomNode) {
		            setGmChatRoomId("lobby");
		            if (isChatFocused) {
		              window.requestAnimationFrame(() => chatInputRef.current?.focus());
		            }
		          }
		        }}
		      >
      <div className={`pointer-events-none absolute bottom-5 right-5 z-[110] transition ${isMapEditing ? "opacity-35" : ""}`}>
        <div className="pointer-events-auto flex items-center gap-3 rounded-[18px] border border-white/10 bg-black/22 px-4 py-2 text-white shadow-[0_18px_40px_rgba(0,0,0,0.18)] backdrop-blur-sm">
          <button
            type="button"
            onClick={() => setState((current) => {
              const currentlyMuted = Boolean(current.bgmMuted || current.bgmVolume <= 0);
              if (currentlyMuted) {
                const nextVolume = current.bgmVolume > 0 ? current.bgmVolume : 0.6;
                return { ...current, bgmMuted: false, bgmVolume: clamp(nextVolume, 0, 1), bgmPlaying: true };
              }
              return { ...current, bgmMuted: true, bgmPlaying: true };
            })}
            className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-white/12 bg-white/5 text-white/80 transition hover:bg-white/10 hover:text-white"
            data-hoverable="true"
            aria-label="BGM 음소거"
          >
            {state.bgmMuted || state.bgmVolume <= 0 ? <VolumeX className="size-4" /> : <Volume2 className="size-4" />}
          </button>
          <input
            type="range"
            min={0}
            max={100}
            value={Math.round(clamp(state.bgmMuted ? 0 : state.bgmVolume, 0, 1) * 100)}
            onChange={(event) => {
              const value = clamp(Number(event.target.value) / 100, 0, 1);
              setState((current) => ({ ...current, bgmPlaying: true, bgmVolume: value, bgmMuted: value <= 0 }));
            }}
            className="h-2 w-[150px] accent-white"
            data-hoverable="true"
            aria-label="BGM 볼륨"
          />
        </div>
      </div>
      {dragPreview && dragCard ? (
        <div
          className="pointer-events-none fixed z-[70] -translate-x-1/2 -translate-y-1/2 rotate-[3deg] opacity-92 drop-shadow-[0_20px_30px_rgba(0,0,0,0.35)]"
          style={{ left: dragPreview.x, top: dragPreview.y }}
        >
          {dragHint?.text ? (
            <div className="pointer-events-none absolute left-1/2 top-0 z-10 -translate-x-1/2 -translate-y-[120%] whitespace-nowrap rounded-full border border-white/10 bg-black/55 px-3 py-1 text-[12px] font-semibold text-white/90 shadow-[0_12px_24px_rgba(0,0,0,0.25)] backdrop-blur-sm">
              {dragHint.text}
            </div>
          ) : null}
          <div className={dragCard.ownerId === null ? "w-[45px]" : dragCard.ownerId === activePlayer.id ? "w-[75px]" : "w-[64px]"}>
            <CardTile
              card={dragCard}
              visible={dragCard.ownerId === null ? dragCard.isFaceUp : true}
              sequenceNumber={cardSequenceById[dragCard.id]}
              categorySequenceNumber={cardCategorySequenceById[dragCard.id]}
              hand={dragCard.ownerId === activePlayer.id}
              board={dragCard.ownerId === null}
              compact={dragCard.ownerId !== activePlayer.id && dragCard.ownerId !== null}
            />
          </div>
        </div>
      ) : null}

      {hoveredHandCard && !modalCard && !dragCardId ? (
        <div className="pointer-events-none absolute inset-0 z-[49] flex items-center justify-center p-10">
          <div className="inline-flex flex-col items-center">
            <CardTile
              card={hoveredHandCard}
              visible={Boolean(hoveredHandCard.handFaceUp)}
              sequenceNumber={cardSequenceById[hoveredHandCard.id]}
              categorySequenceNumber={cardCategorySequenceById[hoveredHandCard.id]}
              modal
            />
          </div>
        </div>
      ) : null}

      {hoveredProfileCard && !hoveredHandCard && !modalCard && !dragCardId ? (
        <div className="pointer-events-none absolute inset-0 z-[49] flex items-center justify-center p-10">
          <div className="inline-flex flex-col items-center">
            <CardTile
              card={hoveredProfileCard}
              visible={false}
              sequenceNumber={cardSequenceById[hoveredProfileCard.id]}
              categorySequenceNumber={cardCategorySequenceById[hoveredProfileCard.id]}
              modal
            />
          </div>
        </div>
      ) : null}

      {takeAnimation ? (
        <div
          className="pointer-events-none fixed z-[90] -translate-x-1/2 -translate-y-1/2 drop-shadow-[0_20px_30px_rgba(0,0,0,0.28)]"
          style={{
            left: takeAnimation.started ? takeAnimation.endX : takeAnimation.startX,
            top: takeAnimation.started ? takeAnimation.endY : takeAnimation.startY,
            transform: `translate(-50%, -50%) scale(${takeAnimation.started ? 0.74 : 1}) rotate(${takeAnimation.started ? "6deg" : "0deg"})`,
            opacity: takeAnimation.started ? 0.84 : 1,
            transition: `left ${TAKE_ANIMATION_MS}ms cubic-bezier(0.22, 0.8, 0.2, 1), top ${TAKE_ANIMATION_MS}ms cubic-bezier(0.22, 0.8, 0.2, 1), transform ${TAKE_ANIMATION_MS}ms cubic-bezier(0.22, 0.8, 0.2, 1), opacity ${TAKE_ANIMATION_MS}ms ease`,
          }}
        >
          <div className="w-[75px]">
            <CardTile
              card={takeAnimation.card}
              visible={takeAnimation.card.ownerId === null ? takeAnimation.card.isFaceUp : true}
              sequenceNumber={cardSequenceById[takeAnimation.card.id]}
              categorySequenceNumber={cardCategorySequenceById[takeAnimation.card.id]}
              hand
            />
          </div>
        </div>
      ) : null}

      {isFieldLensZooming && viewportPointer.visible && !dragCardId && !dragPointer?.active ? (
        <div className="pointer-events-none absolute inset-0 z-[55]">
          <div className="absolute inset-0 bg-black/10 backdrop-blur-[2px]" />
          <div
            className="absolute overflow-hidden rounded-[22px] border-4 border-amber-200/95 bg-[#f7f0e4] shadow-[0_18px_36px_rgba(0,0,0,0.32)]"
            style={{
              left: viewportPointer.x,
              top: viewportPointer.y,
              width: 1080,
              height: 540,
              transform: "translate(-50%, -50%)",
            }}
          >
            <div
              className="absolute left-0 top-0 origin-top-left"
              style={{
                left: 1080 / 2 - cursorFocus.x * 5 * viewportScale,
                top: 540 / 2 - cursorFocus.y * 5 * viewportScale,
                transform: `scale(${5 * viewportScale})`,
                pointerEvents: "none",
              }}
            >
              <div
                className="relative overflow-hidden"
                style={{
                  width: stageWidth,
                  height: stageHeight,
                  backgroundImage: `linear-gradient(rgba(255,255,255,0.02), rgba(255,255,255,0.02)), url(${mummySpaceTemplate})`,
                  backgroundSize: "100% 100%",
                  backgroundPosition: "center",
                }}
              >
                {renderStageScene({ isLens: true })}
              </div>
            </div>
          </div>
        </div>
      ) : null}

      <div
        className="absolute left-0 top-0"
        style={{ width: stageWidth, height: stageHeight, transform: `scale(${viewportScale})`, transformOrigin: "top left" }}
      >
      <div
        className={`relative h-full w-full overflow-hidden border border-white/8 shadow-[0_18px_60px_rgba(0,0,0,0.28)] ${isFieldLensZooming ? "cursor-zoom-in" : "cursor-default"}`}
        style={{ width: stageWidth, height: stageHeight }}
      >
        <div
          ref={stageRef}
          className="absolute inset-0 z-0"
          data-stage-dropzone="true"
          onClick={(event) => {
            if (dragCardId || dragPointer?.active || suppressClickRef.current) return;
            if (event.target instanceof Element && event.target.closest("button, input, select, textarea, [data-hoverable='true']")) return;
            movePlayerToPoint(event.clientX, event.clientY);
          }}
          style={{
            transform: `scale(${totalStageScale})`,
            transformOrigin: stageTransformOrigin,
            backgroundImage: `linear-gradient(rgba(255,255,255,0.02), rgba(255,255,255,0.02)), url(${mummySpaceTemplate})`,
            backgroundSize: "100% 100%",
            backgroundPosition: "center",
          }}
        >
          {renderStageScene({ isLens: false })}
        </div>

        {isMapEditing ? (
          <div className="pointer-events-none absolute inset-0 z-20">
            <div className="absolute inset-0 rounded-[18px] border border-dashed border-amber-200/55" />
            <div
              className="absolute border-2 border-sky-300/80 bg-sky-300/10"
              style={{
                left: state.movementBounds.left,
                top: state.movementBounds.top,
                width: Math.max(0, state.movementBounds.right - state.movementBounds.left),
                height: Math.max(0, state.movementBounds.bottom - state.movementBounds.top),
              }}
            >
              <span className="absolute left-3 top-3 rounded-full bg-sky-200/85 px-3 py-1 text-[11px] font-semibold text-slate-900">
                이동 가능 구역
              </span>
              <div
                className="pointer-events-auto absolute left-1/2 top-0 h-5 w-16 -translate-x-1/2 -translate-y-1/2 cursor-ns-resize rounded-full border-2 border-sky-200 bg-[#235d7a]"
                onPointerDown={(event) => beginBoundsResize(event, "top")}
                data-hoverable="true"
              />
              <div
                className="pointer-events-auto absolute bottom-0 left-1/2 h-5 w-16 -translate-x-1/2 translate-y-1/2 cursor-ns-resize rounded-full border-2 border-sky-200 bg-[#235d7a]"
                onPointerDown={(event) => beginBoundsResize(event, "bottom")}
                data-hoverable="true"
              />
              <div
                className="pointer-events-auto absolute left-0 top-1/2 h-16 w-5 -translate-x-1/2 -translate-y-1/2 cursor-ew-resize rounded-full border-2 border-sky-200 bg-[#235d7a]"
                onPointerDown={(event) => beginBoundsResize(event, "left")}
                data-hoverable="true"
              />
              <div
                className="pointer-events-auto absolute right-0 top-1/2 h-16 w-5 translate-x-1/2 -translate-y-1/2 cursor-ew-resize rounded-full border-2 border-sky-200 bg-[#235d7a]"
                onPointerDown={(event) => beginBoundsResize(event, "right")}
                data-hoverable="true"
              />
            </div>
            <div className="pointer-events-auto absolute bottom-0 right-0 h-7 w-7 translate-x-1/2 translate-y-1/2 cursor-se-resize rounded-full border-2 border-amber-200 bg-[#8f452f] shadow-[0_0_0_4px_rgba(143,69,47,0.22)]" onPointerDown={(event) => beginMapResize(event, "se")} data-hoverable="true" />
          </div>
        ) : null}

        <div className={`absolute left-5 top-5 z-30 flex max-h-[calc(100%-180px)] w-[336px] flex-col items-stretch gap-2 overflow-y-auto pr-1 transition ${isMapEditing ? "pointer-events-none opacity-35" : ""}`}>
          <button
            type="button"
            onClick={() => openProfile(activePlayer.id)}
            className="group relative flex items-start gap-3 rounded-[18px] border border-amber-200/35 bg-[linear-gradient(135deg,rgba(252,211,77,0.16),rgba(0,0,0,0.18))] p-3 text-left shadow-[0_0_0_2px_rgba(252,211,77,0.12),0_18px_40px_rgba(0,0,0,0.18)] transition hover:border-amber-200/70 hover:bg-[linear-gradient(135deg,rgba(252,211,77,0.2),rgba(0,0,0,0.22))]"
          >
            <div className="pointer-events-none absolute left-0 top-0 h-full w-[6px] rounded-l-[18px] bg-amber-200/80" />
            <div className="pointer-events-none absolute bottom-2 right-2 rounded-full bg-amber-200/20 px-2 py-1 text-[11px] font-semibold text-amber-100/95">
              내 캐릭터
            </div>
            <div className="shrink-0 overflow-hidden rounded-[22px] border border-white/20 bg-white/8">
                <CharacterPortrait player={activePlayer} size="large" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-baseline justify-between gap-3">
                <div className="min-w-0 truncate text-[18px] font-semibold leading-tight text-stone-100">{activePlayer.name}</div>
                {lastDecisionOutcome && activePlayer.role !== "GM" ? (
                  <div className="shrink-0 text-[12px] font-semibold text-white/65">
                    ({formatLastDecisionBadge(lastDecisionOutcome, activePlayer.id, state.players)})
                  </div>
                ) : null}
              </div>
              <div className="mt-0.5 text-[12px] leading-snug text-amber-100/70">{activePlayerProfile?.tagline ?? ""}</div>
              <div className="mt-2 flex items-center gap-2 overflow-x-auto pb-0.5">
                {activeHandCards.length ? activeHandCards.map((card) => (
                  <div
                    key={card.id}
                    data-hoverable="true"
                    onMouseEnter={() => setHoveredProfileCardId(card.id)}
                    onMouseLeave={() => setHoveredProfileCardId((current) => (current === card.id ? null : current))}
                  >
                    <CardTile card={card} visible={false} sequenceNumber={cardSequenceById[card.id]} categorySequenceNumber={cardCategorySequenceById[card.id]} compact micro />
                  </div>
                )) : <span className="text-[12px] text-white/40">보유 카드 없음</span>}
              </div>
            </div>
          </button>

          {otherHands.map((player) => {
            const cards = state.cards.filter((card) => card.ownerId === player.id);
            const isTransferTarget = Boolean(dragHint?.text === "양도하기" && dragHint?.targetPlayerId === player.id);
            return (
              <div
                key={player.id}
                role="button"
                tabIndex={0}
                onClick={() => openProfile(player.id)}
                onKeyDown={(event) => {
                  if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault();
                    openProfile(player.id);
                  }
                }}
                data-hoverable="true"
                data-player-dropzone={player.id}
                className={`group flex cursor-pointer items-start gap-3 rounded-[18px] border border-transparent bg-black/10 p-3 text-left transition hover:border-amber-200/60 hover:bg-black/26 ${isTransferTarget ? "border-amber-200/70 bg-black/32 shadow-[0_0_0_2px_rgba(252,211,77,0.16)]" : ""}`}
              >
                <div className="shrink-0 overflow-hidden rounded-2xl border border-white/20 bg-white/8">
                  <CharacterPortrait player={player} />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-baseline justify-between gap-3">
                    <div className="min-w-0 truncate text-[16px] font-semibold text-stone-100">{player.name}</div>
                    {lastDecisionOutcome && player.role !== "GM" ? (
                      <div className="shrink-0 text-[12px] font-semibold text-white/65">
                        ({formatLastDecisionBadge(lastDecisionOutcome, player.id, state.players)})
                      </div>
                    ) : null}
                  </div>
                  <p className="mt-0.5 text-[12px] text-amber-100/60">{player.role === "GM" ? "게임 마스터" : characterById[player.id]?.tagline ?? ""}</p>
                  <div className="mt-2 flex items-center gap-2 overflow-x-auto pb-0.5">
                    {cards.length ? cards.map((card) => (
                      <div
                        key={card.id}
                        data-hoverable="true"
                        onMouseEnter={() => setHoveredProfileCardId(card.id)}
                        onMouseLeave={() => setHoveredProfileCardId((current) => (current === card.id ? null : current))}
                      >
                        <CardTile card={card} visible={false} sequenceNumber={cardSequenceById[card.id]} categorySequenceNumber={cardCategorySequenceById[card.id]} compact micro />
                      </div>
                    )) : <span className="text-[12px] text-white/40">보유 카드 없음</span>}
                  </div>
                </div>
              </div>
            );
          })}

          <div className="sticky bottom-0 z-10 -mx-0.5 mt-1 rounded-[18px] border border-white/10 bg-black/22 p-3 shadow-[0_18px_40px_rgba(0,0,0,0.18)] backdrop-blur-sm">
            <div className="mb-2 text-center text-[12px] font-semibold text-white/70">합의 진행</div>
            <div className="flex gap-2">
              <MiniActionButton onClick={() => startDecisionSession("nomination")}>지목 시작</MiniActionButton>
              <MiniActionButton onClick={() => startDecisionSession("vote")}>투표 시작</MiniActionButton>
            </div>
          </div>
        </div>

        {null}

        {showTimerPanel ? (
          <div className={`pointer-events-none fixed left-1/2 top-5 z-[65] flex -translate-x-1/2 flex-row items-stretch gap-3 transition ${isMapEditing ? "opacity-35" : ""}`}>
            <div
              className="pointer-events-auto flex items-center gap-3 rounded-[18px] border border-white/10 bg-black/22 px-4 py-2 text-white shadow-[0_18px_40px_rgba(0,0,0,0.18)] backdrop-blur-sm"
              onKeyDown={isTimerEditing ? (event) => {
                if (event.key === "Escape") {
                  event.preventDefault();
                  cancelTimerDraft();
                }
                if (event.key === "Enter") {
                  event.preventDefault();
                  applyTimerDraft();
                }
              } : undefined}
            >
              {isTimerEditing ? (
                <input
                  value={timerDraft.label}
                  onChange={(event) => setTimerDraft((current) => ({ ...current, label: event.target.value }))}
                  className="h-7 w-[160px] rounded-lg border border-white/12 bg-black/18 px-2 text-[12px] font-semibold text-white/85 placeholder:text-white/25"
                  placeholder="예: 브리핑"
                  data-hoverable="true"
                />
              ) : (
                <button
                  type="button"
                  onClick={openTimerEditor}
                  className="min-w-0 truncate text-left text-[12px] font-semibold text-white/70 hover:text-white/90"
                  data-hoverable="true"
                >
                  {state.stopwatchLabel || "타이머"}
                </button>
              )}

              {isTimerEditing ? (
                <div className="flex items-center gap-1 tabular-nums text-white/95">
                  {[
                    { field: "h", label: "시", min: 0, max: 99 },
                    { field: "m", label: "분", min: 0, max: 59 },
                    { field: "s", label: "초", min: 0, max: 59 },
                  ].map((unit, index) => (
                    <div key={unit.field} className="flex items-center gap-1">
                      <div
                        className="group flex items-center rounded-xl border border-white/10 bg-white/5 px-2 py-1"
                        onPointerDown={(event) => {
                          event.preventDefault();
                          event.stopPropagation();
                          setTimerDragSession({
                            field: unit.field,
                            min: unit.min,
                            max: unit.max,
                            startY: event.clientY,
                            startValue: Number(timerDraft[unit.field]) || 0,
                          });
                        }}
                        data-hoverable="true"
                        title="드래그로 조절"
                      >
                        <input
                          type="number"
                          min={unit.min}
                          max={unit.max}
                          value={timerDraft[unit.field]}
                          onChange={(event) => setTimerDraft((current) => ({ ...current, [unit.field]: clamp(Number(event.target.value) || 0, unit.min, unit.max) }))}
                          className="h-6 w-[44px] bg-transparent text-right text-[14px] font-semibold text-white/95 outline-none"
                          data-hoverable="true"
                        />
                        <div className="ml-1 flex flex-col">
                          <button
                            type="button"
                            onClick={() => setTimerDraft((current) => ({ ...current, [unit.field]: clamp((Number(current[unit.field]) || 0) + 1, unit.min, unit.max) }))}
                            className="h-3 w-4 text-[10px] leading-none text-white/70 hover:text-white"
                            aria-label={`${unit.label} 증가`}
                            data-hoverable="true"
                          >
                            ▲
                          </button>
                          <button
                            type="button"
                            onClick={() => setTimerDraft((current) => ({ ...current, [unit.field]: clamp((Number(current[unit.field]) || 0) - 1, unit.min, unit.max) }))}
                            className="h-3 w-4 text-[10px] leading-none text-white/70 hover:text-white"
                            aria-label={`${unit.label} 감소`}
                            data-hoverable="true"
                          >
                            ▼
                          </button>
                        </div>
                      </div>
                      {index < 2 ? <div className="px-0.5 text-[16px] font-semibold text-white/80">:</div> : null}
                    </div>
                  ))}
                </div>
              ) : (
                <button
                  type="button"
                  onClick={openTimerEditor}
                  className="shrink-0 text-[16px] font-semibold tabular-nums text-white/95 hover:text-white"
                  data-hoverable="true"
                >
                  {formatDuration(effectiveTimeMs)}
                </button>
              )}

              <button
                type="button"
                onClick={() => setState((current) => {
                  if (current.stopwatchStartedAt) {
                    return { ...current, stopwatchStartedAt: null, stopwatchElapsedMs: current.stopwatchElapsedMs + (Date.now() - current.stopwatchStartedAt) };
                  }
                  if (current.timerDurationSec <= 0) return current;
                  return { ...current, stopwatchStartedAt: Date.now() };
                })}
                className="pointer-events-auto inline-flex h-8 w-8 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-[12px] font-semibold text-white/75 transition hover:bg-white/10 hover:text-white"
                data-hoverable="true"
                aria-label={hasRunningTimer ? "타이머 정지" : "타이머 시작"}
              >
                {hasRunningTimer ? "II" : "▶"}
              </button>

              {isTimerEditing ? (
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={applyTimerDraft}
                    className="inline-flex h-8 items-center justify-center rounded-xl border border-white/10 bg-white/8 px-3 text-[12px] font-semibold text-white/85 transition hover:bg-white/12"
                    data-hoverable="true"
                  >
                    확인
                  </button>
                  <button
                    type="button"
                    onClick={cancelTimerDraft}
                    className="inline-flex h-8 items-center justify-center rounded-xl border border-white/10 bg-white/5 px-3 text-[12px] font-semibold text-white/60 transition hover:bg-white/10 hover:text-white/80"
                    data-hoverable="true"
                  >
                    취소
                  </button>
                </div>
              ) : null}
            </div>
          </div>
        ) : null}

        <div className="absolute right-8 top-24 z-[80] flex items-start justify-end gap-3">
          <div className={`pointer-events-auto absolute right-0 top-[-76px] w-[282px] rounded-[24px] border border-white/10 bg-black/22 p-4 text-white shadow-[0_18px_40px_rgba(0,0,0,0.2)] backdrop-blur-sm transition ${isMapEditing ? "opacity-35" : ""}`}>
            <div className="mb-3 flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold">세션</p>
                <p className="text-xs text-white/55">조작 플레이어 / 초기화</p>
              </div>
              <Users className="size-4 text-white/70" />
            </div>
            <div className="flex items-center gap-2">
              <select
                value={state.activePlayerId}
                onChange={(event) => {
                  const nextId = event.target.value;
                  event.target.blur();
                  pressedKeysRef.current.clear();
                  jumpHeldRef.current = false;
                  setIsChatFocused(false);
                  setState((current) => ({
                    ...current,
                    activePlayerId: nextId,
                    modalCardId: null,
                    profileModalPlayerId: null,
                    documentModalType: null,
                    tableActionCardId: null,
                    pendingAction: null,
                    storybookModalPlayerId: null,
                    storybookPageIndex: 0,
                  }));
                  window.requestAnimationFrame(() => viewportRef.current?.focus());
                }}
                className="h-10 flex-1 rounded-xl border border-white/12 bg-black/18 px-3 text-sm outline-none"
                data-hoverable="true"
                aria-label="조작 플레이어"
              >
                {state.players.map((player) => (
                  <option key={player.id} value={player.id}>
                    {player.name}{player.role === "GM" ? " [GM]" : ""} ({player.currentRoom})
                  </option>
                ))}
              </select>
              <button
                type="button"
                onClick={resetGame}
                className="inline-flex h-10 shrink-0 items-center justify-center gap-2 rounded-xl border border-white/12 bg-white/6 px-3 text-sm font-semibold text-white/85 transition hover:bg-white/10 hover:text-white"
                data-hoverable="true"
                aria-label="초기화"
              >
                <RefreshCcw className="size-4" />
              </button>
            </div>
          </div>

          <button
            type="button"
            onClick={() => {
              setUiMode((current) => (current === "edit" ? "play" : "edit"));
              setIsChatFocused(false);
              setState((current) => ({
                ...current,
                modalCardId: null,
                profileModalPlayerId: null,
                documentModalType: null,
                tableActionCardId: null,
                pendingAction: null,
                storybookModalPlayerId: null,
                storybookPageIndex: 0,
                cards: current.cards.map((card) => ({ ...card, ownerId: null, isFaceUp: false, handFaceUp: false })),
              }));
            }}
            className={`inline-flex h-14 items-center rounded-[18px] border px-4 text-sm font-semibold text-white shadow-[0_18px_40px_rgba(0,0,0,0.2)] backdrop-blur-sm transition ${isEditorMode ? "border-sky-200/65 bg-sky-950/80" : "border-white/10 bg-black/28 hover:bg-black/40"}`}
            data-hoverable="true"
          >
            {isEditorMode ? "에디터 종료" : "커스텀 에디터"}
          </button>

          {/* GM 맵 편집 버튼 제거: 커스텀 에디터의 맵 배치 탭에서 편집 */}

          {/* 메뉴 버튼(임시 제거) */}
        </div>

        {!isEditorMode ? (
        <aside
          className={`${isChatFocused ? "pointer-events-auto" : "pointer-events-none"} absolute bottom-[160px] left-[460px] right-[460px] z-[60] rounded-[24px] border p-5 text-white transition ${isChatFocused ? "border-emerald-200/55 bg-black/22 shadow-[0_0_0_2px_rgba(167,243,208,0.16),0_18px_40px_rgba(0,0,0,0.22)]" : "border-transparent bg-transparent"}`}
          style={{ opacity: chatOpacity, transition: "opacity 520ms ease" }}
        >
          <div className="flex h-[min(58vh,640px)] min-h-[420px] flex-col">
            {isChatFocused ? (
              <div className="mb-5 flex flex-wrap items-baseline gap-x-4 gap-y-1 text-white/88">
                <div className="text-[22px] font-semibold leading-tight">{getRoomName(state.rooms, activePlayer.role === "GM" ? effectiveChatRoomId : activePlayer.currentRoom)}</div>
                {chatRoomMembers.length ? (
                  <div className="text-[15px] font-semibold text-white/55">
                    {chatRoomMembers.map((member, index) => (
                      <button
                        key={member.id}
                        type="button"
                        title="프로필 보기"
                        className="bg-transparent p-0 text-inherit transition hover:text-white"
                        onClick={() => openProfile(member.id)}
                      >
                        {index ? ", " : ""}
                        {member.name}
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="text-[15px] font-semibold text-white/35">참여자 없음</div>
                )}
              </div>
            ) : null}
            <div
              ref={chatScrollRef}
              className={`mb-6 min-h-[140px] flex-1 overflow-y-auto pr-2 ${isChatFocused ? "pointer-events-auto" : "pointer-events-none"}`}
            >
	              <div className="flex min-h-full flex-col justify-end gap-0">
                {visibleChatFeedItems.length ? visibleChatFeedItems.map((item) => {
                  const ageMs = now - item.timestamp;
                  const itemOpacity = isChatFocused
                    ? 1
                    : ageMs <= CHAT_ITEM_VISIBLE_MS
                      ? 1
                      : clamp(1 - (ageMs - CHAT_ITEM_VISIBLE_MS) / Math.max(CHAT_ITEM_FADE_MS, 1), 0, 1);

                  const showMoveDivider = item.kind === "move" && item.actorId === activePlayer.id;

                  if (showMoveDivider) {
                    // 구분선은 투명도 없이 고정 표시
                    // (비활성 상태에서는 item 자체가 필터링될 수 있음)
                  }

                  if (item.kind === "move" || item.kind === "enter" || item.kind === "leave") {
                    return (
                      <div key={item.id}>
                        {showMoveDivider ? (
                          <div className="px-3 py-0.5">
                            <div className="h-px w-full bg-white/10" />
                          </div>
                        ) : null}
                        <article className="px-3 py-0.5" style={{ opacity: itemOpacity }}>
                        <div className="flex justify-end">
                          <span className="text-xs text-white/45">{formatTime(item.timestamp)}</span>
                        </div>
                        <p className="mt-0.5 text-[21px] font-extrabold text-white">
                          {renderNoticeLine(item.text, "system", item.id)}
                        </p>
                      </article>
                      </div>
                    );
                  }

                  const sender = state.players.find((player) => player.id === item.senderId);
                  const senderName = sender?.name ?? "알 수 없음";
                  return (
                    <div key={item.id}>
                      {showMoveDivider ? (
                        <div className="px-3 py-0.5">
                          <div className="h-px w-full bg-white/10" />
                        </div>
                      ) : null}
                      <article className="px-3 py-0.5" style={{ opacity: itemOpacity }}>
                      <div className="flex justify-end">
                        <span className="text-xs text-white/45">{formatTime(item.timestamp)}</span>
                      </div>
                      <p className="mt-0.5 text-[21px] font-extrabold text-white">
                        {item.kind === "gm_chat" || sender?.role === "GM" ? (
                          <span className="chat-text-outline chat-text-outline-inline chat-gm-notice" data-text={item.text}>
                            {item.text}
                          </span>
                        ) : (
                          <>
                            <span className="chat-text-outline chat-text-outline-inline chat-speaker-highlight" data-text={`${senderName} :\u00A0`}>
                              {senderName} :{"\u00A0"}
                            </span>
                            {renderChatLine(item.text, item.id)}
                          </>
                        )}
                      </p>
                    </article>
                    </div>
                  );
                }) : null}
              </div>
            </div>
            <form onSubmit={submitChat} className="pointer-events-auto flex gap-3">
              <div className="relative flex-1">
                <input
                  ref={chatInputRef}
                  value={chatDraft}
                  onChange={(event) => {
                    setChatDraft(event.target.value);
                    setChatCursorIndex(event.target.selectionStart ?? event.target.value.length);
                    setChatAutocompleteIndex(0);
                    setChatAutocompleteUserSelected(false);
                    setIsChatAutocompleteOpen(true);
                  }}
                  onKeyDown={(event) => {
                    if (!chatAutocomplete.open) return;
                    if (event.key === "ArrowDown") {
                      event.preventDefault();
                      setChatAutocompleteIndex((current) => (current + 1) % chatAutocomplete.suggestions.length);
                      setChatAutocompleteUserSelected(true);
                      return;
                    }
                    if (event.key === "ArrowUp") {
                      event.preventDefault();
                      setChatAutocompleteIndex((current) => (current - 1 + chatAutocomplete.suggestions.length) % chatAutocomplete.suggestions.length);
                      setChatAutocompleteUserSelected(true);
                      return;
                    }
                    if (event.key === "Escape") {
                      setIsChatAutocompleteOpen(false);
                      return;
                    }
	                    if (event.key === "Enter" && !event.shiftKey) {
                        if (!chatAutocompleteUserSelected) return;
	                      const selected = chatAutocomplete.suggestions[clamp(chatAutocompleteIndex, 0, chatAutocomplete.suggestions.length - 1)];
	                      if (!selected) return;
	                      event.preventDefault();
	                      applyChatAutocomplete(selected, event.currentTarget.value, event.currentTarget.selectionStart ?? event.currentTarget.value.length);
	                    }
	                  }}
                  onClick={(event) => {
                    setChatCursorIndex(event.currentTarget.selectionStart ?? 0);
                    setChatAutocompleteUserSelected(false);
                    setIsChatAutocompleteOpen(true);
                  }}
                  onKeyUp={(event) => {
                    setChatCursorIndex(event.currentTarget.selectionStart ?? 0);
                  }}
	                  onFocus={() => {
	                    if (!allowChatFocusRef.current) {
	                      chatInputRef.current?.blur();
	                      return;
	                    }
	                    allowChatFocusRef.current = false;
	                    setIsChatFocused(true);
	                    setChatAutocompleteUserSelected(false);
	                    setIsChatAutocompleteOpen(true);
	                  }}
	                  onBlur={() => {
	                    setIsChatFocused(false);
	                    setIsChatAutocompleteOpen(false);
	                  }}
                  onMouseDown={(event) => {
                    if (!isChatFocused) {
                      event.preventDefault();
                      event.stopPropagation();
                    }
                  }}
                  maxLength={180}
                  placeholder="Enter로 입력 활성화, Enter로 전송"
                  className="h-12 w-full rounded-2xl border border-white/15 bg-black/15 px-4 text-sm text-white outline-none placeholder:text-white/35 focus:border-emerald-200/50"
                />
                {isChatAutocompleteOpen && chatAutocomplete.open ? (
                  <div className="chat-autocomplete-panel absolute bottom-[52px] left-0 right-0 z-[80] overflow-hidden rounded-2xl border border-white/12 bg-black/70 p-1 backdrop-blur">
                    {chatAutocomplete.suggestions.map((name, index) => (
                      <button
	                        key={name}
	                        type="button"
	                        onMouseDown={(event) => event.preventDefault()}
	                        onClick={() => applyChatAutocomplete(name)}
                        className={`chat-autocomplete-item flex w-full items-center justify-between rounded-xl px-3 py-2 text-left text-sm transition ${
                          chatAutocompleteUserSelected && index === clamp(chatAutocompleteIndex, 0, chatAutocomplete.suggestions.length - 1)
                            ? "bg-white/10 text-white"
                            : "text-white/70 hover:bg-white/8 hover:text-white"
                        }`}
                      >
                        <span className="truncate font-semibold">{name}</span>
                        <span className="ml-3 shrink-0 text-xs text-white/40">{chatAutocomplete.isBracketQuery ? "[ ]" : "이름"}</span>
                      </button>
                    ))}
                    <div className="px-3 pb-2 pt-1 text-xs text-white/45">
                      ↑↓로 선택 · Enter로 적용
                    </div>
                  </div>
                ) : null}
              </div>
              <button type="submit" className="inline-flex h-12 items-center gap-2 rounded-2xl bg-[#8f452f] px-4 font-medium text-white transition hover:bg-[#7c3d2a]">
                전송
              </button>
            </form>
          </div>
        </aside>
        ) : null}

        {modalCard ? (
          <div
            className="absolute inset-0 z-50 flex items-center justify-center bg-slate-950/42 p-4 backdrop-blur-[2px]"
            onClick={() => setState((current) => ({ ...current, modalCardId: null, tableActionCardId: null, pendingAction: null }))}
          >
            <div
              className="inline-flex max-h-full max-w-full flex-col items-center justify-center"
            >
              <div
                style={{ transform: `scale(${modalCardScale})`, transformOrigin: "center center" }}
                onClick={(event) => event.stopPropagation()}
              >
                <CardModalPreview
                  card={modalCard}
                  visible={canSeeModalCard}
                  sequenceNumber={cardSequenceById[modalCard.id]}
                  categorySequenceNumber={cardCategorySequenceById[modalCard.id]}
                  isZooming={isAltZooming}
                  zoomFocus={modalZoomFocus}
                  flipHintText={
                    modalCard.ownerId === null && activePlayer.currentRoom === "lobby"
                      ? "뒤집기"
                      : modalCard.ownerId === activePlayer.id
                        ? (modalCard.handFaceUp ? "뒷면 보기" : "앞면 보기")
                        : ""
                  }
                  scopeHintText={
                    modalCard.ownerId === null
                      ? "*필드에 있는 카드를 뒤집으면 모두에게 공개됩니다"
                      : modalCard.ownerId === activePlayer.id
                        ? "*내 손에 있는 카드의 내용은 나에게만 보입니다"
                        : ""
                  }
                  onFlip={
                    modalCard.ownerId === null && activePlayer.currentRoom === "lobby"
                      ? toggleTableCard
                      : modalCard.ownerId === activePlayer.id
                        ? toggleHandCardFace
                        : null
                  }
                  onTooltipChange={setCursorTooltipText}
                  onPointerMove={(event) => {
                    const bounds = event.currentTarget.getBoundingClientRect();
                    setModalZoomFocus({
                      x: event.clientX - bounds.left,
                      y: event.clientY - bounds.top,
                      width: bounds.width,
                      height: bounds.height,
                    });
                  }}
                  onPointerLeave={() => setModalZoomFocus(null)}
                />
              </div>

              <div className="mt-6 flex flex-wrap items-center justify-center gap-3" onClick={(event) => event.stopPropagation()}>
                {modalCard.ownerId === null && activePlayer.currentRoom === "lobby" ? (
                  <>
                    <ActionButton onClick={takeCard}>내 손에 가져오기</ActionButton>
                  </>
                ) : null}

                {modalCard.ownerId === activePlayer.id ? (
                  <>
                    <ActionButton onClick={(event) => openActionPopover("place", event)}>필드에 내려놓기</ActionButton>
                    <ActionButton onClick={(event) => openActionPopover("transfer", event)}>양도하기</ActionButton>
                  </>
                ) : null}

                {modalCard.ownerId !== null && modalCard.ownerId !== activePlayer.id && activePlayer.role === "GM" ? (
                  <ActionButton onClick={() => setGmPeekFaceUp((current) => !current)}>
                    {gmPeekFaceUp ? "뒷면 보기" : "앞면 보기"}
                  </ActionButton>
                ) : null}
              </div>

              {modalCard.ownerId === activePlayer.id && state.pendingAction === "place" && actionPopover?.type === "place" ? (
                <div
                  className="fixed inset-0 z-[80]"
                  onClick={(event) => {
                    event.preventDefault();
                    event.stopPropagation();
                    setState((current) => ({ ...current, pendingAction: null }));
                    setActionPopover(null);
                  }}
                >
                  <div
                    className="fixed rounded-[22px] border border-white/10 bg-black/22 p-4 shadow-[0_18px_40px_rgba(0,0,0,0.22)] backdrop-blur-sm"
                    style={{
                      left: clamp(actionPopover.x - 220, 16, window.innerWidth - 16 - 440),
                      top: clamp(actionPopover.y + 10, 16, window.innerHeight - 16 - 220),
                      width: 440,
                    }}
                    onClick={(event) => event.stopPropagation()}
                  >
                    <div className="mb-3 text-center text-sm font-semibold text-white/80">어떤 상태로 내려놓을까요?</div>
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        type="button"
                        onClick={() => placeCardOnTable(true)}
                        className="group flex items-center gap-3 rounded-[18px] border border-white/10 bg-white/5 p-3 text-left transition hover:border-amber-200/55 hover:bg-white/8"
                        data-hoverable="true"
                      >
                        <div className="w-[88px] shrink-0">
                          <CardTile card={modalCard} visible sequenceNumber={cardSequenceById[modalCard.id]} categorySequenceNumber={cardCategorySequenceById[modalCard.id]} compact />
                        </div>
                        <div className="min-w-0">
                          <div className="text-sm font-semibold text-white/90">펼친 채로</div>
                          <div className="mt-0.5 text-xs text-white/55">전체공개 상태로 내려놓습니다.</div>
                        </div>
                      </button>

                      <button
                        type="button"
                        onClick={() => placeCardOnTable(false)}
                        className="group flex items-center gap-3 rounded-[18px] border border-white/10 bg-white/5 p-3 text-left transition hover:border-amber-200/55 hover:bg-white/8"
                        data-hoverable="true"
                      >
                        <div className="w-[88px] shrink-0">
                          <CardTile card={modalCard} visible={false} sequenceNumber={cardSequenceById[modalCard.id]} categorySequenceNumber={cardCategorySequenceById[modalCard.id]} compact />
                        </div>
                        <div className="min-w-0">
                          <div className="text-sm font-semibold text-white/90">덮은 채로</div>
                          <div className="mt-0.5 text-xs text-white/55">비공개 상태로 내려놓습니다.</div>
                        </div>
                      </button>
                    </div>
                  </div>
                </div>
              ) : null}

              {modalCard.ownerId === activePlayer.id && state.pendingAction === "transfer" && actionPopover?.type === "transfer" ? (
                <div
                  className="fixed inset-0 z-[80]"
                  onClick={(event) => {
                    event.preventDefault();
                    event.stopPropagation();
                    setState((current) => ({ ...current, pendingAction: null }));
                    setActionPopover(null);
                  }}
                >
                  <div
                    className="fixed rounded-[22px] border border-white/10 bg-black/22 p-4 shadow-[0_18px_40px_rgba(0,0,0,0.22)] backdrop-blur-sm"
                    style={{
                      left: clamp(actionPopover.x - 250, 16, window.innerWidth - 16 - 500),
                      top: clamp(actionPopover.y + 10, 16, window.innerHeight - 16 - 340),
                      width: 500,
                      maxHeight: 360,
                      overflow: "auto",
                    }}
                    onClick={(event) => event.stopPropagation()}
                  >
                    <div className="mb-3 text-center text-sm font-semibold text-white/80">누구에게 양도할까요?</div>
                    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                      {state.players
                        .filter((player) => player.id !== activePlayer.id && player.role !== "GM")
                        .map((player) => (
                          <button
                            key={player.id}
                            type="button"
                            onClick={() => transferCard(player.id)}
                            className="group flex items-center gap-3 rounded-[18px] border border-white/10 bg-white/5 p-3 text-left transition hover:border-amber-200/55 hover:bg-white/8"
                            data-hoverable="true"
                          >
                            <div className="shrink-0 overflow-hidden rounded-2xl border border-white/15 bg-white/5">
                              <CharacterPortrait player={player} />
                            </div>
                            <div className="min-w-0">
                              <div className="truncate text-sm font-semibold text-white/90">{player.name}</div>
                              <div className="mt-0.5 line-clamp-2 text-[11px] leading-snug text-white/55">
                                {player.role === "GM" ? "게임 마스터" : characterById[player.id]?.tagline ?? ""}
                              </div>
                            </div>
                          </button>
                        ))}
                    </div>
                  </div>
                </div>
              ) : null}
            </div>
          </div>
        ) : null}

        <div className={`absolute bottom-5 left-[480px] right-5 z-30 px-5 py-3 text-stone-900 transition ${isMapEditing ? "pointer-events-none opacity-35" : ""}`}>
          <div
            ref={handTrayRef}
            className="flex min-h-[112px] gap-2 overflow-x-auto pb-1"
            data-hand-dropzone="true"
          >
            <div
              role="button"
              tabIndex={0}
              onClick={openStorybook}
              onKeyDown={(event) => {
                if (event.key === "Enter" || event.key === " ") {
                  event.preventDefault();
                  openStorybook();
                }
              }}
              data-hoverable="true"
              className="group relative aspect-[3/4] w-[75px] shrink-0 overflow-hidden rounded-[18px] border border-amber-200/30 bg-[linear-gradient(135deg,#2c3d6b,#1f2b55)] text-white shadow-lg transition hover:-translate-y-0.5 hover:border-amber-200/70 hover:shadow-[0_0_0_2px_rgba(252,211,77,0.22)]"
            >
              <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.16),transparent_34%)]" />
              <div className="absolute inset-0 flex flex-col items-center justify-center px-3 text-center">
                <div className="text-[10px] font-semibold uppercase tracking-[0.22em] text-white/70">Storybook</div>
                <div className="mt-2 text-[18px] font-extrabold leading-none">스토리북</div>
              </div>
            </div>

            <div
              role="button"
              tabIndex={0}
              onClick={openSharedRulebook}
              onKeyDown={(event) => {
                if (event.key === "Enter" || event.key === " ") {
                  event.preventDefault();
                  openSharedRulebook();
                }
              }}
              data-hoverable="true"
              className="group relative aspect-[3/4] w-[75px] shrink-0 overflow-hidden rounded-[18px] border border-white/12 bg-[linear-gradient(135deg,#35686d,#1d3e44)] text-white shadow-lg transition hover:-translate-y-0.5 hover:border-amber-200/70 hover:shadow-[0_0_0_2px_rgba(252,211,77,0.22)]"
            >
              <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.16),transparent_34%)]" />
              <div className="absolute inset-0 flex flex-col items-center justify-center px-3 text-center">
                <div className="text-[10px] font-semibold uppercase tracking-[0.22em] text-white/70">Rulebook</div>
                <div className="mt-2 text-[16px] font-extrabold leading-none">공용 룰북</div>
              </div>
            </div>

            {activePlayer.role === "GM" ? (
              <div
                role="button"
                tabIndex={0}
                onClick={openGmRulebook}
                onKeyDown={(event) => {
                  if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault();
                    openGmRulebook();
                  }
                }}
                data-hoverable="true"
                className="group relative aspect-[3/4] w-[75px] shrink-0 overflow-hidden rounded-[18px] border border-white/12 bg-[linear-gradient(135deg,#6b3b2c,#3b1f18)] text-white shadow-lg transition hover:-translate-y-0.5 hover:border-amber-200/70 hover:shadow-[0_0_0_2px_rgba(252,211,77,0.22)]"
              >
                <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.14),transparent_34%)]" />
                <div className="absolute inset-0 flex flex-col items-center justify-center px-3 text-center">
                  <div className="text-[10px] font-semibold uppercase tracking-[0.22em] text-white/70">Rulebook</div>
                  <div className="mt-2 text-[16px] font-extrabold leading-none">GM 룰북</div>
                </div>
              </div>
            ) : null}

            {activeHandCards.length ? activeHandCards.map((card) => (
              <div key={card.id} className={isCardAttentionActive(card.id) ? "attention-wiggle" : ""}>
                <CardTile
                  card={card}
                  visible={Boolean(card.handFaceUp)}
                  sequenceNumber={cardSequenceById[card.id]}
                  categorySequenceNumber={cardCategorySequenceById[card.id]}
                  onClick={() => openHandCard(card.id)}
                  onMouseEnter={() => setHoveredHandCardId(card.id)}
                  onMouseLeave={() => setHoveredHandCardId((current) => (current === card.id ? null : current))}
                  actionLabel="카드 상세"
                  compact
                  hand
                  draggable={activePlayer.currentRoom === "lobby"}
                  onPointerDown={(event) => handleCardPointerDown(event, card.id)}
                  dragging={dragCardId === card.id}
                  suppressClickRef={suppressClickRef}
                />
              </div>
            )) : <EmptyState label="손패가 비어 있습니다. 로비에서 단서를 가져와 보세요." light />}
          </div>
        </div>
      </div>
      </div>
      </div>

      {isEditorMode ? (
        <div className="pointer-events-none absolute inset-0 z-[90] flex items-start justify-end p-6">
          <div className="pointer-events-auto w-[min(520px,92vw)] max-h-[92vh] overflow-hidden rounded-[26px] border border-white/12 bg-black/45 text-white shadow-[0_24px_80px_rgba(0,0,0,0.35)] backdrop-blur-md">
            <div className="flex items-center justify-between gap-3 border-b border-white/10 px-5 py-4">
              <div className="min-w-0">
                <div className="text-[11px] font-semibold uppercase tracking-[0.22em] text-white/55">커스텀 모드 · 게임 에디터</div>
                <div className="mt-1 truncate text-[18px] font-semibold text-white/95">{(state.gameData?.meta?.title ?? gameData.meta.title) || "시나리오"}</div>
              </div>
              <div className="flex items-center gap-2">
                <button type="button" onClick={persistGameDataDraft} className="inline-flex h-10 items-center justify-center rounded-xl border border-white/12 bg-white/8 px-3 text-sm font-semibold text-white/90 transition hover:bg-white/12">
                  저장
                </button>
                <button type="button" onClick={downloadGameData} className="inline-flex h-10 items-center justify-center rounded-xl border border-white/12 bg-white/5 px-3 text-sm font-semibold text-white/80 transition hover:bg-white/10">
                  내보내기
                </button>
                <button type="button" onClick={() => importInputRef.current?.click()} className="inline-flex h-10 items-center justify-center rounded-xl border border-white/12 bg-white/5 px-3 text-sm font-semibold text-white/80 transition hover:bg-white/10">
                  불러오기
                </button>
                <input
                  ref={importInputRef}
                  type="file"
                  accept="application/json,.json"
                  hidden
                  onChange={(event) => {
                    const file = event.target.files?.[0] ?? null;
                    if (!file) return;
                    importGameDataFromFile(file).finally(() => {
                      event.target.value = "";
                    });
                  }}
                />
              </div>
            </div>

            <div className="flex items-center justify-between gap-3 px-5 py-3">
              <label className="flex items-center gap-2 text-sm font-semibold text-white/85">
                <input
                  type="checkbox"
                  checked={Boolean(state.gameData?.gmEnabled ?? gameData.gmEnabled)}
                  onChange={(event) => setGameDataDraft((current) => ({ ...current, gmEnabled: Boolean(event.target.checked) }))}
                />
                GM 캐릭터 사용
              </label>
              <button type="button" onClick={startPlayFromGameData} className="inline-flex h-10 items-center justify-center rounded-xl bg-amber-200 px-3 text-sm font-extrabold text-stone-900 transition hover:bg-amber-100">
                이 데이터로 플레이 시작
              </button>
            </div>

            <div className="flex gap-2 border-b border-white/10 px-5 pb-4">
              {[
                ["characters", "캐릭터"],
                ["books", "읽을거리"],
                ["cards", "카드"],
                ["map", "맵 배치"],
              ].map(([key, label]) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => setEditorTab(key)}
                  className={`inline-flex h-9 items-center justify-center rounded-xl px-3 text-sm font-semibold transition ${editorTab === key ? "bg-white/14 text-white" : "bg-white/5 text-white/70 hover:bg-white/10 hover:text-white/90"}`}
                >
                  {label}
                </button>
              ))}
            </div>

            <div className="max-h-[calc(92vh-210px)] overflow-y-auto px-5 py-5">
              {editorTab === "characters" ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-between gap-3">
                    <div className="text-sm font-semibold text-white/90">캐릭터 목록</div>
                    <button
                      type="button"
                      onClick={() => {
                        const id = makeId("ch");
                        setSelectedCharacterId(id);
                        setGameDataDraft((current) => ({
                          ...current,
                          characters: [...current.characters, { id, name: "새 캐릭터", tagline: "", bio: "", tags: [], storybook: "" }],
                        }));
                      }}
                      className="inline-flex h-9 items-center justify-center rounded-xl border border-white/12 bg-white/6 px-3 text-sm font-semibold text-white/85 transition hover:bg-white/10"
                    >
                      + 추가
                    </button>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    {(state.gameData?.characters ?? gameData.characters).map((character) => (
                      <button
                        key={character.id}
                        type="button"
                        onClick={() => setSelectedCharacterId(character.id)}
                        className={`truncate rounded-xl border px-3 py-2 text-left text-sm font-semibold transition ${selectedCharacterId === character.id ? "border-amber-200/70 bg-amber-200/10 text-white" : "border-white/10 bg-white/5 text-white/70 hover:bg-white/10 hover:text-white/90"}`}
                      >
                        {character.name || "이름 없음"}
                      </button>
                    ))}
                  </div>

                  {(() => {
                    const list = state.gameData?.characters ?? gameData.characters;
                    const selected = list.find((c) => c.id === selectedCharacterId) ?? list[0] ?? null;
                    if (!selected) return null;
                    return (
                      <div className="space-y-3 rounded-2xl border border-white/10 bg-white/5 p-4">
                        <div className="flex items-center justify-between gap-3">
                          <div className="text-sm font-semibold text-white/90">캐릭터 설정</div>
                          <button
                            type="button"
                            onClick={() => {
                              setGameDataDraft((current) => ({
                                ...current,
                                characters: current.characters.filter((c) => c.id !== selected.id),
                              }));
                              setSelectedCharacterId((current) => (current === selected.id ? null : current));
                            }}
                            className="inline-flex h-9 items-center justify-center rounded-xl border border-white/12 bg-white/6 px-3 text-sm font-semibold text-white/80 transition hover:bg-white/10"
                          >
                            삭제
                          </button>
                        </div>

                        <label className="grid gap-1 text-sm">
                          <span className="text-xs font-semibold text-white/55">이름</span>
                          <input
                            value={selected.name}
                            onChange={(event) => {
                              const value = event.target.value;
                              setGameDataDraft((current) => ({
                                ...current,
                                characters: current.characters.map((c) => (c.id === selected.id ? { ...c, name: value } : c)),
                              }));
                            }}
                            className="h-10 rounded-xl border border-white/12 bg-black/25 px-3 text-white outline-none"
                          />
                        </label>

                        <label className="grid gap-1 text-sm">
                          <span className="text-xs font-semibold text-white/55">태그라인</span>
                          <input
                            value={selected.tagline}
                            onChange={(event) => {
                              const value = event.target.value;
                              setGameDataDraft((current) => ({
                                ...current,
                                characters: current.characters.map((c) => (c.id === selected.id ? { ...c, tagline: value } : c)),
                              }));
                            }}
                            className="h-10 rounded-xl border border-white/12 bg-black/25 px-3 text-white outline-none"
                          />
                        </label>

                        <label className="grid gap-1 text-sm">
                          <span className="text-xs font-semibold text-white/55">캐릭터 설명</span>
                          <textarea
                            value={selected.bio}
                            onChange={(event) => {
                              const value = event.target.value;
                              setGameDataDraft((current) => ({
                                ...current,
                                characters: current.characters.map((c) => (c.id === selected.id ? { ...c, bio: value } : c)),
                              }));
                            }}
                            className="min-h-[90px] rounded-xl border border-white/12 bg-black/25 p-3 text-white outline-none"
                          />
                        </label>

                        <label className="grid gap-1 text-sm">
                          <span className="text-xs font-semibold text-white/55">스토리북 (텍스트)</span>
                          <textarea
                            value={selected.storybook}
                            onChange={(event) => {
                              const value = event.target.value;
                              setGameDataDraft((current) => ({
                                ...current,
                                characters: current.characters.map((c) => (c.id === selected.id ? { ...c, storybook: value } : c)),
                              }));
                            }}
                            className="min-h-[160px] rounded-xl border border-white/12 bg-black/25 p-3 text-white outline-none"
                          />
                        </label>
                      </div>
                    );
                  })()}
                </div>
              ) : null}

              {editorTab === "books" ? (
                <div className="space-y-4">
                  <label className="grid gap-1 text-sm">
                    <span className="text-xs font-semibold text-white/55">공용 룰북</span>
                    <textarea
                      value={state.gameData?.books?.sharedRulebook?.body ?? gameData.books.sharedRulebook.body}
                      onChange={(event) => {
                        const value = event.target.value;
                        setGameDataDraft((current) => ({
                          ...current,
                          books: { ...current.books, sharedRulebook: { ...(current.books.sharedRulebook ?? {}), body: value } },
                        }), { sync: false });
                      }}
                      className="min-h-[260px] rounded-xl border border-white/12 bg-black/25 p-3 text-white outline-none"
                    />
                  </label>

                  <label className="grid gap-1 text-sm">
                    <span className="text-xs font-semibold text-white/55">GM 전용 룰북</span>
                    <textarea
                      value={state.gameData?.books?.gmRulebook?.body ?? gameData.books.gmRulebook.body}
                      onChange={(event) => {
                        const value = event.target.value;
                        setGameDataDraft((current) => ({
                          ...current,
                          books: { ...current.books, gmRulebook: { ...(current.books.gmRulebook ?? {}), body: value } },
                        }), { sync: false });
                      }}
                      className="min-h-[200px] rounded-xl border border-white/12 bg-black/25 p-3 text-white outline-none"
                    />
                  </label>
                </div>
              ) : null}

              {editorTab === "cards" ? (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <div className="text-xs font-semibold text-white/55">카드 카테고리</div>
                    <div className="flex flex-wrap gap-2">
                      {(state.gameData?.cards?.categories ?? gameData.cards.categories).map((category) => (
                        <div key={category} className="inline-flex items-center gap-2 rounded-xl border border-white/12 bg-white/6 px-3 py-2 text-sm font-semibold text-white/85">
                          <span className="max-w-[260px] truncate">{category}</span>
                          <button
                            type="button"
                            onClick={() => {
                              setGameDataDraft((current) => {
                                const nextCategories = (current.cards.categories ?? []).filter((c) => c !== category);
                                const safeCategories = nextCategories.length ? nextCategories : ["미분류"];
                                const fallback = safeCategories[0] ?? "미분류";
                                return {
                                  ...current,
                                  cards: {
                                    ...current.cards,
                                    categories: safeCategories,
                                    items: current.cards.items.map((card) => (card.category === category ? { ...card, category: fallback } : card)),
                                  },
                                };
                              }, { sync: false });
                            }}
                            className="inline-flex h-6 w-6 items-center justify-center rounded-lg border border-white/12 bg-black/20 text-white/80 transition hover:bg-white/10"
                            aria-label="카테고리 삭제"
                          >
                            ×
                          </button>
                        </div>
                      ))}
                    </div>
                    <input
                      value={categoryDraft}
                      onChange={(event) => setCategoryDraft(event.target.value)}
                      onKeyDown={(event) => {
                        if (event.key !== "Enter") return;
                        event.preventDefault();
                        const value = categoryDraft.trim();
                        if (!value) return;
                        setCategoryDraft("");
                        setGameDataDraft((current) => {
                          const exists = (current.cards.categories ?? []).includes(value);
                          if (exists) return current;
                          return { ...current, cards: { ...current.cards, categories: [...(current.cards.categories ?? []), value] } };
                        }, { sync: false });
                      }}
                      placeholder="카테고리 입력 후 Enter"
                      className="h-10 w-full rounded-xl border border-white/12 bg-black/25 px-3 text-white outline-none placeholder:text-white/35"
                    />
                  </div>

                  <div className="flex items-center justify-between gap-3">
                    <div className="text-sm font-semibold text-white/90">카드 목록</div>
                    <button
                      type="button"
                      onClick={() => {
                        const id = makeId("card");
                        setSelectedCardId(id);
                        setGameDataDraft((current) => ({
                          ...current,
                          cards: {
                            ...current.cards,
                            items: (() => {
                              const category = current.cards.categories[0] ?? "미분류";
                              const nextIndex = (current.cards.items ?? []).filter((item) => item.category === category).length + 1;
                              const title = `${category}단서${nextIndex}`;
                              return [...current.cards.items, { id, title, description: "", category, spawn: { x: STAGE_WIDTH / 2, y: STAGE_HEIGHT / 2 } }];
                            })(),
                          },
                        }));
                      }}
                      className="inline-flex h-9 items-center justify-center rounded-xl border border-white/12 bg-white/6 px-3 text-sm font-semibold text-white/85 transition hover:bg-white/10"
                    >
                      + 추가
                    </button>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    {(state.gameData?.cards?.items ?? gameData.cards.items).map((card) => (
                      <button
                        key={card.id}
                        type="button"
                        onClick={() => setSelectedCardId(card.id)}
                        className={`truncate rounded-xl border px-3 py-2 text-left text-sm font-semibold transition ${selectedCardId === card.id ? "border-amber-200/70 bg-amber-200/10 text-white" : "border-white/10 bg-white/5 text-white/70 hover:bg-white/10 hover:text-white/90"}`}
                      >
                        {card.title || "이름 없음"}
                      </button>
                    ))}
                  </div>

                  {(() => {
                    const list = state.gameData?.cards?.items ?? gameData.cards.items;
                    const selected = list.find((c) => c.id === selectedCardId) ?? list[0] ?? null;
                    const categories = state.gameData?.cards?.categories ?? gameData.cards.categories;
                    if (!selected) return null;
                    return (
                      <div className="space-y-3 rounded-2xl border border-white/10 bg-white/5 p-4">
                        <div className="flex items-center justify-between gap-3">
                          <div className="text-sm font-semibold text-white/90">카드 설정</div>
                          <button
                            type="button"
                            onClick={() => {
                              setGameDataDraft((current) => ({
                                ...current,
                                cards: { ...current.cards, items: current.cards.items.filter((c) => c.id !== selected.id) },
                              }));
                              setSelectedCardId((current) => (current === selected.id ? null : current));
                            }}
                            className="inline-flex h-9 items-center justify-center rounded-xl border border-white/12 bg-white/6 px-3 text-sm font-semibold text-white/80 transition hover:bg-white/10"
                          >
                            삭제
                          </button>
                        </div>

                        <label className="grid gap-1 text-sm">
                          <span className="text-xs font-semibold text-white/55">이름</span>
                          <input
                            value={selected.title}
                            onChange={(event) => {
                              const value = event.target.value;
                              setGameDataDraft((current) => ({
                                ...current,
                                cards: { ...current.cards, items: current.cards.items.map((c) => (c.id === selected.id ? { ...c, title: value } : c)) },
                              }));
                            }}
                            className="h-10 rounded-xl border border-white/12 bg-black/25 px-3 text-white outline-none"
                          />
                        </label>

                        <label className="grid gap-1 text-sm">
                          <span className="text-xs font-semibold text-white/55">내용</span>
                          <textarea
                            value={selected.description}
                            onChange={(event) => {
                              const value = event.target.value;
                              setGameDataDraft((current) => ({
                                ...current,
                                cards: { ...current.cards, items: current.cards.items.map((c) => (c.id === selected.id ? { ...c, description: value } : c)) },
                              }));
                            }}
                            className="min-h-[140px] rounded-xl border border-white/12 bg-black/25 p-3 text-white outline-none"
                          />
                        </label>

                        <label className="grid gap-1 text-sm">
                          <span className="text-xs font-semibold text-white/55">카테고리(뒷면)</span>
                          <select
                            value={selected.category}
                            onChange={(event) => {
                              const value = event.target.value;
                              setGameDataDraft((current) => ({
                                ...current,
                                cards: { ...current.cards, items: current.cards.items.map((c) => (c.id === selected.id ? { ...c, category: value } : c)) },
                              }));
                            }}
                            className="h-10 rounded-xl border border-white/12 bg-black/25 px-3 text-white outline-none"
                          >
                            {categories.map((c) => (
                              <option key={c} value={c} className="bg-slate-900">{c}</option>
                            ))}
                          </select>
                        </label>
                      </div>
                    );
                  })()}
                </div>
              ) : null}

              {editorTab === "map" ? (
                <div className="space-y-4">
                  <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-white/75">
                    - 캐릭터/카드는 스테이지에서 드래그로 초기 위치를 설정합니다.<br />
                    - 방/이동범위/맵 크기는 현재 맵 편집 UI(핸들)를 사용합니다.
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setState((current) => {
                        const allFaceUp = (current.cards ?? []).every((card) => (card.ownerId === null ? Boolean(card.isFaceUp) : true));
                        const nextFaceUp = !allFaceUp;
                        return {
                          ...current,
                          cards: (current.cards ?? []).map((card) => ({
                            ...card,
                            ownerId: null,
                            handFaceUp: false,
                            isFaceUp: nextFaceUp,
                          })),
                        };
                      });
                    }}
                    className="inline-flex h-11 w-full items-center justify-center rounded-xl border border-white/12 bg-white/6 text-sm font-semibold text-white/90 transition hover:bg-white/10"
                  >
                    모두 뒤집기
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setState((current) => {
                        const base = normalizeGameData(current.gameData ?? gameData);
                        const nextGameData = buildGameDataWithCurrentMap(base, current);
                        saveGameData(nextGameData);
                        return { ...current, gameData: nextGameData };
                      });
                      setEditorTab("cards");
                    }}
                    className="inline-flex h-11 w-full items-center justify-center rounded-xl bg-amber-200 text-sm font-extrabold text-stone-900 transition hover:bg-amber-100"
                  >
                    편집 종료(초기 리스폰 반영)
                  </button>
                </div>
              ) : null}
            </div>
          </div>
        </div>
      ) : null}

      <audio ref={bgmAudioRef} src={defaultBgm} preload="auto" hidden />

      {profilePlayer ? (
        <OverlayModal onClose={() => setState((current) => ({ ...current, profileModalPlayerId: null }))}>
          <ZoomLensPreview isZooming={isAltZooming}>
            <div className="w-[min(720px,92vw)] rounded-[28px] bg-[#f7f0e4] p-6 text-stone-900 shadow-[0_24px_80px_rgba(0,0,0,0.28)]">
              <div className="mb-5 flex items-start gap-4">
                <div className="overflow-hidden rounded-[22px] border border-stone-900/8 bg-white">
                  <CharacterPortrait player={profilePlayer} size="profile" />
                </div>
                <div className="pt-1">
                  <h2 className="mt-1 text-3xl font-semibold">{profilePlayer.name}</h2>
                  <p className="mt-1 text-sm text-stone-600">{characterById[profilePlayer.id]?.tagline ?? (profilePlayer.role === "GM" ? "게임 마스터" : "")}</p>
                </div>
              </div>
              <div className="rounded-[22px] border border-stone-900/8 bg-white/72 p-5">
                <p className="text-sm leading-7 text-stone-700">{characterById[profilePlayer.id]?.bio ?? "등록된 소개가 없습니다."}</p>
              </div>
            </div>
          </ZoomLensPreview>
        </OverlayModal>
      ) : null}

      {storybookPlayer ? (
        <FloatingModal onClose={() => setState((current) => ({ ...current, storybookModalPlayerId: null, storybookPageIndex: 0 }))}>
          <ZoomLensPreview isZooming={isAltZooming}>
            <StorybookModal
              player={storybookPlayer}
              tagline={characterById[storybookPlayer.id]?.tagline ?? ""}
              storybook={characterById[storybookPlayer.id]?.storybook ?? ""}
              pageIndex={state.storybookPageIndex}
              onPrev={() => setState((current) => ({ ...current, storybookPageIndex: Math.max(0, current.storybookPageIndex - 1) }))}
              onNext={(pageCount) => setState((current) => ({ ...current, storybookPageIndex: Math.min(pageCount - 1, current.storybookPageIndex + 1) }))}
              onClose={() => setState((current) => ({ ...current, storybookModalPlayerId: null, storybookPageIndex: 0 }))}
            />
          </ZoomLensPreview>
        </FloatingModal>
      ) : null}

      {state.documentModalType ? (
        <FloatingModal onClose={() => setState((current) => ({ ...current, documentModalType: null }))}>
          <ZoomLensPreview isZooming={isAltZooming}>
            <RulebookModalContent
              document={state.documentModalType === "gm-rulebook" ? gameData.books.gmRulebook : gameData.books.sharedRulebook}
              onClose={() => setState((current) => ({ ...current, documentModalType: null }))}
            />
          </ZoomLensPreview>
        </FloatingModal>
      ) : null}

      {activeDecision && isDecisionParticipant && activeDecision.status === "collecting" && !activeDecisionResponse ? (
        <OverlayModal onClose={() => {}}>
          <ZoomLensPreview isZooming={isAltZooming}>
            <DecisionModal
              type={activeDecision.type}
              players={nonGmPlayers.filter((player) => player.id !== activePlayer.id)}
              onSubmit={submitDecisionResponse}
              taglineById={Object.fromEntries(Object.entries(characterById).map(([id, c]) => [id, c.tagline]))}
            />
          </ZoomLensPreview>
        </OverlayModal>
      ) : null}

      {activeDecision && activeDecision.status === "complete" ? (
        <OverlayModal onClose={() => setState((current) => ({ ...current, decisionSession: null }))}>
          <ZoomLensPreview isZooming={isAltZooming}>
            <DecisionResultModal
              session={activeDecision}
              players={state.players}
              taglineById={Object.fromEntries(Object.entries(characterById).map(([id, c]) => [id, c.tagline]))}
              onClose={() => setState((current) => ({ ...current, decisionSession: null }))}
            />
          </ZoomLensPreview>
        </OverlayModal>
      ) : null}

      {lastDecisionOutcome && state.lastDecisionModalOpen ? (
        <OverlayModal onClose={() => setState((current) => ({ ...current, lastDecisionModalOpen: false }))}>
          <ZoomLensPreview isZooming={isAltZooming}>
            <DecisionResultModal
              session={{ type: lastDecisionOutcome.type, status: "complete", responses: {}, result: lastDecisionOutcome.result }}
              players={state.players}
              taglineById={Object.fromEntries(Object.entries(characterById).map(([id, c]) => [id, c.tagline]))}
              onClose={() => setState((current) => ({ ...current, lastDecisionModalOpen: false }))} />
          </ZoomLensPreview>
        </OverlayModal>
      ) : null}
    </div>
  );
}

function ControlField({ label, value, onChange, options, icon, light = false }) {
  return (
    <label className={`grid gap-2 rounded-[18px] px-3 py-2 ${light ? "bg-white/70" : "border border-white/10 bg-white/7"}`}>
      <span className={`inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.24em] ${light ? "text-stone-500" : "text-white/45"}`}>
        {icon}
        {label}
      </span>
      <select value={value} onChange={onChange} className={`h-10 min-w-[128px] rounded-2xl px-3 text-sm outline-none ${light ? "border border-stone-300 bg-white text-stone-800" : "border border-white/10 bg-black/25 text-white"}`}>
        {options.map((option) => (
          <option key={option.value} value={option.value} className={light ? "bg-white text-stone-800" : "bg-slate-900"}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  );
}

function CardTile({
  card,
  visible,
  sequenceNumber,
  categorySequenceNumber,
  onClick,
  actionLabel,
  highlighted = false,
  disabled = false,
  compact = false,
  hand = false,
  board = false,
  modal = false,
  draggable = false,
  dragging = false,
  micro = false,
  onPointerDown,
  onMouseEnter,
  onMouseLeave,
  suppressClickRef,
}) {
  const widthClass = modal ? "w-[330px]" : micro ? "w-[19px] shrink-0" : hand ? "w-[75px] shrink-0" : board ? "w-full" : compact ? "w-[64px]" : "w-[88px]";
  const cardScaleClass = modal ? "scale-[1.8333]" : micro ? "scale-[0.105]" : hand ? "scale-[0.4148]" : board ? "scale-[0.2518]" : compact ? "scale-[0.3555]" : "scale-[0.4888]";
  const cardNumber = typeof sequenceNumber === "number" && Number.isFinite(sequenceNumber) ? sequenceNumber : getCardSequence(card.id);
  const categoryCode = cardNumber > 0 ? String.fromCharCode(64 + cardNumber) : "A";
  const categoryNumber = typeof categorySequenceNumber === "number" && Number.isFinite(categorySequenceNumber) ? categorySequenceNumber : 0;
  const categoryLabel = `[${card.type ?? "문서"}]`;
  const cardTitle = card.title ?? "";
  const paddedCardNumber = String(cardNumber).padStart(3, "0");
  return (
    <div
      role={onClick ? "button" : undefined}
      tabIndex={onClick && !disabled ? 0 : undefined}
      aria-disabled={disabled || undefined}
      data-hoverable="true"
      data-hand-card-id={hand ? card.id : undefined}
      onPointerDown={draggable && !disabled ? onPointerDown : undefined}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      onClick={disabled ? undefined : (event) => {
        if (suppressClickRef?.current) {
          event.preventDefault();
          event.stopPropagation();
          return;
        }
        onClick?.();
      }}
      onKeyDown={onClick && !disabled ? (event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          onClick();
        }
      } : undefined}
      className={`group relative aspect-[3/4] ${widthClass} overflow-hidden border text-left shadow-lg transition ${visible ? "bg-[#fbf3e5] text-stone-900 hover:-translate-y-0.5" : "bg-[linear-gradient(135deg,#7f3b28,#5e2a1d)] text-white hover:-translate-y-0.5"} ${highlighted ? "border-amber-300 shadow-[0_0_0_3px_rgba(252,211,77,0.75),0_18px_28px_rgba(0,0,0,0.28)]" : visible ? "border-[#ddcfb8] hover:border-amber-300 hover:shadow-[0_0_0_2px_rgba(252,211,77,0.35)]" : "border-white/8 hover:border-white/55 hover:shadow-[0_0_0_2px_rgba(255,255,255,0.18)]"} ${dragging ? "opacity-0" : ""} ${disabled ? "cursor-not-allowed opacity-55" : ""}`}
    >
      {visible ? <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.48),transparent_34%)]" /> : <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.12),transparent_30%)]" />}
      <div className={`absolute left-0 top-0 h-[240px] w-[180px] origin-top-left ${cardScaleClass}`}>
        <div className="flex h-full w-full flex-col px-[14px] py-[14px]">
          <div className="flex items-start justify-between gap-2">
            {visible ? (
              <>
                <div className="px-2 py-1 text-[9px] font-semibold uppercase tracking-[0.24em] bg-stone-900/7 text-stone-600">
                  {`${card.type ?? "미분류"} ${categoryNumber > 0 ? categoryNumber : categoryCode}`}
                </div>
                <div className="text-[9px] font-semibold uppercase tracking-[0.22em] text-stone-400">
                  #{paddedCardNumber}
                </div>
              </>
            ) : null}
          </div>

          {visible ? (
            <>
              <div className="mt-3 border border-stone-900/8 bg-white/55 px-3 py-3">
                <p className="text-[18px] font-semibold leading-[1.12]">{cardTitle}</p>
              </div>

              <div className="mt-2 border border-stone-900/8 bg-black/[0.028] px-3 py-3">
                <p className="text-[9px] font-semibold uppercase tracking-[0.24em] text-stone-500">내용</p>
                <p className="mt-2 text-[11px] leading-[1.5]">{card.description}</p>
              </div>
            </>
          ) : (
            <div className="mt-[18px] flex flex-1 items-center justify-center">
              <div className="border border-white/10 bg-black/10 px-6 py-6 text-center">
                <p className="text-[22px] font-semibold leading-[1.1] text-white/90">{categoryLabel}</p>
              </div>
            </div>
          )}

          <div className="mt-auto pt-3" />
        </div>
      </div>
    </div>
  );
}

function CardModalPreview({ card, visible, sequenceNumber, categorySequenceNumber, isZooming, zoomFocus, onPointerMove, onPointerLeave, flipHintText, onFlip, onTooltipChange, scopeHintText }) {
  const lensWidth = 1080;
  const lensHeight = 540;
  const zoomScale = 5;
  const lensVisible = Boolean(isZooming && zoomFocus);
  const lensLeft = zoomFocus ? zoomFocus.x : lensWidth / 2;
  const lensTop = zoomFocus ? zoomFocus.y : lensHeight / 2;
  const canFlip = Boolean(flipHintText && onFlip);

  return (
    <div
      className="group relative inline-block"
      onPointerMove={(event) => {
        onPointerMove?.(event);
        if (canFlip) onTooltipChange?.(flipHintText);
      }}
      onMouseMove={(event) => {
        onPointerMove?.(event);
        if (canFlip) onTooltipChange?.(flipHintText);
      }}
      onPointerLeave={(event) => {
        onPointerLeave?.(event);
        onTooltipChange?.("");
      }}
      onMouseEnter={() => {
        if (canFlip) onTooltipChange?.(flipHintText);
      }}
      onMouseLeave={() => {
        onTooltipChange?.("");
      }}
      role={flipHintText && onFlip ? "button" : undefined}
      tabIndex={flipHintText && onFlip ? 0 : undefined}
      onClick={flipHintText && onFlip ? (event) => {
        event.preventDefault();
        event.stopPropagation();
        onFlip();
      } : undefined}
      onKeyDown={flipHintText && onFlip ? (event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          event.stopPropagation();
          onFlip();
        }
      } : undefined}
      data-hoverable="true"
    >
      <CardTile
        card={card}
        visible={visible}
        sequenceNumber={sequenceNumber}
        categorySequenceNumber={categorySequenceNumber}
        actionLabel=""
        modal
      />

      {scopeHintText ? (
        <div className="pointer-events-none absolute left-1/2 top-full mt-3 w-[min(560px,90vw)] -translate-x-1/2 text-center text-[12px] font-medium leading-relaxed text-white/62 whitespace-pre-line opacity-0 transition group-hover:opacity-100">
          {scopeHintText}
        </div>
      ) : null}

      {lensVisible ? (
        <div className="pointer-events-none absolute inset-0 overflow-hidden rounded-[18px] bg-black/16 backdrop-blur-[3px]" />
      ) : null}

      {lensVisible ? (
        <div
          className="pointer-events-none absolute overflow-hidden rounded-[22px] border-4 border-amber-200/95 bg-[#f7f0e4] shadow-[0_18px_36px_rgba(0,0,0,0.32)]"
          style={{
            left: lensLeft,
            top: lensTop,
            width: lensWidth,
            height: lensHeight,
            transform: "translate(-50%, -50%)",
          }}
        >
          <div
            className="absolute left-0 top-0 origin-top-left"
            style={{
              left: lensWidth / 2 - zoomFocus.x * zoomScale,
              top: lensHeight / 2 - zoomFocus.y * zoomScale,
              transform: `scale(${zoomScale})`,
            }}
          >
            <CardTile
              card={card}
              visible={visible}
              sequenceNumber={sequenceNumber}
              categorySequenceNumber={categorySequenceNumber}
              actionLabel=""
              modal
            />
          </div>
        </div>
      ) : null}
    </div>
  );
}

function ZoomLensPreview({ children, isZooming }) {
  const lensWidth = 1080;
  const lensHeight = 540;
  const zoomScale = 5;
  const [zoomFocus, setZoomFocus] = useState(null);
  const lensVisible = Boolean(isZooming && zoomFocus);
  const lensLeft = zoomFocus ? zoomFocus.x : lensWidth / 2;
  const lensTop = zoomFocus ? zoomFocus.y : lensHeight / 2;

  return (
    <div
      className="relative inline-block"
      onPointerMove={(event) => {
        if (!isZooming) return;
        const bounds = event.currentTarget.getBoundingClientRect();
        setZoomFocus({
          x: event.clientX - bounds.left,
          y: event.clientY - bounds.top,
        });
      }}
      onPointerLeave={() => setZoomFocus(null)}
      data-hoverable="true"
    >
      {children}

      {lensVisible ? (
        <div className="pointer-events-none absolute inset-0 overflow-hidden rounded-[18px] bg-black/16 backdrop-blur-[3px]" />
      ) : null}

      {lensVisible ? (
        <div
          className="pointer-events-none absolute overflow-hidden rounded-[22px] border-4 border-amber-200/95 bg-[#f7f0e4] shadow-[0_18px_36px_rgba(0,0,0,0.32)]"
          style={{
            left: lensLeft,
            top: lensTop,
            width: lensWidth,
            height: lensHeight,
            transform: "translate(-50%, -50%)",
          }}
        >
          <div
            className="absolute left-0 top-0 origin-top-left"
            style={{
              left: lensWidth / 2 - zoomFocus.x * zoomScale,
              top: lensHeight / 2 - zoomFocus.y * zoomScale,
              transform: `scale(${zoomScale})`,
            }}
          >
            {children}
          </div>
        </div>
      ) : null}
    </div>
  );
}

function FloatingModal({ children, onClose }) {
  const contentRef = useRef(null);

  useEffect(() => {
    if (!onClose) return undefined;

    const handlePointerDownCapture = (event) => {
      const node = contentRef.current;
      if (!node) return;
      if (event.target instanceof Node && node.contains(event.target)) return;
      event.preventDefault();
      event.stopPropagation();
      event.stopImmediatePropagation?.();
      onClose();
    };

    window.addEventListener("pointerdown", handlePointerDownCapture, { capture: true });
    return () => window.removeEventListener("pointerdown", handlePointerDownCapture, { capture: true });
  }, [onClose]);

  return (
    <div className="pointer-events-none fixed inset-0 z-50 flex items-center justify-center p-4">
      <div ref={contentRef} className="pointer-events-auto">
        {children}
      </div>
    </div>
  );
}

function ResizeHandle({ position, onPointerDown }) {
  const positionClass = {
    nw: "left-0 top-0 -translate-x-1/2 -translate-y-1/2 cursor-nwse-resize",
    ne: "right-0 top-0 translate-x-1/2 -translate-y-1/2 cursor-nesw-resize",
    sw: "left-0 bottom-0 -translate-x-1/2 translate-y-1/2 cursor-nesw-resize",
    se: "right-0 bottom-0 translate-x-1/2 translate-y-1/2 cursor-nwse-resize",
  }[position];

  return (
    <button
      type="button"
      className={`absolute h-5 w-5 rounded-full border-2 border-amber-200 bg-[#8f452f] shadow-[0_0_0_4px_rgba(143,69,47,0.18)] ${positionClass}`}
      onPointerDown={onPointerDown}
      onClick={(event) => event.stopPropagation()}
      data-hoverable="true"
    />
  );
}

function MiniActionButton({ children, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex h-9 items-center justify-center rounded-xl bg-white/10 px-3 text-xs font-semibold text-white transition hover:bg-white/18"
    >
      {children}
    </button>
  );
}

function OverlayModal({ children, onClose }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/46 p-4 backdrop-blur-[2px]" onClick={onClose}>
      <div onClick={(event) => event.stopPropagation()}>{children}</div>
    </div>
  );
}

function RulebookModalContent({ document, onClose }) {
  return (
    <div className="w-[min(760px,92vw)] rounded-[28px] bg-[#f7f0e4] p-6 text-stone-900 shadow-[0_24px_80px_rgba(0,0,0,0.28)]">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.24em] text-stone-500">Rulebook</p>
          <h2 className="mt-1 text-3xl font-semibold">{document.title}</h2>
        </div>
        {onClose ? (
          <button type="button" onClick={onClose} className="rounded-2xl border border-stone-900/10 bg-white/70 px-4 py-2 text-sm font-semibold text-stone-700 transition hover:bg-white">
            닫기
          </button>
        ) : null}
      </div>
      <div className="mt-5 max-h-[420px] overflow-hidden rounded-[22px] border border-stone-900/8 bg-white/72 p-5 text-sm leading-7 whitespace-pre-wrap text-stone-700">
        {document.body}
      </div>
    </div>
  );
}

function DecisionModal({ type, players, onSubmit, taglineById = {} }) {
  return (
    <div className="w-[min(760px,94vw)] rounded-[28px] bg-[#f7f0e4] p-6 text-stone-900 shadow-[0_24px_80px_rgba(0,0,0,0.28)]">
      <p className="text-xs uppercase tracking-[0.24em] text-stone-500">{type === "nomination" ? "Nomination" : "Vote"}</p>
      <h2 className="mt-1 text-3xl font-semibold">{type === "nomination" ? "지목 대상을 선택하세요" : "투표 대상을 선택하세요"}</h2>
      <p className="mt-2 text-sm text-stone-600">모든 플레이어가 완료해야 결과가 공개됩니다. 기권도 가능합니다.</p>
      <div className="mt-5 grid grid-cols-2 gap-3">
        {players.map((player) => (
          <button
            key={player.id}
            type="button"
            onClick={() => onSubmit(player.id)}
            className="group flex items-start gap-3 rounded-2xl border border-stone-900/8 bg-white/72 px-4 py-3 text-left transition hover:bg-white"
          >
            <div className="shrink-0 overflow-hidden rounded-2xl border border-stone-900/8 bg-[#f8f1e8]">
              <CharacterPortrait player={player} />
            </div>
            <div className="min-w-0 flex-1">
              <div className="truncate text-[15px] font-semibold text-stone-900">
                {player.name}
              </div>
              <div className="mt-1 line-clamp-2 text-[12px] leading-snug text-stone-600">
                {taglineById[player.id] ?? ""}
              </div>
            </div>
            <div className="shrink-0 self-center text-[12px] font-semibold text-stone-500 transition group-hover:text-stone-800">
              선택
            </div>
          </button>
        ))}
        <button
          type="button"
          onClick={() => onSubmit("abstain")}
          className="col-span-2 rounded-2xl border border-stone-900/10 bg-stone-900 px-4 py-3 text-sm font-semibold text-white transition hover:bg-stone-800"
        >
          기권
        </button>
      </div>
    </div>
  );
}

function DecisionResultModal({ session, players, onClose, taglineById = {} }) {
  const result = session.result;
  const highlightWinner = (targetId) => session.type === "vote" && result.winners?.includes(targetId);
  return (
    <div className="w-[min(860px,94vw)] rounded-[28px] bg-[#f7f0e4] p-6 text-stone-900 shadow-[0_24px_80px_rgba(0,0,0,0.28)]">
      <p className="text-xs uppercase tracking-[0.24em] text-stone-500">{session.type === "nomination" ? "Nomination Result" : "Vote Result"}</p>
      <h2 className="mt-1 text-3xl font-semibold">{session.type === "nomination" ? "지목 결과" : "투표 결과"}</h2>
      {session.type === "nomination" ? (
        <div className="mt-5 space-y-3">
          {result.lines.map((line, index) => (
            <div key={`${line.from}-${line.to}-${index}`} className="grid grid-cols-[minmax(0,1fr)_56px_minmax(0,1fr)] items-center gap-3 rounded-2xl border border-stone-900/8 bg-white/72 px-4 py-4">
              <div className="flex min-w-0 items-center gap-3">
                <div className="overflow-hidden rounded-2xl border border-stone-900/8 bg-[#f8f1e8]">
                  <CharacterPortrait player={players.find((p) => p.id === line.from)} />
                </div>
                <div className="min-w-0">
                  <div className="text-sm font-semibold text-stone-900">{getPlayerName(players, line.from)}</div>
                  <div className="text-xs text-stone-600">{taglineById[line.from] ?? ""}</div>
                </div>
              </div>

              <div className="flex items-center justify-center text-[20px] font-extrabold text-stone-500">→</div>

              {line.to === "abstain" ? (
                <div className="flex items-center justify-end">
                  <div className="rounded-2xl border border-dashed border-stone-900/15 bg-stone-900/5 px-4 py-2 text-sm font-semibold text-stone-600">
                    기권
                  </div>
                </div>
              ) : (
                <div className="flex min-w-0 items-center justify-end gap-3">
                  <div className="min-w-0 text-right">
                    <div className="truncate text-sm font-semibold text-stone-900">{getPlayerName(players, line.to)}</div>
                    <div className="truncate text-xs text-stone-600">{taglineById[line.to] ?? ""}</div>
                  </div>
                  <div className="overflow-hidden rounded-2xl border border-stone-900/8 bg-[#f8f1e8]">
                    <CharacterPortrait player={players.find((p) => p.id === line.to)} />
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="mt-5">
          <div className="space-y-3">
            {result.counts.map((entry) => (
              <div
                key={entry.targetId}
                className={`flex items-center justify-between gap-3 rounded-2xl border bg-white/72 px-4 py-3 ${highlightWinner(entry.targetId) ? "border-amber-300 shadow-[0_0_0_2px_rgba(252,211,77,0.25)]" : "border-stone-900/8"}`}
              >
                {entry.targetId === "abstain" ? (
                  <div className="text-sm font-semibold text-stone-700">기권</div>
                ) : (
                  <div className="flex min-w-0 items-center gap-3">
                    <div className="overflow-hidden rounded-2xl border border-stone-900/8 bg-[#f8f1e8]">
                      <CharacterPortrait player={players.find((p) => p.id === entry.targetId)} />
                    </div>
                    <div className="min-w-0">
                      <div className="truncate text-sm font-semibold text-stone-900">{getPlayerName(players, entry.targetId)}</div>
                      <div className="truncate text-xs text-stone-600">{taglineById[entry.targetId] ?? ""}</div>
                    </div>
                  </div>
                )}
                <div className="shrink-0 rounded-2xl bg-stone-900/8 px-3 py-2 text-sm font-semibold text-stone-700">
                  {entry.count}표
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4 rounded-2xl bg-stone-900 px-4 py-3 text-sm font-semibold text-white">
            최다 득표: {result.winners.length ? result.winners.map((winner) => winner === "abstain" ? "기권" : getPlayerName(players, winner)).join(", ") : "없음"}
          </div>
        </div>
      )}
      <div className="mt-5 flex justify-end">
        <ActionButton onClick={onClose}>닫기</ActionButton>
      </div>
    </div>
  );
}

function EmptyState({ label, light = false }) {
  return <div className={`rounded-[22px] border border-dashed px-4 py-5 text-sm leading-6 ${light ? "border-stone-300 bg-white/50 text-stone-500" : "border-white/10 bg-black/15 text-white/45"}`}>{label}</div>;
}

function ActionButton({ children, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="rounded-2xl border border-white/12 bg-black/45 px-5 py-3 text-sm font-semibold text-white/88 shadow-[0_18px_34px_rgba(0,0,0,0.22)] transition hover:bg-black/55 hover:text-white active:translate-y-[1px]"
    >
      {children}
    </button>
  );
}

function splitStorybookIntoPages(text) {
  const normalized = String(text ?? "").trim();
  if (!normalized) return ["스토리북이 비어 있습니다."];
  const maxChars = 360;
  const chunks = normalized
    .split(/\n\s*\n/g)
    .map((item) => item.trim())
    .filter(Boolean)
    .flatMap((paragraph) => {
      if (paragraph.length <= maxChars) return [paragraph];
      const parts = [];
      let cursor = 0;
      while (cursor < paragraph.length) {
        const sliceEnd = Math.min(cursor + maxChars, paragraph.length);
        const window = paragraph.slice(cursor, sliceEnd);
        const lastNewline = window.lastIndexOf("\n");
        const lastSpace = window.lastIndexOf(" ");
        const breakAt = lastNewline > 120 ? lastNewline + 1 : lastSpace > 120 ? lastSpace + 1 : window.length;
        parts.push(paragraph.slice(cursor, cursor + breakAt).trim());
        cursor += breakAt;
      }
      return parts.filter(Boolean);
    });

  const pages = [];
  let current = "";
  chunks.forEach((chunk) => {
    const next = current ? `${current}\n\n${chunk}` : chunk;
    if (next.length > maxChars && current) {
      pages.push(current);
      current = chunk;
      return;
    }
    current = next;
  });
  if (current) pages.push(current);
  return pages.length ? pages : ["스토리북이 비어 있습니다."];
}

function StorybookModal({ player, tagline = "", storybook, pageIndex, onPrev, onNext, onClose }) {
  const pages = splitStorybookIntoPages(storybook);
  const safeIndex = clamp(pageIndex, 0, pages.length - 1);
  return (
    <div className="w-[min(820px,94vw)] rounded-[30px] bg-[#f7f0e4] p-7 text-stone-900 shadow-[0_24px_80px_rgba(0,0,0,0.28)]">
      <div className="mb-5 flex items-start justify-between gap-4">
        <div>
          <div className="text-[11px] font-semibold uppercase tracking-[0.22em] text-stone-500">스토리북</div>
          <div className="mt-1 text-2xl font-semibold">{player.name}</div>
          <div className="mt-1 text-sm text-stone-600">{tagline}</div>
        </div>
        <button type="button" onClick={onClose} className="rounded-2xl border border-stone-900/10 bg-white/70 px-4 py-2 text-sm font-semibold text-stone-700 transition hover:bg-white">
          닫기
        </button>
      </div>

      <div className="relative rounded-[22px] border border-stone-900/8 bg-white/72 p-6" data-hoverable="true">
        <div className="mb-3 flex items-center justify-between text-xs text-stone-500">
          <span>페이지 {safeIndex + 1} / {pages.length}</span>
          <span className="font-semibold uppercase tracking-[0.22em]">읽기 모드</span>
        </div>
        <div className="max-h-[52vh] overflow-hidden pr-2 text-[15px] leading-7 text-stone-700 whitespace-pre-wrap">
          {pages[safeIndex]}
        </div>
      </div>

      <div className="mt-5 flex items-center justify-between gap-3">
        <button
          type="button"
          onClick={onPrev}
          disabled={safeIndex === 0}
          className={`inline-flex h-12 items-center justify-center rounded-2xl px-5 text-sm font-semibold transition ${safeIndex === 0 ? "cursor-not-allowed bg-stone-900/5 text-stone-400" : "bg-stone-900/8 text-stone-700 hover:bg-stone-900/12"}`}
        >
          이전
        </button>
        <button
          type="button"
          onClick={() => onNext(pages.length)}
          disabled={safeIndex >= pages.length - 1}
          className={`inline-flex h-12 items-center justify-center rounded-2xl px-5 text-sm font-semibold transition ${safeIndex >= pages.length - 1 ? "cursor-not-allowed bg-stone-900/5 text-stone-400" : "bg-[#8f452f] text-white hover:bg-[#7c3d2a]"}`}
        >
          다음
        </button>
      </div>
    </div>
  );
}

function CharacterPortrait({ player, size = "small" }) {
  const canvasRef = useRef(null);
  const dimensions = size === "profile" ? 120 : size === "large" ? 104 : size === "micro" ? 32 : 52;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const context = canvas.getContext("2d");
    if (!context) return;
    let cancelled = false;

    getOrBuildSpriteSheet().then((sheet) => {
      if (cancelled) return;
      context.imageSmoothingEnabled = false;
      context.clearRect(0, 0, canvas.width, canvas.height);
      context.drawImage(
        sheet,
        0,
        SPRITE_ROWS.down * SPRITE_FRAME_SIZE,
        SPRITE_FRAME_SIZE,
        SPRITE_FRAME_SIZE,
        0,
        0,
        canvas.width,
        canvas.height,
      );
    });

    return () => {
      cancelled = true;
    };
  }, [dimensions, player?.id]);

  return (
    <canvas
      ref={canvasRef}
      width={dimensions}
      height={dimensions}
      className={size === "profile" ? "block h-[120px] w-[120px] shrink-0" : size === "large" ? "block h-[104px] w-[104px] shrink-0" : size === "micro" ? "block h-[32px] w-[32px] shrink-0" : "block h-[52px] w-[52px] shrink-0"}
      style={{ imageRendering: "pixelated" }}
    />
  );
}

function PlayerSprite({ player }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const context = canvas.getContext("2d");
    if (!context) return;
    let cancelled = false;

    getOrBuildSpriteSheet().then((sheet) => {
      if (cancelled) return;
      const frameColumn = getSpriteFrameColumn(player);
      const frameRow = SPRITE_ROWS[player.facing] ?? SPRITE_ROWS.down;
      context.imageSmoothingEnabled = true;
      context.clearRect(0, 0, canvas.width, canvas.height);
      context.drawImage(
        sheet,
        frameColumn * SPRITE_FRAME_SIZE,
        frameRow * SPRITE_FRAME_SIZE,
        SPRITE_FRAME_SIZE,
        SPRITE_FRAME_SIZE,
        0,
        0,
        canvas.width,
        canvas.height,
      );
    });

    return () => {
      cancelled = true;
    };
  }, [player]);

  return (
    <canvas
      ref={canvasRef}
      width={SPRITE_FRAME_SIZE * SPRITE_DISPLAY_SCALE}
      height={SPRITE_FRAME_SIZE * SPRITE_DISPLAY_SCALE}
      className="absolute left-1/2 top-0 h-16 w-16 -translate-x-1/2 drop-shadow-[0_10px_12px_rgba(0,0,0,0.35)]"
    />
  );
}

function getOrBuildSpriteSheet() {
  const cached = spriteSheetCache.get("mummy-template");
  if (cached) return Promise.resolve(cached);
  if (spriteSheetPromise) return spriteSheetPromise;

  spriteSheetPromise = buildMummySpriteSheet().then((sheet) => {
    spriteSheetCache.set("mummy-template", sheet);
    return sheet;
  });

  return spriteSheetPromise;
}

async function buildMummySpriteSheet() {
  const source = await loadImage(mummyCharacterTemplate);
  const frames = extractMummyFrames(source);
  const canvas = document.createElement("canvas");
  canvas.width = SPRITE_FRAME_SIZE * SPRITE_FRAME_COUNT;
  canvas.height = SPRITE_FRAME_SIZE * 4;
  const context = canvas.getContext("2d");
  if (!context) throw new Error("Unable to build sprite sheet");

  Object.entries(SPRITE_ROWS).forEach(([facing, row]) => {
    const frame = frames[facing];
    for (let col = 0; col < SPRITE_FRAME_COUNT; col += 1) {
      const bounce = col === 1 ? -1 : col === 3 ? 1 : 0;
      drawTemplateFrame(context, frame, col * SPRITE_FRAME_SIZE, row * SPRITE_FRAME_SIZE, bounce);
    }
  });

  return canvas;
}

function extractMummyFrames(source) {
  const quadrantWidth = Math.floor(source.width / 2);
  const quadrantHeight = Math.floor(source.height / 2);
  const quadrants = {
    down: [0, 0],
    right: [quadrantWidth, 0],
    left: [0, quadrantHeight],
    up: [quadrantWidth, quadrantHeight],
  };

  return Object.fromEntries(
    Object.entries(quadrants).map(([facing, [x, y]]) => {
      const canvas = document.createElement("canvas");
      canvas.width = quadrantWidth;
      canvas.height = quadrantHeight;
      const context = canvas.getContext("2d");
      if (!context) throw new Error("Unable to process character frame");
      context.drawImage(source, x, y, quadrantWidth, quadrantHeight, 0, 0, quadrantWidth, quadrantHeight);

      const imageData = context.getImageData(0, 0, quadrantWidth, quadrantHeight);
      const trimmed = trimChromaKeyFrame(imageData, quadrantWidth, quadrantHeight);
      return [facing, trimmed];
    }),
  );
}

function trimChromaKeyFrame(imageData, width, height) {
  const data = imageData.data;
  let minX = width;
  let minY = height;
  let maxX = -1;
  let maxY = -1;

  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      const index = (y * width + x) * 4;
      const red = data[index];
      const green = data[index + 1];
      const blue = data[index + 2];
      const alpha = data[index + 3];
      if (alpha === 0) continue;

      const greenDominance = green - Math.max(red, blue);
      if (greenDominance > CHARACTER_KEY_TOLERANCE) {
        const softenedAlpha = Math.max(0, 255 - ((greenDominance - CHARACTER_KEY_TOLERANCE) * 255) / CHARACTER_KEY_FEATHER);
        data[index + 3] = softenedAlpha;
      }

      if (data[index + 3] > 16) {
        minX = Math.min(minX, x);
        minY = Math.min(minY, y);
        maxX = Math.max(maxX, x);
        maxY = Math.max(maxY, y);
      }
    }
  }

  if (maxX === -1 || maxY === -1) {
    const emptyCanvas = document.createElement("canvas");
    emptyCanvas.width = SPRITE_FRAME_SIZE;
    emptyCanvas.height = SPRITE_FRAME_SIZE;
    return emptyCanvas;
  }

  const cropX = Math.max(0, minX - CHARACTER_TRIM_PADDING);
  const cropY = Math.max(0, minY - CHARACTER_TRIM_PADDING);
  const cropWidth = Math.min(width - cropX, maxX - minX + 1 + CHARACTER_TRIM_PADDING * 2);
  const cropHeight = Math.min(height - cropY, maxY - minY + 1 + CHARACTER_TRIM_PADDING * 2);

  const sourceCanvas = document.createElement("canvas");
  sourceCanvas.width = width;
  sourceCanvas.height = height;
  const sourceContext = sourceCanvas.getContext("2d");
  if (!sourceContext) throw new Error("Unable to finalize character frame");
  sourceContext.putImageData(imageData, 0, 0);

  const frameCanvas = document.createElement("canvas");
  frameCanvas.width = cropWidth;
  frameCanvas.height = cropHeight;
  const frameContext = frameCanvas.getContext("2d");
  if (!frameContext) throw new Error("Unable to crop character frame");
  frameContext.drawImage(sourceCanvas, cropX, cropY, cropWidth, cropHeight, 0, 0, cropWidth, cropHeight);
  return frameCanvas;
}

function drawTemplateFrame(context, frame, frameX, frameY, bounce = 0) {
  const drawWidth = Math.max(18, Math.round((frame.width / frame.height) * 28));
  const drawHeight = 28;
  const drawX = frameX + Math.round((SPRITE_FRAME_SIZE - drawWidth) / 2);
  const drawY = frameY + SPRITE_FRAME_SIZE - drawHeight - 2 + bounce;
  context.clearRect(frameX, frameY, SPRITE_FRAME_SIZE, SPRITE_FRAME_SIZE);
  context.drawImage(frame, drawX, drawY, drawWidth, drawHeight);
}

function loadImage(source) {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = reject;
    image.src = source;
  });
}

function getStepMode(column) {
  if (column === 1) return "stepA";
  if (column === 3) return "stepB";
  return "idle";
}

function getSpriteFrameColumn(player) {
  const elapsed = Date.now() - (player.lastMovedAt ?? 0);
  if (elapsed > 180) return 0;
  return player.stepCycle === 0 ? 1 : 3;
}

function getDirectionFromKey(key) {
  const normalized = key.toLowerCase();
  if (["w", "ㅈ", "arrowup"].includes(normalized)) return { dx: 0, dy: -PLAYER_STEP };
  if (["s", "ㄴ", "arrowdown"].includes(normalized)) return { dx: 0, dy: PLAYER_STEP };
  if (["a", "ㅁ", "arrowleft"].includes(normalized)) return { dx: -PLAYER_STEP, dy: 0 };
  if (["d", "ㅇ", "arrowright"].includes(normalized)) return { dx: PLAYER_STEP, dy: 0 };
  return null;
}

function getMovementVectorFromKeys(pressedKeys) {
  let dx = 0;
  let dy = 0;

  if (pressedKeys.has("w") || pressedKeys.has("ㅈ") || pressedKeys.has("arrowup")) dy -= PLAYER_STEP;
  if (pressedKeys.has("s") || pressedKeys.has("ㄴ") || pressedKeys.has("arrowdown")) dy += PLAYER_STEP;
  if (pressedKeys.has("a") || pressedKeys.has("ㅁ") || pressedKeys.has("arrowleft")) dx -= PLAYER_STEP;
  if (pressedKeys.has("d") || pressedKeys.has("ㅇ") || pressedKeys.has("arrowright")) dx += PLAYER_STEP;

  if (dx === 0 && dy === 0) return null;

  if (dx !== 0 && dy !== 0) {
    const diagonalStep = Math.round(PLAYER_STEP * 0.7);
    dx = dx > 0 ? diagonalStep : -diagonalStep;
    dy = dy > 0 ? diagonalStep : -diagonalStep;
  }

  return { dx, dy };
}

function createResizeSession(type, roomId, handle, state, clientX, clientY, viewportScale) {
  const origin = {
    x: clientX / Math.max(viewportScale, 0.001),
    y: clientY / Math.max(viewportScale, 0.001),
  };
  if (type === "map") {
    return {
      type,
      handle,
      origin,
      startMapSize: { ...state.mapSize },
    };
  }
  if (type === "bounds") {
    return {
      type,
      handle,
      origin,
      startBounds: { ...state.movementBounds },
      startMapSize: { ...state.mapSize },
    };
  }
  const room = state.rooms.find((item) => item.id === roomId);
  if (!room) return null;
  return {
    type,
    roomId,
    handle,
    origin,
    startRoom: { ...room },
    startMapSize: { ...state.mapSize },
  };
}

function applyResizeSession(state, session, clientX, clientY, viewportScale) {
  if (!session) return state;
  const pointer = {
    x: clientX / Math.max(viewportScale, 0.001),
    y: clientY / Math.max(viewportScale, 0.001),
  };
  const dx = pointer.x - session.origin.x;
  const dy = pointer.y - session.origin.y;

  if (session.type === "map") {
    const widthFromX = session.startMapSize.width + dx;
    const widthFromY = session.startMapSize.width + dy * STAGE_ASPECT_RATIO;
    const nextWidth = clamp(Math.round(Math.max(widthFromX, widthFromY)), 960, 3200);
    const nextHeight = Math.round(nextWidth / STAGE_ASPECT_RATIO);
    return {
      ...state,
      mapSize: { width: nextWidth, height: nextHeight },
    };
  }

  if (session.type === "bounds") {
    const minBoundsWidth = 320;
    const minBoundsHeight = 240;
    const startBounds = session.startBounds;
    if (!startBounds) return state;

    let left = startBounds.left;
    let top = startBounds.top;
    let right = startBounds.right;
    let bottom = startBounds.bottom;

    if (session.handle === "left") {
      left = clamp(Math.round(startBounds.left + dx), 0, right - minBoundsWidth);
    }
    if (session.handle === "right") {
      right = clamp(Math.round(startBounds.right + dx), left + minBoundsWidth, state.mapSize.width);
    }
    if (session.handle === "top") {
      top = clamp(Math.round(startBounds.top + dy), 0, bottom - minBoundsHeight);
    }
    if (session.handle === "bottom") {
      bottom = clamp(Math.round(startBounds.bottom + dy), top + minBoundsHeight, state.mapSize.height);
    }

    return {
      ...state,
      movementBounds: { left, top, right, bottom },
    };
  }

  const minRoomWidth = 140;
  const minRoomHeight = 120;
  const startRoom = session.startRoom;
  if (!startRoom) return state;

  let nextX = startRoom.x;
  let nextY = startRoom.y;
  let nextWidth = startRoom.width;
  let nextHeight = startRoom.height;

  if (session.handle === "move") {
    nextX = clamp(Math.round(startRoom.x + dx), 0, Math.max(0, state.mapSize.width - startRoom.width));
    nextY = clamp(Math.round(startRoom.y + dy), 0, Math.max(0, state.mapSize.height - startRoom.height));
  } else {
    const right = startRoom.x + startRoom.width;
    const bottom = startRoom.y + startRoom.height;

    if (session.handle.includes("w")) {
      nextX = clamp(Math.round(startRoom.x + dx), 0, right - minRoomWidth);
      nextWidth = right - nextX;
    }
    if (session.handle.includes("e")) {
      nextWidth = clamp(Math.round(startRoom.width + dx), minRoomWidth, state.mapSize.width - startRoom.x);
    }
    if (session.handle.includes("n")) {
      nextY = clamp(Math.round(startRoom.y + dy), 0, bottom - minRoomHeight);
      nextHeight = bottom - nextY;
    }
    if (session.handle.includes("s")) {
      nextHeight = clamp(Math.round(startRoom.height + dy), minRoomHeight, state.mapSize.height - startRoom.y);
    }
  }

  return {
    ...state,
    rooms: state.rooms.map((room) => (room.id === session.roomId ? { ...room, x: nextX, y: nextY, width: nextWidth, height: nextHeight } : room)),
  };
}

function movePlayerState(state, dx, dy, options = {}) {
  const player = getActivePlayer(state);
  if (player.role === "GM") return { ...state, walkTarget: null };
  const bounds = state.movementBounds ?? { left: TABLE_SAFE_LEFT, top: TABLE_SAFE_TOP, right: TABLE_SAFE_RIGHT, bottom: TABLE_SAFE_BOTTOM };
  const nextPlayer = {
    ...player,
    facing: getFacingFromVector(dx, dy),
    stepCycle: (player.stepCycle + 1) % 2,
    lastMovedAt: Date.now(),
    x: clamp(player.x + dx, bounds.left, bounds.right),
    y: clamp(player.y + dy, bounds.top, bounds.bottom),
  };
  nextPlayer.currentRoom = detectRoom(state.rooms, nextPlayer.x, nextPlayer.y);
  const changedRoom = nextPlayer.currentRoom !== player.currentRoom;
  if (changedRoom) {
    nextPlayer.joinedRoomAt = { ...player.joinedRoomAt, [nextPlayer.currentRoom]: Date.now() };
  }

  let nextState = {
    ...state,
    players: state.players.map((item) => (item.id === player.id ? nextPlayer : item)),
    walkTarget: options.keepWalkTarget ? state.walkTarget : null,
    modalCardId: changedRoom ? null : state.modalCardId,
    tableActionCardId: changedRoom ? null : state.tableActionCardId,
    pendingAction: changedRoom ? null : state.pendingAction,
    logs: state.logs,
  };

  if (changedRoom) {
    const timestamp = Date.now();
    const feedMoveSelf = { id: `f-${crypto.randomUUID()}`, kind: "move", actorId: player.id, roomId: nextPlayer.currentRoom, text: buildSelfMoveNotice(nextState, nextPlayer.currentRoom), timestamp };
    const feedMoveGm = { id: `f-${crypto.randomUUID()}`, kind: "move", actorId: player.id, roomId: nextPlayer.currentRoom, text: buildMoveNotice(nextState, player.name, nextPlayer.currentRoom), timestamp };
    nextState = appendFeedItemFor(nextState, [player.id], feedMoveSelf);
    nextState = appendFeedItemFor(nextState, gmPlayerIds(nextState), feedMoveGm);

    const leaveText = buildLeaveNotice(nextState, player.name, player.currentRoom);
    const leaveFeed = { id: `f-${crypto.randomUUID()}`, kind: "leave", actorId: player.id, roomId: player.currentRoom, text: leaveText, timestamp };
    const leaveObservers = [
      ...nonGmPlayersInRoom(nextState, player.currentRoom).map((p) => p.id).filter((id) => id !== player.id),
      ...gmPlayerIds(nextState),
    ];
    nextState = appendFeedItemFor(nextState, leaveObservers, leaveFeed);

    const enterText = buildEnterNotice(nextState, player.name, nextPlayer.currentRoom);
    const enterFeed = { id: `f-${crypto.randomUUID()}`, kind: "enter", actorId: player.id, roomId: nextPlayer.currentRoom, text: enterText, timestamp };
    const enterObservers = [
      ...nonGmPlayersInRoom(nextState, nextPlayer.currentRoom).map((p) => p.id).filter((id) => id !== player.id),
      ...gmPlayerIds(nextState),
    ];
    nextState = appendFeedItemFor(nextState, enterObservers, enterFeed);
  }

  return nextState;
}

function movePlayerTowardTargetState(state) {
  const player = getActivePlayer(state);
  if (player.role === "GM") return { ...state, walkTarget: null };
  const target = state.walkTarget;
  if (!target) return state;
  const dx = target.x - player.x;
  const dy = target.y - player.y;
  const distance = Math.hypot(dx, dy);
  if (distance <= PLAYER_STEP) {
    const bounds = state.movementBounds ?? { left: TABLE_SAFE_LEFT, top: TABLE_SAFE_TOP, right: TABLE_SAFE_RIGHT, bottom: TABLE_SAFE_BOTTOM };
    const finalX = clamp(target.x, bounds.left, bounds.right);
    const finalY = clamp(target.y, bounds.top, bounds.bottom);
    const nextPlayer = {
      ...player,
      x: finalX,
      y: finalY,
      facing: getFacingFromVector(dx, dy),
      stepCycle: (player.stepCycle + 1) % 2,
      lastMovedAt: Date.now(),
      currentRoom: detectRoom(state.rooms, finalX, finalY),
    };
    const changedRoom = nextPlayer.currentRoom !== player.currentRoom;
    if (changedRoom) nextPlayer.joinedRoomAt = { ...player.joinedRoomAt, [nextPlayer.currentRoom]: Date.now() };
    let nextState = {
      ...state,
      players: state.players.map((item) => (item.id === player.id ? nextPlayer : item)),
      walkTarget: null,
      logs: state.logs,
    };

	    if (changedRoom) {
	      const timestamp = Date.now();
	      const feedMoveSelf = { id: `f-${crypto.randomUUID()}`, kind: "move", actorId: player.id, roomId: nextPlayer.currentRoom, text: buildSelfMoveNotice(nextState, nextPlayer.currentRoom), timestamp };
	      const feedMoveGm = { id: `f-${crypto.randomUUID()}`, kind: "move", actorId: player.id, roomId: nextPlayer.currentRoom, text: buildMoveNotice(nextState, player.name, nextPlayer.currentRoom), timestamp };
	      nextState = appendFeedItemFor(nextState, [player.id], feedMoveSelf);
	      nextState = appendFeedItemFor(nextState, gmPlayerIds(nextState), feedMoveGm);

	      const leaveText = buildLeaveNotice(nextState, player.name, player.currentRoom);
	      const leaveFeed = { id: `f-${crypto.randomUUID()}`, kind: "leave", actorId: player.id, roomId: player.currentRoom, text: leaveText, timestamp };
	      const leaveObservers = [
	        ...nonGmPlayersInRoom(nextState, player.currentRoom).map((p) => p.id).filter((id) => id !== player.id),
	        ...gmPlayerIds(nextState),
	      ];
	      nextState = appendFeedItemFor(nextState, leaveObservers, leaveFeed);

	      const enterText = buildEnterNotice(nextState, player.name, nextPlayer.currentRoom);
	      const enterFeed = { id: `f-${crypto.randomUUID()}`, kind: "enter", actorId: player.id, roomId: nextPlayer.currentRoom, text: enterText, timestamp };
	      const enterObservers = [
	        ...nonGmPlayersInRoom(nextState, nextPlayer.currentRoom).map((p) => p.id).filter((id) => id !== player.id),
	        ...gmPlayerIds(nextState),
	      ];
	      nextState = appendFeedItemFor(nextState, enterObservers, enterFeed);
	    }

    return nextState;
  }
  const ratio = PLAYER_STEP / distance;
  return movePlayerState(state, Math.round(dx * ratio), Math.round(dy * ratio), { keepWalkTarget: true });
}

function jumpPlayerState(state) {
  const player = getActivePlayer(state);
  if (player.role === "GM") return state;
  const jumpUntil = Date.now() + JUMP_DURATION;
  return {
    ...state,
    players: state.players.map((item) => (item.id === player.id ? { ...item, jumpUntil, lastMovedAt: Date.now() } : item)),
  };
}

function movePlayerToRoomState(state, roomId) {
  const player = getActivePlayer(state);
  if (player.role === "GM") return state;
  const room = state.rooms.find((item) => item.id === roomId);
  if (!room || player.currentRoom === roomId) return state;
  const centerX = room.x + room.width / 2;
  const centerY = room.y + room.height / 2;
  const nextPlayer = {
    ...player,
    facing: getFacingFromVector(centerX - player.x, centerY - player.y),
    stepCycle: (player.stepCycle + 1) % 2,
    lastMovedAt: Date.now(),
    jumpUntil: player.jumpUntil,
    x: centerX,
    y: centerY,
    currentRoom: roomId,
    joinedRoomAt: { ...player.joinedRoomAt, [roomId]: Date.now() },
  };
  let nextState = {
    ...state,
    players: state.players.map((item) => (item.id === player.id ? nextPlayer : item)),
    walkTarget: null,
    modalCardId: null,
    tableActionCardId: null,
    pendingAction: null,
    logs: state.logs,
  };

  const timestamp = Date.now();
  const feedMoveSelf = { id: `f-${crypto.randomUUID()}`, kind: "move", actorId: player.id, roomId, text: buildSelfMoveNotice(nextState, roomId), timestamp };
  const feedMoveGm = { id: `f-${crypto.randomUUID()}`, kind: "move", actorId: player.id, roomId, text: buildMoveNotice(nextState, player.name, roomId), timestamp };
  nextState = appendFeedItemFor(nextState, [player.id], feedMoveSelf);
  nextState = appendFeedItemFor(nextState, gmPlayerIds(nextState), feedMoveGm);

  const leaveText = buildLeaveNotice(nextState, player.name, player.currentRoom);
  const leaveFeed = { id: `f-${crypto.randomUUID()}`, kind: "leave", actorId: player.id, roomId: player.currentRoom, text: leaveText, timestamp };
  const leaveObservers = [
    ...nonGmPlayersInRoom(nextState, player.currentRoom).map((p) => p.id).filter((id) => id !== player.id),
    ...gmPlayerIds(nextState),
  ];
  nextState = appendFeedItemFor(nextState, leaveObservers, leaveFeed);

  const enterText = buildEnterNotice(nextState, player.name, roomId);
  const enterFeed = { id: `f-${crypto.randomUUID()}`, kind: "enter", actorId: player.id, roomId, text: enterText, timestamp };
  const enterObservers = [
    ...nonGmPlayersInRoom(nextState, roomId).map((p) => p.id).filter((id) => id !== player.id),
    ...gmPlayerIds(nextState),
  ];
  nextState = appendFeedItemFor(nextState, enterObservers, enterFeed);

  return nextState;
}

function movePlayerByDrag(state, playerId, clientX, clientY, stageRect) {
  const editor = getActivePlayer(state);
  if (editor.role !== "GM") return state;
  const targetPlayer = state.players.find((player) => player.id === playerId && player.role !== "GM");
  if (!targetPlayer) return state;
  if (!stageRect || stageRect.width <= 0 || stageRect.height <= 0) return state;

  const bounds = state.movementBounds ?? { left: TABLE_SAFE_LEFT, top: TABLE_SAFE_TOP, right: TABLE_SAFE_RIGHT, bottom: TABLE_SAFE_BOTTOM };
  const rawX = ((clientX - stageRect.left) / stageRect.width) * state.mapSize.width;
  const rawY = ((clientY - stageRect.top) / stageRect.height) * state.mapSize.height;
  const nextX = clamp(Math.round(rawX), bounds.left, bounds.right);
  const nextY = clamp(Math.round(rawY), bounds.top, bounds.bottom);
  const nextRoom = detectRoom(state.rooms, nextX, nextY);
  const changedRoom = nextRoom !== targetPlayer.currentRoom;
  let nextState = {
    ...state,
    players: state.players.map((player) => {
      if (player.id !== playerId) return player;
      return {
        ...player,
        x: nextX,
        y: nextY,
        currentRoom: nextRoom,
        joinedRoomAt: changedRoom ? { ...player.joinedRoomAt, [nextRoom]: Date.now() } : player.joinedRoomAt,
      };
    }),
    logs: state.logs,
  };

  if (changedRoom) {
    const timestamp = Date.now();
    const feedMoveSelf = { id: `f-${crypto.randomUUID()}`, kind: "move", actorId: targetPlayer.id, roomId: nextRoom, text: buildSelfMoveNotice(nextState, nextRoom), timestamp };
    const feedMoveGm = { id: `f-${crypto.randomUUID()}`, kind: "move", actorId: targetPlayer.id, roomId: nextRoom, text: buildMoveNotice(nextState, targetPlayer.name, nextRoom), timestamp };
    nextState = appendFeedItemFor(nextState, [targetPlayer.id], feedMoveSelf);
    nextState = appendFeedItemFor(nextState, gmPlayerIds(nextState), feedMoveGm);

    const leaveText = buildLeaveNotice(nextState, targetPlayer.name, targetPlayer.currentRoom);
    const leaveFeed = { id: `f-${crypto.randomUUID()}`, kind: "leave", actorId: targetPlayer.id, roomId: targetPlayer.currentRoom, text: leaveText, timestamp };
    const leaveObservers = [
      ...nonGmPlayersInRoom(nextState, targetPlayer.currentRoom).map((p) => p.id).filter((id) => id !== targetPlayer.id),
      ...gmPlayerIds(nextState),
    ];
    nextState = appendFeedItemFor(nextState, leaveObservers, leaveFeed);

    const enterText = buildEnterNotice(nextState, targetPlayer.name, nextRoom);
    const enterFeed = { id: `f-${crypto.randomUUID()}`, kind: "enter", actorId: targetPlayer.id, roomId: nextRoom, text: enterText, timestamp };
    const enterObservers = [
      ...nonGmPlayersInRoom(nextState, nextRoom).map((p) => p.id).filter((id) => id !== targetPlayer.id),
      ...gmPlayerIds(nextState),
    ];
    nextState = appendFeedItemFor(nextState, enterObservers, enterFeed);
  }

  return nextState;
}

function getActivePlayer(state) {
  return state.players.find((player) => player.id === state.activePlayerId) ?? state.players[0];
}

function getPlayerName(players, playerId) {
  const player = players.find((item) => item.id === playerId) ?? null;
  if (!player) return "알 수 없음";
  return player.name ?? "알 수 없음";
}

function getRoomName(rooms, roomId) {
  return rooms.find((room) => room.id === roomId)?.name ?? "로비";
}

function detectRoom(rooms, x, y) {
  const room = rooms.find((item) => x >= item.x && x <= item.x + item.width && y >= item.y && y <= item.y + item.height);
  return room ? room.id : "lobby";
}

function getFacingFromVector(dx, dy) {
  if (Math.abs(dx) > Math.abs(dy)) return dx >= 0 ? "right" : "left";
  return dy >= 0 ? "down" : "up";
}

function addLog(logs, text, roomId = "lobby") {
  return [...logs, { id: `l-${crypto.randomUUID()}`, roomId, text, timestamp: Date.now() }];
}

function addFeedItem(feeds, playerId, item) {
  const existing = feeds[playerId];
  const next = Array.isArray(existing) ? [...existing, item] : [item];
  return { ...feeds, [playerId]: next };
}

function appendFeedItemFor(state, playerIds, item) {
  return playerIds.reduce((nextState, id) => ({ ...nextState, feeds: addFeedItem(nextState.feeds ?? {}, id, item) }), state);
}

function gmPlayerIds(state) {
  return (state.players ?? []).filter((player) => player.role === "GM").map((player) => player.id);
}

function nonGmPlayersInRoom(state, roomId) {
  return (state.players ?? []).filter((player) => player.role !== "GM" && player.currentRoom === roomId);
}

function buildEnterNotice(state, playerName, roomId) {
  const particle = subjectParticle(playerName);
  if (roomId === "lobby") return `- ${playerName}${particle} 로비${directionParticle("로비")} 들어왔습니다.`;
  const roomName = getRoomName(state.rooms, roomId);
  return `- ${playerName}${particle} ${roomName}에 들어왔습니다.`;
}

function buildLeaveNotice(state, playerName, roomId) {
  const particle = subjectParticle(playerName);
  if (roomId === "lobby") return `- ${playerName}${particle} 로비${objectParticle("로비")} 떠났습니다.`;
  const roomName = getRoomName(state.rooms, roomId);
  return `- ${playerName}${particle} ${roomName}${objectParticle(roomName)} 떠났습니다.`;
}

function buildMoveNotice(state, playerName, roomId) {
  const particle = subjectParticle(playerName);
  const roomName = getRoomName(state.rooms, roomId);
  return `- ${playerName}${particle} ${roomName}${directionParticle(roomName)} 이동했습니다.`;
}

function buildSelfMoveNotice(state, roomId) {
  const roomName = getRoomName(state.rooms, roomId);
  return `- ${roomName}${directionParticle(roomName)} 이동했습니다.`;
}

function hasFinalConsonant(koreanText) {
  const trimmed = (koreanText ?? "").trim();
  if (!trimmed) return false;
  const code = trimmed.codePointAt(trimmed.length - 1);
  if (!code) return false;
  if (code < 0xac00 || code > 0xd7a3) return false;
  return (code - 0xac00) % 28 !== 0;
}

function subjectParticle(word) {
  return hasFinalConsonant(word) ? "이" : "가";
}

function objectParticle(word) {
  return hasFinalConsonant(word) ? "을" : "를";
}

function directionParticle(word) {
  const trimmed = (word ?? "").trim();
  if (!trimmed) return "로";
  if (!hasFinalConsonant(trimmed)) return "로";
  return endsWithRieul(trimmed) ? "로" : "으로";
}

function endsWithRieul(koreanText) {
  const trimmed = (koreanText ?? "").trim();
  if (!trimmed) return false;
  const code = trimmed.codePointAt(trimmed.length - 1);
  if (!code) return false;
  if (code < 0xac00 || code > 0xd7a3) return false;
  const jong = (code - 0xac00) % 28;
  return jong === 8;
}

function buildRoomNotice(state, playerName, roomId) {
  const particle = subjectParticle(playerName);
  if (roomId === "lobby") return `${playerName}${particle} 로비${directionParticle("로비")} 돌아왔습니다.`;
  const roomName = getRoomName(state.rooms, roomId);
  return `${playerName}${particle} ${roomName} 밀담에 합류했습니다.`;
}

function buildRoomLeaveNotice(state, playerName, roomId) {
  const particle = subjectParticle(playerName);
  if (roomId === "lobby") return `${playerName}${particle} 로비${objectParticle("로비")} 떠났습니다.`;
  const roomName = getRoomName(state.rooms, roomId);
  return `${playerName}${particle} ${roomName} 밀담에서 나갔습니다.`;
}

function getJumpOffset(player, now) {
  if (!player.jumpUntil || now >= player.jumpUntil) return 0;
  const progress = 1 - (player.jumpUntil - now) / JUMP_DURATION;
  const arc = Math.sin(progress * Math.PI);
  const softenedArc = Math.pow(arc, 0.82);
  return Math.round(-softenedArc * 28);
}

function truncateSpeech(text) {
  if (text.length <= 24) return text;
  return `${text.slice(0, 24)}…`;
}

function formatTime(timestamp) {
  return new Intl.DateTimeFormat("ko-KR", { hour: "2-digit", minute: "2-digit", second: "2-digit" }).format(timestamp);
}

function formatDuration(durationMs) {
  const totalSeconds = Math.max(0, Math.floor(durationMs / 1000));
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  return [hours, minutes, seconds].map((value) => String(value).padStart(2, "0")).join(":");
}

function formatDecisionOutcome(outcome, players) {
  if (!outcome) return "";
  const playerName = (id) => players.find((player) => player.id === id)?.name ?? id;
  if (outcome.type === "nomination") {
    const lines = outcome.result?.lines ?? [];
    const pairs = lines
      .map((line) => `${playerName(line.from)}→${playerName(line.to)}`)
      .join(", ");
    return `지목: ${pairs || "결과 없음"}`;
  }
  const winners = outcome.result?.winners ?? [];
  const counts = outcome.result?.counts ?? [];
  const maxCount = counts[0]?.count ?? 0;
  const winnerLabel = winners.length
    ? `${winners.map((id) => playerName(id)).join(", ")} (${maxCount}표)`
    : "결과 없음";
  return `투표: ${winnerLabel}`;
}

function formatLastDecisionBadge(outcome, playerId, players) {
  if (!outcome) return "";
  if (outcome.type === "nomination") {
    const line = outcome.result?.lines?.find((item) => item.from === playerId) ?? null;
    if (!line) return "";
    if (line.to === "abstain") return "→ 기권";
    return `→ ${getPlayerName(players, line.to)}`;
  }
  const entry = outcome.result?.counts?.find((item) => item.targetId === playerId) ?? null;
  const count = entry?.count ?? 0;
  return `${count}표`;
}

function DecisionOutcomeSummary({ outcome, players }) {
  if (!outcome) return null;
  const getPlayer = (id) => players.find((player) => player.id === id) ?? null;
  const nameFor = (id) => getPlayerName(players, id);

  if (outcome.type === "nomination") {
    const lines = outcome.result?.lines ?? [];
    if (!lines.length) return <div className="text-[14px] font-semibold text-white/90">지목 결과 없음</div>;
    return (
      <div>
        <div className="grid grid-cols-2 gap-x-3 gap-y-1.5">
          {lines.map((line, index) => {
            const fromPlayer = getPlayer(line.from);
            const toPlayer = line.to === "abstain" ? null : getPlayer(line.to);
            return (
              <div key={`${line.from}-${line.to}-${index}`} className="flex min-w-0 items-center gap-2">
                {fromPlayer ? (
                  <div className="overflow-hidden rounded-lg border border-white/10 bg-[#f8f1e8]">
                    <CharacterPortrait player={fromPlayer} size="micro" />
                  </div>
                ) : null}
                <div className="min-w-0 truncate text-[11px] font-semibold text-white/90">
                  {nameFor(line.from)}
                </div>
                <div className="shrink-0 text-[12px] font-extrabold text-white/55">→</div>
                {line.to === "abstain" ? (
                  <div className="shrink-0 rounded-lg border border-dashed border-white/20 bg-white/5 px-2 py-1 text-[10px] font-semibold text-white/75">기권</div>
                ) : (
                  <div className="min-w-0 truncate text-[11px] font-semibold text-white/90">
                    {nameFor(line.to)}
                  </div>
                )}
                {toPlayer ? (
                  <div className="overflow-hidden rounded-lg border border-white/10 bg-[#f8f1e8]">
                    <CharacterPortrait player={toPlayer} size="micro" />
                  </div>
                ) : null}
              </div>
            );
          })}
        </div>
        <div className="pt-2 text-right text-[11px] font-semibold text-white/50">클릭해서 전체 보기</div>
      </div>
    );
  }

  const winners = outcome.result?.winners ?? [];
  const counts = outcome.result?.counts ?? [];
  const maxCount = counts[0]?.count ?? 0;
  const topWinner = winners[0] ?? null;
  if (!counts.length) return <div className="text-[14px] font-semibold text-white/90">투표 결과 없음</div>;
  return (
    <div>
      <div className="flex flex-wrap gap-2">
        {counts.map((entry) => {
          if (entry.targetId === "abstain") {
            return (
              <div key={entry.targetId} className="flex items-center gap-2 rounded-xl border border-dashed border-white/20 bg-white/5 px-2 py-1 text-[11px] font-semibold text-white/80">
                기권
                <span className="rounded-lg bg-white/10 px-1.5 py-0.5 text-[10px] text-white/80">{entry.count}표</span>
              </div>
            );
          }
          const player = getPlayer(entry.targetId);
          const isTop = entry.count === maxCount;
          return (
            <div
              key={entry.targetId}
              className={`flex items-center gap-2 rounded-xl border px-2 py-1 text-[11px] font-semibold ${isTop ? "border-amber-200/40 bg-amber-200/10 text-amber-50" : "border-white/10 bg-white/5 text-white/85"}`}
            >
              {player ? (
                <div className="overflow-hidden rounded-lg border border-white/10 bg-[#f8f1e8]">
                  <CharacterPortrait player={player} size="micro" />
                </div>
              ) : null}
              <span className="max-w-[140px] truncate">{nameFor(entry.targetId)}</span>
              <span className={`rounded-lg px-1.5 py-0.5 text-[10px] ${isTop ? "bg-amber-200/15 text-amber-200" : "bg-white/10 text-white/80"}`}>{entry.count}표</span>
            </div>
          );
        })}
      </div>
      <div className="pt-2 text-right text-[11px] font-semibold text-white/50">클릭해서 전체 보기</div>
    </div>
  );
}

function resolveDecisionSubmission(state, playerId, targetId) {
  const session = normalizeDecisionSession(state.decisionSession);
  if (!session || session.status !== "collecting") return state;
  const player = state.players.find((item) => item.id === playerId);
  if (!player || player.role === "GM") return state;

  const nextResponses = { ...session.responses, [playerId]: targetId };
  const participantIds = state.players.filter((item) => item.role !== "GM").map((item) => item.id);
  const isComplete = participantIds.every((id) => nextResponses[id]);
  if (!isComplete) {
    return {
      ...state,
      decisionSession: { ...session, responses: nextResponses },
    };
  }

  const result = session.type === "nomination"
    ? {
        lines: participantIds.map((id) => ({ from: id, to: nextResponses[id] })),
      }
    : buildVoteResult(participantIds.map((id) => nextResponses[id]));

  return {
    ...state,
    decisionSession: {
      ...session,
      responses: nextResponses,
      status: "complete",
      result,
    },
    lastDecisionOutcome: {
      type: session.type,
      completedAt: Date.now(),
      result,
    },
  };
}

function buildVoteResult(votes) {
  const counter = new Map();
  votes.forEach((vote) => {
    counter.set(vote, (counter.get(vote) ?? 0) + 1);
  });
  const counts = [...counter.entries()]
    .map(([targetId, count]) => ({ targetId, count }))
    .sort((a, b) => b.count - a.count || a.targetId.localeCompare(b.targetId));
  const max = counts[0]?.count ?? 0;
  const winners = counts.filter((entry) => entry.count === max).map((entry) => entry.targetId);
  return { counts, winners };
}

function getContactCard(cards, player) {
  if (!player || player.currentRoom !== "lobby") return null;
  return cards.find((card) => isPlayerTouchingCard(player, card)) ?? null;
}

function isPlayerTouchingCard(player, card) {
  const cardLeft = card.x - 16;
  const cardRight = card.x + BOARD_CARD_WIDTH + 16;
  const cardTop = card.y - 18;
  const cardBottom = card.y + BOARD_CARD_HEIGHT + 18;
  const playerLeft = player.x - 24;
  const playerRight = player.x + 24;
  const playerTop = player.y - 38;
  const playerBottom = player.y + 20;
  const overlapsX = playerRight >= cardLeft && playerLeft <= cardRight;
  const overlapsY = playerBottom >= cardTop && playerTop <= cardBottom;
  return overlapsX && overlapsY;
}

function getCardSequence(cardId) {
  const numeric = Number.parseInt(cardId.replace(/\D/g, ""), 10);
  return Number.isNaN(numeric) ? 0 : numeric;
}

function getCardCategoryCode(cardId) {
  const numeric = getCardSequence(cardId);
  if (numeric <= 0) return "A";
  return String.fromCharCode(64 + numeric);
}

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

export default App;
