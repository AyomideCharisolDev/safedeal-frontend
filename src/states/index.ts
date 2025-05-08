// store/index.ts
import { configureStore } from '@reduxjs/toolkit';
import cartReducer from './cartSlice';
import userReducer from './userSlice';
import dealsReducer from './dealSlice';

export const store = configureStore({
  reducer: {
    cart: cartReducer,
    user: userReducer,
    deals:dealsReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
