import { configureStore } from "@reduxjs/toolkit";
import authReducer from "../slice/Auth.Slice.jsx";
import countryReducer from "../slice/Country.Slice.jsx";
import stateReducer from "../slice/State.Slice.jsx";
import cityReducer from "../slice/City.Slice.jsx";
import productReducer from "../slice/Product.Slice.jsx";
import productColorReducer from "../slice/ProductColor.Slice.jsx";
import productBrandReducer from "../slice/ProductBrand.Slice.jsx";

import productSizeReducer from "../slice/ProductSize.Slice.jsx";
import userReducer from "../slice/User.Slice.jsx";
import cartReducer from "../slice/Cart.Slice.jsx"
import orderReducer from "../slice/Order.Slice.jsx"
import {supportTicketMessagesReducer,supportTicketReducer} from "../slice/SupportTicket.Slice.jsx"
import notificationReducer from "../slice/Notification.Slice.jsx"

import { chatMessageReducer,chatReducer } from "../slice/Chat.Slice.jsx";
export const store = configureStore({
  reducer: {
    auth: authReducer,
    user: userReducer,

    country: countryReducer,
    state: stateReducer,
    city: cityReducer,
    product:productReducer,
    productColor:productColorReducer,
    productBrand:productBrandReducer,
    productSize:productSizeReducer,
    cart:cartReducer,
    order:orderReducer,
    supportTicket:supportTicketReducer.reducer,
    supportTicketMessages:supportTicketMessagesReducer.reducer,
    notification:notificationReducer,
    chat:chatReducer.reducer,
    chatMessage:chatMessageReducer.reducer



  },
});
