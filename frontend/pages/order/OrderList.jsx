import React, { useEffect, useState } from "react";
import {
  Row,
  Col,
  Card,
  Table,
  Button,
  Input,
  Drawer,
  Dropdown,
  Tooltip,
  Space,
  Typography,
  Select,
  Statistic,
  Avatar,
  Popconfirm,
  Tag,
  Pagination,
  Form,
  Slider,
  DatePicker,
  notification,
  Spin,
} from "antd";

import {
  PlusOutlined,
  SearchOutlined,
  ReloadOutlined,
  MoreOutlined,
  EditOutlined,
  DeleteOutlined,
  ShoppingCartOutlined,
  GlobalOutlined,
} from "@ant-design/icons";

import { useDispatch, useSelector } from "react-redux";
import {
  createOrderThunkApi,
  destroyOrderThunkApi,
  listOrderThunkApi,
  retrieveOrderThunkApi,
  updateOrderThunkApi,
} from "../../slice/Order.Slice";
import { useNavigate } from "react-router";
const { Title, Text } = Typography;
const { RangePicker } = DatePicker;
const { Option } = Select;
import { Link } from "react-router";

export default function OrderList() {
  const [open, setOpen] = useState(false);
  const [message, contextHolder] = notification.useNotification();
  const [form] = Form.useForm();
  const [Search, setSearch] = useState("");
  const order = useSelector((state) => state.order);
  const [Page, setPage] = useState(1);
  const [PageSize, setPageSize] = useState(10);
  const [Ordering, setOrdering] = useState("");
  const [Loading, setLoading] = useState(false);
  const [orderStatus, setOrderStatus] = useState(null);
  const [paymentStatus, setPaymentStatus] = useState(null);
  const user_detail=useSelector((state)=>state.user.user_detail)
  const [stockStatus, setStockStatus] = useState(null);
  const [customOrdering, setCustomOrdering] = useState("");
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const handleOrderList = (showLoader) => {
    if (showLoader) {
      setLoading(true);
    }
    let params = {
      search: Search,
      ordering: Ordering,
      page: Page,
      orderStatus: orderStatus,
      paymentStatus: paymentStatus,

      stockStatus: stockStatus,
      customOrdering: customOrdering,
      pageSize: PageSize,
    };
    dispatch(listOrderThunkApi(params))
      .unwrap()
      .then((res) => {
        if (showLoader) {
          setLoading(false);
        }
      })
      .catch((error) => {
        if (showLoader) {
          setLoading(false);
        }
        message.error({
          title: "Error",
          description: error,
        });
      });
  };

  const handleStatusChange = (order_id, value) => {
    const data = {
      status: value,
    };
    dispatch(updateOrderThunkApi({ id: order_id, data: data }))
      .unwrap()
      .then((res) => {
        message
          .success({
            title: "Success",
            description: res.message,
          })
         
      }) .catch((error) => {
            message.error({
              title: "Error",
              description: error,
            });
          });
  };

  const GetSortingEnumValue = (sortField, sortOrder) => {
    let sortingEnumKey = "";

    if (sortField === "order_number" && sortOrder === "ascend") {
      sortingEnumKey = "order_number";
    }
    if (sortField === "order_number" && sortOrder === "descend") {
      sortingEnumKey = "-order_number";
    }
    if (sortField === "status" && sortOrder === "ascend") {
      sortingEnumKey = "stock";
    }
    if (sortField === "status" && sortOrder === "descend") {
      sortingEnumKey = "-status";
    }
    if (sortField === "shipping_cost" && sortOrder === "ascend") {
      sortingEnumKey = "shipping_cost";
    }
    if (sortField === "shipping_cost" && sortOrder === "descend") {
      sortingEnumKey = "-shipping_cost";
    }
    if (sortField === "tax_amount" && sortOrder === "ascend") {
      sortingEnumKey = "tax_amount";
    }
    if (sortField === "tax_amount" && sortOrder === "descend") {
      sortingEnumKey = "-tax_amount";
    }
    if (sortField === "subtotal" && sortOrder === "ascend") {
      sortingEnumKey = "subtotal";
    }
    if (sortField === "subtotal" && sortOrder === "descend") {
      sortingEnumKey = "-subtotal";
    }
    if (sortField === "created_at" && sortOrder === "ascend") {
      sortingEnumKey = "created_at";
    }
    if (sortField === "created_at" && sortOrder === "descend") {
      sortingEnumKey = "-created_at";
    }

    console.log(sortingEnumKey);
    return sortingEnumKey;
  };
  const handleTableChange = (pagination, filters, sorter) => {
    if (sorter?.columnKey && sorter.order) {
      const orderBy = GetSortingEnumValue(sorter.columnKey, sorter.order);

      if (orderBy !== Ordering) {
        setOrdering(orderBy);
      }
    }
  };

  useEffect(() => {
    handleOrderList(true);
  }, [
    Search,
    Page,
    PageSize,
    orderStatus,
    stockStatus,
    customOrdering,
    paymentStatus,
  ]);
  useEffect(() => {
    handleOrderList(false);
  }, [Ordering]);

  const handleDelete = (id) => {
    dispatch(destroyOrderThunkApi(id))
      .unwrap()
      .then((res) => {
        message.success({
          title: "Success",
          description: res.message,
        });
      })
      .catch((error) => {
        message.error({
          title: "Error",
          description: error,
        });
      });
  };

  const columns = [
    {
      title: "Sr.No",
      key: "srno",
      width: 80,
      align: "center",
      render: (_, record, index) => (Page - 1) * PageSize + index + 1,
    },

    {
      title: "Order",
      key: "order",
      width: 260,
      sorter: true,
      data_index: "order_number",
      render: (_, record) => (
        <Space size={12}>
          <Avatar shape="square" size={50} icon={<ShoppingCartOutlined />} />

          <div>
            <Link
              to={`/order-details/${record.id}/`}
              style={{
                fontWeight: 600,
                color: "#1677ff",
                textDecoration: "none",
              }}
            >
              {record.order_number}
            </Link>

            <div
              style={{
                fontSize: 12,
                color: "#8c8c8c",
              }}
            >
              #Order Number
            </div>
          </div>
        </Space>
      ),
    },

    {
      title: "Customer",
      dataIndex: "user_username",
      key: "user_username",
      width: 120,
      sorter: true,

      align: "center",
      render: (user) => <Tag color="blue">{user || "-"}</Tag>,
    },

    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      width: 170,
      align: "center",
      render: (status, record) => (

        <>
        {user_detail?.user_type==="Admin" ? 
        (

          
          <Select
          value={status}
          style={{ width: "100%" }}
          onChange={(value) => handleStatusChange(record.id, value)}
          options={[
            { value: "Pending", label: "Pending" },
            { value: "Processing", label: "Processing" },
            { value: "Shipped", label: "Shipped" },
            { value: "Delivered", label: "Delivered" },
            { value: "Cancelled", label: "Cancelled" },
          ]}
          />
        ) :`${status}`}
          </>
      ),
    },
    {
      title: "Payment",
      dataIndex: "payment_status",
      key: "payment_status",
      width: 130,
      align: "center",
      render: (status) => (
        <Tag color={status ? "green" : "red"}>
          {status ? "Paid" : "Pending"}
        </Tag>
      ),
    },

    {
      title: "Subtotal",
      dataIndex: "subtotal",
      key: "subtotal",
      width: 120,
      align: "right",
      sorter: true,
      render: (value) => <Tag color="blue">€ {value}</Tag>,
    },

    {
      title: "Shipping",
      dataIndex: "shipping_cost",
      key: "shipping_cost",
      width: 120,
      sorter: true,

      align: "right",
      render: (value) => <Tag color="gold">€ {value}</Tag>,
    },

    {
      title: "Tax",
      dataIndex: "tax_amount",
      key: "tax_amount",
      width: 110,
      sorter: true,

      align: "right",
      render: (value) => <Tag color="purple">€ {value}</Tag>,
    },

    {
      title: "Total",
      dataIndex: "total_amount",
      key: "total_amount",
      width: 130,
      align: "right",
      sorter: true,
      render: (value) => <Tag color="green">€ {value}</Tag>,
    },

    {
      title: "Country",
      dataIndex: "country_country_name",
      key: "country",
      width: 150,
      ellipsis: true,
    },

    {
      title: "State",
      dataIndex: "state_state_name",
      key: "state",
      width: 150,
      ellipsis: true,
    },

    {
      title: "City",
      dataIndex: "city_city_name",
      key: "city",
      width: 150,
      ellipsis: true,
    },

    {
      title: "Items",
      dataIndex: "items",
      key: "items",
      width: 90,
      align: "center",
      render: (items) => <Tag color="cyan">{items?.length || 0}</Tag>,
    },

    {
      title: "Created",
      dataIndex: "created_at",
      key: "created_at",
      width: 140,
      sorter: true,
      render: (date) => <Tag color="blue">{date?.split("T")[0]}</Tag>,
    },
  ];
  return (
    <>
      {contextHolder}
      <div style={{ padding: "10px" }}>
        <div className="page-header">
          <div>
            <h1 className="page-title">Orders</h1>

            <p className="page-subtitle">
              Create, update and manage Orders across the platform.
            </p>
          </div>
        </div>
        {/* FILTERS */}

        <Card
          title="Filters"
          className="filter-card"
          extra={
            <Input
              style={{ width: 300 }}
              value={Search}
              allowClear
              prefix={<SearchOutlined />}
              placeholder="Search Order..."
              onChange={(e) => setSearch(e.target.value)}
            />
          }
        >
          <Row gutter={[16, 16]}>
            {/* Search */}

            {/* Status */}
            <Col xs={24} sm={12} md={4}>
              <Select
                size="large"
                placeholder="Order Status"
                style={{ width: "100%" }}
                allowClear
                onChange={(value) => setOrderStatus(value)}
              >
                <Option value="Pending">Pending</Option>
                <Option value="Processing">Processing</Option>
                <Option value="Shipped">Shipped</Option>
                <Option value="Delivered">Delivered</Option>
                <Option value="Cancelled">Cancelled</Option>
              </Select>
            </Col>

            <Col xs={24} sm={12} md={5}>
              <Select
                size="large"
                placeholder="Payment Status"
                style={{ width: "100%" }}
                allowClear
                onChange={(value) => setPaymentStatus(value)}
              >
                <Option value="Pending">Pending</Option>
                <Option value="Paid">Paid</Option>
                <Option value="Failed">Failed</Option>
                <Option value="Refunded">Refunded</Option>
              </Select>
            </Col>

            {/* Sort */}
            <Col xs={24} sm={12} md={6}>
              <Select
                size="large"
                placeholder="Sort By"
                style={{ width: "100%" }}
                allowClear
                onChange={(value) => setCustomOrdering(value)}
              >
                <Option value="total_amount">Price Low-High</Option>
                <Option value="-total_amount">Price High-Low</Option>
                <Option value="-created_at">Newest</Option>
                <Option value="created_at">Oldest</Option>
              </Select>
            </Col>
          </Row>
        </Card>

        {/* TABLE */}

        <Card className="table-card" title="Order List">
          {Loading ? (
            <div
              style={{
                minHeight: "60vh",
                width: "100%",
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                alignItems: "center",
                gap: "16px",
                padding: "20px",
                textAlign: "center",
              }}
            >
              <Spin size="large" className="green-spin" />

              <Text
                type="secondary"
                style={{
                  fontSize: "16px",
                  fontWeight: 500,
                }}
              >
                Fetching Order data...
              </Text>
            </div>
          ) : (
            <>
              <Table
                rowKey="id"
                columns={columns}
                dataSource={order.data}
                scroll={{ x: 600 }}
                pagination={false}
                onChange={handleTableChange}
              />
              <div
                style={{
                  display: "flex",
                  justifyContent: "flex-end",
                  marginTop: 20,
                }}
              >
                <Pagination
                  pageSize={PageSize}
                  current={Page}
                  total={order.totalRecords}
                  showTotal={(total) => `Total ${total}`}
                  pageSizeOptions={[10, 20, 30]}
                  onChange={(page, pageSize) => {
                    if (page !== Page) {
                      setPage(page);
                    }

                    if (pageSize !== PageSize) {
                      setPageSize(pageSize);
                    }
                  }}
                />
              </div>
            </>
          )}
        </Card>

        {/* DRAWER */}
      </div>
    </>
  );
}
