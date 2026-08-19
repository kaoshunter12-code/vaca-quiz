export interface TokenMatch {
  text: string
  start: number
  end: number
}

function commonPrefixLength(a: string, b: string): number {
  let i = 0
  while (i < a.length && i < b.length && a[i] === b[i]) i++
  return i
}

/**
 * 예문 속에서 학습 단어에 해당하는 실제 표기(과거형/복수형 등 변형 포함)를 찾는다.
 * 예: word="decide" → example_en의 "decided" 토큰을 찾아냄.
 */
export function findWordToken(word: string, sentence: string): TokenMatch | null {
  const target = word.toLowerCase()
  const tokenPattern = /[A-Za-z']+/g
  let match: RegExpExecArray | null
  let best: TokenMatch | null = null
  let bestScore = 0

  while ((match = tokenPattern.exec(sentence))) {
    const token = match[0]
    const lower = token.toLowerCase()
    if (lower === target) {
      return { text: token, start: match.index, end: match.index + token.length }
    }
    const prefixLen = commonPrefixLength(lower, target)
    const score = prefixLen / Math.max(lower.length, target.length)
    if (prefixLen >= 4 && score > bestScore) {
      bestScore = score
      best = { text: token, start: match.index, end: match.index + token.length }
    }
  }

  return bestScore >= 0.55 ? best : null
}
