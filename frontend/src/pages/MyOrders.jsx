import React, { useEffect, useState, useContext } from "react";
import { UserAuthContext } from "../contexts/UserAuthContext";
import API from "../api/api";
import autoTable from "jspdf-autotable";
import {
  Typography,
  Button,
  Stack,
  Divider,
  Chip,
  Stepper,
  Step,
  StepLabel,
} from "@mui/material";
import jsPDF from "jspdf";
import "./MyOrders.css";
import "bootstrap/dist/css/bootstrap.min.css";

export default function MyOrders() {
  const { user } = useContext(UserAuthContext);
  const [orders, setOrders] = useState([]);
  const [openOrder, setOpenOrder] = useState(null);

  const loadOrders = async () => {
    try {
      const { data } = await API.get("/orders/my");
      setOrders(data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)));
    } catch (err) {
      console.error("Failed to load orders", err);
    }
  };

  useEffect(() => {
    loadOrders();
  }, []);

  /* =====================================================
       STATUS TRACKING
  ===================================================== */
  const steps = ["Ordered", "Packed", "Shipped", "Delivered"];
  const getActiveStep = (status) =>
    status === "packed"
      ? 1
      : status === "shipped"
      ? 2
      : status === "delivered"
      ? 3
      : 0;

  /* =====================================================
       DELIVERY TIME CALCULATOR
  ===================================================== */
  const getDeliveryTime = (order) => {
    if (!order.deliveredAt) return "Not delivered yet";

    const start = new Date(order.createdAt);
    const end = new Date(order.deliveredAt);
    const diffMs = end - start;

    const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diffMs / (1000 * 60 * 60)) % 24);
    const minutes = Math.floor((diffMs / (1000 * 60)) % 60);

    return `${days}d ${hours}h ${minutes}m`;
  };

  /* =====================================================
       CANCEL ORDER
  ===================================================== */
  const cancelOrder = async (id) => {
    try {
      await API.put(`/orders/${id}/cancel`);
      loadOrders();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to cancel order");
    }
  };

  /* =====================================================
       PDF DOWNLOAD
  ===================================================== */
  const downloadInvoice = (order) => {
    const doc = new jsPDF();

    doc.setFontSize(18).text("UniMart - Invoice", 14, 20);
    doc.setFontSize(12);

    doc.text(`Order ID: ${order._id}`, 14, 30);
    doc.text(`Date: ${new Date(order.createdAt).toLocaleString()}`, 14, 38);

    if (order.deliveredAt) {
      doc.text(`Delivered On: ${new Date(order.deliveredAt).toLocaleString()}`, 14, 46);
      doc.text(`Delivery Time: ${getDeliveryTime(order)}`, 14, 54);
    }

    doc.text("Shipping Info:", 14, 68);
    doc.text(`Name: ${order.shippingInfo.name} ${order.shippingInfo.surname}`, 14, 76);
    doc.text(`Phone: ${order.shippingInfo.phone}`, 14, 84);
    doc.text(`Address: ${order.shippingInfo.address}`, 14, 92);

    autoTable(doc, {
      startY: 110,
      head: [["Product", "Qty", "Price", "Total"]],
      body: order.items.map((it) => [
        it.product?.title || "Deleted Product",
        it.quantity,
        `₹${it.price}`,
        `₹${it.price * it.quantity}`,
      ]),
    });

    doc.text(`Grand Total: ₹${order.total}`, 14, doc.lastAutoTable.finalY + 20);
    doc.save(`invoice_${order._id}.pdf`);
  };

  /* =====================================================
       UI
  ===================================================== */

  if (!orders.length)
    return <Typography className="no-orders">🛍️ No orders found.</Typography>;

  return (
    <div className="container py-3">

      <Typography variant="h4" className="text-center mb-4 orders-title">
        My Orders
      </Typography>

      <div className="row justify-content-center">
        <div className="col-lg-10 col-md-11 col-12">

          {orders.map((order) => (
            <div key={order._id} className="card order-card mb-4 shadow-sm p-3">

              {/* HEADER */}
              <div className="d-flex justify-content-between align-items-center flex-wrap">
                <h5 className="order-id mb-2">
                  Order #{order._id.slice(-8).toUpperCase()}
                </h5>

                <Chip
                  label={order.status.toUpperCase()}
                  className={`order-status ${order.status}`}
                />
              </div>

              <div className="text-muted mb-2">
                <strong>Placed on:</strong> {new Date(order.createdAt).toLocaleString()}
              </div>

              {order.deliveredAt && (
                <>
                  <div className="text-success mb-1">
                    <strong>Delivered on:</strong>{" "}
                    {new Date(order.deliveredAt).toLocaleString()}
                  </div>

                  <div className="text-primary fw-bold mb-2">
                    ⏱ Delivery Time: {getDeliveryTime(order)}
                  </div>
                </>
              )}

              <Divider className="my-3" />

              {/* TRACKING */}
              <h6 className="section-title">Order Tracking</h6>
              <Stepper activeStep={getActiveStep(order.status)} alternativeLabel>
                {steps.map((label) => (
                  <Step key={label}>
                    <StepLabel>{label}</StepLabel>
                  </Step>
                ))}
              </Stepper>

              <Divider className="my-3" />

              {/* SHIPPING INFO */}
              <h6 className="section-title">Shipping Info</h6>
              <div className="shipping-box">
                <p><strong>Name:</strong> {order.shippingInfo?.name} {order.shippingInfo?.surname}</p>
                <p><strong>Phone:</strong> {order.shippingInfo?.phone}</p>
                <p><strong>Address:</strong> {order.shippingInfo?.address}</p>
              </div>

              <Divider className="my-3" />

              {/* DROPDOWN BUTTON */}
              <Button
                variant="outlined"
                fullWidth
                className="toggle-items-btn"
                onClick={() => setOpenOrder(openOrder === order._id ? null : order._id)}
              >
                {openOrder === order._id ? "Hide Items ▲" : "View Items ▼"}
              </Button>

              {/* COLLAPSIBLE ITEMS */}
              {openOrder === order._id && (
                <div className="mt-3">
                  {order.items.map((it, index) => {
                    const product = it.product;
                    const subtotal = it.price * it.quantity;

                    return (
                      <div key={index} className="row item-row py-2 align-items-center">

                        <div className="col-4 col-md-2 text-center">
                          <img
                            src={product?.images?.[0]?.url || "/no-image.png"}
                            className="item-img"
                            alt=""
                          />
                        </div>

                        <div className="col-8 col-md-4">
                          <strong>{product?.title || "🗑️ Deleted Product"}</strong>
                        </div>

                        <div className="col-6 col-md-3 mt-2 mt-md-0">
                          ₹{it.price} × {it.quantity}
                        </div>

                        <div className="col-6 col-md-3 mt-2 mt-md-0 fw-bold">
                          = ₹{subtotal}
                        </div>

                      </div>
                    );
                  })}
                </div>
              )}

              <h5 className="order-total mt-4">
                Total: ₹{order.total}
              </h5>

              {/* ACTION BUTTONS */}
              <div className="d-flex gap-2 mt-3 flex-wrap">

                <Button
                  variant="contained"
                  className="invoice-btn"
                  onClick={() => downloadInvoice(order)}
                >
                  Download Invoice
                </Button>

                {order.status === "processing" && (
                  <Button
                    variant="outlined"
                    className="cancel-btn"
                    onClick={() => cancelOrder(order._id)}
                  >
                    Cancel Order
                  </Button>
                )}

              </div>

            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
