import React, { useEffect, useState } from "react";
import {
  Form,
  Input,
  InputNumber,
  Select,
  Switch,
  Button,
  Upload,
  Checkbox,
  Row,
  Col,
  Card,
  Space,
  Collapse,
  Divider,
  message,
  notification,
} from "antd";
import {
  InboxOutlined,
  SaveOutlined,
  CloseOutlined,
  FileTextOutlined,
  BlockOutlined,
  TagsOutlined,
  PictureOutlined,
} from "@ant-design/icons";
import { createProductThunkApi } from "../../slice/Product.Slice";
import { useDispatch, useSelector } from "react-redux";
import { listProductBrandThunkApi } from "../../slice/ProductBrand.Slice";
import { listProductColorThunkApi } from "../../slice/ProductColor.Slice";
import { listProductSizeThunkApi } from "../../slice/ProductSize.Slice";
import { retrieveProductThunkApi } from "../../slice/Product.Slice";
import { updateProductThunkApi } from "../../slice/Product.Slice";

import { useParams } from "react-router";
const { TextArea } = Input;
const { Panel } = Collapse;

export default function ProductCreateUpdate() {
  const [form] = Form.useForm();
  const [message, contextHolder] = notification.useNotification();
  const [loading, setLoading] = useState(false);
  const dispatch = useDispatch();
  const brand_data = useSelector((state) => state.productBrand);
  const color_data = useSelector((state) => state.productColor);
  const size_data = useSelector((state) => state.productSize);

  const params = useParams();
  const [isUpdate, setIsUpdate] = useState(false);
  const [updateId, setUpdateId] = useState(null);
  const [fileList, setFileList] = useState([]); // existing images
  const [newImages, setNewImages] = useState([]);

  const retrieveProduct = (id) => {
    dispatch(retrieveProductThunkApi(id))
      .unwrap()
      .then((res) => {
        const data = {
          ...res.data,
          product_sizes: res.data.product_sizes.map((size) => size.id),
          product_colors: res.data.product_colors.map((color) => color.id),
        };
        form.setFieldsValue(data);

        const uploadFiles = res.data.product_images.map((img) => ({
          uid: `existing-${img.id}`,
          id: img.id,
          name: img.image.split("/").pop(),
          status: "done",
          url: img.image,
        }));

        setFileList(uploadFiles);
      })
      .catch((error) => {
        message.error({
          content: error,
        });
      });
  };
  const handleUploadChange = ({ file, fileList }) => {
    console.log("fileList", fileList);

    fileList.forEach((file) => {
      console.log("originFileObj", file.originFileObj);
      console.log("is File", file.originFileObj instanceof File);
    });

    const uploadedFiles = fileList.filter(
      (item) => !item.id && item.originFileObj,
    );

    setNewImages(uploadedFiles);
  };
  const handleRemove = (file) => {
    if (file.id) {
      setFileList((prev) => prev.filter((img) => img.id !== file.id));
    } else {
      setNewImages((prev) => prev.filter((img) => img.uid !== file.uid));
    }
  };

  const uploadFileList = [...fileList, ...newImages];
  const onFinish = () => {
    setLoading(true);
    if (isUpdate) {
      const formData = new FormData();
      const form_data = form.getFieldsValue();
      form_data.product_images = fileList.map((image) => image.id);
      formData.append("form_data", JSON.stringify(form_data));
      newImages.forEach((file) => {
        if (file.originFileObj) {
          formData.append("new_images", file.originFileObj);
        }
      });

      dispatch(updateProductThunkApi({id:updateId,data:formData}))
        .unwrap()
        .then((res) => {
          setLoading(false);

          message.success({
            title: "success",
            description:res.message
          });

        })
        .catch((error) => {
          setLoading(false);

          message.error({
            title: "Error",
            description:error
          });
        });
    } else {
      console.log(
        "files",
        newImages.map((image) => image.originFileObj),
      );

      const formData = new FormData();

      formData.append("form_data", JSON.stringify(form.getFieldsValue()));
      newImages.forEach((file) => {
        if (file.originFileObj) {
          formData.append("product_images", file.originFileObj);
        }
      });
      dispatch(createProductThunkApi(formData))
        .unwrap()
        .then((res) => {
          setLoading(false);
          message.success({
            title: "Success",
            description: res.message,
          });
          form.resetFields();
          setNewImages([]);
        })
        .catch((error) => {
          setLoading(false);
          message.error({
            title: "Error",
            description: error,
          });
        });
    }
  };

  const listBrand = () => {
    const params = {
      no_pagination: true,
    };
    dispatch(listProductBrandThunkApi(params))
      .unwrap()
      .then((res) => {})
      .catch((error) => {
        message.error({
          title: "Error",
          description: error,
        });
      });
  };
  const listColor = () => {
    const params = {
      no_pagination:true,
    };
    dispatch(listProductColorThunkApi( params ))
      .unwrap()
      .then((res) => {})
      .catch((error) => {
        message.error({
          title: "Error",
          description: error,
        });
      });
  };
  const listSize = () => {
    const params = {
      no_pagination: true,
    };
    dispatch(listProductSizeThunkApi(params))
      .unwrap()
      .then((res) => {})
      .catch((error) => {
        message.error({
          title: "Error",
          description: error,
        });
      });
  };

  useEffect(() => {
    listBrand();
    listColor();
    listSize();
    if (params.id) {
      setIsUpdate(true);
      setUpdateId(params.id);
      retrieveProduct(params.id);
    }
  }, []);

  // Keeps all collapse panels expanded by default for easy access
  const [activePanels, setActivePanels] = useState(["1", "2", "3", "4"]);

  // Helper template for professional, themed headers inside the Collapse panels
  const renderPanelHeader = (icon, title, subtitle) => (
    <div className="custom-panel-header-wrapper">
      <div className="panel-header-icon-frame">{icon}</div>
      <div className="panel-header-text-block">
        <span className="panel-header-main-title">{title}</span>
        <span className="panel-header-sub-title">{subtitle}</span>
      </div>
    </div>
  );

  return (
    <>
      {contextHolder}
      <div className="admin-page-container">
        {/* Top Header Action Bar */}
        <div className="form-sticky-header">
          <div>
            <h1 className="main-dashboard-title">{isUpdate ? "Update Product" : "Create Product"}</h1>
            <span style={{ color: "#64748b", fontSize: "13px" }}>
              Set up inventory descriptions, attributes, and stock logs.
            </span>
          </div>
          <Space size="middle">
            <Button
              size="large"
              icon={<CloseOutlined />}
              onClick={() =>{

              form.resetFields()
                setNewImages([])
              setFileList([])
              }}
            >
              Reset
            </Button>
            <Button
              type="primary"
              size="large"
              icon={<SaveOutlined />}
              className="btn-primary-antd"
              onClick={() => form.submit()}
              loading={loading}
            >
              {isUpdate ? "Update Product" : "Create Product"}
            </Button>
          </Space>
        </div>

        {/* Main Professional Form Layout */}
        <Form
          form={form}
          layout="vertical"
          onFinish={onFinish}
          requiredMark={false}
          initialValues={{
            gender: "unisex",
            is_active: true,
            stock: 0,
          }}
        >
          <Row gutter={[24, 24]}>
            {/* Left Column: Clean & Simplified Collapse Sections */}
            <Col xs={24} lg={17}>
              <Collapse
                activeKey={activePanels}
                onChange={setActivePanels}
                expandIconPosition="end"
                ghost
                className="custom-collapse"
              >
                {/* Section 1: General Details */}
                <Panel
                  header={renderPanelHeader(
                    <FileTextOutlined />,
                    "1. General Details",
                    "Configure master titles, descriptive paragraphs, and content structures",
                  )}
                  key="1"
                  className="panel-card"
                >
                  <Form.Item
                    label="Product Name"
                    name="product_name"
                    rules={[
                      { required: true, message: "This field is required" },
                    ]}
                  >
                    <Input
                      placeholder="e.g., Slim Fit Casual Shirt"
                      size="large"
                    />
                  </Form.Item>

                  <Form.Item
                    label="Product Slug"
                    name="product_slug"
                    rules={[
                      { required: true, message: "This field is required" },
                    ]}
                  >
                    <Input
                      addonBefore="/product-details/"
                      placeholder="slim-fit-casual-shirt"
                      size="large"
                    />
                  </Form.Item>

                  <Form.Item
                    label="Product Description"
                    name="product_description"
                    rules={[
                      { required: true, message: "This field is required" },
                    ]}
                  >
                    <TextArea
                      rows={4}
                      placeholder="Describe the item's details, style guidelines, and design..."
                    />
                  </Form.Item>

                  <Row gutter={16}>
                    <Col span={12}>
                      <Form.Item
                        label="Material Description"
                        name="product_material_description"
                        rules={[
                          { required: true, message: "This field is required" },
                        ]}
                      >
                        <TextArea rows={2} placeholder="e.g., 100% Cotton" />
                      </Form.Item>
                    </Col>
                    <Col span={12}>
                      <Form.Item
                        label="Care Instructions"
                        name="care_instruction"
                        rules={[
                          { required: true, message: "This field is required" },
                        ]}
                      >
                        <TextArea
                          rows={2}
                          placeholder="e.g., Machine wash cold"
                        />
                      </Form.Item>
                    </Col>
                  </Row>
                </Panel>

                {/* Section 2: Colors & Sizes */}
                <Panel
                  header={renderPanelHeader(
                    <TagsOutlined />,
                    "2. Product Attributes",
                    "Configure colors, sizes, brand, and target audience",
                  )}
                  key="2"
                  className="panel-card"
                >
                  <Row gutter={[16, 16]}>
                    <Col xs={24} md={12}>
                      <Form.Item
                        label="Available Colors"
                        name="product_colors"
                        rules={[
                          { required: true, message: "This field is required" },
                        ]}
                      >
                        <Select
                          mode="multiple"
                          placeholder="Select Colors"
                          size="large"
                          allowClear
                        >
                          {color_data?.product_color_data?.map((color) => (
                            <Select.Option key={color.id} value={color.id}>
                              {color.product_color_name}
                            </Select.Option>
                          ))}
                        </Select>
                      </Form.Item>
                    </Col>

                    <Col xs={24} md={12}>
                      <Form.Item
                        label="Available Sizes"
                        name="product_sizes"
                        rules={[
                          { required: true, message: "This field is required" },
                        ]}
                      >
                        <Select
                          mode="multiple"
                          placeholder="Select Sizes"
                          size="large"
                          allowClear
                        >
                          {size_data?.product_size_data?.map((size) => (
                            <Select.Option key={size.id} value={size.id}>
                              {size.product_size_name}
                            </Select.Option>
                          ))}
                        </Select>
                      </Form.Item>
                    </Col>

                    <Col xs={24} md={12}>
                      <Form.Item
                        label="Product Brand"
                        name="product_brand"
                        rules={[
                          { required: true, message: "This field is required" },
                        ]}
                      >
                        <Select
                          placeholder="Select Brand"
                          size="large"
                          allowClear
                        >
                          {brand_data?.product_brand_data?.map((brand) => (
                            <Select.Option key={brand.id} value={brand.id}>
                              {brand.product_brand_name}
                            </Select.Option>
                          ))}
                        </Select>
                      </Form.Item>
                    </Col>

                    <Col xs={24} md={12}>
                      <Form.Item
                        label="Gender Target"
                        name="gender"
                        rules={[
                          { required: true, message: "This field is required" },
                        ]}
                      >
                        <Select
                          placeholder="Select Gender"
                          size="large"
                          allowClear
                        >
                          <Select.Option value="">Select Gender</Select.Option>

                          <Select.Option value="men">Men</Select.Option>
                          <Select.Option value="women">Women</Select.Option>
                          <Select.Option value="unisex">Unisex</Select.Option>
                          <Select.Option value="kids">Kids</Select.Option>
                          <Select.Option value="all">All</Select.Option>
                        </Select>
                      </Form.Item>
                    </Col>
                  </Row>
                </Panel>

                {/* Section 4: Images */}
                <Panel
                  header={renderPanelHeader(
                    <PictureOutlined />,
                    "3. Product Images",
                    "Manage primary product media files and alternate gallery sets",
                  )}
                  key="4"
                  className="panel-card"
                >
                  <Form.Item
                    style={{ marginBottom: 0 }}
                    rules={[
                      { required: true, message: "This field is required" },
                    ]}
                  >
                    <Upload.Dragger
                      multiple
                      accept="image/*"
                      listType="picture"
                      fileList={uploadFileList}
                      beforeUpload={() => false}
                      onChange={handleUploadChange}
                      onRemove={handleRemove}
                      className="media-dragger"
                    >
                      <p className="ant-upload-drag-icon">
                        <InboxOutlined style={{ color: "#1b73e8" }} />
                      </p>
                      <p className="ant-upload-text">
                        Drag images here or{" "}
                        <span style={{ color: "#1b73e8", fontWeight: 600 }}>
                          browse files
                        </span>
                      </p>
                      <p className="ant-upload-hint">
                        Upload high-resolution images. First image acts as the
                        primary image display.
                      </p>
                    </Upload.Dragger>
                  </Form.Item>
                </Panel>
              </Collapse>
            </Col>

            {/* Right Column: Clean Sidebar for Pricing & Live Status */}
            <Col xs={24} lg={7}>
              <div className="sidebar-sticky-wrapper">
                <Card
                  title="Pricing & Inventory"
                  className="summary-card"
                  bordered={false}
                >
                  <Form.Item
                    label="Retail Price (EUR)"
                    name="price"
                    rules={[
                      { required: true, message: "This field is required" },
                    ]}
                  >
                    <InputNumber
                      min={0}
                      precision={2}
                      style={{ width: "100%" }}
                      size="large"
                      placeholder="0.00"
                    />
                  </Form.Item>

                  <Form.Item
                    label="Stock Quantity"
                    name="stock"
                    rules={[
                      { required: true, message: "This field is required" },
                    ]}
                    style={{ marginBottom: 0 }}
                  >
                    <InputNumber
                      min={0}
                      style={{ width: "100%" }}
                      size="large"
                      placeholder="0"
                    />
                  </Form.Item>
                </Card>

                <Card
                  className="summary-card"
                  bordered={false}
                  style={{ marginTop: "20px" }}
                >
                  <div className="visibility-box">
                    <div>
                      <span
                        style={{
                          fontWeight: 600,
                          display: "block",
                          color: "#1e293b",
                        }}
                      >
                        Active Status
                      </span>
                      <span style={{ fontSize: "12px", color: "#64748b" }}>
                        Show on storefront lookbooks
                      </span>
                    </div>
                    <Form.Item name="is_active" valuePropName="checked" noStyle>
                      <Switch />
                    </Form.Item>
                  </div>
                </Card>
              </div>
            </Col>
          </Row>
        </Form>
      </div>
    </>
  );
}
