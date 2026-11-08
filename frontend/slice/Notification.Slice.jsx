import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

import {
  listNotificationService,
  retrieveNotificationService,
  updateNotificationService,
  updateMarkAllReadNotificationService,
  getUnreadCountService,
} from "../service/Notification.Service";

export const listNotificationThunkApi = createAsyncThunk(
  "notification/listNotificationThunkApi",
  async (params, { rejectWithValue }) => {
    try {
      const res = await listNotificationService(params);
      return res.data;
    } catch (error) {
      return rejectWithValue(
        error?.response?.data?.message ||
          error?.response?.data?.error ||
          error?.message ||
          "Something went wrong in list Notification API",
      );
    }
  },
);

export const retrieveNotificationThunkApi = createAsyncThunk(
  "notification/retrieveNotificationThunkApi",
  async (id, { rejectWithValue }) => {
    try {
      const res = await retrieveNotificationService(id);
      return res.data;
    } catch (error) {
      return rejectWithValue(
        error?.response?.data?.message ||
          error?.response?.data?.error ||
          error?.message ||
          "Something went wrong in retrieve Notification API",
      );
    }
  },
);

export const updateNotificationThunkApi = createAsyncThunk(
  "notification/updateNotificationThunkApi",
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const res = await updateNotificationService(id, data);
      return res.data;
    } catch (error) {
      return rejectWithValue(
        error?.response?.data?.message ||
          error?.response?.data?.error ||
          error?.message ||
          "Something went wrong in update Notification API",
      );
    }
  },
);

export const updateMarkAllReadNotificationThunkApi = createAsyncThunk(
  "notification/updateMarkAllReadNotificationThunkApi",
  async (_, { rejectWithValue }) => {
    try {
      const res = await updateMarkAllReadNotificationService();
      return res.data;
    } catch (error) {
      return rejectWithValue(
        error?.response?.data?.message ||
          error?.response?.data?.error ||
          error?.message ||
          "Something went wrong in Mark All Read API",
      );
    }
  },
);

export const getUnreadCountThunkApi = createAsyncThunk(
  "notification/getUnreadCountThunkApi",
  async (_, { rejectWithValue }) => {
    try {
      const res = await getUnreadCountService();
      return res.data;
    } catch (error) {
      return rejectWithValue(
        error?.response?.data?.message ||
          error?.response?.data?.error ||
          error?.message ||
          "Something went wrong in Unread Count API",
      );
    }
  },
);

const notificationReducer = createSlice({
  name: "notification",

  initialState: {
    status: "",
    totalRecords: 0,
    unreadCount: 0,
    data: [],
  },

  reducers: {},

  extraReducers: (builder) => {
    builder
      .addCase(listNotificationThunkApi.pending, (state) => {
        state.status = "pending";
      })
      .addCase(listNotificationThunkApi.fulfilled, (state, action) => {
        state.status = "fulfilled";

        if (action.payload.results) {
          state.data = action.payload.results;
          state.totalRecords = action.payload.count;
        } else {
          state.data = action.payload.data;
        }

      })
      .addCase(listNotificationThunkApi.rejected, (state) => {
        state.status = "rejected";
      });

    builder
      .addCase(retrieveNotificationThunkApi.pending, (state) => {
        state.status = "pending";
      })
      .addCase(retrieveNotificationThunkApi.fulfilled, (state) => {
        state.status = "fulfilled";
      })
      .addCase(retrieveNotificationThunkApi.rejected, (state) => {
        state.status = "rejected";
      });

    builder
      .addCase(updateNotificationThunkApi.pending, (state) => {
        state.status = "pending";
      })
      .addCase(updateNotificationThunkApi.fulfilled, (state, action) => {
        state.status = "fulfilled";

        const index = state.data.findIndex(
          (notification) => notification.id === action.payload.data.id,
        );

        if (index !== -1) {
          state.data[index] = action.payload.data;
        }

        state.unreadCount = state.data.filter(
          (notification) => !notification.is_read,
        ).length;
      })
      .addCase(updateNotificationThunkApi.rejected, (state) => {
        state.status = "rejected";
      });

    builder
      .addCase(updateMarkAllReadNotificationThunkApi.pending, (state) => {
        state.status = "pending";
      })
      .addCase(updateMarkAllReadNotificationThunkApi.fulfilled, (state) => {
        state.status = "fulfilled";

        state.data = state.data.map((notification) => ({
          ...notification,
          is_read: true,
        }));

        state.unreadCount = 0;
      })
      .addCase(updateMarkAllReadNotificationThunkApi.rejected, (state) => {
        state.status = "rejected";
      });

    builder
      .addCase(getUnreadCountThunkApi.pending, (state) => {
        state.status = "pending";
      })
      .addCase(getUnreadCountThunkApi.fulfilled, (state, action) => {
        state.status = "fulfilled";
        state.unreadCount = action.payload.count;
      })
      .addCase(getUnreadCountThunkApi.rejected, (state) => {
        state.status = "rejected";
      });
  },
});

export default notificationReducer.reducer;