import { FastifyRequest, FastifyReply } from 'fastify';
import { verifyJwt } from '../lib/auth';
import prisma from '../lib/prisma';

export async function authGuard(request: FastifyRequest, reply: FastifyReply) {
  const authHeader = request.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return reply.status(401).send({ error: 'Token manquant' });
  }

  const token = authHeader.split(' ')[1];
  const payload = verifyJwt(token);

  if (!payload || typeof payload !== 'object' || !('userId' in payload)) {
    return reply.status(401).send({ error: 'Token invalide' });
  }

  const user = await prisma.user.findUnique({
    where: { id: payload.userId as string },
    select: { id: true, email: true, createdAt: true }
  });

  if (!user) {
    return reply.status(404).send({ error: 'Utilisateur introuvable' });
  }

  // @ts-ignore — on injecte dynamiquement dans la requête
  request.user = user;
}