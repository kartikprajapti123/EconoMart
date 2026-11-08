import { createSlice } from "@reduxjs/toolkit";

const cartReducer = createSlice({
  name: "cart",
  initialState: {
    cart: [],
    isCartOpen: false,
  },

  reducers: {
    add_to_cart: (state, action) => {
      console.log("action",action.payload)
      state.cart=action.payload

    },
    

    openCart: (state) => {
      state.isCartOpen = true;
    },

    closeCart: (state) => {
      state.isCartOpen = false;
    },
    changeQuantity: (state, action) => {
      const index = state.cart.findIndex(
        (item) => item.product_id === action.payload.product_id,
      );

      if (index !== -1) {
        state.cart[index].quantity = action.payload.quantity;
        localStorage.setItem("cart", JSON.stringify(state.cart));
      }
    },
    deleteCartItem:(state,action)=>{
      const newCart=state.cart.filter((item)=>item.product_id!== action.payload.product_id)
      state.cart=newCart
      localStorage.setItem("cart",JSON.stringify(newCart))
    }
  },
});

export const { add_to_cart, openCart, closeCart,changeQuantity,deleteCartItem } =
  cartReducer.actions;
export default cartReducer.reducer;
