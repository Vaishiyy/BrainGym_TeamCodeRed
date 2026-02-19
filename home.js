const storedUserRaw = localStorage.getItem("brainGymUser");
if (!storedUserRaw) {
  window.location.replace("login.html");
}

let storedUser = {};
try {
  storedUser = storedUserRaw ? JSON.parse(storedUserRaw) : {};
} catch (_error) {
  localStorage.removeItem("brainGymUser");
  window.location.replace("login.html");
}

const profile = storedUser.profile || {};
const displayName =
  profile.name ||
  profile.displayName ||
  (storedUser.email ? String(storedUser.email).split("@")[0] : "Player");

const userNameElement = document.getElementById("user-name");
const avatarElement = document.getElementById("avatar");
const accountContainer = avatarElement ? avatarElement.closest(".account") : null;
const signOutButton = document.getElementById("sign-out-btn");
const startWorkoutButton = document.getElementById("start-workout-btn");
const progressCopy = document.getElementById("map-hint");
const workoutHeatmap = document.getElementById("workout-heatmap");
const workoutMonths = document.getElementById("workout-months");
const navButtons = Array.from(document.querySelectorAll(".nav-btn"));
const relaxArrowButton = document.getElementById("relax-arrow-btn");
const backHomeButton = document.getElementById("back-home-btn");
const profileNameValue = document.getElementById("profile-name-value");
const profileEmailValue = document.getElementById("profile-email-value");
const profileDobValue = document.getElementById("profile-dob-value");
const editProfileForm = document.getElementById("edit-profile-form");
const editNameInput = document.getElementById("edit-name");
const editEmailInput = document.getElementById("edit-email");
const editDobInput = document.getElementById("edit-dob");
const editStatus = document.getElementById("edit-status");
const settingsForm = document.getElementById("settings-form");
const settingsEmailNotifications = document.getElementById("setting-email-notifications");
const settingsSoundEffects = document.getElementById("setting-sound-effects");
const settingsHighContrast = document.getElementById("setting-high-contrast");
const settingsStatus = document.getElementById("settings-status");
const goalForm = document.getElementById("goal-form");
const goalPeriodInput = document.getElementById("goal-period");
const goalDaysInput = document.getElementById("goal-days");
const goalTimesInput = document.getElementById("goal-times");
const goalStatus = document.getElementById("goal-status");
const goalPeriodLabel = document.getElementById("goal-period-label");
const goalAchievedDays = document.getElementById("goal-achieved-days");
const goalTargetDays = document.getElementById("goal-target-days");
const goalAchievedSessions = document.getElementById("goal-achieved-sessions");
const goalTargetSessions = document.getElementById("goal-target-sessions");
const goalDaysFill = document.getElementById("goal-days-fill");
const goalSessionsFill = document.getElementById("goal-sessions-fill");
const goalAchievementText = document.getElementById("goal-achievement-text");
const gamePage = document.querySelector(".game-page");
const gameNextButton = document.getElementById("game-next-btn");
const gameTimer = document.getElementById("game-timer");
const gameSaveStatus = document.getElementById("game-save-status");
const metricTotalGames = document.getElementById("metric-total-games");
const metricTotalScore = document.getElementById("metric-total-score");
const metricTotalTime = document.getElementById("metric-total-time");
const metricAverageTime = document.getElementById("metric-average-time");
const metricFastestTime = document.getElementById("metric-fastest-time");
const progressSummaryStatus = document.getElementById("progress-summary-status");
const recentCompletionsList = document.getElementById("recent-completions-list");
const progressHistorySection = document.querySelector(".progress-history");
const recentToggleButton = document.getElementById("recent-toggle-btn");
const scoreChart = document.getElementById("score-chart");
const scoreLegend = document.getElementById("score-legend");
const scoreGraphStatus = document.getElementById("score-graph-status");
let profileMenu = null;
let goalSettingsByPeriod = {
  week: { days: 5, timesPerDay: 1 },
  month: { days: 20, timesPerDay: 1 },
  year: { days: 240, timesPerDay: 1 }
};

const WEEKLY_MAP_KEY = "brainGymWeeklyMap";
const SETTINGS_KEY = "brainGymSettings";
const WORKOUT_SESSION_KEY = "brainGymWorkoutSession";
const GAME_START_KEY_PREFIX = "brainGymGameStart:";
const GAME_SCORE_KEY_PREFIX = "brainGymGameScore:";
const DEFAULT_SETTINGS = {
  emailNotifications: true,
  soundEffects: true,
  highContrast: false
};
const GAME_NAME_OVERRIDES = {
  "neon-rod-racer": "Reaction Game",
  "puzzle-progression": "Logic Puzzle",
  "golden-arrow": "Pattern Matching"
};

function getGameDisplayName(gameId, fallbackName) {
  const normalizedId = String(gameId || "").trim().toLowerCase();
  const normalizedName = String(fallbackName || "").trim().toLowerCase();

  if (GAME_NAME_OVERRIDES[normalizedId]) {
    return GAME_NAME_OVERRIDES[normalizedId];
  }

  if (normalizedName === "neon rod racer") {
    return "Reaction Game";
  }
  if (normalizedName === "puzzle progression") {
    return "Logic Puzzle";
  }
  if (normalizedName === "golden arrow" || normalizedName === "pattern tracking") {
    return "Pattern Matching";
  }

  return String(fallbackName || gameId || "Game");
}

function persistUser() {
  localStorage.setItem("brainGymUser", JSON.stringify(storedUser));
}

function getDisplayName() {
  const currentProfile = storedUser.profile || {};
  return (
    currentProfile.name ||
    currentProfile.displayName ||
    (storedUser.email ? String(storedUser.email).split("@")[0] : "Player")
  );
}

function getAvatarInitial() {
  return String(getDisplayName() || "U").trim().charAt(0).toUpperCase() || "U";
}

function getUserLookup() {
  const userId = String(storedUser._id || storedUser.id || "").trim();
  const email = String(storedUser.email || "").trim().toLowerCase();
  return { userId, email };
}

function formatClock(totalSeconds) {
  const safe = Math.max(0, Math.floor(Number(totalSeconds) || 0));
  const minutes = Math.floor(safe / 60)
    .toString()
    .padStart(2, "0");
  const seconds = (safe % 60).toString().padStart(2, "0");
  return `${minutes}:${seconds}`;
}

function formatDurationLabel(totalSeconds) {
  const safe = Math.max(0, Math.round(Number(totalSeconds) || 0));
  const hours = Math.floor(safe / 3600);
  const minutes = Math.floor((safe % 3600) / 60);
  const seconds = safe % 60;

  if (hours > 0) {
    return `${hours}h ${minutes}m ${seconds}s`;
  }
  if (minutes > 0) {
    return `${minutes}m ${seconds}s`;
  }
  return `${seconds}s`;
}

function clearGameStartMarkers() {
  const keys = Object.keys(sessionStorage).filter((key) => key.startsWith(GAME_START_KEY_PREFIX));
  keys.forEach((key) => sessionStorage.removeItem(key));
}

function clearGameScoreMarkers() {
  const keys = Object.keys(localStorage).filter((key) => key.startsWith(GAME_SCORE_KEY_PREFIX));
  keys.forEach((key) => localStorage.removeItem(key));
}

function createWorkoutSession() {
  const session = {
    sessionId: `session-${Date.now()}-${Math.random().toString(16).slice(2, 8)}`,
    startedAt: new Date().toISOString()
  };
  localStorage.setItem(WORKOUT_SESSION_KEY, JSON.stringify(session));
  return session;
}

function ensureWorkoutSession() {
  const raw = localStorage.getItem(WORKOUT_SESSION_KEY);
  if (raw) {
    try {
      const parsed = JSON.parse(raw);
      if (parsed && parsed.sessionId) {
        return parsed;
      }
    } catch (_error) {
      // ignore invalid session and create a new one
    }
  }

  return createWorkoutSession();
}

function getScoreStorageKey(gameId) {
  return `${GAME_SCORE_KEY_PREFIX}${gameId}`;
}

function getGameScoreSnapshot(gameId) {
  const raw = localStorage.getItem(getScoreStorageKey(gameId));
  if (!raw) {
    return {
      score: 0,
      scoreUnit: "points",
      label: "Score"
    };
  }

  try {
    const parsed = JSON.parse(raw);
    return {
      score: Math.max(0, Math.round(Number(parsed.score) || 0)),
      scoreUnit: String(parsed.scoreUnit || "points"),
      label: String(parsed.label || "Score")
    };
  } catch (_error) {
    return {
      score: 0,
      scoreUnit: "points",
      label: "Score"
    };
  }
}

function renderScoreLegend(seriesList, colorByGameId) {
  if (!scoreLegend) {
    return;
  }

  scoreLegend.innerHTML = "";
  seriesList.forEach((series) => {
    const item = document.createElement("span");
    item.className = "score-legend-item";

    const swatch = document.createElement("span");
    swatch.className = "score-legend-swatch";
    swatch.style.background = colorByGameId[series.gameId] || "#2c9ce0";

    const label = document.createElement("span");
    const displayName = getGameDisplayName(series.gameId, series.gameName);
    label.textContent = `${displayName} (${series.scoreUnit || "points"})`;

    item.append(swatch, label);
    scoreLegend.appendChild(item);
  });
}

function renderScoreGraph(seriesList) {
  if (!scoreChart) {
    return;
  }

  scoreChart.innerHTML = "";

  if (!Array.isArray(seriesList) || !seriesList.length) {
    if (scoreGraphStatus) {
      scoreGraphStatus.textContent = "No score history yet. Finish a game to generate graph data.";
      scoreGraphStatus.dataset.state = "";
    }
    if (scoreLegend) {
      scoreLegend.innerHTML = "";
    }
    return;
  }

  const svgNs = "http://www.w3.org/2000/svg";
  const width = 1400;
  const height = 620;
  const padding = { top: 42, right: 40, bottom: 76, left: 74 };
  scoreChart.setAttribute("viewBox", `0 0 ${width} ${height}`);
  const plotWidth = width - padding.left - padding.right;
  const plotHeight = height - padding.top - padding.bottom;
  const maxPlays = Math.max(
    2,
    ...seriesList.map((series) => (Array.isArray(series.points) ? series.points.length : 0))
  );
  const maxScore = Math.max(
    1,
    ...seriesList.flatMap((series) =>
      (series.points || []).map((point) => Math.max(0, Number(point.score) || 0))
    )
  );

  const palette = ["#58d0d5", "#42adc8", "#2e8eb7", "#506f9f", "#9350e8"];
  const colorByGameId = {};
  seriesList.forEach((series, index) => {
    colorByGameId[series.gameId] = palette[index % palette.length];
  });

  const toX = (attempt) => {
    const step = plotWidth / (maxPlays - 1);
    return padding.left + (attempt - 1) * step;
  };
  const toY = (score) => padding.top + (1 - score / maxScore) * plotHeight;

  const horizontalSteps = 5;
  for (let index = 0; index <= horizontalSteps; index += 1) {
    const scoreValue = Math.round((maxScore * index) / horizontalSteps);
    const y = toY(scoreValue);

    const grid = document.createElementNS(svgNs, "line");
    grid.setAttribute("x1", String(padding.left));
    grid.setAttribute("x2", String(width - padding.right));
    grid.setAttribute("y1", String(y));
    grid.setAttribute("y2", String(y));
    grid.setAttribute("stroke", "#d4d4d4");
    grid.setAttribute("stroke-width", "1");
    scoreChart.appendChild(grid);

    const label = document.createElementNS(svgNs, "text");
    label.setAttribute("x", String(padding.left - 10));
    label.setAttribute("y", String(y + 4));
    label.setAttribute("text-anchor", "end");
    label.setAttribute("font-size", "12");
    label.setAttribute("font-family", "Courier New, monospace");
    label.setAttribute("fill", "#333");
    label.textContent = String(scoreValue);
    scoreChart.appendChild(label);
  }

  for (let index = 1; index <= maxPlays; index += 1) {
    const x = toX(index);
    const label = document.createElementNS(svgNs, "text");
    label.setAttribute("x", String(x));
    label.setAttribute("y", String(height - 18));
    label.setAttribute("text-anchor", "middle");
    label.setAttribute("font-size", "12");
    label.setAttribute("font-family", "Courier New, monospace");
    label.setAttribute("fill", "#333");
    label.textContent = `Play ${index}`;
    scoreChart.appendChild(label);
  }

  seriesList.forEach((series) => {
    const points = Array.isArray(series.points) ? series.points : [];
    if (!points.length) {
      return;
    }

    const strokeColor = colorByGameId[series.gameId] || "#2c9ce0";
    const path = document.createElementNS(svgNs, "polyline");
    path.setAttribute(
      "points",
      points
        .map((point) => `${toX(Number(point.attempt) || 1)},${toY(Math.max(0, Number(point.score) || 0))}`)
        .join(" ")
    );
    path.setAttribute("fill", "none");
    path.setAttribute("stroke", strokeColor);
    path.setAttribute("stroke-width", "3");
    path.setAttribute("stroke-linecap", "round");
    path.setAttribute("stroke-linejoin", "round");
    scoreChart.appendChild(path);

    points.forEach((point) => {
      const dot = document.createElementNS(svgNs, "circle");
      dot.setAttribute("cx", String(toX(Number(point.attempt) || 1)));
      dot.setAttribute("cy", String(toY(Math.max(0, Number(point.score) || 0))));
      dot.setAttribute("r", "4");
      dot.setAttribute("fill", strokeColor);
      scoreChart.appendChild(dot);
    });
  });

  renderScoreLegend(seriesList, colorByGameId);

  if (scoreGraphStatus) {
    scoreGraphStatus.textContent = "Graph updates every time you finish a game and press next.";
    scoreGraphStatus.dataset.state = "success";
  }
}

function loadSettings() {
  const raw = localStorage.getItem(SETTINGS_KEY);
  if (!raw) {
    return { ...DEFAULT_SETTINGS };
  }

  try {
    const parsed = JSON.parse(raw);
    return {
      emailNotifications: Boolean(parsed.emailNotifications),
      soundEffects: Boolean(parsed.soundEffects),
      highContrast: Boolean(parsed.highContrast)
    };
  } catch (_error) {
    return { ...DEFAULT_SETTINGS };
  }
}

function saveSettings(value) {
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(value));
}

function applySettings(value) {
  document.body.classList.toggle("high-contrast", Boolean(value.highContrast));
}

function getGoalMaxDays(period) {
  const normalizedPeriod = String(period || "week").toLowerCase();
  if (normalizedPeriod === "week") {
    return 7;
  }
  if (normalizedPeriod === "month") {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
  }
  const year = new Date().getFullYear();
  const isLeapYear = (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
  return isLeapYear ? 366 : 365;
}

function normalizeGoalSettings(raw) {
  const normalizedPeriod = ["week", "month", "year"].includes(String(raw?.period || "").toLowerCase())
    ? String(raw.period).toLowerCase()
    : "week";
  const maxDays = getGoalMaxDays(normalizedPeriod);
  const days = Math.min(
    maxDays,
    Math.max(1, Number.parseInt(raw?.days || "5", 10) || 5)
  );
  const timesPerDay = Math.min(
    10,
    Math.max(1, Number.parseInt(raw?.timesPerDay || "1", 10) || 1)
  );

  return {
    period: normalizedPeriod,
    days,
    timesPerDay
  };
}

function getGoalSettingsForPeriod(period) {
  const normalizedPeriod = ["week", "month", "year"].includes(String(period || "").toLowerCase())
    ? String(period).toLowerCase()
    : "week";
  const entry = goalSettingsByPeriod[normalizedPeriod] || goalSettingsByPeriod.week;
  return normalizeGoalSettings({
    period: normalizedPeriod,
    days: entry.days,
    timesPerDay: entry.timesPerDay
  });
}

async function fetchGoalSettingsFromDatabase() {
  const { userId, email } = getUserLookup();
  if (!userId && !email) {
    return;
  }

  const params = new URLSearchParams();
  if (userId) {
    params.set("userId", userId);
  } else {
    params.set("email", email);
  }

  const response = await fetch(`/api/progress/goals?${params.toString()}`);
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(payload.error || "Unable to load saved goals.");
  }

  const goals = payload.goals?.goals || {};
  goalSettingsByPeriod = {
    week: normalizeGoalSettings({ period: "week", ...goals.week }),
    month: normalizeGoalSettings({ period: "month", ...goals.month }),
    year: normalizeGoalSettings({ period: "year", ...goals.year })
  };
}

async function saveGoalSettingToDatabase({ period, days, timesPerDay }) {
  const { userId, email } = getUserLookup();
  if (!userId && !email) {
    throw new Error("User information is required.");
  }

  const settings = normalizeGoalSettings({ period, days, timesPerDay });
  const response = await fetch("/api/progress/goals", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      userId,
      email,
      period: settings.period,
      days: settings.days,
      timesPerDay: settings.timesPerDay
    })
  });

  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(payload.error || "Unable to save goal.");
  }

  const goals = payload.goals?.goals || {};
  goalSettingsByPeriod = {
    week: normalizeGoalSettings({ period: "week", ...goals.week }),
    month: normalizeGoalSettings({ period: "month", ...goals.month }),
    year: normalizeGoalSettings({ period: "year", ...goals.year })
  };
  return getGoalSettingsForPeriod(settings.period);
}

function setGoalStatus(message, state = "") {
  if (!goalStatus) {
    return;
  }
  goalStatus.textContent = message;
  goalStatus.dataset.state = state;
}

function getPeriodLabel(period) {
  if (period === "month") {
    return "This Month";
  }
  if (period === "year") {
    return "This Year";
  }
  return "This Week";
}

function updateGoalDaysInputLimit(period) {
  if (!goalDaysInput) {
    return;
  }

  const maxDays = getGoalMaxDays(period);
  goalDaysInput.max = String(maxDays);
  const currentValue = Number.parseInt(goalDaysInput.value || "1", 10) || 1;
  if (currentValue > maxDays) {
    goalDaysInput.value = String(maxDays);
  }
}

function toPercent(numerator, denominator) {
  if (denominator <= 0) {
    return 0;
  }
  return Math.min(100, Math.round((numerator / denominator) * 100));
}

function loadWeeklyMap() {
  const raw = localStorage.getItem(WEEKLY_MAP_KEY);
  if (!raw) {
    return [false, false, false, false, false, false, false];
  }

  try {
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed) || parsed.length !== 7) {
      return [false, false, false, false, false, false, false];
    }
    return parsed.map((value) => Boolean(value));
  } catch (_error) {
    return [false, false, false, false, false, false, false];
  }
}

function saveWeeklyMap(value) {
  localStorage.setItem(WEEKLY_MAP_KEY, JSON.stringify(value));
}

function renderWeeklyMap() {
  const weeklyMap = loadWeeklyMap();
  let completedCount = 0;

  for (let index = 0; index < 7; index += 1) {
    const box = document.getElementById(`day-${index}`);
    if (!box) {
      continue;
    }

    if (weeklyMap[index]) {
      completedCount += 1;
      box.classList.add("done");
    } else {
      box.classList.remove("done");
    }
  }

  if (progressCopy && document.getElementById("weekly-map")) {
    progressCopy.textContent = `You have completed ${completedCount} workout${completedCount === 1 ? "" : "s"} this week.`;
  }
}

async function loadWeeklyMapFromDatabase() {
  if (!document.getElementById("weekly-map")) {
    return;
  }

  const { userId, email } = getUserLookup();
  if (!userId && !email) {
    return;
  }

  try {
    const params = new URLSearchParams();
    if (userId) {
      params.set("userId", userId);
    } else {
      params.set("email", email);
    }
    params.set("year", String(new Date().getFullYear()));

    const response = await fetch(`/api/progress/calendar?${params.toString()}`);
    const payload = await response.json().catch(() => ({}));
    if (!response.ok) {
      throw new Error(payload.error || "Unable to load weekly map.");
    }

    const dayCounts = Array.isArray(payload.calendar?.dayCounts) ? payload.calendar.dayCounts : [];
    const countMap = new Map(dayCounts.map((entry) => [entry.date, Number(entry.count) || 0]));
    const weekMap = [false, false, false, false, false, false, false];
    const mondayStart = getMondayStartUtc(new Date());

    for (let dayIndex = 0; dayIndex < 7; dayIndex += 1) {
      const key = toUtcDateKey(addDaysUtc(mondayStart, dayIndex));
      weekMap[dayIndex] = (countMap.get(key) || 0) > 0;
    }

    saveWeeklyMap(weekMap);
    renderWeeklyMap();
  } catch (_error) {
    renderWeeklyMap();
  }
}

function toUtcDateKey(date) {
  return date.toISOString().slice(0, 10);
}

function getMondayStartUtc(dateInput) {
  const date = new Date(dateInput);
  const day = (date.getUTCDay() + 6) % 7;
  const start = new Date(date);
  start.setUTCDate(start.getUTCDate() - day);
  start.setUTCHours(0, 0, 0, 0);
  return start;
}

function addDaysUtc(baseDate, days) {
  const date = new Date(baseDate);
  date.setUTCDate(date.getUTCDate() + days);
  return date;
}

function getHeatLevel(count) {
  if (count >= 6) {
    return 4;
  }
  if (count >= 4) {
    return 3;
  }
  if (count >= 2) {
    return 2;
  }
  if (count >= 1) {
    return 1;
  }
  return 0;
}

function renderWorkoutMap({ startDate, endDate, dayCounts }) {
  if (!workoutHeatmap || !workoutMonths) {
    return;
  }

  workoutHeatmap.innerHTML = "";
  workoutMonths.innerHTML = "";

  const rangeStart = new Date(startDate);
  const rangeEnd = new Date(endDate);
  const countsMap = new Map((dayCounts || []).map((entry) => [entry.date, Number(entry.count) || 0]));
  const gridStart = getMondayStartUtc(rangeStart);
  const gridEnd = addDaysUtc(getMondayStartUtc(addDaysUtc(rangeEnd, -1)), 7);
  const totalDays = Math.max(1, Math.round((gridEnd.getTime() - gridStart.getTime()) / 86400000));
  const totalWeeks = Math.ceil(totalDays / 7);

  workoutHeatmap.style.gridTemplateColumns = `repeat(${totalWeeks}, 13px)`;
  workoutMonths.style.gridTemplateColumns = `repeat(${totalWeeks}, 13px)`;

  let activeDayCount = 0;
  let totalCompletedGames = 0;

  for (let weekIndex = 0; weekIndex < totalWeeks; weekIndex += 1) {
    for (let row = 0; row < 7; row += 1) {
      const dayOffset = weekIndex * 7 + row;
      const date = addDaysUtc(gridStart, dayOffset);
      const dayKey = toUtcDateKey(date);
      const count = countsMap.get(dayKey) || 0;
      const level = getHeatLevel(count);
      const insideRange = date >= rangeStart && date < rangeEnd;

      if (insideRange && count > 0) {
        activeDayCount += 1;
        totalCompletedGames += count;
      }

      const cell = document.createElement("span");
      cell.className = `heat-cell level-${level}${insideRange ? "" : " outside"}`;
      const formattedDate = date.toLocaleDateString(undefined, {
        year: "numeric",
        month: "short",
        day: "numeric",
        timeZone: "UTC"
      });
      cell.title = `${formattedDate}: ${count} game${count === 1 ? "" : "s"} played`;
      workoutHeatmap.appendChild(cell);
    }
  }

  const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const monthCursor = new Date(Date.UTC(rangeStart.getUTCFullYear(), rangeStart.getUTCMonth(), 1));
  while (monthCursor < rangeEnd) {
    const monthStart = new Date(monthCursor);
    const weekIndex = Math.floor((monthStart.getTime() - gridStart.getTime()) / (7 * 86400000));
    const label = document.createElement("span");
    label.style.gridColumnStart = String(weekIndex + 1);
    label.textContent = monthNames[monthStart.getUTCMonth()];
    workoutMonths.appendChild(label);
    monthCursor.setUTCMonth(monthCursor.getUTCMonth() + 1);
  }

  if (progressCopy) {
    progressCopy.textContent = `${activeDayCount} active day${activeDayCount === 1 ? "" : "s"} this year, ${totalCompletedGames} total games completed.`;
  }
}

async function loadWorkoutMap() {
  if (!workoutHeatmap) {
    return;
  }

  const { userId, email } = getUserLookup();
  if (!userId && !email) {
    return;
  }

  const now = new Date();
  const rangeStart = new Date(Date.UTC(now.getUTCFullYear(), 0, 1));
  const rangeEnd = new Date(Date.UTC(now.getUTCFullYear() + 1, 0, 1));
  const years = [rangeStart.getUTCFullYear()];

  try {
    const responses = await Promise.all(
      years.map(async (year) => {
        const params = new URLSearchParams();
        if (userId) {
          params.set("userId", userId);
        } else {
          params.set("email", email);
        }
        params.set("year", String(year));
        const response = await fetch(`/api/progress/calendar?${params.toString()}`);
        const payload = await response.json().catch(() => ({}));
        if (!response.ok) {
          throw new Error(payload.error || "Unable to load workout map.");
        }
        const calendar = payload.calendar || {};
        return Array.isArray(calendar.dayCounts) ? calendar.dayCounts : [];
      })
    );

    const mergedDayCounts = responses.flat();
    renderWorkoutMap({
      startDate: rangeStart,
      endDate: rangeEnd,
      dayCounts: mergedDayCounts
    });
  } catch (_error) {
    if (progressCopy) {
    progressCopy.textContent = "Unable to load workout map right now.";
  }
}
}

function markTodayCompleted() {
  loadWeeklyMapFromDatabase();
  loadWorkoutMap();
}

function updateActiveNavLink() {
  const sectionLinks = navButtons
    .map((button) => ({ button, href: button.getAttribute("href") || "" }))
    .filter((entry) => entry.href.startsWith("#"));

  if (!sectionLinks.length) {
    return;
  }

  let activeHref = sectionLinks[0].href;

  sectionLinks.forEach(({ href }) => {
    const section = document.querySelector(href);
    if (!section) {
      return;
    }

    const bounds = section.getBoundingClientRect();
    if (bounds.top <= 140) {
      activeHref = href;
    }
  });

  sectionLinks.forEach(({ button, href }) => {
    if (href === activeHref) {
      button.classList.add("active");
    } else {
      button.classList.remove("active");
    }
  });
}

function closeProfileMenu() {
  if (profileMenu) {
    profileMenu.classList.remove("open");
  }
}

function formatDateForDisplay(rawDate) {
  const date = new Date(String(rawDate || ""));
  if (Number.isNaN(date.getTime())) {
    return "Not provided";
  }
  return date.toLocaleDateString();
}

function setupProfileMenu() {
  if (!accountContainer || !avatarElement) {
    return;
  }

  profileMenu = document.createElement("div");
  profileMenu.className = "profile-menu";
  profileMenu.innerHTML = `
    <button class="profile-item" data-action="profile" type="button">My Profile</button>
    <button class="profile-item" data-action="edit" type="button">Edit Profile</button>
    <button class="profile-item" data-action="settings" type="button">Settings</button>
  `;

  accountContainer.appendChild(profileMenu);

  avatarElement.setAttribute("role", "button");
  avatarElement.setAttribute("tabindex", "0");
  avatarElement.setAttribute("aria-label", "Open profile menu");

  const toggleProfileMenu = () => {
    profileMenu.classList.toggle("open");
  };

  avatarElement.addEventListener("click", toggleProfileMenu);
  avatarElement.addEventListener("keydown", (event) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      toggleProfileMenu();
    }
  });

  document.addEventListener("click", (event) => {
    const clickedInsideAccount = accountContainer.contains(event.target);
    if (!clickedInsideAccount) {
      closeProfileMenu();
    }
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      closeProfileMenu();
    }
  });

  profileMenu.querySelectorAll(".profile-item").forEach((item) => {
    item.addEventListener("click", () => {
      const action = item.getAttribute("data-action");
      if (action === "profile") {
        window.location.href = "profile.html";
      } else if (action === "edit") {
        window.location.href = "edit-profile.html";
      } else if (action === "settings") {
        window.location.href = "settings.html";
      }
    });
  });
}

function setupRecentCompletionsToggle() {
  if (!progressHistorySection || !recentToggleButton) {
    return;
  }

  const syncState = () => {
    const isCollapsed = progressHistorySection.classList.contains("collapsed");
    recentToggleButton.textContent = isCollapsed ? "▼" : "▲";
    recentToggleButton.setAttribute("aria-expanded", isCollapsed ? "false" : "true");
    recentToggleButton.setAttribute(
      "aria-label",
      isCollapsed ? "Expand recent completions" : "Collapse recent completions"
    );
  };

  syncState();
  recentToggleButton.addEventListener("click", () => {
    progressHistorySection.classList.toggle("collapsed");
    syncState();
  });
}

function setGameSaveStatus(message, state = "") {
  if (!gameSaveStatus) {
    return;
  }
  gameSaveStatus.textContent = message;
  gameSaveStatus.dataset.state = state;
}

function setupGameProgressTracking() {
  if (!gamePage || !gameNextButton) {
    return;
  }

  const gameId = String(gamePage.dataset.gameId || "").trim();
  const gameName = String(gamePage.dataset.gameName || "").trim();
  const stage = Number.parseInt(gamePage.dataset.stage || "0", 10);
  const totalStages = Number.parseInt(gamePage.dataset.totalStages || "0", 10);

  if (!gameId || !gameName || !stage || !totalStages) {
    return;
  }

  const startStorageKey = `${GAME_START_KEY_PREFIX}${gameId}`;
  const existingStart = sessionStorage.getItem(startStorageKey);
  const startDate = new Date(existingStart || new Date().toISOString());
  const startedAt = Number.isNaN(startDate.getTime()) ? new Date() : startDate;

  if (!existingStart || Number.isNaN(startDate.getTime())) {
    sessionStorage.setItem(startStorageKey, startedAt.toISOString());
  }

  if (gameTimer) {
    const updateTimer = () => {
      const elapsedSeconds = Math.floor((Date.now() - startedAt.getTime()) / 1000);
      gameTimer.textContent = `Time: ${formatClock(elapsedSeconds)}`;
    };

    updateTimer();
    window.setInterval(updateTimer, 1000);
  }

  const targetHref = String(gameNextButton.getAttribute("href") || "home.html");
  gameNextButton.addEventListener("click", async (event) => {
    event.preventDefault();

    if (gameNextButton.dataset.state === "saving") {
      return;
    }

    const { userId, email } = getUserLookup();
    if (!userId && !email) {
      window.location.href = "login.html";
      return;
    }

    gameNextButton.dataset.state = "saving";
    gameNextButton.classList.add("disabled");
    const scoreSnapshot = getGameScoreSnapshot(gameId);
    setGameSaveStatus(`Saving time and ${scoreSnapshot.label.toLowerCase()}...`);

    const completedAt = new Date();
    const elapsedSeconds = Math.max(1, Math.round((completedAt.getTime() - startedAt.getTime()) / 1000));
    const session = ensureWorkoutSession();

    try {
      const response = await fetch("/api/progress/game-complete", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          userId,
          email,
          sessionId: session.sessionId,
          gameId,
          gameName,
          stage,
          totalStages,
          startedAt: startedAt.toISOString(),
          completedAt: completedAt.toISOString(),
          durationSeconds: elapsedSeconds,
          score: scoreSnapshot.score,
          scoreUnit: scoreSnapshot.scoreUnit
        })
      });

      const payload = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(payload.error || "Unable to save completion time.");
      }

      sessionStorage.removeItem(startStorageKey);
      markTodayCompleted();

      if (stage >= totalStages) {
        localStorage.removeItem(WORKOUT_SESSION_KEY);
        clearGameStartMarkers();
      }

      setGameSaveStatus(
        `Saved (${scoreSnapshot.label}: ${scoreSnapshot.score}). Loading next page...`,
        "success"
      );
      window.setTimeout(() => {
        window.location.href = targetHref;
      }, 120);
    } catch (error) {
      gameNextButton.dataset.state = "";
      gameNextButton.classList.remove("disabled");
      setGameSaveStatus(error.message || "Could not save progress. Please try again.", "error");
    }
  });
}

function renderRecentCompletions(entries) {
  if (!recentCompletionsList) {
    return;
  }

  recentCompletionsList.innerHTML = "";
  if (!entries.length) {
    const emptyState = document.createElement("p");
    emptyState.className = "recent-empty";
    emptyState.textContent = "No completed games yet. Start a workout to see your times here.";
    recentCompletionsList.appendChild(emptyState);
    return;
  }

  entries.forEach((entry) => {
    const item = document.createElement("div");
    item.className = "recent-item";

    const game = document.createElement("p");
    game.className = "recent-game";
    const displayName = getGameDisplayName(entry.gameId, entry.gameName);
    game.textContent = `${displayName} (Stage ${entry.stage}/${entry.totalStages})`;

    const detail = document.createElement("p");
    detail.className = "recent-detail";
    const completedAt = new Date(entry.completedAt);
    const when = Number.isNaN(completedAt.getTime()) ? "" : completedAt.toLocaleString();
    const scoreText = `${Math.max(0, Number(entry.score) || 0)} ${entry.scoreUnit || "points"}`;
    detail.textContent = `${scoreText} - ${formatDurationLabel(entry.durationSeconds)}${when ? ` - ${when}` : ""}`;

    item.append(game, detail);
    recentCompletionsList.appendChild(item);
  });
}

async function loadProgressSummary() {
  if (!metricTotalGames || !metricTotalTime || !metricAverageTime || !metricFastestTime) {
    return;
  }

  const { userId, email } = getUserLookup();
  if (!userId && !email) {
    return;
  }

  if (progressSummaryStatus) {
    progressSummaryStatus.textContent = "Loading progress...";
    progressSummaryStatus.dataset.state = "";
  }

  const params = new URLSearchParams();
  if (userId) {
    params.set("userId", userId);
  } else {
    params.set("email", email);
  }

  try {
    const response = await fetch(`/api/progress/summary?${params.toString()}`);
    const payload = await response.json().catch(() => ({}));
    if (!response.ok) {
      throw new Error(payload.error || "Unable to load progress.");
    }

    const summary = payload.summary || {};
    metricTotalGames.textContent = String(summary.totalGamesCompleted || 0);
    if (metricTotalScore) {
      metricTotalScore.textContent = String(summary.totalScore || 0);
    }
    metricTotalTime.textContent = formatDurationLabel(summary.totalWorkoutTimeSeconds || 0);
    metricAverageTime.textContent = formatDurationLabel(summary.averageCompletionSeconds || 0);
    metricFastestTime.textContent = formatDurationLabel(summary.fastestCompletionSeconds || 0);
    renderRecentCompletions(summary.recentCompletions || []);
    renderScoreGraph(summary.scoreTrends || []);

    if (progressSummaryStatus) {
      progressSummaryStatus.textContent = `Sessions completed: ${summary.sessionsPlayed || 0}`;
      progressSummaryStatus.dataset.state = "success";
    }
  } catch (error) {
    if (progressSummaryStatus) {
      progressSummaryStatus.textContent = error.message || "Unable to load progress right now.";
      progressSummaryStatus.dataset.state = "error";
    }
    if (scoreGraphStatus) {
      scoreGraphStatus.textContent = "Unable to load score graph right now.";
      scoreGraphStatus.dataset.state = "error";
    }
  }
}

async function loadGoalProgress(goalSettings) {
  if (
    !goalPeriodLabel ||
    !goalAchievedDays ||
    !goalTargetDays ||
    !goalAchievedSessions ||
    !goalTargetSessions ||
    !goalDaysFill ||
    !goalSessionsFill ||
    !goalAchievementText
  ) {
    return;
  }

  const settings = normalizeGoalSettings(goalSettings || getGoalSettingsForPeriod("week"));
  const targetDays = settings.days;
  const targetSessions = settings.days * settings.timesPerDay;

  goalPeriodLabel.textContent = getPeriodLabel(settings.period);
  goalTargetDays.textContent = String(targetDays);
  goalTargetSessions.textContent = String(targetSessions);

  const { userId, email } = getUserLookup();
  if (!userId && !email) {
    setGoalStatus("Please log in again to load goal progress.", "error");
    return;
  }

  setGoalStatus("Loading goal progress...");

  const params = new URLSearchParams();
  if (userId) {
    params.set("userId", userId);
  } else {
    params.set("email", email);
  }
  params.set("period", settings.period);

  try {
    const response = await fetch(`/api/progress/goal-progress?${params.toString()}`);
    const payload = await response.json().catch(() => ({}));
    if (!response.ok) {
      throw new Error(payload.error || "Unable to load goal progress.");
    }

    const progress = payload.goalProgress || {};
    const achievedDays = Number(progress.achievedDays) || 0;
    const achievedSessions = Number(progress.achievedSessions) || 0;

    goalAchievedDays.textContent = String(achievedDays);
    goalAchievedSessions.textContent = String(achievedSessions);

    const dayProgressPercent = toPercent(achievedDays, targetDays);
    const sessionProgressPercent = toPercent(achievedSessions, targetSessions);
    const overallPercent = Math.round((dayProgressPercent + sessionProgressPercent) / 2);

    goalDaysFill.style.width = `${dayProgressPercent}%`;
    goalSessionsFill.style.width = `${sessionProgressPercent}%`;
    goalAchievementText.textContent = `You have achieved ${overallPercent}% of your goal (${dayProgressPercent}% days, ${sessionProgressPercent}% sessions).`;
    setGoalStatus("Goal progress updated.", "success");
  } catch (error) {
    setGoalStatus(error.message || "Unable to load goal progress right now.", "error");
  }
}

async function setupGoalForm() {
  if (!goalForm || !goalPeriodInput || !goalDaysInput || !goalTimesInput) {
    return;
  }

  try {
    setGoalStatus("Loading saved goals...");
    await fetchGoalSettingsFromDatabase();
  } catch (error) {
    setGoalStatus(error.message || "Unable to load saved goals. Using defaults.", "error");
  }

  const applyPeriodToForm = (period) => {
    const settings = getGoalSettingsForPeriod(period);
    goalPeriodInput.value = settings.period;
    updateGoalDaysInputLimit(settings.period);
    goalDaysInput.value = String(settings.days);
    goalTimesInput.value = String(settings.timesPerDay);
    return settings;
  };

  const initialSettings = applyPeriodToForm(goalPeriodInput.value || "week");
  loadGoalProgress(initialSettings);

  goalPeriodInput.addEventListener("change", () => {
    const settings = applyPeriodToForm(goalPeriodInput.value);
    loadGoalProgress(settings);
  });

  goalForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const draftSettings = normalizeGoalSettings({
      period: goalPeriodInput.value,
      days: goalDaysInput.value,
      timesPerDay: goalTimesInput.value
    });

    try {
      setGoalStatus("Saving goal...");
      const savedSettings = await saveGoalSettingToDatabase(draftSettings);
      goalPeriodInput.value = savedSettings.period;
      updateGoalDaysInputLimit(savedSettings.period);
      goalDaysInput.value = String(savedSettings.days);
      goalTimesInput.value = String(savedSettings.timesPerDay);
      setGoalStatus("Goal saved to database.", "success");
      loadGoalProgress(savedSettings);
    } catch (error) {
      setGoalStatus(error.message || "Unable to save goal.", "error");
    }
  });
}

if (userNameElement) {
  userNameElement.textContent = getDisplayName();
}

if (avatarElement) {
  avatarElement.textContent = getAvatarInitial();
}

if (profileNameValue) {
  profileNameValue.textContent = getDisplayName();
}

if (profileEmailValue) {
  profileEmailValue.textContent = storedUser.email || "Not provided";
}

if (profileDobValue) {
  profileDobValue.textContent = formatDateForDisplay(profile.dateOfBirth);
}

if (editProfileForm && editNameInput && editEmailInput && editDobInput) {
  editNameInput.value = profile.name || profile.displayName || "";
  editEmailInput.value = storedUser.email || "";
  editDobInput.value = profile.dateOfBirth || "";

  editProfileForm.addEventListener("submit", (event) => {
    event.preventDefault();

    const nextName = String(editNameInput.value || "").trim();
    const nextEmail = String(editEmailInput.value || "").trim().toLowerCase();
    const nextDob = String(editDobInput.value || "").trim();

    if (!nextName || !nextEmail || !nextDob) {
      if (editStatus) {
        editStatus.textContent = "Please fill all fields before saving.";
      }
      return;
    }

    if (!nextEmail.includes("@")) {
      if (editStatus) {
        editStatus.textContent = "Please enter a valid email address.";
      }
      return;
    }

    storedUser.email = nextEmail;
    storedUser.profile = {
      ...(storedUser.profile || {}),
      name: nextName,
      dateOfBirth: nextDob
    };
    persistUser();

    if (editStatus) {
      editStatus.textContent = "Profile updated successfully.";
    }
  });
}

const currentSettings = loadSettings();
applySettings(currentSettings);

if (settingsForm && settingsEmailNotifications && settingsSoundEffects && settingsHighContrast) {
  settingsEmailNotifications.checked = currentSettings.emailNotifications;
  settingsSoundEffects.checked = currentSettings.soundEffects;
  settingsHighContrast.checked = currentSettings.highContrast;

  settingsForm.addEventListener("submit", (event) => {
    event.preventDefault();
    const nextSettings = {
      emailNotifications: settingsEmailNotifications.checked,
      soundEffects: settingsSoundEffects.checked,
      highContrast: settingsHighContrast.checked
    };

    saveSettings(nextSettings);
    applySettings(nextSettings);

    if (settingsStatus) {
      settingsStatus.textContent = "Settings saved.";
    }
  });
}

setupProfileMenu();
setupGoalForm();
setupRecentCompletionsToggle();
setupGameProgressTracking();

if (signOutButton) {
  signOutButton.addEventListener("click", () => {
    localStorage.removeItem("brainGymUser");
    localStorage.removeItem(WORKOUT_SESSION_KEY);
    clearGameScoreMarkers();
    clearGameStartMarkers();
    window.location.href = "login.html";
  });
}

if (startWorkoutButton) {
  startWorkoutButton.addEventListener("click", () => {
    localStorage.removeItem(WORKOUT_SESSION_KEY);
    clearGameScoreMarkers();
    clearGameStartMarkers();
    createWorkoutSession();
    window.location.href = "play-memory.html";
  });
}

navButtons.forEach((button) => {
  button.addEventListener("click", () => {
    const href = button.getAttribute("href") || "";
    if (href.startsWith("#")) {
      navButtons.forEach((item) => item.classList.remove("active"));
      button.classList.add("active");
    }
  });
});

window.addEventListener("scroll", updateActiveNavLink, { passive: true });

renderWeeklyMap();
loadWeeklyMapFromDatabase();
loadWorkoutMap();
updateActiveNavLink();
loadProgressSummary();

if (relaxArrowButton) {
  relaxArrowButton.addEventListener("click", () => {
    window.scrollTo({ top: document.body.scrollHeight, behavior: "smooth" });

    setTimeout(() => {
      document.body.classList.add("page-transition-out");
      setTimeout(() => {
        window.location.href = "relax-games.html";
      }, 260);
    }, 260);
  });
}

if (backHomeButton) {
  backHomeButton.addEventListener("click", () => {
    document.body.classList.add("page-transition-up");
    setTimeout(() => {
      window.location.href = "home.html";
    }, 260);
  });
}
