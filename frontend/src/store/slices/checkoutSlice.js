import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';

// Async Thunks
export const submitCheckoutRequest = createAsyncThunk(
  'checkout/submit',
  async (checkoutData, thunkAPI) => {
    try {
      const response = await api.post('/checkout/request', checkoutData);
      return response.data.data.checkoutRequest;
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || 'Failed to submit check-out request'
      );
    }
  }
);

export const getMyCheckoutRequest = createAsyncThunk(
  'checkout/getMy',
  async (_, thunkAPI) => {
    try {
      const response = await api.get('/checkout/my-request');
      return response.data.data.checkoutRequests;
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || 'Failed to fetch check-out requests'
      );
    }
  }
);

export const getOwnerCheckoutRequests = createAsyncThunk(
  'checkout/getOwner',
  async (_, thunkAPI) => {
    try {
      const response = await api.get('/checkout/owner');
      return response.data.data.checkoutRequests;
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || 'Failed to fetch owner check-out requests'
      );
    }
  }
);

export const approveCheckoutRequest = createAsyncThunk(
  'checkout/approve',
  async (id, thunkAPI) => {
    try {
      const response = await api.put(`/checkout/${id}/approve`);
      return response.data.data.checkoutRequest;
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || 'Failed to approve check-out request'
      );
    }
  }
);

export const rejectCheckoutRequest = createAsyncThunk(
  'checkout/reject',
  async ({ id, remark }, thunkAPI) => {
    try {
      const response = await api.put(`/checkout/${id}/reject`, { remark });
      return response.data.data.checkoutRequest;
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || 'Failed to reject check-out request'
      );
    }
  }
);

const initialState = {
  requests: [],
  myRequests: [],
  isLoading: false,
  error: null,
  success: false,
};

const checkoutSlice = createSlice({
  name: 'checkout',
  initialState,
  reducers: {
    clearCheckoutError: (state) => {
      state.error = null;
    },
    clearCheckoutSuccess: (state) => {
      state.success = false;
    },
  },
  extraReducers: (builder) => {
    builder
      // submit
      .addCase(submitCheckoutRequest.pending, (state) => {
        state.isLoading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(submitCheckoutRequest.fulfilled, (state, action) => {
        state.isLoading = false;
        state.success = true;
        state.myRequests.unshift(action.payload);
      })
      .addCase(submitCheckoutRequest.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      
      // getMy
      .addCase(getMyCheckoutRequest.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getMyCheckoutRequest.fulfilled, (state, action) => {
        state.isLoading = false;
        state.myRequests = action.payload;
      })
      .addCase(getMyCheckoutRequest.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })

      // getOwner
      .addCase(getOwnerCheckoutRequests.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getOwnerCheckoutRequests.fulfilled, (state, action) => {
        state.isLoading = false;
        state.requests = action.payload;
      })
      .addCase(getOwnerCheckoutRequests.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })

      // approve
      .addCase(approveCheckoutRequest.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(approveCheckoutRequest.fulfilled, (state, action) => {
        state.isLoading = false;
        const index = state.requests.findIndex((req) => req._id === action.payload._id);
        if (index !== -1) {
          state.requests[index] = action.payload;
        }
      })
      .addCase(approveCheckoutRequest.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })

      // reject
      .addCase(rejectCheckoutRequest.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(rejectCheckoutRequest.fulfilled, (state, action) => {
        state.isLoading = false;
        const index = state.requests.findIndex((req) => req._id === action.payload._id);
        if (index !== -1) {
          state.requests[index] = action.payload;
        }
      })
      .addCase(rejectCheckoutRequest.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });
  },
});

export const { clearCheckoutError, clearCheckoutSuccess } = checkoutSlice.actions;

export const selectCheckoutRequests = (state) => state.checkout.requests;
export const selectMyCheckoutRequests = (state) => state.checkout.myRequests;
export const selectCheckoutLoading = (state) => state.checkout.isLoading;
export const selectCheckoutError = (state) => state.checkout.error;
export const selectCheckoutSuccess = (state) => state.checkout.success;

export default checkoutSlice.reducer;
