const GROUPS = [
  {
    key: 'main',
    label: 'Món chính',
    subtitle: 'Món cuốn, bò tươi và món nướng',
    keywords: ['cuon', 'bo tuoi', 'mon nuong', 'dac trung'],
  },
  {
    key: 'combo',
    label: 'Combo',
    subtitle: 'Set đầy đặn cho nhóm và gia đình',
    keywords: ['combo', 'set'],
  },
  {
    key: 'hot',
    label: 'Lẩu & món nóng',
    subtitle: 'Lẩu nóng và món dùng khi còn ấm',
    keywords: ['lau', 'mon nong', 'nong'],
  },
  {
    key: 'sides',
    label: 'Món ăn kèm',
    subtitle: 'Món ăn chơi, rau và phần gọi thêm',
    keywords: ['an choi', 'dong que', 'mon phu', 'topping', 'an kem', 'rau them'],
  },
  {
    key: 'drinks',
    label: 'Đồ uống & tráng miệng',
    subtitle: 'Thức uống mát và món ngọt',
    keywords: ['do uong', 'trang mieng', 'nuoc', 'giai khat'],
  },
];

export function normalizeCategoryText(value = '') {
  return String(value)
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D')
    .toLowerCase()
    .replace(/[-_/&]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

export function getCategoryGroup(category = {}) {
  const searchable = normalizeCategoryText(`${category.slug || ''} ${category.name || ''}`);
  const matchOrder = ['combo', 'drinks', 'sides', 'hot', 'main'];
  return matchOrder
    .map((key) => GROUPS.find((group) => group.key === key))
    .find((group) => group.keywords.some((keyword) => searchable.includes(keyword))) || GROUPS[0];
}

export function groupCategories(categories = []) {
  return GROUPS.map(({ keywords, ...group }) => ({
    ...group,
    categories: categories.filter((category) => getCategoryGroup(category).key === group.key),
  })).filter((group) => group.categories.length > 0);
}

export function getProductTypeLabel(product = {}) {
  if (product.is_side_dish && !normalizeCategoryText(product.category_name).includes('do uong')) return 'Món kèm';
  const group = getCategoryGroup({ name: product.category_name, slug: product.category_slug });
  if (group.key === 'combo') return 'Combo';
  if (group.key === 'drinks') return 'Đồ uống';
  if (group.key === 'sides') return 'Món kèm';
  return 'Món chính';
}
