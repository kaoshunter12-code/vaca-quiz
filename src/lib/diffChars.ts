/**
 * 두 문자열을 최장 공통 부분열(LCS) 기준으로 비교해, 각 위치의 글자가
 * 서로 일치하는지 표시한다. 오답 피드백에서 "내가 쓴 답"과 "정답" 중
 * 실제로 다른 글자만 하이라이트하는 데 사용한다.
 */
export function diffChars(a: string, b: string): { aMatch: boolean[]; bMatch: boolean[] } {
  const lowerA = a.toLowerCase()
  const lowerB = b.toLowerCase()
  const n = lowerA.length
  const m = lowerB.length

  const dp: number[][] = Array.from({ length: n + 1 }, () => new Array<number>(m + 1).fill(0))
  for (let i = 1; i <= n; i++) {
    for (let j = 1; j <= m; j++) {
      dp[i][j] =
        lowerA[i - 1] === lowerB[j - 1] ? dp[i - 1][j - 1] + 1 : Math.max(dp[i - 1][j], dp[i][j - 1])
    }
  }

  const aMatch = new Array<boolean>(n).fill(false)
  const bMatch = new Array<boolean>(m).fill(false)
  let i = n
  let j = m
  while (i > 0 && j > 0) {
    if (lowerA[i - 1] === lowerB[j - 1]) {
      aMatch[i - 1] = true
      bMatch[j - 1] = true
      i--
      j--
    } else if (dp[i - 1][j] >= dp[i][j - 1]) {
      i--
    } else {
      j--
    }
  }

  return { aMatch, bMatch }
}
