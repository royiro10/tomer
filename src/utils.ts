

// an optimized memory version of:
// `Math.max(...arr.map(x => x.value))`
// no cloning needed
export function findMax<T>(items: Array<T>, extractionPredicate: (item: T) => number): number {
    let currentMax = Number.MIN_SAFE_INTEGER;
    for (let i = 0; i < items.length; i++) {
        const extractedValue = extractionPredicate(items[i]);
        if (extractionPredicate(items[i]) > currentMax) {
            currentMax = extractedValue;
        }
    }

    return currentMax;
}

type SetDeferFunc = (func: () => void) => void;

// a custom hook like to created defered functions
export function makeDefer(initalDefer: () => void = () => { }) {
    let deferedCallback: () => void = initalDefer; // default to noop

    const setDefer: SetDeferFunc = (func: () => void) => deferedCallback = func;
    const defer = () => deferedCallback();

    return { defer, setDefer };
}



// match function to proived a bit more functinal approach to switch cases

class NoMatchDefaultError<MatchValue extends string | number | symbol, ReturnType> extends Error {
    constructor(
        public value: MatchValue,
        public matchObj: Record<MatchValue, () => ReturnType> & { [MatchDefault]?: () => ReturnType; }
    ) {
        super(`No Match Case Was Found`);
    }
}

export const MatchDefault = Symbol(`TOMER_MatchDefualt`);
export function match<MatchValue extends string | number | symbol, ReturnType>(
    value: MatchValue,
    matchObj: Record<MatchValue, () => ReturnType> & { [MatchDefault]?: () => ReturnType; }
): ReturnType {
    if (matchObj[MatchDefault]) matchObj[MatchDefault] = () => { throw new NoMatchDefaultError(value, matchObj); };
    const func = matchObj[value] ?? matchObj[MatchDefault];
    return func();
};
