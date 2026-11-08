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
  Select,
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
  createStateThunkApi,
  destroyStateThunkApi,
  listStateThunkApi,
  retrieveStateThunkApi,
  updateStateThunkApi,
} from "../../slice/State.Slice";
import { listCountryThunkApi } from "../../slice/Country.Slice";

const { Title, Text } = Typography;

export default function StateListCreateUpdate() {
  const [open, setOpen] = useState(false);
  const [message, contextHolder] = notification.useNotification();
  const [form] = Form.useForm();
  const [Search, setSearch] = useState("");
  const state_data = useSelector((state) => state.state);
  const [Page, setPage] = useState(1);
  const [PageSize, setPageSize] = useState(10);
  const [Ordering, setOrdering] = useState("");
  const [updateId, setUpdateId] = useState(null);
  const [UpdateState, setUpdateState] = useState(null);
  const [Loading, setLoading] = useState(false);
  const [CreateUpdateLoading, setCreateUpdateLoading] = useState(false);
  const dispatch = useDispatch();
  const country_data = useSelector((state) => state.country.data);
  const [selectedCountry, setSelectedCountry] = useState();

  const handleCreateUpdate = () => {
    setCreateUpdateLoading(true);
    if (UpdateState) {
      dispatch(
        updateStateThunkApi({ id: updateId, data: form.getFieldsValue() }),
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
      dispatch(createStateThunkApi(form.getFieldsValue()))
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

  const handleStateList = (showLoader) => {
    if (showLoader) {
      setLoading(true);
    }
    let params = {
      search: Search,
      ordering: Ordering,
      page: Page,
      pageSize: PageSize,
    };
    if (selectedCountry) {
      params["country_name"] = selectedCountry;
    }
    dispatch(listStateThunkApi(params))
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

    if (sortField === "name" && sortOrder === "ascend") {
      sortingEnumKey = "name";
    }
    if (sortField === "name" && sortOrder === "descend") {
      sortingEnumKey = "-name";
    }
    if (sortField === "country__name" && sortOrder === "ascend") {
      sortingEnumKey = "country__name";
    }
    if (sortField === "country__name" && sortOrder === "descend") {
      sortingEnumKey = "-country__name";
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
    handleStateList(true);
  }, [Search, Page, PageSize, selectedCountry]);
  useEffect(() => {
    handleStateList(false);
  }, [Ordering]);
  useEffect(() => {
    handelGetCountryData();
  }, []);

  const handleDelete = (id) => {
    dispatch(destroyStateThunkApi(id))
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
    dispatch(retrieveStateThunkApi(id))
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

  const handelGetCountryData = () => {
    dispatch(listCountryThunkApi())
      .unwrap()

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
      render: (text, record, index) => {
        return (Page - 1) * PageSize + (index + 1);
      },
    },
    {
      key: "name",
      title: "State",
      dataIndex: "name",
      sorter: true,
      width: 200,

      render: (_, record) => (
        <Space>
          <Avatar icon={<GlobalOutlined />} className="State-avatar" />

          <div>
            <div className="State-name">{record.name}</div>
          </div>
        </Space>
      ),
    },

    {
      key: "country__name",

      title: "Country",
      dataIndex: "country_name",
      width: 180,
      sorter: true,
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

    ,
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
                  console.log(record.id);
                  handleGetSingleData(record.id);
                  setUpdateId(record.id);
                  setUpdateState(true);
                  setOpen(true);
                },
              },
              {
                key: "delete",
                danger: true,
                icon: <DeleteOutlined />,
                label: (
                  <Popconfirm
                    title="Delete State?"
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
            <h1 className="page-title">State</h1>

            <p className="page-subtitle">
              Create, update and manage State across the platform.
            </p>
          </div>
          <Button
            type="primary"
            size="large"
            className="add-btn"
            icon={<PlusOutlined />}
            onClick={() => {
              form.resetFields();
              setUpdateState(false);
              setOpen(true);
            }}
          >
            Add State
          </Button>
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
              placeholder="Search State..."
              onChange={(e) => setSearch(e.target.value)}
            />
          }
        >
          <Row gutter={16}>
            <Col xs={24} md={8}>
              <Select
                size="large"
                allowClear
                placeholder="Select Country"
                style={{ width: "100%" }}
                value={selectedCountry}
                onChange={(value, option) => {
                  setSelectedCountry(option?.label || null);
                }}
                options={country_data.map((country) => ({
                  label: country.name,
                  value: country.id,
                }))}
              />
            </Col>
          </Row>
        </Card>

        {/* TABLE */}

        <Card className="table-card" title="State List">
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
                dataSource={state_data.data}
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
                  total={state_data.totalRecords}
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
          title={UpdateState ? "Update State" : "Create State"}
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
                form="State-form"
                loading={CreateUpdateLoading}
              >
                {UpdateState ? "Update" : "Create"}
              </Button>
            </div>
          }
        >
          <Form
            id="State-form"
            layout="vertical"
            form={form}
            onFinish={handleCreateUpdate}
          >
            <Form.Item
              label="State Name"
              name="name"
              rules={[
                {
                  required: true,
                  message: "Please enter state name",
                },
              ]}
            >
              <Input size="large" placeholder="Enter state name" />
            </Form.Item>
            <Form.Item
              label="Country"
              name="country"
              rules={[
                {
                  required: true,
                  message: "Please select a country",
                },
              ]}
            >
              <Select
                size="large"
                placeholder="Select country"
                showSearch
                optionFilterProp="label"
                options={country_data.map((item) => ({
                  value: item.id,
                  label: item.name,
                }))}
              />
            </Form.Item>
          </Form>
        </Drawer>
      </div>
    </>
  );
}
