#!/usr/bin/env node
// index.ts (refactored)

// ---------------------------
// 1️⃣ Imports
// ---------------------------
import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import env from 'env-var';
import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';
import * as backlogjs from 'backlog-js';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/streamableHttp.js';
import { createTranslationHelper } from './createTranslationHelper.js';
import { registerDyamicTools, registerTools } from './registerTools.js';
import { dynamicTools } from './tools/dynamicTools/toolsets.js';
import { createToolRegistrar } from './utils/toolRegistrar.js';
import { buildToolsetGroup } from './utils/toolsetUtils.js';
import { wrapServerWithToolRegistry } from './utils/wrapServerWithToolRegistry.js';
import { VERSION } from './version.js';
import { Logger } from './types/logger.js';
// ---------------------------
// 2️⃣ Logger (simple for now)
// ---------------------------
const logger: Logger = {
    info: console.log,
    error: console.error,
};

// ---------------------------
// 3️⃣ Globals
// ---------------------------
let serverInstance: McpServer | null = null;
let transportInstance: StreamableHTTPServerTransport | null = null;

// ---------------------------
// 4️⃣ Start MCP server
// ---------------------------
export async function startServer() {
    dotenv.config();

    const domain = env.get('BACKLOG_DOMAIN').required().asString();
    const apiKey = env.get('BACKLOG_API_KEY').required().asString();
    const backlog = new backlogjs.Backlog({ host: domain, apiKey: apiKey });

    const argv = yargs(hideBin(process.argv))
        .option('max-tokens', {
            type: 'number',
            default: env.get('MAX_TOKENS').default('50000').asIntPositive(),
        })
        .option('optimize-response', {
            type: 'boolean',
            default: env.get('OPTIMIZE_RESPONSE').default('false').asBool(),
        })
        .option('prefix', {
            type: 'string',
            default: env.get('PREFIX').default('').asString(),
        })
        .option('enable-toolsets', {
            type: 'array',
            default: env.get('ENABLE_TOOLSETS').default('all').asArray(','),
        })
        .option('dynamic-toolsets', {
            type: 'boolean',
            default: env.get('ENABLE_DYNAMIC_TOOLSETS').default('false').asBool(),
        })
        .parseSync();

    const useFields = argv.optimizeResponse;
    const maxTokens = argv.maxTokens;
    const prefix = argv.prefix;
    let enabledToolsets = argv.enableToolsets as string[];

    const transHelper = createTranslationHelper();

    if (argv.dynamicToolsets) {
        enabledToolsets = enabledToolsets.filter((a) => a !== 'all');
    }

    const mcpOption = { useFields, maxTokens, prefix };
    const toolsetGroup = buildToolsetGroup(backlog, transHelper, enabledToolsets);

    const serverInstance = wrapServerWithToolRegistry(
        new McpServer({
            name: 'backlog',
            description: useFields ? `GraphQL-style syntax for field selection.` : undefined,
            version: VERSION,
        })
    );

    registerTools(serverInstance, toolsetGroup, mcpOption);

    if (argv.dynamicToolsets) {
        const registrar = createToolRegistrar(serverInstance, toolsetGroup, mcpOption);
        const dynamicToolsetGroup = dynamicTools(registrar, transHelper, toolsetGroup);
        registerDyamicTools(serverInstance, dynamicToolsetGroup, prefix);
    }

    if (argv.exportTranslations) {
        const data = transHelper.dump();
        process.exit(0);
    }

    // ---------------------------
    // Setup HTTP transport + Express
    // ---------------------------
    const app = express();
    app.use(cors());
    app.use(express.json());

    const corsOrigin = env.get('CORS_ORIGIN').default('*').asString();
    if (corsOrigin) {
        app.use(cors({ origin: corsOrigin }));
    }


    const transport = new StreamableHTTPServerTransport({ sessionIdGenerator: undefined });
    transportInstance = transport;

    await serverInstance.connect(transport);

    app.all('/mcp', async (req: Request, res: Response) => {
        try {
            await transport.handleRequest(req, res, req.body);
        } catch (err) {
            logger.error('Transport error:', err);
            if (!res.headersSent) {
                res.status(500).json({ error: 'Internal Server Error' });
            }
        }
    });

    const port = env.get('PORT').default('8080').asPortNumber();
    await new Promise<void>((resolve) => {
        app.listen(port, () => {
            logger.info(`🚀 MCP server listening at http://localhost:${port}/mcp`);
            resolve();
        });
    });

    setupGracefulShutdown();
}

// ---------------------------
// 5️⃣ Graceful shutdown
// ---------------------------
function setupGracefulShutdown() {
    const shutdown = async () => {
        logger.info('🛑 Shutting down gracefully...');
        try {
            if (transportInstance && typeof transportInstance.close === 'function') {
                await transportInstance.close();
            }
            if (serverInstance && typeof serverInstance.close === 'function') {
                await serverInstance.close();
            }
            process.exit(0);
        } catch (err) {
            logger.error('Error during shutdown:', err);
            process.exit(1);
        }
    };

    ['SIGINT', 'SIGTERM'].forEach((signal) => {
        process.on(signal, shutdown);
    });
}

// ---------------------------
// 6️⃣ Main entry point
// ---------------------------
startServer().catch((err) => {
    logger.error('Unhandled error:', err);
    process.exit(1);
});
