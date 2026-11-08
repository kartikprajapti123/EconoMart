import React, { useEffect, useState } from "react";
import {
  Row,
  Col,
  Typography,
  Button,
  Radio,
  Space,
  Tag,
  InputNumber,
  Tabs,
  Breadcrumb,
  notification,
} from "antd";
import {
  ShoppingCartOutlined,
  HeartOutlined,
  SwapOutlined,
  ArrowLeftOutlined,
  PlusOutlined,
  GlobalOutlined,
  SafetyOutlined,
} from "@ant-design/icons";
import { useDispatch, useSelector } from "react-redux";
import { retrieveProductThunkApi } from "../../slice/Product.Slice";
import { useParams } from "react-router";
import { add_to_cart, openCart } from "../../slice/Cart.Slice";
import { useNavigate } from "react-router";
const { Title, Text, Paragraph } = Typography;

export default function ProductDetails() {
  const [message, contextHolder] = notification.useNotification();
  const dispatch = useDispatch();
  const params = useParams();
  const navigate = useNavigate();
  const product_details = useSelector((state) => state.product.product_details);

  const [selectedImage, setSelectedImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [selectedColor, setSelectedColor] = useState(null);
  const [selectedSize, setSelectedSize] = useState(null);
  const [quantity, setQuantity] = useState(1);

  const handleAddToCart = () => {
    setLoading(true);

    let cart = JSON.parse(localStorage.getItem("cart")) || [];

    const cartItem = {
      product: product_details.id,
      product_name: product_details.product_name,
      price: Number(product_details.price),
      quantity,
      image:
        product_details.product_images?.find((img) => img.is_primary)?.image ||
        product_details.product_images?.[0]?.image,
      color: selectedColor,
      size: selectedSize,
      stock: product_details.stock,
    };

    const existingItem = cart.find(
      (item) =>
        item.product === cartItem.product &&
        item.color === cartItem.color &&
        item.size === cartItem.size,
    );

    if (existingItem) {
      existingItem.quantity += quantity;
    } else {
      cart.push(cartItem);
    }

    // Save first
    localStorage.setItem("cart", JSON.stringify(cart));

    // Then update Redux
    dispatch(add_to_cart(cart));

    message.success({
      message: "Success",
      description: `${quantity} × ${product_details.product_name} added to cart.`,
      placement: "bottomRight",
    });

    setLoading(false);
  };
  const retrieveProduct = () => {
    setLoading(true);
    dispatch(retrieveProductThunkApi(params.id))
      .unwrap()
      .then(() => setLoading(false))
      .catch((error) => {
        setLoading(false);
        message.error({
          message: "Retrieval Error",
          description: error || "Failed to load product details.",
        });
      });
  };

  useEffect(() => {
    retrieveProduct();
  }, [params.id]);

  useEffect(() => {
    if (product_details) {
      if (product_details.product_images?.length > 0) {
        const primaryImg = product_details.product_images.find(
          (img) => img.is_primary,
        );
        setSelectedImage(
          primaryImg
            ? primaryImg.image
            : product_details.product_images[0].image,
        );
      }
      if (product_details.product_colors?.length > 0) {
        setSelectedColor(product_details.product_colors[0].product_color_name);
      }
      if (product_details.product_sizes?.length > 0) {
        setSelectedSize(product_details.product_sizes[0].product_size_name);
      }
    }
  }, [product_details]);

  const tabItems = [
    {
      key: "desc",
      label: "PRODUCT DESCRIPTION",
      children: (
        <Paragraph
          style={{
            color: "#4f5e74",
            fontSize: "14px",
            lineHeight: "1.6",
            margin: 0,
          }}
        >
          {product_details?.product_description || "No description specified."}
        </Paragraph>
      ),
    },
    {
      key: "specs",
      label: "SPECIFICATIONS & CARE",
      children: (
        <div style={{ fontSize: "14px", lineHeight: "1.6" }}>
          <Text
            strong
            style={{
              display: "block",
              marginBottom: "4px",
              fontSize: "12px",
              color: "#1c2434",
            }}
          >
            MATERIAL INFO
          </Text>
          <Paragraph style={{ color: "#4f5e74", marginBottom: "16px" }}>
            {product_details?.product_material_description ||
              "Premium Quality Composition."}
          </Paragraph>
          <Text
            strong
            style={{
              display: "block",
              marginBottom: "4px",
              fontSize: "12px",
              color: "#1c2434",
            }}
          >
            CARE INSTRUCTIONS
          </Text>
          <Paragraph style={{ color: "#4f5e74", margin: 0 }}>
            {product_details?.care_instruction ||
              "Handle with proper manufacturing care."}
          </Paragraph>
        </div>
      ),
    },
  ];

  return (
    <>
      {contextHolder}
      {/* Global CSS Overrides for a Professional Tech Theme */}
      
      <div className="page-header" style={{margin:"10px",padding:"10px"}}>
        <div>
          <h1 className="page-title">Product Details </h1>

          <p className="page-subtitle">View Color, Size and Brand</p>
        </div>
        <Button
          type="primary"
          size="large"
          className="add-btn"
          icon={<ArrowLeftOutlined />}
          onClick={() => {
            navigate(-1);
          }}
        >
          Back
        </Button>
      </div>

      <div
        style={{
          backgroundColor: "#f4f7fc",
          minHeight: "100vh",
          padding: "40px 24px",
          fontFamily:
            '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
        }}
      >
        <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
          {/* Professional Breadcrumb Route */}
          <Breadcrumb
            style={{ marginBottom: "24px", fontSize: "13px" }}
            items={[
              { title: <span style={{ color: "#8c8c8c" }}>Products</span> },
              {
                title: (
                  <span style={{ color: "#8c8c8c" }}>
                    {product_details?.gender || "General"}
                  </span>
                ),
              },
              {
                title: (
                  <span style={{ color: "#262626", fontWeight: 500 }}>
                    {product_details?.product_name}
                  </span>
                ),
              },
            ]}
          />

          <Row gutter={[40, 32]}>
            {/* COLUMN 1: INTERACTIVE DISPLAY GALLERY */}
            <Col xs={24} md={12} lg={13}>
              <div style={{ position: "sticky", top: "24px" }}>
                <Row gutter={[16, 16]}>
                  {/* Vertical Strip Viewports */}
                  <Col span={4}>
                    <Space
                      direction="vertical"
                      size={10}
                      style={{ width: "100%" }}
                    >
                      {product_details?.product_images?.map((img) => (
                        <div
                          key={img.id}
                          onClick={() => setSelectedImage(img.image)}
                          style={{
                            width: "100%",
                            paddingTop: "120%",
                            position: "relative",
                            cursor: "pointer",
                            backgroundColor: "#ffffff",
                            borderRadius: "6px",
                            overflow: "hidden",
                            border:
                              selectedImage === img.image
                                ? "2px solid #1677ff"
                                : "1px solid #d9d9d9",
                            transition: "all 0.2s ease",
                          }}
                        >
                          <img
                            src={img.image}
                            alt="thumb"
                            style={{
                              position: "absolute",
                              top: 0,
                              left: 0,
                              width: "100%",
                              height: "100%",
                              objectFit: "cover",
                            }}
                          />
                        </div>
                      ))}
                    </Space>
                  </Col>

                  {/* Main Hero Container */}
                  <Col span={20}>
                    <div
                      style={{
                        width: "100%",
                        paddingTop: "120%",
                        position: "relative",
                        backgroundColor: "#ffffff",
                        borderRadius: "8px",
                        overflow: "hidden",
                        border: "1px solid #e8e8e8",
                        boxShadow: "0 4px 12px rgba(0, 0, 0, 0.03)",
                      }}
                    >
                      <img
                        src={
                          selectedImage ||
                          "https://via.placeholder.com/600x720?text=No+Image"
                        }
                        alt={product_details?.product_name}
                        style={{
                          position: "absolute",
                          top: 0,
                          left: 0,
                          width: "100%",
                          height: "100%",
                          objectFit: "cover",
                        }}
                      />
                    </div>
                  </Col>
                </Row>
              </div>
            </Col>

            {/* COLUMN 2: OPERATIONS AND OPTIONS FORM CONTAINER */}
            <Col xs={24} md={12} lg={11}>
              <div
                style={{
                  backgroundColor: "#ffffff",
                  padding: "32px",
                  borderRadius: "8px",
                  border: "1px solid #e8e8e8",
                  boxShadow: "0 2px 8px rgba(0, 0, 0, 0.02)",
                }}
              >
                <Space direction="vertical" size={28} style={{ width: "100%" }}>
                  {/* Brand Meta Data Structure */}
                  <div>
                    <Text
                      style={{
                        fontSize: "13px",
                        fontWeight: "600",
                        color: "#1677ff",
                        textTransform: "uppercase",
                        display: "block",
                        marginBottom: "4px",
                      }}
                    >
                      {product_details?.product_brand?.product_brand_name ||
                        "Brand"}
                    </Text>

                    <Title
                      level={2}
                      style={{
                        fontSize: "26px",
                        color: "#1f1f1f",
                        margin: "0 0 12px 0",
                        fontWeight: "600",
                      }}
                    >
                      {product_details?.product_name}
                    </Title>

                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "12px",
                      }}
                    >
                      <Text
                        style={{
                          fontSize: "24px",
                          fontWeight: "700",
                          color: "#1f1f1f",
                        }}
                      >
                        $
                        {product_details?.price
                          ? parseFloat(product_details.price).toFixed(2)
                          : "0.00"}
                      </Text>
                      {product_details?.stock <= 5 &&
                        product_details?.stock > 0 && (
                          <Tag
                            color="error"
                            style={{
                              borderRadius: "4px",
                              fontWeight: "500",
                            }}
                          >
                            Only {product_details?.stock} units left!
                          </Tag>
                        )}
                    </div>
                  </div>

                  {/* Variation Management Core: Color */}
                  <div>
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        marginBottom: "8px",
                      }}
                    >
                      <Text
                        strong
                        style={{ fontSize: "12px", color: "#595959" }}
                      >
                        COLOR
                      </Text>
                      <Text
                        style={{
                          fontSize: "13px",
                          color: "#1677ff",
                          fontWeight: "500",
                        }}
                      >
                        {selectedColor || "None selected"}
                      </Text>
                    </div>
                    <Radio.Group
                      className="app-radio-group"
                      value={selectedColor}
                      onChange={(e) => setSelectedColor(e.target.value)}
                      style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}
                    >
                      {product_details?.product_colors?.map((color) => (
                        <Radio.Button
                          key={color.id}
                          value={color.product_color_name}
                          style={{ height: "38px", lineHeight: "36px" }}
                        >
                          {color.product_color_name}
                        </Radio.Button>
                      ))}
                    </Radio.Group>
                  </div>

                  {/* Variation Management Core: Size */}
                  <div>
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        marginBottom: "8px",
                      }}
                    >
                      <Text
                        strong
                        style={{ fontSize: "12px", color: "#595959" }}
                      >
                        SIZE
                      </Text>
                      <Text
                        style={{
                          fontSize: "12px",
                          color: "#8c8c8c",
                          cursor: "pointer",
                          textDecoration: "underline",
                        }}
                      >
                        Size Chart
                      </Text>
                    </div>
                    <Radio.Group
                      className="app-radio-group"
                      value={selectedSize}
                      onChange={(e) => setSelectedSize(e.target.value)}
                      style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}
                    >
                      {product_details?.product_sizes?.map((size) => (
                        <Radio.Button
                          key={size.id}
                          value={size.product_size_name}
                          style={{
                            minWidth: "50px",
                            height: "38px",
                            lineHeight: "36px",
                            textAlign: "center",
                          }}
                        >
                          {size.product_size_name}
                        </Radio.Button>
                      ))}
                    </Radio.Group>
                  </div>

                  {/* Order Allocation System: Quantity */}
                  <div>
                    <Text
                      strong
                      style={{
                        fontSize: "12px",
                        color: "#595959",
                        display: "block",
                        marginBottom: "8px",
                      }}
                    >
                      QUANTITY
                    </Text>
                    <InputNumber
                      className="app-input-number"
                      max={product_details?.stock || 10}
                      value={quantity}
                      onChange={(val) => setQuantity(val || 1)}
                      style={{
                        width: "90px",
                        height: "38px",
                        display: "flex",
                        alignItems: "center",
                      }}
                      min={1}
                      controls
                      onKeyDown={(e) => e.preventDefault()}
                    />
                  </div>

                  {/* Primary Business Pipelines */}
                  <div
                    style={{ display: "flex", gap: "12px", marginTop: "4px" }}
                  >
                    <Button
                      type="primary"
                      loading={loading}
                      icon={<ShoppingCartOutlined />}
                      size="large"
                      onClick={handleAddToCart}
                      disabled={
                        !product_details?.is_active ||
                        product_details?.stock === 0
                      }
                      style={{
                        flex: 1,
                        height: "48px",
                        borderRadius: "4px",
                        fontSize: "14px",
                        fontWeight: "600",
                        backgroundColor: "#1677ff",
                        borderColor: "#1677ff",
                      }}
                    >
                      Add To Cart
                    </Button>
                  </div>

                  {/* Metadata Content Drawer */}
                  <Tabs
                    className="app-tabs"
                    defaultActiveKey="desc"
                    items={tabItems}
                    style={{ marginTop: "8px" }}
                  />

                  {/* Professional Value Matrix Flags */}
                  <div
                    style={{
                      borderTop: "1px solid #f0f0f0",
                      paddingTop: "20px",
                      display: "grid",
                      gridTemplateColumns: "repeat(3, 1fr)",
                      gap: "8px",
                      fontSize: "12px",
                      color: "#8c8c8c",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        textAlign: "center",
                      }}
                    >
                      <GlobalOutlined
                        style={{
                          fontSize: "16px",
                          color: "#1677ff",
                          marginBottom: "4px",
                        }}
                      />
                      <span>Free Shipping</span>
                    </div>
                    <div
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        textAlign: "center",
                      }}
                    >
                      <SwapOutlined
                        style={{
                          fontSize: "16px",
                          color: "#1677ff",
                          marginBottom: "4px",
                        }}
                      />
                      <span>14-Day Returns</span>
                    </div>
                    <div
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        textAlign: "center",
                      }}
                    >
                      <SafetyOutlined
                        style={{
                          fontSize: "16px",
                          color: "#1677ff",
                          marginBottom: "4px",
                        }}
                      />
                      <span>Secure Checkout</span>
                    </div>
                  </div>
                </Space>
              </div>
            </Col>
          </Row>
        </div>
      </div>
    </>
  );
}
