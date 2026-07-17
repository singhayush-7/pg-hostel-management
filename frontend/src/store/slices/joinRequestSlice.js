import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';

 

export const submitJoinRequest = createAsyncThunk(
  'joinRequest/submit',
  async (formData, { rejectWithValue }) => {
    try {
      const response = await api.post('/join-requests', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return response.data.data.joinRequest;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to submit join request'
      );
    }
  }
);

export const fetchTenantRequests = createAsyncThunk(
  'joinRequest/fetchTenant',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/join-requests/tenant');
      return response.data.data.joinRequests;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to fetch your requests'
      );
    }
  }
);

export const fetchOwnerRequests = createAsyncThunk(
  'joinRequest/fetchOwner',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/join-requests/owner');
      return response.data.data.joinRequests;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to fetch incoming requests'
      );
    }
  }
);

export const updateRequestStatus = createAsyncThunk(
  'joinRequest/updateStatus',
  async ({ id, status }, { rejectWithValue }) => {
    try {
      const response = await api.patch(`/join-requests/${id}/status`, { status });
      return response.data.data.joinRequest;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to update request status'
      );
    }
  }
);

 

const initialState = {
  tenantRequests: [],
  ownerRequests: [],
  isLoading: false,
  error: null,
};
 

const joinRequestSlice = createSlice({
  name: 'joinRequest',
  initialState,
  reducers: {
    clearJoinRequestError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
   
    builder
      .addCase(submitJoinRequest.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(submitJoinRequest.fulfilled, (state, action) => {
        state.isLoading = false;
        state.tenantRequests.unshift(action.payload);
      })
      .addCase(submitJoinRequest.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });

    
    builder
      .addCase(fetchTenantRequests.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchTenantRequests.fulfilled, (state, action) => {
        state.isLoading = false;
        state.tenantRequests = action.payload;
      })
      .addCase(fetchTenantRequests.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });

  
    builder
      .addCase(fetchOwnerRequests.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchOwnerRequests.fulfilled, (state, action) => {
        state.isLoading = false;
        state.ownerRequests = action.payload;
      })
      .addCase(fetchOwnerRequests.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });
 
    builder
      .addCase(updateRequestStatus.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateRequestStatus.fulfilled, (state, action) => {
        state.isLoading = false;
        const updated = action.payload;
   
        state.ownerRequests = state.ownerRequests.map((req) =>
          req._id === updated._id ? updated : req
        );
        
        
        if (updated.status === 'Approved') {
          state.ownerRequests = state.ownerRequests.map((req) => {
            if (req.room._id === updated.room._id && req._id !== updated._id && req.status === 'Pending') {
              return { ...req, status: 'Rejected' };
            }
            return req;
          });
        }
      })
      .addCase(updateRequestStatus.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });
  },
});

export const { clearJoinRequestError } = joinRequestSlice.actions;

export const selectTenantRequests = (state) => state.joinRequest.tenantRequests;
export const selectOwnerRequests = (state) => state.joinRequest.ownerRequests;
export const selectJoinRequestLoading = (state) => state.joinRequest.isLoading;
export const selectJoinRequestError = (state) => state.joinRequest.error;

export default joinRequestSlice.reducer;
