import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

// ── Single source of truth for "what does this unit cost right now" ──
// Mirrors the rule in orderController.createOrder exactly.
const effectivePricing = (data) => {
  const onSale = Boolean(
    (data.isOnSale || data.isClearance) &&
    data.salePrice > 0 &&
    data.salePrice < data.price
  );
  return {
    price: onSale ? data.salePrice : data.price,
    regularPrice: data.price,
    onSale,
  };
};

// Cart items are a snapshot from the moment they were added. This
// re-checks them against live product data (sales starting or ending,
// admin price edits) and patches only the pricing and stock fields, so
// an item the buyer removes mid-refresh is never resurrected.
export const refreshCartPrices = createAsyncThunk(
  'cart/refreshCartPrices',
  async (_, { getState }) => {
    const { cart } = getState();
    const results = await Promise.allSettled(
      cart.cartItems.map((x) => axios.get(`/api/products/${x.product}`))
    );
    const patches = [];
    results.forEach((r, i) => {
      if (r.status !== 'fulfilled') return; // keep the item as-is
      const data = r.value.data;
      patches.push({
        product: cart.cartItems[i].product,
        ...effectivePricing(data),
        countInStock: data.countInStock,
        unitType: data.unitType || data.unit || 'Per Unit',
        itemsPerUnit: data.itemsPerUnit || null,
      });
    });
    return patches;
  }
);

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
        // Charged unit price: the sale price while a sale is active,
        // otherwise the regular price (regularPrice/onSale drive the
        // strike-through in the cart).
        ...effectivePricing(data),
        countInStock: data.countInStock,
        // ── Category snapshot (bug fix) ──────────────────────────────
        // Without this, ShippingPage.jsx and PlaceOrderPage.jsx's
        // TIER_2_CATEGORIES.includes(item.category) checks always
        // evaluated false on the frontend — the buyer never saw the
        // "Delivery Quote Required" notice before placing the order,
        // only found out afterward once the backend (which re-fetches
        // category from the DB independently) flagged it. Pricing was
        // never wrong, but the buyer had no warning. Same pattern as
        // unitType/itemsPerUnit below — display data, re-verified
        // server-side at order creation regardless.
        category:     data.category,

        
        // ── Wholesale unit display fields (DEC-040 / DEC-041) ──────
        // Used by CartPage's compact per-line sanity check. Read-only
        // display data — never sent to the backend on checkout. The
        // authoritative snapshot is taken fresh from the product
        // document inside createOrder, not from anything carried here.
        unitType:     data.unitType || data.unit || 'Per Unit',
        itemsPerUnit: data.itemsPerUnit || null,
        qty,
      };
      const { cart } = getState();
      const existItem = cart.cartItems.find(
        (x) => x.product === item.product
      );
      if (existItem) {
        return {
          type: 'increment',
          cartItems: cart.cartItems.map((x) =>
            x.product === existItem.product
              ? { ...x, qty: x.qty + item.qty }
              : x
          ),
        };
      } else {
        return {
          type: 'new',
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
  state.shippingPrice = addDecimals(10);
  state.taxPrice = addDecimals(
    Number((0.16 * Number(state.itemsPrice)).toFixed(2))
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
    cartItems: localStorage.getItem('cartItems')
      ? JSON.parse(localStorage.getItem('cartItems'))
      : [],
    shippingAddress: localStorage.getItem('shippingAddress')
      ? JSON.parse(localStorage.getItem('shippingAddress'))
      : {},
    paymentMethod: localStorage.getItem('paymentMethod')
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
    updateCartQty: (state, action) => {
      const { id, qty } = action.payload;
      state.cartItems = state.cartItems.map((x) =>
        x.product === id ? { ...x, qty } : x
      );
      updateCartPrices(state);
    },
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
      .addCase(refreshCartPrices.fulfilled, (state, action) => {
        const byId = {};
        action.payload.forEach((p) => { byId[p.product] = p; });
        state.cartItems = state.cartItems.map((x) =>
          byId[x.product] ? { ...x, ...byId[x.product] } : x
        );
        updateCartPrices(state);
      })
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
  updateCartQty,
  removeFromCart,
  saveShippingAddress,
  savePaymentMethod,
  clearCartItems,
} = cartSlice.actions;

export default cartSlice.reducer;