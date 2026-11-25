import { Routes, Route, BrowserRouter } from "react-router-dom";
import Register from "../pages/auth/Register";
import OtpVerify from "../pages/auth/OtpVerify";
import Login from "../pages/auth/Login";
import ForgotPassword from "../pages/auth/ForgotPassword";
import ChangePassword from "../pages/auth/ChangePassword.jsx";
import CommonLayout from "./CommonLayout";
import CountryListCreateUpdate from "../pages/master/CountryListCreateUpdate";
import StateListCreateUpdate from "../pages/master/StateListCreateUpdate";
import CityListCreateUpdate from "../pages/master/CityListCreateUpdate";
import ProductList from "../pages/product/ProductList";
import ProductCreateUpdate from "../pages/product/ProductCreateUpdate";
import ProductSizeListCreateUpdate from "../pages/productMaster/ProductSizeListCreateUpdate";
import ProductColorListCreateUpdate from "../pages/productMaster/ProductColorListCreateUpdate";
import ProductBrandListCreateUpdate from "../pages/productMaster/ProductBrandListCreateUpdate";
import EditProfile from "../pages/settings/EditProfile";
import ResetPassword from "../pages/settings/ResetPassword.jsx";
import UserList from "../pages/user/UserList.jsx";
import UserCreateUpdate from "../pages/user/UserCreateUpdate.jsx";
import ProductDetails from "../pages/product/ProductDetails.jsx";
import Dashboard from "../pages/dashboard/Dashboard.jsx";
import Checkout from "../pages/Checkout.jsx";
import OrderList from "../pages/order/OrderList.jsx";
import OrderDetails from "../pages/order/OrderDetails.jsx";
import ProductCustomerShowCase from "../pages/product/ProductCustomerShowCase";
import NotFound from "../pages/NotFound.jsx";
import SupportTicketListCreate from "../pages/support_ticket/SupportTicketListCreate.jsx";
import SupportTicketMessagesListCreate from "../pages/support_ticket/SupportTicketMessagesListCreate.jsx";
import Notification from "../pages/Notification.jsx";
import Chat from "../pages/Chat.jsx";

export default function CommonRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/register" element={<Register />} />
        <Route path="/otp-verify/:token" element={<OtpVerify />} />
        <Route path="/login/" element={<Login />} />
        <Route path="/forgot-password/" element={<ForgotPassword />} />
        <Route path="/change-password/:token" element={<ChangePassword />} />

        <Route element={<CommonLayout />}>
          <Route path="/country/" element={<CountryListCreateUpdate />} />
          <Route path="/state/" element={<StateListCreateUpdate />} />
          <Route path="/city/" element={<CityListCreateUpdate />} />

          <Route path="/product/" element={<ProductList />} />
          <Route path="/product-form/" element={<ProductCreateUpdate />} />
          <Route path="/product-form/:id/" element={<ProductCreateUpdate />} />
          <Route
            path="/product-showcase/"
            element={<ProductCustomerShowCase />}
          />

          <Route
            path="/product-size/"
            element={<ProductSizeListCreateUpdate />}
          />
          <Route
            path="/product-color/"
            element={<ProductColorListCreateUpdate />}
          />

          <Route
            path="/product-brand/"
            element={<ProductBrandListCreateUpdate />}
          />

          <Route path="/edit-profile/" element={<EditProfile />} />

          <Route path="/reset-password/" element={<ResetPassword />} />
          <Route path="/user/" element={<UserList />} />
          <Route path="/user-form/" element={<UserCreateUpdate />} />
          <Route path="/user-form/:id/" element={<UserCreateUpdate />} />

          <Route path="/product-details/:id/" element={<ProductDetails />} />

          <Route path="/" element={<Dashboard />} />
          <Route path="/checkout/" element={<Checkout />} />

          <Route path="/order/" element={<OrderList />} />
          <Route path="/order-details/:id/" element={<OrderDetails />} />
          <Route path="/support-ticket/" element={<SupportTicketListCreate />} />
          <Route path="/support-ticket-message/:ticketId" element={<SupportTicketMessagesListCreate />} />
          <Route path="/notification/" element={<Notification/>}/>
          <Route path="/chat/" element={<Chat/>}/>


        </Route>

      <Route path="*" element={<NotFound />} />

      </Routes>
      
    </BrowserRouter>
  );
}
