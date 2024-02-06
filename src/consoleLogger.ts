
import { makeBaseLogger, transform } from "./BaseLogger";
import { ILogger, LogRequets } from "./types/ILogger";
import { makeDefer } from "./utils";

const PRINT_LOGO = false;
let isFirst = true;

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
            if (!SHOULD_REWRITE_NEW_LINE) return;

            // write progress on new line
            linesOffest = 0;
            progresesTracker.set(progressId, linesOffest);

            setDefer(() => incrementProgressTracker());
        }

        rewriteProgress(linesOffest, precent);

        defer();
    }


    return { ...logger, progress };
}


/* 
  --------------------------------
 | Stdout Stream Implementations |
  --------------------------------
*/

type WriteDetails = {
    writeIsDone: boolean;
};

const SHOULD_REWRITE_NEW_LINE = true;
function rewriteProgress(offset: number, precent: number, flags?: { isDetailed?: boolean; }): WriteDetails | void {
    const progressLineData = getProressLineData(precent);

    process.stdout.moveCursor(0, -(offset));
    process.stdout.clearLine(0);
    const writeResult = writeLine(progressLineData, flags);
    process.stdout.moveCursor(0, (offset));

    return writeResult;
}

function getProressLineData(precent: number) {
    const consoleWidth = process.stdout.columns;
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

function writeLine(msg: string, flags?: { isDetailed?: boolean; }): WriteDetails | void {
    const msgBuffer = Buffer.from(`${msg}\n`);
    const isDetailed = flags?.isDetailed || false;

    // TODO : remove this to initizliaztion part
    if (PRINT_LOGO && isFirst) {
        isFirst = false;
        writeLine(`${getLogo()}\n`);
    }

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

    return writeDetails;
};



function getLogo() {
    const [x, y] = process.stdout.getWindowSize();
    const MINIMAL_LOGO = `TOMER`;
    const LOGO = `
$$$$$$$$\\  $$$$$$\\  $$\\      $$\\ $$$$$$$$\\ $$$$$$$\\  
\\__$$  __|$$  __$$\\ $$$\\    $$$ |$$  _____|$$  __$$\\ 
   $$ |   $$ /  $$ |$$$$\\  $$$$ |$$ |      $$ |  $$ |
   $$ |   $$ |  $$ |$$\\$$\\$$ $$ |$$$$$\\    $$$$$$$  |
   $$ |   $$ |  $$ |$$ \\$$$  $$ |$$  __|   $$  __$$< 
   $$ |   $$ |  $$ |$$ |\\$  /$$ |$$ |      $$ |  $$ |
   $$ |    $$$$$$  |$$ | \\_/ $$ |$$$$$$$$\\ $$ |  $$ |
   \\__|    \\______/ \\__|     \\__|\\________|\\__|  \\__|        
    `;

    const rows = LOGO.split('\n');
    if (rows.length > y) return MINIMAL_LOGO;
    if (rows.some(row => row.length > x)) return MINIMAL_LOGO;

    return LOGO;
}