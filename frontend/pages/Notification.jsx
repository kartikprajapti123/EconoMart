import React, { useEffect, useState } from "react";
import {
  Card,
  List,
  Button,
  Badge,
  Tag,
  Space,
  Tabs,
  Typography,
  Empty,
  Tooltip,
  notification as antNotification,
} from "antd";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
  ShoppingBag,
  Headphones,
  Package,
  Info,
  Clock,
  ArrowLeft,
  CheckCheck,
  ExternalLink,
  MailOpen,
  CheckCircle2,
} from "lucide-react";
import {
  listNotificationThunkApi,
  updateNotificationThunkApi,
  updateMarkAllReadNotificationThunkApi,
  getUnreadCountThunkApi,
} from "../slice/Notification.Slice";

const { Text, Paragraph } = Typography;

export default function Notification() {
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("all");
  const [messageApi, contextHolder] = antNotification.useNotification();

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const notification_data = useSelector((state) => state.notification?.data) || [];
  const reduxUnreadCount = useSelector((state) => state.notification?.unreadCount);

  useEffect(() => {
    fetchNotifications();
    dispatch(getUnreadCountThunkApi());
  }, [dispatch]);

  const fetchNotifications = () => {
    setLoading(true);
    dispatch(listNotificationThunkApi())
      .unwrap()
      .then(() => setLoading(false))
      .catch((err) => {
        setLoading(false);
        messageApi.error({
          title: "Error Loading Notifications",
          description: typeof err === "string" ? err : "Failed to fetch notifications.",
        });
      });
  };

  const handleMarkAllRead = () => {
    dispatch(updateMarkAllReadNotificationThunkApi())
      .unwrap()
      .then(() => {
        messageApi.success({
          title: "Success",
          description: "All notifications marked as read.",
        });
      })
      .catch((err) => {
        messageApi.error({ title: "Error", description: err });
      });
  };

  const handleToggleRead = (e, item) => {
    e.stopPropagation();
    const newReadStatus = !item.is_read;

    dispatch(
      updateNotificationThunkApi({
        id: item.id,
        data: { is_read: newReadStatus },
      })
    )
      .unwrap()
      .then(() => {
        dispatch(getUnreadCountThunkApi());
      })
      .catch((err) => {
        messageApi.error({ title: "Update Failed", description: err });
      });
  };

  const handleItemClick = (item) => {
    if (!item.is_read) {
      dispatch(
        updateNotificationThunkApi({
          id: item.id,
          data: { is_read: true },
        })
      ).then(() => {
        dispatch(getUnreadCountThunkApi());
      });
    }

    if (item.url) {
      navigate(item.url);
    }
  };

  const getNotificationTypeConfig = (type) => {
    switch (type) {
      case "order":
        return {
          icon: <ShoppingBag size={18} style={{ color: "#2563eb" }} />,
          bg: "#eff6ff",
          color: "blue",
          label: "Order",
        };
      case "Support_Ticket":
        return {
          icon: <Headphones size={18} style={{ color: "#059669" }} />,
          bg: "#ecfdf5",
          color: "success",
          label: "Support",
        };
      case "product":
        return {
          icon: <Package size={18} style={{ color: "#d97706" }} />,
          bg: "#fffbeb",
          color: "warning",
          label: "Product",
        };
      case "system":
      default:
        return {
          icon: <Info size={18} style={{ color: "#7c3aed" }} />,
          bg: "#f5f3ff",
          color: "purple",
          label: "System",
        };
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const filteredNotifications = notification_data.filter((item) => {
    if (activeTab === "unread") return !item.is_read;
    if (activeTab === "all") return true;
    return item.notification_type === activeTab;
  });

  const unreadCount =
    typeof reduxUnreadCount === "number"
      ? reduxUnreadCount
      : notification_data.filter((n) => !n.is_read).length;

  return (
    <>
      {contextHolder}
      <div style={{ maxWidth: "1100px", margin: "0 auto", padding: "32px 20px", textAlign: "left" }}>
        {/* Header Navigation Bar */}
        <div style={{ marginBottom: 24, display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "16px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
            <Button
              type="text"
              icon={<ArrowLeft size={18} />}
              style={{ display: "flex", alignItems: "center", justifyContent: "center", borderRadius: "8px" }}
              onClick={() => navigate(-1)}
            />
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <h1 style={{ margin: 0, fontSize: "24px", fontWeight: 700, color: "#111827" }}>
                  Notifications
                </h1>
                {unreadCount > 0 && <Badge count={unreadCount} overflowCount={99} />}
              </div>
              <Text type="secondary" style={{ fontSize: "14px" }}>
                Real-time updates on orders, support requests, and product alerts
              </Text>
            </div>
          </div>

          {unreadCount > 0 && (
            <Button
              type="primary"
              ghost
              icon={<CheckCheck size={16} />}
              onClick={handleMarkAllRead}
              style={{ borderRadius: "8px" }}
            >
              Mark all as read
            </Button>
          )}
        </div>

        {/* Notification Tabs Card */}
        <Card
          bordered={false}
          style={{
            borderRadius: "16px",
            boxShadow: "0 4px 20px rgba(0,0,0,0.03)",
            border: "1px solid #f0f0f0",
          }}
        >
          <Tabs
            activeKey={activeTab}
            onChange={setActiveTab}
            items={[
              { key: "all", label: `All (${notification_data.length})` },
              { key: "unread", label: `Unread (${unreadCount})` },
              { key: "order", label: "Orders" },
              { key: "Support_Ticket", label: "Support_Ticket" },
              { key: "product", label: "Products" },
              { key: "system", label: "System" },
            ]}
          />

          <div style={{ marginTop: "12px" }}>
            <List
              loading={loading}
              itemLayout="horizontal"
              dataSource={filteredNotifications}
              locale={{
                emptyText: (
                  <Empty
                    image={Empty.PRESENTED_IMAGE_SIMPLE}
                    description={<span style={{ color: "#9ca3af" }}>No notifications available in this view</span>}
                  />
                ),
              }}
              renderItem={(item) => {
                const typeConfig = getNotificationTypeConfig(item.notification_type);

                return (
                  <List.Item
                    onClick={() => handleItemClick(item)}
                    style={{
                      padding: "18px 20px",
                      borderRadius: "10px",
                      marginBottom: "12px",
                      cursor: "pointer",
                      backgroundColor: item.is_read ? "#ffffff" : "#f8fafc",
                      borderLeft: item.is_read ? "3px solid transparent" : "3px solid #2563eb",
                      border: item.is_read ? "1px solid #f3f4f6" : "1px solid #e2e8f0",
                      transition: "all 0.2s ease-in-out",
                    }}
                    actions={[
                      <Tooltip title={item.is_read ? "Mark as unread" : "Mark as read"} key="toggle-read">
                        <Button
                          type="text"
                          size="small"
                          style={{ display: "flex", alignItems: "center", justifyContent: "center" }}
                          icon={
                            item.is_read ? (
                              <MailOpen size={16} style={{ color: "#9ca3af" }} />
                            ) : (
                              <CheckCircle2 size={16} style={{ color: "#2563eb" }} />
                            )
                          }
                          onClick={(e) => handleToggleRead(e, item)}
                        />
                      </Tooltip>,
                    ]}
                  >
                    <List.Item.Meta
                      avatar={
                        <div
                          style={{
                            width: "46px",
                            height: "46px",
                            borderRadius: "12px",
                            backgroundColor: typeConfig.bg,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            flexShrink: 0,
                          }}
                        >
                          {typeConfig.icon}
                        </div>
                      }
                      title={
                        <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
                          <Text strong style={{ fontSize: "15px", color: "#1f2937" }}>
                            {item.title}
                          </Text>
                          <Tag
                            color={typeConfig.color}
                            style={{ fontSize: "11px", borderRadius: "6px", margin: 0, padding: "0 8px" }}
                          >
                            {typeConfig.label}
                          </Tag>
                          {!item.is_read && (
                            <Badge
                              status="processing"
                              text={<span style={{ fontSize: "11px", color: "#2563eb", fontWeight: 500 }}>New</span>}
                            />
                          )}
                          {item.url && <ExternalLink size={13} style={{ color: "#9ca3af", marginLeft: "2px" }} />}
                        </div>
                      }
                      description={
                        <div style={{ marginTop: "6px" }}>
                          <Paragraph
                            ellipsis={{ rows: 2 }}
                            style={{
                              margin: 0,
                              color: "#4b5563",
                              fontSize: "13.5px",
                              lineHeight: "1.5",
                              textAlign: "left",
                            }}
                          >
                            {item.message}
                          </Paragraph>

                          <div style={{ display: "flex", alignItems: "center", gap: "6px", marginTop: "8px" }}>
                            <Clock size={12} style={{ color: "#9ca3af" }} />
                            <Text type="secondary" style={{ fontSize: "12px" }}>
                              {formatDate(item.created_at)}
                            </Text>
                          </div>
                        </div>
                      }
                    />
                  </List.Item>
                );
              }}
            />
          </div>
        </Card>
      </div>
    </>
  );
}