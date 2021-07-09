let passiveSupported = false; // eslint-disable-line

if (typeof window !== 'undefined') {
    try {
        const options = Object.defineProperty({}, 'passive', {
            // eslint-disable-next-line getter-return
            get() {
                passiveSupported = true;
            },
        });

        window.addEventListener('test', null, options);
        window.removeEventListener('test', null, options);
    } catch (err) {} // eslint-disable-line no-empty
}

export default passiveSupported;
