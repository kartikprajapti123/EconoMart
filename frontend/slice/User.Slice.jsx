import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import {
  listUserService,
  updateUserService,
  retrieveUserService,
  getSingleUserService,
  createUserService,
  getDashboardSummarySellerService,
  getDashboardSummaryCustomerService,
  getDashboardSummaryAdminService,
  postGoogleAuthenticationService
} from "../service/User.Service";
import { act } from "react";

export const listUserThunkApi = createAsyncThunk(
  "user/listUserThunkApi",
  async (params, { rejectWithValue }) => {
    try {
      const res = await listUserService(params);
      return res.data;
    } catch (error) {
      return rejectWithValue(
        error?.response?.data?.detail ||
          error?.response?.data?.error ||
          error?.message ||
          "something went wrong in user Get api",
      );
    }
  },
);

export const createUserThunkApi = createAsyncThunk(
  "user/createUserThunkApi",
  async (data , { rejectWithValue }) => {
    try {
      const res = await createUserService(data);
      return res.data;
    } catch (error) {
      return rejectWithValue(
        error?.response?.data?.detail ||
          error?.response?.data?.error ||
          error?.message ||
          "something went wrong in user create api",
      );
    }
  },
);



export const updateUserThunkApi = createAsyncThunk(
  "user/updateUserThunkApi",
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const res = await updateUserService(id, data);
      return res.data;
    } catch (error) {
      return rejectWithValue(
        error?.response?.data?.detail ||
          error?.response?.data?.error ||
          error?.message ||
          "something went wrong in user Update api",
      );
    }
  },
);

export const retrieveUserThunkApi = createAsyncThunk(
  "user/retrieveUserThunkApi",
  async (id, { rejectWithValue }) => {
    try {
      const res = await retrieveUserService(id);
      return res.data;
    } catch (error) {
      return rejectWithValue(
        error?.response?.data?.detail ||
          error?.response?.data?.error ||
          error?.message ||
          "something went wrong in User retrieve api",
      );
    }
  },
);

export const getSingleUserThunkApi = createAsyncThunk(
  "user/getSingleUserThunkApi",
  async (id, { rejectWithValue }) => {
    try {
      const res = await getSingleUserService(id);
      return res.data;
    } catch (error) {
      return rejectWithValue(
        error?.response?.data?.detail ||
          error?.response?.data?.error ||
          error?.message ||
          "something went wrong in get single User api",
      );
    }
  },
);

export const getDashboardSummarySellerThunkApi = createAsyncThunk(
  "user/getDashboardSummarySellerThunkApi",
  async (_,{ rejectWithValue }) => {
    console.log("Thunk Started");
    try {
      const res = await getDashboardSummarySellerService();
      return res.data;
    } catch (error) {
      return rejectWithValue(
        error?.response?.data?.detail ||
          error?.response?.data?.error ||
          error?.message ||
          "something went wrong in get DashboardSummarySeller User api",
      );
    }
  },
);

export const getDashboardSummaryCustomerThunkApi = createAsyncThunk(
  "user/getDashboardSummaryCustomerThunkApi",
  async (_, { rejectWithValue }) => {
    console.log("Thunk Started");
    try {
      const res = await getDashboardSummaryCustomerService();
      return res.data;
    } catch (error) {
      return rejectWithValue(
        error?.response?.data?.detail ||
          error?.response?.data?.error ||
          error?.message ||
          "something went wrong in get DashboardSummaryCustomer User api",
      );
    }
  },
);


export const getDashboardSummaryAdminThunkApi = createAsyncThunk(
  "user/getDashboardSummaryAdminThunkApi",
  async (_, { rejectWithValue }) => {
    console.log("Thunk Started");
    try {
      const res = await getDashboardSummaryAdminService();
      return res.data;
    } catch (error) {
      return rejectWithValue(
        error?.response?.data?.detail ||
          error?.response?.data?.error ||
          error?.message ||
          "something went wrong in get DashboardSummaryAdmin User api",
      );
    }
  },
);


export const postGoogleAuthenticationThunkApi = createAsyncThunk(
  "user/postGoogleAuthenticationThunkApi",
  async (data, { rejectWithValue }) => {
    console.log("Thunk Started");
    try {
      const res = await postGoogleAuthenticationService(data);
      return res.data;
    } catch (error) {
      return rejectWithValue(

        error?.message ||
        error?.response?.data?.detail ||
          error?.response?.data?.error ||
          "something went wrong in get GoogleAuthentication User api",
      );
    }
  },
);


const userReducer = createSlice({
  name: "user",
  initialState: {
    status: "",
    user_data: [],
    totalRecords: 0,
    user_detail:[],
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(listUserThunkApi.pending, (state) => {
        state.status = "pending";
      })
      .addCase(listUserThunkApi.fulfilled, (state, action) => {
        state.status = "fulfilled";
        if (action.payload.results) {
          state.user_data = action.payload.results;
        } else {
          state.user_data = action.payload.data;
        }
        state.totalRecords = action.payload.count;
      })
      .addCase(listUserThunkApi.rejected, (state, action) => {
        state.status = "rejected";
      });

    builder
      .addCase(retrieveUserThunkApi.pending, (state) => {
        state.status = "pending";
      })
      .addCase(retrieveUserThunkApi.fulfilled, (state, action) => {
        state.status = "fulfilled";
      })
      .addCase(retrieveUserThunkApi.rejected, (state, action) => {
        state.status = "rejected";
      });

    builder
      .addCase(createUserThunkApi.pending, (state) => {
        state.status = "pending";
      })
      .addCase(createUserThunkApi.fulfilled, (state, action) => {
        state.status = "fulfilled";
        state.user_data.unshift(action.payload.data)
      })
      .addCase(createUserThunkApi.rejected, (state, action) => {
        state.status = "rejected";
      });

    builder
      .addCase(getSingleUserThunkApi.pending, (state) => {
        state.status = "pending";
      })
      .addCase(getSingleUserThunkApi.fulfilled, (state, action) => {
        state.status = "fulfilled";
        state.user_detail=action.payload.data
      })
      .addCase(getSingleUserThunkApi.rejected, (state, action) => {
        state.status = "rejected";
      });


    builder
      .addCase(getDashboardSummaryCustomerThunkApi.pending, (state) => {
        state.status = "pending";
      })
      .addCase(getDashboardSummaryCustomerThunkApi.fulfilled, (state, action) => {
        state.status = "fulfilled";
      })
      .addCase(getDashboardSummaryCustomerThunkApi.rejected, (state, action) => {
        state.status = "rejected";
      });

    builder
      .addCase(getDashboardSummarySellerThunkApi.pending, (state) => {
        state.status = "pending";
      })
      .addCase(getDashboardSummarySellerThunkApi.fulfilled, (state, action) => {
        state.status = "fulfilled";
      })
      .addCase(getDashboardSummarySellerThunkApi.rejected, (state, action) => {
        state.status = "rejected";
      });

    builder
      .addCase(getDashboardSummaryAdminThunkApi.pending, (state) => {
        state.status = "pending";
      })
      .addCase(getDashboardSummaryAdminThunkApi.fulfilled, (state, action) => {
        state.status = "fulfilled";
      })
      .addCase(getDashboardSummaryAdminThunkApi.rejected, (state, action) => {
        state.status = "rejected";
      });

      builder
      .addCase(postGoogleAuthenticationThunkApi.pending, (state) => {
        state.status = "pending";
      })
      .addCase(postGoogleAuthenticationThunkApi.fulfilled, (state, action) => {
        state.status = "fulfilled";
      })
      .addCase(postGoogleAuthenticationThunkApi.rejected, (state, action) => {
        state.status = "rejected";
      });

    builder
      .addCase(updateUserThunkApi.pending, (state) => {
        state.status = "pending";
      })
      .addCase(updateUserThunkApi.fulfilled, (state, action) => {
        state.status = "fulfilled";
        const index = state.user_data.findIndex((single_data) => {
          return single_data.id === action.payload.data.id;
        });
        if (index !== -1) {
          state.user_data[index] = action.payload.data;
        }
      })
      .addCase(updateUserThunkApi.rejected, (state, action) => {
        state.status = "rejected";
      });

  },
});

export default userReducer.reducer;
