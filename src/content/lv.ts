// Every user-facing string lives here. Components never hardcode copy.
// Rule from the design brief: no em or en dashes anywhere in this file's strings.

/** Latvian singular is used for numbers ending in 1, except 11. */
const one = (n: number) => n % 10 === 1 && n % 100 !== 11;

export const lv = {
  meta: {
    title: "Picu kalkulators",
    description: "Cik picu pasūtīt, no kuras picērijas un par cik. Picu darbnīca un LuLū vienuviet",
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
    after: ". Pasūtījumu veic pašā picērijā, šeit tikai aprēķins",
  },

  error: {
    title: "Kaut kas nogāja greizi",
    body: "Neizdevās ielādēt kalkulatoru. Pamēģini vēlreiz",
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

  /** "I'm feeling lucky": fills the cart with random Picu darbnīca pizzas. */
  lucky: {
    button: "Man paveiksies",
    hint: (n: number, diameter: number) =>
      `${n} ${one(n) ? "nejauša Picu darbnīcas pica" : "nejaušas Picu darbnīcas picas"} pa ${diameter} cm`,
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
    collapse: "Paslēpt sarakstu",
    expand: "Rādīt sarakstu",
    pizzeria: "Picērija",
    all: "Abas",
    searchLabel: "Meklēt picu vai sastāvdaļu",
    searchPlaceholder: "Meklēt, piem. bekons",
    ingredients: "Sastāvdaļas",
    ingredientHelp: "Viens klikšķis pievieno. Otrreiz izslēdz. Trešais noņem filtru",
    without: "bez",
    /** Prefix for an excluded tag, e.g. "ne asās". */
    not: "ne",
    removeFilter: (label: string) => `Noņemt ${label}`,
    count: (n: number) => `${n} ${one(n) ? "pica" : "picas"}`,
    clearFilters: "Notīrīt filtrus",
    sort: "Kārtot",
    sorts: { menu: "Kā ēdienkartē", price: "Lētākās", value: "Izdevīgākās par cm²" },
    emptyTitle: "Nav picu ar šīm sastāvdaļām",
    emptyBody: "Pamēģini noņemt kādu filtru vai izvēlēties abas picērijas",
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
    empty: "Pievieno picas sarakstā",
    shownOf: (shown: number, total: number) => `Rādītas ${shown} no ${total}`,
    stackLabel: (n: number) => `${n} ${one(n) ? "pica" : "picas"} kaudzē`,
    stackEmpty: "Tukšs pasūtījums",
    quantity: (name: string) => `${name} skaits`,
    sizeOf: (name: string) => `${name} izmērs`,
    /** The cm² loading bar: ordered against what the group needs. */
    area: "Pasūtītā platība",
    areaValue: (have: string, need: string) => `${have} no ${need} cm²`,
    areaOver: (pct: number) => `+${pct}% virs vajadzīgā`,
  },

  coverage: {
    enough: (people: number) => `Pietiek ${people} cilvēkiem`,
    leftovers: ", paliks pāri",
    missingBefore: "Vēl vajag apmēram ",
    missing: (n: number, diameter: number) => `${n} ${one(n) ? "pica" : "picas"} pa ${diameter} cm`,
  },

  /** How the order splits between people. */
  share: {
    even: (n: number) => `Katram ${n} ${one(n) ? "gabals" : "gabali"}`,
    /** "3 saņem 6 gabalus, 2 saņem 7" */
    uneven: (baseCount: number, base: number, extraCount: number) =>
      base === 0
        ? `${extraCount} saņem 1 gabalu, ${baseCount} paliek bez`
        : `${baseCount} saņem ${base} ${one(base) ? "gabalu" : "gabalus"}, ${extraCount} saņem ${base + 1}`,
    /** Appended after the slice text; the even case already starts with "Katram". */
    area: (cm2: string, even: boolean) => (even ? `${cm2} cm²` : `${cm2} cm² katram`),
    hint: "Gabalu skaits pēc izmēra: 20 cm 4, 23 cm 6, 30 cm 8, 45 cm 12, calzone 4.",
  },

  bottomBar: {
    toSummary: "Uz kopsummu",
  },

  summary: {
    discounts: "Atlaides",
    /** Status line under the closed deals dropdown. */
    dealsNone: "Neviena nav ieslēgta",
    dealsActive: (n: number, saved: string | null) =>
      `${n} ${one(n) ? "ieslēgta" : "ieslēgtas"}${saved ? `, ietaupi ${saved}` : ""}`,
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
    copyLink: "Kopēt saiti uz šo pasūtījumu",
    linkCopied: "Saite nokopēta",
    remove: (name: string, size: string) => `Izņemt ${name} ${size}`,
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
      note: "Pasūti tiešsaistē un izņem picērijā. Nesummējas ar citām atlaidēm",
    },
    "lulu-picrudens": { title: "Visas picas −50%", note: "Rudens akcija visām picām" },
    "lulu-davana": { title: "Katra 3. pica bez maksas", note: "Lētākā pica katrā trijniekā ir par brīvu" },
    "lulu-atgriesanas": { title: "Visas picas −50%", note: "Septembra akcija" },
    "darbnica-drauga": { title: "Drauga karte −10%", note: "Pastāvīgā lojalitātes karte, vienmēr −10%" },
    "darbnica-birthday": {
      title: "Dzimšanas vai vārda diena −15%",
      note: "Tikai pašā svētku dienā, jāpasaka pasūtot. Nesummējas ar drauga karti",
    },
  } as Record<string, { title: string; note: string }>,

  variants: {
    heart: "Sirds 30 cm",
    oneSize: "Viens izmērs",
    cm: (d: number) => `${d} cm`,
    /** One entry in a size dropdown: "Sirds 30 cm, 16,99 €". */
    option: (label: string, price: string) => `${label}, ${price}`,
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
