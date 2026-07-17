import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';

// Fetch Owner Dashboard Data
export const fetchOwnerDashboard = createAsyncThunk(
  'dashboard/fetchOwner',
  async (_, thunkAPI) => {
    try {
      const response = await api.get('/dashboard/owner');
      return response.data.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || 'Failed to fetch dashboard data'
      );
    }
  }
);

const initialState = {
  data: {
    properties: [],
    pendingRequests: [],
    recentPayments: [],
    vacantRooms: [],
    maintenanceQueue: [],
    notifications: [],
    overview: {
      activeBookings: 0,
      pendingBookings: 0,
      pendingComplaints: 0,
      maintenance: 0,
      rentDue: 0,
      leaseExpiring: 0
    }
  },
  isLoading: false,
  error: null,
};

const dashboardSlice = createSlice({
  name: 'dashboard',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchOwnerDashboard.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchOwnerDashboard.fulfilled, (state, action) => {
        state.isLoading = false;
        state.data = action.payload;
      })
      .addCase(fetchOwnerDashboard.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });
  },
});

export const selectDashboardData = (state) => state.dashboard.data;
export const selectDashboardLoading = (state) => state.dashboard.isLoading;

export default dashboardSlice.reducer;
