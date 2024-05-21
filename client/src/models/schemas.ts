import { z } from "zod";

export interface OrderRunFormProps {
  name: string;
  email: string;
  location: string;
  max: number;
}

export interface OrderRunProps {
  orderId: string;
  name: string;
  email: string;
  location: string;
  max: number;
  orders: OrderProps[];
}
export interface OrderProps {
  name: string;
  order: string;
}

export const OrderRunFormSchema = z.object({
  name: z.string(),
  email: z.string().email(),
  location: z.string(),
  max: z.number(),
});

export const OrderFormSchema = z.object({
  name: z.string(),
  order: z.string(),
});
