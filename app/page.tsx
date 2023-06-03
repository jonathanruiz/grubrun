"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"

import { Button } from "@/components/ui/button"
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"

const formSchema = z.object({
    name: z
        .string()
        .min(2, { message: "Name must contain at least 2 character(s)" }),
    email: z.string().email(),
    maxOrderSize: z.string().min(1).max(100),
    departureTime: z.string().min(1).max(60),
})

export default function IndexPage() {
    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: "",
            email: "",
            maxOrderSize: "",
            departureTime: "",
        },
    })

    function onSubmit(values: z.infer<typeof formSchema>) {
        // Do something with the form values.
        // ✅ This will be type-safe and validated.
        console.log(values)
    }

    return (
        <section className="container grid items-center gap-6 pb-8 pt-6 md:py-10">
            <div className="flex max-w-[980px] flex-col items-start gap-2">
                <h1 className="text-3xl font-extrabold leading-tight tracking-tighter md:text-4xl">
                    Create a new order!
                </h1>
                <Form {...form}>
                    <form
                        onSubmit={form.handleSubmit(onSubmit)}
                        className="space-y-8"
                    >
                        <FormField
                            control={form.control}
                            name="name"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Name</FormLabel>
                                    <FormControl>
                                        <Input
                                            placeholder="Enter name here..."
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormDescription>
                                        This is the name of the person running
                                        the order.
                                    </FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="email"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Email</FormLabel>
                                    <FormControl>
                                        <Input
                                            placeholder="Enter email here..."
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormDescription>
                                        This is the email of the person running
                                        the order.
                                    </FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="maxOrderSize"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Max Order Size</FormLabel>
                                    <FormControl>
                                        <Input
                                            placeholder="Enter max order size here..."
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormDescription>
                                        This is the most number of orders you
                                        are willing to take.
                                    </FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="departureTime"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Departure Time</FormLabel>
                                    <FormControl>
                                        <Input
                                            placeholder="Enter departure time here..."
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormDescription>
                                        This is the departure time of the person
                                        running the order.
                                    </FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <Button type="submit">Submit</Button>
                    </form>
                </Form>
            </div>
        </section>
    )
}
