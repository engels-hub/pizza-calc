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
  label: string;
  group: IngredientGroup;
  match: RegExp;
  spicy?: boolean;
  /** Animal product that is not meat (dairy cheese). Breaks "vegan". */
  dairy?: boolean;
}

export const GROUP_LABELS: Record<IngredientGroup, string> = {
  base: "Pamats",
  meat: "Gaļa",
  seafood: "Jūras veltes",
  cheese: "Sieri",
  veg: "Dārzeņi un augļi",
  sauce: "Mērces",
  herb: "Garšvielas",
  other: "Citi",
};

// Order matters: the first matching definition wins, so specific patterns
// (e.g. "gurķu mērce") must come before generic ones ("gurķi", "mērce").
export const INGREDIENTS: IngredientDef[] = [
  { key: "dough", label: "Mīkla", group: "base", match: /mīkla/ },
  { key: "vegan-cheese", label: "Vegānais siers", group: "cheese", match: /vegān|siera garš/ },
  { key: "base-sauce", label: "Picas mērce", group: "base", match: /^(lulū |lulu )?picas? mērce$|tomātu mērce/ },
  { key: "base-cheese", label: "Siers", group: "base", match: /^(picas |holandes |klasiskais )?siers$/, dairy: true },

  // Meat and fish first, so "vistas fileja harisas mērcē" counts as chicken, not sauce.
  { key: "pepperoni", label: "Pepperoni", group: "meat", match: /pep+eroni/ },
  { key: "salami", label: "Salami", group: "meat", match: /salami|desa/ },
  { key: "prosciutto", label: "Prošuto", group: "meat", match: /prošut|prosciut|vītināt/ },
  { key: "ham", label: "Šķiņķis", group: "meat", match: /šķiņķ/ },
  { key: "bacon", label: "Bekons", group: "meat", match: /bekon/ },
  { key: "chicken", label: "Vista", group: "meat", match: /vist|kebab\S* gaļ/ },
  { key: "minced", label: "Maltā gaļa", group: "meat", match: /maltā gaļ/ },
  { key: "beef", label: "Liellopa gaļa", group: "meat", match: /liellop|plucināt|plūkt/ },

  { key: "salmon", label: "Lasis", group: "seafood", match: /lasis|laša/ },
  { key: "tuna", label: "Tuncis", group: "seafood", match: /tunc/ },
  { key: "shrimp", label: "Garneles", group: "seafood", match: /garnel/ },
  { key: "seafood", label: "Jūras veltes", group: "seafood", match: /jūras velt/ },

  { key: "garlic-sauce", label: "Ķiploku mērce", group: "sauce", match: /ķiplok.*mērc/ },
  { key: "bbq-sauce", label: "BBQ mērce", group: "sauce", match: /bbq/ },
  { key: "curry-sauce", label: "Karija mērce", group: "sauce", match: /karij/ },
  { key: "lemon-sauce", label: "Citronu mērce", group: "sauce", match: /citron/ },
  { key: "pesto", label: "Pesto", group: "sauce", match: /pesto/ },
  { key: "harissa", label: "Harisas mērce", group: "sauce", match: /harisa|harissa/, spicy: true },
  { key: "mayo", label: "Majonēze", group: "sauce", match: /majonē|aioli|rančo|ranch/ },
  { key: "cucumber-sauce", label: "Gurķu mērce", group: "sauce", match: /gurķu mērc|raita/ },
  { key: "sweet-chili", label: "Saldā čili mērce", group: "sauce", match: /saldā čili|sweet chil/, spicy: true },
  { key: "korean-sauce", label: "Korejas mērce", group: "sauce", match: /korej/ },
  { key: "cheeseburger-sauce", label: "Burgeru mērce", group: "sauce", match: /burger.*mērc/ },
  { key: "steak-sauce", label: "Steika mērce", group: "sauce", match: /steik/ },
  { key: "kebab-sauce", label: "Kebaba mērce", group: "sauce", match: /kebab.*mērc/ },

  { key: "mozzarella", label: "Mocarella", group: "cheese", match: /moc+arel|mozzarel/, dairy: true },
  { key: "parmesan", label: "Cietais siers", group: "cheese", match: /parmez|ciet/, dairy: true },
  { key: "blue-cheese", label: "Zilais siers", group: "cheese", match: /zilais/, dairy: true },
  { key: "cream-cheese", label: "Filadelfijas siers", group: "cheese", match: /filadelf|philadel|krēmsier/, dairy: true },
  { key: "feta", label: "Salātu siers", group: "cheese", match: /salātu sier|feta/, dairy: true },
  { key: "extra-cheese", label: "Papildu siers", group: "cheese", match: /siers|holand/, dairy: true },

  { key: "jalapeno", label: "Jalapeño", group: "veg", match: /jalap|halap/, spicy: true },
  { key: "mushroom", label: "Sēnes", group: "veg", match: /šampinjon|sēne/ },
  { key: "cherry-tomato", label: "Ķiršu tomāti", group: "veg", match: /ķiršu/ },
  { key: "tomato", label: "Tomāti", group: "veg", match: /tomāt/ },
  { key: "pickled-pepper", label: "Marinēti pipari", group: "veg", match: /marinēt.*(pipar|paprik)/ },
  { key: "bell-pepper", label: "Paprika", group: "veg", match: /paprik/ },
  { key: "spring-onion", label: "Lociņi", group: "veg", match: /lociņ|zaļie sīpol/ },
  { key: "onion", label: "Sīpoli", group: "veg", match: /sīpol/ },
  { key: "pineapple", label: "Ananāsi", group: "veg", match: /anan[aā]s/ },
  { key: "pickles", label: "Marinēti gurķi", group: "veg", match: /gurķ/ },
  { key: "olives", label: "Olīvas", group: "veg", match: /olīv/ },
  { key: "corn", label: "Kukurūza", group: "veg", match: /kukurūz/ },
  { key: "soy", label: "Sojas maisījums", group: "other", match: /soj/ },
  { key: "beans", label: "Pupiņas", group: "veg", match: /pupiņ/ },
  { key: "arugula", label: "Rukola", group: "veg", match: /rukol/ },
  { key: "spinach", label: "Spināti", group: "veg", match: /spināt/ },
  { key: "lettuce", label: "Salāti un kāposti", group: "veg", match: /salāt|kāpost|aisberg|iceberg/ },

  { key: "chili", label: "Čili", group: "herb", match: /čili|chili/, spicy: true },
  { key: "dill", label: "Dilles", group: "herb", match: /dill/ },
  { key: "garlic", label: "Ķiploki", group: "herb", match: /ķiplok/ },
  { key: "herbs", label: "Garšaugi", group: "herb", match: /oregano|bazilik|pētersīļ|zaatar|garam|ķimen|sezam|laim|eļļ/ },
  { key: "black-pepper", label: "Melnie pipari", group: "herb", match: /pipar/ },
];

const BY_KEY = new Map(INGREDIENTS.map((d) => [d.key, d]));

/** Ingredient strings that are not ingredients (site disclaimers). */
const IGNORE = /ilustratīv|attēl/;

export function ingredientDef(key: string): IngredientDef {
  return (
    BY_KEY.get(key) ?? {
      key,
      label: key.charAt(0).toUpperCase() + key.slice(1),
      group: key.includes("mērce") ? "sauce" : "other",
      match: /$^/,
    }
  );
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
