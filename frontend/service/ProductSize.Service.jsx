import api from "../common/CommonAxios.jsx";

export const listProductSizeService = (params) => {
  return api.get("/product-size/", {params:params});
};
export const createProductSizeService = (data) => {
  return api.post("/product-size/", data);
};
export const retrieveProductSizeService = (id,data) => {
  return api.get(`/product-size/${id}/`, data);
};
export const updateProductSizeService = (id,data) => {
  return api.patch(`/product-size/${id}/`, data);
};
export const destroyProductSizeService = (id,data) => {
  return api.delete(`/product-size/${id}/`, data);
};
