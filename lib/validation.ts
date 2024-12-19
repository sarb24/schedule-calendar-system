import { z } from 'zod'

export const shiftSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  startTime: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/),
  endTime: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/),
  type: z.enum(['MORNING', 'AFTERNOON', 'NIGHT', 'DAY']),
})

export const bookingSchema = z.object({
  shiftId: z.number().int().positive(),
  serviceUserId: z.number().int().positive(),
})

export function sanitizeHtml(input: string): string {
  return input.replace(/</g, "&lt;").replace(/>/g, "&gt;")
}

