function asyncMapCallback(array, callback, done, options = {}) {
  const { signal } = options;
  let index = 0;
  const results = [];
  let active = true;

  const abort = () => {
    active = false;
    done(new DOMException('Aborted', 'AbortError'), null);
  };

  const processNext = () => {
    if (!active) return;
    if (signal?.aborted) return abort();
    if (index >= array.length) {
      active = false;
      return done(null, results);
    }

    const currentIndex = index++;
    try {
      callback(array[currentIndex], currentIndex, array, (err, value) => {
        if (!active) return;
        if (signal?.aborted) return abort();
        if (err) {
          active = false;
          return done(err, null);
        }
        results[currentIndex] = value;
        processNext();
      });
    } catch (err) {
      active = false;
      done(err, null);
    }
  };

  if (signal) signal.addEventListener('abort', abort);
  processNext();
}

function asyncMapPromise(array, mapper, options = {}) {
  const { signal } = options;

  return new Promise((resolve, reject) => {
    if (signal?.aborted) {
      reject(new DOMException('Aborted', 'AbortError'));
      return;
    }

    let index = 0;
    const results = [];
    let active = true;

    const abort = () => {
      active = false;
      if (signal) signal.removeEventListener('abort', abort);
      reject(new DOMException('Aborted', 'AbortError'));
    };

    if (signal) signal.addEventListener('abort', abort);

    const processNext = async () => {
      while (index < array.length && active) {
        const currentIndex = index++;
        try {
          if (signal?.aborted) return abort();
          results[currentIndex] = await mapper(array[currentIndex], currentIndex, array);
        } catch (err) {
          active = false;
          if (signal) signal.removeEventListener('abort', abort);
          return reject(err);
        }
      }

      if (active) {
        active = false;
        if (signal) signal.removeEventListener('abort', abort);
        resolve(results);
      }
    };

    processNext();
  });
}

export { asyncMapCallback, asyncMapPromise };
export default { asyncMapCallback, asyncMapPromise };
