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
  GlobalOutlined,
} from "@ant-design/icons";

import { useDispatch, useSelector } from "react-redux";
import {
  createProductThunkApi,
  destroyProductThunkApi,
  listProductThunkApi,
  retrieveProductThunkApi,
  updateProductThunkApi,
} from "../../slice/Product.Slice";
import { useNavigate } from "react-router";
import { listProductService } from "../../service/Product.Service";
const { Title, Text } = Typography;
const { RangePicker } = DatePicker;
const { Option } = Select;
import { Link } from "react-router";

export default function ProductList() {
  const [open, setOpen] = useState(false);
  const [message, contextHolder] = notification.useNotification();
  const [form] = Form.useForm();
  const [Search, setSearch] = useState("");
  const product = useSelector((state) => state.product);
  const [Page, setPage] = useState(1);
  const [PageSize, setPageSize] = useState(10);
  const [Ordering, setOrdering] = useState("");
  const [Loading, setLoading] = useState(false);
  const [productStatus, setProductStatus] = useState(null);
  const [stockStatus, setStockStatus] = useState(null);
  const [customOrdering, setCustomOrdering] = useState("");
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const handleProductList = (showLoader) => {
    if (showLoader) {
      setLoading(true);
    }
    let params = {
      search: Search,
      ordering: Ordering,
      page: Page,
      productStatus: productStatus,
      stockStatus: stockStatus,
      customOrdering: customOrdering,
      pageSize: PageSize,
    };
    dispatch(listProductThunkApi(params))
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

    if (sortField === "product_name" && sortOrder === "ascend") {
      sortingEnumKey = "product_name";
    }
    if (sortField === "product_name" && sortOrder === "descend") {
      sortingEnumKey = "-product_name";
    }
    if (sortField === "price" && sortOrder === "ascend") {
      sortingEnumKey = "price";
    }
    if (sortField === "price" && sortOrder === "descend") {
      sortingEnumKey = "-price";
    }
    if (sortField === "stock" && sortOrder === "ascend") {
      sortingEnumKey = "stock";
    }
    if (sortField === "stock" && sortOrder === "descend") {
      sortingEnumKey = "-stock";
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
    handleProductList(true);
  }, [Search, Page, PageSize, productStatus, stockStatus, customOrdering]);
  useEffect(() => {
    handleProductList(false);
  }, [Ordering]);

  

  const handleDelete = (id) => {
    dispatch(destroyProductThunkApi(id))
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
      key: "srno",
      title: "Sr.No",
      width: 80,
      align: "center",
      render: (_, record, index) => {
        return (Page - 1) * PageSize + (index + 1);
      },
    },

    {
      key: "product_name",
      title: "Product",
      sorter: true,
      width: 320,
      ellipsis: true,
      render: (_, record) => {
        const primaryImage = record.product_images?.find(
          (img) => img.is_primary,
        );

        return (
          <Space size={12}>
            <Avatar
              shape="square"
              size={50}
              src={primaryImage?.image}
              icon={<GlobalOutlined />}
            />

            <div style={{ width: 220 }}>
              <Tooltip title={record.product_name}>
                <Link
                  to={`/product-details/${record.id}`}
                  style={{
                    fontWeight: 600,
                    color: "#1677ff",
                    textDecoration: "none",
                  }}
                >
                  {record.product_name}
                </Link>
              </Tooltip>

              <div
                style={{
                  fontSize: 12,
                  color: "#8c8c8c",
                }}
              >
                Product ID: #{record.id}
              </div>
            </div>
          </Space>
        );
      },
    },

    {
      key: "brand",
      title: "Brand",

      dataIndex: "product_brand_name",
      width: 180,
      ellipsis: true,
      render: (text) => (
        <Tooltip title={text}>
          <span>{text || "-"}</span>
        </Tooltip>
      ),
    },

    {
      key: "gender",
      title: "Gender",
      dataIndex: "gender",
      width: 120,
      align: "center",
      render: (gender) => (
        <Tag color="purple">
          {gender ? gender.charAt(0).toUpperCase() + gender.slice(1) : "-"}
        </Tag>
      ),
    },

    {
      key: "price",
      title: "Price",
      sorter: true,

      dataIndex: "price",
      width: 120,
      align: "right",
      sorter: true,
      render: (price) => <Tag color="green">€ {price}</Tag>,
    },

    {
      key: "stock",
      title: "Stock",
      sorter: true,

      dataIndex: "stock",
      width: 120,
      align: "center",
      sorter: true,
      render: (stock) => (
        <Tag color={stock > 10 ? "green" : stock > 0 ? "orange" : "red"}>
          {stock}
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
      render: (date) => <Tag color="blue">{date?.split("T")[0]}</Tag>,
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
                key: "update",
                icon: <EditOutlined />,
                label: "Update",
                onClick: () => {
                  navigate(`/product-form/${record.id}/`);
                },
              },
              {
                key: "delete",
                danger: true,
                icon: <DeleteOutlined />,
                label: (
                  <Popconfirm
                    title="Delete Product?"
                    description="Are you sure you want to delete this product?"
                    onConfirm={() => handleDelete(record.id)}
                    okText="Yes"
                    cancelText="No"
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
            <h1 className="page-title">Products</h1>

            <p className="page-subtitle">
              Create, update and manage Products across the platform.
            </p>
          </div>
          <Button
            type="primary"
            size="large"
            className="add-btn"
            icon={<PlusOutlined />}
            onClick={() => {
              navigate("/product-form/");
            }}
          >
            Add Product
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
              placeholder="Search Product..."
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
                onChange={(value) => setProductStatus(value)}
              >
                <Option value={true}>Active</Option>
                <Option value={false}>InActive</Option>
              </Select>
            </Col>

            {/* Stock */}
            <Col xs={24} sm={12} md={6}>
              <Select
                size="large"
                placeholder="Stock"
                style={{ width: "100%" }}
                allowClear
                onChange={(value) => setStockStatus(value)}
              >
                <Option value="in_stock">In Stock</Option>
                <Option value="out_of_stock">Out Of Stock</Option>
              </Select>
            </Col>

            {/* Sort */}
            <Col xs={24} sm={12} md={8}>
              <Select
                size="large"
                placeholder="Sort By"
                style={{ width: "100%" }}
                allowClear
                onChange={(value) => setCustomOrdering(value)}
              >
                <Option value="price">Price Low-High</Option>
                <Option value="-price">Price High-Low</Option>
                <Option value="-created_at">Newest</Option>
                <Option value="created_at">Oldest</Option>
              </Select>
            </Col>
          </Row>
        </Card>

        {/* TABLE */}

        <Card className="table-card" title="Product List">
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
                Fetching Product data...
              </Text>
            </div>
          ) : (
            <>
              <Table
                rowKey="id"
                columns={columns}
                dataSource={product.product_data}
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
                  total={product.totalRecords}
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
