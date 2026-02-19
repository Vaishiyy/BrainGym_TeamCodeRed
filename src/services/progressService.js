function createProgressService(userRepository) {
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

  return {
    recordCompletion,
    getSummary
  };
}

module.exports = { createProgressService };
