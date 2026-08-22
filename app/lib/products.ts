export interface Product {
  id: number;
  slug: string;
  name: string;
  subtitle: string;
  price: number;
  img: string;
  imgs: string[];
  tag?: string;
  notes: string[];
  family: string;
  intensity: string;
  description: string;
  longDescription: string;
  topNotes: string[];
  heartNotes: string[];
  baseNotes: string[];
  volume: string;
  occasion: string[];
  season: string[];
}

export const products: Product[] = [
  {
    id: 1,
    slug: 'fortis-rex',
    name: 'Fortis Rex',
    subtitle: '50 ML — EAU DE PARFUM',
    price: 500,
    img: '/products/Fortis Rex.png',
    imgs: ['/products/Fortis Rex.png'],
    tag: 'BEST SELLER',
    notes: ['Sea Notes', 'Grapefruit', 'Bay Leaf', 'Guaiac Wood'],
    family: 'Fresh Aquatic Woody',
    intensity: 'Fresh & Energetic',
    description: 'عطر خشبى مائي قوي مستوحى من (انفيكتوس)، يجسد النصر والقوة بتركيبة منعشة تجمع بين نسيم البحر والجريب فروت مع لمسات خشبية دافئة.',
    longDescription: 'عطر Fortis Rex المستوحى من عطر Invictus الشهير هو تجسيد للمزيد من الحيوية والقوة. يفتتح العطر بنفحات مائية مسببة للانتعاش مع الجريب فروت، متداخلة مع قلب عطري من ورق الغار والياسمين الناعم، وتستقر القاعدة على خشب الغاياك والعنبر والعنبر الأشهب ليعطيك ثباتاً وحضوراً ملكياً جذاباً طوال اليوم.',
    topNotes: ['Sea Notes', 'Grapefruit', 'Mandarin Orange'],
    heartNotes: ['Bay Leaf', 'Jasmine'],
    baseNotes: ['Ambergris', 'Guaiac Wood', 'Oakmoss', 'Patchouli'],
    volume: '50 ML',
    occasion: ['Daytime', 'Gym & Sports', 'Casual', 'Daily Wear'],
    season: ['Spring', 'Summer'],
  },
  {
    id: 2,
    slug: 'sultan-dore',
    name: 'Sultan Doré',
    subtitle: '50 ML — EAU DE PARFUM',
    price: 550,
    img: '/products/Sultan Dore.png',
    imgs: ['/products/Sultan Dore.png'],
    tag: 'LUXURY NICHE',
    notes: ['Pineapple', 'Grapefruit', 'Cedar', 'Oakmoss'],
    family: 'Chypre Fruity',
    intensity: 'Rich & Long-lasting',
    description: 'عطر فاخر مستوحى من (نيشان هاشيفات)، يجمع بين انتعاش الأناناس والجريب فروت وأناقة الأخشاب الشيبر ليعبر عن الفخامة والأصالة.',
    longDescription: 'عطر Sultan Doré المأخوذ عن Nishane Hacivat الأيقوني يُعتبر من أرقى عطور النيش العالمية. يبدأ بانفجار فاكهي منعش من الأناناس الطبيعي والجريب فروت والبرغموت، يليه قلب خشب يجمع بين خشب الأرز والياسمين والباتشولي، ويعتمد على قاعدة ثقيلة وفخمة من طحلب البلوط والأخشاب العطرية الدافئة التي تمنحه ثباتاً وفواحاً استثنائياً.',
    topNotes: ['Pineapple', 'Grapefruit', 'Bergamot'],
    heartNotes: ['Cedarwood', 'Patchouli', 'Jasmine'],
    baseNotes: ['Oakmoss', 'Dry Woody Notes'],
    volume: '50 ML',
    occasion: ['Special Occasions', 'Evening', 'Business Meetings', 'Formal'],
    season: ['All Seasons', 'Spring', 'Summer', 'Fall'],
  },
  {
    id: 3,
    slug: 'marin-bleu',
    name: 'Marin Bleu',
    subtitle: '50 ML — EAU DE PARFUM',
    price: 650,
    img: '/products/Marin Blue.png',
    imgs: ['/products/Marin Blue.png'],
    tag: 'MOST POPULAR',
    notes: ['Sea Salt', 'Seaweed', 'Calone', 'Amber', 'Musk'],
    family: 'Oceanic Aromatic',
    intensity: 'Deep & Extremely Intense',
    description: 'ملحمة عطرية مائية مستوحاة من (ميجامار)، تجسد أعماق المحيط الساحرة بعبير مائي مالح وثبات أسطوري يخطف الأنفاس.',
    longDescription: 'عطر Marin Bleu المأخوذ عن Megamare الشهير من أورتو باريزي يمثل أسطورة العطور المائية. ينقلك إلى قلب الأعماق مع نفحات الألدهيدات البحرية وملح البحر والأعشاب البحرية المنعشة، متناغمة مع قاعدة عميقة من المسك العنبري والأخشاب الداكنة ليعطيك فوحاناً قوياً وثباتاً لا يُنسى.',
    topNotes: ['Sea Water', 'Bergamot', 'Lemon'],
    heartNotes: ['Seaweed', 'Calone', 'Hedione'],
    baseNotes: ['Musk', 'Ambroxan', 'Cedarwood'],
    volume: '50 ML',
    occasion: ['Outdoor', 'Summer Nights', 'Casual', 'Special Occasions'],
    season: ['Summer', 'Spring'],
  },
  {
    id: 4,
    slug: 'frost-line',
    name: 'Frost Line',
    subtitle: '50 ML — EAU DE PARFUM',
    price: 850,
    img: '/products/Frost Line.png',
    imgs: ['/products/Frost Line.png'],
    tag: 'PREMIUM SELECTION',
    notes: ['Blackcurrant', 'Citron', 'Mint', 'Basil', 'Rose'],
    family: 'Citrus Aromatic Green',
    intensity: 'Refreshing & Vibrant',
    description: 'إكسير من الاسترخاء والانتعاش الاستوائي مستوحى من (باسيفيك شيل)، يمزج الكشمش الأسود والليمون والنعناع لطاقة وحيوية الصيف.',
    longDescription: 'عطر Frost Line المستوحى من تحفة لوي فيتون Pacific Chill هو تجربة عطرية حية تبعث على الراحة والهدوء النفسي. تفتح الرائحة بمزيج ساحر من الكشمش الأسود الحاد، الليمون الحامض، والنعناع المنعش، مع قلب من الكزبرة والورد الناعم، وتستقر على قاعدة ناعمة من التمر الهندي والريحان والعنبر الخفيف.',
    topNotes: ['Black Currant', 'Citron', 'Mint', 'Lemon', 'Orange'],
    heartNotes: ['Basil', 'Rose', 'Coriander', 'May Chang'],
    baseNotes: ['Dates', 'Fig', 'Ambrette'],
    volume: '50 ML',
    occasion: ['Daily Wear', 'Vacation & Beach', 'Daytime', 'Summer'],
    season: ['Spring', 'Summer'],
  },
  {
    id: 5,
    slug: 'blanc-pur',
    name: 'Blanc Pur',
    subtitle: '50 ML — EAU DE PARFUM',
    price: 450,
    img: '/products/Blanc Pur.png',
    imgs: ['/products/Blanc Pur.png'],
    tag: 'FRESH & CLEAN',
    notes: ['Grapefruit', 'Rosemary', 'Tuberose', 'Cedar', 'Suede'],
    family: 'Woody Aromatic Floral',
    intensity: 'Soft, Clean & Crisp',
    description: 'رائحة النظافة والأناقة في أبهى صورها مستوحاة من (لاكوست وايت)، تجمع بين مسك الروم والهيل مع الحمضيات والأخشاب البيضاء.',
    longDescription: 'عطر Blanc Pur المستوحى من Lacoste White هو الخيار الأمثل لمن يحب النظافة والهدوء والانتعاش الصباحي. يفتتح العطر بنفحات الهيل والجريب فروت وإكليل الجبل، يليه قلب ناعم ونقي من مسك الروم والإيلنغ، وتستقر القاعدة على الشامواه الخفيف وخشب الأرز والعنبر ليعطي شعوراً بالنظافة والانتعاش طوال اليوم.',
    topNotes: ['Grapefruit', 'Rosemary', 'Cardamom'],
    heartNotes: ['Tuberose', 'Ylang-Ylang'],
    baseNotes: ['Suede', 'Leather', 'Cedarwood', 'Vetiver'],
    volume: '50 ML',
    occasion: ['Daily Wear', 'Office & Work', 'Gym', 'Casual'],
    season: ['Spring', 'Summer'],
  },
  {
    id: 6,
    slug: 'mangue-epicee',
    name: 'Mangue Épicée',
    subtitle: '50 ML — EAU DE PARFUM',
    price: 550,
    img: '/products/Mangue Epicee.png',
    imgs: ['/products/Mangue Epicee.png'],
    tag: 'TRENDING NICHE',
    notes: ['Mango', 'Ginger', 'Lemon', 'Red Berries', 'Oud'],
    family: 'Oriental Woody Fruity',
    intensity: 'Exotic & Mesmerizing',
    description: 'عطر استوائي مبهر مستوحى من (جود اوف فاير)، يدمج حلاوة المانجو المدارية مع حرارة الزنجبيل والتوابل والأخشاب الشرقية.',
    longDescription: 'عطر Mangue Épicée المستوحى من العطر العالمي الشهير God of Fire هو تحفة عطرية استوائية عصرية. ينبض العطر برائحة المانجو الطبيعية الناضجة الممزوجة بالزنجبيل والليمون، وفي القلب تظهر التوت الأحمر مع العود اللطيف والكادي والياسمين، ثم يختتم بقاعدة شرقية دافئة من العنبر والكومارين والأخشاب الفاخرة التي تترك انطباعاً مباهراً ولا يُنسى.',
    topNotes: ['Fresh Mango', 'Lemon', 'Ginger', 'Pink Berries'],
    heartNotes: ['Coumarin', 'Jasmine', 'Dry Woods'],
    baseNotes: ['Amber', 'Agarwood (Oud)', 'Musk', 'Cypriol'],
    volume: '50 ML',
    occasion: ['Special Occasions', 'Evening', 'Parties & Events', 'Date Night'],
    season: ['Summer', 'Spring', 'Fall'],
  },
];

export function getProductBySlug(slug: string): Product | undefined {
  return products.find(p => p.slug === slug);
}

export function getRelatedProducts(id: number): Product[] {
  return products.filter(p => p.id !== id).slice(0, 3);
}
