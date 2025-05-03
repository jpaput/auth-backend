import { z } from 'zod';

export const signupSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6)
});

export const loginSchema = signupSchema; // identique

export const refreshSchema = z.object({
  refreshToken: z.string().min(20)
});

export const logoutSchema = refreshSchema;