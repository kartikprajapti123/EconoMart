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
  UserOutlined,
  EyeOutlined,
  GlobalOutlined,
} from "@ant-design/icons";

import { useDispatch, useSelector } from "react-redux";
import { listUserThunkApi } from "../../slice/User.Slice";
import { useNavigate } from "react-router";
const { Title, Text } = Typography;
const { RangePicker } = DatePicker;
const { Option } = Select;

export default function UserList() {
  const [open, setOpen] = useState(false);
  const [message, contextHolder] = notification.useNotification();
  const [form] = Form.useForm();
  const [Search, setSearch] = useState("");
  const user_data = useSelector((state) => state.user);
  const [Page, setPage] = useState(1);
  const [PageSize, setPageSize] = useState(10);
  const [Ordering, setOrdering] = useState("");
  const [Loading, setLoading] = useState(false);
  const [userStatus, setUserStatus] = useState(null);
  const [customOrdering, setCustomOrdering] = useState("");
  const [userType, setUserType] = useState("");
  const [emailVerified, setEmailVerified] = useState("");

  const navigate = useNavigate();
  const dispatch = useDispatch();

  const handleUserList = (showLoader) => {
    if (showLoader) {
      setLoading(true);
    }
    let params = {
      search: Search,
      ordering: Ordering,
      page: Page,
      userStatus: userStatus,
      customOrdering: customOrdering,
      userType:userType,
    emailVerified:emailVerified,
      pageSize: PageSize,
    };
    dispatch(listUserThunkApi(params))
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

  const GetSortingEnumValue = (sortField, sortOrder) => {
    let sortingEnumKey = "";

    if (sortField === "username" && sortOrder === "ascend") {
      sortingEnumKey = "username";
    }
    if (sortField === "username" && sortOrder === "descend") {
      sortingEnumKey = "-username";
    }
    if (sortField === "email" && sortOrder === "ascend") {
      sortingEnumKey = "email";
    }
    if (sortField === "email" && sortOrder === "descend") {
      sortingEnumKey = "-email";
    }
    if (sortField === "email" && sortOrder === "ascend") {
      sortingEnumKey = "email";
    }
    if (sortField === "email" && sortOrder === "descend") {
      sortingEnumKey = "-email";
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
    handleUserList(true);
  }, [Search, Page, PageSize, userStatus, customOrdering,userType,emailVerified]);
  useEffect(() => {
    handleUserList(false);
  }, [Ordering]);

  const columns = [
    {
      key: "srno",
      title: "Sr.No",
      width: 80,
      align: "center",
      render: (_, record, index) => {
        return (Page - 1) * PageSize + (index + 1);
      },
    },

    {
      key: "user",
      title: "User",
      width: 320,
      ellipsis: true,
      render: (_, record) => (
        <Space size={12}>
          <Avatar
            shape="square"
            size={50}
            src={record?.profile_image}
            icon={<UserOutlined />}
          />

          <div style={{ width: 220 }}>
            <Tooltip title={record.username}>
              <div
                style={{
                  fontWeight: 600,
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                }}
              >
                {record.username || "-"}
              </div>
            </Tooltip>

            <Typography.Text
              type="secondary"
              style={{
                fontSize: 12,
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
                display: "block",
              }}
            >
              {record.email}
            </Typography.Text>
          </div>
        </Space>
      ),
    },

    {
      key: "phone_number",
      title: "Phone",
      dataIndex: "phone_number",
      width: 180,
      render: (phone) => phone || "-",
    },

    {
      key: "user_type",
      title: "User Type",
      dataIndex: "user_type",
      width: 140,
      align: "center",
      render: (type) => {
        const colors = {
          Customer: "blue",
          Seller: "green",
          Admin: "red",
        };

        return <Tag color={colors[type] || "default"}>{type || "-"}</Tag>;
      },
    },

    {
      key: "is_email_verified",
      title: "Email Verified",
      dataIndex: "is_email_verified",
      width: 150,
      align: "center",
      render: (verified) => (
        <Tag color={verified ? "success" : "warning"}>
          {verified ? "Verified" : "Pending"}
        </Tag>
      ),
    },

    {
      key: "is_active",
      title: "Status",
      dataIndex: "is_active",
      width: 130,
      align: "center",
      render: (active) => (
        <Tag color={active ? "success" : "error"}>
          {active ? "Active" : "Inactive"}
        </Tag>
      ),
    },

    {
      key: "created_at",
      title: "Created Date",
      dataIndex: "created_at",
      width: 150,
      sorter: true,
      render: (date) => (
        <Tag color="blue">{date ? date.split("T")[0] : "-"}</Tag>
      ),
    },

    {
      title: "Actions",
      key: "actions",
      width: 100,
      align: "center",
      fixed: "right",
      render: (_, record) => (
        <Dropdown
          trigger={["click"]}
          menu={{
            items: [
              {
                key: "view",
                icon: <EyeOutlined />,
                label: "View",
                onClick: () => navigate(`/users/${record.id}`),
              },
              {
                key: "update",
                icon: <EditOutlined />,
                label: "Update",
                onClick: () => navigate(`/user-form/${record.id}`),
              },
            ],
          }}
        >
          <Button shape="circle" icon={<MoreOutlined />} />
        </Dropdown>
      ),
    },
  ];
  return (
    <>
      {contextHolder}
      <div style={{ padding: "10px" }}>
        <div className="page-header">
          <div>
            <h1 className="page-title">Users</h1>

            <p className="page-subtitle">
              Create, update and manage users across the platform.
            </p>
          </div>
          <Button
            type="primary"
            size="large"
            className="add-btn"
            icon={<PlusOutlined />}
            onClick={() => {
              navigate("/user-form/");
            }}
          >
            Add User
          </Button>
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
              placeholder="Search User..."
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
                placeholder="Status"
                style={{ width: "100%" }}
                allowClear
                onChange={(value) => setUserStatus(value)}
              >
                <Option value={true}>Active</Option>
                <Option value={false}>InActive</Option>
              </Select>
            </Col>

            {/* Stock */}
            {/* Sort */}
            <Col xs={24} sm={12} md={6}>
              <Select
                size="large"
                placeholder="Sort By"
                style={{ width: "100%" }}
                allowClear
                onChange={(value) => setCustomOrdering(value)}
              >
                <Option value="-created_at">Newest</Option>
                <Option value="created_at">Oldest</Option>
              </Select>
            </Col>

            <Col xs={24} sm={12} md={6}>
              <Select
                size="large"
                placeholder="User Type"
                style={{ width: "100%" }}
                allowClear
                onChange={(value) => setUserType(value)}
              >
                <Option value="Customer">Customer</Option>
                <Option value="Seller">Seller</Option>
                <Option value="Admin">Admin</Option>
              </Select>
            </Col>
            <Col xs={24} sm={12} md={8}>
              <Select
                size="large"
                placeholder="Email Verification Status"
                style={{ width: "100%" }}
                allowClear
                onChange={(value) => setEmailVerified(value)}
              >
                <Option value="true">Email Verified</Option>
                <Option value="false">Not Verified</Option>
              </Select>
            </Col>
          </Row>
        </Card>

        {/* TABLE */}

        <Card className="table-card" title="User List">
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
                Fetching User data...
              </Text>
            </div>
          ) : (
            <>
              <Table
                rowKey="id"
                columns={columns}
                dataSource={user_data.user_data}
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
                  total={user_data.totalRecords}
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
