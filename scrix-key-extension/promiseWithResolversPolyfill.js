const namespace = globalThis.Promise;
function withResolvers() {
  let resolve = null;
  let reject = null;
  const promise = new Promise((res, rej) => {
    resolve = res;
    reject = rej;
  });
  return {
    promise,
    resolve,
    reject,
  };
}

if (!Object.hasOwn(namespace, withResolvers.name)) {
  Object.defineProperty(namespace, withResolvers.name, {
    enumerable: false,
    configurable: true,
    writable: true,
    value: withResolvers,
  });
}
