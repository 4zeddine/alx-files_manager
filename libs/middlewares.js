import express from 'express';

/**
 * Handles adding middlewares to the application.
 * @param {express.Express} api The express app.
 */
const injectMiddlewares = (api) => {
  api.use(express.json({ limit: '200mb' }));
};

export default injectMiddlewares;
