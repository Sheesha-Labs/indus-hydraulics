/**
 * The time a request is answered, read once by a page and passed down, so every part of the page (ages, the
 * header's date, undo windows) agrees. A function, so render code stays free of `new Date()`.
 */
export function requestTime(): Date {
  return new Date()
}
