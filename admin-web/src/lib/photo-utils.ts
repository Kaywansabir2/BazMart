export function getPhotoKey(id: string, category?: string): string {
  const cleanId = (id || '').toLowerCase();
  const benchmarkMap: Record<string, string> = {
    'p-alrahma': 'milk_alrahma',
    'p-ramak': 'milk_ramak',
    'p-eggs': 'eggs',
    'p-almarai': 'milk_almarai',
    'p-cucumber': 'cucumber',
    'p-pen': 'pen',
    'p-mountain-dew': 'mountain_dew',
    'p-schauma': 'shampoo',
    'p-shallot': 'shallot',
    'p-grapefruit': 'grapefruit',
    'p-pepper-color': 'pepper_color',
    'p-tabasco-chicken': 'tabasco_chicken',
    'p-tabasco-curry': 'tabasco_curry',
    'p-tabasco-beef': 'tabasco_chicken',
    'p-nescafe-latte': 'nescafe_latte',
    'p-nescafe-cappuccino': 'nescafe_cappuccino',
    'p-nescafe-spanish': 'nescafe_spanish',
    'p-canned-coconut': 'canned_coconut',
    'p-lollipop-fruit': 'lollipop_fruit',
    'p-my-chewy': 'my_chewy',
    'p-pepsi-can': 'pepsi_can',
    'it-1': 'cucumber',
    'it-2': 'milk_almarai',
    'it-3': 'eggs',
    'it-4': 'milk_alrahma',
  };
  if (benchmarkMap[cleanId]) return benchmarkMap[cleanId];
  const cat = (category || '').toLowerCase();
  if (cat.includes('dairy') || cat.includes('milk')) return 'milk';
  if (cat.includes('fruit') || cat.includes('veg')) return 'produce';
  if (cat.includes('meat') || cat.includes('poultry')) return 'meat';
  if (cat.includes('frozen') || cat.includes('ice')) return 'frozen';
  if (cat.includes('bakery') || cat.includes('bread')) return 'bakery';
  if (cat.includes('beverage') || cat.includes('water')) return 'beverage';
  if (cat.includes('coffee') || cat.includes('tea')) return 'coffee';
  if (cat.includes('snack') || cat.includes('chips')) return 'snack';
  if (cat.includes('ready') || cat.includes('noodle')) return 'noodles';
  if (cat.includes('cooking') || cat.includes('pantry') || cat.includes('spices')) return 'pantry';
  if (cat.includes('personal') || cat.includes('baby')) return 'personal_care';
  if (cat.includes('clean') || cat.includes('household')) return 'cleaning';
  if (cat.includes('stationery') || cat.includes('pen')) return 'stationery';
  return 'grocery_generic';
}

