
import {
    Modal,
    ModalContent,
    ModalHeader,
    ModalBody,
    ModalFooter,
    Input,
    Select,
    SelectItem,
    Switch,
    NumberInput
} from "@heroui/react";
import Button from '../../components/Button'
import { Item } from '../../types/ItemsTypes'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { addProduct, getProductById, updateProduct, updateProductImage, uploadProductImage } from '../../services/productService'
import { useNavigate, useParams } from 'react-router-dom'
import toast from 'react-hot-toast'
import React, { useEffect, useState } from 'react'

const FOOD_CATEGORIES = [
    "Meals",
    "Snacks",
    "Desserts",
    "Paav Bhaaji",
    "Maggi",
    "Pasta",
    "Drinks",
    "Pickles"
]

const defaultForm: Item = {
    id: '',
    productName: '',
    productDescription: '',
    isNonVeg: false,
    isTiffin: false,
    category: '',
    originalPrice: 0,
    offerPrice: 0,
    imageUrl: '',
    rating: 0,
    isAvailable: true
}

const ProductFrom = ({
    isOpen,
    onOpenChange,
   
    productToEdit
}: {
    isOpen: boolean,
    onOpenChange: () => void,
   
    productToEdit: Item | null
}) => {
    const { productId } = useParams()
    const queryClient = useQueryClient()
    const navigate = useNavigate()
    const [selectedFile, setSelectedFile] = useState<File | null>(null)
    // const [imagePreview, setImagePreview] = useState<string | null>(null)
    const [formData, setFormData] = useState<Item>({ ...defaultForm })


     // When productToEdit changes, update formData
    useEffect(() => {
        if (productToEdit) {
            setFormData(productToEdit);
            // setImagePreview(productToEdit.imageUrl || null);
        } else {
            setFormData({ ...defaultForm });
            // setImagePreview(null);
            setSelectedFile(null);
        }
    }, [productToEdit]);


    const validateAllFields = (data: Item) => {
        return (
            data.productName &&
            data.productDescription &&
            data.originalPrice > 0 &&
            data.offerPrice > 0 &&
            data.rating !== 0 &&
            data.category
        )
    }

    const handleChange = (name: string, value: any) => {
        setFormData(prev => ({
            ...prev,
            [name]: value
        }))
    }

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setSelectedFile(file);
            // setImagePreview(URL.createObjectURL(file));
        }
    }

    const productMutation = useMutation({
        mutationFn: async (data: Item) => {
            if (productToEdit && productToEdit.id) {
                let updatedData = { ...data };
                if (selectedFile) {
                    const newImageUrl = await updateProductImage(productToEdit.id, selectedFile);
                    updatedData.imageUrl = newImageUrl;
                }
                const result = await updateProduct(productToEdit.id, updatedData);
                return result ? 'Product updated successfully' : 'Failed to update product';
            } else {
                if (selectedFile) {
                    const imageDownloadUrl = await uploadProductImage(selectedFile, 'ProductImages');
                    data.imageUrl = imageDownloadUrl;
                }
                const result = await addProduct(data);
                return result ? 'Product added successfully' : 'Failed to add product';
            }
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['products'] });
            // refetchProducts?.();
            onOpenChange();
            navigate('/view-all-products');
        }
    })

    const handleSubmit = (e?: React.FormEvent) => {
        if (e) e.preventDefault()
        if (!validateAllFields(formData)) {
            toast.error('Please fill in all fields.')
            return
        }
        toast.promise(
            new Promise((resolve, reject) => {
                productMutation.mutate(formData, {
                    onSuccess: () => resolve(null),
                    onError: (error) => reject(error)
                })
            }),
            {
                loading: 'Saving...',
                success: productId ? 'Product updated successfully!' : 'Product added successfully!',
                error: 'Could not save product.'
            }
        )
    }

    return (
        <Modal isOpen={isOpen} onOpenChange={onOpenChange} size="lg" placement="center" scrollBehavior='inside' backdrop='opaque'>
            <ModalContent>
                {(onClose) => (
                    <>
                        <ModalHeader className="flex items-center lancelot text-2xl gap-3">
                            {productToEdit ? `Update Product` : 'Add Product'}
                        </ModalHeader>
                        <ModalBody>
                            <form className='flex flex-col gap-6' onSubmit={handleSubmit}>
                                <Input
                                    type="text"
                                    label="Product Name"
                                    variant='faded'
                                    value={formData.productName}
                                    onValueChange={val => handleChange('productName', val)}
                                    isRequired
                                />
                                <Input
                                    type="text"
                                    label="Product Description"
                                    variant='faded'
                                    value={formData.productDescription}
                                    onValueChange={val => handleChange('productDescription', val)}
                                    isRequired
                                />
                                <Select
                                    label='Food Category'
                                    variant='faded'
                                    selectedKeys={[formData.category]}
                                    onSelectionChange={keys => handleChange('category', Array.from(keys)[0] || '')}
                                    isRequired
                                >
                                    {FOOD_CATEGORIES.map((category) => (
                                        <SelectItem key={category}>{category}</SelectItem>
                                    ))}
                                </Select>
                                <div className='flex gap-4'>
                                    <Switch
                                        isSelected={formData.isNonVeg}
                                        onValueChange={val => handleChange('isNonVeg', val)}
                                    >
                                        Non-Vegetarian
                                    </Switch>
                                    <Switch
                                        isSelected={formData.isTiffin}
                                        onValueChange={val => handleChange('isTiffin', val)}
                                    >
                                        Tiffin Meal
                                    </Switch>
                                    <Switch
                                        isSelected={formData.isAvailable}
                                        onValueChange={val => handleChange('isAvailable', val)}
                                    >
                                        Available
                                    </Switch>
                                </div>
                                <div className='flex gap-4'>
                                    <div className='w-full'>
                                        <Input
                                            type="file"
                                            label="Product Image"
                                            variant='faded'
                                            accept="image/*"
                                            onChange={handleImageChange}
                                        />
                                    </div>
                                    <div className='w-full'>
                                        <NumberInput
                                            label="Rating ⭐"
                                            variant='faded'
                                            value={formData.rating}
                                            minValue={1}
                                            maxValue={5}
                                            step={0.1}
                                            onValueChange={val => handleChange('rating', Number(val))}
                                            isRequired
                                        />
                                    </div>
                                </div>
                                <div className='flex gap-4'>
                                    <NumberInput
                                        label="Original Price"
                                        variant='faded'
                                        value={formData.originalPrice}
                                        onValueChange={val => handleChange('originalPrice', Number(val))}
                                        isRequired
                                    />
                                    <NumberInput
                                        label="Offer Price"
                                        variant='faded'
                                        value={formData.offerPrice}
                                        onValueChange={val => handleChange('offerPrice', Number(val))}
                                        isRequired
                                    />
                                </div>

                            </form>
                            <pre className="bg-white p-2 rounded-xl shadow-sm overflow-auto text-xs">
                                {JSON.stringify(formData, null, 2)}
                            </pre>
                        </ModalBody>
                        <ModalFooter>
                            <Button color="danger" variant="secondary" onClick={onClose}>
                                Close
                            </Button>
                            <Button variant="primary" type="submit" onClick={handleSubmit} isLoading={productMutation.isPending}>
                                {productToEdit ? 'Update Product' : 'Add Product'}
                            </Button>
                        </ModalFooter>
                    </>
                )}
            </ModalContent>
        </Modal>
    )
}

export default ProductFrom