"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const app_module_1 = require("./app.module");
const common_1 = require("@nestjs/common");
async function bootstrap() {
    const logger = new common_1.Logger('BazMartBackend');
    const app = await core_1.NestFactory.create(app_module_1.AppModule);
    app.enableCors({
        origin: [
            'http://localhost:4000',
            'http://127.0.0.1:4000',
            'http://localhost:4002',
            'http://127.0.0.1:4002',
            'http://localhost',
            '*',
        ],
        methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
        credentials: true,
    });
    app.useGlobalPipes(new common_1.ValidationPipe({
        whitelist: true,
        transform: true,
        transformOptions: { enableImplicitConversion: true },
    }));
    const port = process.env.PORT ? parseInt(process.env.PORT, 10) : 4001;
    await app.listen(port);
    logger.log(`=======================================================`);
    logger.log(` BazMart Production-Grade NestJS API running on:`);
    logger.log(` http://localhost:${port}/api/v1`);
    logger.log(` CORS enabled for: http://localhost:4000`);
    logger.log(` Port 3000 is untouched and preserved.`);
    logger.log(`=======================================================`);
}
bootstrap();
//# sourceMappingURL=main.js.map