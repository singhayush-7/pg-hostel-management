import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';

 

export const fetchRoomsByProperty = createAsyncThunk(
  'room/fetchByProperty',
  async (propertyId, { rejectWithValue }) => {
    try {
      const response = await api.get(`/properties/${propertyId}/rooms`);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to fetch rooms'
      );
    }
  }
);

export const fetchRoomById = createAsyncThunk(
  'room/fetchById',
  async (id, { rejectWithValue }) => {
    try {
      const response = await api.get(`/rooms/${id}`);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to fetch room'
      );
    }
  }
);

export const createRoom = createAsyncThunk(
  'room/create',
  async ({ propertyId, formData }, { rejectWithValue }) => {
    try {
      const response = await api.post(
        `/properties/${propertyId}/rooms`,
        formData,
        { headers: { 'Content-Type': 'multipart/form-data' } }
      );
      return response.data.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to create room'
      );
    }
  }
);

export const updateRoom = createAsyncThunk(
  'room/update',
  async ({ id, formData }, { rejectWithValue }) => {
    try {
      const response = await api.put(`/rooms/${id}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return response.data.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to update room'
      );
    }
  }
);

export const deleteRoom = createAsyncThunk(
  'room/delete',
  async (id, { rejectWithValue }) => {
    try {
      await api.delete(`/rooms/${id}`);
      return id;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to delete room'
      );
    }
  }
);

 

const initialState = {
  rooms: [],
  currentRoom: null,
  isLoading: false,
  error: null,
};
 

const roomSlice = createSlice({
  name: 'room',
  initialState,
  reducers: {
    clearRoomError: (state) => {
      state.error = null;
    },
    clearCurrentRoom: (state) => {
      state.currentRoom = null;
    },
    clearRooms: (state) => {
      state.rooms = [];
    },
  },
  extraReducers: (builder) => {
   
    builder
      .addCase(fetchRoomsByProperty.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchRoomsByProperty.fulfilled, (state, action) => {
        state.isLoading = false;
        state.rooms = action.payload.rooms || action.payload;
      })
      .addCase(fetchRoomsByProperty.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });

    
    builder
      .addCase(fetchRoomById.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchRoomById.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentRoom = action.payload.room || action.payload;
      })
      .addCase(fetchRoomById.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });
 
    builder
      .addCase(createRoom.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(createRoom.fulfilled, (state, action) => {
        state.isLoading = false;
        const newRoom = action.payload.room || action.payload;
        state.rooms.unshift(newRoom);
        state.currentRoom = newRoom;
      })
      .addCase(createRoom.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });
 
    builder
      .addCase(updateRoom.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateRoom.fulfilled, (state, action) => {
        state.isLoading = false;
        const updated = action.payload.room || action.payload;
        state.currentRoom = updated;
        state.rooms = state.rooms.map((r) =>
          r._id === updated._id ? updated : r
        );
      })
      .addCase(updateRoom.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });
 
    builder
      .addCase(deleteRoom.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(deleteRoom.fulfilled, (state, action) => {
        state.isLoading = false;
        const deletedId = action.payload;
        state.rooms = state.rooms.filter((r) => r._id !== deletedId);
        if (state.currentRoom?._id === deletedId) {
          state.currentRoom = null;
        }
      })
      .addCase(deleteRoom.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });
  },
});

export const { clearRoomError, clearCurrentRoom, clearRooms } = roomSlice.actions;
 
export const selectRooms = (state) => state.room.rooms;
export const selectCurrentRoom = (state) => state.room.currentRoom;
export const selectRoomLoading = (state) => state.room.isLoading;
export const selectRoomError = (state) => state.room.error;

export default roomSlice.reducer;
