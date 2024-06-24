"use client"

import { Product, Image, Category, Color, Size } from '@prisma/client';
import React, { useState } from 'react';

import { Heading } from '@/components/ui/heading';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage, FormDescription } from '@/components/ui/form';
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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Checkbox } from '@/components/ui/checkbox';

const formSchema = z.object({
    name: z.string().min(1),
    images: z.object({ url: z.string() }).array(),
    price: z.coerce.number().min(1),
    categoryId: z.string().min(1),
    sizeId: z.string().min(1),
    colorId: z.string().min(1),
    isFeatured: z.boolean().default(false).optional(),
    isArchived: z.boolean().default(false).optional(),
})


type ProductFormValues = z.infer<typeof formSchema>

interface ProductFormProps {
    initialData: Product & {
        images: Image[]
    } | null;
    categories: Category[],
    colors: Color[],
    sizes: Size[]
}

const ProductForm: React.FC<ProductFormProps> = ({
    initialData,
    categories,
    colors,
    sizes

}) => {
    const [onOpen, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const params = useParams();
    const router = useRouter();


    const title = initialData ? "Edit Product" : "Create Product";
    const description = initialData ? "Edit a Product" : "Add a new Product"
    const toastMessage = initialData ? "Product updated successfully" : "Product created successfully"
    const action = initialData ? "Save changes" : "Create a Product"

    const form = useForm<ProductFormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: initialData ? {
            ...initialData,
            price: parseFloat(String(initialData?.price)),
        } : {
            name: '',
            images: [],
            price: 0,
            categoryId: '',
            colorId: '',
            sizeId: '',
            isFeatured: false,
            isArchived: false
        }
    })

    const onSubmit = async (values: ProductFormValues) => {
        try {
            setLoading(true);
            if (initialData) {
                await axios.patch(`/api/${params.storeId}/products/${params.productId}`, values);
            } else {
                await axios.post(`/api/${params.storeId}/products`, values);
            }
            router.refresh();
            router.push(`/${params.storeId}/products`)
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
            await axios.delete(`/api/${params.storeId}/products/${params.productId}`);
            router.refresh()
            router.push(`/${params.storeId}/products`);
            toast.success("Product deleted.")
        } catch (error) {
            toast.error("Something went wrong.")
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
                        name='images'
                        control={form.control}
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Images</FormLabel>
                                <FormControl>
                                    <ImageUpload
                                        value={field.value.map(
                                            (image) => image.url
                                        )}
                                        onChange={(url) => field.onChange([...field.value, { url }])}
                                        onRemove={(url) => field.onChange([...field.value.filter((current) => current.url !== url)])}
                                        disabled={loading}
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <div className="grid grid-cols-3 gap-8">
                        <FormField
                            name='name'
                            control={form.control}
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Name</FormLabel>
                                    <FormControl>
                                        <Input className='w-[200px]' disabled={loading} placeholder='Product Name' {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            name='price'
                            control={form.control}
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Price</FormLabel>
                                    <FormControl>
                                        <Input className='w-[200px]' disabled={loading} placeholder='9.99' {...field} type='number' />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            name='categoryId'
                            control={form.control}
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Category</FormLabel>
                                    <Select
                                        disabled={loading}
                                        onValueChange={field.onChange}
                                        value={field.value}
                                        defaultValue={field.value}
                                    >
                                        <FormControl>
                                            <SelectTrigger className="w-[180px]">
                                                <SelectValue defaultValue={field.value} placeholder="Select a Category" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            {
                                                categories.map((category) => (
                                                    <SelectItem key={category.id} value={category.id}>
                                                        {category.name}
                                                    </SelectItem>
                                                ))
                                            }
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            name='colorId'
                            control={form.control}
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Color</FormLabel>
                                    <Select
                                        disabled={loading}
                                        onValueChange={field.onChange}
                                        value={field.value}
                                        defaultValue={field.value}
                                    >
                                        <FormControl>
                                            <SelectTrigger className="w-[180px]">
                                                <SelectValue defaultValue={field.value} placeholder="Select a Color" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            {
                                                colors.map((color) => (
                                                    <SelectItem key={color.id} value={color.id}>
                                                        {color.name}
                                                    </SelectItem>
                                                ))
                                            }
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            name='sizeId'
                            control={form.control}
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Size</FormLabel>
                                    <Select
                                        disabled={loading}
                                        onValueChange={field.onChange}
                                        value={field.value}
                                        defaultValue={field.value}
                                    >
                                        <FormControl>
                                            <SelectTrigger className="w-[180px]">
                                                <SelectValue defaultValue={field.value} placeholder="Select a Size" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            {
                                                sizes.map((size) => (
                                                    <SelectItem key={size.id} value={size.id}>
                                                        {size.name}
                                                    </SelectItem>
                                                ))
                                            }
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            name='isFeatured'
                            control={form.control}
                            render={({ field }) => (
                                <FormItem className='flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4'>
                                    <FormControl>
                                        <Checkbox
                                            checked={field.value}
                                            onCheckedChange={field.onChange}

                                        />
                                    </FormControl>
                                    <div className="space-y-1 leading-none">
                                        <FormLabel>Featured</FormLabel>
                                        <FormDescription>This product will appear on the home page</FormDescription>
                                    </div>
                                </FormItem>
                            )}
                        />
                        <FormField
                            name='isArchived'
                            control={form.control}
                            render={({ field }) => (
                                <FormItem className='flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4'>
                                    <FormControl>
                                        <Checkbox
                                            checked={field.value}
                                            onCheckedChange={field.onChange}

                                        />
                                    </FormControl>
                                    <div className="space-y-1 leading-none">
                                        <FormLabel>Archived</FormLabel>
                                        <FormDescription>This product will not appear anywhere in the store.</FormDescription>
                                    </div>
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

export default ProductForm;
