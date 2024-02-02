import { ConsoleLogger, makeConsoleLogger } from "./consoleLogger";
import { ILogger } from "./types/ILogger";

main();

async function main() {
    const logger = makeConsoleLogger();

    // logger.progress(1, 0.2);
    // logger.info(`hello world`);
    // logger.progress(1, 0.3);

    await Promise.all([task(4, logger), task(8, logger)]);
}

async function task(taskId: number, logger: ConsoleLogger) {
    logger.info(`start`);

    const SIZE = 10;
    for (let i = 1; i <= SIZE; i++) {
        await sleep(100);
        logger.progress(taskId, i / SIZE);
        logger.debug(`progress ${taskId} - ${i}/${SIZE}`);
    }
}

function sleep(ms: number): Promise<void> {
    return new Promise(res => setTimeout(res, ms));
}