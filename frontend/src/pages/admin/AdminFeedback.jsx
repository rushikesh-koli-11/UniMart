import React, { useEffect, useState } from "react";
import API from "../../api/api";
import { Table, Button, Container, Spinner } from "react-bootstrap";

export default function AdminFeedback() {
  const [feedbacks, setFeedbacks] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadFeedbacks = async () => {
    try {
      const { data } = await API.get("/feedback/all");
      setFeedbacks(data);
    } catch (err) {
      alert(err.response?.data?.message || "Failed to load feedbacks");
    } finally {
      setLoading(false);
    }
  };

  const deleteFeedback = async (id) => {
    if (!window.confirm("Are you sure you want to delete this feedback?")) return;
    try {
      await API.delete(`/feedback/${id}`);
      setFeedbacks(feedbacks.filter((f) => f._id !== id));
    } catch (err) {
      alert("Error deleting feedback");
    }
  };

  useEffect(() => {
    loadFeedbacks();
  }, []);

  if (loading) {
    return (
      <Container className="text-center mt-5">
        <Spinner animation="border" /> Loading feedbacks...
      </Container>
    );
  }

  return (
    <Container fluid className="mt-4">
      <h3 className="mb-3 fw-bold">📋 User Feedback Management</h3>

      <div className="table-responsive">
        <Table striped bordered hover className="align-middle text-center">
          <thead className="table-dark">
            <tr>
              <th>#</th>
              <th>User</th>
              <th>Email</th>
              <th>Phone</th>
              <th>Comment</th>
              <th>Date</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {feedbacks.map((fb, index) => (
              <tr key={fb._id}>
                <td>{index + 1}</td>
                <td>{fb.name || fb.user?.name}</td>
                <td>{fb.email || fb.user?.email}</td>
                <td>{fb.phone || fb.user?.phone}</td>
                <td style={{ textAlign: "left", maxWidth: "300px" }}>
                  {fb.comment}
                </td>
                <td>{new Date(fb.createdAt).toLocaleString()}</td>
                <td>
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={() => deleteFeedback(fb._id)}
                  >
                    Delete
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      </div>

      {feedbacks.length === 0 && (
        <p className="text-center mt-3 text-muted">
          No feedback available.
        </p>
      )}
    </Container>
  );
}
