/** Display-only market mathematics. Never admits, settles or scores a bet. */
export function jinxScoreCondition(market: string, home: number, away: number) {
  if (![home, away].every(value => Number.isSafeInteger(value) && value >= 0)) return null;
  const total = home + away, difference = home - away;
  const goals = /^Ms([0-4])5([au])$/.exec(market);
  if (goals) {
    const floor = Number(goals[1]), under = goals[2] === "a", above = total > floor;
    const left = floor - total;
    return { holds: under ? !above : above, irreversible: above,
      text: above ? under ? "Gol eşiği aşılmış; alt koşulu bu skorla karşılanmıyor."
        : "Gol eşiği aşılmış; üst koşulu bu skorla karşılanıyor."
        : under ? left === 0 ? "Bir gol daha alt koşulunu bozar."
          : `${left + 1} gol daha alt koşulunu bozar.`
          : `Üst koşulu için ${left + 1} gol daha gerekiyor.` };
  }
  if (market === "Kgvar" || market === "Kgyok") {
    const both = home > 0 && away > 0;
    const missing = home === 0 && away === 0 ? "İki takımın da" : home === 0 ? "Ev sahibinin" : "Deplasmanın";
    return { holds: market === "Kgvar" ? both : !both, irreversible: both,
      text: both ? market === "Kgvar" ? "İki takım da gol atmış; KG var koşulu karşılanıyor."
        : "İki takım da gol atmış; KG yok koşulu bu skorla karşılanmıyor."
        : market === "Kgvar" ? `${missing} gol atması gerekiyor.`
          : `${missing} gol atması KG yok koşulunu bozar.` };
  }
  const states: Record<string, { holds: boolean; text: string }> = {
    Ms1: { holds: difference > 0, text: difference > 0
      ? `Deplasmanın ${difference} golü ev sahibi üstünlüğünü kaldırır.` : "Ev sahibinin öne geçmesi gerekiyor." },
    Ms2: { holds: difference < 0, text: difference < 0
      ? `Ev sahibinin ${-difference} golü deplasman üstünlüğünü kaldırır.` : "Deplasmanın öne geçmesi gerekiyor." },
    MsX: { holds: difference === 0, text: difference === 0
      ? "Bir tarafın öne geçmesi beraberlik koşulunu bozar." : "Gerideki takımın skoru eşitlemesi gerekiyor." },
    Ms1X: { holds: difference >= 0, text: difference >= 0
      ? "Deplasmanın öne geçmesi bu koşulu bozar." : "Ev sahibinin en azından eşitliği sağlaması gerekiyor." },
    MsX2: { holds: difference <= 0, text: difference <= 0
      ? "Ev sahibinin öne geçmesi bu koşulu bozar." : "Deplasmanın en azından eşitliği sağlaması gerekiyor." },
    Ms12: { holds: difference !== 0, text: difference !== 0
      ? "Skorun eşitlenmesi bu koşulu bozar." : "Bir tarafın öne geçmesi gerekiyor." }
  };
  return states[market] ? { ...states[market], irreversible: false } : null;
}
