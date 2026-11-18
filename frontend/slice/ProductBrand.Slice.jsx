import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import {
  listProductBrandService,
  createProductBrandService,
  updateProductBrandService,
  retrieveProductBrandService,
  destroyProductBrandService,
} from "../service/ProductBrand.Service.jsx";

export const listProductBrandThunkApi = createAsyncThunk(
  "productBrand/listProductBrandThunkApi",
  async (params, { rejectWithValue }) => {
    try {
      const res = await listProductBrandService(params);
      return res.data;
    } catch (error) {
      return rejectWithValue(
        error?.response?.data?.detail ||
          error?.response?.data?.error ||
          error?.message ||
          "something went wrong in productBrand Get api",
      );
    }
  },
);

export const createProductBrandThunkApi = createAsyncThunk(
  "productBrand/createProductBrandThunkApi",
  async (data, { rejectWithValue }) => {
    try {
      const res = await createProductBrandService(data);
      return res.data;
    } catch (error) {
      return rejectWithValue(
        error?.response?.data?.detail ||
          error?.response?.data?.error ||
          error?.message ||
          "something went wrong in productBrand create api",
      );
    }
  },
);

export const updateProductBrandThunkApi = createAsyncThunk(
  "productBrand/updateProductBrandThunkApi",
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const res = await updateProductBrandService(id, data);
      return res.data;
    } catch (error) {
      return rejectWithValue(
        error?.response?.data?.detail ||
          error?.response?.data?.error ||
          error?.message ||
          "something went wrong in productBrand update api",
      );
    }
  },
);

export const retrieveProductBrandThunkApi = createAsyncThunk(
  "productBrand/retrieveProductBrandThunkApi",
  async (id, { rejectWithValue }) => {
    try {
      const res = await retrieveProductBrandService(id);
      return res.data;
    } catch (error) {
      return rejectWithValue(
        error?.response?.data?.detail ||
          error?.response?.data?.error ||
          error?.message ||
          "something went wrong in productBrand retrieve api",
      );
    }
  },
);

export const destroyProductBrandThunkApi = createAsyncThunk(
  "productBrand/destroyProductBrandThunkApi",
  async (id, { rejectWithValue }) => {
    try {
      const res = await destroyProductBrandService(id);
      return res.data;
    } catch (error) {
      return rejectWithValue(
        error?.response?.data?.detail ||
          error?.response?.data?.error ||
          error?.message ||
          "something wentwrong in productBrand destroy api",
      );
    }
  },
);

const productBrandReducer = createSlice({
  name: "productBrand",
  initialState: {
    status: "",
    product_brand_data: [],
    totalRecords: 0,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(listProductBrandThunkApi.pending, (state) => {
        state.status = "pending";
      })
      .addCase(listProductBrandThunkApi.fulfilled, (state, action) => {
        state.status = "fulfilled";
        if (action.payload.results) {
          state.product_brand_data = action.payload.results;
          state.totalRecords = action.payload.count;
        } else {
          state.product_brand_data = action.payload.data;
        }
      })
      .addCase(listProductBrandThunkApi.rejected, (state, action) => {
        state.status = "rejected";
      });

    builder
      .addCase(createProductBrandThunkApi.pending, (state) => {
        state.status = "pending";
      })
      .addCase(createProductBrandThunkApi.fulfilled, (state, action) => {
        state.status = "fulfilled";
        state.product_brand_data.push(action.payload.data);
        state.totalRecords = action.payload.count;
      })
      .addCase(createProductBrandThunkApi.rejected, (state, action) => {
        state.status = "rejected";
      });

    builder
      .addCase(retrieveProductBrandThunkApi.pending, (state) => {
        state.status = "pending";
      })
      .addCase(retrieveProductBrandThunkApi.fulfilled, (state, action) => {
        state.status = "fulfilled";
      })
      .addCase(retrieveProductBrandThunkApi.rejected, (state, action) => {
        state.status = "rejected";
      });

    builder
      .addCase(updateProductBrandThunkApi.pending, (state) => {
        state.status = "pending";
      })
      .addCase(updateProductBrandThunkApi.fulfilled, (state, action) => {
        state.status = "fulfilled";
        const index = state.product_brand_data.findIndex((single_data) => {
          return single_data.id === action.payload.data.id;
        });
        if (index !== -1) {
          state.product_brand_data[index] = action.payload.data;
        }
      })
      .addCase(updateProductBrandThunkApi.rejected, (state, action) => {
        state.status = "rejected";
      });

    builder
      .addCase(destroyProductBrandThunkApi.pending, (state) => {
        state.status = "pending";
      })
      .addCase(destroyProductBrandThunkApi.fulfilled, (state, action) => {
        state.status = "fulfilled";
        state.product_brand_data = state.product_brand_data.filter(
          (single_data) => {
            return single_data.id !== action.payload.id;
          },
        );
      })
      .addCase(destroyProductBrandThunkApi.rejected, (state, action) => {
        state.status = "rejected";
      });
  },
});

export default productBrandReducer.reducer;
