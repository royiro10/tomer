
import { makeBaseLogger, transform } from "./BaseLogger";
import { ILogger, LogRequets } from "./types/ILogger";

export interface ConsoleLogger extends ILogger {
    progress(progressId: number, precent: number): void;
};
export function makeConsoleLogger(): ConsoleLogger {
    const logger: ILogger = makeBaseLogger(log);

    /* progress tracker track progressId to the offest from latest line */
    const progresesTracker: Map<number, number> = new Map<number, number>();

    function log(req: LogRequets) {
        const logRequets: LogRequets = transform(logger, req);
        writeLine(logRequets.data);
        incrementProgressTracker();
    }

    function incrementProgressTracker() {
        progresesTracker.forEach((v, k, m) => m.set(k, v + 1));
    }

    function progress(progressId: number, precent: number) {
        if (precent < 0 || precent > 1) {
            throw new Error(`Invalid precent number (must be 0 >= x >= 1) (${precent})`);
        }

        if (!progresesTracker.has(progressId)) {
            progresesTracker.set(progressId, 0);
        }

        const linesOffest = progresesTracker.get(progressId)!;

        rewriteProgress(linesOffest, precent);
    }


    return { ...logger, progress };
}


/* 
  --------------------------------
 | Stdout Sockets Implementations |
  --------------------------------
*/

type WriteDetails = {
    writeIsDone: boolean;
};

function rewriteProgress(offset: number, precent: number, flags?: { isDetailed?: boolean; }): WriteDetails | void {
    const consoleWidth = process.stdout.columns;

    const progressLineWidth = consoleWidth - formatProgressLine("").length;

    const PROGRESS_DONE_SYMBOL = `█`;
    const PROGRESS_PEDNING_SYMBOL = ` `;
    const progressLineData =
        PROGRESS_DONE_SYMBOL.repeat(Math.floor(progressLineWidth * precent)) +
        PROGRESS_PEDNING_SYMBOL.repeat(Math.floor(progressLineWidth * (1 - precent)));

    process.stdout.moveCursor(0, -(offset + 1));
    process.stdout.clearLine(0);
    const writeResult = writeLine(formatProgressLine(progressLineData), flags);
    process.stdout.moveCursor(0, (offset + 1));

    return writeResult;
}

function formatProgressLine(data: string): string {
    return ` => [ ${data} ]`;
}

function writeLine(msg: string, flags?: { isDetailed?: boolean; }): WriteDetails | void {
    const msgBuffer = Buffer.from(`${msg}\n`);
    const isDetailed = flags?.isDetailed || false;

    if (isDetailed) {
        return writeLine_Detailed(msgBuffer);
    }

    return writeLine_Naive(msgBuffer);
}

function writeLine_Naive(msg: Buffer): void {
    process.stdout.write(msg);
}

function writeLine_Detailed(msg: Buffer): WriteDetails {
    const writeDetails: WriteDetails = {
        writeIsDone: false,
    };

    const _flushedSuccesfully = process.stdout.write(msg, () => {
        writeDetails.writeIsDone = true;
    });

    if (!_flushedSuccesfully) {
        console.warn(`FUCK`);
    }

    return writeDetails;
};