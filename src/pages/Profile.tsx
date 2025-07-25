import React, { useEffect, useState, useRef } from 'react'
import { useAuthStore } from '../store/authStore';
import Button from '../components/Button';
import { useNavigate } from 'react-router-dom';
import { handleLogout, updateUserAddress, updateUserPhone, updateUserProfile, uploadProfileImage, deleteProfileImage } from '../services/authService';
import { Mail, Phone, Camera, Home, Loader2, Trash2, Star, Edit } from 'lucide-react';
import toast from 'react-hot-toast';
import AddressSection from '../components/AddressSection';
import Modal from '../components/Modal';
import { getUserRatings, getProductById, deleteUserRating, updateUserRating } from '../services/productService';
import ItemRatingModal from '../components/ItemRatingModal';


const Profile = () => {
    const navigate = useNavigate()
    const { userDetails, updateUserProfile: updateStore } = useAuthStore();
    const [address, setAddress] = React.useState(userDetails?.address || '');
    const [phoneNumber, setPhoneNumber] = React.useState(userDetails?.phoneNumber || '');
    const [isEditingPhone, setIsEditingPhone] = React.useState(false);
    const [loading, setLoading] = React.useState(false);
    const [showLogoutModal, setShowLogoutModal] = React.useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [showReviews, setShowReviews] = useState(false);
    const [userReviews, setUserReviews] = useState<Array<{ id: string; itemId: string; rating: number; review: string; createdAt: string; }>>([]);
    const [loadingReviews, setLoadingReviews] = useState(false);
    const [editReview, setEditReview] = useState<any>(null);
    const [deleteReviewId, setDeleteReviewId] = useState<string | null>(null);
    const [reviewProducts, setReviewProducts] = useState<{[key:string]: any}>({});

    // Keep address in sync with userDetails
    React.useEffect(() => {
        setAddress(userDetails?.address || '');
    }, [userDetails?.address]);

    useEffect(() => {
        window.scrollTo(0, 0);
    })
    const handleLogoutClick = async () => {
        try {
            await handleLogout();
            toast.success('Logged out successfully');
            navigate('/');
        } catch (error) {
            toast.error('Failed to logout. Please try again.');
        }
    };

    const handleAddressSubmit = async () => {
        if (!address.trim()) {
            toast.error('Please enter an address');
            return;
        }

        try {
            setLoading(true);
            if (!userDetails?.uid) {
                toast.error('Please log in to save address');
                return;
            }

            await updateUserAddress(userDetails.uid, address.trim());
            toast.success('Address saved successfully!');
        } catch (error) {
            console.error("Failed to update address:", error);
            toast.error('Failed to save address. Please try again.');
        } finally {
            setLoading(false);
        }
    }

    const handlePhoneSubmit = async () => {
        try {
            setLoading(true);
            if (userDetails?.uid) {
                await updateUserPhone(userDetails.uid, phoneNumber);
                setIsEditingPhone(false);
                toast.success('Phone number updated successfully!');
            }
        } catch (error) {
            console.error("Failed to update phone:", error);
            toast.error('Failed to update phone number');
        }
        setLoading(false);
    }

    const handleImageClick = () => {
        fileInputRef.current?.click();
    };

    const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file || !userDetails) return;

        try {
            setIsUploading(true);
            const imageUrl = await uploadProfileImage(userDetails.uid, file);
            updateStore({ profileImage: imageUrl });
            toast.success('Profile image updated successfully!');
        } catch (error) {
            console.error('Error uploading image:', error);
            toast.error('Failed to update profile image');
        } finally {
            setIsUploading(false);
        }
    };

    const handleUpdateProfile = async () => {
        if (!userDetails) return;

        try {
            await updateUserProfile(userDetails.uid, userDetails);
            setIsEditing(false);
            toast.success('Profile updated successfully!');
        } catch (error) {
            console.error('Error updating profile:', error);
            toast.error('Failed to update profile');
        }
    };

    const handleDeleteProfileImage = async () => {
        if (!userDetails) return;
        setIsUploading(true);
        try {
            const success = await deleteProfileImage(userDetails.uid);
            if (success) {
                updateStore({ profileImage: '' });
                toast.success('Profile image deleted!');
            } else {
                toast.error('Failed to delete profile image');
            }
        } catch (error) {
            toast.error('Failed to delete profile image');
        } finally {
            setIsUploading(false);
            setShowDeleteModal(false);
        }
    };

    const fetchUserReviews = async () => {
        if (!userDetails?.uid) return;
        setLoadingReviews(true);
        const reviews = await getUserRatings(userDetails.uid);
        setUserReviews(reviews.map((r: any) => ({
            id: r.id,
            itemId: r.itemId || '',
            rating: r.rating || 0,
            review: r.review || '',
            createdAt: r.createdAt || '',
        })));
        // Fetch product info for each review
        const products: {[key:string]: any} = {};
        await Promise.all(reviews.map(async (r: any) => {
            if (r.itemId && !products[r.itemId]) {
                products[r.itemId] = await getProductById(r.itemId);
            }
        }));
        setReviewProducts(products);
        setLoadingReviews(false);
    };

    useEffect(() => {
        if (showReviews) fetchUserReviews();
        // eslint-disable-next-line
    }, [showReviews]);

    const handleDeleteReview = async () => {
        if (!deleteReviewId) return;
        await deleteUserRating(deleteReviewId);
        setDeleteReviewId(null);
        fetchUserReviews();
        toast.success('Review deleted successfully!');
    };

    if (!userDetails) {
        return <div>Loading...</div>;
    }

    return (
        <div className='min-h-screen bg-gray-100'>
            <div className='md:w-2/3 w-full md:pt-10 pt-5 mx-auto'>
                {/* Profile Card with solid yellow bg */}
                <section className='relative md:p-0 p-0 m-2 rounded-2xl flex flex-col items-center'>
                    {/* Profile BG */}
                    <div className="w-full h-40 md:h-48 rounded-t-2xl bg-amber-500 flex items-end justify-center relative">
                        {/* Food Quote */}
                        <div className="absolute top-4 left-1/2 -translate-x-1/2 w-full flex justify-center z-20">
                            <span className="text-white text-lg md:text-2xl font-semibold italic drop-shadow-lg text-center px-4 select-none">
                                "Good food is the foundation of genuine happiness."
                            </span>
                        </div>
                        {/* Floating Profile Image */}
                        <div 
                            className="absolute left-1/2 -bottom-16 -translate-x-1/2 w-36 h-36 md:w-40 md:h-40 rounded-full overflow-hidden border-4 border-white shadow-xl bg-white cursor-pointer group z-10 flex items-center justify-center"
                            onClick={handleImageClick}
                        >
                            {isUploading ? (
                                <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                                    <Loader2 className="w-8 h-8 text-white animate-spin" />
                                </div>
                            ) : (
                                <>
                                    <img 
                                        src={userDetails.profileImage || 'https://via.placeholder.com/128'} 
                                        alt="Profile" 
                                        className="w-full h-full object-cover"
                                    />
                                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                        <Camera className="w-8 h-8 text-white" />
                                    </div>
                                    {userDetails.profileImage && userDetails.profileImage !== 'https://via.placeholder.com/128' && (
                                        <button
                                            type="button"
                                            className="absolute top-2 right-2 bg-white rounded-full p-2 shadow-lg hover:bg-red-100 transition-colors z-20 border border-gray-200"
                                            onClick={e => { e.stopPropagation(); setShowDeleteModal(true); }}
                                            title="Delete profile photo"
                                        >
                                            <Trash2 className="w-6 h-6 text-red-500" />
                                        </button>
                                    )}
                                </>
                            )}
                        </div>
                        <input
                            type="file"
                            ref={fileInputRef}
                            className="hidden"
                            accept="image/*"
                            onChange={handleImageChange}
                        />
                    </div>
                    {/* User Info Card */}
                    <div className="w-full flex flex-col items-center mt-24 px-4">
                        <div className="w-full md:w-3/4 bg-[#2d014d] rounded-2xl shadow-lg p-6 flex flex-col items-center gap-2">
                            <h1 className='text-2xl font-bold text-white'>{userDetails?.displayName}</h1>
                            <p className='text-sm text-purple-100 inline-flex items-center gap-2'><Mail size={16} /> {userDetails?.email}</p>
                            <div className='flex items-center gap-2'>
                                <p className='text-sm text-purple-100 inline-flex items-center gap-2'><Phone size={16} />{userDetails?.phoneNumber || 'No phone number added'}</p>
                            </div>
                        </div>
                        {/* Delivery Info Card (only this one should remain) */}
                        <div className="w-full md:w-3/4 bg-[#2d014d] rounded-2xl shadow-md p-6 mt-8 flex flex-col gap-2">
                            <AddressSection uid={userDetails?.uid || ""} />
                        </div>
                    </div>
                </section>
                {/* Action Buttons */}
                <section className='flex flex-col md:flex-row justify-center gap-3 md:gap-4 mt-14'>
                    <Button
                        variant='primary'
                        className='w-full md:w-auto px-8 py-3 text-lg rounded-xl shadow-md bg-gradient-to-r from-orange-500 to-yellow-400 hover:from-yellow-400 hover:to-orange-500 transition-all duration-200 transform hover:scale-105 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-orange-400 focus:ring-offset-2'
                        onClick={() => navigate('/orders')}
                    >
                        Go To Orders
                    </Button>
                    <Button
                        variant='secondary'
                        className='w-full md:w-auto px-8 py-3 text-lg rounded-xl shadow-md bg-gradient-to-r from-purple-600 to-indigo-500 hover:from-indigo-500 hover:to-purple-600 text-white transition-all duration-200 transform hover:scale-105 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-purple-400 focus:ring-offset-2'
                        onClick={() => setShowReviews(true)}
                    >
                        Manage Reviews
                    </Button>
                    <Button
                        variant='danger'
                        className='w-full md:w-auto px-8 py-3 text-lg rounded-xl shadow-md bg-gradient-to-r from-red-500 to-pink-500 hover:from-pink-500 hover:to-red-500 text-white transition-all duration-200 transform hover:scale-105 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-red-400 focus:ring-offset-2'
                        onClick={() => setShowLogoutModal(true)}
                    >
                        Log Out
                    </Button>
                </section>
            </div>
            {/* Logout Confirmation Modal */}
            <Modal
                isOpen={showLogoutModal}
                title="Confirm Logout"
                message="Are you sure you want to log out? You'll need to sign in again to access your account."
                confirmLabel="Yes, Log Out"
                cancelLabel="Cancel"
                onConfirm={handleLogoutClick}
                onCancel={() => setShowLogoutModal(false)}
            />
            {/* Delete confirmation modal */}
            <Modal
                isOpen={showDeleteModal}
                title="Delete Profile Photo?"
                message="Are you sure you want to delete your profile photo? This action cannot be undone."
                confirmLabel="Yes, Delete"
                cancelLabel="Cancel"
                onConfirm={handleDeleteProfileImage}
                onCancel={() => setShowDeleteModal(false)}
            />
            {/* Manage Reviews Modal */}
            <Modal
                isOpen={showReviews}
                title='Manage Your Reviews'
                onCancel={() => setShowReviews(false)}
                cancelLabel='Close'
            >
                {loadingReviews ? (
                    <div className='py-8 text-center'>Loading...</div>
                ) : userReviews.length === 0 ? (
                    <div className='py-8 text-center text-gray-500'>No reviews found.</div>
                ) : (
                    <div className='space-y-6 max-h-[65vh] overflow-y-auto px-2 md:px-0'>
                        {userReviews.map((r) => (
                            <div key={r.id} className='bg-white rounded-2xl p-4 shadow-md flex flex-col gap-3 border border-gray-100'>
                                <div className='flex flex-col md:flex-row md:items-center md:gap-6 gap-1'>
                                    <div className='flex-1'>
                                        <div className='flex flex-col md:flex-row md:items-center gap-1 md:gap-2 mb-1'>
                                            <span className='font-semibold text-green-700 text-base md:text-lg'>{reviewProducts[r.itemId]?.productName || 'Food Item'}</span>
                                            <span className='flex items-center gap-0.5 text-yellow-500'>
                                                {[...Array(5)].map((_, i) => (
                                                    <Star key={i} size={16} fill={i < (r.rating ?? 0) ? 'currentColor' : 'none'} className={i < (r.rating ?? 0) ? 'text-yellow-400' : 'text-gray-300'} />
                                                ))}
                                            </span>
                                            <span className='text-xs text-gray-400 ml-0 md:ml-2'>{r.createdAt ? new Date(r.createdAt).toLocaleDateString() : ''}</span>
                                        </div>
                                        <div className='text-gray-700 text-sm md:text-base break-words'>{r.review}</div>
                                    </div>
                                </div>
                                <div className='flex flex-col md:flex-row gap-2 md:gap-3 mt-2 w-full'>
                                    <Button
                                        variant='secondary'
                                        size='sm'
                                        className='w-full md:w-auto flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg shadow-sm transition-all duration-200 hover:scale-105'
                                        onClick={() => setEditReview(r)}
                                    >
                                        <Edit size={16} /> Edit
                                    </Button>
                                    <Button
                                        variant='danger'
                                        size='sm'
                                        className='w-full md:w-auto flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg shadow-sm transition-all duration-200 hover:scale-105'
                                        onClick={() => setDeleteReviewId(r.id)}
                                    >
                                        <Trash2 size={16} /> Delete
                                    </Button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </Modal>
            {/* Delete Review Confirmation Modal */}
            <Modal
                isOpen={!!deleteReviewId}
                title='Delete Review?'
                message='Are you sure you want to delete this review? This action cannot be undone.'
                confirmLabel='Delete'
                cancelLabel='Cancel'
                onConfirm={handleDeleteReview}
                onCancel={() => setDeleteReviewId(null)}
            />
            <ItemRatingModal
                isOpen={!!editReview}
                itemName={editReview ? (reviewProducts[editReview.itemId]?.productName || 'Food Item') : ''}
                initialRating={editReview?.rating}
                initialReview={editReview?.review}
                onClose={() => setEditReview(null)}
                onSubmit={async (rating, review) => {
                    if (!editReview) return;
                    await updateUserRating(editReview.id, { rating, review });
                    setEditReview(null);
                    fetchUserReviews();
                    toast.success('Review updated successfully!');
                }}
            />
        </div>
    )
}

export default Profile
