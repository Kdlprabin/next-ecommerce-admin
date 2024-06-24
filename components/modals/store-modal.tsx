"use client"

import { Modal } from "@/components/ui/modal"
import useStoreModal from "@/hooks/use-store-modal"
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { toast } from "react-hot-toast"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { useState } from "react"
import axios from "axios"
import { redirect } from "next/navigation"

const formSchema = z.object({
    name: z.string().min(1)
})

export const StoreModal = () => {
    const { isOpen, onClose } = useStoreModal();

    const [loading, setLoading] = useState(false);

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: ""
        }
    });

    const onSubmit = async (values: z.infer<typeof formSchema>) => {
        try {
            setLoading(true);

            const response = await axios.post('/api/stores', values);

            toast.success("Store created!");
            setLoading(false);

            window.location.assign(`/${response.data.id}`)
        }
        catch (error) {
            toast.error("Something went wrong")
            console.log(error);
            setLoading(false);
        }
    }

    return (<Modal
        title="Create Store"
        description="Add a new store to manage products"
        isOpen={isOpen}
        onClose={onClose}
    >
        <div>
            <div className="space-y-4 py-2 pb-4">
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)}>
                        <FormField
                            control={form.control}
                            name="name"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Name</FormLabel>
                                    <FormControl>
                                        <Input disabled={loading} placeholder="E-commerce" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <div className="pt-6 space-x-2 flex items-center justify-end">
                            <Button
                                disabled={loading}
                                onClick={onClose}
                                variant={"outline"}>
                                Cancel
                            </Button>
                            <Button
                                disabled={loading}
                                type="submit"
                            >
                                Continue
                            </Button>
                        </div>
                    </form>
                </Form>
            </div>
        </div>
    </Modal>)
}