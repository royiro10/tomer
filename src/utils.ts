

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
export function makeDefer() {
    let deferedCallback: () => void = () => { }; // default to noop

    const setDefer: SetDeferFunc = (func: () => void) => deferedCallback = func;
    const defer = () => deferedCallback();

    return { defer, setDefer };
}