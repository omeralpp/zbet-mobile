/** The rest of a general league-table row, when the provider table is read. */
export type StandingsRecord = {
  played: number;
  won: number;
  draw: number;
  lost: number;
  goalsFor: number;
  goalsAgainst: number;
  goalDifference: number;
  zone: string | null;
};

/** "3 maç · 3G 0B 0M": played and results; goals and the zone are shown on their own. */
export function standingsRecordLine(record: StandingsRecord): string {
  return [`${record.played} maç`, `${record.won}G ${record.draw}B ${record.lost}M`].join(" · ");
}

type Ranked = { position: number | null; points: number | null };

/**
 * The two teams with the one higher in the table first: lower position wins,
 * then more points; without either, the home team stays on top.
 */
export function standingsOrder<T extends Ranked>(home: T, away: T): [T, T] {
  if (home.position !== null && away.position !== null && home.position !== away.position) {
    return home.position < away.position ? [home, away] : [away, home];
  }
  if (home.points !== null && away.points !== null && home.points !== away.points) {
    return home.points > away.points ? [home, away] : [away, home];
  }
  return [home, away];
}
