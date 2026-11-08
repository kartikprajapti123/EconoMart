import React, { useEffect, useState } from "react";
import {
  Row,
  Col,
  Card,
  Button,
  Input,
  Select,
  Typography,
  Pagination,
  Spin,
  Badge,
  Space,
  notification
} from "antd";
import {
  SearchOutlined,
  ShoppingCartOutlined,
  HeartOutlined,
  EyeOutlined,
  SlidersOutlined
} from "@ant-design/icons";
import { useDispatch, useSelector } from "react-redux";
import { listProductThunkApi } from "../../slice/Product.Slice";
import { useNavigate } from "react-router";
import { add_to_cart } from "../../slice/Cart.Slice";
const { Title, Text } = Typography;
const { Option } = Select;

export default function CustomerShowcase() {
  const [message, contextHolder] = notification.useNotification();
  const [Search, setSearch] = useState("");
  const [Page, setPage] = useState(1);
  const [PageSize, setPageSize] = useState(12);
  const [CustomOrdering, setCustomOrdering] = useState("");
  const [StockStatus, setStockStatus] = useState(null);
  const [Loading, setLoading] = useState(false);
  const [addToCartLoading, setAddToCartLoading] = useState(false);

  const dispatch=useDispatch()
  const product = useSelector((state) => state.product);
  const navigate = useNavigate();

  const handleProductList = (showLoader) => {
    if (showLoader) setLoading(true);

    let params = {
      search: Search,
      customOrdering: CustomOrdering,
      stockStatus: StockStatus,
      page: Page,
      pageSize: PageSize,
      productStatus: true,
    };

    dispatch(listProductThunkApi(params))
      .unwrap()
      .then(() => {
        if (showLoader) setLoading(false);
      })
      .catch((error) => {
        if (showLoader) setLoading(false);
        message.error({
          message: "Unable to load collection",
          description: error || "Network error. Please try again.",
        });
      });
  };

  useEffect(() => {
    handleProductList(true);
  }, [Search, Page, PageSize, StockStatus, CustomOrdering]);

  const handleAddToCart = (e,product_details) => {
      setAddToCartLoading(true);
  
      let cart = JSON.parse(localStorage.getItem("cart")) || [];
  
      const cartItem = {
        product: product_details.id,
        product_name: product_details.product_name,
        price: Number(product_details.price),
        quantity:product_details.quantity,
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
  
      setAddToCartLoading(false);
    };

  return (
    <div className="premium-showcase-scope">
      {contextHolder}

      {/* EDITORIAL HEADER BAR */}
      <header className="showcase-editorial-header">
        <div className="header-context">
          <span className="editorial-eyebrow">All SEASON COLLECTION</span>
<Title level={1} className="editorial-title">Product Catalog</Title>
          <div className="editorial-divider"></div>
        </div>
      </header>

      {/* FILTER & CONTROL DECK */}
      <div className="showcase-control-deck">
        <Row gutter={[24, 16]} align="middle">
          <Col xs={24} lg={10}>
            <Input
              size="large"
              className="premium-search-field"
              value={Search}
              allowClear
              prefix={<SearchOutlined className="search-icon-accent" />}
              placeholder="Search by product template, name, or keywords..."
              onChange={(e) => {
                setPage(1);
                setSearch(e.target.value);
              }}
            />
          </Col>
          <Col xs={24} lg={14} className="filters-alignment-layer">
            <Space size={16} wrap className="filter-space-components">
              <span className="filter-util-text"><SlidersOutlined /> Filter By:</span>
              
              <Select
                size="large"
                placeholder="Sort Arrangement"
                className="premium-dropdown-select"
                allowClear
                onChange={(value) => {
                  setPage(1);
                  setCustomOrdering(value);
                }}
              >
                <Option value="price">Price: Low to High</Option>
                <Option value="-price">Price: High to Low</Option>
                <Option value="-created_at">Latest Additions</Option>
              </Select>

              <Select
                size="large"
                placeholder="Availability Status"
                className="premium-dropdown-select"
                allowClear
                onChange={(value) => {
                  setPage(1);
                  setStockStatus(value);
                }}
              >
                <Option value="in_stock">Available Immediately</Option>
                <Option value="out_of_stock">Out of Stock</Option>
              </Select>
            </Space>
          </Col>
        </Row>
      </div>

      {/* GALLERY GRID */}
      {Loading ? (
        <div className="premium-grid-loader">
          <Spin size="large" />
          <Text className="loader-text">Refining catalog layout...</Text>
        </div>
      ) : (
        <>
          {/* Centered item flow setup */}
          <div className="product-grid-flex-container">
            {product?.product_data?.map((item) => {
              const primaryImage = item.product_images?.find((img) => img.is_primary);
              const isOutOfStock = item.stock <= 0;

              return (
                <div className="grid-item-card-wrapper" key={item.id}>
                  <Badge.Ribbon 
                    text={isOutOfStock ? "SOLD OUT" : `${item.product_brand_name || 'NEW'}`} 
                    className={isOutOfStock ? "premium-ribbon-sold" : "premium-ribbon-active"}
                  >
                    <Card
                      hoverable
                      bordered={false}
                      className="premium-showcase-card"
                      cover={
                        <div className="premium-image-canvas" onClick={() => navigate(`/product-details/${item.id}`)}>
                          <img
                            alt={item.product_name}
                            src={primaryImage?.image || "https://images.unsplash.com/photo-1560343090-f0409e92791a?w=500&auto=format&fit=crop&q=60"}
                            className="premium-fluid-img"
                          />
                          <div className="premium-image-mask-overlay">
                            <Space size="middle">
                              <Button 
                                shape="circle" 
                                icon={<EyeOutlined />} 
                                className="premium-action-trigger"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  navigate(`/product-details/${item.id}`);
                                }}
                              />
                              <Button 
                                shape="circle" 
                                icon={<HeartOutlined />} 
                                className="premium-action-trigger"
                                onClick={(e) => e.stopPropagation()}
                              />
                            </Space>
                          </div>
                        </div>
                      }
                    >
                      <div className="premium-card-body-wrapper" onClick={() => navigate(`/product-details/${item.id}`)}>
                        <span className="premium-card-brand-meta">
                          {item.product_brand_name ? item.product_brand_name.toUpperCase() : "ORIGINAL CLASSIC"}
                        </span>
                        
                        <h3 className="premium-card-product-title">
                          {item.product_name}
                        </h3>

                        {/* ARRANGED STOCK NOTICE AND PRICING AREA */}
                        <div className="premium-card-info-stack">
                          {item.stock <= 5 && !isOutOfStock ? (
                            <span className="premium-urgency-tag">Only {item.stock} units remaining</span>
                          ) : isOutOfStock ? (
                            <span className="premium-urgency-tag out-of-stock-text">Restocking soon</span>
                          ) : (
                            <span className="premium-stock-placeholder-blank" />
                          )}
                          
                          <span className="premium-price-currency">
                            € {parseFloat(item.price || 0).toLocaleString('en-IE', { minimumFractionDigits: 2 })}
                          </span>
                        </div>
                      </div>

                      <div className="premium-card-cta-footer">
                        <Button
                          type="primary"
                          block
                          size="large"
                          disabled={isOutOfStock}
                          icon={<EyeOutlined />}
                          className="premium-primary-cta"
                          onClick={(e)=>{navigate(`/product-details/${item.id}/`)}}
                        >
                          {isOutOfStock ? "View More" : "View More"}
                        </Button>
                      </div>
                    </Card>
                  </Badge.Ribbon>
                </div>
              );
            })}
          </div>

          {/* EDITORIAL PAGINATION */}
          {product?.totalRecords > PageSize && (
            <div className="premium-pagination-wrapper">
              <Pagination
                current={Page}
                pageSize={PageSize}
                total={product.totalRecords}
                showSizeChanger={false}
                onChange={(page) => setPage(page)}
              />
            </div>
          )}
        </>
      )}
    </div>
  );
}