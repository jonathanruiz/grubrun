import { z } from "zod";

export interface OrderRunFormProps {
  name: string;
  email: string;
  location: string;
  max: number;
  time: number;
}

export const OrderRunFormSchema = z.object({
  name: z.string(),
  email: z.string().email(),
  location: z.string(),
  max: z.number(),
  time: z.number(),
});
