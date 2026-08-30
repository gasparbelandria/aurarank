import type { RankingEntry } from "../types";
import { MOCK_USERS } from "./users";

const makeEntry = (
  rank: number,
  userIdx: number,
  movement: RankingEntry["movement"],
  delta: number
): RankingEntry => ({
  rank,
  user: MOCK_USERS[userIdx],
  auraScore: MOCK_USERS[userIdx].auraScore,
  movement,
  movementDelta: delta,
});

export const GLOBAL_RANKINGS: RankingEntry[] = [
  makeEntry(1, 0, "same", 0),
  makeEntry(2, 1, "up", 1),
  makeEntry(3, 5, "up", 3),
  makeEntry(4, 2, "down", 1),
  makeEntry(5, 3, "up", 2),
  makeEntry(6, 7, "new", 0),
  makeEntry(7, 6, "down", 2),
  makeEntry(8, 9, "up", 5),
  makeEntry(9, 4, "down", 3),
  makeEntry(10, 8, "up", 1),
];

export const WEEKLY_RANKINGS: RankingEntry[] = [
  makeEntry(1, 2, "up", 3),
  makeEntry(2, 5, "up", 8),
  makeEntry(3, 0, "down", 2),
  makeEntry(4, 6, "up", 12),
  makeEntry(5, 1, "down", 2),
  makeEntry(6, 3, "up", 1),
  makeEntry(7, 8, "new", 0),
  makeEntry(8, 7, "down", 1),
  makeEntry(9, 4, "up", 4),
  makeEntry(10, 9, "up", 6),
];

export const FRIENDS_RANKINGS: RankingEntry[] = [
  makeEntry(1, 5, "up", 2),
  makeEntry(2, 3, "down", 1),
  makeEntry(3, 6, "up", 3),
  makeEntry(4, 4, "same", 0),
  makeEntry(5, 7, "new", 0),
  makeEntry(6, 8, "down", 2),
  makeEntry(7, 9, "up", 1),
];

export const CURRENT_USER_GLOBAL_RANK: RankingEntry = {
  rank: 184,
  user: MOCK_USERS[4],
  auraScore: MOCK_USERS[4].auraScore,
  movement: "up",
  movementDelta: 13,
};
