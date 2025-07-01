import { z } from 'zod';

export const ALLOWED_BYTES = 500000; // 500kb

export const ALLOWED_MIME_TYPES = ['image/jpg', 'image/jpeg', 'image/png'];

// export const uploadImageSchema = z.instanceof(File).superRefine((f, ctx) => {
//   if (!ALLOWED_MIME_TYPES.includes(f.type)) {
//     ctx.addIssue({
//       code: z.ZodIssueCode.custom,
//       message: `File type is not allowed, must be between ${ALLOWED_MIME_TYPES.join(', ')}, but found ${f.type}`,
//     });
//   }

//   if (f.size > ALLOWED_BYTES) {
//     ctx.addIssue({
//       code: z.ZodIssueCode.too_big,
//       type: 'array',
//       message: `The file must not be larger than ${ALLOWED_BYTES}, found bytes: ${
//         f.size
//       }`,
//       maximum: ALLOWED_BYTES,
//       inclusive: true,
//     });
//   }
// });

export const assignVerificationSchema = z.object({
  trashId: z.string(),
  organicWeight: z.number(),
  anorganicWeight: z.number(),
  residuWeight: z.number(),
  organicImage: z.string(),
  anorganicImage: z.string(),
  residuImage: z.string(),
  verificationNote: z.string().optional(),
  // organicImage: uploadImageSchema,
  // anorganicImage: uploadImageSchema,
  // residuImage: uploadImageSchema,
});

export type AssignVerificationDto = z.infer<typeof assignVerificationSchema>;

export interface IAssignVerification
  extends z.infer<typeof assignVerificationSchema> {}
