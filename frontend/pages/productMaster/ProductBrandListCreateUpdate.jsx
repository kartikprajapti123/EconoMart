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
  Upload,
} from "antd";

import {
  PlusOutlined,
  SearchOutlined,
  ReloadOutlined,
  MoreOutlined,
  EditOutlined,
  DeleteOutlined,
  UploadOutlined,
} from "@ant-design/icons";

import { useDispatch, useSelector } from "react-redux";
import {
  createProductBrandThunkApi,
  destroyProductBrandThunkApi,
  listProductBrandThunkApi,
  retrieveProductBrandThunkApi,
  updateProductBrandThunkApi,
} from "../../slice/ProductBrand.Slice";

const { Title, Text } = Typography;

export default function ProductBrandListCreateUpdate() {
  const [open, setOpen] = useState(false);
  const [message, contextHolder] = notification.useNotification();
  const [form] = Form.useForm();
  const [Search, setSearch] = useState("");
  const brand_data = useSelector((state) => state.productBrand);
  const [Page, setPage] = useState(1);
  const [PageSize, setPageSize] = useState(10);
  const [Ordering, setOrdering] = useState("");
  const [updateId, setUpdateId] = useState(null);
  const [UpdateBrand, setUpdateBrand] = useState(null);
  const [Loading, setLoading] = useState(false);
  const [CreateUpdateLoading, setCreateUpdateLoading] = useState(false);
  const [fileList, setFileList] = useState([]); // Track uploaded image files
  const dispatch = useDispatch();

  const handleCreateUpdate = () => {
    setCreateUpdateLoading(true);
    
    const formData = new FormData();
    formData.append("form_data",JSON.stringify(form.getFieldsValue()));
    
    if (fileList.length > 0 && fileList[0].originFileObj) {
      formData.append("product_brand_logo", fileList[0].originFileObj);
    }

    if (UpdateBrand) {
      dispatch(
        updateProductBrandThunkApi({ id: updateId, data: formData }),
      )
        .unwrap()
        .then((res) => {
          setCreateUpdateLoading(false);
          message.success({
            title: "Success",
            description: res.message,
          });
          setOpen(false);
        })
        .catch((error) => {
          setCreateUpdateLoading(false);
          message.error({
            title: "Error",
            description: error,
          });
        });
    } else {
      dispatch(createProductBrandThunkApi(formData))
        .unwrap()
        .then((res) => {
          setCreateUpdateLoading(false);
          message.success({
            title: "Success",
            description: res.message,
          });
          form.resetFields();
          setFileList([]);
          setOpen(false);
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
    dispatch(listProductBrandThunkApi(params))
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

    if (sortField === "product_brand_name" && sortOrder === "ascend") {
      sortingEnumKey = "product_brand_name";
    }
    if (sortField === "product_brand_name" && sortOrder === "descend") {
      sortingEnumKey = "-product_brand_name";
    }
    if (sortField === "created_at" && sortOrder === "ascend") {
      sortingEnumKey = "created_at";
    }
    if (sortField === "created_at" && sortOrder === "descend") {
      sortingEnumKey = "-created_at";
    }

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
    dispatch(destroyProductBrandThunkApi(id))
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
    dispatch(retrieveProductBrandThunkApi(id))
      .unwrap()
      .then((res) => {
        form.setFieldsValue({
          product_brand_name: res.data.product_brand_name
        });
        // Handle displaying the existing logo inside the upload section
        if (res.data.product_brand_logo) {
          setFileList([
            {
              uid: "-1",
              name: "Current Logo",
              status: "done",
              url: res.data.product_brand_logo,
            },
          ]);
        } else {
          setFileList([]);
        }
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
      key: "product_brand_logo",
      title: "Logo",
      dataIndex: "product_brand_logo",
      width: 100,
      render: (logoUrl) => (
        <Avatar 
          shape="square" 
          size={40} 
          src={logoUrl} 
          icon={<UploadOutlined />} 
        />
      ),
    },
    {
      key: "product_brand_name",
      title: "Brand Name",
      dataIndex: "product_brand_name",
      sorter: true,
      width: 200,
      render: (_, record) => (
        <Space>
          <div>
            <div className="country-name">{record.product_brand_name}</div>
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
        let newData = date ? date.split("T")[0] : "";
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
                  setUpdateBrand(true);
                  setOpen(true);
                },
              },
              {
                key: "delete",
                danger: true,
                icon: <DeleteOutlined />,
                label: (
                  <Popconfirm
                    title="Delete Brand?"
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

  // Restrict file upload array mutations to a single file rule
  const onUploadChange = ({ fileList: newFileList }) => {
    setFileList(newFileList.slice(-1));
  };

  return (
    <>
      {contextHolder}
      <div style={{ padding: "10px" }}>
        <div className="page-header">
          <div>
            <h1 className="page-title">Product Brand Management</h1>
            <p className="page-subtitle">
              Create, update and manage Product Brand across the platform.
            </p>
          </div>
          <Button
            type="primary"
            size="large"
            className="add-btn"
            icon={<PlusOutlined />}
            onClick={() => {
              form.resetFields();
              setFileList([]);
              setUpdateBrand(false);
              setOpen(true);
            }}
          >
            Add Product Brand
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
              placeholder="Search Product Brand..."
              onChange={(e) => setSearch(e.target.value.toLowerCase())}
            />
          }
        />

        {/* TABLE */}
        <Card className="table-card" title="Product Brand List">
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
              <Text type="secondary" style={{ fontSize: "16px", fontWeight: 500 }}>
                Fetching Product Brand data...
              </Text>
            </div>
          ) : (
            <>
              <Table
                rowKey="id"
                columns={columns}
                dataSource={brand_data.product_brand_data}
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
                  total={brand_data.totalRecords}
                  showTotal={(total) => `Total ${total}`}
                  pageSizeOptions={[10, 20, 30]}
                  onChange={(page, pageSize) => {
                    if (page !== Page) setPage(page);
                    if (pageSize !== PageSize) setPageSize(pageSize);
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
          title={UpdateBrand ? "Update Product Brand" : "Create Product Brand"}
          onClose={() => {
            setOpen(false);
            form.resetFields();
            setFileList([]);
          }}
          footer={
            <div className="drawer-footer">
              <Button onClick={() => {
                setOpen(false);
                form.resetFields();
                setFileList([]);
              }}>
                Cancel
              </Button>
              <Button type="primary" htmlType="submit" form="brand-form" loading={CreateUpdateLoading}>
                {UpdateBrand ? "Update" : "Create"}
              </Button>
            </div>
          }
        >
          <Form
            id="brand-form"
            layout="vertical"
            form={form}
            onFinish={handleCreateUpdate}
          >
            <Form.Item
              label="Product Brand Name"
              name="product_brand_name"
              rules={[
                {
                  required: true,
                  message: "Please enter brand name",
                },
              ]}
            >
              <Input size="large" placeholder="Enter brand name" />
            </Form.Item>

            <Form.Item
              label="Product Brand Logo"
            >
              <Upload
               accept="image/*"
                beforeUpload={() => false} // Stops instant auto-upload to server
                fileList={fileList}
                onChange={onUploadChange}
                listType="picture"
                maxCount={1}
              >
                <Button icon={<UploadOutlined />} size="large" style={{ width: "100%" }}>
                  Select Brand Logo Image
                </Button>
              </Upload>
            </Form.Item>
          </Form>
        </Drawer>
      </div>
    </>
  );
}