import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { normalizeKurdishArabicText } from '../common/linguistic-normalizer';

@Injectable()
export class CatalogService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Complete composite payload for HomeScreen
   */
  async getHomeScreenData() {
    const [
      categories,
      brands,
      countries,
      banners,
      allProducts,
    ] = await Promise.all([
      this.prisma.category.findMany({ orderBy: { sortOrder: 'asc' } }),
      this.prisma.brand.findMany({ orderBy: { sortOrder: 'asc' } }),
      this.prisma.countryOrigin.findMany(),
      this.prisma.campaignBanner.findMany({ orderBy: { sortOrder: 'asc' } }),
      this.prisma.product.findMany({
        include: {
          brand: true,
          category: true,
          countryOrigin: true,
          stocks: true,
        },
      }),
    ]);

    // Format products with available stock
    const productsFormatted = allProducts.map(p => {
      const totalStock = p.stocks.reduce((acc, s) => acc + (s.stockQuantity - s.reservedQuantity), 0);
      return {
        ...p,
        stockQuantity: totalStock > 0 ? totalStock : 50, // default available stock
      };
    });

    const buyAgain = productsFormatted.filter(p => ['p-alrahma', 'p-ramak', 'p-eggs'].includes(p.id) || p.isBestSeller).slice(0, 5);
    const bestSellers = productsFormatted.filter(p => p.isBestSeller || ['p-almarai', 'p-cucumber', 'p-eggs'].includes(p.id)).slice(0, 5);
    const topSavers = productsFormatted.filter(p => p.isTopSaver || (p.discountPercentage && p.discountPercentage >= 15)).slice(0, 5);
    const freshPicks = productsFormatted.filter(p => p.isFreshPick || ['p-shallot', 'p-grapefruit', 'p-pepper'].includes(p.id)).slice(0, 5);
    const tabascoNoodles = productsFormatted.filter(p => p.titleEn.toLowerCase().includes('tabasco') || p.id.startsWith('p-tabasco')).slice(0, 5);
    const icedCoffees = productsFormatted.filter(p => p.titleEn.toLowerCase().includes('iced') || p.id.startsWith('p-nescafe-iced')).slice(0, 5);
    const usuals = productsFormatted.filter(p => ['p-coconut-milk', 'p-rabbit-lollipop', 'p-chewy-candy'].includes(p.id)).slice(0, 5);

    return {
      promoCards: banners.filter(b => b.type === 'VERTICAL_PROMO_CARD'),
      fullWidthBanners: banners.filter(b => b.type === 'FULL_WIDTH_BANNER'),
      categories,
      brands,
      countries,
      buyAgain,
      bestSellers,
      topSavers,
      freshPicks,
      tabascoNoodles,
      icedCoffees,
      usuals,
      allProducts: productsFormatted,
    };
  }

  async getAllCategories() {
    return this.prisma.category.findMany({ orderBy: { sortOrder: 'asc' } });
  }

  async getCategoryProducts(categoryIdOrSlug: string) {
    const category = await this.prisma.category.findFirst({
      where: {
        OR: [
          { id: categoryIdOrSlug },
          { slug: categoryIdOrSlug },
        ],
      },
    });

    const products = await this.prisma.product.findMany({
      where: category ? { categoryId: category.id } : undefined,
      include: { brand: true, category: true, countryOrigin: true, stocks: true },
    });

    return {
      category,
      products: products.map(p => ({
        ...p,
        stockQuantity: p.stocks.reduce((acc, s) => acc + (s.stockQuantity - s.reservedQuantity), 0) || 50,
      })),
    };
  }

  async getAllBrands() {
    return this.prisma.brand.findMany({ orderBy: { sortOrder: 'asc' } });
  }

  async getBrandProducts(brandIdOrName: string) {
    const brand = await this.prisma.brand.findFirst({
      where: {
        OR: [
          { id: brandIdOrName },
          { name: brandIdOrName },
        ],
      },
    });

    const products = await this.prisma.product.findMany({
      where: brand ? { brandId: brand.id } : undefined,
      include: { brand: true, category: true, countryOrigin: true, stocks: true },
    });

    return {
      brand,
      products: products.map(p => ({
        ...p,
        stockQuantity: p.stocks.reduce((acc, s) => acc + (s.stockQuantity - s.reservedQuantity), 0) || 50,
      })),
    };
  }

  async getAllCountries() {
    return this.prisma.countryOrigin.findMany();
  }

  async getCountryProducts(countryIdOrCode: string) {
    const country = await this.prisma.countryOrigin.findFirst({
      where: {
        OR: [
          { id: countryIdOrCode },
          { code: countryIdOrCode.toUpperCase() },
        ],
      },
    });

    const products = await this.prisma.product.findMany({
      where: country ? { countryOriginId: country.id } : undefined,
      include: { brand: true, category: true, countryOrigin: true, stocks: true },
    });

    return {
      country,
      products: products.map(p => ({
        ...p,
        stockQuantity: p.stocks.reduce((acc, s) => acc + (s.stockQuantity - s.reservedQuantity), 0) || 50,
      })),
    };
  }

  async searchProducts(query: string) {
    if (!query || query.trim() === '') {
      return [];
    }

    const qRaw = query.trim().toLowerCase();
    const qNorm = normalizeKurdishArabicText(query);

    const all = await this.prisma.product.findMany({
      include: { brand: true, category: true, countryOrigin: true, stocks: true },
    });

    // Multi-lingual normalized search across Kurdish, Arabic, English and Barcode/SKU
    const filtered = all.filter(p => {
      const en = p.titleEn.toLowerCase();
      const ckb = normalizeKurdishArabicText(p.titleCkb);
      const ar = normalizeKurdishArabicText(p.titleAr);
      const brand = normalizeKurdishArabicText(p.brand?.name || '');
      const cat = p.category?.nameEn.toLowerCase() || '';

      return (
        en.includes(qRaw) ||
        ckb.includes(qNorm) ||
        ar.includes(qNorm) ||
        brand.includes(qNorm) ||
        cat.includes(qRaw) ||
        p.barcode.includes(qRaw) ||
        p.externalErpId.toLowerCase().includes(qRaw)
      );
    });

    return filtered.map(p => ({
      ...p,
      stockQuantity: p.stocks.reduce((acc, s) => acc + (s.stockQuantity - s.reservedQuantity), 0) || 50,
    }));
  }

  async getProductById(id: string) {
    const product = await this.prisma.product.findUnique({
      where: { id },
      include: { brand: true, category: true, countryOrigin: true, stocks: true },
    });

    if (!product) {
      throw new NotFoundException(`Product with ID "${id}" not found.`);
    }

    // Upsell items (Frequently bought together)
    const upsell = await this.prisma.product.findMany({
      where: { id: { not: id } },
      take: 4,
      include: { brand: true, category: true, countryOrigin: true, stocks: true },
    });

    return {
      product: {
        ...product,
        stockQuantity: product.stocks.reduce((acc, s) => acc + (s.stockQuantity - s.reservedQuantity), 0) || 50,
      },
      frequentlyBoughtTogether: upsell.map(p => ({
        ...p,
        stockQuantity: p.stocks.reduce((acc, s) => acc + (s.stockQuantity - s.reservedQuantity), 0) || 50,
      })),
    };
  }
}

