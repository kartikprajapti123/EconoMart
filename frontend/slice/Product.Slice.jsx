import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import {
  listProductService,
  createProductService,
  updateProductService,
  retrieveProductService,
  destroyProductService,
} from "../service/Product.Service";
import { act } from "react";

export const listProductThunkApi = createAsyncThunk(
  "product/listProductThunkApi",
  async (params, { rejectWithValue }) => {
    try {
      const res = await listProductService(params);
      return res.data;
    } catch (error) {
      return rejectWithValue(
        error?.response?.data?.detail ||
          error?.response?.data?.error ||
          error?.message ||
          "something went wrong in Product Get api",
      );
    }
  },
);

export const createProductThunkApi = createAsyncThunk(
  "product/createProductThunkApi",
  async (data, { rejectWithValue }) => {
    try {
      const res = await createProductService(data);
      return res.data;
    } catch (error) {
      return rejectWithValue(
        error?.response?.data?.detail ||
          error?.response?.data?.error ||
          error?.message ||
          "something went wrong in Product create api",
      );
    }
  },
);

export const updateProductThunkApi = createAsyncThunk(
  "product/updateProductThunkApi",
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const res = await updateProductService(id, data);
      return res.data;
    } catch (error) {
      return rejectWithValue(
        error?.response?.data?.detail ||
          error?.response?.data?.error ||
          error?.message ||
          "something went wrong in Product update api",
      );
    }
  },
);

export const retrieveProductThunkApi = createAsyncThunk(
  "product/retrieveProductThunkApi",
  async (id, { rejectWithValue }) => {
    try {
      const res = await retrieveProductService(id);
      return res.data;
    } catch (error) {
      return rejectWithValue(
        error?.response?.data?.detail ||
          error?.response?.data?.error ||
          error?.message ||
          "something went wrong in Product retrieve api",
      );
    }
  },
);

export const destroyProductThunkApi = createAsyncThunk(
  "product/destroyProductThunkApi",
  async (id, { rejectWithValue }) => {
    try {
      const res = await destroyProductService(id);
      return res.data;
    } catch (error) {
      return rejectWithValue(
        error?.response?.data?.detail ||
          error?.response?.data?.error ||
          error?.message ||
          "something wentwrong in Product destroy api",
      );
    }
  },
);

const productReducer = createSlice({
  name: "product",
  initialState: {
    status: "",
    product_data: [],
    product_details:[],
    totalRecords: 0,
    wishlistDrawerOpen: false,
  },
  reducers: {
    openWishlistDrawer: (state) => {
    console.log("openwishlist called ",)

    state.wishlistDrawerOpen = true;
  },
  closeWishlistDrawer: (state) => {
    state.wishlistDrawerOpen = false;
  },
  setWishlistDrawerOpen: (state, action) => {
    console.log("setwishlist called ",action.payload)
    state.wishlistDrawerOpen = Boolean(action.payload);
  },
  },
  extraReducers: (builder) => {
    builder
      .addCase(listProductThunkApi.pending, (state) => {
        state.status = "pending";
      })
      .addCase(listProductThunkApi.fulfilled, (state, action) => {
        state.status = "fulfilled";
        if (action.payload.results) {
          state.product_data = action.payload.results;
        } else {
          state.product_data = action.payload.data;
        }
        state.totalRecords = action.payload.count;
      })
      .addCase(listProductThunkApi.rejected, (state, action) => {
        state.status = "rejected";
      });

    builder
      .addCase(createProductThunkApi.pending, (state) => {
        state.status = "pending";
      })
      .addCase(createProductThunkApi.fulfilled, (state, action) => {
        state.status = "fulfilled";
        state.product_data.push(action.payload.data);
      })
      .addCase(createProductThunkApi.rejected, (state, action) => {
        state.status = "rejected";
      });

    builder
      .addCase(retrieveProductThunkApi.pending, (state) => {
        state.status = "pending";
      })
      .addCase(retrieveProductThunkApi.fulfilled, (state, action) => {
        state.status = "fulfilled";
        state.product_details=action.payload.data
      })
      .addCase(retrieveProductThunkApi.rejected, (state, action) => {
        state.status = "rejected";
      });

    builder
      .addCase(updateProductThunkApi.pending, (state) => {
        state.status = "pending";
      })
      .addCase(updateProductThunkApi.fulfilled, (state, action) => {
        state.status = "fulfilled";
        const index = state.product_data.findIndex((single_data) => {
          return single_data.id === action.payload.data.id;
        });
        if (index !== -1) {
          state.product_data[index] = action.payload.data;
        }
      })
      .addCase(updateProductThunkApi.rejected, (state, action) => {
        state.status = "rejected";
      });

    builder
      .addCase(destroyProductThunkApi.pending, (state) => {
        state.status = "pending";
      })
      .addCase(destroyProductThunkApi.fulfilled, (state, action) => {
        state.status = "fulfilled";
        state.product_data = state.product_data.filter((single_data) => {
          return single_data.id !== action.payload.id;
        });
      })
      .addCase(destroyProductThunkApi.rejected, (state, action) => {
        state.status = "rejected";
      });
  },
});

export default productReducer.reducer;
export const {
  openWishlistDrawer,
  closeWishlistDrawer,
  setWishlistDrawerOpen,
} = productReducer.actions;