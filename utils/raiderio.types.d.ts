export interface RaiderIOProfile {
  name: string;
  race: string;
  class: string;
  active_spec_name: string;
  active_spec_role: string;
  gender: string;
  faction: string;
  achievement_points: number;
  honorable_kills: number;
  thumbnail_url: string;
  region: string;
  realm: string;
  last_crawled_at: string;
  profile_url: string;
  profile_banner: string;
  mythic_plus_best_runs?: MythicPlusBestRunsEntity[] | null;
}
export interface MythicPlusBestRunsEntity {
  dungeon: string;
  short_name: string;
  mythic_level: number;
  completed_at: string;
  clear_time_ms: number;
  par_time_ms: number;
  num_keystone_upgrades: number;
  map_challenge_mode_id: number;
  zone_id: number;
  score: number;
  affixes?: AffixesEntity[] | null;
  url: string;
}
export interface AffixesEntity {
  id: number;
  name: string;
  description: string;
  icon: string;
  wowhead_url: string;
}
