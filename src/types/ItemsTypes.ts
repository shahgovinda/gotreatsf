// ../types/ItemsTypes.ts

// The original Item definition needs the 'export' keyword
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
    // NOTE: If you truly reverted ALL code, this line should be gone.
    // isPremiumChocolate?: boolean; 
}
