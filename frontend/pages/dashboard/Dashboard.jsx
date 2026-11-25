import React, { useEffect, useState } from "react";
import {
  Card,
  Row,
  Col,
  Statistic,
  ConfigProvider,
  Spin,
  notification,
  Typography,
} from "antd";
import { useDispatch, useSelector } from "react-redux";
import {
  ShoppingBag,
  Package,
  DollarSign,
  Clock,
  Activity,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import { Line, Pie } from "@ant-design/charts"; // Imported charts
import {
  getDashboardSummaryCustomerThunkApi,
  getDashboardSummarySellerThunkApi,
  getDashboardSummaryAdminThunkApi,
  getSingleUserThunkApi,
} from "../../slice/User.Slice";
import axios from "axios";

import { hasPermission } from "../../src/utils/Permission";
import { useNavigate } from "react-router";

const { Title, Text } = Typography;

export default function Dashboard() {
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState(null);
  const [message, contextHolder] = notification.useNotification();
  const navigate = useNavigate();

const is_authenticated = Boolean(localStorage.getItem("access"));

useEffect(() => {
  if (!is_authenticated) {
    navigate("/product-showcase/", { replace: true });
  }
}, [is_authenticated, navigate]);
  const dispatch = useDispatch();
  const userDetail = useSelector((state) => state.user.user_detail);
  const user_type = userDetail?.user_type;
  console.log(user_type)
  useEffect(() => {
    if (user_type) {
        fetchDashboardData(user_type);
    }
}, [user_type]);

  const fetchDashboardData = (role) => {
    console.log("role",role)
    setLoading(true);

    let thunk;

    if (role === "Seller") {
      dispatch(getDashboardSummarySellerThunkApi((res)=>{})).unwrap().then((res)=>{
        console.log(res);
        setLoading(false)
        setDashboardData(res.data);
      }).catch((error) => {
        message.error({
          content: error,
        });
      })
    } else if (role === "Admin") {
      dispatch(getDashboardSummaryAdminThunkApi((res)=>{})).unwrap().then((res)=>{
        console.log(res);
        setLoading(false)

        setDashboardData(res.data);
      }).catch((error) => {
        message.error({
          content: error,
        });
      })
    } else {
      dispatch(getDashboardSummaryCustomerThunkApi((res)=>{})).unwrap().then((res)=>{
        console.log(res);
        setLoading(false)

        setDashboardData(res.data);
      }).catch((error) => {
        message.error({
          content: error,
        });
      })
    }
  };

  if (loading) {
    return (
      <div
        className="dashboard-loader-container"
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "80vh",
        }}
      >
        <Spin size="large" tip="Loading Enterprise Analytics..." />
      </div>
    );
  }

  // --- CHART CONFIGURATIONS ---

  // 1. Trend Line Chart Config (Uses mock chronological data if backend doesn't supply it yet)
  const trendData = dashboardData?.monthly_trends || [
    {
      month: "Jan",
      value:
        (dashboardData?.total_spend || dashboardData?.total_revenue || 0) * 0.1,
    },
    {
      month: "Feb",
      value:
        (dashboardData?.total_spend || dashboardData?.total_revenue || 0) * 0.2,
    },
    {
      month: "Mar",
      value:
        (dashboardData?.total_spend || dashboardData?.total_revenue || 0) *
        0.15,
    },
    {
      month: "Apr",
      value:
        (dashboardData?.total_spend || dashboardData?.total_revenue || 0) * 0.3,
    },
    {
      month: "May",
      value:
        (dashboardData?.total_spend || dashboardData?.total_revenue || 0) *
        0.25,
    },
    {
      month: "Jun",
      value:
        (dashboardData?.total_spend || dashboardData?.total_revenue || 0) * 1.0,
    },
  ];

  const lineConfig = {
    data: dashboardData?.monthly_trends,
    xField: "month",
    yField: "value",
    smooth: true,
    height: 300,
    point: {
      size: 5,
      shape: "diamond",
    },
    color: "#1677ff",
    tooltip: { showMarkers: true },
  };

  // 2. Pipeline Donut Chart Config
  const pipelineData = [
    { type: "Pending", value: dashboardData?.pending_orders || 0 },
    { type: "Processing", value: dashboardData?.processing_orders || 0 },
    { type: "Delivered", value: dashboardData?.delivered_orders || 0 },
    { type: "Cancelled", value: dashboardData?.cancelled_orders || 0 },
  ];

  const pieConfig = {
    appendPadding: 10,
    data: pipelineData,
    angleField: "value",
    colorField: "type",
    radius: 1,
    innerRadius: 0.6,
    height: 300,
    color: ["#faad14", "#1890ff", "#52c41a", "#ff4d4f"], // Matches pending, processing, delivered, cancelled themes
    label: {
      type: "inner",
      offset: "-50%",
      content: "{value}",
      style: { textAlign: "center", fontSize: 14 },
    },
    interactions: [{ type: "element-selected" }, { type: "element-active" }],
  };

  return (
    <ConfigProvider
      theme={{
        token: {
          colorPrimary: "#1677ff",
          borderRadius: 12,
        },
      }}
    >
      {contextHolder}
      <div
        className="dashboard-wrapper"
        style={{ padding: "24px", background: "#f5f5f5", minHeight: "100vh" }}
      >
        {/* Welcome Section */}
        <div
          className="dashboard-header-block"
          style={{ marginBottom: "24px" }}
        >
          <Title level={2} className="dashboard-title" style={{ margin: 0 }}>
            {userDetail?.username}'s Dashboard
          </Title>
          <Text className="dashboard-subtitle" type="secondary">
            Here is an enterprise overview of your platform operations and
            transaction lifecycles today.
          </Text>
        </div>

        {/* PRIMARY METRICS PANEL */}
        <Row
          gutter={[24, 24]}
          className="metrics-row"
          style={{ marginBottom: "24px" }}
        >
          <Col xs={24} sm={12} lg={8}>
            <Card
              bordered={false}
              className="dashboard-card primary-card"
              hoverable
            >
              <div
                className="card-icon-wrapper revenue-icon"
                style={{ color: "#1677ff", marginBottom: 12 }}
              >
                <DollarSign size={24} />
              </div>
              <Statistic
                title={
                  user_type === "Customer" ? "Total Spending" : "Total Revenue"
                }
                value={
                  dashboardData?.total_spend ||
                  dashboardData?.total_revenue ||
                  0
                }
                precision={2}
                suffix={
                  <span className="currency-suffix" style={{ fontSize: 14 }}>
                    {" "}
                    USD
                  </span>
                }
              />
            </Card>
          </Col>

          <Col xs={24} sm={12} lg={8}>
            <Card
              bordered={false}
              className="dashboard-card primary-card"
              hoverable
            >
              <div
                className="card-icon-wrapper orders-icon"
                style={{ color: "#52c41a", marginBottom: 12 }}
              >
                <ShoppingBag size={24} />
              </div>
              <Statistic
                title={
                  user_type === "Seller"
                    ? "Total Orders Got"
                    : user_type === "Admin"
                      ? "Total Orders"
                      : "Total Orders Created"
                }
                value={dashboardData?.total_orders || 0}
              />
            </Card>
          </Col>

          <Col xs={24} sm={12} lg={8}>
            <Card
              bordered={false}
              className="dashboard-card primary-card"
              hoverable
            >
              <div
                className="card-icon-wrapper catalog-icon"
                style={{ color: "#722ed1", marginBottom: 12 }}
              >
                <Package size={24} />
              </div>
              <Statistic
                title={
                  user_type === "Seller"
                    ? "Active Catalog Items"
                    : user_type === "Admin"
                      ? "Total Products"
                      : "Products Purchased"
                }
                value={
                  dashboardData?.total_products ||
                  dashboardData?.total_products_purchased ||
                  0
                }
              />
            </Card>
          </Col>
        </Row>

        {/* CHARTS SECTION */}
        <Row gutter={[24, 24]} style={{ marginBottom: "24px" }}>
          <Col xs={24} lg={16}>
            <Card
              bordered={false}
              title={
                user_type === "Seller"
                  ? "Revenue Growth Over Time"
                  : user_type === "Admin"
                    ? "Platform Revenue Growth"
                    : "Spending Insights"
              }
            >
              <Line {...lineConfig} />
            </Card>
          </Col>
          <Col xs={24} lg={8}>
            <Card bordered={false} title="Order Fulfillment Mix">
              <Pie {...pieConfig} />
            </Card>
          </Col>
        </Row>

        {/* PIPELINE & STATUS LIFECYCLE */}
        <div className="section-title-wrapper" style={{ marginBottom: "16px" }}>
          <Title level={4} style={{ margin: 0 }}>
            Operational Pipeline
          </Title>
        </div>

        <Row gutter={[16, 16]}>
          <Col xs={12} sm={6}>
            <Card
              bordered={false}
              className="dashboard-card status-card status-pending"
              style={{ borderLeft: "4px solid #faad14" }}
            >
              <Statistic
                title="Pending"
                value={dashboardData?.pending_orders || 0}
                prefix={
                  <Clock
                    size={16}
                    className="status-icon"
                    style={{ color: "#faad14", marginRight: 8 }}
                  />
                }
              />
            </Card>
          </Col>

          <Col xs={12} sm={6}>
            <Card
              bordered={false}
              className="dashboard-card status-card status-processing"
              style={{ borderLeft: "4px solid #1890ff" }}
            >
              <Statistic
                title="Processing"
                value={dashboardData?.processing_orders || 0}
                prefix={
                  <Activity
                    size={16}
                    className="status-icon"
                    style={{ color: "#1890ff", marginRight: 8 }}
                  />
                }
              />
            </Card>
          </Col>

          <Col xs={12} sm={6}>
            <Card
              bordered={false}
              className="dashboard-card status-card status-delivered"
              style={{ borderLeft: "4px solid #52c41a" }}
            >
              <Statistic
                title="Delivered"
                value={dashboardData?.delivered_orders || 0}
                prefix={
                  <CheckCircle2
                    size={16}
                    className="status-icon"
                    style={{ color: "#52c41a", marginRight: 8 }}
                  />
                }
              />
            </Card>
          </Col>

          <Col xs={12} sm={6}>
            <Card
              bordered={false}
              className="dashboard-card status-card status-cancelled"
              style={{ borderLeft: "4px solid #ff4d4f" }}
            >
              <Statistic
                title="Cancelled"
                value={dashboardData?.cancelled_orders || 0}
                prefix={
                  <XCircle
                    size={16}
                    className="status-icon"
                    style={{ color: "#ff4d4f", marginRight: 8 }}
                  />
                }
              />
            </Card>
          </Col>
        </Row>
      </div>
    </ConfigProvider>
  );
}
