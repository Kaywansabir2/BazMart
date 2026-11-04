# BazMart Backend Service (Phase 2)

## Overview
The BazMart backend is a high-throughput, cloud-native API service built on **NestJS (TypeScript)**, **Prisma ORM**, **PostgreSQL**, and **Redis**. It handles dark store order orchestration, rider dispatch, inventory reservations, ERP synchronization, and payment gateway webhooks.

## Target Cloud Infrastructure (Google Cloud Platform)
- **Compute:** Google Cloud Run (Fully managed, autoscaling containerized microservice)
- **Database:** Google Cloud SQL (PostgreSQL 16) with High Availability
- **In-Memory Cache & Lock Store:** Google Cloud Memorystore for Redis (Used for distributed locks on inventory items and cart reservations)
- **Asset Storage:** Google Cloud Storage (GCS) for optimized WebP product media and banner assets
- **Messaging & Event Streaming:** Google Cloud Pub/Sub for ERP catalog sync webhooks and delivery fleet status updates

## Key Modules
1. `CatalogModule`: Manages categories, brands, products, barcodes, and price tiers.
2. `InventoryModule`: Real-time stock counts by Dark Store ID / Warehouse ID.
3. `OrderModule`: Cart validation, minimum order enforcement (`IQD 7000`), COD order placement.
4. `ErpSyncModule`: Scheduled cron tasks and webhook receivers to ingest delta feeds from external ERP / POS.
5. `PaymentModule`: Pluggable payment strategies (COD, FastPay, ZainCash, FIB, Cards).
