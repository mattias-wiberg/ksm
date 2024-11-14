"use client";

import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Loader2 } from "lucide-react";
import { fetchRioMythicScore } from "@/utils/api";
import { useRouter, useSearchParams } from "next/navigation";
import { RaiderIOProfile } from "@/utils/raiderio.types";
import { Cross1Icon } from "@radix-ui/react-icons";

export function MythicScore() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [realm, setRealm] = useState("");
  const [character, setCharacter] = useState("");
  const [characterProfiles, setCharacterProfiles] = useState<RaiderIOProfile[]>(
    [],
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load initial state from URL
  useEffect(() => {
    const charactersParam = searchParams.get("characters");
    if (charactersParam) {
      const characters = charactersParam.split(",").map((char) => {
        const [realm, name] = char.split("-");
        return { realm, name };
      });

      // Fetch profiles for all characters from URL
      Promise.all(
        characters.map(async ({ realm, name }) => {
          try {
            const profile = await fetchRioMythicScore(realm, name);
            console.log(`Fetched profile`, profile);
            return profile;
          } catch {
            console.error(`Failed to fetch profile for ${name}-${realm}`);
            return null;
          }
        }),
      ).then((results) => {
        setCharacterProfiles(
          results.filter((result): result is RaiderIOProfile =>
            result !== null
          ),
        );
      });
    }
  }, [searchParams]);

  // Update URL when character profiles change
  const updateURL = (newProfiles: RaiderIOProfile[]) => {
    const params = new URLSearchParams(searchParams);
    const characters = newProfiles.map((profile) =>
      `${profile.realm}-${profile.name}`
    )
      .join(",");
    if (characters) {
      params.set("characters", characters);
    } else {
      params.delete("characters");
    }
    router.push(`?${params.toString()}`);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const profile = await fetchRioMythicScore(realm, character);
      const newProfiles = [...characterProfiles, profile];
      setCharacterProfiles(newProfiles);
      updateURL(newProfiles);
      setRealm("");
      setCharacter("");
    } catch {
      setError("Failed to fetch mythic score. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveCharacter = (index: number) => {
    const newProfiles = characterProfiles.filter((_, i) => i !== index);
    setCharacterProfiles(newProfiles);
    updateURL(newProfiles);
  };

  const { sortedDungeons, averages } = useMemo(() => {
    if (characterProfiles.length === 0) {
      return { sortedDungeons: [], averages: {} };
    }

    // Extract all dungeon names from mythic_plus_best_runs
    const allDungeons = new Set<string>();
    characterProfiles.forEach((profile) => {
      profile.mythic_plus_best_runs?.forEach((run) => {
        allDungeons.add(run.dungeon);
      });
    });

    const dungeons = Array.from(allDungeons);
    const averages = dungeons.reduce((acc, dungeon) => {
      const { totalScore, totalLevel } = characterProfiles.reduce(
        (sums, profile) => {
          const run = profile.mythic_plus_best_runs?.find((r) =>
            r.dungeon === dungeon
          );
          if (run) {
            sums.totalScore += run.score;
            sums.totalLevel += run.mythic_level;
            sums.count += 1;
          }
          return sums;
        },
        { totalScore: 0, totalLevel: 0, count: 0 },
      );
      acc[dungeon] = {
        averageScore: totalScore / characterProfiles.length,
        averageLevel: totalLevel / characterProfiles.length,
      };
      return acc;
    }, {} as Record<string, { averageScore: number; averageLevel: number }>);

    const sortedDungeons = dungeons.sort(
      (a, b) => averages[b].averageScore - averages[a].averageScore,
    );

    return { sortedDungeons, averages };
  }, [characterProfiles]);

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">WoW Mythic Score Lookup</h1>
      <form onSubmit={handleSubmit} className="mb-4 space-y-4">
        <label
          htmlFor="realm"
          className="block text-sm font-medium text-gray-700 dark:text-white"
        >
          Realm
        </label>
        <Input
          id="realm"
          type="text"
          value={realm}
          onChange={(e) => setRealm(e.target.value)}
          required
          className="mt-1"
        />
        <label
          htmlFor="character"
          className="block text-sm font-medium text-gray-700 dark:text-white"
        >
          Character Name
        </label>
        <Input
          id="character"
          type="text"
          value={character}
          onChange={(e) => setCharacter(e.target.value)}
          required
          className="mt-1"
        />
        <Button type="submit" disabled={loading}>
          {loading
            ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Fetching...
              </>
            )
            : (
              "Add Character"
            )}
        </Button>
      </form>

      {error && <p className="text-red-500 mb-4" role="alert">{error}</p>}

      {characterProfiles.length > 0 && (
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Character</TableHead>
                {sortedDungeons.map((dungeon) => (
                  <TableHead key={dungeon}>{dungeon}</TableHead>
                ))}
                <TableHead />
              </TableRow>
            </TableHeader>
            <TableBody>
              {characterProfiles.map((profile, index) => (
                <TableRow key={index}>
                  <TableCell>{profile.name}</TableCell>
                  {sortedDungeons.map((dungeon) => {
                    const run = profile.mythic_plus_best_runs?.find((r) =>
                      r.dungeon === dungeon
                    );
                    return (
                      <TableCell key={dungeon}>
                        {run
                          ? `${run.mythic_level}${
                            "+".repeat(run.num_keystone_upgrades)
                          } (${run.score})`
                          : "N/A"}
                      </TableCell>
                    );
                  })}
                  <TableCell>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleRemoveCharacter(index)}
                    >
                      <Cross1Icon className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
              <TableRow>
                <TableCell className="font-bold" colSpan={1}>
                  Average
                </TableCell>
                {sortedDungeons.map((dungeon) => (
                  <TableCell key={dungeon} className="font-bold">
                    {averages[dungeon].averageLevel.toFixed(2)}{" "}
                    ({averages[dungeon].averageScore.toFixed(2)})
                  </TableCell>
                ))}
                <TableCell />
              </TableRow>
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
