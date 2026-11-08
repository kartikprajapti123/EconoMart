import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import {
  listProductSizeService,
  createProductSizeService,
  updateProductSizeService,
  retrieveProductSizeService,
  destroyProductSizeService,
} from "../service/ProductSize.Service";

export const listProductSizeThunkApi = createAsyncThunk(
  "productSize/listProductSizeThunkApi",
  async (params , { rejectWithValue }) => {
    try {
      const res = await listProductSizeService(params);
      return res.data;
    } catch (error) {
      return rejectWithValue(
        error?.response?.data?.detail ||
          error?.response?.data?.error ||
          error?.message ||
          "something went wrong in productSize Get api",
      );
    }
  },
);

export const createProductSizeThunkApi = createAsyncThunk(
  "productSize/createProductSizeThunkApi",
  async (data, { rejectWithValue }) => {
    try {
      const res = await createProductSizeService(data);
      return res.data;
    } catch (error) {
      return rejectWithValue(
        error?.response?.data?.detail ||
          error?.response?.data?.error ||
          error?.message ||
          "something went wrong in productSize create api",
      );
    }
  },
);

export const updateProductSizeThunkApi = createAsyncThunk(
  "productSize/updateProductSizeThunkApi",
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const res = await updateProductSizeService(id, data);
      return res.data;
    } catch (error) {
      return rejectWithValue(
        error?.response?.data?.detail ||
          error?.response?.data?.error ||
          error?.message ||
          "something went wrong in productSize update api",
      );
    }
  },
);

export const retrieveProductSizeThunkApi = createAsyncThunk(
  "productSize/retrieveProductSizeThunkApi",
  async (id, { rejectWithValue }) => {
    try {
      const res = await retrieveProductSizeService(id);
      return res.data;
    } catch (error) {
      return rejectWithValue(
        error?.response?.data?.detail ||
          error?.response?.data?.error ||
          error?.message ||
          "something went wrong in productSize retrieve api",
      );
    }
  },
);

export const destroyProductSizeThunkApi = createAsyncThunk(
  "productSize/destroyProductSizeThunkApi",
  async (id, { rejectWithValue }) => {
    try {
      const res = await destroyProductSizeService(id);
      return res.data;
    } catch (error) {
      return rejectWithValue(
        error?.response?.data?.detail ||
          error?.response?.data?.error ||
          error?.message ||
          "something wentwrong in productSize destroy api",
      );
    }
  },
);

const productSizeReducer = createSlice({
  name: "productSize",
  initialState: {
    status: "",
    product_size_data: [],
    totalRecords: 0,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(listProductSizeThunkApi.pending, (state) => {
        state.status = "pending";
      })
      .addCase(listProductSizeThunkApi.fulfilled, (state, action) => {
        state.status = "fulfilled";
        if (action.payload.results) {
          state.product_size_data = action.payload.results;
          state.totalRecords = action.payload.count;
        } else {
          state.product_size_data = action.payload.data;
        }
      })
      .addCase(listProductSizeThunkApi.rejected, (state, action) => {
        state.status = "rejected";
      });

    builder
      .addCase(createProductSizeThunkApi.pending, (state) => {
        state.status = "pending";
      })
      .addCase(createProductSizeThunkApi.fulfilled, (state, action) => {
        state.status = "fulfilled";
        state.product_size_data.push(action.payload.data);
      })
      .addCase(createProductSizeThunkApi.rejected, (state, action) => {
        state.status = "rejected";
      });

    builder
      .addCase(retrieveProductSizeThunkApi.pending, (state) => {
        state.status = "pending";
      })
      .addCase(retrieveProductSizeThunkApi.fulfilled, (state, action) => {
        state.status = "fulfilled";
      })
      .addCase(retrieveProductSizeThunkApi.rejected, (state, action) => {
        state.status = "rejected";
      });

    builder
      .addCase(updateProductSizeThunkApi.pending, (state) => {
        state.status = "pending";
      })
      .addCase(updateProductSizeThunkApi.fulfilled, (state, action) => {
        state.status = "fulfilled";
        const index = state.product_size_data.findIndex((single_data) => {
          return single_data.id === action.payload.data.id;
        });
        if (index !== -1) {
          state.product_size_data[index] = action.payload.data;
        }
      })
      .addCase(updateProductSizeThunkApi.rejected, (state, action) => {
        state.status = "rejected";
      });

    builder
      .addCase(destroyProductSizeThunkApi.pending, (state) => {
        state.status = "pending";
      })
      .addCase(destroyProductSizeThunkApi.fulfilled, (state, action) => {
        state.status = "fulfilled";
        state.product_size_data = state.product_size_data.filter(
          (single_data) => {
            return single_data.id !== action.payload.id;
          },
        );
      })
      .addCase(destroyProductSizeThunkApi.rejected, (state, action) => {
        state.status = "rejected";
      });
  },
});

export default productSizeReducer.reducer;
