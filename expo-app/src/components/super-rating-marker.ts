export type SuperRatingMarker = {
  accessibilityLabel: string;
  starCount: number;
};

export function buildSuperRatingMarker(rating: number): SuperRatingMarker {
  const wholeRating = Number.isFinite(rating) ? Math.trunc(rating) : 1;
  const starCount = Math.max(1, Math.min(5, wholeRating));

  return {
    accessibilityLabel: `BTB rating ${starCount}/5`,
    starCount
  };
}
