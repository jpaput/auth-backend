import { FastifyInstance } from 'fastify';
import { signJwt, generateRefreshToken } from '../lib/auth';
import { verifyJwt } from '../lib/auth';
import { authGuard } from '../plugins/authGuard';

import { loginSchema } from '../schemas/auth';
import { refreshSchema } from '../schemas/auth';


import bcrypt from 'bcrypt';
import prisma from '../lib/prisma';




export default async function authRoutes(app: FastifyInstance) {

  app.post('/signup', async (request, reply) => {
    const parse = loginSchema.safeParse(request.body);

  if (!parse.success) {
    return reply.status(400).send({ error: 'Format invalide', details: parse.error.errors });
  }

  const { email, password } = parse.data;

    // Vérif basique
    if (!email || !password) {
      return reply.status(400).send({ error: 'Email et mot de passe requis' });
    }

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return reply.status(409).send({ error: 'Email déjà utilisé' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword
      }
    });

    // Simulation de sauvegarde
    return reply.status(201).send({
      message: 'Utilisateur simulé enregistré',
      email,
      passwordHash: hashedPassword
    });
  });


  app.post('/login', async (request, reply) => {
    const parse = loginSchema.safeParse(request.body);

  if (!parse.success) {
    return reply.status(400).send({ error: 'Format invalide', details: parse.error.errors });
  }

  const { email, password } = parse.data;
  
    if (!email || !password) {
      return reply.status(400).send({ error: 'Email et mot de passe requis' });
    }
  
    const user = await prisma.user.findUnique({ where: { email } });
  
    if (!user) {
      return reply.status(401).send({ error: 'Utilisateur non trouvé' });
    }
  
    const passwordMatch = await bcrypt.compare(password, user.password);
  
    if (!passwordMatch) {
      return reply.status(401).send({ error: 'Mot de passe incorrect' });
    }
  
    const accessToken = signJwt({ userId: user.id }, '15m');
const refreshToken = generateRefreshToken();

// stocke en base
const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 jours

await prisma.refreshToken.create({  // ← ne doit plus faire d'erreur
    data: {
      token: "xyz",
      userId: "abc",
      expiresAt: new Date()
    }
  });

return reply.send({
  message: 'Connexion réussie',
  accessToken,
  refreshToken,
  user: {
    id: user.id,
    email: user.email,
    createdAt: user.createdAt
  }
});

  });

  app.get('/me', { preHandler: authGuard }, async (request, reply) => {
    return reply.send({ user: request.user });
  });

  app.post('/refresh', async (request, reply) => {

    const parse = refreshSchema.safeParse(request.body);
  if (!parse.success) {
    return reply.status(400).send({ error: 'Token malformé', details: parse.error.errors });
  }

  const { refreshToken } = parse.data;
    if (!refreshToken) {
      return reply.status(400).send({ error: 'Refresh token requis' });
    }
  
    const stored = await prisma.refreshToken.findUnique({
      where: { token: refreshToken },
      include: { user: true }
    });
  
    // Token invalide ou expiré ?
    if (!stored || stored.expiresAt < new Date()) {
      return reply.status(401).send({ error: 'Refresh token invalide ou expiré' });
    }
  
    // 🔥 Supprimer l'ancien refresh token
    await prisma.refreshToken.delete({ where: { token: refreshToken } });
  
    // 🔁 Générer un nouveau refresh token
    const newRefreshToken = generateRefreshToken();
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 jours
  
    await prisma.refreshToken.create({
      data: {
        token: newRefreshToken,
        userId: stored.userId,
        expiresAt,
      }
    });
  
    // 🎟️ Nouveau access token
    const accessToken = signJwt({ userId: stored.userId }, '15m');
  
    return reply.send({
      accessToken,
      refreshToken: newRefreshToken,
      user: {
        id: stored.user.id,
        email: stored.user.email,
        createdAt: stored.user.createdAt
      }
    });
  });


  app.post('/logout', async (request, reply) => {
    const parse = refreshSchema.safeParse(request.body);
    
    if (!parse.success) {
      return reply.status(400).send({ error: 'Token malformé', details: parse.error.errors });
    }
  
    const { refreshToken } = parse.data;  
    if (!refreshToken) {
      return reply.status(400).send({ error: 'Refresh token requis' });
    }
  
    await prisma.refreshToken.deleteMany({
      where: { token: refreshToken },
    });
  
    return reply.send({ message: 'Déconnexion réussie' });
  });
}