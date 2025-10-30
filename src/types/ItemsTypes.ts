export type Item = {
    id?: string;
    productName: string;
    productDescription: string;
    isNonVeg: boolean;
    isTiffin: boolean;
    category: string;
    originalPrice: number;
    offerPrice: number;
    imageUrl: string;
    rating: number;
    isAvailable: boolean;
    orderCount?: number;
    // ✅ ADDED: The new flag to determine if the Premium tag should be shown
    isPremiumChocolate?: boolean;
}
