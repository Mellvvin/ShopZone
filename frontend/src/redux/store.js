import { configureStore } from '@reduxjs/toolkit';
import productReducer from './slices/productSlice';
import authReducer from './slices/authSlice';
import cartReducer from './slices/cartSlice';

const store = configureStore({
  reducer: {
    products: productReducer,
    auth:     authReducer,
    cart:     cartReducer,
  },
});

export default store;