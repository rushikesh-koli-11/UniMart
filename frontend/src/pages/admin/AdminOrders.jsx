import React, { useEffect, useState } from "react";
import API from "../../api/api";
import { Modal, Button } from "react-bootstrap";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

import "./AdminOrders.css";

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [viewOrder, setViewOrder] = useState(null);
  const [search, setSearch] = useState("");

  const loadOrders = () =>
    API.get("/admin/orders").then((res) =>
      setOrders(
        res.data.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt))
      )
    );

  useEffect(() => {
    loadOrders();
  }, []);

  const updatePaymentStatus = async (id, paymentStatus) => {
    await API.put(`/admin/orders/${id}/payment`, { paymentStatus });
    loadOrders();
  };

  const updateOrderStatus = async (id, status) => {
    await API.put(`/admin/orders/${id}/status`, { status });
    loadOrders();
  };

  const deleteOrder = async (id) => {
    if (!window.confirm("Delete this order?")) return;
    await API.delete(`/admin/orders/${id}`);
    loadOrders();
  };

  const downloadInvoice = (order) => {
    const doc = new jsPDF();
    doc.setFontSize(18).text("INVOICE", 14, 20);
    doc.setFontSize(12);

    doc.text(`Order ID: ${order._id}`, 14, 30);
    doc.text(`Date: ${new Date(order.createdAt).toLocaleString()}`, 14, 38);
    doc.text(`Customer: ${order.user?.name}`, 14, 46);
    doc.text(`Phone: ${order.shippingInfo?.phone || "-"}`, 14, 54);
    doc.text(`Address: ${order.shippingInfo?.address || "-"}`, 14, 62);

    const items = order.items.map((i) => [
      i.product?.title,
      i.quantity,
      `₹${i.price}`,
      `₹${i.price * i.quantity}`,
    ]);

    autoTable(doc, {
      startY: 75,
      head: [["Product", "Qty", "Price", "Total"]],
      body: items,
    });

    const totalY = doc.lastAutoTable.finalY + 14;
    doc.setFontSize(14).text(`Grand Total: ₹${order.total}`, 14, totalY);

    doc.save(`Invoice_${order._id}.pdf`);
  };
  const matchesSearch = (o) => {
    const q = search.toLowerCase();
    return (
      o._id.toLowerCase().includes(q) ||
      o._id.slice(-6).toLowerCase().includes(q) ||
      (o.user?.name || "").toLowerCase().includes(q)
    );
  };

  const pendingOrders = orders.filter((o) => {
    const deliveredPaid = o.status === "delivered" && o.paymentStatus === "paid";
    const deliveredNotPaid = o.status === "delivered" && o.paymentStatus !== "paid";
    return matchesSearch(o) && !deliveredPaid && !deliveredNotPaid;
  });

  const deliveredNotPaid = orders.filter(
    (o) =>
      o.status === "delivered" &&
      o.paymentStatus !== "paid" &&
      matchesSearch(o)
  );

  const completedOrders = orders.filter(
    (o) =>
      o.status === "delivered" &&
      o.paymentStatus === "paid" &&
      matchesSearch(o)
  );

  return (
    <div className="container-fluid py-3">

      <div className="admin-orders-hero mb-4">
        <h1>Orders Dashboard</h1>
        <p>Manage, track, and verify all customer orders</p>
      </div>

      <div className="row mb-3 justify-content-center">
        <div className="col-md-4 col-sm-10">
          <input
            type="text"
            className="form-control search-input text-center"
            placeholder="Search by Order ID or User Name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <h3 className="orders-title mb-3">⏳ Pending Orders</h3>

      <div className="table-responsive shadow-sm rounded mb-4">
        <table className="table table-hover table-bordered align-middle text-center admin-table">
          <thead className="table-header">
            <tr>
              <th>Order ID</th>
              <th>User</th>
              <th>Address</th>
              <th>Total (₹)</th>
              <th>Payment</th>
              <th>Status</th>
              <th>Date</th>
              <th>Actions</th>
            </tr>
          </thead>

          <tbody>
            {pendingOrders.map((o) => (
              <tr key={o._id}>
                <td className="text-muted">#{o._id.slice(-6)}</td>
                <td>{o.user?.name}</td>
                <td>{o.shippingInfo?.address || "-"}</td>
                <td className="fw-bold text-success">₹{o.total}</td>

                <td>
                  <select
                    className="form-select form-select-sm"
                    value={o.paymentStatus}
                    onChange={(e) =>
                      updatePaymentStatus(o._id, e.target.value)
                    }
                  >
                    <option value="pending">Pending</option>
                    <option value="paid">Paid</option>
                    <option value="failed">Failed</option>
                  </select>
                </td>

                <td>
                  <select
                    className="form-select form-select-sm"
                    value={o.status}
                    onChange={(e) =>
                      updateOrderStatus(o._id, e.target.value)
                    }
                  >
                    <option value="processing">Processing</option>
                    <option value="shipped">Shipped</option>
                    <option value="delivered">Delivered</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </td>

                <td>{new Date(o.createdAt).toLocaleString()}</td>

                <td>
                  <button
                    className="btn btn-sm btn-view"
                    onClick={() => setViewOrder(o)}
                  >
                    View
                  </button>

                  <button
                    className="btn btn-sm btn-pdf"
                    onClick={() => downloadInvoice(o)}
                  >
                    PDF
                  </button>

                  <button
                    className="btn btn-sm btn-delete"
                    onClick={() => deleteOrder(o._id)}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

     {deliveredNotPaid.length > 0 && (
  <div className="mt-4">
    <h3 className="orders-title">⚠️ Delivered but Payment Not Paid</h3>

    <div className="table-responsive shadow-sm rounded mb-4">
      <table className="table table-hover table-bordered align-middle text-center admin-table">
        <thead className="table-header">
          <tr>
            <th>Order ID</th>
            <th>User</th>
            <th>Address</th>
            <th>Total (₹)</th>
            <th>Payment</th>
            <th>Status</th>
            <th>Delivered On</th>
            <th>Actions</th>
          </tr>
        </thead>

        <tbody>
          {deliveredNotPaid.map((o) => (
            <tr key={o._id}>
              <td className="text-muted">#{o._id.slice(-6)}</td>
              <td>{o.user?.name}</td>
              <td>{o.shippingInfo?.address}</td>

              <td className="fw-bold text-success">₹{o.total}</td>

              <td>
                <select
                  className="form-select form-select-sm"
                  value={o.paymentStatus}
                  onChange={(e) =>
                    updatePaymentStatus(o._id, e.target.value)
                  }
                >
                  <option value="pending">Pending</option>
                  <option value="paid">Paid</option>
                  <option value="failed">Failed</option>
                </select>
              </td>

              <td>
                <select className="form-select form-select-sm" disabled>
                  <option>Delivered</option>
                </select>
              </td>

              <td>{new Date(o.deliveredAt).toLocaleString()}</td>

              <td className="actions-col">
                <button
                  className="btn btn-sm btn-view"
                  onClick={() => setViewOrder(o)}
                >
                  View
                </button>

                <button
                  className="btn btn-sm btn-pdf"
                  onClick={() => downloadInvoice(o)}
                >
                  PDF
                </button>

                <button
                  className="btn btn-sm btn-delete"
                  onClick={() => deleteOrder(o._id)}
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
)}



     {completedOrders.length > 0 && (
  <div className="mt-4">
    <h3 className="orders-title">✔️ Delivered & Paid Orders</h3>

    <div className="table-responsive shadow-sm rounded mb-4">
      <table className="table table-hover table-bordered align-middle text-center admin-table">
        <thead className="table-header">
          <tr>
            <th>Order ID</th>
            <th>User</th>
            <th>Address</th>
            <th>Total (₹)</th>
            <th>Payment</th>
            <th>Status</th>
            <th>Delivered On</th>
            <th>Actions</th>
          </tr>
        </thead>

        <tbody>
          {completedOrders.map((o) => (
            <tr key={o._id}>
              <td className="text-muted">#{o._id.slice(-6)}</td>
              <td>{o.user?.name}</td>
              <td>{o.shippingInfo?.address}</td>

              <td className="fw-bold text-success">₹{o.total}</td>

              <td>
                <select className="form-select form-select-sm" disabled>
                  <option>Paid</option>
                </select>
              </td>

              <td>
                <select className="form-select form-select-sm" disabled>
                  <option>Delivered</option>
                </select>
              </td>

              <td>{new Date(o.deliveredAt).toLocaleString()}</td>

              <td className="actions-col">
                <button
                  className="btn btn-sm btn-view"
                  onClick={() => setViewOrder(o)}
                >
                  View
                </button>

                <button
                  className="btn btn-sm btn-pdf"
                  onClick={() => downloadInvoice(o)}
                >
                  PDF
                </button>

                <button
                  className="btn btn-sm btn-delete"
                  onClick={() => deleteOrder(o._id)}
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
)}


      <Modal show={!!viewOrder} onHide={() => setViewOrder(null)} centered size="lg">
        <Modal.Header closeButton className="modal-header-custom">
          <Modal.Title>Order Items</Modal.Title>
        </Modal.Header>

        <Modal.Body>
          {viewOrder?.items?.map((i) => (
            <div
              key={i.product?._id}
              className="item-box d-flex justify-content-between align-items-center p-2 mb-2"
            >
              <div className="d-flex align-items-center">
                <img
                  src={i.product?.images?.[0]?.url}
                  width="60"
                  height="60"
                  className="item-img"
                />

                <div className="ms-2">
                  <strong>{i.product?.title}</strong>
                  <div className="text-muted">Qty: {i.quantity}</div>
                </div>
              </div>

              <div className="fw-bold">₹{i.price * i.quantity}</div>
            </div>
          ))}
        </Modal.Body>

        <Modal.Footer>
          <Button variant="success" onClick={() => downloadInvoice(viewOrder)}>
            Download Invoice PDF
          </Button>

          <Button variant="secondary" onClick={() => setViewOrder(null)}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}
