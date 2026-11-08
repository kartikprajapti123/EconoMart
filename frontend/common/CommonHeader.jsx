import React, { useEffect, useState, useRef } from "react";
import {
  Layout,
  Badge,
  Dropdown,
  Button,
  Popconfirm,
  notification,
  Drawer,
  List,
  Avatar,
  Typography,
  Space,
  Divider,
  InputNumber,
  Tag,
  Empty,
  Tooltip,
} from "antd";
import { Link, useNavigate } from "react-router-dom";
import {
  UserOutlined,
  LogoutOutlined,
  SettingOutlined,
  ProfileOutlined,
  ShoppingCartOutlined,
  DeleteOutlined,
  ArrowRightOutlined,
  MessageOutlined,
  NotificationOutlined,
  CheckOutlined,
  EyeOutlined,
  ClockCircleOutlined,
} from "@ant-design/icons";
import { useDispatch, useSelector } from "react-redux";

import "./CommonHeaderStyle.css";
import { createLogoutThunkApi } from "../slice/Auth.Slice";
import {
  add_to_cart,
  openCart,
  closeCart,
  changeQuantity,
  deleteCartItem,
} from "../slice/Cart.Slice";
import {
  getUnreadCountThunkApi,
  listNotificationThunkApi,
  updateNotificationThunkApi,
  updateMarkAllReadNotificationThunkApi,
} from "../slice/Notification.Slice";
import { getUnreadMessageChatThunkApi } from "../slice/Chat.Slice";

const { Title, Text, Paragraph } = Typography;
const { Header } = Layout;

export default function CommonHeader() {
  const dispatch = useDispatch();
  const [message, contextHolder] = notification.useNotification();
  const navigate = useNavigate();
  const all_message_unread_count=useSelector((state)=>state.chat.all_unread_count)
  // Control Dropdown Visibility
  console.log('all_message_unread_count',all_message_unread_count)
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const socketRef = useRef(null);

  // Redux Selectors
  const cart = useSelector((state) => state.cart.cart);
  const isCartOpen = useSelector((state) => state.cart.isCartOpen);
  const user_detail = useSelector((state) => state.user.user_detail);
  const notification_unreadCount = useSelector(
    (state) => state.notification.unreadCount,
  );
  const notifications_list = useSelector(
    (state) => state.notification.data || [],
  );

  // Initialize Cart and Notifications
  useEffect(() => {
    const data = JSON.parse(localStorage.getItem("cart")) || [];
    dispatch(add_to_cart(data));

    if (
      user_detail?.user_type === "Customer" ||
      user_detail?.user_type === "Seller"
    ) {
      dispatch(getUnreadCountThunkApi());
      dispatch(listNotificationThunkApi());
    }
  }, [dispatch, user_detail]);

  // ----------------------------------------------------
  // Real-Time WebSocket Connection for Notifications
  // ----------------------------------------------------
  useEffect(() => {
    const isEligibleUser =
      user_detail?.user_type === "Customer" ||
      user_detail?.user_type === "Seller";

    console.log(isEligibleUser);
    if (!isEligibleUser) return;
    // Use wss:// for production HTTPS, or ws:// for HTTP
    // const wsHost = window.location.host;
    const accessToken = localStorage.getItem("access");
    const socketUrl = `${import.meta.env.VITE_WEBSOCKET_FRONTEND_URL}notification/?token=${accessToken}`;

    const ws = new WebSocket(socketUrl);
    socketRef.current = ws;

    ws.onopen = () => {
      console.log("WebSocket connected to /ws/notification/");
    };

    ws.onmessage = (event) => {
    try {
        const data = JSON.parse(event.data);

        if (data.type === "chat_change") {

            // Don't fetch if already on the chat page
            if (location.pathname !== "/chat") {
                dispatch(getUnreadMessageChatThunkApi());
            }

            return;
        }

        // Normal notification
        if (data.title || data.message) {
            notification.info({
                message: data.title || "New Notification",
                description: data.message || "",
                placement: "topRight",
            });
        }

        dispatch(getUnreadCountThunkApi());
        dispatch(listNotificationThunkApi());

    } catch (err) {
        console.error(err);
    }
};

    ws.onerror = (error) => {
      console.error("WebSocket error:", error);
    };

    ws.onclose = () => {
      console.log("WebSocket connection closed");
    };

    // Cleanup connection on unmount
    return () => {
      if (ws) ws.close();
    };
  }, [dispatch, user_detail]);

  // Logout Handler
  const handleLogOut = () => {
    const data = {
      refresh: localStorage.getItem("refresh"),
    };

    dispatch(createLogoutThunkApi(data))
      .unwrap()
      .then((res) => {
        message.success({
          title: "Success",
          description: res.message,
        });

        localStorage.removeItem("access");
        localStorage.removeItem("refresh");
        localStorage.removeItem("cart");

        navigate("/login/");
      })
      .catch((error) => {
        message.error({
          title: "Error",
          description: error,
        });
      });
  };

  // Notification Actions
  const handleMarkAllRead = (e) => {
    e.stopPropagation();
    dispatch(updateMarkAllReadNotificationThunkApi())
      .unwrap()
      .then(() => {
        dispatch(getUnreadCountThunkApi());
      })
      .catch((err) => {
        message.error({ title: "Error", description: err });
      });
  };

  const handleNotificationClick = (item) => {
    if (!item.is_read) {
      dispatch(
        updateNotificationThunkApi({
          id: item.id,
          data: { is_read: true },
        }),
      ).then(() => {
        dispatch(getUnreadCountThunkApi());
        if (item.url) {
          console.log(item.url);
          navigate(item.url);
        }
      });
    }
    setDropdownOpen(false); // Close dropdown on item click
    if (item.url) {
      navigate(item.url);
    }
  };

  const handleUnreadMessageCount=()=>{
    dispatch(getUnreadMessageChatThunkApi()).unwrap().then((res)=>{}).catch((error)=>{
      message.error({
        'title':"Error",
        "description":error
      })
    })
  }
  useEffect(()=>{
    handleUnreadMessageCount()
  },[])

  const handleToggleRead = (e, item) => {
    e.stopPropagation();
    dispatch(
      updateNotificationThunkApi({
        id: item.id,
        data: { is_read: !item.is_read },
      }),
    ).then(() => {
      dispatch(getUnreadCountThunkApi());
    });
  };

  // Handler for View All Notifications Button
  const handleViewAllClick = () => {
    setDropdownOpen(false); // Close the dropdown menu
    navigate("/notification/");
  };

  // Helper for notification tag colors
  const getTagColor = (type) => {
    switch (type) {
      case "order":
        return "blue";
      case "support":
        return "green";
      case "product":
        return "gold";
      default:
        return "purple";
    }
  };

  // Notification Dropdown Component
  const notificationDropdownMenu = (
    <div
      style={{
        width: "360px",
        backgroundColor: "#ffffff",
        borderRadius: "12px",
        boxShadow: "0 10px 30px rgba(0, 0, 0, 0.12)",
        border: "1px solid #f0f0f0",
        overflow: "hidden",
      }}
    >
      {/* Header */}
      <div
        style={{
          padding: "14px 16px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          borderBottom: "1px solid #f0f0f0",
          backgroundColor: "#fafafa",
        }}
      >
        <Space size={8}>
          <Text strong style={{ fontSize: "15px", color: "#111827" }}>
            Notifications
          </Text>
          {notification_unreadCount > 0 && (
            <Badge count={notification_unreadCount} overflowCount={99} />
          )}
        </Space>
        {notification_unreadCount > 0 && (
          <Button
            type="link"
            size="small"
            style={{ padding: 0, fontSize: "12px", height: "auto" }}
            onClick={handleMarkAllRead}
          >
            Mark all read
          </Button>
        )}
      </div>

      {/* Body List */}
      <div style={{ maxHeight: "360px", overflowY: "auto", padding: "4px 0" }}>
        <List
          itemLayout="horizontal"
          dataSource={notifications_list.slice(0, 5)}
          locale={{
            emptyText: (
              <Empty
                image={Empty.PRESENTED_IMAGE_SIMPLE}
                description={
                  <span style={{ fontSize: "13px", color: "#9ca3af" }}>
                    No new notifications
                  </span>
                }
              />
            ),
          }}
          renderItem={(item) => (
            <List.Item
              onClick={() => handleNotificationClick(item)}
              style={{
                padding: "12px 16px",
                cursor: "pointer",
                backgroundColor: item.is_read ? "#ffffff" : "#f0f7ff",
                borderBottom: "1px solid #f5f5f5",
                textAlign: "left",
                transition: "background 0.2s",
              }}
            >
              <div style={{ width: "100%", textAlign: "left" }}>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: "4px",
                  }}
                >
                  <Space size={6}>
                    <Text
                      strong
                      style={{
                        fontSize: "13.5px",
                        color: item.is_read ? "#374151" : "#111827",
                      }}
                    >
                      {item.title}
                    </Text>
                    <Tag
                      color={getTagColor(item.notification_type)}
                      style={{
                        fontSize: "10px",
                        borderRadius: "4px",
                        margin: 0,
                        padding: "0 4px",
                        lineHeight: "16px",
                      }}
                    >
                      {item.notification_type}
                    </Tag>
                  </Space>
                  <Tooltip title={item.is_read ? "Mark unread" : "Mark read"}>
                    <Button
                      type="text"
                      size="small"
                      style={{ height: "20px", width: "20px", padding: 0 }}
                      icon={
                        <CheckOutlined
                          style={{
                            color: item.is_read ? "#d1d5db" : "#2563eb",
                            fontSize: "12px",
                          }}
                        />
                      }
                      onClick={(e) => handleToggleRead(e, item)}
                    />
                  </Tooltip>
                </div>

                <Paragraph
                  ellipsis={{ rows: 2 }}
                  style={{
                    margin: 0,
                    fontSize: "12.5px",
                    color: "#6b7280",
                    textAlign: "left",
                    lineHeight: "1.4",
                  }}
                >
                  {item.message}
                </Paragraph>

                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "4px",
                    marginTop: "6px",
                  }}
                >
                  <ClockCircleOutlined
                    style={{ fontSize: "11px", color: "#9ca3af" }}
                  />
                  <Text type="secondary" style={{ fontSize: "11px" }}>
                    {item.created_at
                      ? new Date(item.created_at).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })
                      : ""}
                  </Text>
                </div>
              </div>
            </List.Item>
          )}
        />
      </div>

      {/* Footer */}
      <div
        style={{
          padding: "10px 16px",
          textAlign: "center",
          borderTop: "1px solid #f0f0f0",
          backgroundColor: "#fafafa",
        }}
      >
        <Button
          type="text"
          block
          icon={<EyeOutlined />}
          style={{ fontSize: "13px", fontWeight: 500, color: "#2563eb" }}
          onClick={handleViewAllClick}
        >
          View All Notifications
        </Button>
      </div>
    </div>
  );

  const profileItems = [
    {
      key: "/edit-profile/",
      icon: <ProfileOutlined />,
      label: <Link to="/edit-profile/">Edit Profile</Link>,
    },
    {
      key: "/reset-password/",
      icon: <SettingOutlined />,
      label: <Link to="/reset-password/">Reset Password</Link>,
    },
    {
      type: "divider",
    },
    {
      key: "logout",
      danger: true,
      icon: <LogoutOutlined />,
      label: (
        <Popconfirm
          title="Do you want to Logout ?"
          onConfirm={() => handleLogOut()}
        >
          Logout
        </Popconfirm>
      ),
    },
  ];

  let cartTotalCount = 0;
  const total = cart.reduce((sum, item) => {
    cartTotalCount += Number(item.quantity || 1);
    return sum + Number(item.price || 0) * Number(item.quantity || 1);
  }, 0);

  return (
    <>
      {contextHolder}
      <Header className="common-header">
        {/* Left Side */}
        <div className="header-welcome">
          <div className="welcome-title">
            Welcome back, {user_detail.username} 👋
          </div>
        </div>

        {/* Right Side */}
        <div className="header-right">
          {user_detail.user_type === "Customer" ||
          user_detail.user_type === "Seller" ? (
            <Dropdown
              dropdownRender={() => notificationDropdownMenu}
              trigger={["click"]}
              placement="bottomRight"
              open={dropdownOpen}
              onOpenChange={(flag) => setDropdownOpen(flag)}
            >
              <Badge count={notification_unreadCount} size="small">
                <Button
                  type="text"
                  shape="circle"
                  className="header-icon-btn"
                  icon={<NotificationOutlined />}
                />
              </Badge>
            </Dropdown>
          ) : null}

          {["Customer", "Seller"].includes(user_detail.user_type) && (
            <Badge count={all_message_unread_count} size="small">
            <Button
              type="text"
              shape="circle"
              className="header-icon-btn"
              icon={<MessageOutlined />}
              onClick={() => navigate("/chat")}
            />
            </Badge>
          )}

          {user_detail.user_type === "Customer" ? (
            <Badge count={cartTotalCount} size="small">
              <Button
                type="text"
                shape="circle"
                className="header-icon-btn"
                icon={<ShoppingCartOutlined />}
                onClick={() => dispatch(isCartOpen ? closeCart() : openCart())}
              />
            </Badge>
          ) : null}

          <Dropdown
            menu={{ items: profileItems }}
            trigger={["click"]}
            placement="bottomRight"
          >
            <div className="profile-wrapper">
              <Avatar
                size={42}
                src={user_detail?.profile_image || undefined}
                icon={!user_detail?.profile_image && <UserOutlined />}
                className="profile-avatar"
              />
            </div>
          </Dropdown>
        </div>
      </Header>

      {/* Cart Drawer */}
      <Drawer
        title={
          <Space size="middle">
            <ShoppingCartOutlined
              style={{
                fontSize: 20,
                color: "#1677ff",
              }}
            />
            <Title level={4} style={{ margin: 0 }}>
              Your Cart ({cart.length})
            </Title>
          </Space>
        }
        placement="right"
        width={450}
        open={isCartOpen}
        onClose={() => dispatch(closeCart())}
        styles={{
          body: { padding: "16px 24px" },
          footer: {
            padding: "24px",
            boxShadow: "0 -4px 12px rgba(0,0,0,0.05)",
          },
        }}
        footer={
          <div style={{ width: "100%" }}>
            <Space
              direction="vertical"
              size="middle"
              style={{ width: "100%", marginBottom: 16 }}
            >
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <Text type="secondary">Subtotal</Text>
                <Text strong>€{total.toFixed(2)}</Text>
              </div>

              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <Text type="secondary">Shipping</Text>
                <Text type="success">Free</Text>
              </div>

              <Divider style={{ margin: "8px 0" }} />

              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <Text strong style={{ fontSize: 16 }}>
                  Total
                </Text>

                <Title level={3} style={{ margin: 0 }}>
                  €{total.toFixed(2)}
                </Title>
              </div>
            </Space>

            <Button
              type="primary"
              size="large"
              block
              icon={<ArrowRightOutlined />}
              iconPosition="end"
              style={{
                height: 50,
                fontSize: 16,
                fontWeight: 600,
                borderRadius: 8,
              }}
              onClick={() => {
                navigate("checkout");
                dispatch(closeCart());
              }}
            >
              Proceed to Checkout
            </Button>
          </div>
        }
      >
        <List
          dataSource={cart}
          locale={{
            emptyText: (
              <div style={{ textAlign: "center", padding: "40px 0" }}>
                <ShoppingCartOutlined
                  style={{ fontSize: 48, color: "#d9d9d9" }}
                />
                <div style={{ marginTop: 10 }}>Your cart is empty</div>
              </div>
            ),
          }}
          renderItem={(item) => (
            <List.Item
              key={`${item.product_id}-${item.color}`}
              actions={[
                <Popconfirm
                  key="delete"
                  title="Remove Item"
                  description="Are you sure you want to remove this item from your cart?"
                  okText="Yes"
                  cancelText="No"
                  okButtonProps={{ danger: true }}
                  onConfirm={() =>
                    dispatch(
                      deleteCartItem({
                        product_id: item.product_id,
                      }),
                    )
                  }
                >
                  <Button type="text" danger icon={<DeleteOutlined />} />
                </Popconfirm>,
              ]}
            >
              <List.Item.Meta
                avatar={<Avatar src={item.image} shape="square" size={80} />}
                title={<Text strong>{item.product_name}</Text>}
                description={
                  <>
                    {item.color && (
                      <Text
                        type="secondary"
                        style={{ display: "block", marginBottom: 8 }}
                      >
                        Color: {item.color}
                      </Text>
                    )}

                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                      }}
                    >
                      <InputNumber
                        min={1}
                        value={item.quantity}
                        controls
                        onChange={(value) => {
                          dispatch(
                            changeQuantity({
                              product_id: item.product_id,
                              quantity: value,
                            }),
                          );
                        }}
                        onKeyDown={(e) => e.preventDefault()}
                      />

                      <Text strong>
                        €
                        {(Number(item.price) * Number(item.quantity)).toFixed(
                          2,
                        )}
                      </Text>
                    </div>
                  </>
                }
              />
            </List.Item>
          )}
        />
      </Drawer>
    </>
  );
}
