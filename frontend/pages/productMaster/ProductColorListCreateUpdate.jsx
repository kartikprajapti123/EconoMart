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
} from "@ant-design/icons";

import { useDispatch, useSelector } from "react-redux";
import {
  createProductColorThunkApi,
  destroyProductColorThunkApi,
  listProductColorThunkApi,
  retrieveProductColorThunkApi,
  updateProductColorThunkApi,
} from "../../slice/ProductColor.Slice";

const { Title, Text } = Typography;

export default function ProductColorListCreateUpdate() {
  const [open, setOpen] = useState(false);
  const [message, contextHolder] = notification.useNotification();
  const [form] = Form.useForm();
  const [Search, setSearch] = useState("");
  const color_data = useSelector((state) => state.productColor);
  const [Page, setPage] = useState(1);
  const [PageSize, setPageSize] = useState(10);
  const [Ordering, setOrdering] = useState("");
  const [updateId, setUpdateId] = useState(null);
  const [UpdateColor, setUpdateColor] = useState(null);
  const [Loading, setLoading] = useState(false);
  const [CreateUpdateLoading, setCreateUpdateLoading] = useState(false);
  const dispatch = useDispatch();

  const handleCreateUpdate = () => {
    setCreateUpdateLoading(true);
    if (UpdateColor) {
      dispatch(
        updateProductColorThunkApi({ id: updateId, data: form.getFieldsValue() }),
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
      dispatch(createProductColorThunkApi(form.getFieldsValue()))
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
    };
    dispatch(listProductColorThunkApi(params))
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

    if (sortField === "product_color_name" && sortOrder === "ascend") {
      sortingEnumKey = "product_color_name";
    }
    if (sortField === "product_color_name" && sortOrder === "descend") {
      sortingEnumKey = "-product_color_name";
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
  }, [Search, Page, PageSize]);
  useEffect(() => {
    handleList(false);
  }, [Ordering]);

  const handleDelete = (id) => {
    dispatch(destroyProductColorThunkApi(id))
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
    dispatch(retrieveProductColorThunkApi(id))
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
      width:70,
      render: (text, record, index) => {
        return (Page - 1) * PageSize + (index + 1);
      },
    },
    {
      key: "product_color_name",
      title: "Color Name",
      dataIndex: "product_color_name",
      sorter: true,
      width: 200,

      render: (_, record) => (
        <Space>
          <div>
            <div className="country-name">{record.product_color_name}</div>
          </div>
        </Space>
      ),
    },

    {
      key: "created_at",

      title: "Created Date",
      dataIndex: "created_at",
      width: 180,
      sorter: true,

      render: (date) => {
        let newData = date.split("T")[0];
        return <Tag color="blue">{newData}</Tag>;
      },
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
              {
                key: "Update",
                icon: <EditOutlined />,
                label: "Update",
                onClick: () => {
                  handleGetSingleData(record.id);
                  setUpdateId(record.id);
                  setUpdateColor(true);
                  setOpen(true);
                },
              },
              {
                key: "delete",
                danger: true,
                icon: <DeleteOutlined />,
                label: (
                  <Popconfirm
                    title="Delete Color?"
                    onConfirm={() => handleDelete(record.id)}
                  >
                    Delete
                  </Popconfirm>
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
            <h1 className="page-title">Product Color Management </h1>

            <p className="page-subtitle">
              Create, update and manage Product Color across the platform.
            </p>
          </div>
          <Button
                      type="primary"
                      size="large"
                      className="add-btn"
                      icon={<PlusOutlined />}
                      onClick={() => {
                        form.resetFields();
                        setUpdateColor(false);
                        setOpen(true);
                      }}
                    >
                      Add Product Color
                    </Button>
        </div>
        {/* FILTERS */}

        <Card title="Filters" className="filter-card" extra={<Input
                size="large"
                value={Search}
                allowClear
                prefix={<SearchOutlined />}
                placeholder="Search Product Color..."
                onChange={(e) => setSearch(e.target.value.toLowerCase())}
              />}>
        </Card>

        {/* TABLE */}

        <Card
          className="table-card"
          title="Product Color List"
          
        >
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
                Fetching Product Color data...
              </Text>
            </div>
          ) : (
            <>
              <Table
                rowKey="id"
                columns={columns}
                dataSource={color_data.product_color_data}
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
                  total={color_data.totalRecords}
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
          title={UpdateColor ? "Update Product Color" : "Create Product Color"}
          onClose={() => {
            setOpen(false);
                  form.resetFields();

          }}
          footer={
            <div className="drawer-footer">
              <Button onClick={() => {
                  setOpen(false);
                  form.resetFields();
                }}>Cancel</Button>

              <Button type="primary" htmlType="submit" form="country-form" loading={CreateUpdateLoading}>
                {UpdateColor ? "Update" : "Create"}
              </Button>
            </div>
          }
        >
          <Form
            id="country-form"
            layout="vertical"
            form={form}
            onFinish={handleCreateUpdate}
          >
            <Form.Item
              label="Product Color Name"
              name="product_color_name"
              rules={[
                {
                  required: true,
                },
              ]}
            >
              <Input size="large" placeholder="Enter color name" />
            </Form.Item>
          </Form>
        </Drawer>
      </div>
    </>
  );
}
