export const areArraysEqual = <T extends any[]>(a1: T, a2: T) => {
  for (let i = 0; i < a1.length; i += 1) {
    if (a1[i] !== a2[i])
      return false
  }
  return true
}
