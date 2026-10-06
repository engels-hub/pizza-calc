import { lv } from "@/content/lv";
import type { PizzaTag } from "./types";

export type IngredientGroup =
  | "base"
  | "meat"
  | "seafood"
  | "cheese"
  | "veg"
  | "sauce"
  | "herb"
  | "other";

export interface IngredientDef {
  key: string;
  group: IngredientGroup;
  match: RegExp;
  spicy?: boolean;
  /** Animal product that is not meat (dairy cheese). Breaks "vegan". */
  dairy?: boolean;
}

// Order matters: the first matching definition wins, so specific patterns
// (e.g. "gurķu mērce") must come before generic ones ("gurķi", "mērce").
export const INGREDIENTS: IngredientDef[] = [
  { key: "dough", group: "base", match: /mīkla/ },
  { key: "vegan-cheese", group: "cheese", match: /vegān|siera garš/ },
  { key: "base-sauce", group: "base", match: /^(lulū |lulu )?picas? mērce$|tomātu mērce/ },
  { key: "base-cheese", group: "base", match: /^(picas |holandes |klasiskais )?siers$/, dairy: true },

  // Meat and fish first, so "vistas fileja harisas mērcē" counts as chicken, not sauce.
  { key: "pepperoni", group: "meat", match: /pep+eroni/ },
  { key: "salami", group: "meat", match: /salami|desa/ },
  { key: "prosciutto", group: "meat", match: /prošut|prosciut|vītināt/ },
  { key: "ham", group: "meat", match: /šķiņķ/ },
  { key: "bacon", group: "meat", match: /bekon/ },
  { key: "chicken", group: "meat", match: /vist|kebab\S* gaļ/ },
  { key: "minced", group: "meat", match: /maltā gaļ/ },
  { key: "beef", group: "meat", match: /liellop|plucināt|plūkt/ },

  { key: "salmon", group: "seafood", match: /lasis|laša/ },
  { key: "tuna", group: "seafood", match: /tunc/ },
  { key: "shrimp", group: "seafood", match: /garnel/ },
  { key: "seafood", group: "seafood", match: /jūras velt/ },

  { key: "garlic-sauce", group: "sauce", match: /ķiplok.*mērc/ },
  { key: "bbq-sauce", group: "sauce", match: /bbq/ },
  { key: "curry-sauce", group: "sauce", match: /karij/ },
  { key: "lemon-sauce", group: "sauce", match: /citron/ },
  { key: "pesto", group: "sauce", match: /pesto/ },
  { key: "harissa", group: "sauce", match: /harisa|harissa/, spicy: true },
  { key: "mayo", group: "sauce", match: /majonē|aioli|rančo|ranch/ },
  { key: "cucumber-sauce", group: "sauce", match: /gurķu mērc|raita/ },
  { key: "sweet-chili", group: "sauce", match: /saldā čili|sweet chil/, spicy: true },
  { key: "korean-sauce", group: "sauce", match: /korej/ },
  { key: "cheeseburger-sauce", group: "sauce", match: /burger.*mērc/ },
  { key: "steak-sauce", group: "sauce", match: /steik/ },
  { key: "kebab-sauce", group: "sauce", match: /kebab.*mērc/ },

  { key: "mozzarella", group: "cheese", match: /moc+arel|mozzarel/, dairy: true },
  { key: "parmesan", group: "cheese", match: /parmez|ciet/, dairy: true },
  { key: "blue-cheese", group: "cheese", match: /zilais/, dairy: true },
  { key: "cream-cheese", group: "cheese", match: /filadelf|philadel|krēmsier/, dairy: true },
  { key: "feta", group: "cheese", match: /salātu sier|feta/, dairy: true },
  { key: "extra-cheese", group: "cheese", match: /siers|holand/, dairy: true },

  { key: "jalapeno", group: "veg", match: /jalap|halap/, spicy: true },
  { key: "mushroom", group: "veg", match: /šampinjon|sēne/ },
  { key: "cherry-tomato", group: "veg", match: /ķiršu/ },
  { key: "tomato", group: "veg", match: /tomāt/ },
  { key: "pickled-pepper", group: "veg", match: /marinēt.*(pipar|paprik)/ },
  { key: "bell-pepper", group: "veg", match: /paprik/ },
  { key: "spring-onion", group: "veg", match: /lociņ|zaļie sīpol/ },
  { key: "onion", group: "veg", match: /sīpol/ },
  { key: "pineapple", group: "veg", match: /anan[aā]s/ },
  { key: "pickles", group: "veg", match: /gurķ/ },
  { key: "olives", group: "veg", match: /olīv/ },
  { key: "corn", group: "veg", match: /kukurūz/ },
  { key: "soy", group: "other", match: /soj/ },
  { key: "beans", group: "veg", match: /pupiņ/ },
  { key: "arugula", group: "veg", match: /rukol/ },
  { key: "spinach", group: "veg", match: /spināt/ },
  { key: "lettuce", group: "veg", match: /salāt|kāpost|aisberg|iceberg/ },

  { key: "chili", group: "herb", match: /čili|chili/, spicy: true },
  { key: "dill", group: "herb", match: /dill/ },
  { key: "garlic", group: "herb", match: /ķiplok/ },
  { key: "herbs", group: "herb", match: /oregano|bazilik|pētersīļ|zaatar|garam|ķimen|sezam|laim|eļļ/ },
  { key: "black-pepper", group: "herb", match: /pipar/ },
];

const BY_KEY = new Map(INGREDIENTS.map((d) => [d.key, d]));

/** Ingredient strings that are not ingredients (site disclaimers). */
const IGNORE = /ilustratīv|attēl/;

export function ingredientDef(key: string): IngredientDef {
  return (
    BY_KEY.get(key) ?? {
      key,
      group: key.includes("mērce") ? "sauce" : "other",
      match: /$^/,
    }
  );
}

/** Display name; unknown ingredients fall back to the pizzeria's own wording. */
export function ingredientLabel(key: string): string {
  return lv.ingredients[key] ?? key.charAt(0).toUpperCase() + key.slice(1);
}

function cleanRaw(raw: string): string {
  return raw
    .toLowerCase()
    .replace(/\s+/g, " ")
    .replace(/\bmerce\b/g, "mērce")
    .trim();
}

/** Map one printed ingredient (may contain "a/b") to canonical keys. */
export function canonicalize(raw: string): string[] {
  const out: string[] = [];
  for (const part of cleanRaw(raw).split("/")) {
    const p = part.trim();
    if (!p || IGNORE.test(p)) continue;
    const def = INGREDIENTS.find((d) => d.match.test(p));
    out.push(def ? def.key : p);
  }
  return out;
}

export function canonicalizeAll(raws: string[]): string[] {
  return [...new Set(raws.flatMap(canonicalize))];
}

export function deriveTags(name: string, keys: string[]): PizzaTag[] {
  const defs = keys.map(ingredientDef);
  const tags: PizzaTag[] = [];
  const hasAnimal = defs.some((d) => d.group === "meat" || d.group === "seafood");
  if (!hasAnimal) {
    tags.push("vegetarian");
    if (keys.includes("vegan-cheese") && !defs.some((d) => d.dairy)) tags.push("vegan");
  }
  if (defs.some((d) => d.spicy) || /\(asa\)|\basā\b|čili/i.test(name)) tags.push("spicy");
  return tags;
}
