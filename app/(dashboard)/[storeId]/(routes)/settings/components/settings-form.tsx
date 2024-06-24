"use client"

import { Store } from '@prisma/client';
import React, { useState } from 'react';

import { Heading } from '@/components/ui/heading';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { AlertModal } from '@/components/modals/alert-modal';
import { ApiAlert } from '@/components/ui/api-alert';

import { Trash } from 'lucide-react';

import * as z from "zod"
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Input } from '@/components/ui/input';
import toast from 'react-hot-toast';
import axios from 'axios';
import { useParams, useRouter } from 'next/navigation';
import { useOrigin } from '@/hooks/user-origin';

interface SettingsFormProps {
    initialData: Store
}

const formSchema = z.object({
    name: z.string().min(1)
})

type SettingsFormValues = z.infer<typeof formSchema>


const SettingsForm: React.FC<SettingsFormProps> = ({
    initialData
}) => {
    const [onOpen, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const params = useParams();
    const router = useRouter();
    const origin = useOrigin();

    const form = useForm<SettingsFormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: initialData
    })

    const onSubmit = async (values: SettingsFormValues) => {
        try {
            setLoading(true);
            await axios.patch(`/api/stores/${params.storeId}`, values);
            router.refresh();
            toast.success("Store updated successfully")
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
            await axios.delete(`/api/stores/${params.storeId}`);
            router.refresh()
            router.push("/")
            toast.success("Store deleted successfully")
        } catch (error) {
            toast.error("Make sure you removed all products and categories first.")
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
                    title="Settings"
                    description="Manage Store Preferences"
                />
                <Button
                    variant={"destructive"}
                    size={"sm"}
                    onClick={() => setOpen(true)}
                >
                    <Trash className='w-4 h-4 mr-2' />
                    Delete Store
                </Button>
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
                                    <FormLabel>Name</FormLabel>
                                    <FormControl>
                                        <Input className='w-[200px]' disabled={loading} placeholder='Store name' {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>
                    <Button disabled={loading} className='ml-auto' type='submit'>
                        Save Changes
                    </Button>
                </form>
            </Form>
            <Separator />
            <ApiAlert title="NEXT_PUBLIC_API_URL" description={`${origin}/api/${params.storeId}`} variant='public' />
        </>
    );
}

export default SettingsForm;
