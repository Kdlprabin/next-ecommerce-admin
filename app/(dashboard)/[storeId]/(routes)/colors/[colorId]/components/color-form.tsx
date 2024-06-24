"use client"

import { Size } from '@prisma/client';
import React, { useState } from 'react';

import { Heading } from '@/components/ui/heading';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { AlertModal } from '@/components/modals/alert-modal';

import { Trash } from 'lucide-react';

import * as z from "zod"
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Input } from '@/components/ui/input';
import toast from 'react-hot-toast';
import axios from 'axios';
import { useParams, useRouter } from 'next/navigation';

const formSchema = z.object({
    name: z.string().min(1),
    value: z.string().min(1)
})


type ColorFormValues = z.infer<typeof formSchema>

interface ColorFormProps {
    initialData: Size | null
}

const ColorForm: React.FC<ColorFormProps> = ({
    initialData
}) => {
    const [onOpen, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const params = useParams();
    const router = useRouter();


    const title = initialData ? "Edit Color" : "Create Color";
    const description = initialData ? "Edit a color" : "Add a new color"
    const toastMessage = initialData ? "Color updated successfully" : "Color created successfully"
    const action = initialData ? "Save changes" : "Create a color"

    const form = useForm<ColorFormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: initialData || {
            name: "",
            value: "",
        }
    })

    const onSubmit = async (values: ColorFormValues) => {
        try {
            setLoading(true);
            if (initialData) {
                await axios.patch(`/api/${params.storeId}/colors/${params.colorId}`, values);
            } else {
                await axios.post(`/api/${params.storeId}/colors`, values);
            }
            router.refresh();
            router.push(`/${params.storeId}/colors`)
            toast.success(toastMessage)
        } catch (err) {
            console.error(err);
            toast.error("Something went wrong")
        } finally {
            setLoading(false)
        }
    }

    const onDelete = async () => {
        try {
            setLoading(true);
            await axios.delete(`/api/${params.storeId}/colors/${params.colorId}`);
            router.refresh()
            router.push("/")
            toast.success("Color deleted.")
        } catch (error) {
            toast.error("Make sure you removed all products using this color first.")
        } finally {
            setLoading(false)
            setOpen(false)
        }
    }

    return (
        <>
            <AlertModal
                isOpen={onOpen}
                onClose={() => setOpen(false)}
                onConfirm={onDelete}
                loading={loading}
            />
            <div className='flex items-center justify-between'>
                <Heading
                    title={title}
                    description={description}
                />
                {initialData && <Button
                    variant={"destructive"}
                    size={"sm"}
                    onClick={() => setOpen(true)}
                >
                    <Trash className='w-4 h-4 mr-2' />
                    Delete Color
                </Button>}
            </div>
            <Separator />
            <Form {...form}>
                <form
                    onSubmit={form.handleSubmit(onSubmit)}
                    className='space-y-8'
                >
                    <div className="grid grid-cols-3 gap-8">
                        <FormField
                            name='name'
                            control={form.control}
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Color Name</FormLabel>
                                    <FormControl>
                                        <Input className='w-[200px]' disabled={loading} placeholder='Color name' {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            name='value'
                            control={form.control}
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Color Value</FormLabel>
                                    <FormControl>
                                        <div className='flex items-center gap-x-4'>

                                            <Input className='w-[200px]' disabled={loading} placeholder='Color value' {...field} />
                                            <div
                                                className={`border p-4 rounded-full`}
                                                style={{ backgroundColor: field.value }}
                                            />
                                        </div>
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>
                    <Button disabled={loading} className='ml-auto' type='submit'>
                        {action}
                    </Button>
                </form>
            </Form>
            <Separator />
        </>
    );
}

export default ColorForm;
