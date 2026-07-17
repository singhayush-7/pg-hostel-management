import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';

const API_URL = '/tasks';

export const fetchTasks = createAsyncThunk(
  'tasks/fetchTasks',
  async (_, thunkAPI) => {
    try {
      const response = await api.get(API_URL);
      return response.data.data.tasks;
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || 'Failed to fetch tasks'
      );
    }
  }
);

export const createTask = createAsyncThunk(
  'tasks/createTask',
  async (taskData, thunkAPI) => {
    try {
      const response = await api.post(API_URL, taskData);
      return response.data.data.task;
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || 'Failed to create task'
      );
    }
  }
);

export const updateTask = createAsyncThunk(
  'tasks/updateTask',
  async ({ id, status }, thunkAPI) => {
    try {
      const response = await api.patch(`${API_URL}/${id}`, { status });
      return response.data.data.task;
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || 'Failed to update task'
      );
    }
  }
);

const initialState = {
  items: [],
  isLoading: false,
  error: null,
};

const taskSlice = createSlice({
  name: 'tasks',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchTasks.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchTasks.fulfilled, (state, action) => {
        state.isLoading = false;
        state.items = action.payload;
      })
      .addCase(fetchTasks.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      .addCase(createTask.fulfilled, (state, action) => {
        state.items.unshift(action.payload);
      })
      .addCase(updateTask.fulfilled, (state, action) => {
        const index = state.items.findIndex(t => t._id === action.payload._id);
        if (index !== -1) {
          state.items[index] = action.payload;
        }
      });
  },
});

export const selectTasks = (state) => state.tasks.items;
export const selectTasksLoading = (state) => state.tasks.isLoading;

export default taskSlice.reducer;
