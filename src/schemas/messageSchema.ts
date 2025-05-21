import {z} from 'zod';

export const messageSchema = z.object({
    content: z.string()
    .min(10, {message: 'Content must be of 10 characters or more'})
    .max(300, {message: 'Content must be of 300 characters or less'})
})