import React, { useState, useEffect } from "react";
import { Layout, Menu, Button, notification, Drawer, Empty } from "antd";
import { Link, useLocation, useNavigate } from "react-router";

import {
  DashboardOutlined,
  ShoppingCartOutlined,
  SettingOutlined,
  AppstoreOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  ProfileOutlined,
  LockOutlined,
  UserAddOutlined,
  HeartOutlined,
  UserOutlined,
  TagsOutlined,
  BgColorsOutlined,
  ExpandOutlined,
  ReconciliationOutlined,
  GlobalOutlined,
  EnvironmentOutlined,
  DeleteOutlined,
  BankOutlined,
  LoginOutlined,
} from "@ant-design/icons";
import {
  openWishlistDrawer,
  closeWishlistDrawer,
  setWishlistDrawerOpen,
} from "../slice/Product.Slice";
import useWishlist from "../pages/product/useWishlist";
import "./CommonSiderStyle.css";
import { useDispatch, useSelector } from "react-redux";
import { hasPermission } from "../src/utils/Permission";
import { getSingleUserThunkApi } from "../slice/User.Slice";
const { Sider } = Layout;
export default function CommonSider() {
  const location = useLocation();
  const dispatch = useDispatch();
  const [collapsed, setCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 992);
  const [mobileOpen, setMobileOpen] = useState(false);
  const wishlist = useWishlist();
  const navigate=useNavigate()
  const wishlistDrawerOpen = useSelector(
    (state) => state.product.wishlistDrawerOpen,
  );
  console.log(wishlistDrawerOpen);
  const is_authenticated = localStorage.getItem("access");
  const goToProduct = (id) => navigate(`/product-details/${id}`);
  const CURRENCY = "EUR";
  const user_detail = useSelector((state) => state.user.user_detail);
  const [message, contextHolder] = notification.useNotification();
  useEffect(() => {
    const resize = () => {
      const mobile = window.innerWidth < 992;

      setIsMobile(mobile);

      if (!mobile) {
        setMobileOpen(false);
      }
    };

    window.addEventListener("resize", resize);

    return () => window.removeEventListener("resize", resize);
  }, []);
  const formatPrice = (value) =>
    new Intl.NumberFormat("en-IE", {
      style: "currency",
      currency: CURRENCY,
    }).format(Number(value) || 0);
  console.log(user_detail.user_type);
  const items = [];
  if (is_authenticated) {
    items.push(
      {
        key: "/",
        icon: <DashboardOutlined />,
        label: <Link to="/">Dashboard</Link>,
      },

      {
        key: "/order/",
        icon: <ReconciliationOutlined />,
        label: <Link to="/order/">Order</Link>,
      },

      ...(user_detail.user_type === "Customer"
        ? [
            {
              key: "/product-showcase/",
              icon: <AppstoreOutlined />,
              label: <Link to="/product-showcase/">Products</Link>,
            },
            {
        key: "wishlist",
        icon: <HeartOutlined />,
        label: "Wishlist",
        onClick: () => {
          dispatch(openWishlistDrawer());
        },
      },
          ]
        : []),

      // ...(user_detail.user_type==="Seller" ? [
      //   {
      //    key: "/product/",
      //   icon: <AppstoreOutlined />,
      //   label: <Link to="/product/">MyProducts</Link>,
      //   }
      // ] : [] ),

      ...(user_detail.user_type === "Seller" ||
      user_detail.user_type === "Admin"
        ? [
            {
              key: "product-management",
              icon: <AppstoreOutlined />,
              label: "Product Management",
              children: [
                {
                  key: "/product-brand/",
                  icon: <TagsOutlined />,
                  label: <Link to="/product-brand/">Product Brands</Link>,
                },

                ...(user_detail.user_type === "Admin"
                  ? [
                      {
                        key: "/product-color/",
                        icon: <BgColorsOutlined />,
                        label: <Link to="/product-color/">Product Colors</Link>,
                      },
                      {
                        key: "/product-size/",
                        icon: <ExpandOutlined />,
                        label: <Link to="/product-size/">Product Sizes</Link>,
                      },
                    ]
                  : []),
              ],
            },
          ]
        : []),

      ...(user_detail.user_type === "Admin"
        ? [
            {
              key: "master",
              icon: <GlobalOutlined />,
              label: "Master",
              children: [
                {
                  key: "/country/",
                  icon: <GlobalOutlined />,
                  label: <Link to="/country/">Countries</Link>,
                },
                {
                  key: "/state/",
                  icon: <EnvironmentOutlined />,
                  label: <Link to="/state/">States</Link>,
                },
                {
                  key: "/city/",
                  icon: <BankOutlined />,
                  label: <Link to="/city/">Cities</Link>,
                },
              ],
            },
          ]
        : []),
      
      {
        key: "settings",
        icon: <SettingOutlined />,
        label: "Settings",
        children: [
          {
            key: "/edit-profile/",
            icon: <UserOutlined />,
            label: <Link to="/edit-profile/">Edit Profile</Link>,
          },
          {
            key: "/reset-password/",
            icon: <LockOutlined />,
            label: <Link to="/reset-password/">Reset Password</Link>,
          },
        ],
      },
      {
        key: "/support-ticket/",
        icon: <ProfileOutlined />,
        label: <Link to="/support-ticket/">Support Ticket</Link>,
      },
    );

    if (hasPermission(user_detail, "user.view_usermodel")) {
      items.splice(1, 0, {
        key: "/user/",
        icon: <UserOutlined />,
        label: <Link to="/user/">User Management</Link>,
      });
    }

    if (
      hasPermission(user_detail, "product.view_productmodel") &&
      user_detail.user_type == "Seller"
    ) {
      items.splice(1, 0, {
        key: "/product/",
        icon: <ShoppingCartOutlined />,
        label: <Link to="/product/">MyProducts</Link>,
      });
    }

    if (
      hasPermission(user_detail, "product.view_productmodel") &&
      user_detail.user_type == "Admin"
    ) {
      items.splice(1, 0, {
        key: "/product/",
        icon: <ShoppingCartOutlined />,
        label: <Link to="/product/">Products</Link>,
      });
    }
  } else {
    items.push(
      {
        key: "/product-showcase/",
        icon: <AppstoreOutlined />,
        label: <Link to="/product-showcase/">Products</Link>,
      },
{
        key: "wishlist",
        icon: <HeartOutlined />,
        label: "Wishlist",
        onClick: () => {
          dispatch(openWishlistDrawer());
          setMobileOpen(false)
        },
      },
      {
        key: "/login/",
        icon: <LoginOutlined />,
        label: <Link to="/login/">Login</Link>,
      },
      
      {
        key: "/register/",
        icon: <UserAddOutlined />,
        label: <Link to="/register/">Sign Up</Link>,
      },
    );
  }

  if (is_authenticated) {
    useEffect(() => {
      dispatch(getSingleUserThunkApi())
        .unwrap()
        .then((res) => {})
        .catch((error) => {
          message.error({
            title: "Error",
            description: error,
          });
        });
    }, []);
  }

  const getOpenKeys = () => {
    if (
      ["/product-brand/", "/product-color/", "/product-size/"].includes(
        location.pathname,
      )
    ) {
      return ["product-management"];
    }

    if (["/country/", "/state/", "/city/"].includes(location.pathname)) {
      return ["master"];
    }

    if (["/edit-profile/", "/reset-password/"].includes(location.pathname)) {
      return ["settings"];
    }

    return [];
  };

  return (
    <>
      {contextHolder}
      {isMobile && mobileOpen && (
        <div className="sidebar-overlay" onClick={() => setMobileOpen(false)} />
      )}

      {isMobile && !mobileOpen && (
        <Button
          type="primary"
          shape="circle"
          className="mobile-trigger"
          icon={<MenuUnfoldOutlined />}
          onClick={() => setMobileOpen(true)}
          style={{
            right: "-48px",
            zIndex: 1000,
          }}
        />
      )}

      <Sider
        width={270}
        collapsedWidth={80}
        trigger={null}
        collapsed={!isMobile && collapsed}
        className={`common-sider ${
          isMobile ? (mobileOpen ? "mobile-open" : "mobile-close") : ""
        }`}
      >
        {!isMobile && (
          <Button
            type="primary"
            shape="circle"
            className="sidebar-trigger"
            icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
            onClick={() => setCollapsed(!collapsed)}
          />
        )}
        <Link to="/" className="sidebar-logo">
          <img
            src="/src/assets/only_logo.png"
            alt="logo"
            className="logo-image"
            style={{ width: 60, height: 50 }}
          />

          {!collapsed && (
            <div>
              <div className="logo-title">Econo Shop</div>
              <div className="logo-subtitle">Management System</div>
            </div>
          )}
        </Link>
        <Menu
          mode="inline"
          selectedKeys={[location.pathname]}
          defaultOpenKeys={getOpenKeys()}
          items={items}
        />
      </Sider>

      <Drawer
        title={`Wishlist (${wishlist.count})`}
        open={wishlistDrawerOpen}
        onClose={() => dispatch(closeWishlistDrawer())}
        width={isMobile ? "100%" : 420}
        extra={
          wishlist.count > 0 && (
            <Button size="small" danger type="text" onClick={wishlist.clear}>
              Clear all
            </Button>
          )
        }
      >
        {wishlist.count === 0 ? (
          <Empty description="Tap the heart on any product to save it here." />
        ) : (
          <ul className="wl-list">
            {wishlist.items.map((w) => (
              <li className="wl-item" key={w.id}>
                <img
                  src={w.image || FALLBACK_IMG}
                  alt={w.product_name}
                  onClick={() => {
                    dispatch(closeWishlistDrawer());
                    goToProduct(w.id);
                  }}
                />

                <div className="wl-info">
                  <span className="wl-name">{w.product_name}</span>

                  {w.product_brand_name && (
                    <span className="wl-brand">{w.product_brand_name}</span>
                  )}

                  <span className="wl-price">{formatPrice(w.price)}</span>
                </div>

                <div className="wl-actions">
                  <Button
                    size="small"
                    type="primary"
                    ghost
                    onClick={() => {
                      dispatch(closeWishlistDrawer());
                      goToProduct(w.id);
                    }}
                  >
                    View
                  </Button>

                  <Button
                    size="small"
                    type="text"
                    danger
                    icon={<DeleteOutlined />}
                    onClick={() => wishlist.remove(w.id)}
                    aria-label={`Remove ${w.product_name}`}
                  />
                </div>
              </li>
            ))}
          </ul>
        )}
      </Drawer>
    </>
  );
}
