import { z } from "zod";

export interface OrderRunForm {
  name: string;
  email: string;
  location: string;
  max: number;
  time: number;
}

export interface OrderRun {
  orderId: string;
  name: string;
  email: string;
  location: string;
  max: number;
  time: number;
  orders: Order[];
}
export interface Order {
  name: string;
  order: string;
}

export const OrderRunFormSchema = z.object({
  name: z.string(),
  email: z.string().email(),
  location: z.string(),
  max: z.number(),
  time: z.number(),
});

export const OrderFormSchema = z.object({
  name: z.string(),
  order: z.string(),
});
