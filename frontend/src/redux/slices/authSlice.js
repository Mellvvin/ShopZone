import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

// ── ASYNC ACTIONS ──────────────────────────────────────────
export const login = createAsyncThunk(
  'auth/login',
  async ({ email, password }, { rejectWithValue }) => {
    try {
      const config = {
        headers: { 'Content-Type': 'application/json' },
      };
      const { data } = await axios.post(
        '/api/users/login',
        { email, password },
        config
      );
      localStorage.setItem('userInfo', JSON.stringify(data));
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

// Register thunk — sends all new fields to the backend
export const register = createAsyncThunk(
  'auth/register',
  async (
    { name, email, password, phone, accountType, businessName, businessType, county },
    { rejectWithValue }
  ) => {
    try {
      const { data } = await axios.post('/api/users', {
        name,
        email,
        password,
        phone,
        accountType,
        businessName,
        businessType,
        county,
      });
      // Persist to localStorage so the user stays logged in on refresh
      localStorage.setItem('userInfo', JSON.stringify(data));
      return data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Registration failed. Please try again.'
      );
    }
  }
);

export const logout = createAsyncThunk(
  'auth/logout',
  async () => {
    localStorage.removeItem('userInfo');
  }
);

// ── SLICE ──────────────────────────────────────────────────
const authSlice = createSlice({
  name: 'auth',
  initialState: {
    userInfo: localStorage.getItem('userInfo')
      ? JSON.parse(localStorage.getItem('userInfo'))
      : null,
    loading: false,
    error:   null,
  },
 reducers: {
    // setCredentials — called after a successful profile update to sync
    // the Redux store and localStorage with the latest user data from the server
    setCredentials: (state, action) => {
      state.userInfo = action.payload;
      localStorage.setItem('userInfo', JSON.stringify(action.payload));
    },
  },
  extraReducers: (builder) => {

    // Login
    builder
      .addCase(login.pending, (state) => {
        state.loading = true;
        state.error   = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.loading  = false;
        state.userInfo = action.payload;
      })
      .addCase(login.rejected, (state, action) => {
        state.loading = false;
        state.error   = action.payload;
      });

    // Register
    builder
      .addCase(register.pending, (state) => {
        state.loading = true;
        state.error   = null;
      })
      .addCase(register.fulfilled, (state, action) => {
        state.loading  = false;
        state.userInfo = action.payload;
      })
      .addCase(register.rejected, (state, action) => {
        state.loading = false;
        state.error   = action.payload;
      });

    // Logout
    builder
      .addCase(logout.fulfilled, (state) => {
        state.userInfo = null;
        state.loading  = false;
        state.error    = null;
      });
  },
});

export const { setCredentials } = authSlice.actions;
export default authSlice.reducer;