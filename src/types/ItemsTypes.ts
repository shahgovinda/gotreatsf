// Example: src/data/products.ts (or similar file)

export const products = [
    // ... other items
    {
        id: 'almond-choco-1',
        productName: 'Almond Chocolate',
        productDescription: 'Rich dark chocolate with roasted almonds.',
        isNonVeg: false,
        isTiffin: false,
        category: 'chocolates',
        originalPrice: 400,
        offerPrice: 350,
        imageUrl: '/images/almond-chocolate.jpg',
        rating: 5,
        isAvailable: true,
        // ✅ THIS IS WHERE YOU MARK IT PREMIUM:
        isPremiumChocolate: true, 
    },
    // ... other items
];
