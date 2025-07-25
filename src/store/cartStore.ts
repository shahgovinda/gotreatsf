import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import { devtools } from 'zustand/middleware'
import { Item } from '../types/ItemsTypes'
import { CartItem } from '../types/CartTypes'



interface CartStore {
  items: CartItem[]
  grossTotalPrice: number
  totalPrice: number
  itemCount: number
  voucherDiscount: number // NEW
  note: string;
  preferredDeliveryTime: string;
  preferredDeliveryPeriod: string;
  setVoucherDiscount: (discount: number) => void // NEW
  setNote: (note: string) => void;
  setDeliveryTime: (time: string) => void;
  setDeliveryPeriod: (period: string) => void;
  addItem: (item: Item) => void
  reorderItems: (items: CartItem[]) => void
  removeItem: (itemId: string) => void
  updateQuantity: (itemId: string, quantity: number) => void
  clearCart: () => void
  calculateGrossTotalPrice: () => void
  calculateTotalPrice: (deliveryCharge: number, taxRate: number) => void
  getItemById: (itemId: string) => CartItem | undefined
  getTotalItems: () => number
}

const customStorage = {
  getItem: (name: string) => {
    try {
      const data = localStorage.getItem(name)
      return data ? JSON.parse(data) : null
    } catch (error) {
      console.error('Storage read error:', error)
      return null
    }
  },
  setItem: (name: string, value: unknown) => {
    try {
      localStorage.setItem(name, JSON.stringify(value))
    } catch (error) {
      console.error('Storage write error:', error)
    }
  },
  removeItem: (name: string) => localStorage.removeItem(name)
}

export const useCartStore = create<CartStore>()(
  devtools(
    persist(
      (set, get) => ({
        items: [],
        grossTotalPrice: 0,
        totalPrice: 0,
        itemCount: 0,
        voucherDiscount: 0, // NEW
        note: '',
        preferredDeliveryTime: '',
        preferredDeliveryPeriod: 'AM',

        setVoucherDiscount: (discount) => set({ voucherDiscount: discount }), 
        setNote: (note) => set({ note }),
        setDeliveryTime: (time) => set({ preferredDeliveryTime: time }),
        setDeliveryPeriod: (period) => set({ preferredDeliveryPeriod: period }),

        reorderItems: (newItems) => set({
          items: newItems,
          itemCount: newItems.reduce((sum, item) => sum + item.quantity, 0),
          // Reset other cart-related states
          grossTotalPrice: 0,
          totalPrice: 0,
          voucherDiscount: 0,
          note: '',
          preferredDeliveryTime: '',
          preferredDeliveryPeriod: 'AM',
        }),

        addItem: (item) => set((state) => {
          const existingItem = state.items.find((i) => i.id === item.id)
          const newItems = existingItem
            ? state.items.map((i) =>
              i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i
            )
            : [...state.items, { 
                ...item, 
                id: item.id!, 
                quantity: 1, 
                addedAt: new Date(),
                offerPrice: Number(item.offerPrice) // Ensure offerPrice is a number
              }]
          
          return { 
            items: newItems,
            itemCount: newItems.reduce((sum, item) => sum + item.quantity, 0)
          }
        }),

        removeItem: (itemId) => set((state) => {
          const newItems = state.items.filter((item) => item.id !== itemId)
          return { 
            items: newItems,
            itemCount: newItems.reduce((sum, item) => sum + item.quantity, 0)
          }
        }),

        updateQuantity: (itemId, quantity) => set((state) => {
          const newItems = state.items
            .map((item) => item.id === itemId ? { ...item, quantity: Math.max(0, quantity) } : item)
            .filter((item) => item.quantity > 0)
          
          return { 
            items: newItems,
            itemCount: newItems.reduce((sum, item) => sum + item.quantity, 0)
          }
        }),

        clearCart: () => set({
          items: [],
          grossTotalPrice: 0,
          totalPrice: 0,
          itemCount: 0,
          voucherDiscount: 0, // Reset on clear
          note: '',
          preferredDeliveryTime: '',
          preferredDeliveryPeriod: 'AM',
        }),

        calculateGrossTotalPrice: () => set((state) => ({
          grossTotalPrice: Number(state.items
            .reduce((total, item) => total + item.offerPrice * item.quantity, 0)
            .toFixed(2))
        })),

        calculateTotalPrice: (deliveryCharge, taxRate) => set((state) => {
          // 1. Apply discount to gross price
          const discountedGross = Math.max(0, state.grossTotalPrice - state.voucherDiscount);
          // 2. Add delivery charge
          const subtotal = discountedGross + deliveryCharge;
          // 3. Apply tax on subtotal
          const total = Number((subtotal + (subtotal * taxRate)).toFixed(2));
          return { totalPrice: total };
        }),

        getItemById: (itemId) => get().items.find((item) => item.id === itemId),
        
        getTotalItems: () => get().itemCount
      }),
      {
        name: 'cart-storage',
        storage: createJSONStorage(() => customStorage),
        partialize: (state) => ({
          items: state.items,
          grossTotalPrice: state.grossTotalPrice,
          totalPrice: state.totalPrice,
          itemCount: state.itemCount,
          voucherDiscount: state.voucherDiscount, // Persist discount
          note: state.note,
          preferredDeliveryTime: state.preferredDeliveryTime,
          preferredDeliveryPeriod: state.preferredDeliveryPeriod,
        })
      }
    )
  )
)