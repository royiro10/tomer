
import { ILogger, LoggerOptions } from "./ILogger";

export interface ConsoleLogger extends ILogger {
    progress(progressId: number, precent: number): void;
};

export interface ConsoleLoggerOptions extends LoggerOptions {
    SHOULD_REWRITE_NEW_LINE: boolean;
}