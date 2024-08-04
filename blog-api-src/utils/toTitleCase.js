/** Convert a string to title case. Any extraneous whitespace is
 * removed.
 */
export const toTitleCase = (string) => {
  let words;

  try {
    // Split on any whitespace length.
    words = string.trim().split(/\s+/);
  } catch (error) {
    throw new Error("Invalid argument. Argument must be a string");
  }

  words = words.map((word) => {
    word = word.trim();
    return word.slice(0, 1).toUpperCase() + word.slice(1).toLowerCase();
  });

  return words.join(" ");
};
