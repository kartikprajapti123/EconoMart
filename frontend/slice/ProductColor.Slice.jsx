import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import {
  listProductColorService,
  createProductColorService,
  updateProductColorService,
  retrieveProductColorService,
  destroyProductColorService,
} from "../service/ProductColor.Service";

export const listProductColorThunkApi = createAsyncThunk(
  "productColor/listProductColorThunkApi",
  async (params , { rejectWithValue }) => {
    try {
      const res = await listProductColorService(params);
      return res.data;
    } catch (error) {
      return rejectWithValue(
        error?.response?.data?.detail ||
          error?.response?.data?.error ||
          error?.message ||
          "something went wrong in productColor Get api",
      );
    }
  },
);

export const createProductColorThunkApi = createAsyncThunk(
  "productColor/createProductColorThunkApi",
  async (data, { rejectWithValue }) => {
    try {
      const res = await createProductColorService(data);
      return res.data;
    } catch (error) {
      return rejectWithValue(
        error?.response?.data?.detail ||
          error?.response?.data?.error ||
          error?.message ||
          "something went wrong in productColor create api",
      );
    }
  },
);

export const updateProductColorThunkApi = createAsyncThunk(
  "productColor/updateProductColorThunkApi",
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const res = await updateProductColorService(id, data);
      return res.data;
    } catch (error) {
      return rejectWithValue(
        error?.response?.data?.detail ||
          error?.response?.data?.error ||
          error?.message ||
          "something went wrong in productColor update api",
      );
    }
  },
);

export const retrieveProductColorThunkApi = createAsyncThunk(
  "productColor/retrieveProductColorThunkApi",
  async (id, { rejectWithValue }) => {
    try {
      const res = await retrieveProductColorService(id);
      return res.data;
    } catch (error) {
      return rejectWithValue(
        error?.response?.data?.detail ||
          error?.response?.data?.error ||
          error?.message ||
          "something went wrong in productColor retrieve api",
      );
    }
  },
);

export const destroyProductColorThunkApi = createAsyncThunk(
  "productColor/destroyProductColorThunkApi",
  async (id, { rejectWithValue }) => {
    try {
      const res = await destroyProductColorService(id);
      return res.data;
    } catch (error) {
      return rejectWithValue(
        error?.response?.data?.detail ||
          error?.response?.data?.error ||
          error?.message ||
          "something wentwrong in productColor destroy api",
      );
    }
  },
);

const productColorReducer = createSlice({
  name: "productColor",
  initialState: {
    status: "",
    product_color_data: [],
    totalRecords: 0,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(listProductColorThunkApi.pending, (state) => {
        state.status = "pending";
      })
      .addCase(listProductColorThunkApi.fulfilled, (state, action) => {
        state.status = "fulfilled";
        if (action.payload.results) {
          state.product_color_data = action.payload.results;
          state.totalRecords = action.payload.count;
        } else {
          state.product_color_data = action.payload.data;
        }
      })
      .addCase(listProductColorThunkApi.rejected, (state, action) => {
        state.status = "rejected";
      });

    builder
      .addCase(createProductColorThunkApi.pending, (state) => {
        state.status = "pending";
      })
      .addCase(createProductColorThunkApi.fulfilled, (state, action) => {
        state.status = "fulfilled";
        state.product_color_data.push(action.payload.data);
            state.totalRecords=action.payload.count

      })
      .addCase(createProductColorThunkApi.rejected, (state, action) => {
        state.status = "rejected";
      });

    builder
      .addCase(retrieveProductColorThunkApi.pending, (state) => {
        state.status = "pending";
      })
      .addCase(retrieveProductColorThunkApi.fulfilled, (state, action) => {
        state.status = "fulfilled";
      })
      .addCase(retrieveProductColorThunkApi.rejected, (state, action) => {
        state.status = "rejected";
      });

    builder
      .addCase(updateProductColorThunkApi.pending, (state) => {
        state.status = "pending";
      })
      .addCase(updateProductColorThunkApi.fulfilled, (state, action) => {
        state.status = "fulfilled";
        const index = state.product_color_data.findIndex((single_data) => {
          return single_data.id === action.payload.data.id;
        });
        if (index !== -1) {
          state.product_color_data[index] = action.payload.data;
        }
      })
      .addCase(updateProductColorThunkApi.rejected, (state, action) => {
        state.status = "rejected";
      });

    builder
      .addCase(destroyProductColorThunkApi.pending, (state) => {
        state.status = "pending";
      })
      .addCase(destroyProductColorThunkApi.fulfilled, (state, action) => {
        state.status = "fulfilled";
        state.product_color_data = state.product_color_data.filter(
          (single_data) => {
            return single_data.id !== action.payload.id;
          },
        );
      })
      .addCase(destroyProductColorThunkApi.rejected, (state, action) => {
        state.status = "rejected";
      });
  },
});

export default productColorReducer.reducer;
