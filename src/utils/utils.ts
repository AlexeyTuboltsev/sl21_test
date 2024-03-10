export function generateRandomString(length: number){
  const dictionary = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz1234567890'
  let result = '';
  while(result.length < length){
    result += dictionary.charAt(Math.floor(Math.random() * dictionary.length));
  }
  return result
}

export function clamp(value: number, min: number, max: number): number {
  if (value < min) {
    return min
  } else if (value > max) {
    return max
  } else {
    return value
  }
}

