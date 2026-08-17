/**
 * Wrapper que captura errores en rutas async de Express
 * y los pasa al middleware de error global.
 * @param {Function} fn - Función async del controlador
 */
const asyncHandler = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);

module.exports = asyncHandler;
