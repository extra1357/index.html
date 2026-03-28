/**
 * 🛡️ VALIDAÇÃO COM ZOD
 */
import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().email('Email inválido').toLowerCase(),
  password: z.string().min(6, 'Senha deve ter no mínimo 6 caracteres')
});

export type LoginInput = z.infer<typeof loginSchema>;
