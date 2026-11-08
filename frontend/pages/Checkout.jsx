import React, { useEffect, useState } from "react";
import {
  Card,
  Row,
  Col,
  Steps,
  Form,
  Input,
  Select,
  Radio,
  Button,
  Divider,
  List,
  Avatar,
  Typography,
  ConfigProvider,
  Spin,
  notification,
  Tag,
  Empty,
} from "antd";
import { useDispatch, useSelector } from "react-redux";
import {
  MapPin,
  CreditCard,
  Wallet,
  ShieldCheck,
  Truck,
  ShoppingBag,
  Lock,
  CheckCircle2,
  SendToBack,
} from "lucide-react";
import {} from //   getCartThunkApi,
//   getCountriesThunkApi,
//   getStatesThunkApi,
//   getCitiesThunkApi,
//   placeOrderThunkApi,
"../slice/City.Slice";
import { listCityThunkApi } from "../slice/City.Slice";
import { listStateThunkApi } from "../slice/State.Slice";
import { listCountryThunkApi } from "../slice/Country.Slice";
import { createOrderThunkApi } from "../slice/Order.Slice";
import { useSearchParams } from "react-router";
import { verifyPaymentOrderThunkApi } from "../slice/Order.Slice";
const { Title, Text } = Typography;
const { Option } = Select;

export default function Checkout() {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(true);
  const [loadingOrderCreate, setLoadingOrderCreate] = useState();
  const [currentStep, setCurrentStep] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState("Card");
  let country_data = useSelector((state) => state.country.data);
  let state_data = useSelector((state) => state.state.data);
  let city_data = useSelector((state) => state.city.data);
  const [message, contextHolder] = notification.useNotification();
  const cart_item = JSON.parse(localStorage.getItem("cart")) || [];
  console.log(cart_item);
  const dispatch = useDispatch();
  const cart = useSelector((state) => state.order?.cart) || {
    items: [],
    subtotal: 0,
  };

  const countries = useSelector((state) => state.order?.countries) || [];

  useEffect(() => {
    handleListCountry();
    const query = new URLSearchParams(window.location.search);
    if (query.get("success")) {
      setCurrentStep(2);
      // Optional: Dispatch an API here to clear local cart or verify payment with backend
      localStorage.removeItem("cart");
    }
  }, []);
  const [searchParams] = useSearchParams();
  useEffect(() => {
    const payment = searchParams.get("payment");
    const sessionId = searchParams.get("session_id");

    if (payment === "success" && sessionId) {
      dispatch(
        verifyPaymentOrderThunkApi({
          session_id: sessionId,
        }),
      )
        .unwrap()
        .then(() => {
          localStorage.removeItem("cart");

          message.success({
            message: "Payment Successful",
          });

          setCurrentStep(2);
        })
        .catch(() => {
          message.error({
            message: "Payment Verification Failed",
          });
        });
    }

    if (payment === "cancel") {
      message.warning({
        message: "Payment Cancelled",
      });
    }
  }, []);

  const handleListCountry = () => {
    dispatch(listCountryThunkApi({ no_pagination: true }))
      .unwrap()
      .then((res) => {
        setLoading(false);
      });
  };

  const handleCountryChange = (country_name) => {
    form.setFieldsValue({ state: undefined, city: undefined });
    state_data = [];
    city_data = [];
    dispatch(
      listStateThunkApi({ country_name: country_name, no_pagination: true }),
    )
      .unwrap()
      .then((res) => {})
      .catch((error) => {
        message.error({
          title: "Error",
          description: error,
        });
      });
  };

  const handleStateChange = (state_name) => {
    form.setFieldsValue({ city: undefined });
    city_data = [];
    dispatch(listCityThunkApi({ state_name: state_name, no_pagination: true }))
      .unwrap()
      .then((res) => console.log(res))
      .catch((error) => {
        message.error({
          title: "Error",
          description: error,
        });
      });
  };
  const subtotal = cart_item.reduce(
    (total, item) => total + item.price * item.quantity,
    0,
  );
  const shippingCost = subtotal > 0 ? (cart.shipping_cost ?? 9.99) : 0;
  const taxAmount = +(subtotal * 0.08).toFixed(2);
  const totalAmount = +(subtotal + shippingCost + taxAmount).toFixed(2);

  const handlePlaceOrder = () => {
    setLoadingOrderCreate(true);

    form
      .validateFields()
      .then((values) => {
        const payload = {
          items: cart_item,
          address: values.address,
          country: values.country,
          state: values.state,
          city: values.city,
          subtotal: subtotal,
          shipping_cost: shippingCost,
          tax_amount: taxAmount,
          total_amount: totalAmount,
        };

        dispatch(createOrderThunkApi(payload))
          .unwrap()
          .then((res) => {
            message.success({
              message: "Redirecting",
              description: "Redirecting to Stripe Secure Checkout...",
            });

            // Redirect to Stripe Checkout
            window.location.href = res.data.checkout_url;
          })
          .catch((error) => {
            message.error({
              message: "Order Failed",
              description: String(error),
            });
          })
          .finally(() => {
            setLoadingOrderCreate(false);
          });
      })
      .catch(() => {
        setLoadingOrderCreate(false);

        message.warning({
          message: "Incomplete Details",
          description: "Please fill in all required fields.",
        });
      });
  };

  if (loading) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "80vh",
        }}
      >
        <Spin size="large" tip="Loading checkout..." />
      </div>
    );
  }

  return (
    <ConfigProvider
      theme={{
        token: {
          colorPrimary: "#1677ff",
          borderRadius: 12,
        },
      }}
    >
      {contextHolder}
      <div
        className="checkout-wrapper"
        style={{ padding: "24px", background: "#f5f5f5", minHeight: "100vh" }}
      >
        {/* Header */}
        <div style={{ marginBottom: 24 }}>
          <Title level={2} style={{ margin: 0 }}>
            Checkout
          </Title>
          <Text type="secondary">
            Review your order, confirm shipping details, and complete payment
            securely.
          </Text>
        </div>

        {/* Steps */}
        <Card bordered={false} style={{ marginBottom: 24 }}>
          <Steps
            current={currentStep}
            items={[
              { title: "Shipping", icon: <MapPin size={16} /> },
              { title: "Payment", icon: <CreditCard size={16} /> },
              { title: "Confirmation", icon: <CheckCircle2 size={16} /> },
            ]}
          />
        </Card>

        {currentStep === 2 ? (
          <Card bordered={false} style={{ textAlign: "center", padding: 40 }}>
            <CheckCircle2
              size={56}
              color="#52c41a"
              style={{ marginBottom: 16 }}
            />
            <Title level={3}>Order Confirmed</Title>
            <Text type="secondary">
              Thank you for your purchase. A confirmation has been sent to your
              account, and your items are being prepared for shipment.
            </Text>
            <div style={{ marginTop: 24 }}>
              <Link to="/order/">
  <Button type="primary" size="large">
    View My Orders
  </Button>
</Link>
            </div>
          </Card>
        ) : (
          <Row gutter={[24, 24]}>
            {/* LEFT COLUMN: Shipping + Payment */}
            <Col xs={24} lg={15}>
              <Card
                bordered={false}
                title={
                  <span
                    style={{ display: "flex", alignItems: "center", gap: 8 }}
                  >
                    <Truck size={18} color="#1677ff" /> Shipping Address
                  </span>
                }
                style={{ marginBottom: 24 }}
              >
                <Form form={form} layout="vertical" requiredMark={false}>
                  <Form.Item
                    label="Street Address"
                    name="address"
                    rules={[
                      { required: true, message: "Please enter your address" },
                    ]}
                  >
                    <Input.TextArea
                      rows={2}
                      placeholder="House no, street, landmark"
                    />
                  </Form.Item>

                  <Row gutter={16}>
                    <Col xs={24} sm={8}>
                      <Form.Item
                        label="Country"
                        name="country"
                        rules={[{ required: true, message: "Required" }]}
                      >
                        <Select
                          placeholder="Select country"
                          onChange={(value, option) => {
                            handleCountryChange(option.label);
                          }}
                          options={country_data.map((item) => ({
                            value: item.id,
                            label: item.name,
                          }))}
                          showSearch={false}
                          optionFilterProp="children"
                        ></Select>
                      </Form.Item>
                    </Col>
                    <Col xs={24} sm={8}>
                      <Form.Item
                        label="State"
                        name="state"
                        rules={[{ required: true, message: "Required" }]}
                      >
                        <Select
                          placeholder="Select state"
                          onChange={(value, option) => {
                            handleStateChange(option.label);
                          }}
                          options={state_data.map((item) => ({
                            value: item.id,
                            label: item.name,
                          }))}
                          disabled={!state_data.length}
                          showSearch={false}
                          optionFilterProp="children"
                        ></Select>
                      </Form.Item>
                    </Col>
                    <Col xs={24} sm={8}>
                      <Form.Item
                        label="City"
                        name="city"
                        rules={[{ required: true, message: "Required" }]}
                      >
                        <Select
                          placeholder="Select city"
                          disabled={!city_data.length}
                          showSearch={false}
                          optionFilterProp="children"
                        >
                          {city_data.map((c) => (
                            <Option key={c.id} value={c.id}>
                              {c.name}
                            </Option>
                          ))}
                        </Select>
                      </Form.Item>
                    </Col>
                  </Row>
                </Form>
              </Card>
            </Col>

            {/* RIGHT COLUMN: Order Summary */}
            <Col xs={24} lg={9}>
              <Card
                bordered={false}
                title={
                  <span
                    style={{ display: "flex", alignItems: "center", gap: 8 }}
                  >
                    <ShoppingBag size={18} color="#1677ff" /> Order Summary
                  </span>
                }
                style={{ position: "sticky", top: 24 }}
              >
                {cart_item.length === 0 ? (
                  <Empty description="Your cart is empty" />
                ) : (
                  <List
                    dataSource={cart_item}
                    itemLayout="horizontal"
                    renderItem={(item) => (
                      <List.Item style={{ padding: "12px 0" }}>
                        <List.Item.Meta
                          avatar={
                            <Avatar shape="square" size={56} src={item.image} />
                          }
                          title={
                            <Text strong style={{ fontSize: 14 }}>
                              {item.product_name}
                            </Text>
                          }
                          description={
                            <div>
                              <div style={{ display: "flex", gap: 6 }}>
                                {item.color && (
                                  <Tag color="blue">{item.color}</Tag>
                                )}
                                {item.size && <Tag>{item.size}</Tag>}
                              </div>
                              <Text type="secondary" style={{ fontSize: 12 }}>
                                Qty: {item.quantity}
                              </Text>
                            </div>
                          }
                        />
                        <Text strong>
                          ${Number(item.quantity * item.price).toFixed(2)}
                        </Text>
                      </List.Item>
                    )}
                  />
                )}

                <Divider style={{ margin: "12px 0" }} />

                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    marginBottom: 8,
                  }}
                >
                  <Text type="secondary">Subtotal</Text>
                  <Text>${subtotal}</Text>
                </div>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    marginBottom: 8,
                  }}
                >
                  <Text type="secondary">Shipping</Text>
                  <Text>${shippingCost}</Text>
                </div>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    marginBottom: 8,
                  }}
                >
                  <Text type="secondary">Tax (8%)</Text>
                  <Text>${taxAmount.toFixed(2)}</Text>
                </div>

                <Divider style={{ margin: "12px 0" }} />

                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    marginBottom: 20,
                  }}
                >
                  <Title level={4} style={{ margin: 0 }}>
                    Total
                  </Title>
                  <Title level={4} style={{ margin: 0, color: "#1677ff" }}>
                    ${totalAmount.toFixed(2)}
                  </Title>
                </div>

                <Button
                  type="primary"
                  size="large"
                  block
                  loading={loadingOrderCreate}
                  disabled={cart_item.length === 0}
                  onClick={handlePlaceOrder}
                  icon={<Lock size={16} style={{ marginRight: 4 }} />}
                >
                  Place Order Securely
                </Button>
              </Card>
            </Col>
          </Row>
        )}
      </div>
    </ConfigProvider>
  );
}
