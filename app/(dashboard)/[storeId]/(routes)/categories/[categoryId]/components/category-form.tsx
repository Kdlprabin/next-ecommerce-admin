"use client"

import { Billboard, Category } from '@prisma/client';
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
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";


const formSchema = z.object({
    name: z.string().min(1),
    billboardId: z.string().min(1)
})


type CategoryFormValues = z.infer<typeof formSchema>

interface CategoryFormProps {
    initialData: Category | null,
    billboards: Billboard[]
}

const CategoryForm: React.FC<CategoryFormProps> = ({
    initialData,
    billboards
}) => {
    const [onOpen, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const params = useParams();
    const router = useRouter();


    const title = initialData ? "Edit Category" : "Create Category";
    const description = initialData ? "Edit a Category" : "Add a new Category"
    const toastMessage = initialData ? "Category updated successfully" : "Category created successfully"
    const action = initialData ? "Save changes" : "Create a Category"

    const form = useForm<CategoryFormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: initialData || {
            name: "",
            billboardId: "",
        }
    })

    const onSubmit = async (values: CategoryFormValues) => {
        try {
            setLoading(true);
            if (initialData) {
                await axios.patch(`/api/${params.storeId}/categories/${params.categoryId}`, values);
            } else {
                await axios.post(`/api/${params.storeId}/categories`, values);
            }
            router.refresh();
            router.push(`/${params.storeId}/categories`)
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
            await axios.delete(`/api/${params.storeId}/categories/${params.categoryId}`);
            router.refresh()
            router.push("/")
            toast.success("Category deleted.")
        } catch (error) {
            toast.error("Make sure you removed all categories using this Category first.")
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
                    Delete Category
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
                                    <FormLabel>Name</FormLabel>
                                    <FormControl>
                                        <Input className='w-[200px]' disabled={loading} placeholder='Category Name' {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            name='billboardId'
                            control={form.control}
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Billboard</FormLabel>
                                    <Select
                                        disabled={loading}
                                        onValueChange={field.onChange}
                                        value={field.value}
                                        defaultValue={field.value}
                                    >
                                        <FormControl>
                                            <SelectTrigger className="w-[180px]">
                                                <SelectValue defaultValue={field.value} placeholder="Select a Billboard" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            {
                                                billboards.map((billboard) => (
                                                    <SelectItem key={billboard.id} value={billboard.id}>
                                                        {billboard.label}
                                                    </SelectItem>
                                                ))
                                            }
                                        </SelectContent>
                                    </Select>
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

export default CategoryForm;
