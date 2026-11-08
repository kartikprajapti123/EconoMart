import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

import {
  listChatService,
  createChatService,
  retrieveChatService,
  listChatMessageService,
  createChatMessageService,
  markAsReadChatMessageService,
  getUnreadMessageChatService,
} from "../service/Chat.Service";

export const listChatThunkApi = createAsyncThunk(
  "chat/listChatThunkApi",
  async (params, { rejectWithValue }) => {
    try {
      const res = await listChatService(params);
      return res.data;
    } catch (error) {
      return rejectWithValue(
        error?.response?.data?.message ||
          error?.response?.data?.error ||
          error?.message ||
          "Something went wrong in List Chat API",
      );
    }
  },
);

export const createChatThunkApi = createAsyncThunk(
  "chat/createChatThunkApi",
  async (data, { rejectWithValue }) => {
    try {
      const res = await createChatService(data);
      return res.data;
    } catch (error) {
      return rejectWithValue(
        error?.response?.data?.message ||
          error?.response?.data?.error ||
          error?.message ||
          "Something went wrong in Create Chat API",
      );
    }
  },
);

export const retrieveChatThunkApi = createAsyncThunk(
  "chat/retrieveChatThunkApi",
  async (id, { rejectWithValue }) => {
    try {
      const res = await retrieveChatService(id);
      return res.data;
    } catch (error) {
      return rejectWithValue(
        error?.response?.data?.message ||
          error?.response?.data?.error ||
          error?.message ||
          "Something went wrong in Retrieve Chat API",
      );
    }
  },
);


export const getUnreadMessageChatThunkApi = createAsyncThunk(
  "chat/getUnreadMessageChatThunkApi",
  async (id, { rejectWithValue }) => {
    try {
      const res = await getUnreadMessageChatService(id);
      return res.data;
    } catch (error) {
      return rejectWithValue(
        error?.response?.data?.message ||
          error?.response?.data?.error ||
          error?.message ||
          "Something went wrong in Retrieve Chat API",
      );
    }
  },
);

export const listChatMessageThunkApi = createAsyncThunk(
  "chatMessage/listChatMessageThunkApi",
  async (params, { rejectWithValue }) => {
    try {
      const res = await listChatMessageService(params);
      return res.data;
    } catch (error) {
      return rejectWithValue(
        error?.response?.data?.message ||
          error?.response?.data?.error ||
          error?.message ||
          "Something went wrong in List Chat Message API",
      );
    }
  },
);

export const createChatMessageThunkApi = createAsyncThunk(
  "chatMessage/createChatMessageThunkApi",
  async (data, { rejectWithValue }) => {
    try {
      const res = await createChatMessageService(data);
      return res.data;
    } catch (error) {
      return rejectWithValue(
        error?.response?.data?.message ||
          error?.response?.data?.error ||
          error?.message ||
          "Something went wrong in Create Chat Message API",
      );
    }
  },
);

export const markAsReadChatMessageThunkApi = createAsyncThunk(
  "chatMessage/markAsReadChatMessageThunkApi",
  async (data, { rejectWithValue }) => {
    try {
      const res = await markAsReadChatMessageService(data);
      return res.data;
    } catch (error) {
      return rejectWithValue(
        error?.response?.data?.message ||
          error?.response?.data?.error ||
          error?.message ||
          "Something went wrong in Mark As Read API",
      );
    }
  },
);

export const chatReducer = createSlice({
  name: "chat",

  initialState: {
    status: "",
    totalRecords: 0,
    data: [],
    unread_count:null,
    all_unread_count:null,
    singleData: null,
  },

  reducers: {clearUnreadCount(state, action) {
        const chat = state.data.find(
            (c) => c.id === action.payload
        );

        if (chat) {
           state.all_unread_count = Math.max(
                0,
                (state.all_unread_count || 0) - (chat.unread_count || 0)
            );
            chat.unread_count = 0;
        }
    }
    ,
  },

  extraReducers: (builder) => {
    builder
      .addCase(listChatThunkApi.pending, (state) => {
        state.status = "pending";
      })
      .addCase(listChatThunkApi.fulfilled, (state, action) => {
        state.status = "fulfilled";

        if (action.payload.results) {
          state.data = action.payload.results;
        } else {
          state.data = action.payload.data;
        }

        state.totalRecords = action.payload.count;
      })
      .addCase(listChatThunkApi.rejected, (state) => {
        state.status = "rejected";
      });

    builder
      .addCase(createChatThunkApi.pending, (state) => {
        state.status = "pending";
      })
      .addCase(createChatThunkApi.fulfilled, (state, action) => {
        state.status = "fulfilled";
        state.data.unshift(action.payload.data);
      })
      .addCase(createChatThunkApi.rejected, (state) => {
        state.status = "rejected";
      });

    builder
      .addCase(retrieveChatThunkApi.pending, (state) => {
        state.status = "pending";
      })
      .addCase(retrieveChatThunkApi.fulfilled, (state, action) => {
        state.status = "fulfilled";
        state.singleData = action.payload.data;
      })
      .addCase(retrieveChatThunkApi.rejected, (state) => {
        state.status = "rejected";
      });

    builder
      .addCase(getUnreadMessageChatThunkApi.pending, (state) => {
        state.status = "pending";
      })
      .addCase(getUnreadMessageChatThunkApi.fulfilled, (state, action) => {
        state.status = "fulfilled";
        state.all_unread_count = action.payload.data.unread_count
      })
      .addCase(getUnreadMessageChatThunkApi.rejected, (state) => {
        state.status = "rejected";
      });
  },
});
export const chatMessageReducer = createSlice({
  name: "chatMessage",

  initialState: {
    status: "",
    totalRecords: 0,
    data: [],
    typingUsers: [],
    isOnline: false,
  },

  reducers: {
    addChatMessage: (state, action) => {
      state.data.push(action.payload);
    },

    typingStart: (state, action) => {
      const exists = state.typingUsers.find(
        (user) => user.id === action.payload.id
      );

      if (!exists) {
        state.typingUsers.push(action.payload);
      }
    },

    typingEnd: (state, action) => {
      state.typingUsers = state.typingUsers.filter(
        (user) => user.id !== action.payload.id
      );
    },
    updateOnlineStatus: (state, action) => {
    state.isOnline = action.payload.online;
},
  },

  extraReducers: (builder) => {
    builder
      .addCase(listChatMessageThunkApi.pending, (state) => {
        state.status = "pending";
      })
      .addCase(listChatMessageThunkApi.fulfilled, (state, action) => {
        state.status = "fulfilled";

        if (action.payload.results) {
          state.data = action.payload.results;
        } else {
          state.data = action.payload.data;
        }

        state.totalRecords = action.payload.count;
      })
      .addCase(listChatMessageThunkApi.rejected, (state) => {
        state.status = "rejected";
      });

    builder
      .addCase(createChatMessageThunkApi.pending, (state) => {
        state.status = "pending";
      })
      .addCase(createChatMessageThunkApi.fulfilled, (state, action) => {
        state.status = "fulfilled";
        // state.data.push(action.payload.data);
      })
      .addCase(createChatMessageThunkApi.rejected, (state) => {
        state.status = "rejected";
      });

    builder
      .addCase(markAsReadChatMessageThunkApi.pending, (state) => {
        state.status = "pending";
      })
      .addCase(markAsReadChatMessageThunkApi.fulfilled, (state) => {
        state.status = "fulfilled";

        state.data = state.data.map((message) => ({
          ...message,
          is_read: true,
        }));
      })
      .addCase(markAsReadChatMessageThunkApi.rejected, (state) => {
        state.status = "rejected";
      });
  },
});

export const {
  addChatMessage,
  typingStart,
  typingEnd,
  updateOnlineStatus,

} = chatMessageReducer.actions;


export const {
    clearUnreadCount,
    incrementUnreadCount
} = chatReducer.actions
export default chatMessageReducer.reducer;