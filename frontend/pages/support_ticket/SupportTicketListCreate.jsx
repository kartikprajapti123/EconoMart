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
  Space,
  Typography,
  Select,
  Statistic,
  Avatar,
  Popconfirm,
  Tag,
  Pagination,
  Form,
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
  GlobalOutlined,
  FundViewOutlined,
  EyeOutlined,
} from "@ant-design/icons";

import { useDispatch, useSelector } from "react-redux";
import {
  createSupportTicketThunkApi,
  destroySupportTicketThunkApi,
  listSupportTicketThunkApi,
  retrieveSupportTicketThunkApi,
  updateSupportTicketThunkApi,
} from "../../slice/SupportTicket.Slice";
import { hasPermission } from "../../src/utils/Permission";
import { Link } from "react-router";

const { Title, Text } = Typography;

export default function SupportTicketListCreate() {
  const [open, setOpen] = useState(false);
  const user_detail = useSelector((state) => state.user.user_detail);

  const [message, contextHolder] = notification.useNotification();
  const [form] = Form.useForm();
  const [Search, setSearch] = useState("");
  const supportTicket = useSelector((state) => state.supportTicket);
  const [Page, setPage] = useState(1);
  const [PageSize, setPageSize] = useState(10);
  const [Ordering, setOrdering] = useState("");
  const [updateId, setUpdateId] = useState(null);
  const [UpdateSupportTicket, setUpdateSupportTicket] = useState(null);
  const [Loading, setLoading] = useState(false);
  const [CreateUpdateLoading, setCreateUpdateLoading] = useState(false);
  const [issueType, setIssueType] = useState();
  const [status, setStatus] = useState();

  const dispatch = useDispatch();

  const handleCreateUpdate = () => {
    setCreateUpdateLoading(true);
    if (UpdateSupportTicket) {
      dispatch(
        updateSupportTicketThunkApi({
          id: updateId,
          data: form.getFieldsValue(),
        }),
      )
        .unwrap()
        .then((res) => {
          setCreateUpdateLoading(false);
          message.success({
            title: "Success",
            description: res.message,
          });
        })
        .catch((error) => {
          setCreateUpdateLoading(false);
          message.error({
            title: "Error",
            description: error,
          });
        });
    } else {
      dispatch(createSupportTicketThunkApi(form.getFieldsValue()))
        .unwrap()
        .then((res) => {
          setCreateUpdateLoading(false);
          message.success({
            title: "Success",
            description: res.message,
          });
          form.resetFields();
        })
        .catch((error) => {
          setCreateUpdateLoading(false);
          message.error({
            title: "Error",
            description: error,
          });
        });
    }
  };

  const handleList = (showLoader) => {
    if (showLoader) {
      setLoading(true);
    }
    let params = {
      search: Search,
      ordering: Ordering,
      page: Page,
      pageSize: PageSize,
      issueType: issueType,
      status: status,
    };
    dispatch(listSupportTicketThunkApi(params))
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
        message.Error({
          title: "Error",
          description: error,
        });
      });
  };

  const GetSortingEnumValue = (sortField, sortOrder) => {
    let sortingEnumKey = "";

    if (sortField === "subject" && sortOrder === "ascend") {
      sortingEnumKey = "subject";
    }
    if (sortField === "subject" && sortOrder === "descend") {
      sortingEnumKey = "-subject";
    }
    if (sortField === "status" && sortOrder === "ascend") {
      sortingEnumKey = "status";
    }
    if (sortField === "status" && sortOrder === "descend") {
      sortingEnumKey = "-status";
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
    handleList(true);
  }, [Search, Page, PageSize, issueType, status]);
  useEffect(() => {
    handleList(false);
  }, [Ordering]);

  const handleDelete = (id) => {
    dispatch(destroySupportTicketThunkApi(id))
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

  const handleGetSingleData = (id) => {
    dispatch(retrieveSupportTicketThunkApi(id))
      .unwrap()
      .then((res) => {
        form.setFieldsValue(res.data);
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
      key: "srno",
      title: "Sr.No",
      width: 70,
      render: (_, record, index) => (Page - 1) * PageSize + (index + 1),
    },

    {
      title: "User",
      dataIndex: "username", // Adjust according to your serializer
      key: "username",
      width: 180,
      render: (_, record) => (
        <Space>
          <Avatar src={record.profile_image}>
            {record.username?.charAt(0)?.toUpperCase()}
          </Avatar>
          <span>{record.username}</span>
        </Space>
      ),
    },

    {
      title: "Issue Type",
      dataIndex: "issue_type",
      key: "issue_type",
      width: 140,
      render: (type) => <Tag color="purple">{type}</Tag>,
    },

    {
      title: "Subject",
      dataIndex: "subject",
      key: "subject",
      width: 300,
      sorter: true,
      ellipsis: true,
    },

    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      width: 140,
      sorter: true,
      render: (status) => {
        const colors = {
          Open: "blue",
          "In Progress": "orange",
          Resolved: "green",
          Closed: "red",
        };

        return <Tag color={colors[status]}>{status}</Tag>;
      },
    },

    {
      title: "Created Date",
      dataIndex: "created_at",
      key: "created_at",
      width: 170,
      sorter: true,
      render: (date) => <Tag color="geekblue">{date.split("T")[0]}</Tag>,
    },

    {
      title: "Actions",
      width: 100,
      align: "center",
      fixed: "right",
      render: (_, record) => (
        <Dropdown
          trigger={["click"]}
          menu={{
            items: [
              ...(hasPermission(user_detail, "support_request.change_supportticketmodel")

                ? [
                    {
                      key: "update",
                      icon: <EditOutlined />,
                      label: "Update",
                      onClick: () => {
                        handleGetSingleData(record.id);
                        setUpdateId(record.id);
                        setUpdateSupportTicket(true);
                        setOpen(true);
                      },
                    },
                    {
                key: "delete",
                danger: true,
                icon: <DeleteOutlined />,
                label: (
                  <Popconfirm
                    title="Delete Support Ticket?"
                    onConfirm={() => handleDelete(record.id)}
                  >
                    Delete
                  </Popconfirm>
                ),
              },
                  ]
                : []),

              {
                key: "view",
                icon: <EyeOutlined style={{ fontSize: "16px" }} />,
                label: (
                  <Link to={`/support-ticket-message/${record.id}`}
                  > View Messages
                  </Link>
                ),
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
            <h1 className="page-title">Support Tickets</h1>

            <p className="page-subtitle">
              {" "}
              Submit a request for help, report an issue, or ask a question.
              Track the status of your requests here.{" "}
            </p>
          </div>
          {(user_detail.user_type!=="Admin")
           && (
            <Button
              type="primary"
              size="large"
              className="add-btn"
              icon={<PlusOutlined />}
              onClick={() => {
                form.resetFields();
                setUpdateSupportTicket(false);
                setOpen(true);
              }}
            >
              Add Support Ticket
            </Button>
          )}
        </div>
        {/* FILTERS */}
        <Card
          title="Filters"
          className="filter-card"
          extra={
            <Input
              size="large"
              value={Search}
              allowClear
              prefix={<SearchOutlined />}
              placeholder="Search Support Ticket..."
              onChange={(e) => setSearch(e.target.value)}
            />
          }
        >
          <Row gutter={16}>
            <Col xs={24} md={6}>
              <Select
                size="large"
                allowClear
                placeholder="Filter by Issue Type"
                style={{ width: "100%" }}
                onChange={(value) => {
                  setIssueType(value);
                }}
                options={[
                  { label: "Account", value: "Account" },
                  { label: "Order", value: "Order" },
                  { label: "Payment", value: "Payment" },
                  { label: "Product", value: "Product" },
                  { label: "Bug Report", value: "Bug" },
                  { label: "Other", value: "Other" },
                ]}
              />
            </Col>
            <Col xs={24} md={6}>
              <Select
                size="large"
                allowClear
                placeholder="Filter by Status"
                style={{ width: "100%" }}
                onChange={(value) => {
                  setStatus(value);
                }}
                options={[
                  { label: "Open", value: "Open" },
                  { label: "In Progress", value: "In Progress" },
                  { label: "Resolved", value: "Resolved" },
                  { label: "Closed", value: "Closed" },
                ]}
              />
            </Col>
          </Row>
        </Card>

        {/* TABLE */}

        <Card className="table-card" title="Support Ticket List">
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
                Fetching user data...
              </Text>
            </div>
          ) : (
            <>
              <Table
                rowKey="id"
                columns={columns}
                dataSource={supportTicket.data}
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
                  total={supportTicket.totalRecords}
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

        <Drawer
          width={500}
          open={open}
          destroyOnClose
          title={
            UpdateSupportTicket
              ? "Update Support Ticket"
              : "Create Support Ticket"
          }
          onClose={() => {
            setOpen(false);
            form.resetFields();
          }}
          footer={
            <div className="drawer-footer">
              <Button
                onClick={() => {
                  setOpen(false);
                  form.resetFields();
                }}
              >
                Cancel
              </Button>

              <Button
                type="primary"
                htmlType="submit"
                form="supportTicket-form"
                loading={CreateUpdateLoading}
              >
                {UpdateSupportTicket ? "Update" : "Create"}
              </Button>
            </div>
          }
        >
          <Form
            id="supportTicket-form"
            layout="vertical"
            form={form}
            onFinish={handleCreateUpdate}
          >
            <Form.Item
              label="Issue Type"
              name="issue_type"
              rules={[
                {
                  required: true,
                  message: "Please select an issue type.",
                },
              ]}
            >
              <Select
                size="large"
                placeholder="Select issue type"
                options={[
                  { label: "Account", value: "Account" },
                  { label: "Order", value: "Order" },
                  { label: "Payment", value: "Payment" },
                  { label: "Product", value: "Product" },
                  { label: "Bug Report", value: "Bug" },
                  { label: "Other", value: "Other" },
                ]}
              />
            </Form.Item>

            <Form.Item
              label="Subject"
              name="subject"
              rules={[
                {
                  required: true,
                  message: "Please enter a subject.",
                },
              ]}
            >
              <Input
                size="large"
                placeholder="Enter the subject"
                maxLength={255}
              />
            </Form.Item>

            <Form.Item
              label="Status"
              name="status"
              initialValue="Open"
              rules={[
                {
                  required: true,
                  message: "Please select a status.",
                },
              ]}
            >
              <Select
                size="large"
                options={[
                  ...(UpdateSupportTicket
                    ? [
                        { label: "In Progress", value: "In Progress" },
                        { label: "Resolved", value: "Resolved" },
                        { label: "Closed", value: "Closed" },
                      ]
                    : [{ label: "Open", value: "Open" }]),
                ]}
              />
            </Form.Item>
          </Form>
        </Drawer>
      </div>
    </>
  );
}
