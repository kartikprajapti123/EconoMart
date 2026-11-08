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
  Select,
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
  createCityThunkApi,
  destroyCityThunkApi,
  listCityThunkApi,
  retrieveCityThunkApi,
  updateCityThunkApi,
} from "../../slice/City.Slice";
import { listCountryThunkApi } from "../../slice/Country.Slice";
import { listStateThunkApi } from "../../slice/State.Slice";
const { Title, Text } = Typography;

export default function CityListCreateUpdate() {
  const [open, setOpen] = useState(false);
  const [message, contextHolder] = notification.useNotification();
  const [form] = Form.useForm();
  const [Search, setSearch] = useState("");
  const city = useSelector((state) => state.city);
  const [Page, setPage] = useState(1);
  const [PageSize, setPageSize] = useState(10);
  const [Ordering, setOrdering] = useState("");
  const [updateId, setUpdateId] = useState(null);
  const [UpdateCity, setUpdateCity] = useState(null);
  const [Loading, setLoading] = useState(false);
  const [CreateUpdateLoading, setCreateUpdateLoading] = useState(false);
  const [stateData, setStateData] = useState([]);
  const country_data = useSelector((state) => state.country.data);
  const [selectedCountry, setSelectedCountry] = useState();
  const [selectedState, setSelectedState] = useState();

  const dispatch = useDispatch();

  const handleCreateUpdate = () => {
    setCreateUpdateLoading(true);
    if (UpdateCity) {
      dispatch(
        updateCityThunkApi({ id: updateId, data: form.getFieldsValue() }),
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
      dispatch(createCityThunkApi(form.getFieldsValue()))
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
    if (selectedState) {
      params["state_name"] = selectedState;
    }
    if (selectedCountry) {
      params["country_name"] = selectedCountry;
    }
    dispatch(listCityThunkApi(params))
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

    if (sortField === "name" && sortOrder === "ascend") {
      sortingEnumKey = "name";
    }
    if (sortField === "name" && sortOrder === "descend") {
      sortingEnumKey = "-name";
    }
    if (sortField === "state__country__name" && sortOrder === "ascend") {
      sortingEnumKey = "state__country__name";
    }
    if (sortField === "state__country__name" && sortOrder === "descend") {
      sortingEnumKey = "-state__country__name";
    }
    if (sortField === "state__name" && sortOrder === "ascend") {
      sortingEnumKey = "state__name";
    }
    if (sortField === "state__name" && sortOrder === "descend") {
      sortingEnumKey = "-state__name";
    }

    if (sortField === "name" && sortOrder === "ascend") {
      sortingEnumKey = "name";
    }
    if (sortField === "name" && sortOrder === "descend") {
      sortingEnumKey = "-name";
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
  }, [Search, Page, PageSize, selectedCountry, selectedState]);
  useEffect(() => {
    handleList(false);
  }, [Ordering]);
  useEffect(() => {
    handelCountryList();
  }, []);

  const handleDelete = (id) => {
    dispatch(destroyCityThunkApi(id))
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
    dispatch(retrieveCityThunkApi(id))
      .unwrap()
      .then((res) => {
        handelStateList(res.data.country_name);
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
      render: (text, record, index) => {
        return (Page - 1) * PageSize + (index + 1);
      },
    },
    {
      key: "name",
      title: "City",
      dataIndex: "name",
      sorter: true,
      width: 200,

      render: (_, record) => (
        <Space>
          <Avatar icon={<GlobalOutlined />} className="City-avatar" />

          <div>
            <div className="City-name">{record.name}</div>
          </div>
        </Space>
      ),
    },
    {
      key: "state__country__name",

      title: "Country",
      dataIndex: "country_name",
      width: 180,
      sorter: true,
    },
    {
      key: "state__name",

      title: "State",
      dataIndex: "state_name",
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

                  setUpdateCity(true);
                  setOpen(true);
                },
              },
              {
                key: "delete",
                danger: true,
                icon: <DeleteOutlined />,
                label: (
                  <Popconfirm
                    title="Delete City?"
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

  const handelCountryList = () => [
    dispatch(listCountryThunkApi())
      .unwrap()
      .then((res) => {})
      .catch((error) => {
        message.error({
          title: "Error",
          description: error,
        });
      }),
  ];

  const handelStateList = (country_name) => {
    let params = {
      country_name: country_name,
      no_pagination: true,
    };
    console.log(country_name);
    dispatch(listStateThunkApi(params))
      .unwrap()
      .then((res) => {
        setStateData(res.data);
      })
      .catch((error) => {
        message.error({
          title: "Error",
          description: error,
        });
      });
  };

  return (
    <>
      {contextHolder}
      <div style={{ padding: "10px" }}>
        <div className="page-header">
          <div>
            <h1 className="page-title">Cities</h1>
            <p className="page-subtitle">
              Manage city records and location data.
            </p>
          </div>

          <Button
            type="primary"
            size="large"
            className="add-btn"
            icon={<PlusOutlined />}
            onClick={() => {
              form.resetFields();
              setUpdateCity(false);
              setOpen(true);
            }}
          >
            Add City
          </Button>
        </div>
        {/* FILTERS */}

        <Card title="Filters" className="filter-card" extra={<Input
                size="large"
                value={Search}
                allowClear
                prefix={<SearchOutlined />}
                placeholder="Search City..."
                onChange={(e) => setSearch(e.target.value)}
              />}>
          <Row gutter={16}>
            <Col xs={24} md={8}>
              <Select
                size="large"
                allowClear
                placeholder="Select Country"
                style={{ width: "100%" }}
                value={selectedCountry}
                onChange={(value, option) => {
                  if (option) {
                    setSelectedCountry(option.label);
                    handelStateList(option.label);
                  } else {
                    setSelectedCountry(null);
                    setSelectedState(null);
                    setStateData([]);
                  }
                }}
                options={country_data.map((country) => ({
                  label: country.name,
                  value: country.id,
                }))}
              />
            </Col>
            <Col xs={24} md={8}>
              <Select
                size="large"
                allowClear
                placeholder="Select State"
                style={{ width: "100%" }}
                value={selectedState}
                disabled={stateData.length == 0 ? true : false}
                onChange={(value, option) => {
                  if (option) {
                    setSelectedState(option.label);
                  } else {
                    setSelectedState(null);
                  }
                }}
                options={stateData.map((country) => ({
                  label: country.name,
                  value: country.id,
                }))}
              />
            </Col>
          </Row>
        </Card>

        {/* TABLE */}

        <Card className="table-card" title="Cities List">
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
                dataSource={city.data}
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
                  total={city.totalRecords}
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
          title={UpdateCity ? "Update City" : "Create City"}
          onClose={() => {
            setOpen(false);
            setStateData([]);
            form.resetFields();
          }}
          footer={
            <div className="drawer-footer">
              <Button
                onClick={() => {
                  setOpen(false);
                  setStateData([]);
                  form.resetFields();
                }}
              >
                Cancel
              </Button>

              <Button
                type="primary"
                htmlType="submit"
                form="City-form"
                loading={CreateUpdateLoading}
              >
                {UpdateCity ? "Update" : "Create"}
              </Button>
            </div>
          }
        >
          <Form
            id="City-form"
            layout="vertical"
            form={form}
            onFinish={handleCreateUpdate}
          >
            <Form.Item
              label="Name"
              name="name"
              rules={[
                {
                  required: true,
                },
              ]}
            >
              <Input size="large" placeholder="Enter City name" />
            </Form.Item>
            <Form.Item
              label="Country"
              name="country"
              rules={[
                {
                  required: true,
                },
              ]}
            >
              <Select
                size="large"
                placeholder="Select country"
                optionFilterProp="label"
                options={country_data.map((item) => ({
                  value: item.id,
                  label: item.name,
                }))}
                onChange={(value, option) => {
                  form.resetFields(["state"]);
                  handelStateList(option.label);
                }}
              />
            </Form.Item>
            <Form.Item
              label="State"
              name="state"
              rules={[
                {
                  required: true,
                },
              ]}
            >
              <Select
                size="large"
                placeholder="Select State"
                disabled={stateData.length === 0}
                optionFilterProp="label"
                options={stateData.map((item) => ({
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
