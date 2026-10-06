// Every user-facing string lives here. Components never hardcode copy.
// Rule from the design brief: no em or en dashes anywhere in this file's strings.

/** Latvian singular is used for numbers ending in 1, except 11. */
const one = (n: number) => n % 10 === 1 && n % 100 !== 11;

export const lv = {
  meta: {
    title: "Picu kalkulators",
    description: "Cik picu pasūtīt, no kuras picērijas un par cik. Picu darbnīca un LuLū vienuviet.",
  },

  plural: {
    pizzas: (n: number) => `${n} ${one(n) ? "pica" : "picas"}`,
    pizzaWord: (n: number) => (one(n) ? "pica" : "picas"),
    people: (n: number) => `${n} ${one(n) ? "cilvēks" : "cilvēki"}`,
  },

  header: {
    brand: "Picu kalkulators",
    pricesUpdated: (date: string) => `Cenas atjaunotas ${date}`,
    pricesFrom: (date: string) => `Cenas no ${date}`,
  },

  footer: {
    before: "Cenas no",
    and: "un",
    after: ". Pasūtījumu veic pašā picērijā, šeit tikai aprēķins.",
  },

  error: {
    title: "Kaut kas nogāja greizi.",
    body: "Neizdevās ielādēt kalkulatoru. Pamēģini vēlreiz.",
    retry: "Mēģināt vēlreiz",
  },

  planner: {
    sectionLabel: "Aprēķins",
    title: "Cik picu vajag?",
    lead: "Izvēlies picas no cilvēku skaita, izmēriem un izsalkuma. Gan PD, gan Lulu",
    people: "Cilvēku skaits",
    less: (what: string) => `${what}: mazāk`,
    more: (what: string) => `${what}: vairāk`,
    youNeed: "Jums vajag",
    size: "Izmērs",
    exact: (n: string) => `precīzi ${n}`,
    pricePerArea: (price: string) => `no ${price} €/dm²`,
    pricePerAreaHint: "Lētākais pēc laukuma",
  },

  rules: {
    title: "Aprēķina noteikums",
    summary: (formula: string, diameter: number) => `${formula} picas pa ${diameter} cm`,
    explainer:
      "PD rule of thumb: N-1 30cm PD picas. Citi izmēri rēķināti attiecīgi laukumam",
    worked: (people: string, formula: string) => `${people} → ${formula} =`,
    perSize: (diameter: number) => `pa ${diameter} cm`,
    appetite: "Izsalkums",
    appetites: { light: "Viegli", normal: "Normāli", hungry: "Izsalkuši" },
    offset: "Atņemt picas",
    factor: "Picas uz cilvēku",
    baseSize: "Default izmērs",
    reset: "Atpakaļ uz n − 1",
  },

  menu: {
    title: "Izvēlies picas",
    pizzeria: "Picērija",
    all: "Abas",
    searchLabel: "Meklēt picu vai sastāvdaļu",
    searchPlaceholder: "Meklēt, piem. bekons",
    ingredients: "Sastāvdaļas",
    ingredientHelp: "Viens klikšķis pievieno. Otrreiz izslēdz. Trešais noņem filtru.",
    without: "bez",
    /** Prefix for an excluded tag, e.g. "ne asās". */
    not: "ne",
    removeFilter: (label: string) => `Noņemt ${label}`,
    count: (n: number) => `${n} picas`,
    clearFilters: "Notīrīt filtrus",
    sort: "Kārtot",
    sorts: { menu: "Kā ēdienkartē", price: "Lētākās", value: "Izdevīgākās par cm²" },
    emptyTitle: "Nav picu ar šīm sastāvdaļām.",
    emptyBody: "Pamēģini noņemt kādu filtru vai izvēlēties abas picērijas.",
    add: (name: string, size: string) => `Pievienot ${name} ${size}`,
    open: (pizzeria: string) => `Atvērt ${pizzeria}`,
    perArea: (price: string) => `${price} €/dm²`,
    vegetarian: "veģetāra",
    spicy: "asa",
  },

  tags: {
    vegetarian: "Veģetārās",
    vegan: "Vegānās",
    spicy: "Asās",
    new: "Jaunumi",
  },

  cart: {
    title: "Jūsu picas",
    clear: "Notīrīt",
    empty: "Pievieno picas no saraksta, tās sakrausies šeit.",
    shownOf: (shown: number, total: number) => `Rādītas ${shown} no ${total}`,
    stackLabel: (n: number) => `${n} picas kaudzē`,
    stackEmpty: "Tukšs pasūtījums",
    quantity: (name: string) => `${name} skaits`,
    line: (pizzeria: string, size: string, price: string) => `${pizzeria}, ${size}, ${price}`,
  },

  coverage: {
    enough: (people: number) => `Pietiek ${people} cilvēkiem`,
    leftovers: ", paliks pāri",
    missingBefore: "Vēl vajag apmēram ",
    missing: (n: number, diameter: number) => `${n} ${one(n) ? "pica" : "picas"} pa ${diameter} cm`,
  },

  bottomBar: {
    order: "Pasūtījums",
    empty: "Tukšs",
  },

  summary: {
    title: "Kopsavilkums",
    discounts: "Atlaides",
    custom: "Sava atlaide",
    customKind: "Atlaides veids",
    customTitle: (value: number) => `Sava atlaide ${value}%`,
    customTitleFixed: "Sava atlaide",
    copyCode: (code: string) => `Kopēt kodu ${code}`,
    endedOn: (date: string) => `beidzās ${date}`,
    startsOn: (date: string) => `no ${date}`,
    until: (date: string) => `līdz ${date}`,
    subtotal: "Bez atlaidēm",
    total: "Kopā",
    perPerson: (pizzas: string, price: string) => `${pizzas}, ${price} uz cilvēku`,
    saved: (price: string) => `Ietaupi ${price}`,
  },

  pizzerias: {
    "darbnīca": "Picu darbnīca",
    lulu: "LuLū",
  },

  /** Short names for tight spots such as the size cards. */
  pizzeriasShort: {
    "darbnīca": "Darbnīca",
    lulu: "LuLū",
  },

  promos: {
    "lulu-takeaway": {
      title: "Paņem pats −15%",
      note: "Pasūti tiešsaistē un izņem picērijā. Nesummējas ar citām atlaidēm.",
    },
    "lulu-picrudens": { title: "Visas picas −50%", note: "Rudens akcija visām picām." },
    "lulu-davana": { title: "Katra 3. pica bez maksas", note: "Lētākā pica katrā trijniekā ir par brīvu." },
    "lulu-atgriesanas": { title: "Visas picas −50%", note: "Septembra akcija." },
    "darbnica-drauga": { title: "Drauga karte −10%", note: "Pastāvīgā lojalitātes karte, vienmēr −10%." },
    "darbnica-birthday": {
      title: "Dzimšanas vai vārda diena −15%",
      note: "Tikai pašā svētku dienā, jāpasaka pasūtot. Nesummējas ar drauga karti.",
    },
  } as Record<string, { title: string; note: string }>,

  variants: {
    heart: "Sirds 30 cm",
    oneSize: "Viens izmērs",
    cm: (d: number) => `${d} cm`,
  },

  ingredientGroups: {
    base: "Pamats",
    meat: "Gaļa",
    seafood: "Jūras veltes",
    cheese: "Sieri",
    veg: "Dārzeņi un augļi",
    sauce: "Mērces",
    herb: "Garšvielas",
    other: "Citi",
  },

  ingredients: {
    dough: "Mīkla",
    "vegan-cheese": "Vegānais siers",
    "base-sauce": "Picas mērce",
    "base-cheese": "Siers",
    pepperoni: "Pepperoni",
    salami: "Salami",
    prosciutto: "Prošuto",
    ham: "Šķiņķis",
    bacon: "Bekons",
    chicken: "Vista",
    minced: "Maltā gaļa",
    beef: "Liellopa gaļa",
    salmon: "Lasis",
    tuna: "Tuncis",
    shrimp: "Garneles",
    seafood: "Jūras veltes",
    "garlic-sauce": "Ķiploku mērce",
    "bbq-sauce": "BBQ mērce",
    "curry-sauce": "Karija mērce",
    "lemon-sauce": "Citronu mērce",
    pesto: "Pesto",
    harissa: "Harisas mērce",
    mayo: "Majonēze",
    "cucumber-sauce": "Gurķu mērce",
    "sweet-chili": "Saldā čili mērce",
    "korean-sauce": "Korejas mērce",
    "cheeseburger-sauce": "Burgeru mērce",
    "steak-sauce": "Steika mērce",
    "kebab-sauce": "Kebaba mērce",
    mozzarella: "Mocarella",
    parmesan: "Cietais siers",
    "blue-cheese": "Zilais siers",
    "cream-cheese": "Filadelfijas siers",
    feta: "Salātu siers",
    "extra-cheese": "Papildu siers",
    jalapeno: "Jalapeño",
    mushroom: "Sēnes",
    "cherry-tomato": "Ķiršu tomāti",
    tomato: "Tomāti",
    "pickled-pepper": "Marinēti pipari",
    "bell-pepper": "Paprika",
    "spring-onion": "Lociņi",
    onion: "Sīpoli",
    pineapple: "Ananāsi",
    pickles: "Marinēti gurķi",
    olives: "Olīvas",
    corn: "Kukurūza",
    soy: "Sojas maisījums",
    beans: "Pupiņas",
    arugula: "Rukola",
    spinach: "Spināti",
    lettuce: "Salāti un kāposti",
    chili: "Čili",
    dill: "Dilles",
    garlic: "Ķiploki",
    herbs: "Garšaugi",
    "black-pepper": "Melnie pipari",
  } as Record<string, string>,

  noToppings: "Siers un mērce",
} as const;
