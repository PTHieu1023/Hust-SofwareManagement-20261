import { Router } from 'express';
import path from 'node:path';
import fs from 'node:fs';
import logger from './logger.config';

interface RouteModule {
    default: Router;
}

/**
 * Router collector that auto-loads route files in dev (.ts) or prod (.js)
 */
class RouterCollector {
    private readonly router: Router;
    private readonly routesDir: string;
    private readonly baseApiPath: string;
    private readonly ext: string;         // <-- detect ts or js automatically

    constructor(routesDir: string, baseApiPath: string = '/api') {
        this.router = Router();
        this.routesDir = routesDir;
        this.baseApiPath = baseApiPath;

        // Detect runtime: .ts (dev) / .js (prod)
        this.ext = path.extname(__filename) === '.ts' ? 'ts' : 'js';
    }

    private getEndpointPath(filePath: string): string {
        const relativePath = path.relative(this.routesDir, filePath);
        const withoutExtension = relativePath.replace(/\.routes\.(ts|js)$/, '');
        return `/${withoutExtension}`;
    }

    private async loadRouteModule(filePath: string): Promise<void> {
        try {
            // We use absolute path without file:// to avoid MODULE_NOT_FOUND
            const absolutePath = path.resolve(filePath);

            // dynamic import
            const module: RouteModule = await import(absolutePath);

            if (!module.default) {
                logger.warn(`Module at ${filePath} does not export a default router`);
                return;
            }

            const endpointPath = this.getEndpointPath(filePath);
            const fullPath = `${this.baseApiPath}${endpointPath}`;

            this.router.use(fullPath, module.default);
            logger.info(`[SUCCESS] Registered route: ${fullPath} -> ${path.basename(filePath)}`);
        } catch (error) {
            logger.error(`Failed to load route module at ${filePath}:`, error);
        }
    }

    private async traverseDirectory(dirPath: string): Promise<void> {
        const items = fs.readdirSync(dirPath);

        for (const item of items) {
            const itemPath = path.join(dirPath, item);
            const stats = fs.statSync(itemPath);

            if (stats.isDirectory()) {
                await this.traverseDirectory(itemPath);
            }

            // Only load files with the correct extension
            else if (stats.isFile() && item.endsWith(`.routes.${this.ext}`)) {
                await this.loadRouteModule(itemPath);
            }
        }
    }

    async collect(): Promise<Router> {
        logger.info(`[Starting...] Collecting routes from: ${this.routesDir}`);

        if (!fs.existsSync(this.routesDir)) {
            logger.error(`Routes directory not found: ${this.routesDir}`);
            return this.router;
        }

        await this.traverseDirectory(this.routesDir);
        logger.info(`[Finished] Route collection completed`);

        return this.router;
    }
}

export default async function getRouter(baseApiPath: string = '/api'): Promise<Router> {
    /**
     * Use:
     * - src/routes in development
     * - dist/routes in production
     */
    const isTs = path.extname(__filename) === '.ts';
    const rootDir = process.cwd();

    const routesDir = isTs
        ? path.resolve(rootDir, 'src', 'routes')
        : path.resolve(rootDir, 'dist', 'routes');

    const collector = new RouterCollector(routesDir, baseApiPath);
    return await collector.collect();
}
