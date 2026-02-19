function createProgressService(userRepository) {
  const VALID_PERIODS = new Set(["week", "month", "year"]);

  function parseDate(input, label) {
    const value = new Date(String(input || ""));
    if (Number.isNaN(value.getTime())) {
      throw new Error(`${label} is invalid.`);
    }
    return value;
  }

  function parsePositiveInt(input, label) {
    const value = Number(input);
    if (!Number.isInteger(value) || value <= 0) {
      throw new Error(`${label} must be a positive number.`);
    }
    return value;
  }

  function parseScore(input) {
    const value = Number(input);
    if (!Number.isFinite(value)) {
      return 0;
    }
    return Math.max(0, Math.round(value));
  }

  function parsePeriod(input) {
    const period = String(input || "week").trim().toLowerCase();
    if (!VALID_PERIODS.has(period)) {
      throw new Error("Period must be week, month, or year.");
    }
    return period;
  }

  function getPeriodBounds(periodInput) {
    const normalizedPeriod = parsePeriod(periodInput);

    const now = new Date();
    const start = new Date(now);
    start.setHours(0, 0, 0, 0);

    if (normalizedPeriod === "week") {
      const mondayOffset = (start.getDay() + 6) % 7;
      start.setDate(start.getDate() - mondayOffset);
    } else if (normalizedPeriod === "month") {
      start.setDate(1);
    } else {
      start.setMonth(0, 1);
    }

    const end = new Date(start);
    if (normalizedPeriod === "week") {
      end.setDate(end.getDate() + 7);
    } else if (normalizedPeriod === "month") {
      end.setMonth(end.getMonth() + 1);
    } else {
      end.setFullYear(end.getFullYear() + 1);
    }

    return {
      period: normalizedPeriod,
      startDate: start,
      endDate: end
    };
  }

  async function recordCompletion(payload) {
    const gameId = String(payload.gameId || "").trim();
    const gameName = String(payload.gameName || "").trim();
    const sessionId = String(payload.sessionId || "").trim();
    const userId = String(payload.userId || "").trim();
    const email = String(payload.email || "").trim().toLowerCase();

    if (!userId && !email) {
      throw new Error("User information is required.");
    }

    if (!gameId || !gameName) {
      throw new Error("Game information is required.");
    }

    const startedAt = parseDate(payload.startedAt, "Start time");
    const completedAt = parseDate(payload.completedAt, "Completion time");
    if (completedAt <= startedAt) {
      throw new Error("Completion time must be after start time.");
    }

    const stage = parsePositiveInt(payload.stage, "Stage");
    const totalStages = parsePositiveInt(payload.totalStages, "Total stages");
    if (stage > totalStages) {
      throw new Error("Stage cannot be greater than total stages.");
    }

    let durationSeconds = Number(payload.durationSeconds);
    if (!Number.isFinite(durationSeconds) || durationSeconds <= 0) {
      durationSeconds = (completedAt.getTime() - startedAt.getTime()) / 1000;
    }

    const score = parseScore(payload.score);
    const scoreUnit = String(payload.scoreUnit || "points").trim() || "points";

    return userRepository.recordGameCompletion({
      userId,
      email,
      gameId,
      gameName,
      score,
      scoreUnit,
      durationSeconds,
      startedAt,
      completedAt,
      sessionId,
      stage,
      totalStages
    });
  }

  async function getSummary(query) {
    const userId = String(query.userId || "").trim();
    const email = String(query.email || "").trim().toLowerCase();

    if (!userId && !email) {
      throw new Error("User information is required.");
    }

    return userRepository.getProgressSummary({ userId, email });
  }

  async function getGoalProgress(query) {
    const userId = String(query.userId || "").trim();
    const email = String(query.email || "").trim().toLowerCase();

    if (!userId && !email) {
      throw new Error("User information is required.");
    }

    const { period, startDate, endDate } = getPeriodBounds(query.period);
    return userRepository.getGoalProgress({
      userId,
      email,
      period,
      startDate,
      endDate
    });
  }

  async function getGoalSettings(query) {
    const userId = String(query.userId || "").trim();
    const email = String(query.email || "").trim().toLowerCase();

    if (!userId && !email) {
      throw new Error("User information is required.");
    }

    return userRepository.getGoalSettings({ userId, email });
  }

  async function saveGoalSetting(payload) {
    const userId = String(payload.userId || "").trim();
    const email = String(payload.email || "").trim().toLowerCase();

    if (!userId && !email) {
      throw new Error("User information is required.");
    }

    const period = parsePeriod(payload.period);
    const days = parsePositiveInt(payload.days, "Days");
    const timesPerDay = parsePositiveInt(payload.timesPerDay, "Times per day");

    return userRepository.saveGoalSetting({
      userId,
      email,
      period,
      days,
      timesPerDay
    });
  }

  async function getWorkoutCalendar(query) {
    const userId = String(query.userId || "").trim();
    const email = String(query.email || "").trim().toLowerCase();

    if (!userId && !email) {
      throw new Error("User information is required.");
    }

    const yearInput = query.year;
    return userRepository.getWorkoutCalendar({
      userId,
      email,
      year: yearInput
    });
  }

  return {
    recordCompletion,
    getSummary,
    getGoalSettings,
    saveGoalSetting,
    getGoalProgress,
    getWorkoutCalendar
  };
}

module.exports = { createProgressService };
