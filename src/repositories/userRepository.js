const { ObjectId } = require("mongodb");

function createUserRepository(db) {
  const users = db.collection("users");
  const loginEvents = db.collection("login_events");
  const gameProgressEvents = db.collection("game_progress_events");

  function toObjectId(value) {
    if (!value) {
      return null;
    }

    try {
      return new ObjectId(String(value));
    } catch (_error) {
      return null;
    }
  }

  async function findUserByLookup({ userId, email }, { includePasswordHash = false } = {}) {
    const projection = includePasswordHash ? {} : { passwordHash: 0 };
    const objectId = toObjectId(userId);

    if (objectId) {
      const userById = await users.findOne({ _id: objectId }, { projection });
      if (userById) {
        return userById;
      }
    }

    const normalizedEmail = String(email || "").trim().toLowerCase();
    if (normalizedEmail) {
      return users.findOne({ email: normalizedEmail }, { projection });
    }

    return null;
  }

  async function findUserByEmail(email, { includePasswordHash = false } = {}) {
    const projection = includePasswordHash ? {} : { passwordHash: 0 };
    return users.findOne({ email }, { projection });
  }

  async function createUser({ email, passwordHash, name, dateOfBirth }) {
    const now = new Date();
    const insertResult = await users.insertOne({
      email,
      passwordHash,
      profile: {
        name,
        dateOfBirth
      },
      gameplay: {
        bestScore: 0,
        totalScore: 0,
        sessionsPlayed: 0,
        scoreHistory: [],
        lastPlayedAt: null,
        totalGamesCompleted: 0,
        totalWorkoutTimeSeconds: 0,
        fastestCompletionSeconds: null,
        lastWorkoutCompletedAt: null,
        gameStats: {}
      },
      activity: {
        createdAt: now,
        updatedAt: now,
        lastLoginAt: null
      }
    });

    return users.findOne({ _id: insertResult.insertedId }, { projection: { passwordHash: 0 } });
  }

  async function recordLogin({ userId, email }) {
    const now = new Date();
    await users.updateOne(
      { _id: userId },
      {
        $set: {
          "activity.updatedAt": now,
          "activity.lastLoginAt": now
        }
      }
    );
    await loginEvents.insertOne({
      userId,
      email,
      createdAt: now
    });
  }

  async function recordGameCompletion({
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
  }) {
    const user = await findUserByLookup({ userId, email }, { includePasswordHash: true });
    if (!user) {
      throw new Error("User not found.");
    }

    const safeDurationSeconds = Math.max(1, Math.round(Number(durationSeconds) || 0));
    const safeScore = Math.max(0, Math.round(Number(score) || 0));
    const safeScoreUnit = String(scoreUnit || "points").trim() || "points";
    const previousGameplay = user.gameplay || {};
    const previousGameStats = previousGameplay.gameStats || {};
    const previousPerGame = previousGameStats[gameId] || {};
    const previousTotalWorkoutTime = Number(previousGameplay.totalWorkoutTimeSeconds) || 0;
    const previousTotalGamesCompleted = Number(previousGameplay.totalGamesCompleted) || 0;
    const previousSessionsPlayed = Number(previousGameplay.sessionsPlayed) || 0;
    const previousFastest = Number(previousGameplay.fastestCompletionSeconds);
    const previousTotalScore = Number(previousGameplay.totalScore) || 0;
    const previousBestScore = Number(previousGameplay.bestScore) || 0;
    const previousPerGameTotalScore = Number(previousPerGame.totalScore) || 0;
    const previousPerGameBestScore = Number(previousPerGame.bestScore) || 0;
    const nextTimesPlayed = (Number(previousPerGame.timesPlayed) || 0) + 1;
    const nextPerGameTotalScore = previousPerGameTotalScore + safeScore;
    const nextPerGameBestScore = Math.max(previousPerGameBestScore, safeScore);

    const nextGameStats = {
      gameId,
      gameName,
      scoreUnit: safeScoreUnit,
      timesPlayed: nextTimesPlayed,
      totalTimeSeconds: (Number(previousPerGame.totalTimeSeconds) || 0) + safeDurationSeconds,
      bestTimeSeconds:
        Number(previousPerGame.bestTimeSeconds) > 0
          ? Math.min(Number(previousPerGame.bestTimeSeconds), safeDurationSeconds)
          : safeDurationSeconds,
      lastDurationSeconds: safeDurationSeconds,
      totalScore: nextPerGameTotalScore,
      bestScore: nextPerGameBestScore,
      averageScore: Number((nextPerGameTotalScore / nextTimesPlayed).toFixed(1)),
      lastScore: safeScore,
      lastPlayedAt: completedAt
    };

    const nextTotalWorkoutTime = previousTotalWorkoutTime + safeDurationSeconds;
    const nextTotalGamesCompleted = previousTotalGamesCompleted + 1;
    const nextTotalScore = previousTotalScore + safeScore;
    const nextBestScore = Math.max(previousBestScore, safeScore);
    const nextFastestCompletion =
      previousFastest > 0 ? Math.min(previousFastest, safeDurationSeconds) : safeDurationSeconds;
    const workoutFinished = Number(stage) === Number(totalStages);
    const now = new Date();

    await users.updateOne(
      { _id: user._id },
      {
        $set: {
          "activity.updatedAt": now,
          "gameplay.lastPlayedAt": completedAt,
          "gameplay.totalWorkoutTimeSeconds": nextTotalWorkoutTime,
          "gameplay.totalGamesCompleted": nextTotalGamesCompleted,
          "gameplay.totalScore": nextTotalScore,
          "gameplay.bestScore": nextBestScore,
          "gameplay.fastestCompletionSeconds": nextFastestCompletion,
          ...(workoutFinished
            ? {
                "gameplay.sessionsPlayed": previousSessionsPlayed + 1,
                "gameplay.lastWorkoutCompletedAt": completedAt
              }
            : {}),
          [`gameplay.gameStats.${gameId}`]: nextGameStats
        }
      }
    );

    const insertResult = await gameProgressEvents.insertOne({
      userId: user._id,
      email: user.email,
      gameId,
      gameName,
      score: safeScore,
      scoreUnit: safeScoreUnit,
      durationSeconds: safeDurationSeconds,
      startedAt,
      completedAt,
      sessionId: sessionId || null,
      stage,
      totalStages,
      createdAt: now
    });

    return {
      eventId: insertResult.insertedId.toString(),
      userId: user._id.toString(),
      email: user.email,
      gameId,
      gameName,
      score: safeScore,
      scoreUnit: safeScoreUnit,
      durationSeconds: safeDurationSeconds,
      startedAt,
      completedAt,
      stage,
      totalStages
    };
  }

  async function getProgressSummary({ userId, email }) {
    const user = await findUserByLookup({ userId, email });
    if (!user) {
      throw new Error("User not found.");
    }

    const gameplay = user.gameplay || {};
    const totalGamesCompleted = Number(gameplay.totalGamesCompleted) || 0;
    const totalWorkoutTimeSeconds = Number(gameplay.totalWorkoutTimeSeconds) || 0;
    const averageCompletionSeconds =
      totalGamesCompleted > 0
        ? Number((totalWorkoutTimeSeconds / totalGamesCompleted).toFixed(1))
        : 0;

    const recentCompletions = await gameProgressEvents
      .find({ userId: user._id })
      .sort({ completedAt: -1 })
      .limit(15)
      .toArray();

    const gameStats = Object.values(gameplay.gameStats || {})
      .map((entry) => ({
        gameId: entry.gameId,
        gameName: entry.gameName,
        scoreUnit: entry.scoreUnit || "points",
        timesPlayed: Number(entry.timesPlayed) || 0,
        totalScore: Number(entry.totalScore) || 0,
        bestScore: Number(entry.bestScore) || 0,
        averageScore: Number(entry.averageScore) || 0,
        lastScore: Number(entry.lastScore) || 0,
        totalTimeSeconds: Number(entry.totalTimeSeconds) || 0,
        bestTimeSeconds: Number(entry.bestTimeSeconds) || 0,
        lastDurationSeconds: Number(entry.lastDurationSeconds) || 0,
        lastPlayedAt: entry.lastPlayedAt || null
      }))
      .sort((a, b) => b.timesPlayed - a.timesPlayed);

    const trendEvents = await gameProgressEvents
      .find({ userId: user._id })
      .sort({ completedAt: 1, _id: 1 })
      .limit(500)
      .toArray();

    const trendMap = new Map();
    trendEvents.forEach((entry) => {
      const key = String(entry.gameId || "");
      if (!key) {
        return;
      }

      if (!trendMap.has(key)) {
        trendMap.set(key, {
          gameId: key,
          gameName: entry.gameName || key,
          scoreUnit: entry.scoreUnit || "points",
          points: []
        });
      }

      const series = trendMap.get(key);
      series.points.push({
        attempt: series.points.length + 1,
        score: Number(entry.score) || 0,
        completedAt: entry.completedAt || null
      });
    });

    return {
      userId: user._id.toString(),
      email: user.email,
      sessionsPlayed: Number(gameplay.sessionsPlayed) || 0,
      totalGamesCompleted,
      totalScore: Number(gameplay.totalScore) || 0,
      bestScore: Number(gameplay.bestScore) || 0,
      totalWorkoutTimeSeconds,
      averageCompletionSeconds,
      fastestCompletionSeconds: Number(gameplay.fastestCompletionSeconds) || 0,
      lastPlayedAt: gameplay.lastPlayedAt || null,
      gameStats,
      scoreTrends: Array.from(trendMap.values()),
      recentCompletions: recentCompletions.map((entry) => ({
        eventId: entry._id.toString(),
        gameId: entry.gameId,
        gameName: entry.gameName,
        score: Number(entry.score) || 0,
        scoreUnit: entry.scoreUnit || "points",
        durationSeconds: Number(entry.durationSeconds) || 0,
        startedAt: entry.startedAt || null,
        completedAt: entry.completedAt || null,
        stage: Number(entry.stage) || 0,
        totalStages: Number(entry.totalStages) || 0
      }))
    };
  }

  return {
    findUserByEmail,
    createUser,
    recordLogin,
    recordGameCompletion,
    getProgressSummary
  };
}

module.exports = { createUserRepository };
