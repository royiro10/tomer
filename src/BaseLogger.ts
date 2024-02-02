import { ILogger, LOG_LEVELS, LogMessage, LogRequets, LogTransformation, TransformationStack } from "./types/ILogger";

export const DEFAULT_FORMATERS = {
    timestamp: (req: LogRequets) => {
        req.data = `[${new Date().toISOString()}] ${req.data}`;
        return req;
    },
    levelPrefix: (req: LogRequets) => {
        req.data = `[${req.level.toUpperCase()}] ${req.data}`;
        return req;
    }
} as const;

export function makeDefaultTransformationStack(): TransformationStack {
    return [DEFAULT_FORMATERS.levelPrefix, DEFAULT_FORMATERS.timestamp];
}

export function makeBaseLogger(log: (req: LogRequets) => void): ILogger {
    const logger: ILogger = {
        transformations: makeDefaultTransformationStack(),
        withTransformation: (tranformation) => appendTransformation(logger, tranformation),
        error: (msg: LogMessage) => log({ data: msg, level: LOG_LEVELS.ERROR }),
        warn: (msg: LogMessage) => log({ data: msg, level: LOG_LEVELS.WARN }),
        info: (msg: LogMessage) => log({ data: msg, level: LOG_LEVELS.INFO }),
        debug: (msg: LogMessage) => log({ data: msg, level: LOG_LEVELS.DEBUG }),
    };

    return logger;
}

export function transform(logger: ILogger, req: LogRequets): LogRequets {
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