import React, { useState, useEffect } from "react";
import { Layout, Menu, Button, notification } from "antd";
import { Link, useLocation } from "react-router";

import {
  DashboardOutlined,
  ShoppingCartOutlined,
  SettingOutlined,
  AppstoreOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  ProfileOutlined,
  LockOutlined,
  UserOutlined,
  TagsOutlined,
  BgColorsOutlined,
  ExpandOutlined,
  ReconciliationOutlined,
  GlobalOutlined,
  EnvironmentOutlined,
  BankOutlined,
} from "@ant-design/icons";


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
  console.log(user_detail.user_type);
  const items = [
    {
      key: "/dashboard/",
      icon: <DashboardOutlined />,
      label: <Link to="/dashboard/">Dashboard</Link>,
    },

    {
      key: "/order/",
      icon: <ReconciliationOutlined />,
      label: <Link to="/order/">Order</Link>,
    },

    ...(user_detail.user_type==="Customer" ? [
      {
       key: "/product-showcase/",
      icon: <AppstoreOutlined />,
      label: <Link to="/product-showcase/">Products</Link>, 
      }
    ] : [] ),

    // ...(user_detail.user_type==="Seller" ? [
    //   {
    //    key: "/product/",
    //   icon: <AppstoreOutlined />,
    //   label: <Link to="/product/">MyProducts</Link>, 
    //   }
    // ] : [] ),

    ...(user_detail.user_type === "Seller" || user_detail.user_type === "Admin"
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
  ];
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

        <div className="sidebar-logo">
          <img src="/src/assets/only_logo.png" alt="logo" className="logo-image"  style={{width:60,height:50}}/>

          {!collapsed && (
            <div>
              <div className="logo-title">Econo Shop</div>

              <div className="logo-subtitle">Management System</div>
            </div>
          )}
        </div>

        <Menu
          mode="inline"
          selectedKeys={[location.pathname]}
          defaultOpenKeys={getOpenKeys()}
          items={items}
        />
      </Sider>
    </>
  );
}
