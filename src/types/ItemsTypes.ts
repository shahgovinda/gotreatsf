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
    }
