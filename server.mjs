process.env.PORT = '3002';
process.env.NODE_ENV = 'production';
process._getActiveRequests = () => [];
process._getActiveHandles = () => [];
import('./.output/server/index.mjs');
