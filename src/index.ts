import { makeConsoleLogger } from "./consoleLogger";
import { ILogger } from "./types/ILogger";
import { ConsoleLogger } from "./types/ConsoleLogger";

const SLOW_RATE = 100;
main();

async function main() {
    const logger = makeConsoleLogger();

    // logger.progress(1, 0.2);
    // logger.info(`hello world`);
    // logger.progress(1, 0.3);

    await Promise.all([
        task(4, logger),
        task(8, logger)
    ]);
}

async function task(taskId: number, logger: ConsoleLogger) {
    logger.info(`start`);

    const SIZE = 15;
    for (let i = 1; i <= SIZE; i++) {
        await sleep(SLOW_RATE);
        logger.progress(taskId, i / SIZE);
        await sleep(SLOW_RATE);
        logger.debug(`progress ${taskId} - ${i}/${SIZE}`);
        await sleep(SLOW_RATE);
        logger.progress(taskId + 1, (SIZE - i) / SIZE);
    }
}

function sleep(ms: number): Promise<void> {
    return new Promise(res => setTimeout(res, ms));
}