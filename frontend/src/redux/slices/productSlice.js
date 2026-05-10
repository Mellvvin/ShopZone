import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

// ── ASYNC ACTIONS ──────────────────────────────────────────
export const listProducts = createAsyncThunk(
  'products/listProducts',
  async (keyword = '', { rejectWithValue }) => {
    try {
      const { data } = await axios.get(
        `/api/products?keyword=${keyword}`
      );
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

export const createProductReview = createAsyncThunk(
  'products/createProductReview',
  async ({ id, rating, comment }, { getState, rejectWithValue }) => {
    try {
      const { auth: { userInfo } } = getState();
      const config = {
        headers: {
          'Content-Type': 'application/json',
          Authorization:  `Bearer ${userInfo.token}`,
        },
      };
      await axios.post(
        `/api/products/${id}/reviews`,
        { rating, comment },
        config
      );
      return true;
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
  productList: {
    products: [],
    loading:  true,   // ← changed from false to true
    error:    null,
  },
  productDetails: {
    product: {},
    loading: false,
    error:   null,
  },
  productReview: {
    loading: false,
    error:   null,
    success: false,
  },
},
  reducers: {
    resetProductReview: (state) => {
      state.productReview = {
        loading: false,
        error:   null,
        success: false,
      };
    },
  },
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

    // Create product review
    builder
      .addCase(createProductReview.pending, (state) => {
        state.productReview.loading = true;
        state.productReview.error   = null;
        state.productReview.success = false;
      })
      .addCase(createProductReview.fulfilled, (state) => {
        state.productReview.loading = false;
        state.productReview.success = true;
      })
      .addCase(createProductReview.rejected, (state, action) => {
        state.productReview.loading = false;
        state.productReview.error   = action.payload;
      });
  },
});

export const { resetProductReview } = productSlice.actions;
export default productSlice.reducer;