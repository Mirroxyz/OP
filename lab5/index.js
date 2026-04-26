function asyncMapCallback(array, callback, done, options = {}) {
  const { onError = () => {}, signal } = options;
  let index = 0;
  const results = [];
  let active = true;

  const processNext = () => {
    if (!active) return;

    if (signal?.aborted) {
      active = false;
      const error = new DOMException('Aborted', 'AbortError');
      onError(error);
      done(error, null);
      return;
    }

    if (index >= array.length) {
      active = false;
      done(null, results);
      return;
    }

    const currentIndex = index;
    index++;

    try {
      callback(array[currentIndex], currentIndex, array, (err, value) => {
        if (!active) return;

        if (signal?.aborted) {
          active = false;
          const error = new DOMException('Aborted', 'AbortError');
          onError(error);
          done(error, null);
          return;
        }

        if (err) {
          active = false;
          onError(err);
          done(err, null);
          return;
        }

        results[currentIndex] = value;
        processNext();
      });
    } catch (err) {
      active = false;
      onError(err);
      done(err, null);
    }
  };

  const abortListener = () => {
    if (active) {
      active = false;
      const error = new DOMException('Aborted', 'AbortError');
      onError(error);
      done(error, null);
    }
  };

  if (signal) {
    signal.addEventListener('abort', abortListener);
  }

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

    const abortListener = () => {
      active = false;
      signal.removeEventListener('abort', abortListener);
      reject(new DOMException('Aborted', 'AbortError'));
    };

    if (signal) {
      signal.addEventListener('abort', abortListener);
    }

    const processNext = async () => {
      while (index < array.length && active) {
        const currentIndex = index;
        index++;

        try {
          if (signal?.aborted) {
            active = false;
            signal.removeEventListener('abort', abortListener);
            reject(new DOMException('Aborted', 'AbortError'));
            return;
          }

          const value = await mapper(array[currentIndex], currentIndex, array);
          results[currentIndex] = value;
        } catch (err) {
          active = false;
          if (signal) signal.removeEventListener('abort', abortListener);
          reject(err);
          return;
        }
      }

      if (active) {
        active = false;
        if (signal) signal.removeEventListener('abort', abortListener);
        resolve(results);
      }
    };

    processNext();
  });
}

export { asyncMapCallback, asyncMapPromise };
export default { asyncMapCallback, asyncMapPromise };
