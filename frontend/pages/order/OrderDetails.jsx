import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router";
import { useDispatch } from "react-redux";
import {
  Row,
  Col,
  Card,
  Table,
  Button,
  Tag,
  Typography,
  Space,
  Avatar,
  Spin,
  notification,
  Breadcrumb,
  Steps,
  Divider
} from "antd";
import {
  ArrowLeftOutlined,
  ShoppingCartOutlined,
  CalendarOutlined,
  UserOutlined,
  EnvironmentOutlined,
  CreditCardOutlined
} from "@ant-design/icons";
import { retrieveOrderThunkApi } from "../../slice/Order.Slice";

const { Title, Text } = Typography;

export default function OrderDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [message, contextHolder] = notification.useNotification();
  
  const [loading, setLoading] = useState(true);
  const [orderData, setOrderData] = useState(null);

  useEffect(() => {
    if (id) {
      setLoading(true);
      dispatch(retrieveOrderThunkApi(id))
        .unwrap()
        .then((res) => {
          setOrderData(res?.data || res);
          setLoading(false);
        })
        .catch((error) => {
          setLoading(false);
          message.error({
            message: "Error Fetching Order Details",
            description: error || "Something went wrong.",
          });
        });
    }
  }, [id, dispatch]);

  const getStepStatusIndex = (status) => {
    const normalized = status?.toLowerCase();
    if (normalized === "pending") return 0;
    if (normalized === "processing") return 1;
    if (normalized === "shipped") return 2;
    if (normalized === "delivered") return 3;
    if (normalized === "cancelled") return -1;
    return 0;
  };

  const getPaymentBgColor = (status) => {
    switch (status?.toLowerCase()) {
      case "paid": return "#f6ffed";
      case "pending": return "#fffbe6";
      case "failed": return "#fff1f0";
      default: return "#f5f5f5";
    }
  };

  const getPaymentTextColor = (status) => {
    switch (status?.toLowerCase()) {
      case "paid": return "#389e0d";
      case "pending": return "#d46b08";
      case "failed": return "#cf1322";
      default: return "#595959";
    }
  };

  const itemColumns = [
    {
      title: "Item Details",
      key: "product",
      render: (_, record) => (
        <Space size={16}>
          <Avatar 
            shape="square" 
            size={64} 
            icon={<ShoppingCartOutlined />} 
            className="product-avatar-container"
          />
          <div>
            <Text strong className="product-title-text">
              {record.product?.product_name || record.product_name || "Product Item"}
            </Text>
            <Space size={4} className="product-meta-space" wrap>
              {record.color && <Tag color="default" className="meta-variant-tag">Color: {record.color_name || record.color}</Tag>}
              {record.size && <Tag color="default" className="meta-variant-tag">Size: {record.size_name || record.size}</Tag>}
            </Space>
          </div>
        </Space>
      ),
    },
    {
      title: "Quantity",
      dataIndex: "quantity",
      key: "quantity",
      align: "center",
      width: 100,
      render: (qty) => <Text type="secondary" strong className="quantity-multiplier">× {qty}</Text>,
    },
    {
      title: "Total Price",
      dataIndex: "subtotal",
      key: "subtotal",
      align: "right",
      width: 120,
      render: (value) => <Text strong className="item-subtotal-text">€{parseFloat(value).toFixed(2)}</Text>,
    },
  ];

  if (loading) {
    return (
      <div className="matrix-loader-container">
        <Spin size="large" />
        <Text type="secondary" className="matrix-loader-text">LOADING SYSTEM MATRIX...</Text>
      </div>
    );
  }

  if (!orderData) return null;

  const currentStep = getStepStatusIndex(orderData.status);

  return (
    <>
      {contextHolder}
      <div className="order-details-container">
        
        {/* TOP NAVIGATION BAR */}
        <Row justify="space-between" align="middle" className="details-card-prime-header">
          <Col>
            <Breadcrumb
              items={[
                { title: <span className="breadcrumb-link-inactive" onClick={() => navigate("/orders")}>Orders</span> },
                { title: <span className="breadcrumb-link-active">#{orderData.order_number}</span> },
              ]}
            />
          </Col>
          <Col>
            <Button 
              type="text" 
              icon={<ArrowLeftOutlined />} 
              onClick={() => navigate(-1)}
              className="back-dashboard-btn"
            >
              Back
            </Button>
          </Col>
        </Row>

        {/* HEADER STATUS OVERVIEW */}
        <Card className="details-card-prime details-card-prime-margin">
          <Row justify="space-between" align="middle" gutter={[16, 16]}>
            <Col xs={24} md={12}>
              <Space direction="vertical" size={4}>
                <Space align="center" size={12}>
                  <Title level={3} style={{ margin: 0, fontWeight: 700, color: "#141414" }}>
                    Order {orderData.order_number}
                  </Title>
                  <span className="payment-status-badge" style={{
                    backgroundColor: getPaymentBgColor(orderData.payment_status),
                    color: getPaymentTextColor(orderData.payment_status)
                  }}>
                    {orderData.payment_status}
                  </span>
                </Space>
                <Text type="secondary" className="order-timestamp">
                  <CalendarOutlined /> Placed on {orderData.created_at?.replace("T", " ").substring(0, 16)}
                </Text>
              </Space>
            </Col>

            <Col xs={24} md={12}>
              {currentStep === -1 ? (
                <div style={{ textAlign: "right" }}>
                  <Tag color="error" className="cancelled-tag">Order Cancelled</Tag>
                </div>
              ) : (
                <Steps
                  size="small"
                  current={currentStep}
                  items={[
                    { title: "Pending" },
                    { title: "Processing" },
                    { title: "Shipped" },
                    { title: "Delivered" },
                  ]}
                  className="stepper-container"
                />
              )}
            </Col>
          </Row>
        </Card>

        {/* ORDER INVENTORY GRID UNITS */}
        <Row gutter={[24, 24]}>
          <Col xs={24} lg={16}>
            <Card 
              title={<span className="card-title-strong">Items Details</span>}
              className="details-card-prime"
              bodyStyle={{ padding: "0px" }}
            >
              <Table
                rowKey="id"
                columns={itemColumns}
                dataSource={orderData.items || []}
                pagination={false}
              />
              
              {/* COST CALCULATION BLOCK */}
              <div className="cost-summary-footer">
                <Row justify="end">
                  <Col xs={24} sm={14} md={10}>
                    <Space direction="vertical" size={12} className="cost-summary-wrapper">
                      <div className="cost-row-item">
                        <Text type="secondary">Subtotal</Text>
                        <Text strong>€{parseFloat(orderData.subtotal).toFixed(2)}</Text>
                      </div>
                      <div className="cost-row-item">
                        <Text type="secondary">Shipping</Text>
                        <Text strong>€{parseFloat(orderData.shipping_cost).toFixed(2)}</Text>
                      </div>
                      <div className="cost-row-item">
                        <Text type="secondary">Estimated Tax</Text>
                        <Text strong>€{parseFloat(orderData.tax_amount).toFixed(2)}</Text>
                      </div>
                      <Divider className="divider-spacing" />
                      <div className="cost-row-item" style={{ alignItems: "center" }}>
                        <Text strong className="grand-total-label">Total Amount</Text>
                        <Text strong className="grand-total-amount">
                          €{parseFloat(orderData.total_amount).toFixed(2)}
                        </Text>
                      </div>
                    </Space>
                  </Col>
                </Row>
              </div>
            </Card>
          </Col>

          {/* PROFILE / LOGISTICAL SIDEBAR PANELS */}
          <Col xs={24} lg={8}>
            <Space direction="vertical" size={24} style={{ width: "100%" }}>
              
              {/* Profile Card */}
              <Card 
                title={<Space className="card-sidebar-title"><UserOutlined className="sidebar-icon" /> Customer Profile</Space>}
                className="details-card-prime"
              >
                <Space size={12} align="center">
                  <Avatar size={40} style={{ backgroundColor: "#e6f7ff", color: "#1890ff" }} icon={<UserOutlined />} />
                  <div>
                    <Text strong className="customer-profile-username">
                      {orderData.user_username || orderData.user?.username || "Guest User"}
                    </Text>
                    <Text type="secondary" className="customer-profile-subtext">Platform Buyer</Text>
                  </div>
                </Space>
              </Card>

              {/* Address Card */}
              <Card 
                title={<Space className="card-sidebar-title"><EnvironmentOutlined className="sidebar-icon" /> Shipping Address</Space>}
                className="details-card-prime"
              >
                <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                  <Text strong className="shipping-address-street">
                    {orderData.address || "No street address verified"}
                  </Text>
                  <Text type="secondary" className="shipping-address-sub">
                    {orderData.city_city_name || orderData.city?.name || "-"}, {orderData.state_state_name || orderData.state?.name || "-"}
                  </Text>
                  <Text type="secondary" className="shipping-address-country">
                    {orderData.country_country_name || orderData.country?.name || "-"}
                  </Text>
                </div>
              </Card>

              {/* Secure Transaction Hash Record */}
              <Card 
                title={<Space className="card-sidebar-title"><CreditCardOutlined className="sidebar-icon" /> Transaction Details</Space>}
                className="details-card-prime"
              >
                <Space direction="vertical" size={12} className="ledger-meta-wrapper">
                  <div>
                    <Text type="secondary" className="ledger-label">Gateway Reference ID</Text>
                    <Text copyable className="ledger-hash">{orderData.payment_id || "None"}</Text>
                  </div>
                  <div>
                    <Text type="secondary" className="ledger-label">Transaction Hash/ID</Text>
                    <Text copyable className="ledger-hash">{orderData.transaction_id || "None"}</Text>
                  </div>
                  <div>
                    <Text type="secondary" className="ledger-label">Settlement Timestamp</Text>
                    <Text className="ledger-timestamp">
                      {orderData.paid_at ? orderData.paid_at.replace("T", " ").substring(0, 16) : "Awaiting Transaction"}
                    </Text>
                  </div>
                </Space>
              </Card>

            </Space>
          </Col>
        </Row>
      </div>
    </>
  );
}