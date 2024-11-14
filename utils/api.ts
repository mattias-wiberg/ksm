// utils/api.ts
import { MythicPlusBestRunsEntity, RaiderIOProfile } from "./raiderio.types";

export async function fetchData<T>(endpoint: string): Promise<T> {
  const response = await fetch(endpoint);

  if (!response.ok) {
    throw new Error("Failed to fetch data");
  }

  return response.json();
}

export async function fetchRioMythicScore(
  realm: string,
  name: string,
  region: string = "eu"
): Promise<RaiderIOProfile> {
  const profile = await fetchData<RaiderIOProfile>(
    `https://raider.io/api/v1/characters/profile?region=${region}&realm=${realm}&name=${name}&fields=mythic_plus_best_runs%3Aall`
  );

  // Deduplicate mythic_plus_best_runs by dungeon name, keeping the highest score
  const runs = profile.mythic_plus_best_runs || [];
  const runsMap = runs.reduce((acc, run) => {
    const existingRun = acc.get(run.dungeon);
    if (!existingRun || run.score > existingRun.score) {
      acc.set(run.dungeon, run);
    }
    return acc;
  }, new Map<string, MythicPlusBestRunsEntity>());
  profile.mythic_plus_best_runs = Array.from(runsMap.values());

  return profile;
}
