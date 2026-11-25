import React, { useEffect, useState } from "react";
import {
  Button,
  Input,
  Select,
  Typography,
  Pagination,
  Badge,
  Drawer,
  Empty,
  Grid,
  Tooltip,
  notification,
} from "antd";
import {
  SearchOutlined,
  HeartOutlined,
  HeartFilled,
  EyeOutlined,
  DeleteOutlined,
} from "@ant-design/icons";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router";
import { listProductThunkApi, openWishlistDrawer, setWishlistDrawerOpen } from "../../slice/Product.Slice";
import useWishlist from "../product/useWishlist"; // adjust path if needed

const { Title, Text } = Typography;
const { useBreakpoint } = Grid;

const CURRENCY = "EUR"; // change to "USD" if you want to match the dashboard
const LOW_STOCK_LIMIT = 5;
const FALLBACK_IMG =
  "https://images.unsplash.com/photo-1560343090-f0409e92791a?w=500&auto=format&fit=crop&q=60";

const formatPrice = (value) =>
  new Intl.NumberFormat("en-IE", {
    style: "currency",
    currency: CURRENCY,
  }).format(Number(value) || 0);

const getImage = (item) =>
  item.product_images?.find((img) => img.is_primary)?.image ||
  item.product_images?.[0]?.image ||
  FALLBACK_IMG;

export default function CustomerShowcase() {
  const [api, contextHolder] = notification.useNotification();
  const screens = useBreakpoint();
  const isMobile = !screens.md;

  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const pageSize = 12;
  const [customOrdering, setCustomOrdering] = useState("");
  const [stockStatus, setStockStatus] = useState(null);
  const [loading, setLoading] = useState(false);
  const [wishlistOpen, setWishlistOpen] = useState(false);

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const product = useSelector((state) => state.product);
  const wishlist = useWishlist();

  // Wait until the user stops typing before calling the API
  useEffect(() => {
    const t = setTimeout(() => {
      setPage(1);
      setSearch(searchInput);
    }, 400);
    return () => clearTimeout(t);
  }, [searchInput]);

  useEffect(() => {
    setLoading(true);
    dispatch(
      listProductThunkApi({
        search,
        customOrdering,
        stockStatus,
        page,
        pageSize,
        productStatus: true,
      })
    )
      .unwrap()
      .catch((error) => {
        api.error({
          message: "Couldn't load products",
          description:
            (typeof error === "string" && error) ||
            "Check your connection and try again.",
          placement: "bottomRight",
        });
      })
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, page, stockStatus, customOrdering]);

  const goToProduct = (id) => navigate(`/product-details/${id}`);

  const handleWishlist = (e, item) => {
    e.stopPropagation();
    const added = wishlist.toggle(item);
    api.success({
      message: added ? "Saved to wishlist" : "Removed from wishlist",
      description: item.product_name,
      placement: "bottomRight",
      duration: 2,
    });
  };

  const products = product?.product_data || [];
  const total = product?.totalRecords || 0;
  const hasFilters = Boolean(search || customOrdering || stockStatus);

  const resetFilters = () => {
    setSearchInput("");
    setSearch("");
    setCustomOrdering("");
    setStockStatus(null);
    setPage(1);
  };

  return (
    <div className="shop-scope">
      {contextHolder}

      {/* PAGE HEADER */}
      <header className="shop-header">
        <div>
          <Title level={2} className="shop-title">
            Product Catalog
          </Title>
          <Text className="shop-subtitle">
            Browse everything in stock and save the items you like.
          </Text>
        </div>

        <Badge count={wishlist.count} size="small" offset={[-4, 6]}>
  <Button
    className="shop-wishlist-btn"
    icon={<HeartOutlined />}
    onClick={() => {
      console.log("Wishlist button clicked");
      dispatch(openWishlistDrawer());
    }}
    aria-label={`Open wishlist, ${wishlist.count} items`}
  >
    {!isMobile && "Wishlist"}
  </Button>
</Badge>
      </header>

      {/* FILTER BAR */}
      <section className="shop-filters" aria-label="Search and filters">
        <Input
          size="large"
          className="shop-search"
          value={searchInput}
          allowClear
          prefix={<SearchOutlined />}
          placeholder="Search products"
          onChange={(e) => setSearchInput(e.target.value)}
        />
        <Select
          size="large"
          className="shop-select"
          placeholder="Sort by"
          allowClear
          value={customOrdering || undefined}
          onChange={(v) => {
            setPage(1);
            setCustomOrdering(v || "");
          }}
          options={[
            { value: "price", label: "Price: low to high" },
            { value: "-price", label: "Price: high to low" },
            { value: "-created_at", label: "Newest first" },
          ]}
        />
        <Select
          size="large"
          className="shop-select"
          placeholder="Availability"
          allowClear
          value={stockStatus || undefined}
          onChange={(v) => {
            setPage(1);
            setStockStatus(v || null);
          }}
          options={[
            { value: "in_stock", label: "In stock" },
            { value: "out_of_stock", label: "Out of stock" },
          ]}
        />
      </section>

      {!loading && (
        <div className="shop-result-bar">
          <Text type="secondary">
            {total} {total === 1 ? "product" : "products"}
          </Text>
          {hasFilters && (
            <Button type="link" size="small" onClick={resetFilters}>
              Clear filters
            </Button>
          )}
        </div>
      )}

      {/* GRID */}
      {loading ? (
        <div className="shop-grid" aria-busy="true">
          {Array.from({ length: 8 }).map((_, i) => (
            <div className="shop-card shop-skeleton" key={i}>
              <div className="shop-skel-img" />
              <div className="shop-skel-line w60" />
              <div className="shop-skel-line w90" />
              <div className="shop-skel-line w40" />
            </div>
          ))}
        </div>
      ) : products.length === 0 ? (
        <div className="shop-empty">
          <Empty
            description={
              hasFilters
                ? "No products match your search."
                : "No products are available right now."
            }
          >
            {hasFilters && (
              <Button type="primary" onClick={resetFilters}>
                Clear filters
              </Button>
            )}
          </Empty>
        </div>
      ) : (
        <div className="shop-grid">
          {products.map((item) => {
            const outOfStock = item.stock <= 0;
            const lowStock = !outOfStock && item.stock <= LOW_STOCK_LIMIT;
            const liked = wishlist.isWishlisted(item.id);

            return (
              <article className="shop-card" key={item.id}>
                <div
                  className="shop-card-media"
                  onClick={() => goToProduct(item.id)}
                  role="link"
                  tabIndex={0}
                  onKeyDown={(e) => e.key === "Enter" && goToProduct(item.id)}
                  aria-label={`View ${item.product_name}`}
                >
                  <img
                    src={getImage(item)}
                    alt={item.product_name}
                    loading="lazy"
                    className={outOfStock ? "is-dim" : ""}
                  />

                  {outOfStock && (
                    <span className="shop-chip shop-chip-muted">Sold out</span>
                  )}
                  {lowStock && (
                    <span className="shop-chip shop-chip-warn">
                      {item.stock} left
                    </span>
                  )}

                  <Tooltip title={liked ? "Remove from wishlist" : "Save to wishlist"}>
                    <button
                      type="button"
                      className={`shop-heart ${liked ? "is-active" : ""}`}
                      onClick={(e) => handleWishlist(e, item)}
                      aria-pressed={liked}
                      aria-label={liked ? "Remove from wishlist" : "Save to wishlist"}
                    >
                      {liked ? <HeartFilled /> : <HeartOutlined />}
                    </button>
                  </Tooltip>
                </div>

                <div className="shop-card-body">
                  {item.product_brand_name && (
                    <span className="shop-brand">{item.product_brand_name}</span>
                  )}
                  <h3
                    className="shop-name"
                    title={item.product_name}
                    onClick={() => goToProduct(item.id)}
                  >
                    {item.product_name}
                  </h3>

                  <div className="shop-card-foot">
                    <span className="shop-price">{formatPrice(item.price)}</span>
                    <Button
                      type="primary"
                      icon={<EyeOutlined />}
                      className="shop-cta"
                      onClick={() => goToProduct(item.id)}
                    >
                      {isMobile ? "View" : "View details"}
                    </Button>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}

      {/* PAGINATION */}
      {!loading && total > pageSize && (
        <div className="shop-pagination">
          <Pagination
            current={page}
            pageSize={pageSize}
            total={total}
            showSizeChanger={false}
            simple={isMobile}
            onChange={(p) => {
              setPage(p);
              window.scrollTo({ top: 0, behavior: "smooth" });
            }}
          />
        </div>
      )}

      {/* WISHLIST DRAWER */}
      
    </div>
  );
}