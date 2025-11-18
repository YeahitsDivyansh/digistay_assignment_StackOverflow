module.exports = function rateLimiter(maxRequests, windowMs) {
  const store = new Map();

  return (req, res, next) => {
    const key = req.ip || req.headers["x-forwarded-for"] || "global";
    const now = Date.now();
    const entry = store.get(key);

    if (!entry || now - entry.start >= windowMs) {
      store.set(key, { count: 1, start: now });
      return next();
    }

    if (entry.count >= maxRequests) {
      const retryAfter = Math.ceil((windowMs - (now - entry.start)) / 1000);
      res.set("Retry-After", retryAfter.toString());
      return res
        .status(429)
        .json({ message: "Too many requests. Please slow down." });
    }

    entry.count += 1;
    return next();
  };
};
