import Button, { IconButton } from '../../components/Button'
import { Eye, EyeOff, Pen, Plus, RefreshCcw, Trash } from 'lucide-react'
import { deleteProduct, getItemsFromFirestore, updateProduct } from '../../services/productService';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import VegSymbol from '../../assets/VegSymbol';
import toast from 'react-hot-toast';
import { Image, Tooltip, useDisclosure } from '@heroui/react';
import { useState, lazy, Suspense } from 'react';

const ProductFrom = lazy(() => import('./ProductFrom'));

export default function ManageProducts() {
    const queryClient = useQueryClient()
    const { isOpen, onOpen, onOpenChange } = useDisclosure();
    const [productToEdit, setProductToEdit] = useState(null);

    const { data, refetch } = useQuery({
        queryKey: ['products'],
        queryFn: getItemsFromFirestore
    })

    const deleteProductMutation = useMutation({
        mutationFn: deleteProduct,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['products'] });
            toast.success('Product deleted successfully 🗑️');
        },
        onError: (error) => {
            toast.error(`Failed to delete product: ${error.message}`)
        }
    })

    const handleProductDelete = (id: string) => {
        if (window.confirm("Really delete this product with id: " + id + "?")) {
            toast.loading('Deleting product...', { id: 'deleteProduct' })
            deleteProductMutation.mutate(id, {
                onSuccess: () => {
                    toast.dismiss('deleteProduct')
                }
            })
        }
    };

    const toggleAvailabilityMutation = useMutation({
        mutationFn: ({ productId, updatedData }: { productId: string, updatedData: any }) =>
            updateProduct(productId, updatedData),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['products'] });
        }
    });

    const handleAvailabilityChange = (id: string, isAvailable: boolean) => {
        toggleAvailabilityMutation.mutate({
            productId: id,
            updatedData: { isAvailable: !isAvailable }
        });
    };

    return (
        <main className='w-full'>
            <h1 className="md:text-4xl ml-2 text-3xl font-bold text-center md:text-start lancelot text-white">Products</h1>

            <div className='flex justify-between md:justify-end items-center gap-4 my-4'>
                <button type='button' className='p-2 cursor-pointer bg-green-100 rounded-full transition-colors'
                    onClick={() => { refetch(); toast.success("Products Refetched") }}>
                    <RefreshCcw />
                </button>
                <Button
                    variant='primary'
                    onClick={onOpen}
                >
                    <Plus />
                    Add Product
                </Button>
            </div>

            <div className="overflow-x-auto">
                <table className="min-w-full bg-white shadow-md rounded-lg overflow-x-auto">
                    <thead className="bg-green-500 text-white">
                        <tr>
                            <th className="px-6 py-3">Image</th>
                            <th className="px-6 py-3">ID</th>
                            <th className="px-6 py-3">Name</th>
                            <th className="px-6 py-3">Category</th>
                            <th className="px-6 py-3">Price</th>
                            <th className="px-6 py-3">Offer Price</th>
                            <th className="px-6 py-3">Rating</th>
                            <th className="px-6 py-3">Actions</th>
                        </tr>
                    </thead>

                    <tbody>
                        {data?.map((product) => (
                            <tr key={product.id} className={`border-b hover:bg-gray-50 ${product.isAvailable ? '' : 'text-neutral-600'}`}>
                                <td className="px-2 text-center border-r">
                                    <Tooltip content={
                                        <img src={product.imageUrl} loading='lazy' className={`w-80 h-80 object-cover rounded-md ${product.isAvailable ? '' : 'grayscale'}`} alt="" />
                                    } placement='right-start'>
                                        <div className='flex justify-evenly items-center gap-2 h-full'>
                                            <VegSymbol isNonVeg={product.isNonVeg} />
                                            <Image
                                                src={product.imageUrl}
                                                loading="lazy"
                                                className={`w-16 h-16 object-cover rounded-md ${product.isAvailable ? '' : 'grayscale'}`}
                                                alt="Product"
                                            />
                                        </div>
                                    </Tooltip>
                                </td>
                                <td className="px-2 border-r text-center">{product.id}</td>
                                <td className={`px-2 border-r text-center ${product.isAvailable ? '' : 'line-through text-neutral-600'}`}>{product.productName}</td>
                                <td className="px-2 border-r text-center">{product.category}</td>
                                <td className="px-2 border-r text-center">₹{product.originalPrice}</td>
                                <td className="px-2 border-r text-center">₹{product.offerPrice}</td>
                                <td className="px-2 border-r text-center">{product.rating}⭐</td>
                                <td className="px-2">
                                    <div className='flex items-center justify-center gap-6'>
                                        <IconButton className='bg-green-200 hover:bg-white hover:border border-green-200 border' onClick={() => {
                                            setProductToEdit(product);
                                            onOpen();
                                        }}>
                                            <Pen size={20} />
                                        </IconButton>
                                        <IconButton className='bg-orange-300 hover:bg-white hover:border border-orange-300 border' onClick={() => handleAvailabilityChange(product.id, product.isAvailable)}>
                                            {product.isAvailable ? <Eye size={20} /> : <EyeOff size={20} />}
                                        </IconButton>
                                        <IconButton className='bg-red-400 hover:bg-white hover:border border-red-400 border' onClick={() => handleProductDelete(product.id)}>
                                            <Trash size={20} />
                                        </IconButton>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                {data?.length === 0 &&
                    <p className='comfortaa text-2xl text-gray-600 animate-bounce font-bold my-20 text-center'>🤑 Kuchh to Bech Le 🤑</p>
                }
            </div>

            <Suspense fallback={<div>Loading...</div>}>
                <ProductFrom
                    isOpen={isOpen}
                    onOpenChange={() => {
                        onOpenChange();
                        setProductToEdit(null);
                    }}
                    productToEdit={productToEdit}
                />
            </Suspense>
        </main>
    );
}
