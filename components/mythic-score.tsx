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

interface CharacterScore {
  realm: string;
  name: string;
  scores: Record<string, number>;
}

export function MythicScore() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [realm, setRealm] = useState("");
  const [character, setCharacter] = useState("");
  const [characterScores, setCharacterScores] = useState<CharacterScore[]>([]);
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

      // Fetch scores for all characters from URL
      Promise.all(
        characters.map(async ({ realm, name }) => {
          try {
            const scores = await fetchRioMythicScore(realm, name);
            return {
              realm,
              name,
              scores: scores.mythic_plus_best_runs?.reduce((acc, run) => {
                acc[run.dungeon] = run.score;
                return acc;
              }, {} as Record<string, number>) || {},
            };
          } catch {
            console.error(`Failed to fetch scores for ${name}-${realm}`);
            return null;
          }
        }),
      ).then((results) => {
        setCharacterScores(
          results.filter((result): result is CharacterScore => result !== null),
        );
      });
    }
  }, [searchParams]);

  // Update URL when character scores change
  const updateURL = (newScores: CharacterScore[]) => {
    const params = new URLSearchParams(searchParams);
    const characters = newScores.map((char) => `${char.realm}-${char.name}`)
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
      const scores = await fetchRioMythicScore(realm, character);
      const newScores = [
        ...characterScores,
        {
          realm,
          name: character,
          scores: scores.mythic_plus_best_runs?.reduce((acc, run) => {
            if (acc[run.dungeon] && acc[run.dungeon] < run.score) {
              acc[run.dungeon] = run.score;
            } else if (!acc[run.dungeon]) {
              acc[run.dungeon] = run.score;
            }
            return acc;
          }, {} as Record<string, number>) || {},
        },
      ];
      setCharacterScores(newScores);
      updateURL(newScores);
      setRealm("");
      setCharacter("");
    } catch {
      setError("Failed to fetch mythic score. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveCharacter = (index: number) => {
    const newScores = characterScores.filter((_, i) => i !== index);
    setCharacterScores(newScores);
    updateURL(newScores);
  };

  const { sortedDungeons, averages } = useMemo(() => {
    if (characterScores.length === 0) {
      return { sortedDungeons: [], averages: {} };
    }

    const dungeons = Object.keys(characterScores[0].scores);
    const averages = dungeons.reduce((acc, dungeon) => {
      const sum = characterScores.reduce(
        (sum, char) => sum + char.scores[dungeon],
        0,
      );
      acc[dungeon] = sum / characterScores.length;
      return acc;
    }, {} as Record<string, number>);

    const sortedDungeons = dungeons.sort((a, b) => averages[b] - averages[a]);

    return { sortedDungeons, averages };
  }, [characterScores]);

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

      {characterScores.length > 0 && (
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Realm</TableHead>
                <TableHead>Character</TableHead>
                {sortedDungeons.map((dungeon) => (
                  <TableHead key={dungeon}>{dungeon}</TableHead>
                ))}
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {characterScores.map((char, index) => (
                <TableRow key={index}>
                  <TableCell>{char.realm}</TableCell>
                  <TableCell>{char.name}</TableCell>
                  {sortedDungeons.map((dungeon) => (
                    <TableCell key={dungeon}>{char.scores[dungeon]}</TableCell>
                  ))}
                  <TableCell>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleRemoveCharacter(index)}
                    >
                      Remove
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
              <TableRow>
                <TableCell className="font-bold" colSpan={2}>
                  Average
                </TableCell>
                {sortedDungeons.map((dungeon) => (
                  <TableCell key={dungeon} className="font-bold">
                    {averages[dungeon].toFixed(2)}
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
