
import { makeBaseLogger } from "./BaseLogger";
import { ILogger, LOG_LEVELS, LogRequest } from "./types/ILogger";
import { ConsoleLogger, ConsoleLoggerOptions } from "./types/ConsoleLogger";
import { makeDefer, match } from "./utils";

const DEFUALT_OPTIONS: ConsoleLoggerOptions = {
    SHOULD_REWRITE_NEW_LINE: true
};

export function makeConsoleLogger(opts?: ConsoleLoggerOptions): ConsoleLogger {
    const options = opts ? { ...DEFUALT_OPTIONS, ...opts } : DEFUALT_OPTIONS;
    const logger: ILogger = makeBaseLogger(log, options);

    /* progress tracker track progressId to the offest from latest line */
    const progresesTracker: Map<number, number> = new Map<number, number>();

    function getStreamByLevel(level: LOG_LEVELS): NodeJS.WriteStream & { fd: 2 | 1; } {
        const stdLogger = match<
            LOG_LEVELS,
            NodeJS.WriteStream & { fd: 2 | 1; }
        >(level, {
            [LOG_LEVELS.ERROR]: () => process.stderr,
            [LOG_LEVELS.WARN]: () => process.stderr,
            [LOG_LEVELS.INFO]: () => process.stdout,
            [LOG_LEVELS.DEBUG]: () => process.stdout,
        });

        return stdLogger;
    }

    function log(req: LogRequest) {
        const stream = getStreamByLevel(req.level);
        stream.write(req.data + '\n');

        incrementProgressTracker();
    }

    function incrementProgressTracker() {
        progresesTracker.forEach((v, k, m) => m.set(k, v + 1));
    }

    function progress(progressId: number, precent: number, level: LOG_LEVELS = LOG_LEVELS.INFO) {
        const { defer, setDefer } = makeDefer();

        if (precent < 0 || precent > 1) {
            throw new Error(`Invalid precent number (must be 0 >= x >= 1) (${precent})`);
        }


        if (!progresesTracker.has(progressId)) {
            progresesTracker.set(progressId, 0);

            setDefer(() => incrementProgressTracker());
        }

        let linesOffest = progresesTracker.get(progressId)!;
        const consoleHeight = process.stdout.rows;

        // because the way console are set in case of rewrite overfloe terminal height, it can not be rewriten. :(
        if (linesOffest >= consoleHeight) {
            // you can pass SHOULD_REWRITE_NEW_LINE=true for it to just write a new line
            if (!options.SHOULD_REWRITE_NEW_LINE) return;

            // write progress on new line
            linesOffest = 0;
            progresesTracker.set(progressId, linesOffest);

            setDefer(() => incrementProgressTracker());
        }

        rewriteProgress(getStreamByLevel(level), linesOffest, precent);

        defer();
    }


    return { ...logger, progress };
}


function rewriteProgress(stream: NodeJS.WriteStream, offset: number, precent: number, flags?: { isDetailed?: boolean; }): void {
    const progressLineData = getProressLineData(stream, precent);

    stream.moveCursor(0, -(offset));
    stream.clearLine(0);
    stream.write(progressLineData + '\n');
    stream.moveCursor(0, (offset));
}

function getProressLineData(stream: NodeJS.WriteStream, precent: number) {
    const consoleWidth = stream.columns;
    const progressLineWidth = consoleWidth - formatProgressLine("").length;

    const PROGRESS_DONE_SYMBOL = `█`;
    const PROGRESS_PEDNING_SYMBOL = ` `;
    const progressLineData =
        PROGRESS_DONE_SYMBOL.repeat(Math.floor(progressLineWidth * precent)) +
        PROGRESS_PEDNING_SYMBOL.repeat(Math.floor(progressLineWidth * (1 - precent)));

    return formatProgressLine(progressLineData);
}

function formatProgressLine(data: string): string {
    return ` => [ ${data} ]`;
}

