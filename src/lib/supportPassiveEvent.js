let passiveSupported = false;

if (typeof window !== 'undefined') {
  try {
    var options = Object.defineProperty({}, 'passive', {
      get: function() {
        passiveSupported = true;
      }
    });

    window.addEventListener('test', null, options);
  } catch (err) {}
}

export default passiveSupported;
