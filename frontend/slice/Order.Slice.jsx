import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

import {
  listOrderService,
  createOrderService,
  updateOrderService,
  retrieveOrderService,
  destroyOrderService,
} from "../service/Order.Service";
import { verifyPaymentOrderService } from "../service/Order.Service";

export const listOrderThunkApi = createAsyncThunk(
  "order/listOrderThunkApi",
  async (params, { rejectWithValue }) => {
    try {
      const res = await listOrderService(params);
      return res.data;
    } catch (error) {
      return rejectWithValue(
        error?.response?.data?.message ||
          error?.response?.data?.error ||
          error?.message ||
          "Something went wrong in list order API"
      );
    }
  }
);

export const createOrderThunkApi = createAsyncThunk(
  "order/createOrderThunkApi",
  async (data, { rejectWithValue }) => {
    try {
      const res = await createOrderService(data);
      return res.data;
    } catch (error) {
      return rejectWithValue(
        error?.response?.data?.message ||
          error?.response?.data?.error ||
          error?.message ||
          "Something went wrong in create order API"
      );
    }
  }
);

export const updateOrderThunkApi = createAsyncThunk(
  "order/updateOrderThunkApi",
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const res = await updateOrderService(id, data);
      return res.data;
    } catch (error) {
      return rejectWithValue(
        error?.response?.data?.message ||
          error?.response?.data?.error ||
          error?.message ||
          "Something went wrong in update order API"
      );
    }
  }
);

export const retrieveOrderThunkApi = createAsyncThunk(
  "order/retrieveOrderThunkApi",
  async (id , { rejectWithValue }) => {
    try {
      const res = await retrieveOrderService(id);
      return res.data;
    } catch (error) {
      return rejectWithValue(
        error?.response?.data?.message ||
          error?.response?.data?.error ||
          error?.message ||
          "Something went wrong in retrieve order API"
      );
    }
  }
);

export const destroyOrderThunkApi = createAsyncThunk(
  "order/destroyOrderThunkApi",
  async ({ id }, { rejectWithValue }) => {
    try {
      const res = await destroyOrderService(id);
      return res.data;
    } catch (error) {
      return rejectWithValue(
        error?.response?.data?.message ||
          error?.response?.data?.error ||
          error?.message ||
          "Something went wrong in destroy order API"
      );
    }
  }
);


export const verifyPaymentOrderThunkApi = createAsyncThunk(
  "order/verifyPaymentOrderThunkApi",
  async (data , { rejectWithValue }) => {
    try {
      const res = await verifyPaymentOrderService(data);
      return res.data;
    } catch (error) {
      return rejectWithValue(
        error?.response?.data?.message ||
          error?.response?.data?.error ||
          error?.message ||
          "Something went wrong in verify payment order API"
      );
    }
  }
);

const orderReducer = createSlice({
  name: "order",
  initialState: {
    data: [],
    totalRecords: null,
    status: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(listOrderThunkApi.pending, (state) => {
        state.status = "pending";
      })
      .addCase(listOrderThunkApi.fulfilled, (state, action) => {
        state.status = "fulfilled";
        state.data = action.payload.results;
        state.totalRecords=action.payload.count
      })
      .addCase(listOrderThunkApi.rejected, (state) => {
        state.status = "rejected";
      });

    builder
      .addCase(createOrderThunkApi.pending, (state) => {
        state.status = "pending";
      })
      .addCase(createOrderThunkApi.fulfilled, (state, action) => {
        state.status = "fulfilled";
        state.data.unshift(action.payload.data);
      })
      .addCase(createOrderThunkApi.rejected, (state) => {
        state.status = "rejected";
      });

    builder
      .addCase(updateOrderThunkApi.pending, (state) => {
        state.status = "pending";
      })
      .addCase(updateOrderThunkApi.fulfilled, (state, action) => {
        state.status = "fulfilled";

        const index = state.data.findIndex(
          (single_data) => single_data.id === action.payload.data.id
        );

        if (index !== -1) {
          state.data[index] = action.payload.data;
        }
      })
      .addCase(updateOrderThunkApi.rejected, (state) => {
        state.status = "rejected";
      });

    builder
      .addCase(retrieveOrderThunkApi.pending, (state) => {
        state.status = "pending";
      })
      .addCase(retrieveOrderThunkApi.fulfilled, (state) => {
        state.status = "fulfilled";
      })
      .addCase(retrieveOrderThunkApi.rejected, (state) => {
        state.status = "rejected";
      });

    builder
      .addCase(verifyPaymentOrderThunkApi.pending, (state) => {
        state.status = "pending";
      })
      .addCase(verifyPaymentOrderThunkApi.fulfilled, (state) => {
        state.status = "fulfilled";
      })
      .addCase(verifyPaymentOrderThunkApi.rejected, (state) => {
        state.status = "rejected";
      });

    builder
      .addCase(destroyOrderThunkApi.pending, (state) => {
        state.status = "pending";
      })
      .addCase(destroyOrderThunkApi.fulfilled, (state, action) => {
        state.status = "fulfilled";

        state.data = state.data.filter(
          (single_data) => single_data.id !== action.payload.id
        );
      })
      .addCase(destroyOrderThunkApi.rejected, (state) => {
        state.status = "rejected";
      });
  },
});

export default orderReducer.reducer;