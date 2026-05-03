import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

// ── ASYNC ACTIONS ──────────────────────────────────────────
export const addToCart = createAsyncThunk(
  'cart/addToCart',
  async ({ id, qty }, { getState, rejectWithValue }) => {
    try {
      const { data } = await axios.get(`/api/products/${id}`);
      const item = {
        product:      data._id,
        name:         data.name,
        image:        data.image,
        price:        data.price,
        countInStock: data.countInStock,
        qty,
      };
      const { cart } = getState();
      const existItem = cart.cartItems.find(
        (x) => x.product === item.product
      );
      if (existItem) {
        return {
          cartItems: cart.cartItems.map((x) =>
            x.product === existItem.product ? item : x
          ),
        };
      } else {
        return {
          cartItems: [...cart.cartItems, item],
        };
      }
    } catch (error) {
      return rejectWithValue(
        error.response && error.response.data.message
          ? error.response.data.message
          : error.message
      );
    }
  }
);

// ── HELPERS ────────────────────────────────────────────────
const addDecimals = (num) => {
  return (Math.round(num * 100) / 100).toFixed(2);
};

const updateCartPrices = (state) => {
  state.itemsPrice = addDecimals(
    state.cartItems.reduce((acc, item) => acc + item.price * item.qty, 0)
  );
  state.shippingPrice = addDecimals(
    Number(state.itemsPrice) > 100 ? 0 : 10
  );
  state.taxPrice = addDecimals(
    Number((0.15 * Number(state.itemsPrice)).toFixed(2))
  );
  state.totalPrice = addDecimals(
    Number(state.itemsPrice) +
    Number(state.shippingPrice) +
    Number(state.taxPrice)
  );
  localStorage.setItem('cartItems', JSON.stringify(state.cartItems));
};

// ── SLICE ──────────────────────────────────────────────────
const cartSlice = createSlice({
  name: 'cart',
  initialState: {
    cartItems:      localStorage.getItem('cartItems')
      ? JSON.parse(localStorage.getItem('cartItems'))
      : [],
    shippingAddress: localStorage.getItem('shippingAddress')
      ? JSON.parse(localStorage.getItem('shippingAddress'))
      : {},
    paymentMethod:  localStorage.getItem('paymentMethod')
      ? localStorage.getItem('paymentMethod')
      : 'PayPal',
    itemsPrice:    '0.00',
    shippingPrice: '0.00',
    taxPrice:      '0.00',
    totalPrice:    '0.00',
    loading:       false,
    error:         null,
  },
  reducers: {
    removeFromCart: (state, action) => {
      state.cartItems = state.cartItems.filter(
        (x) => x.product !== action.payload
      );
      updateCartPrices(state);
      localStorage.setItem('cartItems', JSON.stringify(state.cartItems));
    },
    saveShippingAddress: (state, action) => {
      state.shippingAddress = action.payload;
      localStorage.setItem(
        'shippingAddress',
        JSON.stringify(action.payload)
      );
    },
    savePaymentMethod: (state, action) => {
      state.paymentMethod = action.payload;
      localStorage.setItem('paymentMethod', action.payload);
    },
    clearCartItems: (state) => {
      state.cartItems = [];
      localStorage.removeItem('cartItems');
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(addToCart.pending, (state) => {
        state.loading = true;
        state.error   = null;
      })
      .addCase(addToCart.fulfilled, (state, action) => {
        state.loading   = false;
        state.cartItems = action.payload.cartItems;
        updateCartPrices(state);
      })
      .addCase(addToCart.rejected, (state, action) => {
        state.loading = false;
        state.error   = action.payload;
      });
  },
});

export const {
  removeFromCart,
  saveShippingAddress,
  savePaymentMethod,
  clearCartItems,
} = cartSlice.actions;

export default cartSlice.reducer;