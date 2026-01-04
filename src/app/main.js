// XGOアプリの画面配線とイベントハンドラをまとめたエントリポイント
import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm";
import { createBoardView } from "../components/board.js";
import { createStatusBar } from "../components/statusBar.js";
import { createSetupPanel } from "../components/setupPanel.js";
import { createMatchPanel } from "../components/matchPanel.js";
import { createPlayPanel } from "../components/playPanel.js";
import { createResultPanel } from "../components/resultPanel.js";
import { createCaptureTray } from "../components/captureTray.js";
import { createLayout } from "../components/layout.js";
import { applyPalette } from "../theme/palette.js";
import { cloneBoard } from "../domain/board.js";
import { Player } from "../domain/types.js";
import {
  GameMode,
  createInitialState,
  enterSetup,
  MatchType,
  updateMatchType,
  toggleMatchCode,
  updateBoardSize,
  updateObstacleConfig,
  passTurn,
  startGame,
  playAt,
  enterOrganize,
  moveStone,
  requestScore,
  backToOrganize,
  resetGame,
} from "../state/gameState.js";
import { emit } from "../events/bus.js";
import { Events } from "../events/types.js";

const supabaseConfig = window.__SUPABASE__ ?? {};
const supabaseUrl = supabaseConfig.url;
const supabaseAnonKey = supabaseConfig.anonKey;
const supabase = supabaseUrl && supabaseAnonKey ? createClient(supabaseUrl, supabaseAnonKey) : null;
const clientId = (() => {
  const stored = window.sessionStorage.getItem("xgo-client-id");
  if (stored) return stored;
  const next = crypto.randomUUID();
  window.sessionStorage.setItem("xgo-client-id", next);
  return next;
})();
const roomCodeKey = "xgo-room-code";
const readStoredCode = () => window.sessionStorage.getItem(roomCodeKey);
const writeStoredCode = (code) => {
  if (code) {
    window.sessionStorage.setItem(roomCodeKey, code);
  } else {
    window.sessionStorage.removeItem(roomCodeKey);
  }
};
let activeGame = { id: null, code: null };
let onlineChannel = null;
let suppressRemoteSync = false;
let pollTimer = null;

const playerRoles = {
  Black: "black",
  White: "white",
};

function makePlayer(role) {
  return { id: clientId, role, joinedAt: Date.now() };
}

function getRoleForClient(players) {
  return players.find((p) => p.id === clientId)?.role ?? null;
}

function normalizePlayers(players) {
  const seenIds = new Set();
  const seenRoles = new Set();
  const normalized = [];
  (players ?? []).forEach((player) => {
    if (!player?.id || seenIds.has(player.id)) return;
    if (player.role && seenRoles.has(player.role)) return;
    normalized.push(player);
    seenIds.add(player.id);
    if (player.role) seenRoles.add(player.role);
  });
  return normalized;
}

let state = createInitialState();
let resultClosed = false;
const history = { past: [], future: [] };

applyPalette();

const matchCodeSize = state.matchCode?.length ?? 5;

function parseMatchCode(value, size) {
  if (!value) return null;
  const clean = String(value).replace(/[^01]/g, "");
  if (clean.length !== size) return null;
  return clean.split("").map((bit) => (bit === "1" ? 1 : 0));
}

function updateUrlWithCode(bits) {
  const params = new URLSearchParams(window.location.search);
  if (!bits) {
    params.delete("code");
  } else {
    params.set("code", bits.join(""));
  }
  const query = params.toString();
  const nextUrl = `${window.location.pathname}${query ? `?${query}` : ""}${window.location.hash}`;
  window.history.replaceState({}, "", nextUrl);
}

const urlCodeParam = new URLSearchParams(window.location.search).get("code");
const initialCode = parseMatchCode(urlCodeParam, matchCodeSize);
const storedCode = parseMatchCode(readStoredCode(), matchCodeSize);
const joinCode = initialCode ?? storedCode;
if (urlCodeParam && !initialCode) {
  updateUrlWithCode(null);
}
if (joinCode) {
  state = {
    ...state,
    matchType: MatchType.Online,
    matchCode: joinCode,
  };
}

function serializeState(source) {
  return {
    mode: source.mode,
    boardSize: source.boardSize,
    board: source.board,
    currentPlayer: source.currentPlayer,
    hostId: source.hostId ?? null,
    players: source.players ?? [],
    captures: source.captures,
    komi: source.komi,
    obstaclesEnabled: source.obstaclesEnabled,
    obstacleCount: source.obstacleCount,
    obstacles: source.obstacles,
    lastScore: source.lastScore,
    matchType: source.matchType,
    matchCode: source.matchCode,
    consecutivePasses: source.consecutivePasses,
    lastPassBy: source.lastPassBy,
    syncVersion: source.syncVersion ?? 0,
    _meta: {
      updatedBy: clientId,
      updatedAt: Date.now(),
    },
  };
}

function applyRemoteState(remote, { force = false } = {}) {
  if (!remote) return;
  const remoteVersion = typeof remote.syncVersion === "number" ? remote.syncVersion : null;
  const localVersion = typeof state.syncVersion === "number" ? state.syncVersion : null;
  if (!force && remoteVersion !== null && localVersion !== null && remoteVersion < localVersion) return;
  const resolvedHostId = remote.hostId ?? state.hostId ?? null;
  const next = {
    ...state,
    ...remote,
    matchType: MatchType.Online,
    matchCode: remote.matchCode ?? state.matchCode,
    localPlayer: state.localPlayer,
    isHost: resolvedHostId ? resolvedHostId === clientId : state.isHost,
    players: remote.players ?? state.players ?? [],
  };
  suppressRemoteSync = true;
  setState(next, { clearHistory: true, isRemote: true });
  suppressRemoteSync = false;
}

async function createOrJoinGame(code, baseState) {
  if (!supabase) return null;
  const cleanCode = (code ?? []).join("");
  if (!cleanCode) return null;
  const { data: existing, error: selectError } = await supabase
    .from("games")
    .select("id, state, updated_at")
    .eq("code", cleanCode)
    .maybeSingle();
  if (selectError) {
    console.error(selectError);
    return null;
  }
  if (existing) {
    activeGame = { id: existing.id, code: cleanCode };
    const remoteState = existing.state ?? {};
    const players = normalizePlayers(remoteState.players);
    const existingRole = getRoleForClient(players);
    if (existingRole) {
      if (!remoteState.hostId) {
        const nextHostId = players[0]?.id ?? clientId;
        const nextState = { ...remoteState, hostId: nextHostId };
        const { data: updated, error: updateError } = await supabase
          .from("games")
          .update({ state: nextState, updated_at: new Date().toISOString() })
          .eq("id", existing.id)
          .select("id, state, updated_at")
          .single();
        if (updateError) {
          console.error(updateError);
          return null;
        }
        return { created: false, data: updated, role: existingRole, rejoin: true };
      }
      return { created: false, data: existing, role: existingRole, rejoin: true };
    }
    if (players.length === 0) {
      const freshHostState = enterSetup({
        ...baseState,
        matchType: MatchType.Online,
        localPlayer: Player.Black,
        isHost: true,
        hostId: clientId,
        players: [makePlayer(playerRoles.Black)],
      });
      const { data: updated, error: updateError } = await supabase
        .from("games")
        .update({ state: serializeState(freshHostState), updated_at: new Date().toISOString() })
        .eq("id", existing.id)
        .select("id, state, updated_at")
        .single();
      if (updateError) {
        console.error(updateError);
        return null;
      }
      return { created: false, data: updated, role: playerRoles.Black };
    }
    const roles = new Set(players.map((p) => p.role).filter(Boolean));
    if (roles.size >= 2) {
      return { created: false, data: existing, full: true };
    }
    const nextRole = roles.has(playerRoles.Black) ? playerRoles.White : playerRoles.Black;
    const nextPlayers = [...players, makePlayer(nextRole)];
    const nextState = {
      ...remoteState,
      players: nextPlayers,
      hostId: remoteState.hostId ?? nextPlayers[0]?.id ?? null,
    };
    const { data: updated, error: updateError } = await supabase
      .from("games")
      .update({ state: nextState, updated_at: new Date().toISOString() })
      .eq("id", existing.id)
      .select("id, state, updated_at")
      .single();
    if (updateError) {
      console.error(updateError);
      return null;
    }
    return { created: false, data: updated, role: nextRole };
  }

  const initial = serializeState(baseState);
  const { data: created, error: insertError } = await supabase
    .from("games")
    .insert({ code: cleanCode, state: initial })
    .select("id, state, updated_at")
    .single();
  if (insertError) {
    console.error(insertError);
    return null;
  }
  activeGame = { id: created.id, code: cleanCode };
  return { created: true, data: created };
}

async function syncStateIfOnline() {
  if (suppressRemoteSync) return;
  if (!supabase || state.matchType !== MatchType.Online) return;
  if (state.mode === GameMode.Match) return;
  if (!activeGame.id) return;
  const payload = serializeState(state);
  const { error } = await supabase
    .from("games")
    .update({ state: payload, updated_at: new Date().toISOString() })
    .eq("id", activeGame.id);
  if (error) console.error(error);
}

async function subscribeToGame(code) {
  if (!supabase || !code) return;
  if (onlineChannel) {
    await supabase.removeChannel(onlineChannel);
    onlineChannel = null;
  }
  onlineChannel = supabase
    .channel("games")
    .on(
      "postgres_changes",
      { event: "*", schema: "public", table: "games", filter: `code=eq.${code}` },
      (payload) => {
        const remote = payload.new?.state;
        if (!remote || remote?._meta?.updatedBy === clientId) return;
        applyRemoteState(remote);
      }
    )
    .subscribe((status) => {
      if (status === "SUBSCRIBED") return;
      if (status === "CHANNEL_ERROR" || status === "TIMED_OUT") {
        startPolling(code);
      }
    });
}

async function pollGameState(code) {
  if (!supabase || !code) return;
  const { data, error } = await supabase
    .from("games")
    .select("state")
    .eq("code", code)
    .maybeSingle();
  if (error) {
    console.error(error);
    return;
  }
  if (data?.state && data.state?._meta?.updatedBy !== clientId) {
    applyRemoteState(data.state);
  }
}

function startPolling(code) {
  if (pollTimer) return;
  pollTimer = window.setInterval(() => {
    void pollGameState(code);
  }, 1200);
}

function stopPolling() {
  if (!pollTimer) return;
  window.clearInterval(pollTimer);
  pollTimer = null;
}

async function leaveRoom() {
  if (!supabase || !activeGame.id) return;
  let remoteState = state;
  const { data, error: fetchError } = await supabase
    .from("games")
    .select("state")
    .eq("id", activeGame.id)
    .maybeSingle();
  if (!fetchError && data?.state) {
    remoteState = data.state;
  }
  const players = normalizePlayers(remoteState.players);
  const leavingRole = state.localPlayer === Player.White ? playerRoles.White : playerRoles.Black;
  let nextPlayers = players.filter((p) => p.id !== clientId);
  if (nextPlayers.length === players.length) {
    nextPlayers = players.filter((p) => p.role !== leavingRole);
  }
  const nextHost = remoteState.hostId === clientId ? nextPlayers[0]?.id ?? null : remoteState.hostId;
  const baseRoomState = {
    ...remoteState,
    matchType: MatchType.Online,
    players: nextPlayers,
    hostId: nextHost,
  };
  const roomState = nextPlayers.length === 0 ? enterSetup(baseRoomState) : baseRoomState;
  const { error } = await supabase
    .from("games")
    .update({ state: serializeState(roomState), updated_at: new Date().toISOString() })
    .eq("id", activeGame.id);
  if (error) console.error(error);
  updateUrlWithCode(null);
  writeStoredCode(null);
  activeGame = { id: null, code: null };
  if (onlineChannel) {
    await supabase.removeChannel(onlineChannel);
    onlineChannel = null;
  }
  stopPolling();
  setState(
    {
      ...state,
      mode: GameMode.Match,
      matchType: MatchType.Online,
      localPlayer: Player.Black,
      hostId: null,
      isHost: false,
      players: [],
    },
    { clearHistory: true }
  );
}

const appRoot = document.getElementById("app-root");
const { root, elements: els } = createLayout();
const fallback = document.getElementById("fallback");
if (fallback) fallback.remove();
appRoot.appendChild(root);

const boardView = createBoardView({
  onPlay: handlePlay,
  onMove: handleMove,
});
els.boardHost.appendChild(boardView.element);

const statusBar = createStatusBar({
  turnCountEl: els.turnCount,
  rootEl: document.body,
});

const setupPanel = createSetupPanel(
  {
    segmentEl: els.obstacleSegment,
    sizeSegmentEl: els.boardSizeSegment,
    startButtons: [els.startSetupBtn],
  },
  {
    onCountChange: (count) => {
      if (state.matchType === MatchType.Online && !state.isHost) return;
      setState(updateObstacleConfig(state, { count }), { clearHistory: true });
    },
    onSizeChange: (size) => {
      if (state.matchType === MatchType.Online && !state.isHost) return;
      setState(updateBoardSize(state, size), { clearHistory: true });
    },
    onStart: () => {
      if (state.matchType === MatchType.Online && !state.isHost) return;
      setState(startGame(state), { clearHistory: true });
      logEvent(Events.GameStarted, { withObstacles: state.obstaclesEnabled, obstacles: state.obstacles });
    },
  }
);

const matchPanel = createMatchPanel(
  {
    segmentEl: els.matchSegment,
    stonesEl: els.matchStones,
    codeEl: els.matchCodeValue,
    startButton: els.startMatchBtn,
  },
  {
    onModeChange: (mode) => setState(updateMatchType(state, mode)),
    onToggleStone: (index) => {
      if (state.matchType !== MatchType.Online) return;
      setState(toggleMatchCode(state, index));
    },
    onStart: () => {
      void handleMatchStart();
    },
  }
);

const playPanel = createPlayPanel(
  {
    panelEl: els.uiPanel,
    undoBtn: els.undoBtn,
    redoBtn: els.redoBtn,
    toOrganizeBtn: els.organizeBtn,
    backToPlayBtn: els.backToPlayBtn,
    scoreBtn: els.scoreBtn,
    resetButtons: els.resetBtns,
  },
  {
    onUndo: handleUndo,
    onRedo: handleRedo,
    onOrganize: () => setState(enterOrganize(state), { clearHistory: true }),
    onBackToPlay: () => setState({ ...state, mode: GameMode.Play }, { clearHistory: true }),
    onScore: handleScore,
    onReset: () => {
      setState(resetGame(state), { clearHistory: true });
      logEvent(Events.GameReset);
    },
  }
);

const resultPanel = createResultPanel({
  blackEl: els.scoreBlack,
  whiteEl: els.scoreWhite,
  winnerEl: els.winner,
});

const captureSides = createCaptureTray(
  {
    blackTrayEl: els.captureBlackTray,
    whiteTrayEl: els.captureWhiteTray,
    blackCountEl: els.captureBlackCount,
    whiteCountEl: els.captureWhiteCount,
  },
  { maxStones: 18, stoneSize: "small" }
);

async function autoJoinFromUrl() {
  if (!joinCode) return;
  if (!supabase) {
    updateUrlWithCode(null);
    writeStoredCode(null);
    return;
  }
  const code = joinCode.join("");
  const existing = await createOrJoinGame(joinCode, {
    ...state,
    matchType: MatchType.Online,
    localPlayer: Player.Black,
    isHost: true,
    hostId: clientId,
    players: [makePlayer(playerRoles.Black)],
  });
  if (!existing) {
    updateUrlWithCode(null);
    writeStoredCode(null);
    return;
  }
  if (existing.full) {
    window.alert("このルームは満員です。別のコードで試してください。");
    updateUrlWithCode(null);
    writeStoredCode(null);
    return;
  }
  writeStoredCode(code);
  updateUrlWithCode(null);
  if (existing.created) {
    const hostState = enterSetup({
      ...state,
      matchType: MatchType.Online,
      localPlayer: Player.Black,
      isHost: true,
      hostId: clientId,
      players: [makePlayer(playerRoles.Black)],
    });
    setState(hostState, { clearHistory: true, skipSync: true });
  } else if (existing.data) {
    const roleKey = existing.role ?? getRoleForClient(existing.data.state?.players ?? []);
    const role = roleKey === playerRoles.White ? Player.White : Player.Black;
    const guestState = {
      ...state,
      matchType: MatchType.Online,
      localPlayer: role,
      isHost: existing.data.state?.hostId === clientId,
      hostId: existing.data.state?.hostId ?? null,
      players: existing.data.state?.players ?? [],
    };
    setState(guestState, { clearHistory: true, skipSync: true, isRemote: true });
    applyRemoteState(existing.data.state, { force: true });
  }
  await subscribeToGame(code);
  startPolling(code);
}

if (els.closeResult) {
  els.closeResult.addEventListener("click", () => {
    resultClosed = false;
    setState(backToOrganize(state), { clearHistory: true });
  });
}

if (els.resultBackOrganizeBtn) {
  els.resultBackOrganizeBtn.addEventListener("click", () => {
    resultClosed = false;
    setState(backToOrganize(state), { clearHistory: true });
  });
}

function cloneStateSnapshot(source) {
  return {
    ...source,
    boardSize: source.boardSize,
    board: cloneBoard(source.board),
    captures: { ...source.captures },
    obstacles: source.obstacles.map((p) => ({ ...p })),
    lastScore: source.lastScore ? { ...source.lastScore } : null,
    consecutivePasses: source.consecutivePasses ?? 0,
    lastPassBy: source.lastPassBy ?? null,
  };
}

function clearHistory() {
  history.past = [];
  history.future = [];
}

function pushHistory(prevState) {
  history.past.push(cloneStateSnapshot(prevState));
  history.future = [];
}

function logEvent(type, payload) {
  emit(type, payload);
}

function setState(
  next,
  { recordHistory = false, clearHistory: shouldClear = false, isRemote = false, skipSync = false } = {}
) {
  if (recordHistory) pushHistory(state);
  if (shouldClear) clearHistory();
  const prevMode = state.mode;
  const currentVersion = typeof state.syncVersion === "number" ? state.syncVersion : 0;
  const nextVersion = isRemote
    ? typeof next.syncVersion === "number"
      ? next.syncVersion
      : currentVersion
    : currentVersion + 1;
  state = { ...next, syncVersion: nextVersion };
  if (state.mode !== GameMode.Organize) {
    boardView.clearSelection();
  }
  if (state.mode !== GameMode.Result) resultClosed = false;
  render();
  if (!skipSync) {
    void syncStateIfOnline();
  }
  if (prevMode !== state.mode) {
    logEvent(Events.ModeChanged, { from: prevMode, to: state.mode });
  }
}

function render() {
  boardView.render(state.board, state.mode, state.currentPlayer);
  statusBar.render(state);
  matchPanel.render(state);
  setupPanel.render(state);
  playPanel.render(state, {
    canUndo: history.past.length > 0,
    canRedo: history.future.length > 0,
  });
  resultPanel.render(state.lastScore, state.captures);
  captureSides.render(state.captures);
  const isOnline = state.matchType === MatchType.Online;
  const local = state.localPlayer ?? Player.Black;
  const isPlay = state.mode === GameMode.Play;
  const players = Array.isArray(state.players) ? state.players : [];
  const opponentPresent = players.some((p) => p.id !== clientId);
  const showOffline = isOnline && (!activeGame.id || !opponentPresent);
  const showCode = isOnline && Array.isArray(state.matchCode) && !!activeGame.id;
  const canLeave = isOnline && !!activeGame.id;
  const canBlackPass = isPlay && state.currentPlayer === Player.Black && (!isOnline || local === Player.Black);
  const canWhitePass = isPlay && state.currentPlayer === Player.White && (!isOnline || local === Player.White);
  if (els.sideBlack) {
    els.sideBlack.classList.toggle("is-you", isOnline && local === Player.Black);
    els.sideBlack.classList.toggle("is-offline", showOffline && local === Player.White);
  }
  if (els.sideWhite) {
    els.sideWhite.classList.toggle("is-you", isOnline && local === Player.White);
    els.sideWhite.classList.toggle("is-offline", showOffline && local === Player.Black);
  }
  if (els.passBlackBtn) {
    els.passBlackBtn.disabled = !canBlackPass;
    els.passBlackBtn.classList.toggle("is-passed", state.lastPassBy === Player.Black);
  }
  if (els.passWhiteBtn) {
    els.passWhiteBtn.disabled = !canWhitePass;
    els.passWhiteBtn.classList.toggle("is-passed", state.lastPassBy === Player.White);
  }
  if (els.matchCodeBar) {
    els.matchCodeBar.classList.toggle("is-hidden", !showCode);
    if (showCode && els.matchCodeStones) {
      const stones = Array.from(els.matchCodeStones.children);
      stones.forEach((stoneEl, index) => {
        const bit = state.matchCode?.[index] ?? 0;
        stoneEl.classList.toggle("white", bit === 1);
        stoneEl.classList.toggle("black", bit !== 1);
      });
    }
  }
  if (els.leaveRoomBtn) {
    els.leaveRoomBtn.disabled = !canLeave;
    els.leaveRoomBtn.classList.toggle("is-hidden", !canLeave);
  }
  if (els.setupModal) {
    const open = state.mode === GameMode.Setup;
    els.setupModal.classList.toggle("is-open", open);
  }
  if (els.matchModal) {
    const open = state.mode === GameMode.Match;
    els.matchModal.classList.toggle("is-open", open);
  }
  if (els.resultModal) {
    const open = state.mode === GameMode.Result && !resultClosed;
    els.resultModal.classList.toggle("is-open", open);
  }
}

function handlePlay(point) {
  if (state.matchType === MatchType.Online && state.currentPlayer !== state.localPlayer) {
    return;
  }
  const placingPlayer = state.currentPlayer;
  const { next, ok } = playAt(state, point);
  if (!ok) return;
  setState(next, { recordHistory: true });
  boardView.triggerRippleAt?.(point);
  boardView.triggerObstacleSpin?.(point);
  logEvent(Events.StonePlaced, { player: placingPlayer, point });
}

function handlePass(player) {
  if (state.currentPlayer !== player) return;
  if (state.matchType === MatchType.Online && state.localPlayer !== player) return;
  const { next, ok, ended } = passTurn(state);
  if (!ok) return;
  setState(next, { recordHistory: !ended, clearHistory: ended });
}

function handleMove(from, to) {
  const { next, ok } = moveStone(state, from, to);
  if (!ok) return;
  setState(next, { recordHistory: true });
  logEvent(Events.StoneMoved, { from, to });
}

function handleScore() {
  logEvent(Events.ScoreRequested);
  const { next, ok, detail } = requestScore(state);
  if (!ok) return;
  setState(next, { clearHistory: true });
  logEvent(Events.ScoreComputed, detail);
}

function handleUndo() {
  if (!history.past.length) return;
  history.future.push(cloneStateSnapshot(state));
  const prev = history.past.pop();
  setState(prev);
}

function handleRedo() {
  if (!history.future.length) return;
  history.past.push(cloneStateSnapshot(state));
  const next = history.future.pop();
  setState(next);
}

setState(state);
void autoJoinFromUrl();

async function handleMatchStart() {
  if (state.matchType === MatchType.Online) {
    const code = (state.matchCode ?? []).join("");
    const hostState = enterSetup({
      ...state,
      matchType: MatchType.Online,
      localPlayer: Player.Black,
      isHost: true,
      hostId: clientId,
      players: [makePlayer(playerRoles.Black)],
    });
    const connected = await createOrJoinGame(state.matchCode ?? [], hostState);
    if (!connected) {
      updateUrlWithCode(null);
      writeStoredCode(null);
      return;
    }
    if (connected?.full) {
      window.alert("このルームは満員です。別のコードで試してください。");
      updateUrlWithCode(null);
      writeStoredCode(null);
      return;
    }
    if (connected?.created) {
      writeStoredCode(code);
      updateUrlWithCode(null);
      setState(hostState, { clearHistory: true, skipSync: true });
    } else if (connected?.data) {
      const roleKey = connected.role ?? getRoleForClient(connected.data.state?.players ?? []);
      const role = roleKey === playerRoles.White ? Player.White : Player.Black;
      const guestState = {
        ...state,
        matchType: MatchType.Online,
        localPlayer: role,
        isHost: connected.data.state?.hostId === clientId,
        hostId: connected.data.state?.hostId ?? null,
        players: connected.data.state?.players ?? [],
      };
      writeStoredCode(code);
      updateUrlWithCode(null);
      setState(guestState, { clearHistory: true, skipSync: true, isRemote: true });
      applyRemoteState(connected.data.state, { force: true });
    }
    if (connected) {
      await subscribeToGame(code);
      startPolling(code);
    }
    return;
  }
  updateUrlWithCode(null);
  writeStoredCode(null);
  stopPolling();
  setState(enterSetup(state), { clearHistory: true });
}

if (els.passBlackBtn) {
  els.passBlackBtn.addEventListener("click", () => handlePass(Player.Black));
}
if (els.passWhiteBtn) {
  els.passWhiteBtn.addEventListener("click", () => handlePass(Player.White));
}
if (els.leaveRoomBtn) {
  els.leaveRoomBtn.addEventListener("click", () => {
    void leaveRoom();
  });
}
