import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { getCategoryGroup, groupCategories, getProductTypeLabel, normalizeCategoryText } from '../src/utils/menuCategories.js';

describe('menu category semantic mapping', () => {
  const categories = [
    { id: 1, name: 'Món Cuốn Đặc Trưng', slug: 'cuon-dac-trung' },
    { id: 2, name: 'Bò Tươi Mỗi Ngày', slug: 'bo-tuoi-moi-ngay' },
    { id: 3, name: 'Combo Cuốn Thịnh Soạn', slug: 'combo-thinh-soan' },
    { id: 4, name: 'Lẩu Ấm Nồng', slug: 'lau-am-nong' },
    { id: 5, name: 'Món Nướng Đậm Vị', slug: 'mon-nuong-dam-vi' },
    { id: 6, name: 'Món Ăn Chơi & Đồng Quê', slug: 'mon-an-choi-dong-que' },
    { id: 7, name: 'Đồ Uống & Tráng Miệng', slug: 'do-uong-trang-mieng' },
    { id: 8, name: 'Món Phụ & Rau Thêm', slug: 'mon-phu-topping' },
  ];

  it('normalizes Vietnamese text for matching', () => {
    assert.equal(normalizeCategoryText('Đồ Uống'), 'do uong');
    assert.equal(normalizeCategoryText('Lẩu Ấm Nồng'), 'lau am nong');
    assert.equal(normalizeCategoryText('Món Phụ & Rau Thêm'), 'mon phu rau them');
  });

  it('maps categories to the correct semantic groups', () => {
    assert.equal(getCategoryGroup({ slug: 'cuon-dac-trung' }).key, 'main');
    assert.equal(getCategoryGroup({ slug: 'bo-tuoi-moi-ngay' }).key, 'main');
    assert.equal(getCategoryGroup({ slug: 'mon-nuong-dam-vi' }).key, 'main');
    assert.equal(getCategoryGroup({ slug: 'combo-thinh-soan' }).key, 'combo');
    assert.equal(getCategoryGroup({ slug: 'lau-am-nong' }).key, 'hot');
    assert.equal(getCategoryGroup({ slug: 'mon-an-choi-dong-que' }).key, 'sides');
    assert.equal(getCategoryGroup({ slug: 'mon-phu-topping' }).key, 'sides');
    assert.equal(getCategoryGroup({ slug: 'do-uong-trang-mieng' }).key, 'drinks');
  });

  it('groups categories without hardcoding IDs', () => {
    const grouped = groupCategories(categories);
    const keys = grouped.map((group) => group.key);
    assert.ok(keys.includes('main'));
    assert.ok(keys.includes('combo'));
    assert.ok(keys.includes('hot'));
    assert.ok(keys.includes('sides'));
    assert.ok(keys.includes('drinks'));
    assert.ok(grouped.find((group) => group.key === 'main').categories.length >= 3);
    assert.ok(grouped.find((group) => group.key === 'sides').categories.length >= 2);
  });

  it('returns a stable label for product types', () => {
    assert.equal(getProductTypeLabel({ category_name: 'Món Cuốn Đặc Trưng' }), 'Món chính');
    assert.equal(getProductTypeLabel({ category_name: 'Combo Cuốn Thịnh Soạn' }), 'Combo');
    assert.equal(getProductTypeLabel({ category_name: 'Đồ Uống & Tráng Miệng' }), 'Đồ uống');
    assert.equal(getProductTypeLabel({ category_name: 'Món Phụ & Rau Thêm', is_side_dish: true }), 'Món kèm');
  });
});
