import api from "../common/CommonAxios";

export const listOrderService = (params) => {
  return api.get("/order/", { params: params });
};

export const createOrderService = (data) => {
  return api.post("/order/", data);
};

export const updateOrderService = (id, data) => {
  return api.patch(`/order/${id}/`, data);
};

export const retrieveOrderService = (id) => {
  return api.get(`/order/${id}/`);
};

export const destroyOrderService = (id) => {
  return api.delete(`/order/${id}/`);
};

export const verifyPaymentOrderService = (data) => {
  return api.post(`/order/verify-payment/`,data);
};
