import { pick, randInt, shuffle } from "./random";
import type { GroupRecipeTask, Level, RecipeIngredient } from "./types";

const recipes = [
  { title: "Obstquark", ingredients: [["Bananen", "Stück", 1], ["Quark", "Esslöffel", 6], ["Haferflocken", "Esslöffel", 2]] },
  { title: "Knäckebrot-Gesichter", ingredients: [["Knäckebrotscheiben", "Stück", 2], ["Frischkäse", "Esslöffel", 2], ["Gurkenscheiben", "Stück", 6]] },
  { title: "Beerenmüsli", ingredients: [["Erdbeeren", "Stück", 6], ["Haferflocken", "Esslöffel", 4], ["Joghurt", "Esslöffel", 6]] },
] as const;

export function recipeAmounts(item: RecipeIngredient, groups: number) {
  const needed = item.base * groups;
  return { needed, missing: Math.max(0, needed - item.stock) };
}

export function recipeHint(task: GroupRecipeTask, groups: number, needs: string[], shortages?: string[]) {
  if (groups * 2 !== task.children) return `Jede Gruppe steht für zwei Kinder. Zähle in Zweierschritten bis ${task.children}.`;
  for (const [index, item] of task.ingredients.entries()) {
    const { needed, missing } = recipeAmounts(item, groups);
    if (!/^\d+$/.test(needs[index] ?? "") || Number(needs[index]) !== needed)
      return `${item.name}: Für jede Zweiergruppe brauchst du ${item.base} ${item.unit}. Zähle diese Menge für jede Gruppe dazu.`;
    if (shortages && (!/^\d+$/.test(shortages[index] ?? "") || Number(shortages[index]) !== missing))
      return `${item.name}: Vergleiche den Vorrat mit deinem Bedarf. Reicht er schon, fehlt nichts. Sonst zähle vom Vorrat bis zum Bedarf weiter.`;
  }
  return null;
}

export function groupRecipe(level: Level): Omit<GroupRecipeTask, "id" | "level" | "skillId"> {
  const recipe = pick(recipes);
  const groups = level <= 2 ? 2 : pick([2, 3]);
  const offsets = shuffle([-randInt(1, level < 3 ? 1 : 3), 0, randInt(1, 3)]);
  const ingredients = recipe.ingredients.map(([name, unit, base], index) => ({
    name, unit, base, stock: Math.max(0, base * groups + offsets[index]),
  }));
  return {
    format: "group-recipe", title: recipe.title, ingredients, children: groups * 2,
    question: `Was brauchst du für ${groups * 2} Kinder?`,
    hint: "Das Rezept reicht für zwei Kinder. Lege für jedes Kinderpaar eine Gruppe.",
    solution: `${groups} Zweiergruppen versorgen ${groups * 2} Kinder. ` + ingredients.map(item => {
      const { needed, missing } = recipeAmounts(item, groups);
      return `${item.name}: Bedarf ${needed} ${item.unit}, Vorrat ${item.stock} ${item.unit}, Fehlmenge ${missing} ${item.unit}.`;
    }).join(" "),
  };
}
