import Fastify from 'fastify';
import pingRoutes from './routes/ping';
import authRoutes from './routes/auth';
import rateLimit from '@fastify/rate-limit';



const app = Fastify({ logger: true });

// Enregistre la route
app.register(pingRoutes);
app.register(authRoutes, { prefix: '/auth' });

app.listen({ port: 3000 }, (err, address) => {
  if (err) {
    app.log.error(err);
    process.exit(1);
  }
  app.log.info(`🚀 Server listening at ${address}`);
});

app.register(authRoutes, {
  prefix: '/auth',
  config: {
    rateLimit: {
      max: 5,
      timeWindow: '60s'
    }
  }
});