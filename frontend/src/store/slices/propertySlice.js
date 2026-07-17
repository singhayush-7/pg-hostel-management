import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';

 

export const fetchAllProperties = createAsyncThunk(
  'property/fetchAll',
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await api.get('/properties', { params });
      return response.data.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to fetch properties'
      );
    }
  }
);

export const fetchMyProperties = createAsyncThunk(
  'property/fetchMy',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/properties/my');
      return response.data.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to fetch your properties'
      );
    }
  }
);

export const fetchPropertyById = createAsyncThunk(
  'property/fetchById',
  async (id, { rejectWithValue }) => {
    try {
      const response = await api.get(`/properties/${id}`);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to fetch property'
      );
    }
  }
);

export const createProperty = createAsyncThunk(
  'property/create',
  async (formData, { rejectWithValue }) => {
    try {
      const response = await api.post('/properties', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return response.data.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to create property'
      );
    }
  }
);

export const updateProperty = createAsyncThunk(
  'property/update',
  async ({ id, formData }, { rejectWithValue }) => {
    try {
      const response = await api.put(`/properties/${id}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return response.data.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to update property'
      );
    }
  }
);

export const deleteProperty = createAsyncThunk(
  'property/delete',
  async (id, { rejectWithValue }) => {
    try {
      await api.delete(`/properties/${id}`);
      return id;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to delete property'
      );
    }
  }
);
 
const initialState = {
  properties: [],
  myProperties: [],
  currentProperty: null,
  isLoading: false,
  error: null,
  totalPages: 1,
  currentPage: 1,
};



const propertySlice = createSlice({
  name: 'property',
  initialState,
  reducers: {
    clearPropertyError: (state) => {
      state.error = null;
    },
    clearCurrentProperty: (state) => {
      state.currentProperty = null;
    },
  },
  extraReducers: (builder) => {
   
    builder
      .addCase(fetchAllProperties.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchAllProperties.fulfilled, (state, action) => {
        state.isLoading = false;
        state.properties = action.payload.properties || action.payload;
        state.totalPages = action.payload.totalPages || 1;
        state.currentPage = action.payload.currentPage || 1;
      })
      .addCase(fetchAllProperties.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });

    
    builder
      .addCase(fetchMyProperties.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchMyProperties.fulfilled, (state, action) => {
        state.isLoading = false;
        state.myProperties = action.payload.properties || action.payload;
      })
      .addCase(fetchMyProperties.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });
 
    builder
      .addCase(fetchPropertyById.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchPropertyById.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentProperty = action.payload.property || action.payload;
      })
      .addCase(fetchPropertyById.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });

    
    builder
      .addCase(createProperty.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(createProperty.fulfilled, (state, action) => {
        state.isLoading = false;
        const newProperty = action.payload.property || action.payload;
        state.myProperties.unshift(newProperty);
        state.currentProperty = newProperty;
      })
      .addCase(createProperty.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });

    
    builder
      .addCase(updateProperty.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateProperty.fulfilled, (state, action) => {
        state.isLoading = false;
        const updated = action.payload.property || action.payload;
        state.currentProperty = updated;
        state.myProperties = state.myProperties.map((p) =>
          p._id === updated._id ? updated : p
        );
      })
      .addCase(updateProperty.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });

  
    builder
      .addCase(deleteProperty.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(deleteProperty.fulfilled, (state, action) => {
        state.isLoading = false;
        const deletedId = action.payload;
        state.myProperties = state.myProperties.filter(
          (p) => p._id !== deletedId
        );
        state.properties = state.properties.filter(
          (p) => p._id !== deletedId
        );
        if (state.currentProperty?._id === deletedId) {
          state.currentProperty = null;
        }
      })
      .addCase(deleteProperty.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });
  },
});

export const { clearPropertyError, clearCurrentProperty } = propertySlice.actions;
 
export const selectAllProperties = (state) => state.property.properties;
export const selectMyProperties = (state) => state.property.myProperties;
export const selectCurrentProperty = (state) => state.property.currentProperty;
export const selectPropertyLoading = (state) => state.property.isLoading;
export const selectPropertyError = (state) => state.property.error;
export const selectTotalPages = (state) => state.property.totalPages;
export const selectCurrentPage = (state) => state.property.currentPage;

export default propertySlice.reducer;
