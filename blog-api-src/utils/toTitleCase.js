/** Convert a string to title case. Any extraneous whitespace is
 * removed.
 */
export const toTitleCase = (string) => {
  let words = string.split(/\s+/); // Split on any whitespace length.
  words = words.map((word) => {
    word = word.trimStart();
    return word.slice(0, 1).toUpperCase() + word.slice(1).toLowerCase();
  });
  return words.join(" ");
};
