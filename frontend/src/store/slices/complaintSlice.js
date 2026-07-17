import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';

const API_URL = '/complaints';

// Fetch all complaints for logged-in user
export const fetchComplaints = createAsyncThunk(
  'complaints/fetch',
  async (_, thunkAPI) => {
    try {
      const response = await api.get(API_URL);
      return response.data.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || 'Failed to fetch complaints'
      );
    }
  }
);

// Create a new complaint (Tenant)
export const createComplaint = createAsyncThunk(
  'complaints/create',
  async (complaintData, thunkAPI) => {
    try {
      const response = await api.post(API_URL, complaintData);
      return response.data.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || 'Failed to raise complaint'
      );
    }
  }
);

// Update status or add reply
export const updateComplaint = createAsyncThunk(
  'complaints/update',
  async ({ id, status, replyText }, thunkAPI) => {
    try {
      const response = await api.patch(`${API_URL}/${id}`, { status, replyText });
      return response.data.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || 'Failed to update complaint'
      );
    }
  }
);

const initialState = {
  items: [],
  isLoading: false,
  error: null,
};

const complaintSlice = createSlice({
  name: 'complaints',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      // Fetch
      .addCase(fetchComplaints.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchComplaints.fulfilled, (state, action) => {
        state.isLoading = false;
        state.items = action.payload;
      })
      .addCase(fetchComplaints.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Create
      .addCase(createComplaint.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(createComplaint.fulfilled, (state, action) => {
        state.isLoading = false;
        // Prepend new complaint
        state.items.unshift(action.payload);
      })
      .addCase(createComplaint.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Update
      .addCase(updateComplaint.fulfilled, (state, action) => {
        const index = state.items.findIndex(c => c._id === action.payload._id);
        if (index !== -1) {
          state.items[index] = action.payload;
        }
      });
  },
});

export const selectComplaints = (state) => state.complaint.items;
export const selectComplaintsLoading = (state) => state.complaint.isLoading;

export default complaintSlice.reducer;
