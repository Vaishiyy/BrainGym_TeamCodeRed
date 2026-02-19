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
const TODAY_INDEX = (new Date().getDay() + 6) % 7; // Monday=0 ... Sunday=6

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
    label.textContent = `${series.gameName} (${series.scoreUnit || "points"})`;

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
  const width = 900;
  const height = 360;
  const padding = { top: 28, right: 20, bottom: 48, left: 52 };
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

  if (progressCopy) {
    progressCopy.textContent = `You have completed ${completedCount} workout${completedCount === 1 ? "" : "s"} this week.`;
  }
}

function markTodayCompleted() {
  const weeklyMap = loadWeeklyMap();
  weeklyMap[TODAY_INDEX] = true;
  saveWeeklyMap(weeklyMap);
  renderWeeklyMap();
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
    game.textContent = `${entry.gameName} (Stage ${entry.stage}/${entry.totalStages})`;

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
