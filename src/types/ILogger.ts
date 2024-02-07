export const LOG_LEVELS = {
    ERROR: `error`,
    WARN: `warn`,
    INFO: `info`,
    DEBUG: `debug`
} as const;

export type LOG_LEVELS = typeof LOG_LEVELS[keyof typeof LOG_LEVELS];

export type LogMessage = string;

export type Loggable = {
    [k in LOG_LEVELS]: (msg: LogMessage) => void
};

export type LogRequest = {
    data: LogMessage,
    level: LOG_LEVELS;
};

export type LogTransformation = (req: LogRequest) => LogRequest;

export type TransformationStack = Array<LogTransformation>;


export interface ILogger extends Loggable {
    transformations: TransformationStack;
    withTransformation: (tranformation: LogTransformation) => ILogger;
}

export interface LoggerOptions { }