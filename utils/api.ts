// utils/api.ts
import { RaiderIOProfile } from "./raiderio.types";

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
  return await fetchData<RaiderIOProfile>(
    `https://raider.io/api/v1/characters/profile?region=${region}&realm=${realm}&name=${name}&fields=mythic_plus_best_runs%3Aall`
  );
}
