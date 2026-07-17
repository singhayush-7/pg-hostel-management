import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';

 

export const createPaymentOrder = createAsyncThunk(
  'payment/createOrder',
  async (bookingId, { rejectWithValue }) => {
    try {
      const response = await api.post('/payments/create-order', { bookingId });
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to create payment order'
      );
    }
  }
);

export const verifyPayment = createAsyncThunk(
  'payment/verify',
  async (paymentData, { rejectWithValue }) => {
    try {
      const response = await api.post('/payments/verify', paymentData);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to verify payment'
      );
    }
  }
);

export const fetchPaymentHistory = createAsyncThunk(
  'payment/fetchHistory',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/payments/history');
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to fetch payment history'
      );
    }
  }
);
 

const initialState = {
  payments: [],
  isLoading: false,
  error: null,
  currentOrder: null,
};
 

const paymentSlice = createSlice({
  name: 'payment',
  initialState,
  reducers: {
    clearPaymentError: (state) => {
      state.error = null;
    },
    clearCurrentOrder: (state) => {
      state.currentOrder = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Create Order
      .addCase(createPaymentOrder.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(createPaymentOrder.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentOrder = action.payload;
      })
      .addCase(createPaymentOrder.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Verify Payment
      .addCase(verifyPayment.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(verifyPayment.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentOrder = null;
        // Optionally update payments array if it's already loaded
      })
      .addCase(verifyPayment.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Fetch History
      .addCase(fetchPaymentHistory.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchPaymentHistory.fulfilled, (state, action) => {
        state.isLoading = false;
        state.payments = action.payload;
      })
      .addCase(fetchPaymentHistory.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });
  },
});

export const { clearPaymentError, clearCurrentOrder } = paymentSlice.actions;

export const selectPayments = (state) => state.payment.payments;
export const selectPaymentLoading = (state) => state.payment.isLoading;
export const selectPaymentError = (state) => state.payment.error;
export const selectCurrentOrder = (state) => state.payment.currentOrder;

export default paymentSlice.reducer;
