const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const { env } = require('./config/env');
const routes = require('./routes');
const { notFound, errorHandler } = require('./middleware/errorHandler');

const app = express();

app.use(helmet());
app.use(
  cors({
    origin: env.corsOrigins === '*' ? true : env.corsOrigins.split(',').map((s) => s.trim()),
  })
);
app.use(express.json({ limit: '1mb' }));

app.get('/health', (req, res) =>
  res.json({ status: 'ok', service: 'lifecraft-notifications', providers: env.providers })
);

app.use(env.apiPrefix, routes);
app.use(notFound);
app.use(errorHandler);

module.exports = app;