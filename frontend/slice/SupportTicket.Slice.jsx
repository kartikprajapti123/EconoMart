import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import {
  listSupportTicketService,
  updateSupportTicketService,
  retrieveSupportTicketService,
  createSupportTicketService,
  destroySupportTicketService,
  listSupportTicketMessagesService,
  createSupportTicketMessagesService,
  updateSupportTicketMessagesService,
  destroySupportTicketMessagesService,
  retrieveSupportTicketMessagesService,
} from "../service/SupportTicket.Service";
import { act } from "react";

export const listSupportTicketThunkApi = createAsyncThunk(
  "supportTicket/listSupportTicketThunkApi",
  async (params, { rejectWithValue }) => {
    try {
      const res = await listSupportTicketService(params);
      return res.data;
    } catch (error) {
      return rejectWithValue(
        error?.response?.data?.detail ||
          error?.response?.data?.error ||
          error?.message ||
          "something went wrong in SupportTicket Get api",
      );
    }
  },
);

export const createSupportTicketThunkApi = createAsyncThunk(
  "supportTicket/createSupportTicketThunkApi",
  async (data, { rejectWithValue }) => {
    try {
      const res = await createSupportTicketService(data);
      return res.data;
    } catch (error) {
      return rejectWithValue(
        error?.response?.data?.detail ||
          error?.response?.data?.error ||
          error?.message ||
          "something went wrong in SupportTicket create api",
      );
    }
  },
);

export const updateSupportTicketThunkApi = createAsyncThunk(
  "supportTicket/updateSupportTicketThunkApi",
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const res = await updateSupportTicketService(id, data);
      return res.data;
    } catch (error) {
      return rejectWithValue(
        error?.response?.data?.detail ||
          error?.response?.data?.error ||
          error?.message ||
          "something went wrong in SupportTicket Update api",
      );
    }
  },
);

export const retrieveSupportTicketThunkApi = createAsyncThunk(
  "supportTicket/retrieveSupportTicketThunkApi",
  async (id, { rejectWithValue }) => {
    try {
      const res = await retrieveSupportTicketService(id);
      return res.data;
    } catch (error) {
      return rejectWithValue(
        error?.response?.data?.detail ||
          error?.response?.data?.error ||
          error?.message ||
          "something went wrong in SupportTicket retrieve api",
      );
    }
  },
);

export const destroySupportTicketThunkApi = createAsyncThunk(
  "supportTicket/destroySupportTicketThunkApi",
  async (id, { rejectWithValue }) => {
    try {
      const res = await destroySupportTicketService(id);
      return res.data;
    } catch (error) {
      return rejectWithValue(
        error?.response?.data?.detail ||
          error?.response?.data?.error ||
          error?.message ||
          "something went wrong in SupportTicket destroy api",
      );
    }
  },
);

export const listSupportTicketMessagesThunkApi = createAsyncThunk(
  "supportTicketMessages/listSupportTicketMessagesThunkApi",
  async (params, { rejectWithValue }) => {
    try {
      const res = await listSupportTicketMessagesService(params);
      return res.data;
    } catch (error) {
      return rejectWithValue(
        error?.response?.data?.detail ||
          error?.response?.data?.error ||
          error?.message ||
          "something went wrong in SupportTicketMessages Get api",
      );
    }
  },
);

export const createSupportTicketMessagesThunkApi = createAsyncThunk(
  "supportTicketMessages/createSupportTicketMessagesThunkApi",
  async (data, { rejectWithValue }) => {
    try {
      const res = await createSupportTicketMessagesService(data);
      return res.data;
    } catch (error) {
      return rejectWithValue(
        error?.response?.data?.detail ||
          error?.response?.data?.error ||
          error?.message ||
          "something went wrong in SupportTicketMessages create api",
      );
    }
  },
);

export const updateSupportTicketMessagesThunkApi = createAsyncThunk(
  "supportTicketMessages/updateSupportTicketMessagesThunkApi",
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const res = await updateSupportTicketMessagesService(id, data);
      return res.data;
    } catch (error) {
      return rejectWithValue(
        error?.response?.data?.detail ||
          error?.response?.data?.error ||
          error?.message ||
          "something went wrong in SupportTicketMessages Update api",
      );
    }
  },
);

export const retrieveSupportTicketMessagesThunkApi = createAsyncThunk(
  "supportTicketMessages/retrieveSupportTicketMessagesThunkApi",
  async (id, { rejectWithValue }) => {
    try {
      const res = await retrieveSupportTicketMessagesService(id);
      return res.data;
    } catch (error) {
      return rejectWithValue(
        error?.response?.data?.detail ||
          error?.response?.data?.error ||
          error?.message ||
          "something went wrong in SupportTicketMessages retrieve api",
      );
    }
  },
);

export const destroySupportTicketMessagesThunkApi = createAsyncThunk(
  "supportTicketMessages/destroySupportTicketMessagesThunkApi",
  async (id, { rejectWithValue }) => {
    try {
      const res = await destroySupportTicketMessagesService(id);
      return res.data;
    } catch (error) {
      return rejectWithValue(
        error?.response?.data?.detail ||
          error?.response?.data?.error ||
          error?.message ||
          "something went wrong in SupportTicketMessages destroy api",
      );
    }
  },
);

export const supportTicketReducer = createSlice({
  name: "supportTicket",
  initialState: {
    status: "",
    data: [],
    totalRecords: 0,
    single_data: {},
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(listSupportTicketThunkApi.pending, (state) => {
        state.status = "pending";
      })
      .addCase(listSupportTicketThunkApi.fulfilled, (state, action) => {
        state.status = "fulfilled";
        if (action.payload.results) {
          state.data = action.payload.results;
          state.totalRecords = action.payload.count;
        } else {
          state.data = action.payload.data;
        }
      })
      .addCase(listSupportTicketThunkApi.rejected, (state, action) => {
        state.status = "rejected";
      });

    builder
      .addCase(retrieveSupportTicketThunkApi.pending, (state) => {
        state.status = "pending";
      })
      .addCase(retrieveSupportTicketThunkApi.fulfilled, (state, action) => {
        state.status = "fulfilled";

        state.single_data = action.payload.data;
      })
      .addCase(retrieveSupportTicketThunkApi.rejected, (state, action) => {
        state.status = "rejected";
      });

    builder
      .addCase(destroySupportTicketThunkApi.pending, (state) => {
        state.status = "pending";
      })
      .addCase(destroySupportTicketThunkApi.fulfilled, (state, action) => {
        state.status = "fulfilled";
        state.data = state.data.filter(
          (single_data) => single_data.id !== action.payload.id,
        );
        state.totalRecords = state.totalRecords - 1;
      })
      .addCase(destroySupportTicketThunkApi.rejected, (state, action) => {
        state.status = "rejected";
      });

    builder
      .addCase(createSupportTicketThunkApi.pending, (state) => {
        state.status = "pending";
      })
      .addCase(createSupportTicketThunkApi.fulfilled, (state, action) => {
        state.status = "fulfilled";
        state.data.unshift(action.payload.data);
        state.totalRecords = state.totalRecords + 1;
      })
      .addCase(createSupportTicketThunkApi.rejected, (state, action) => {
        state.status = "rejected";
      });

    builder
      .addCase(updateSupportTicketThunkApi.pending, (state) => {
        state.status = "pending";
      })
      .addCase(updateSupportTicketThunkApi.fulfilled, (state, action) => {
        state.status = "fulfilled";
        const index = state.data.findIndex((single_data) => {
          return single_data.id === action.payload.data.id;
        });
        if (index !== -1) {
          state.data[index] = action.payload.data;
        }
      })
      .addCase(updateSupportTicketThunkApi.rejected, (state, action) => {
        state.status = "rejected";
      });
  },
});

export const supportTicketMessagesReducer = createSlice({
  name: "supportTicketMessages",
  initialState: {
    status: "",
    data: [],
    totalRecords: 0,
    single_data: {},
    // typingUser:null
    typingUsers: [],
  },
  reducers: {
    addMessage: (state, action) => {
      state.data.push(action.payload);
    },
    typingStart: (state, action) => {
      const username = action.payload;

      if (!state.typingUsers.includes(username)) {
        state.typingUsers.push(username);
      }
    },

    typingEnd: (state, action) => {
      const username = action.payload;

      state.typingUsers = state.typingUsers.filter((user) => user !== username);
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(listSupportTicketMessagesThunkApi.pending, (state) => {
        state.status = "pending";
      })
      .addCase(listSupportTicketMessagesThunkApi.fulfilled, (state, action) => {
        state.status = "fulfilled";
        if (action.payload.results) {
          state.data = action.payload.results;
          state.totalRecords = action.payload.count;
        } else {
          state.data = action.payload.data;
        }
      })
      .addCase(listSupportTicketMessagesThunkApi.rejected, (state, action) => {
        state.status = "rejected";
      });

    builder
      .addCase(retrieveSupportTicketMessagesThunkApi.pending, (state) => {
        state.status = "pending";
      })
      .addCase(
        retrieveSupportTicketMessagesThunkApi.fulfilled,
        (state, action) => {
          state.status = "fulfilled";
          state.single_data = action.payload.data;
        },
      )
      .addCase(
        retrieveSupportTicketMessagesThunkApi.rejected,
        (state, action) => {
          state.status = "rejected";
        },
      );

    builder
      .addCase(destroySupportTicketMessagesThunkApi.pending, (state) => {
        state.status = "pending";
      })
      .addCase(
        destroySupportTicketMessagesThunkApi.fulfilled,
        (state, action) => {
          state.status = "fulfilled";
          state.data = state.data.filter(
            (single_data) => single_data.id !== action.payload.id,
          );
          state.totalRecords = state.totalRecords - 1;
        },
      )
      .addCase(
        destroySupportTicketMessagesThunkApi.rejected,
        (state, action) => {
          state.status = "rejected";
        },
      );

    builder
      .addCase(createSupportTicketMessagesThunkApi.pending, (state) => {
        state.status = "pending";
      })
      .addCase(
        createSupportTicketMessagesThunkApi.fulfilled,
        (state, action) => {
          state.status = "fulfilled";
          state.totalRecords = state.totalRecords + 1;
        },
      )
      .addCase(
        createSupportTicketMessagesThunkApi.rejected,
        (state, action) => {
          state.status = "rejected";
        },
      );

    builder
      .addCase(updateSupportTicketMessagesThunkApi.pending, (state) => {
        state.status = "pending";
      })
      .addCase(
        updateSupportTicketMessagesThunkApi.fulfilled,
        (state, action) => {
          state.status = "fulfilled";
          const index = state.data.findIndex((single_data) => {
            return single_data.id === action.payload.data.id;
          });
          if (index !== -1) {
            state.data[index] = action.payload.data;
          }
        },
      )
      .addCase(
        updateSupportTicketMessagesThunkApi.rejected,
        (state, action) => {
          state.status = "rejected";
        },
      );
  },
});

export const { addMessage, typingEnd, typingStart } =
  supportTicketMessagesReducer.actions;
