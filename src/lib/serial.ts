const ALPHABETS = [
  { first: '0', size: 10 },
  { first: 'A', size: 26 },
  { first: 'a', size: 26 },
].map(({ first, size }) => ({ start: first.charCodeAt(0), size }))

// Counts like an odometer: digits roll 0-9 and letters A-Z, carrying into the character on the
// left, so the length never changes (H9999 + 1 = I0000). Other characters stay put.
export function addToSerial(code: string, amount: number): string {
  const chars = [...code]
  let carry = amount
  for (let i = chars.length - 1; i >= 0 && carry !== 0; i--) {
    const code = chars[i].charCodeAt(0)
    const alphabet = ALPHABETS.find(({ start, size }) => code >= start && code < start + size)
    if (!alphabet) continue
    const total = code - alphabet.start + carry
    const digit = ((total % alphabet.size) + alphabet.size) % alphabet.size
    carry = Math.floor(total / alphabet.size)
    chars[i] = String.fromCharCode(alphabet.start + digit)
  }
  return chars.join('')
}
