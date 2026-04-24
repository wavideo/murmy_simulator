import { useEffect, useRef, useState } from "react";
import {
  BookOpen,
  Clock3,
  DoorOpen,
  Footprints,
  Menu,
  MessageSquare,
  RefreshCcw,
  ScrollText,
  Search,
  Send,
  Shield,
  Users,
} from "lucide-react";
import mummyCharacterTemplate from "../assets/mummy-character-template.jpeg";
import mummySpaceTemplate from "../assets/mummy-space-template.jpg";
import defaultBgm from "../assets/audio/default-bgm.wav";

const STORAGE_KEY = "multiverse-boardgame-react-state-v1";
const STAGE_WIDTH = 1920;
const STAGE_HEIGHT = 1080;
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
const JUMP_DURATION = 210;
const MOVE_TICK_MS = 40;
const TAKE_ANIMATION_MS = 260;
const SPEECH_BUBBLE_DURATION = 4000;
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
    characterName: "하린 에버모어",
    tagline: "의심을 미소로 감추는 기록 담당자",
    bio: "사건의 단서를 빠르게 엮어내는 조사관. 부드러운 태도로 사람들의 경계를 허물지만, 마음속에는 누구보다 치열한 질문이 쌓여 있다.",
    storybook: `어린 시절부터 하린은 누군가의 말보다 기록의 온도를 더 믿었다. 낡은 수첩 한 권만 있으면 하루 종일 타인의 표정과 숨소리를 메모했고, 언제나 가장 늦게 결론을 내렸다.

성인이 된 뒤에는 각종 탐문과 인터뷰를 맡으며 수많은 사건의 주변부를 걸었다. 정답을 먼저 주장하기보다, 모순을 오래 바라보는 쪽을 택했다. 그래서 동료들은 하린을 느리다고 말했지만 정작 마지막 조각을 붙이는 사람은 늘 하린이었다.

이번 저택 세션에서 하린은 모두의 진술을 모아 진실의 흐름을 재구성하려 한다. 겉으로는 침착하지만, 이미 오래전부터 이 가문과 닿아 있었던 개인적인 기억을 숨기고 있다.`,
  },
  p2: {
    characterName: "민준 헤일",
    tagline: "책장 뒤 먼지에서 비밀을 찾는 서재 담당",
    bio: "서재에 남은 자잘한 흔적을 집요하게 파고드는 탐문가. 말수가 적지만, 발견한 정보는 결정적인 순간에 꺼내 놓는다.",
    storybook: "",
  },
  p3: {
    characterName: "서윤 벨",
    tagline: "정황의 흐름을 읽는 감정 추적자",
    bio: "식탁 위의 사소한 어긋남에서 관계의 균열을 읽어내는 인물. 분위기를 읽는 데 능하고, 사람들의 거짓말에 특히 예민하다.",
    storybook: "",
  },
  p4: {
    characterName: "도윤 클라크",
    tagline: "정원의 흙과 발자국을 기억하는 관찰자",
    bio: "현장의 물리적 흔적을 먼저 보는 플레이어. 조용히 움직이지만, 한 번 의심한 흔적은 끝까지 추적한다.",
    storybook: "",
  },
  p5: {
    characterName: "GM 아델",
    tagline: "장면과 규칙을 관리하는 진행자",
    bio: "세션 전체의 흐름을 조율하는 게임 마스터. 플레이어에게는 최소한의 정보만 공개하지만, 사건의 구조와 비밀은 모두 알고 있다.",
    storybook: `아델은 사건의 모든 장면을 설계한 진행자다. 등장인물들의 과거, 감춰진 알리바이, 방마다 숨어 있는 연결점까지 이미 머릿속에 완성된 지도를 가지고 있다.

플레이어가 보는 것은 사건의 표면뿐이지만, GM의 시점에서는 각 장면이 서로 어떤 타이밍으로 반응해야 하는지가 중요하다. 누군가 예상보다 빨리 진실에 다가가면 장면의 긴장을 조율하고, 흐름이 늘어지면 새로운 정보가 등장할 타이밍을 조정한다.

아델의 스토리북은 사건의 원안, NPC의 감정선, 엔딩 분기, 그리고 각 단서가 공개될 때의 연출 노트를 포함한다. 외부 플레이어에게는 보이지 않지만 세션 전체를 부드럽게 움직이게 하는 내부 설계도이기도 하다.`,
  },
};

const sharedRulebook = {
  title: "공용 룰북",
  body: `1. 플레이어는 현재 조작 중인 인물 시점으로 방을 이동하고, 그 방에 입장한 이후의 대화만 열람할 수 있습니다.
2. 로비에서는 테이블 위 단서를 드래그하거나 손패로 가져올 수 있습니다.
3. 드래그해서 필드에 내려놓는 카드는 항상 덮인 상태로 배치됩니다.
4. 손패에서 [전체공개]를 누르면 카드를 펼친 상태로 즉시 테이블에 공개합니다.
5. 방 안 대화는 같은 방에 있는 플레이어끼리만 공유됩니다.
6. 이름, 캐릭터, 프로필 이미지를 클릭하면 해당 인물의 프로필을 열람할 수 있습니다.`,
};

const gmRulebook = {
  title: "GM 전용 룰북",
  body: `1. GM은 사건의 정답, 비공개 연출 메모, 엔딩 분기를 관리합니다.
2. 플레이어가 특정 단서를 너무 빨리 확보할 경우, 장면 묘사와 NPC 반응으로 긴장을 조정합니다.
3. 스토리북과 GM 전용 룰북은 GM 자신만 열람할 수 있습니다.
4. 타이머는 조사 페이즈, 토론 페이즈, 엔딩 브리핑 등 각 장면의 박자를 조절하는 용도로 사용합니다.
5. 필요하면 플레이어의 이동과 카드 공개 타이밍을 로그로 확인해 장면 진행을 판정합니다.`,
};

const roomAccent = {
  lobby: "from-slate-900/80 via-slate-900/50 to-sky-950/70",
  study: "from-amber-900/80 via-zinc-900/60 to-stone-950/80",
  dining: "from-emerald-900/80 via-teal-950/60 to-slate-950/80",
  garden: "from-lime-900/75 via-emerald-950/60 to-slate-950/80",
};

const initialState = createInitialState();
const spriteSheetCache = new Map();
let spriteSheetPromise = null;

function createInitialState() {
  const sessionStart = Date.now();
  return {
    activePlayerId: "p1",
    modalCardId: null,
    profileModalPlayerId: null,
    documentModalType: null,
    tableActionCardId: null,
    pendingAction: null,
    selectedRoomId: "study",
    mapSize: { width: STAGE_WIDTH, height: STAGE_HEIGHT },
    stopwatchLabel: "조사 페이즈",
    stopwatchStartedAt: null,
    stopwatchElapsedMs: 0,
    timeMode: "stopwatch",
    timerDurationSec: 300,
    walkTarget: null,
    movementBounds: { left: TABLE_SAFE_LEFT, top: TABLE_SAFE_TOP, right: TABLE_SAFE_RIGHT, bottom: TABLE_SAFE_BOTTOM },
    bgmPlaying: false,
    decisionSession: null,
    rooms: [
      { id: "study", name: "서재", x: 400, y: 118, width: 382, height: 323 },
      { id: "dining", name: "식당", x: 1315, y: 118, width: 374, height: 323 },
      { id: "garden", name: "정원", x: 1315, y: 575, width: 374, height: 287 },
    ],
    players: [
      { id: "p1", name: "하린", role: "PL", appearance: { ...defaultAppearanceByPlayer.p1 }, facing: "down", stepCycle: 0, lastMovedAt: 0, jumpUntil: 0, x: 930, y: 520, currentRoom: "lobby", joinedRoomAt: { lobby: sessionStart } },
      { id: "p2", name: "민준", role: "PL", appearance: { ...defaultAppearanceByPlayer.p2 }, facing: "down", stepCycle: 0, lastMovedAt: 0, jumpUntil: 0, x: 585, y: 258, currentRoom: "study", joinedRoomAt: { study: sessionStart } },
      { id: "p3", name: "서윤", role: "PL", appearance: { ...defaultAppearanceByPlayer.p3 }, facing: "down", stepCycle: 0, lastMovedAt: 0, jumpUntil: 0, x: 1492, y: 258, currentRoom: "dining", joinedRoomAt: { dining: sessionStart } },
      { id: "p4", name: "도윤", role: "PL", appearance: { ...defaultAppearanceByPlayer.p4 }, facing: "down", stepCycle: 0, lastMovedAt: 0, jumpUntil: 0, x: 1508, y: 715, currentRoom: "garden", joinedRoomAt: { garden: sessionStart } },
      { id: "p5", name: "GM 아델", role: "GM", appearance: { ...defaultAppearanceByPlayer.p5 }, facing: "down", stepCycle: 0, lastMovedAt: 0, jumpUntil: 0, x: 1120, y: 330, currentRoom: "lobby", joinedRoomAt: { lobby: sessionStart } },
    ],
    cards: [
      { id: "c1", title: "단서 A", summary: "핏자국이 묻은 편지", description: "붉은 봉인 자국과 함께 짧은 메모가 남아 있다. 수신인은 '서재에서 밤 10시에 보자'라고 적혀 있다.", x: 760, y: 390, isFaceUp: false, handFaceUp: false, ownerId: null, type: "문서" },
      { id: "c2", title: "단서 B", summary: "부러진 시계 조각", description: "깨진 회중시계의 초침이 10시 17분에서 멈춰 있다. 뒷면에는 'D' 이니셜이 새겨져 있다.", x: 930, y: 410, isFaceUp: false, handFaceUp: false, ownerId: null, type: "물증" },
      { id: "c3", title: "단서 C", summary: "찢어진 영수증", description: "식당 와인 주문 기록 일부다. 사건 당일 예상보다 한 병 더 주문된 흔적이 남아 있다.", x: 1100, y: 395, isFaceUp: false, handFaceUp: false, ownerId: null, type: "기록" },
      { id: "c4", title: "단서 D", summary: "정원 흙 묻은 장갑", description: "겉면에는 정원 흙이, 안쪽에는 은은한 향수가 남아 있다. 누군가 급하게 벗어 던진 흔적이다.", x: 1270, y: 425, isFaceUp: false, handFaceUp: false, ownerId: null, type: "소지품" },
      { id: "c5", title: "단서 E", summary: "가계도 일부", description: "가문의 상속 순서를 표시한 문서다. 최근에 특정 이름이 지워지고 덧써진 흔적이 있다.", x: 1440, y: 400, isFaceUp: false, handFaceUp: false, ownerId: null, type: "비밀문서" },
    ],
    messages: [
      { id: "m1", roomId: "lobby", senderId: "p1", text: "브리핑 전에 전원 로비로 모여 주세요.", timestamp: Date.now() - 1000 * 60 * 8 },
      { id: "m2", roomId: "study", senderId: "p2", text: "서재 책장 뒤에 숨겨진 흔적이 있어.", timestamp: Date.now() - 1000 * 60 * 4 },
      { id: "m3", roomId: "dining", senderId: "p3", text: "식당 영수증이 이상해. 누가 술을 더 시켰어.", timestamp: Date.now() - 1000 * 60 * 3 },
    ],
    logs: [
      { id: "l1", text: "세션이 시작되었습니다. 넓은 로비와 세 개의 방에서 탐문이 진행 중입니다.", timestamp: Date.now() - 1000 * 60 * 10 },
    ],
  };
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

function loadState() {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (!saved) return normalizeState(createInitialState());
  try {
    return normalizeState({ ...createInitialState(), ...JSON.parse(saved) });
  } catch {
    return normalizeState(createInitialState());
  }
}

function normalizeState(state) {
  return {
    ...state,
    tableActionCardId: typeof state.tableActionCardId === "string" ? state.tableActionCardId : null,
    profileModalPlayerId: typeof state.profileModalPlayerId === "string" ? state.profileModalPlayerId : null,
    documentModalType: typeof state.documentModalType === "string" ? state.documentModalType : null,
    selectedRoomId: typeof state.selectedRoomId === "string" ? state.selectedRoomId : "study",
    mapSize: {
      width: typeof state.mapSize?.width === "number" ? state.mapSize.width : STAGE_WIDTH,
      height: typeof state.mapSize?.height === "number" ? state.mapSize.height : STAGE_HEIGHT,
    },
    stopwatchLabel: typeof state.stopwatchLabel === "string" ? state.stopwatchLabel : "조사 페이즈",
    stopwatchStartedAt: typeof state.stopwatchStartedAt === "number" ? state.stopwatchStartedAt : null,
    stopwatchElapsedMs: typeof state.stopwatchElapsedMs === "number" ? state.stopwatchElapsedMs : 0,
    timeMode: state.timeMode === "timer" ? "timer" : "stopwatch",
    timerDurationSec: typeof state.timerDurationSec === "number" ? state.timerDurationSec : 300,
    walkTarget: state.walkTarget && typeof state.walkTarget.x === "number" && typeof state.walkTarget.y === "number" ? state.walkTarget : null,
    movementBounds: {
      left: typeof state.movementBounds?.left === "number" ? state.movementBounds.left : TABLE_SAFE_LEFT,
      top: typeof state.movementBounds?.top === "number" ? state.movementBounds.top : TABLE_SAFE_TOP,
      right: typeof state.movementBounds?.right === "number" ? state.movementBounds.right : TABLE_SAFE_RIGHT,
      bottom: typeof state.movementBounds?.bottom === "number" ? state.movementBounds.bottom : TABLE_SAFE_BOTTOM,
    },
    bgmPlaying: Boolean(state.bgmPlaying),
    decisionSession: normalizeDecisionSession(state.decisionSession),
    players: state.players.map((player) => ({
      ...player,
      role: player.role === "GM" ? "GM" : "PL",
      appearance: normalizeAppearance(player.id, player.appearance),
      facing: player.facing ?? "down",
      stepCycle: typeof player.stepCycle === "number" ? player.stepCycle : 0,
      lastMovedAt: typeof player.lastMovedAt === "number" ? player.lastMovedAt : 0,
      jumpUntil: typeof player.jumpUntil === "number" ? player.jumpUntil : 0,
      joinedRoomAt: player.joinedRoomAt && typeof player.joinedRoomAt === "object" ? player.joinedRoomAt : { [player.currentRoom]: Date.now() },
    })),
  };
}

function App() {
  const [state, setState] = useState(loadState);
  const [chatDraft, setChatDraft] = useState("");
  const [dragCardId, setDragCardId] = useState(null);
  const [dragPreview, setDragPreview] = useState(null);
  const [dragPointer, setDragPointer] = useState(null);
  const [takeAnimation, setTakeAnimation] = useState(null);
  const [cursorState, setCursorState] = useState({ x: 0, y: 0, visible: false, interactive: false });
  const [isChatFocused, setIsChatFocused] = useState(false);
  const [hoveredHandCardId, setHoveredHandCardId] = useState(null);
  const [viewportScale, setViewportScale] = useState(1);
  const [isAltZooming, setIsAltZooming] = useState(false);
  const [cursorFocus, setCursorFocus] = useState({ x: STAGE_WIDTH / 2, y: STAGE_HEIGHT / 2 });
  const [gmPeekFaceUp, setGmPeekFaceUp] = useState(false);
  const [resizeSession, setResizeSession] = useState(null);
  const [playerDragSession, setPlayerDragSession] = useState(null);
  const [rightPanelOpen, setRightPanelOpen] = useState(false);
  const [mapEditMode, setMapEditMode] = useState(false);
  const [modalZoomFocus, setModalZoomFocus] = useState(null);
  const [now, setNow] = useState(Date.now());
  const stageRef = useRef(null);
  const viewportRef = useRef(null);
  const bgmAudioRef = useRef(null);
  const chatInputRef = useRef(null);
  const chatScrollRef = useRef(null);
  const contactCardRef = useRef(null);
  const handTrayRef = useRef(null);
  const dragMetaRef = useRef(null);
  const suppressClickRef = useRef(false);
  const pressedKeysRef = useRef(new Set());
  const jumpHeldRef = useRef(false);
  const activePlayer = getActivePlayer(state);
  const visibleMessages = state.messages
    .filter((message) => message.roomId === activePlayer.currentRoom && message.timestamp >= (activePlayer.joinedRoomAt?.[activePlayer.currentRoom] ?? 0))
    .sort((a, b) => a.timestamp - b.timestamp);
  const tableCards = state.cards.filter((card) => card.ownerId === null);
  const activeHandCards = state.cards.filter((card) => card.ownerId === activePlayer.id);
  const otherHands = state.players.filter((player) => player.id !== activePlayer.id && player.role !== "GM");
  const modalCard = state.cards.find((card) => card.id === state.modalCardId) ?? null;
  const dragCard = dragCardId ? state.cards.find((card) => card.id === dragCardId) ?? null : null;
  const hoveredHandCard = hoveredHandCardId ? state.cards.find((card) => card.id === hoveredHandCardId && card.ownerId === activePlayer.id) ?? null : null;
  const profilePlayer = state.players.find((player) => player.id === state.profileModalPlayerId) ?? null;
  const activeRoomZone = state.rooms.find((room) => room.id === activePlayer.currentRoom) ?? null;
  const activePlayerProfile = characterProfiles[activePlayer.id] ?? null;
  const selectedRoom = state.rooms.find((room) => room.id === state.selectedRoomId) ?? state.rooms[0];
  const renderPlayers = state.players.filter((player) => player.role !== "GM");
  const isMapEditing = activePlayer.role === "GM" && mapEditMode;
  const stageWidth = state.mapSize.width;
  const stageHeight = state.mapSize.height;
  const elapsedTimerMs = state.stopwatchStartedAt ? state.stopwatchElapsedMs + (now - state.stopwatchStartedAt) : state.stopwatchElapsedMs;
  const effectiveTimeMs = state.timeMode === "timer" ? Math.max(0, state.timerDurationSec * 1000 - elapsedTimerMs) : elapsedTimerMs;
  const nonGmPlayers = state.players.filter((player) => player.role !== "GM");
  const activeDecision = state.decisionSession;
  const activeDecisionResponse = activeDecision ? activeDecision.responses?.[activePlayer.id] ?? null : null;
  const isDecisionParticipant = activePlayer.role !== "GM";
  const hasCollectingDecision = activeDecision?.status === "collecting";
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

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [state]);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setNow(Date.now());
    }, 80);
    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    const audio = bgmAudioRef.current;
    if (!audio) return;
    if (state.bgmPlaying) {
      audio.loop = true;
      audio.play().catch(() => {});
      return;
    }
    audio.pause();
    audio.currentTime = 0;
  }, [state.bgmPlaying]);

  useEffect(() => {
    const chatNode = chatScrollRef.current;
    if (!chatNode) return;
    chatNode.scrollTop = chatNode.scrollHeight;
  }, [activePlayer.currentRoom, visibleMessages.length]);

  useEffect(() => {
    contactCardRef.current = contactCard;
  }, [contactCard]);

  useEffect(() => {
    setGmPeekFaceUp(false);
  }, [state.modalCardId]);

  useEffect(() => {
    if (!modalCard) {
      setModalZoomFocus(null);
    }
  }, [modalCard]);

  useEffect(() => {
    const updateViewportScale = () => {
      const availableWidth = Math.max(window.innerWidth - 32, 320);
      const availableHeight = Math.max(window.innerHeight - 32, 180);
      setViewportScale(Math.min(availableWidth / stageWidth, availableHeight / stageHeight, 1));
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
        const nextFocus = {
          x: clamp((event.clientX - viewportBounds.left) / Math.max(viewportScale, 0.001), 0, stageWidth),
          y: clamp((event.clientY - viewportBounds.top) / Math.max(viewportScale, 0.001), 0, stageHeight),
        };
        setCursorFocus(nextFocus);
      }
    };

    const handlePointerLeave = () => {
      setCursorState((current) => ({ ...current, visible: false, interactive: false }));
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
          chatInputRef.current?.focus();
        }
        return;
      }
      if (["INPUT", "TEXTAREA", "SELECT"].includes(event.target?.tagName)) return;
      if (event.key === " " || event.code === "Space") {
        event.preventDefault();
        if (!jumpHeldRef.current) {
          jumpHeldRef.current = true;
          setState((current) => jumpPlayerState(current));
        }
        return;
      }
      if (event.key === "Escape") {
        setState((current) => ({ ...current, modalCardId: null, profileModalPlayerId: null, documentModalType: null, tableActionCardId: null, pendingAction: null }));
        return;
      }
      const direction = getDirectionFromKey(event.key);
      if (!direction) return;
      event.preventDefault();
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
    const moveTimer = window.setInterval(() => {
      const vector = getMovementVectorFromKeys(pressedKeysRef.current);
      if (vector) {
        setState((current) => movePlayerState(current, vector.dx, vector.dy));
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
    };

    const handlePointerUp = (event) => {
      if (event.pointerId !== dragPointer.pointerId) return;

      const finalTarget = document.elementFromPoint(event.clientX, event.clientY);
      const handDropTarget = finalTarget?.closest?.("[data-hand-dropzone='true']");
      const handCardTarget = finalTarget?.closest?.("[data-hand-card-id]");
      const stageDropTarget = finalTarget?.closest?.("[data-stage-dropzone='true']");

      if (dragPointer.active) {
        suppressClickRef.current = true;
        window.setTimeout(() => {
          suppressClickRef.current = false;
        }, 0);
        if (handDropTarget) {
          const targetCardId = handCardTarget?.getAttribute("data-hand-card-id") ?? null;
          moveCardToHand(dragPointer.cardId, targetCardId);
        } else if (stageDropTarget) {
          dropCardAtPoint(dragPointer.cardId, event.clientX, event.clientY);
        }
      }

      setDragPointer(null);
      setDragCardId(null);
      setDragPreview(null);
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
  }, [dragPointer]);

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

  const resetGame = () => {
    const next = normalizeState(createInitialState());
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
      return {
        ...current,
        messages: [
          ...current.messages,
          { id: `m-${crypto.randomUUID()}`, roomId: player.currentRoom, senderId: player.id, text, timestamp: Date.now() },
        ],
        logs: addLog(current.logs, `${player.name} 님이 ${getRoomName(current.rooms, player.currentRoom)}에서 메시지를 보냈습니다.`),
      };
    });
    setChatDraft("");
  };

  const openCard = (cardId) => {
    setState((current) => ({ ...current, modalCardId: cardId, profileModalPlayerId: null, documentModalType: null, tableActionCardId: null, pendingAction: null }));
  };

  const openProfile = (playerId) => {
    setState((current) => ({ ...current, profileModalPlayerId: playerId, modalCardId: null, documentModalType: null, tableActionCardId: null, pendingAction: null }));
  };

  const openDocument = (documentModalType) => {
    setState((current) => ({ ...current, documentModalType, profileModalPlayerId: null, modalCardId: null, tableActionCardId: null, pendingAction: null }));
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
      return {
        ...current,
        cards: current.cards.map((item) => (item.id === cardId ? { ...item, isFaceUp: !item.isFaceUp } : item)),
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
          modalCardId: current.modalCardId === cardId ? null : current.modalCardId,
          tableActionCardId: current.tableActionCardId === cardId ? null : current.tableActionCardId,
          logs: addLog(current.logs, `${player.name} 님이 ${nextCard.title} 카드를 손패로 가져갔습니다.`),
        };
      });
    });
  };

  const movePlayerToPoint = (clientX, clientY) => {
    if (activePlayer.role === "GM") return;
    const stage = stageRef.current;
    if (!stage) return;
    const rect = stage.getBoundingClientRect();
    const targetX = clamp(((clientX - rect.left) / rect.width) * stageWidth, 0, stageWidth);
    const targetY = clamp(((clientY - rect.top) / rect.height) * stageHeight, 0, stageHeight);
    setState((current) => ({ ...current, walkTarget: { x: targetX, y: targetY } }));
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
    setState((current) => ({
      ...current,
      mapSize: { ...current.mapSize, [key]: Number(value) },
    }));
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
      return {
        ...current,
        cards: current.cards.map((card) => {
          if (card.id !== modalCard.id || card.ownerId !== null) return card;
          return { ...card, isFaceUp: !card.isFaceUp };
        }),
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
        pendingAction: null,
        modalCardId: null,
        tableActionCardId: null,
        logs: addLog(current.logs, `${player.name} 님이 ${modalCard.title} 카드를 테이블에 ${faceUp ? "펼친 채" : "덮은 채"} 내려놓았습니다.`),
      };
    });
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
          logs: addLog(current.logs, `${player.name} 님이 ${card.title} 카드 위치를 옮겼습니다.`),
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
      if (!targetPlayer) return current;
      return {
        ...current,
        cards: current.cards.map((card) => {
          if (card.id !== modalCard.id || card.ownerId !== player.id) return card;
          return { ...card, ownerId: targetPlayer.id };
        }),
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
  const isMapZooming = isAltZooming && !modalCard;
  const totalStageScale = viewportScale * (isMapZooming ? 5 : 1);
  const stageTransformOrigin = isMapZooming ? `${cursorFocus.x}px ${cursorFocus.y}px` : "center center";
  const modalCardScale = 1;

  return (
    <div className="flex min-h-screen select-none items-center justify-center overflow-hidden bg-[radial-gradient(circle_at_top_left,rgba(214,169,92,0.18),transparent_20%),radial-gradient(circle_at_top_right,rgba(157,60,43,0.14),transparent_18%),linear-gradient(180deg,#214739_0%,#16372d_100%)] p-4 text-stone-100">
      <div
        className={`pointer-events-none fixed z-[120] -translate-x-1/2 -translate-y-1/2 rounded-full transition-[width,height,background-color,border-color,box-shadow,transform,opacity] duration-150 ${cursorState.visible ? "opacity-100" : "opacity-0"} ${cursorState.interactive ? "h-12 w-12 border border-amber-200/80 bg-amber-100/14 shadow-[0_0_0_6px_rgba(253,230,138,0.12)]" : "h-5 w-5 border border-white/75 bg-white/10 shadow-[0_0_0_2px_rgba(255,255,255,0.08)]"}`}
        style={{ left: cursorState.x, top: cursorState.y }}
      >
        <div className={`absolute left-1/2 top-1/2 rounded-full bg-white/85 transition-all duration-150 ${cursorState.interactive ? "h-1.5 w-1.5 -translate-x-1/2 -translate-y-1/2" : "h-1 w-1 -translate-x-1/2 -translate-y-1/2"}`} />
      </div>

      <div
        ref={viewportRef}
        className="relative overflow-hidden"
        style={{ width: stageWidth * viewportScale, height: stageHeight * viewportScale }}
      >
      {dragPreview && dragCard ? (
        <div
          className="pointer-events-none fixed z-[70] -translate-x-1/2 -translate-y-1/2 rotate-[3deg] opacity-92 drop-shadow-[0_20px_30px_rgba(0,0,0,0.35)]"
          style={{ left: dragPreview.x, top: dragPreview.y }}
        >
          <div className={dragCard.ownerId === null ? "w-[45px]" : dragCard.ownerId === activePlayer.id ? "w-[75px]" : "w-[64px]"}>
            <CardTile
              card={dragCard}
              visible={dragCard.ownerId === null ? dragCard.isFaceUp : true}
              hand={dragCard.ownerId === activePlayer.id}
              board={dragCard.ownerId === null}
              compact={dragCard.ownerId !== activePlayer.id && dragCard.ownerId !== null}
            />
          </div>
        </div>
      ) : null}

      {hoveredHandCard && !modalCard && !dragCardId ? (
        <div className="pointer-events-none fixed inset-0 z-[49] flex items-center justify-center p-4">
          <div
            className="inline-flex flex-col items-center"
            style={{ transform: `scale(${viewportScale})`, transformOrigin: "center center" }}
          >
            <CardTile
              card={hoveredHandCard}
              visible={Boolean(hoveredHandCard.handFaceUp)}
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
              hand
            />
          </div>
        </div>
      ) : null}

      <div className="absolute left-0 top-0">
      <div
        className={`relative overflow-hidden rounded-[18px] border border-white/8 shadow-[0_18px_60px_rgba(0,0,0,0.28)] ${isMapZooming ? "cursor-zoom-in" : "cursor-default"}`}
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
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.06),transparent_55%)]" />

          <div className="absolute inset-0 z-10">
          {activeRoomZone ? (
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
                className={`absolute border-4 border-dashed bg-white/6 text-left text-white/95 ${isMapEditing ? "pointer-events-auto border-amber-300 shadow-[0_0_0_3px_rgba(252,211,77,0.32)]" : "pointer-events-none border-cyan-200/90 shadow-[0_0_0_2px_rgba(165,243,252,0.16)]"}`}
                style={{ left: room.x, top: room.y, width: room.width, height: room.height }}
                data-hoverable={isMapEditing ? "true" : undefined}
              >
                <button
                  type="button"
                  className="ml-5 mt-4 inline-flex rounded-full bg-amber-200/85 px-4 py-2 text-xl font-semibold text-stone-900"
                  onPointerDown={isMapEditing ? (event) => beginRoomResize(event, room.id, "move") : undefined}
                  onClick={(event) => event.stopPropagation()}
                  data-hoverable="true"
                >
                  {room.name}
                </button>
                {isMapEditing ? (
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
            <div key={player.id} className="absolute -translate-x-1/2 -translate-y-1/2" style={{ left: player.x, top: player.y }}>
              <div className="relative h-24 w-20" style={{ transform: `translateY(${getJumpOffset(player, now)}px)` }}>
                {visibleSpeechByPlayer[player.id] ? (
                  <div className="absolute left-1/2 top-[-44px] z-20 min-w-[120px] max-w-[220px] -translate-x-1/2 rounded-[16px] bg-[#fff8ec] px-3 py-2 text-center text-[11px] leading-[1.45] text-stone-800 shadow-[0_12px_24px_rgba(0,0,0,0.18)]">
                    <div className="absolute left-1/2 top-full h-2 w-2 -translate-x-1/2 rotate-45 bg-[#fff8ec]" />
                    {visibleSpeechByPlayer[player.id]}
                  </div>
                ) : null}
                {player.id === activePlayer.id ? <div className="absolute left-1/2 top-8 h-11 w-11 -translate-x-1/2 rounded-full border-2 border-amber-300/65" /> : null}
                <PlayerSprite player={player} />
                <button
                  type="button"
                  onClick={() => openProfile(player.id)}
                  onPointerDown={isMapEditing ? (event) => beginPlayerDrag(event, player.id) : undefined}
                  className="group absolute left-1/2 top-16 -translate-x-1/2 rounded-full border border-transparent bg-[#e7e2d7] px-2.5 py-1 text-[12px] font-semibold whitespace-nowrap text-stone-700 shadow transition hover:border-amber-200 hover:bg-white focus:border-amber-200 focus:bg-white"
                  data-hoverable="true"
                >
                  {player.name}{player.role === "GM" ? " • GM" : ""}
                </button>
              </div>
            </div>
          ))}

          {tableCards.map((card) => (
            <div key={card.id} className="absolute" style={{ left: card.x, top: card.y }}>
              <div className="w-[45px]">
                <CardTile
                  card={card}
                  visible={card.isFaceUp}
                  actionLabel="카드 상세"
                  highlighted={contactCard?.id === card.id}
                  disabled={activePlayer.currentRoom !== "lobby" && !card.isFaceUp}
                  onClick={() => {
                    if (card.isFaceUp || activePlayer.currentRoom === "lobby") {
                      openCard(card.id);
                    }
                  }}
                  draggable={activePlayer.currentRoom === "lobby"}
                  onPointerDown={(event) => handleCardPointerDown(event, card.id)}
                  dragging={dragCardId === card.id}
                  suppressClickRef={suppressClickRef}
                  board
                />
              </div>
            </div>
          ))}
          </div>
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

        <header className="absolute left-5 top-5 z-30 flex items-center gap-4 rounded-[20px] border border-stone-800/10 bg-[#f3efe7]/96 px-4 py-3 text-stone-800 shadow-[0_14px_40px_rgba(0,0,0,0.18)]">
          <ControlField
            label="조작 플레이어"
            value={state.activePlayerId}
            onChange={(event) => setState((current) => ({ ...current, activePlayerId: event.target.value, modalCardId: null, profileModalPlayerId: null, documentModalType: null, tableActionCardId: null, pendingAction: null }))}
            options={state.players.map((player) => ({
              value: player.id,
              label: `${player.name}${player.role === "GM" ? " [GM]" : ""} (${player.currentRoom})`,
            }))}
            light
          />
          <button
            type="button"
            onClick={resetGame}
            className="inline-flex h-12 items-center gap-2 rounded-2xl bg-[#a9442d] px-4 font-medium text-white transition hover:bg-[#943c27]"
          >
            <RefreshCcw className="size-4" />
            초기화
          </button>
        </header>

        <div className={`absolute left-1/2 top-8 z-20 flex -translate-x-1/2 items-start gap-16 transition ${isMapEditing ? "pointer-events-none opacity-35" : ""}`}>
          {otherHands.map((player) => {
            const cards = state.cards.filter((card) => card.ownerId === player.id);
            return (
              <div key={player.id} className="min-w-[180px]">
                <button type="button" onClick={() => openProfile(player.id)} className="group mb-3 flex items-start gap-3 rounded-[18px] border border-transparent p-2 text-left transition hover:border-amber-200/60">
                  <div className="overflow-hidden rounded-2xl border border-white/20 bg-white/8">
                    <CharacterPortrait player={player} />
                  </div>
                  <div>
                    <p className="text-[18px] font-semibold text-stone-100">{player.name}</p>
                    <p className="text-[12px] text-amber-100/60">{player.role === "GM" ? "게임 마스터" : characterProfiles[player.id]?.characterName ?? "플레이어"}</p>
                    <p className="text-[15px] text-amber-100/50">보유 카드 {cards.length}장</p>
                    <p className="mt-1 text-[11px] text-white/45 transition group-hover:text-white/72">프로필 보기</p>
                  </div>
                </button>
                <div className="flex min-h-[48px] items-start gap-2">
                  {cards.length ? cards.map((card) => (
                    <CardTile
                      key={card.id}
                      card={card}
                      visible={false}
                      onClick={() => openCard(card.id)}
                      compact
                      micro
                    />
                  )) : <span className="pt-1 text-[18px] text-[#b08269]/88">비어 있음</span>}
                </div>
              </div>
            );
          })}
        </div>

        <div className="absolute right-8 top-24 z-30 flex items-start justify-end gap-3">
          {activePlayer.role === "GM" ? (
            <button
              type="button"
              onClick={() => setMapEditMode((current) => !current)}
              className={`inline-flex h-14 items-center rounded-[18px] border px-4 text-sm font-semibold text-white shadow-[0_18px_40px_rgba(0,0,0,0.2)] backdrop-blur-sm transition ${isMapEditing ? "border-amber-200/60 bg-[#8f452f]/96" : "border-white/10 bg-black/28 hover:bg-black/40"}`}
              data-hoverable="true"
            >
              {isMapEditing ? "편집 종료" : "맵 편집"}
            </button>
          ) : null}

          <button
            type="button"
            onClick={() => setRightPanelOpen((current) => !current)}
            className={`inline-flex h-14 w-14 items-center justify-center rounded-[18px] border text-white shadow-[0_18px_40px_rgba(0,0,0,0.2)] backdrop-blur-sm transition ${rightPanelOpen ? "border-amber-200/50 bg-[#8f452f]/92" : "border-white/10 bg-black/28 hover:bg-black/40"}`}
            data-hoverable="true"
            aria-label={rightPanelOpen ? "메뉴 닫기" : "메뉴 열기"}
          >
            <Menu className="size-5" />
          </button>

          <aside className={`overflow-hidden rounded-[24px] border text-white shadow-[0_18px_40px_rgba(0,0,0,0.2)] backdrop-blur-sm transition-all duration-200 ${rightPanelOpen ? "w-[282px] border-white/10 bg-black/22 p-4 opacity-100" : "pointer-events-none w-0 border-transparent bg-transparent p-0 opacity-0"}`}>
          <button type="button" onClick={() => openDocument("shared-rulebook")} className="flex items-center justify-between rounded-2xl bg-white/10 px-4 py-3 text-left transition hover:bg-white/16">
            <span>
              <span className="block text-sm font-semibold">공용 룰북</span>
              <span className="block text-xs text-white/55">전체 열람 가능</span>
            </span>
            <BookOpen className="size-4" />
          </button>
          <button
            type="button"
            onClick={() => {
              if (activePlayer.role === "GM") openDocument("gm-rulebook");
            }}
            className={`flex items-center justify-between rounded-2xl px-4 py-3 text-left transition ${activePlayer.role === "GM" ? "bg-[#8f452f] hover:bg-[#7c3d2a]" : "cursor-not-allowed bg-white/6 text-white/35"}`}
          >
            <span>
              <span className="block text-sm font-semibold">GM용 룰북</span>
              <span className="block text-xs">{activePlayer.role === "GM" ? "GM만 열람 가능" : "현재 플레이어는 열람 불가"}</span>
            </span>
            <Shield className="size-4" />
          </button>
          <div className="rounded-2xl bg-white/8 p-4">
            <div className="mb-3 flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold">{state.timeMode === "timer" ? "타이머" : "스톱워치"}</p>
                <p className="text-xs text-white/55">기본은 스톱워치, 필요하면 타이머 전환</p>
              </div>
              <Clock3 className="size-4 text-white/70" />
            </div>
            <div className="mb-3 flex gap-2">
              <MiniActionButton onClick={() => setState((current) => ({ ...current, timeMode: "stopwatch" }))}>스톱워치</MiniActionButton>
              <MiniActionButton onClick={() => setState((current) => ({ ...current, timeMode: "timer" }))}>타이머</MiniActionButton>
            </div>
            <input
              value={state.stopwatchLabel}
              onChange={(event) => setState((current) => ({ ...current, stopwatchLabel: event.target.value }))}
              placeholder="예: 브리핑 10분"
              className="mb-3 h-10 w-full rounded-xl border border-white/12 bg-black/18 px-3 text-sm outline-none placeholder:text-white/28"
            />
            {state.timeMode === "timer" ? (
              <input
                type="number"
                min="1"
                value={Math.max(1, Math.round(state.timerDurationSec / 60))}
                onChange={(event) => setState((current) => ({ ...current, timerDurationSec: Number(event.target.value) * 60 }))}
                className="mb-3 h-10 w-full rounded-xl border border-white/12 bg-black/18 px-3 text-sm outline-none"
              />
            ) : null}
            <div className="mb-3 text-xs text-white/55">{state.stopwatchLabel || "무제"}</div>
            <div className="mb-3 text-[22px] font-semibold tabular-nums">{formatDuration(effectiveTimeMs)}</div>
            <div className="flex gap-2">
              <MiniActionButton
                onClick={() => setState((current) => current.stopwatchStartedAt
                  ? { ...current, stopwatchStartedAt: null, stopwatchElapsedMs: current.stopwatchElapsedMs + (Date.now() - current.stopwatchStartedAt) }
                  : { ...current, stopwatchStartedAt: Date.now() })}
              >
                {state.stopwatchStartedAt ? "정지" : "시작"}
              </MiniActionButton>
              <MiniActionButton onClick={() => setState((current) => ({ ...current, stopwatchStartedAt: null, stopwatchElapsedMs: 0 }))}>리셋</MiniActionButton>
            </div>
          </div>
          <div className="rounded-2xl bg-white/8 p-4">
            <div className="mb-3 flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold">공용 BGM</p>
                <p className="text-xs text-white/55">기본 음악 재생/정지만 지원</p>
              </div>
              <BookOpen className="size-4 text-white/70" />
            </div>
            <div className="flex gap-2">
              <MiniActionButton onClick={() => setState((current) => ({ ...current, bgmPlaying: true }))}>재생</MiniActionButton>
              <MiniActionButton onClick={() => setState((current) => ({ ...current, bgmPlaying: false }))}>정지</MiniActionButton>
            </div>
            <div className="mt-3 rounded-xl border border-white/10 bg-black/16 px-3 py-2 text-xs text-white/55">내장된 기본 mp3/wav 음원이 무한 반복 재생됩니다.</div>
          </div>
          <div className="rounded-2xl bg-white/8 p-4">
            <div className="mb-3">
              <p className="text-sm font-semibold">합의 진행</p>
              <p className="text-xs text-white/55">GM 제외, 전원 완료 후 결과 공개</p>
            </div>
            <div className="flex gap-2">
              <MiniActionButton onClick={() => startDecisionSession("nomination")}>지목 시작</MiniActionButton>
              <MiniActionButton onClick={() => startDecisionSession("vote")}>투표 시작</MiniActionButton>
            </div>
            {activeDecision ? (
              <div className="mt-3 rounded-xl border border-white/10 bg-black/16 px-3 py-2 text-xs text-white/70">
                <div>{activeDecision.type === "nomination" ? "지목" : "투표"} 진행 중</div>
                <div>{Object.keys(activeDecision.responses ?? {}).length} / {nonGmPlayers.length} 완료</div>
                {activePlayer.role === "GM" ? <div className="mt-1 text-white/45">GM은 진행만 하고 팝업 제출에는 참여하지 않습니다.</div> : null}
              </div>
            ) : null}
          </div>
          {activePlayer.role === "GM" ? (
            <div className="rounded-2xl bg-white/8 p-4">
              <p className="mb-3 text-sm font-semibold">GM 맵 편집</p>
              <div className="rounded-xl border border-white/10 bg-black/16 px-3 py-2 text-xs text-white/72">
                상단 우측 `맵 편집 / 편집 종료` 버튼으로 편집 모드를 전환합니다.
              </div>
              <div className="mt-3 rounded-xl border border-white/10 bg-black/16 px-3 py-3 text-xs leading-6 text-white/72">
                <div>{isMapEditing ? "편집 모드가 켜져 있습니다." : "편집 모드를 켜면 맵 요소를 직접 드래그할 수 있습니다."}</div>
                <div>맵 우하단 핸들을 드래그하면 전체 맵 크기가 바뀝니다.</div>
                <div>선택한 방의 이름표를 드래그하면 이동, 모서리를 드래그하면 크기 조절이 됩니다.</div>
                <div>파란 박스 가장자리 핸들을 드래그하면 이동 가능 구역이 바뀝니다.</div>
                <div>플레이어 이름표를 드래그하면 해당 캐릭터 위치를 직접 옮길 수 있습니다.</div>
                <div className="mt-2 text-white/45">현재 맵 {state.mapSize.width} × {state.mapSize.height}</div>
                {selectedRoom ? <div className="text-white/45">{selectedRoom.name} {selectedRoom.width} × {selectedRoom.height}</div> : null}
                <div className="text-white/45">이동 구역 {state.movementBounds.left}, {state.movementBounds.top} → {state.movementBounds.right}, {state.movementBounds.bottom}</div>
              </div>
            </div>
          ) : null}
          </aside>
        </div>

        <aside className={`fixed bottom-[268px] left-8 z-[60] w-[360px] rounded-[24px] border p-5 text-white transition ${isChatFocused ? "border-emerald-200/55 bg-black/45 shadow-[0_0_0_2px_rgba(167,243,208,0.2),0_18px_40px_rgba(0,0,0,0.28)] backdrop-blur-sm" : "border-transparent bg-transparent"}`}>
          <div className="mb-5 flex items-start justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-[0.28em] text-white/70">Spatial Chat</p>
              <h2 className="mt-1 text-[22px] font-semibold leading-tight">현재 방 대화</h2>
            </div>
            <div className="pt-1 text-sm text-white/75">{getRoomName(state.rooms, activePlayer.currentRoom)}</div>
          </div>
          <p className="mb-5 text-sm leading-6 text-white/76">{getRoomName(state.rooms, activePlayer.currentRoom)}에 들어온 이후의 대화만 보입니다.</p>
          <div ref={chatScrollRef} className="mb-6 h-[220px] space-y-3 overflow-y-auto pr-2">
            {visibleMessages.length ? visibleMessages.map((message) => {
              const sender = state.players.find((player) => player.id === message.senderId);
              return (
                <article key={message.id} className="px-3 py-2.5">
                  <div className="flex items-center justify-between gap-3">
                    <strong className="text-sm">{sender?.name ?? "알 수 없음"}</strong>
                    <span className="text-xs text-white/45">{formatTime(message.timestamp)}</span>
                  </div>
                  <p className="mt-1 text-sm text-white/80">{message.text}</p>
                </article>
              );
            }) : <p className="text-[17px] text-white/88">이 방에는 아직 공개된 대화가 없습니다.</p>}
          </div>
          <form onSubmit={submitChat} className="flex gap-3">
            <input
              ref={chatInputRef}
              value={chatDraft}
              onChange={(event) => setChatDraft(event.target.value)}
              onFocus={() => setIsChatFocused(true)}
              onBlur={() => setIsChatFocused(false)}
              maxLength={180}
              placeholder="Enter로 입력 활성화, Enter로 전송"
              className="h-12 flex-1 rounded-2xl border border-white/15 bg-black/15 px-4 text-sm text-white outline-none placeholder:text-white/35 focus:border-emerald-200/50"
            />
            <button type="submit" className="inline-flex h-12 items-center gap-2 rounded-2xl bg-[#8f452f] px-4 font-medium text-white transition hover:bg-[#7c3d2a]">
              전송
            </button>
          </form>
        </aside>

        <div className={`absolute bottom-5 left-1/2 z-30 w-[1560px] -translate-x-1/2 px-5 py-3 text-stone-900 transition ${isMapEditing ? "pointer-events-none opacity-35" : ""}`}>
          <button type="button" onClick={() => openProfile(activePlayer.id)} className="group mb-3 flex items-start gap-4 rounded-[20px] border border-transparent p-2 text-left transition hover:border-stone-300">
            <div className="overflow-hidden rounded-2xl border border-stone-300/70 bg-white">
              <CharacterPortrait player={activePlayer} size="large" />
            </div>
            <div>
              <div className="text-[18px] font-semibold">{activePlayer.name}</div>
              <div className="text-[13px] text-stone-600">{activePlayerProfile?.characterName ?? "캐릭터 프로필"}</div>
              <div className="text-[16px] text-stone-600">단서 {activeHandCards.length}장</div>
              <div className="mt-1 text-[11px] text-stone-500 transition group-hover:text-stone-700">프로필 보기</div>
            </div>
          </button>
          <div
            ref={handTrayRef}
            className="flex min-h-[112px] gap-2 overflow-x-auto pb-1"
            data-hand-dropzone="true"
          >
            {activeHandCards.length ? activeHandCards.map((card) => (
              <CardTile
                key={card.id}
                card={card}
                visible={Boolean(card.handFaceUp)}
                onClick={() => openCard(card.id)}
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
            )) : <EmptyState label="손패가 비어 있습니다. 로비에서 단서를 가져와 보세요." light />}
          </div>
        </div>
      </div>
      </div>
      </div>

      <audio ref={bgmAudioRef} src={defaultBgm} preload="auto" hidden />

      {modalCard ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/42 p-4 backdrop-blur-[2px]"
          onClick={() => setState((current) => ({ ...current, modalCardId: null, tableActionCardId: null, pendingAction: null }))}
        >
          <div
            className="inline-flex flex-col items-center"
            style={{ transform: `scale(${viewportScale})`, transformOrigin: "center center" }}
          >
            <div
              style={{ transform: `scale(${modalCardScale})`, transformOrigin: "center center" }}
              onClick={(event) => event.stopPropagation()}
            >
              <CardModalPreview
                card={modalCard}
                visible={canSeeModalCard}
                isZooming={isAltZooming}
                zoomFocus={modalZoomFocus}
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
                  <ActionButton onClick={toggleTableCard}>뒤집기</ActionButton>
                  <ActionButton onClick={takeCard}>가져오기</ActionButton>
                </>
              ) : null}

              {modalCard.ownerId === activePlayer.id ? (
                <>
                  <ActionButton onClick={toggleHandCardFace}>{modalCard.handFaceUp ? "뒷면 보기" : "앞면 보기"}</ActionButton>
                  <ActionButton onClick={() => placeCardOnTable(true)}>전체공개</ActionButton>
                  <ActionButton onClick={() => setState((current) => ({ ...current, pendingAction: current.pendingAction === "transfer" ? null : "transfer" }))}>양도하기</ActionButton>
                </>
              ) : null}

              {modalCard.ownerId !== null && modalCard.ownerId !== activePlayer.id && activePlayer.role === "GM" ? (
                <ActionButton onClick={() => setGmPeekFaceUp((current) => !current)}>
                  {gmPeekFaceUp ? "뒷면 보기" : "앞면 보기"}
                </ActionButton>
              ) : null}
            </div>

            {modalCard.ownerId === activePlayer.id && state.pendingAction === "transfer" ? (
              <div className="mt-4 flex flex-wrap items-center justify-center gap-3" onClick={(event) => event.stopPropagation()}>
                <p className="w-full text-center text-sm text-white/70">누구에게 양도할지 선택하세요.</p>
                <div className="flex flex-wrap justify-center gap-2">
                  {state.players.filter((player) => player.id !== activePlayer.id).map((player) => (
                    <ActionButton key={player.id} onClick={() => transferCard(player.id)}>
                      {player.name}
                    </ActionButton>
                  ))}
                </div>
              </div>
            ) : null}
          </div>
        </div>
      ) : null}

      {profilePlayer ? (
        <OverlayModal onClose={() => setState((current) => ({ ...current, profileModalPlayerId: null }))}>
          <div className="w-[min(720px,92vw)] rounded-[28px] bg-[#f7f0e4] p-6 text-stone-900 shadow-[0_24px_80px_rgba(0,0,0,0.28)]">
            <div className="mb-5 flex items-start gap-4">
              <div className="overflow-hidden rounded-[22px] border border-stone-900/8 bg-white">
                <CharacterPortrait player={profilePlayer} size="profile" />
              </div>
              <div className="pt-1">
                <p className="text-xs uppercase tracking-[0.24em] text-stone-500">{profilePlayer.role === "GM" ? "Game Master" : "Character Profile"}</p>
                <h2 className="mt-1 text-3xl font-semibold">{characterProfiles[profilePlayer.id]?.characterName ?? profilePlayer.name}</h2>
                <p className="mt-1 text-sm text-stone-600">{characterProfiles[profilePlayer.id]?.tagline ?? ""}</p>
              </div>
            </div>
            <div className="rounded-[22px] border border-stone-900/8 bg-white/72 p-5">
              <p className="text-sm leading-7 text-stone-700">{characterProfiles[profilePlayer.id]?.bio ?? "등록된 소개가 없습니다."}</p>
            </div>
            {profilePlayer.id === activePlayer.id ? (
              <div className="mt-5 rounded-[22px] border border-stone-900/8 bg-white/72 p-5">
                <p className="mb-3 text-sm font-semibold uppercase tracking-[0.22em] text-stone-500">캐릭터 스토리북</p>
                <div className="max-h-[320px] overflow-y-auto pr-2 text-sm leading-7 text-stone-700 whitespace-pre-wrap">
                  {characterProfiles[profilePlayer.id]?.storybook ?? "스토리북이 비어 있습니다."}
                </div>
              </div>
            ) : null}
          </div>
        </OverlayModal>
      ) : null}

      {state.documentModalType ? (
        <OverlayModal onClose={() => setState((current) => ({ ...current, documentModalType: null }))}>
          <RulebookModalContent document={state.documentModalType === "gm-rulebook" ? gmRulebook : sharedRulebook} />
        </OverlayModal>
      ) : null}

      {activeDecision && isDecisionParticipant && activeDecision.status === "collecting" && !activeDecisionResponse ? (
        <OverlayModal onClose={() => {}}>
          <DecisionModal
            type={activeDecision.type}
            players={nonGmPlayers.filter((player) => player.id !== activePlayer.id)}
            onSubmit={submitDecisionResponse}
          />
        </OverlayModal>
      ) : null}

      {activeDecision && activeDecision.status === "complete" ? (
        <OverlayModal onClose={() => setState((current) => ({ ...current, decisionSession: null }))}>
          <DecisionResultModal
            session={activeDecision}
            players={state.players}
            onClose={() => setState((current) => ({ ...current, decisionSession: null }))}
          />
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
  const cardNumber = getCardSequence(card.id);
  const categoryCode = getCardCategoryCode(card.id);
  const categoryLabel = `${card.type ?? "단서"} 단서 ${categoryCode}`;
  const cardTitle = card.summary ?? card.title;
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
            <div className={`px-2 py-1 text-[9px] font-semibold uppercase tracking-[0.24em] ${visible ? "bg-stone-900/7 text-stone-600" : "bg-white/12 text-white/72"}`}>
              {categoryLabel}
            </div>
            <div className={`text-[9px] font-semibold uppercase tracking-[0.22em] ${visible ? "text-stone-400" : "text-white/38"}`}>
              #{cardNumber}
            </div>
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
              <div className="border border-white/10 bg-black/10 px-4 py-5 text-center">
                <p className="text-[9px] font-semibold uppercase tracking-[0.24em] text-white/42">#{cardNumber}</p>
                <p className="mt-3 text-[10px] font-semibold uppercase tracking-[0.26em] text-white/46">{categoryCode}</p>
                <p className="mt-2 text-[20px] font-semibold leading-[1.1]">{card.type ?? "공용 단서"}</p>
              </div>
            </div>
          )}

          <div className="mt-auto pt-3" />
        </div>
      </div>
    </div>
  );
}

function CardModalPreview({ card, visible, isZooming, zoomFocus, onPointerMove, onPointerLeave }) {
  const lensSize = 1020;
  const zoomScale = 5;
  const lensVisible = Boolean(isZooming && zoomFocus);
  const lensLeft = zoomFocus ? zoomFocus.x : lensSize / 2;
  const lensTop = zoomFocus ? zoomFocus.y : lensSize / 2;

  return (
    <div
      className="relative inline-block"
      onPointerMove={onPointerMove}
      onPointerLeave={onPointerLeave}
      data-hoverable="true"
    >
      <CardTile
        card={card}
        visible={visible}
        actionLabel=""
        modal
      />

      {lensVisible ? (
        <div className="pointer-events-none absolute inset-0 overflow-hidden rounded-[18px] bg-black/16 backdrop-blur-[3px]" />
      ) : null}

      {lensVisible ? (
        <div
          className="pointer-events-none absolute overflow-hidden rounded-full border-4 border-amber-200/95 bg-[#f7f0e4] shadow-[0_18px_36px_rgba(0,0,0,0.32)]"
          style={{
            left: lensLeft,
            top: lensTop,
            width: lensSize,
            height: lensSize,
            transform: "translate(-50%, -50%)",
          }}
        >
          <div
            className="absolute left-0 top-0 origin-top-left"
            style={{
              left: lensSize / 2 - zoomFocus.x * zoomScale,
              top: lensSize / 2 - zoomFocus.y * zoomScale,
              transform: `scale(${zoomScale})`,
            }}
          >
            <CardTile
              card={card}
              visible={visible}
              actionLabel=""
              modal
            />
          </div>
        </div>
      ) : null}
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

function RulebookModalContent({ document }) {
  return (
    <div className="w-[min(760px,92vw)] rounded-[28px] bg-[#f7f0e4] p-6 text-stone-900 shadow-[0_24px_80px_rgba(0,0,0,0.28)]">
      <p className="text-xs uppercase tracking-[0.24em] text-stone-500">Rulebook</p>
      <h2 className="mt-1 text-3xl font-semibold">{document.title}</h2>
      <div className="mt-5 max-h-[420px] overflow-y-auto rounded-[22px] border border-stone-900/8 bg-white/72 p-5 text-sm leading-7 whitespace-pre-wrap text-stone-700">
        {document.body}
      </div>
    </div>
  );
}

function DecisionModal({ type, players, onSubmit }) {
  return (
    <div className="w-[min(560px,92vw)] rounded-[28px] bg-[#f7f0e4] p-6 text-stone-900 shadow-[0_24px_80px_rgba(0,0,0,0.28)]">
      <p className="text-xs uppercase tracking-[0.24em] text-stone-500">{type === "nomination" ? "Nomination" : "Vote"}</p>
      <h2 className="mt-1 text-3xl font-semibold">{type === "nomination" ? "지목 대상을 선택하세요" : "투표 대상을 선택하세요"}</h2>
      <p className="mt-2 text-sm text-stone-600">모든 플레이어가 완료해야 결과가 공개됩니다. 기권도 가능합니다.</p>
      <div className="mt-5 grid gap-2">
        {players.map((player) => (
          <button
            key={player.id}
            type="button"
            onClick={() => onSubmit(player.id)}
            className="rounded-2xl border border-stone-900/8 bg-white/72 px-4 py-3 text-left text-sm font-medium transition hover:bg-white"
          >
            {player.name}
          </button>
        ))}
        <button type="button" onClick={() => onSubmit("abstain")} className="rounded-2xl bg-stone-800 px-4 py-3 text-sm font-medium text-white transition hover:bg-stone-700">
          기권
        </button>
      </div>
    </div>
  );
}

function DecisionResultModal({ session, players, onClose }) {
  const result = session.result;
  return (
    <div className="w-[min(640px,92vw)] rounded-[28px] bg-[#f7f0e4] p-6 text-stone-900 shadow-[0_24px_80px_rgba(0,0,0,0.28)]">
      <p className="text-xs uppercase tracking-[0.24em] text-stone-500">{session.type === "nomination" ? "Nomination Result" : "Vote Result"}</p>
      <h2 className="mt-1 text-3xl font-semibold">{session.type === "nomination" ? "지목 결과" : "투표 결과"}</h2>
      {session.type === "nomination" ? (
        <div className="mt-5 space-y-2">
          {result.lines.map((line, index) => (
            <div key={`${line.from}-${line.to}-${index}`} className="rounded-2xl border border-stone-900/8 bg-white/72 px-4 py-3 text-sm">
              {getPlayerName(players, line.from)} → {line.to === "abstain" ? "기권" : getPlayerName(players, line.to)}
            </div>
          ))}
        </div>
      ) : (
        <div className="mt-5">
          <div className="space-y-2">
            {result.counts.map((entry) => (
              <div key={entry.targetId} className="rounded-2xl border border-stone-900/8 bg-white/72 px-4 py-3 text-sm">
                {entry.targetId === "abstain" ? "기권" : getPlayerName(players, entry.targetId)}: {entry.count}표
              </div>
            ))}
          </div>
          <div className="mt-4 rounded-2xl bg-stone-800 px-4 py-3 text-sm font-medium text-white">
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
    <button type="button" onClick={onClick} className="rounded-2xl bg-sky-400 px-4 py-2.5 text-sm font-medium text-slate-950 transition hover:bg-sky-300">
      {children}
    </button>
  );
}

function CharacterPortrait({ player, size = "small" }) {
  const canvasRef = useRef(null);
  const dimensions = size === "profile" ? 120 : size === "large" ? 72 : 52;

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
  }, [player, dimensions]);

  return (
    <canvas
      ref={canvasRef}
      width={dimensions}
      height={dimensions}
      className={size === "profile" ? "h-[120px] w-[120px] bg-[#f8f1e8]" : size === "large" ? "h-[72px] w-[72px] bg-[#f8f1e8]" : "h-[52px] w-[52px] bg-[#f8f1e8]"}
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
    const nextWidth = clamp(Math.round(session.startMapSize.width + dx), 960, 3200);
    const nextHeight = clamp(Math.round(session.startMapSize.height + dy), 640, 2200);
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
  return {
    ...state,
    players: state.players.map((item) => (item.id === player.id ? nextPlayer : item)),
    walkTarget: options.keepWalkTarget ? state.walkTarget : null,
    modalCardId: changedRoom ? null : state.modalCardId,
    tableActionCardId: changedRoom ? null : state.tableActionCardId,
    pendingAction: changedRoom ? null : state.pendingAction,
    logs: changedRoom ? addLog(state.logs, `${player.name} 님이 ${getRoomName(state.rooms, player.currentRoom)}에서 ${getRoomName(state.rooms, nextPlayer.currentRoom)}(으)로 이동했습니다.`) : state.logs,
  };
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
    return {
      ...state,
      players: state.players.map((item) => (item.id === player.id ? nextPlayer : item)),
      walkTarget: null,
      logs: changedRoom ? addLog(state.logs, `${player.name} 님이 ${getRoomName(state.rooms, player.currentRoom)}에서 ${getRoomName(state.rooms, nextPlayer.currentRoom)}(으)로 이동했습니다.`) : state.logs,
    };
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
  return {
    ...state,
    players: state.players.map((item) => (item.id === player.id ? nextPlayer : item)),
    walkTarget: null,
    modalCardId: null,
    tableActionCardId: null,
    pendingAction: null,
    logs: addLog(state.logs, `${player.name} 님이 ${getRoomName(state.rooms, player.currentRoom)}에서 ${room.name}(으)로 빠르게 이동했습니다.`),
  };
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

  return {
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
  };
}

function getActivePlayer(state) {
  return state.players.find((player) => player.id === state.activePlayerId) ?? state.players[0];
}

function getPlayerName(players, playerId) {
  return players.find((player) => player.id === playerId)?.name ?? "알 수 없음";
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

function addLog(logs, text) {
  return [...logs, { id: `l-${crypto.randomUUID()}`, text, timestamp: Date.now() }];
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
