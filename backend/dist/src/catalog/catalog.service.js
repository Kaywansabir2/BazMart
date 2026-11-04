"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CatalogService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let CatalogService = class CatalogService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getHomeScreenData() {
        const [categories, brands, countries, banners, allProducts,] = await Promise.all([
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
        const productsFormatted = allProducts.map(p => {
            const totalStock = p.stocks.reduce((acc, s) => acc + (s.stockQuantity - s.reservedQuantity), 0);
            return {
                ...p,
                stockQuantity: totalStock > 0 ? totalStock : 50,
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
    async getCategoryProducts(categoryIdOrSlug) {
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
    async getBrandProducts(brandIdOrName) {
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
    async getCountryProducts(countryIdOrCode) {
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
    async searchProducts(query) {
        if (!query || query.trim() === '') {
            return [];
        }
        const q = query.trim().toLowerCase();
        const all = await this.prisma.product.findMany({
            include: { brand: true, category: true, countryOrigin: true, stocks: true },
        });
        const filtered = all.filter(p => {
            return (p.titleEn.toLowerCase().includes(q) ||
                p.titleCkb.toLowerCase().includes(q) ||
                p.titleAr.toLowerCase().includes(q) ||
                (p.brand?.name && p.brand.name.toLowerCase().includes(q)) ||
                (p.category?.nameEn && p.category.nameEn.toLowerCase().includes(q)));
        });
        return filtered.map(p => ({
            ...p,
            stockQuantity: p.stocks.reduce((acc, s) => acc + (s.stockQuantity - s.reservedQuantity), 0) || 50,
        }));
    }
    async getProductById(id) {
        const product = await this.prisma.product.findUnique({
            where: { id },
            include: { brand: true, category: true, countryOrigin: true, stocks: true },
        });
        if (!product) {
            throw new common_1.NotFoundException(`Product with ID "${id}" not found.`);
        }
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
};
exports.CatalogService = CatalogService;
exports.CatalogService = CatalogService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], CatalogService);
//# sourceMappingURL=catalog.service.js.map