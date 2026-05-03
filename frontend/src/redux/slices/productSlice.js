import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

// ── ASYNC ACTIONS ──────────────────────────────────────────
export const listProducts = createAsyncThunk(
  'products/listProducts',
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await axios.get('/api/products');
      return data;
    } catch (error) {
      return rejectWithValue(
        error.response && error.response.data.message
          ? error.response.data.message
          : error.message
      );
    }
  }
);

export const listProductDetails = createAsyncThunk(
  'products/listProductDetails',
  async (id, { rejectWithValue }) => {
    try {
      const { data } = await axios.get(`/api/products/${id}`);
      return data;
    } catch (error) {
      return rejectWithValue(
        error.response && error.response.data.message
          ? error.response.data.message
          : error.message
      );
    }
  }
);

// ── SLICE ──────────────────────────────────────────────────
const productSlice = createSlice({
  name: 'products',
  initialState: {
    productList:    { products: [], loading: false, error: null },
    productDetails: { product: {}, loading: false, error: null },
  },
  reducers: {},
  extraReducers: (builder) => {

    // List all products
    builder
      .addCase(listProducts.pending, (state) => {
        state.productList.loading = true;
        state.productList.error   = null;
      })
      .addCase(listProducts.fulfilled, (state, action) => {
        state.productList.loading  = false;
        state.productList.products = action.payload;
      })
      .addCase(listProducts.rejected, (state, action) => {
        state.productList.loading = false;
        state.productList.error   = action.payload;
      });

    // Get single product details
    builder
      .addCase(listProductDetails.pending, (state) => {
        state.productDetails.loading = true;
        state.productDetails.error   = null;
      })
      .addCase(listProductDetails.fulfilled, (state, action) => {
        state.productDetails.loading = false;
        state.productDetails.product = action.payload;
      })
      .addCase(listProductDetails.rejected, (state, action) => {
        state.productDetails.loading = false;
        state.productDetails.error   = action.payload;
      });
  },
});

export default productSlice.reducer;