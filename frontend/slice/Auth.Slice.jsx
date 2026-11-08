import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

import {
  createLoginService,
  createRegisterService,
  createChangePasswordService,
  createForgotPasswordService,
  createOtpVerifyService,
  createResetPasswordService,
  createLogoutService,
} from "../service/Auth.Service";

export const createLoginThunkApi = createAsyncThunk(
  "auth/createLoginThunkApi",
  async (data, { rejectWithValue }) => {
    try {
      const res = await createLoginService(data);
      return res.data;
    } catch (error) {
      return rejectWithValue(
        error?.response?.data?.message ||
          error?.response?.data?.error ||
          error?.message ||
          "Something went wrong in Login API",
      );
    }
  },
);

export const createRegisterThunkApi = createAsyncThunk(
  "auth/createRegisterThunkApi",
  async (data, { rejectWithValue }) => {
    try {
      const res = await createRegisterService(data);
      return res.data;
    } catch (error) {
      return rejectWithValue(
        error?.response?.data?.message ||
          error?.response?.data?.error ||
          error?.message ||
          "Something went wrong in Register API",
      );
    }
  },
);

export const createOtpVerifyThunkApi = createAsyncThunk(
  "auth/createOtpVerifyThunkApi",
  async (data, { rejectWithValue }) => {
    try {
      const res = await createOtpVerifyService(data);
      return res.data;
    } catch (error) {
      return rejectWithValue(
        error?.response?.data?.message ||
          error?.response?.data?.error ||
          error?.message ||
          "Something went wrong in OtpVerify API",
      );
    }
  },
);

export const createForgotPasswordThunkApi = createAsyncThunk(
  "auth/createForgotPasswordThunkApi",
  async (data, { rejectWithValue }) => {
    try {
      const res = await createForgotPasswordService(data);
      return res.data;
    } catch (error) {
      return rejectWithValue(
        error?.response?.data?.message ||
          error?.response?.data?.error ||
          error?.message ||
          "Something went wrong in ForgotPassword API",
      );
    }
  },
);

export const createChangePasswordThunkApi = createAsyncThunk(
  "auth/createChangePasswordThunkApi",
  async (data, { rejectWithValue }) => {
    try {
      const res = await createChangePasswordService(data);
      return res.data;
    } catch (error) {
      return rejectWithValue(
        error?.response?.data?.message ||
          error?.response?.data?.error ||
          error?.message ||
          "Something went wrong in ChangePassword API",
      );
    }
  },
);

export const createResetPasswordThunkApi = createAsyncThunk(
  "auth/createResetPasswordThunkApi",
  async (data, { rejectWithValue }) => {
    try {
      const res = await createResetPasswordService(data);
      return res.data;
    } catch (error) {
      return rejectWithValue(
        error?.response?.data?.message ||
          error?.response?.data?.error ||
          error?.message ||
          "Something went wrong in ResetPassword API",
      );
    }
  },
);

export const createLogoutThunkApi = createAsyncThunk(
  "auth/createLogoutThunkApi",
  async (data, { rejectWithValue }) => {
    try {
      const res = await createLogoutService(data);
      return res.data;
    } catch (error) {
      return rejectWithValue(
        error?.response?.data?.message ||
          error?.response?.data?.error ||
          error?.message ||
          "Something went wrong in Logout API",
      );
    }
  },
);

const authReducer = createSlice({
  name: "auth",
  initialState: {
    status: "",
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(createLoginThunkApi.pending, (state) => {
        state.status = "pending";
      })
      .addCase(createLoginThunkApi.fulfilled, (state, action) => {
        state.status = "fulfilled";
      })
      .addCase(createLoginThunkApi.rejected, (state, action) => {
        state.status = "rejected";
      });

    builder
      .addCase(createRegisterThunkApi.pending, (state) => {
        state.status = "pending";
      })
      .addCase(createRegisterThunkApi.fulfilled, (state, action) => {
        state.status = "fulfilled";
      })
      .addCase(createRegisterThunkApi.rejected, (state, action) => {
        state.status = "rejected";
      });

    builder
      .addCase(createOtpVerifyThunkApi.pending, (state) => {
        state.status = "pending";
      })
      .addCase(createOtpVerifyThunkApi.fulfilled, (state, action) => {
        state.status = "fulfilled";
      })
      .addCase(createOtpVerifyThunkApi.rejected, (state, action) => {
        state.status = "rejected";
      });

    builder
      .addCase(createForgotPasswordThunkApi.pending, (state) => {
        state.status = "pending";
      })
      .addCase(createForgotPasswordThunkApi.fulfilled, (state, action) => {
        state.status = "fulfilled";
      })
      .addCase(createForgotPasswordThunkApi.rejected, (state, action) => {
        state.status = "rejected";
      });

    builder
      .addCase(createChangePasswordThunkApi.pending, (state) => {
        state.status = "pending";
      })
      .addCase(createChangePasswordThunkApi.fulfilled, (state, action) => {
        state.status = "fulfilled";
      })
      .addCase(createChangePasswordThunkApi.rejected, (state, action) => {
        state.status = "rejected";
      });

    builder
      .addCase(createResetPasswordThunkApi.pending, (state) => {
        state.status = "pending";
      })
      .addCase(createResetPasswordThunkApi.fulfilled, (state, action) => {
        state.status = "fulfilled";
      })
      .addCase(createResetPasswordThunkApi.rejected, (state, action) => {
        state.status = "rejected";
      });

    builder
      .addCase(createLogoutThunkApi.pending, (state) => {
        state.status = "pending";
      })
      .addCase(createLogoutThunkApi.fulfilled, (state, action) => {
        state.status = "fulfilled";
      })
      .addCase(createLogoutThunkApi.rejected, (state, action) => {
        state.status = "rejected";
      });
  },
});

export default authReducer.reducer;
