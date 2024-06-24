"use client"

import { Billboard } from '@prisma/client';
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
import { useOrigin } from '@/hooks/user-origin';
import ImageUpload from '@/components/ui/image-upload';

const formSchema = z.object({
    label: z.string().min(1),
    imageUrl: z.string().min(1)
})


type BillboardFormValues = z.infer<typeof formSchema>

interface BillboardFormProps {
    initialData: Billboard | null
}

const BillboardForm: React.FC<BillboardFormProps> = ({
    initialData
}) => {
    const [onOpen, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const params = useParams();
    const router = useRouter();


    const title = initialData ? "Edit Billboard" : "Create Billboard";
    const description = initialData ? "Edit a billboard" : "Add a new Billboard"
    const toastMessage = initialData ? "Billboard updated successfully" : "Billboard created successfully"
    const action = initialData ? "Save changes" : "Create a billboard"

    const form = useForm<BillboardFormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: initialData || {
            label: "",
            imageUrl: "",
        }
    })

    const onSubmit = async (values: BillboardFormValues) => {
        try {
            setLoading(true);
            if (initialData) {
                await axios.patch(`/api/${params.storeId}/billboards/${params.billboardId}`, values);
            } else {
                await axios.post(`/api/${params.storeId}/billboards`, values);
            }
            router.refresh();
            router.push(`/${params.storeId}/billboards`)
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
            await axios.delete(`/api/${params.storeId}/billboards/${params.billboardId}`);
            router.refresh()
            router.push("/")
            toast.success("Billboard deleted.")
        } catch (error) {
            toast.error("Make sure you removed all categories using this billboard first.")
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
                    Delete Billboard
                </Button>}
            </div>
            <Separator />
            <Form {...form}>
                <form
                    onSubmit={form.handleSubmit(onSubmit)}
                    className='space-y-8'
                >
                    <FormField
                        name='imageUrl'
                        control={form.control}
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Background Image</FormLabel>
                                <FormControl>
                                    <ImageUpload
                                        value={field.value ? [field.value] : []}
                                        onChange={(url) => field.onChange(url)}
                                        onRemove={() => field.onChange("")}
                                        disabled={loading}
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <div className="grid grid-cols-3 gap-8">
                        <FormField
                            name='label'
                            control={form.control}
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Label</FormLabel>
                                    <FormControl>
                                        <Input className='w-[200px]' disabled={loading} placeholder='Billboard label' {...field} />
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

export default BillboardForm;
