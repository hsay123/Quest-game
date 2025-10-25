const ADJECTIVES = [
  "swift",
  "bold",
  "wise",
  "keen",
  "brave",
  "quick",
  "strong",
  "clever",
  "mighty",
  "sharp",
  "wild",
  "calm",
  "bright",
  "dark",
  "silent",
  "loud",
]

const NOUNS = [
  "dragon",
  "phoenix",
  "wolf",
  "eagle",
  "tiger",
  "bear",
  "lion",
  "raven",
  "knight",
  "wizard",
  "archer",
  "ranger",
  "hunter",
  "quest",
  "treasure",
  "vault",
]

const NUMBERS = Array.from({ length: 100 }, (_, i) => i.toString().padStart(2, "0"))

export function generateGameId(): string {
  const adjective = ADJECTIVES[Math.floor(Math.random() * ADJECTIVES.length)]
  const noun = NOUNS[Math.floor(Math.random() * NOUNS.length)]
  const number = NUMBERS[Math.floor(Math.random() * NUMBERS.length)]

  return `${adjective}-${noun}-${number}`
}

export function isValidGameId(id: string): boolean {
  // Accept both new format (adjective-noun-number) and old format (random string)
  const parts = id.split("-")
  if (parts.length === 3) {
    const [adj, noun, num] = parts
    return ADJECTIVES.includes(adj.toLowerCase()) && NOUNS.includes(noun.toLowerCase()) && /^\d{2}$/.test(num)
  }
  // Accept any non-empty string as fallback for backward compatibility
  return id.length > 0
}
