import { createSlice, PayloadAction } from '@reduxjs/toolkit';

// type CartItem = {
//   id: string;
//   name: string;
//   price: number;
//   quantity: number;
//   // Add other fields as needed
// };

// interface CartState {
//   cartItems: any[];
//   isCartOpen: boolean;
// }

const initialState: any = {
  cartItems: [],
  isCartOpen: false,
};

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    setCartItems: (state, action:PayloadAction<any>) => {
      state.cartItems = action.payload;
    },
    setIsCartOpen: (state, action: PayloadAction<any>) => {
      state.isCartOpen = action.payload;
    },
  },
});

export const {
  setCartItems,
  setIsCartOpen,
} = cartSlice.actions;

export default cartSlice.reducer;
