// frontend/src/redux/slices/productSlice.js
// ─────────────────────────────────────────────────────────────
// Manages all product-related Redux state:
//   listProducts    — fetch products with optional filters
//   listProductDetails — fetch a single product by ID
//   createProductReview — submit a review
//
// Step 11 update:
//   listProducts now accepts a filters object instead of a
//   plain keyword string, supporting:
//     keyword, category, featured, deals, clearance, tag
// ─────────────────────────────────────────────────────────────
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

// @desc    Fetch products with optional filters
// @param   filters {object} — any combination of:
//            keyword   {string}  — search term
//            category  {string}  — exact category match
//            featured  {boolean} — only featured products
//            deals     {boolean} — only on-sale products
//            clearance {boolean} — only clearance products
//            tag       {string}  — exact tag match
//
// Usage examples:
//   dispatch(listProducts({ keyword: 'samsung' }))
//   dispatch(listProducts({ category: 'Electronics' }))
//   dispatch(listProducts({ deals: true }))
//   dispatch(listProducts({}))  — fetches all products

// @desc    Fetch distinct brands with product counts for BrandsPage
// Returns an array of { brand, count } objects from the backend
// /api/products/brands endpoint.
export const listProductBrands = createAsyncThunk(
  'products/listBrands',
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await axios.get('/api/products/brands');
      return data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || error.message
      );
    }
  }
);

// @desc    Fetch featured products for the homepage Featured section
// @param   limit {number} — max results (default 8)
export const listFeaturedProducts = createAsyncThunk(
  'products/listFeatured',
  async (limit = 8, { rejectWithValue }) => {
    try {
      const { data } = await axios.get(
        `/api/products?featured=true&limit=${limit}`
      );
      return data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || error.message
      );
    }
  }
);

// @desc    Fetch deals products for the homepage Deals strip
// @param   limit {number} — max results (default 8)
// Hits the same /api/products endpoint with deals=true which the
// backend maps to isOnSale:true OR isClearance:true
export const listDealsProducts = createAsyncThunk(
  'products/listDeals',
  async (limit = 8, { rejectWithValue }) => {
    try {
      const { data } = await axios.get(
        `/api/products?deals=true&limit=${limit}`
      );
      return data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || error.message
      );
    }
  }
);

// @desc    Fetch newest products for the homepage New Arrivals section
// @param   limit {number} — max results (default 4)
export const listNewArrivals = createAsyncThunk(
  'products/listNewArrivals',
  async (limit = 4, { rejectWithValue }) => {
    try {
      const { data } = await axios.get(
        `/api/products?sort=newest&limit=${limit}`
      );
      return data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || error.message
      );
    }
  }
);

export const listProducts = createAsyncThunk(
  'products/list',
  async (filters = {}, { rejectWithValue }) => {
    try {
      // ── Build query string from filters object ─────────────
      // URLSearchParams converts the filters object into a
      // properly encoded query string.
      // Example: { keyword: 'samsung', category: 'Electronics' }
      // becomes: ?keyword=samsung&category=Electronics
      const params = new URLSearchParams();

      if (filters.keyword)  params.append('keyword',  filters.keyword);
      if (filters.category) params.append('category', filters.category);
      if (filters.featured) params.append('featured',  'true');
      if (filters.deals)    params.append('deals',     'true');
      if (filters.clearance) params.append('clearance', 'true');
      if (filters.tag)      params.append('tag',       filters.tag);
      if (filters.brand)    params.append('brand',     filters.brand);
      if (filters.sort)     params.append('sort',      filters.sort);

      // ── Fetch from backend ─────────────────────────────────
      const queryString = params.toString();
      const url = queryString
        ? `/api/products?${queryString}`
        : '/api/products';

      const { data } = await axios.get(url);
      return data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || error.message
      );
    }
  }
);

// @desc    Fetch a single product by ID
// @param   id {string} — MongoDB product ID
export const listProductDetails = createAsyncThunk(
  'products/details',
  async (id, { rejectWithValue }) => {
    try {
      const { data } = await axios.get(`/api/products/${id}`);
      return data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || error.message
      );
    }
  }
);

// @desc    Submit a product review
// @param   { productId, rating, comment }
export const createProductReview = createAsyncThunk(
  'products/createReview',
  async ({ productId, rating, comment }, { getState, rejectWithValue }) => {
    try {
      // Get the auth token from Redux state
      const { auth: { userInfo } } = getState();
      const config = {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${userInfo.token}`,
        },
      };
      await axios.post(
        `/api/products/${productId}/reviews`,
        { rating, comment },
        config
      );
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || error.message
      );
    }
  }
);

// ── Slice ─────────────────────────────────────────────────────
const productSlice = createSlice({
  name: 'products',
initialState: {
    // Product list state — browse/search mode
    products: [],
    loadingList: false,
    errorList: null,

    // Featured products — homepage Featured section
    featuredProducts: [],
    loadingFeatured: false,
    errorFeatured: null,

  // New arrivals — homepage New Arrivals section
    newArrivals: [],
    loadingNewArrivals: false,
    errorNewArrivals: null,

// Deals products — homepage Deals strip
    dealsProducts: [],
    loadingDeals: false,
    errorDeals: null,

    // Brands list — BrandsPage
    brands: [],
    loadingBrands: false,
    errorBrands: null,

    // Single product state
    product: {},
    loadingDetails: false,
    errorDetails: null,

    // Review submission state
    reviewSuccess: false,
    reviewLoading: false,
    reviewError: null,
  },
  reducers: {
    // ── Reset review state after submission ──────────────────
    // Call this when unmounting the product page so the next
    // product page starts with a clean review state.
    resetProductReview: (state) => {
      state.reviewSuccess = false;
      state.reviewLoading = false;
      state.reviewError = null;
    },
  },
  extraReducers: (builder) => {

    // ── listProducts ─────────────────────────────────────────
    // ── listFeaturedProducts ──────────────────────────────────
    builder
      .addCase(listFeaturedProducts.pending, (state) => {
        state.loadingFeatured = true;
        state.errorFeatured = null;
      })
      .addCase(listFeaturedProducts.fulfilled, (state, action) => {
        state.loadingFeatured = false;
        state.featuredProducts = action.payload;
      })
      .addCase(listFeaturedProducts.rejected, (state, action) => {
        state.loadingFeatured = false;
        state.errorFeatured = action.payload;
      });

// ── listProductBrands ─────────────────────────────────────
    builder
      .addCase(listProductBrands.pending, (state) => {
        state.loadingBrands = true;
        state.errorBrands = null;
      })
      .addCase(listProductBrands.fulfilled, (state, action) => {
        state.loadingBrands = false;
        state.brands = action.payload;
      })
      .addCase(listProductBrands.rejected, (state, action) => {
        state.loadingBrands = false;
        state.errorBrands = action.payload;
      });

    // ── listDealsProducts ─────────────────────────────────────
    builder
      .addCase(listDealsProducts.pending, (state) => {
        state.loadingDeals = true;
        state.errorDeals = null;
      })
      .addCase(listDealsProducts.fulfilled, (state, action) => {
        state.loadingDeals = false;
        state.dealsProducts = action.payload;
      })
      .addCase(listDealsProducts.rejected, (state, action) => {
        state.loadingDeals = false;
        state.errorDeals = action.payload;
      });

    // ── listNewArrivals ───────────────────────────────────────
    builder
      .addCase(listNewArrivals.pending, (state) => {
        state.loadingNewArrivals = true;
        state.errorNewArrivals = null;
      })
      .addCase(listNewArrivals.fulfilled, (state, action) => {
        state.loadingNewArrivals = false;
        state.newArrivals = action.payload;
      })
      .addCase(listNewArrivals.rejected, (state, action) => {
        state.loadingNewArrivals = false;
        state.errorNewArrivals = action.payload;
      });

    // ── listProducts ─────────────────────────────────────────
    builder
      .addCase(listProducts.pending, (state) => {
        state.loadingList = true;
        state.errorList = null;
      })
      .addCase(listProducts.fulfilled, (state, action) => {
        state.loadingList = false;
        state.products = action.payload;
      })
      .addCase(listProducts.rejected, (state, action) => {
        state.loadingList = false;
        state.errorList = action.payload;
      });

    // ── listProductDetails ───────────────────────────────────
    builder
      .addCase(listProductDetails.pending, (state) => {
        state.loadingDetails = true;
        state.errorDetails = null;
      })
      .addCase(listProductDetails.fulfilled, (state, action) => {
        state.loadingDetails = false;
        state.product = action.payload;
      })
      .addCase(listProductDetails.rejected, (state, action) => {
        state.loadingDetails = false;
        state.errorDetails = action.payload;
      });

    // ── createProductReview ──────────────────────────────────
    builder
      .addCase(createProductReview.pending, (state) => {
        state.reviewLoading = true;
        state.reviewError = null;
        state.reviewSuccess = false;
      })
      .addCase(createProductReview.fulfilled, (state) => {
        state.reviewLoading = false;
        state.reviewSuccess = true;
      })
      .addCase(createProductReview.rejected, (state, action) => {
        state.reviewLoading = false;
        state.reviewError = action.payload;
      });
  },
});

export const { resetProductReview } = productSlice.actions;
export default productSlice.reducer;