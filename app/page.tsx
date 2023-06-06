"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { format } from "date-fns"
import { useForm } from "react-hook-form"
import * as z from "zod"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
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
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"
import { Icons } from "@/components/icons"

const formSchema = z.object({
    name: z
        .string()
        .min(2, { message: "Name must contain at least 2 character(s)" }),
    email: z.string().email(),
    maxOrderSize: z.string().min(1).max(100),
    departureTime: z.date({
        required_error: "Departure time is required",
    }),
})

const IndexPage = () => {
    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
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
                                <FormItem className="flex flex-col">
                                    <FormLabel>Departure Time</FormLabel>
                                    <Popover>
                                        <PopoverTrigger asChild>
                                            <FormControl>
                                                <Button
                                                    variant={"outline"}
                                                    className={cn(
                                                        "w-[240px] pl-3 text-left font-normal",
                                                        !field.value &&
                                                            "text-muted-foreground"
                                                    )}
                                                >
                                                    {field.value ? (
                                                        format(
                                                            field.value,
                                                            "PPP"
                                                        )
                                                    ) : (
                                                        <span>Pick a date</span>
                                                    )}
                                                    <Icons.calendar className="ml-auto h-4 w-4 opacity-50" />
                                                </Button>
                                            </FormControl>
                                        </PopoverTrigger>
                                        <PopoverContent
                                            className="w-auto p-0"
                                            align="start"
                                        >
                                            <Calendar
                                                mode="single"
                                                selected={field.value}
                                                onSelect={field.onChange}
                                                disabled={(date) =>
                                                    date <
                                                    new Date(
                                                        new Date().setDate(
                                                            new Date().getDate() -
                                                                1
                                                        )
                                                    )
                                                }
                                                initialFocus
                                            />
                                        </PopoverContent>
                                    </Popover>
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

export default IndexPage
