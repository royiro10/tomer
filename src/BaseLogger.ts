import { LOG_LEVELS, type ILogger, type LogMessage, type LogRequest, type LogTransformation, type LoggerOptions, type TransformationStack } from "./types/ILogger";

export const DEFAULT_FORMATERS = {
    timestamp: (req: LogRequest) => {
        req.data = `[${new Date().toISOString()}] ${req.data}`;
        return req;
    },
    levelPrefix: (req: LogRequest) => {
        req.data = `[${req.level.toUpperCase()}] ${req.data}`;
        return req;
    }
} as const;

export function makeDefaultTransformationStack(): TransformationStack {
    return [DEFAULT_FORMATERS.levelPrefix, DEFAULT_FORMATERS.timestamp];
}

export function makeBaseLogger(log: (req: LogRequest) => void, _opts?: LoggerOptions): ILogger {
    const logger: ILogger = {
        transformations: makeDefaultTransformationStack(),
        withTransformation: (tranformation) => appendTransformation(logger, tranformation),
        error: (msg: LogMessage) => log(transform(logger, { data: msg, level: LOG_LEVELS.ERROR })),
        warn: (msg: LogMessage) => log(transform(logger, { data: msg, level: LOG_LEVELS.WARN })),
        info: (msg: LogMessage) => log(transform(logger, { data: msg, level: LOG_LEVELS.INFO })),
        debug: (msg: LogMessage) => log(transform(logger, { data: msg, level: LOG_LEVELS.DEBUG })),
    };

    return logger;
}

export function transform(logger: ILogger, req: LogRequest): LogRequest {
    return logger.transformations.reduce((transformedRequets, transform) => transform(transformedRequets), { ...req });
}

export function wrapTransformation(logger: ILogger, decorator: LogTransformation): ILogger {
    logger.transformations.push(decorator);
    return logger;
}

export function appendTransformation(logger: ILogger, decorator: LogTransformation): ILogger {
    logger.transformations.unshift(decorator);
    return logger;
}