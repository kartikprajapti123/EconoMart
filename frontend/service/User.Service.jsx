import api from "../common/CommonAxios.jsx";

export const listUserService = (params) => {
  return api.get("/user/", {params:params});
};
export const createUserService = (data) => {
  return api.post(`/user/`, data);
};
export const retrieveUserService = (id,data) => {
  return api.get(`/user/${id}/`, data);
};
export const updateUserService = (id,data) => {
  return api.patch(`/user/${id}/`, data);
};

export const getSingleUserService = () => {
  return api.post(`/user/get-single-user/`);
};

export const getDashboardSummarySellerService = () => {
  return api.post(`/user/dashboard-summary-seller/`);
};


export const getDashboardSummaryAdminService = () => {
  return api.post(`/user/dashboard-summary-admin/`);
};

export const getDashboardSummaryCustomerService = () => {
  return api.post(`/user/dashboard-summary-customer/`);
};


export const postGoogleAuthenticationService = (data) => {
  return api.post(`/google-authentication/`,data);
};


