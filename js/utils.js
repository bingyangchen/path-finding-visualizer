export function throttle(fn, delay) {
    let timer = null;
    return (...args) => {
        if (timer)
            return;
        timer = setTimeout(() => {
            fn(...args);
            timer = null;
        }, delay);
    };
}
