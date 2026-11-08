import api from "../common/CommonAxios.jsx";

export const listProductBrandService = (params) => {
  return api.get("/product-brand/", { params: params });
};
export const createProductBrandService = (data) => {
  return api.post("/product-brand/", data);
};
export const retrieveProductBrandService = (id, data) => {
  return api.get(`/product-brand/${id}/`, data);
};
export const updateProductBrandService = (id, data) => {
  return api.patch(`/product-brand/${id}/`, data);
};
export const destroyProductBrandService = (id, data) => {
  return api.delete(`/product-brand/${id}/`, data);
};
