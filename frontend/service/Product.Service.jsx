import api from "../common/CommonAxios.jsx";

export const listProductService = (params) => {
  return api.get("/product/", {params:params});
};
export const createProductService = (data) => {
  return api.post("/product/", data);
};
export const retrieveProductService = (id,data) => {
  return api.get(`/product/${id}/`, data);
};
export const updateProductService = (id,data) => {
  return api.patch(`/product/${id}/`, data);
};
export const destroyProductService = (id,data) => {
  return api.delete(`/product/${id}/`, data);
};
