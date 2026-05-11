module.exports = {
  Passkeys: {
    isSupported: () => false,
    create: () => Promise.reject(new Error("Passkeys not supported")),
    get: () => Promise.reject(new Error("Passkeys not supported")),
  },
};
