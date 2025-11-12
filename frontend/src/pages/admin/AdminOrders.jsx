// frontend/src/pages/admin/AdminOrders.jsx
import React, { useEffect, useState } from "react";
import API from "../../api/api";
import { Modal, Button } from "react-bootstrap";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [viewOrder, setViewOrder] = useState(null);

  const loadOrders = () =>
    API.get("/admin/orders").then((res) =>
      setOrders(res.data.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt)))
    );

  useEffect(() => {
    loadOrders();
  }, []);

  // ✅ Update payment status
  const updatePaymentStatus = async (id, paymentStatus) => {
    await API.put(`/admin/orders/${id}/payment`, { paymentStatus });
    loadOrders();
  };

  // ✅ Update order status
  const updateOrderStatus = async (id, status) => {
    await API.put(`/admin/orders/${id}/status`, { status });
    loadOrders();
  };

  // ✅ Delete order
  const deleteOrder = async (id) => {
    if (!window.confirm("Delete this order?")) return;
    await API.delete(`/admin/orders/${id}`);
    loadOrders();
  };

  // ✅ PDF invoice
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

    const totalY = doc.lastAutoTable.finalY + 12;
    doc.setFontSize(14);
    doc.text(`Grand Total: ₹${order.total}`, 14, totalY);

    doc.save(`Invoice_${order._id}.pdf`);
  };

  return (
    <div className="container-fluid">
      <h2 className="fw-bold mb-3">📦 Orders Management</h2>

      <div className="table-responsive">
        <table className="table table-bordered table-striped text-center align-middle">
          <thead className="table-dark">
            <tr>
              <th>Order ID</th>
              <th>User</th>
              <th>Address</th>
              <th>Total (₹)</th>
              <th>Payment Status</th>
              <th>Order Status</th>
              <th>Date & Time</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((o) => (
              <tr key={o._id}>
                <td className="text-muted">#{o._id.slice(-6)}</td>
                <td>{o.user?.name}</td>
                <td style={{ maxWidth: "180px", wordBreak: "break-word" }}>
                  {o.shippingInfo?.address || "-"}
                </td>
                <td className="fw-bold">₹{o.total}</td>

                <td style={{ minWidth: "120px" }}>
                  <select
                    className="form-select form-select-sm"
                    value={o.paymentStatus}
                    onChange={(e) => updatePaymentStatus(o._id, e.target.value)}
                  >
                    <option value="pending">Pending</option>
                    <option value="paid">Paid</option>
                    <option value="failed">Failed</option>
                  </select>
                </td>

                <td style={{ minWidth: "140px" }}>
                  <select
                    className="form-select form-select-sm"
                    value={o.status}
                    onChange={(e) => updateOrderStatus(o._id, e.target.value)}
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
                    className="btn btn-primary btn-sm me-1"
                    onClick={() => setViewOrder(o)}
                  >
                    View
                  </button>
                  <button
                    className="btn btn-success btn-sm me-1"
                    onClick={() => downloadInvoice(o)}
                  >
                    PDF
                  </button>
                  <button
                    className="btn btn-danger btn-sm"
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

      {/* Modal for items */}
      <Modal show={!!viewOrder} onHide={() => setViewOrder(null)} centered size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Order Items</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {viewOrder?.items?.map((i) => (
            <div
              key={i._id}
              className="d-flex align-items-center justify-content-between border rounded p-2 mb-2"
            >
              <div className="d-flex align-items-center">
                <img
                  src={i.product?.images?.[0]?.url}
                  alt=""
                  width="60"
                  height="60"
                  style={{ objectFit: "cover", borderRadius: "4px" }}
                />
                <div className="ms-2">
                  <strong>{i.product?.title}</strong>
                  <div>Qty: {i.quantity}</div>
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
