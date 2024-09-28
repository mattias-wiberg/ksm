"use client"

import { useState, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Loader2 } from "lucide-react"

interface CharacterScore {
  realm: string
  name: string
  scores: Record<string, number>
}

// Mock function to simulate API call
const fetchMythicScore = async (realm: string, character: string): Promise<Record<string, number>> => {
  await new Promise(resolve => setTimeout(resolve, 1000)) // Simulate API delay
  // Mock data
  return {
    "De Other Side": Math.floor(Math.random() * 100) + 1,
    "Halls of Atonement": Math.floor(Math.random() * 100) + 1,
    "Mists of Tirna Scithe": Math.floor(Math.random() * 100) + 1,
    "Plaguefall": Math.floor(Math.random() * 100) + 1,
    "Sanguine Depths": Math.floor(Math.random() * 100) + 1,
    "Spires of Ascension": Math.floor(Math.random() * 100) + 1,
    "Theater of Pain": Math.floor(Math.random() * 100) + 1,
    "The Necrotic Wake": Math.floor(Math.random() * 100) + 1,
  }
}

export function MythicScore() {
  const [realm, setRealm] = useState("")
  const [character, setCharacter] = useState("")
  const [characterScores, setCharacterScores] = useState<CharacterScore[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    try {
      const scores = await fetchMythicScore(realm, character)
      setCharacterScores(prev => [...prev, { realm, name: character, scores }])
      setRealm("")
      setCharacter("")
    } catch (err) {
      setError("Failed to fetch mythic score. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const { sortedDungeons, averages } = useMemo(() => {
    if (characterScores.length === 0) return { sortedDungeons: [], averages: {} }

    const dungeons = Object.keys(characterScores[0].scores)
    const averages = dungeons.reduce((acc, dungeon) => {
      const sum = characterScores.reduce((sum, char) => sum + char.scores[dungeon], 0)
      acc[dungeon] = sum / characterScores.length
      return acc
    }, {} as Record<string, number>)

    const sortedDungeons = dungeons.sort((a, b) => averages[b] - averages[a])

    return { sortedDungeons, averages }
  }, [characterScores])

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">WoW Mythic Score Lookup</h1>
      <form onSubmit={handleSubmit} className="mb-4 space-y-4">
        <div>
          <label htmlFor="realm" className="block text-sm font-medium text-gray-700">
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
        </div>
        <div>
          <label htmlFor="character" className="block text-sm font-medium text-gray-700">
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
        </div>
        <Button type="submit" disabled={loading}>
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Fetching...
            </>
          ) : (
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
              </TableRow>
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  )
}