import React, { useEffect, useState } from "react";
import API from "../../api/api";
import { Table, Button, Container, Spinner } from "react-bootstrap";
import "./AdminFeedback.css";

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
    if (!window.confirm("Delete this feedback?")) return;

    await API.delete(`/feedback/${id}`);
    setFeedbacks((prev) => prev.filter((f) => f._id !== id));
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
    <div className="admin-feedback-page container-fluid py-3">

      {/* HEADER */}
      <div className="row">
        <div className="col-12">
          <div className="feedback-header text-center">
            <h2>📋 Users Feedbacks </h2>
            <p>View and manage feedback submitted by customers.</p>
          </div>
        </div>
      </div>

      {/* TABLE */}
      <div className="row mt-3">
        <div className="col-12">
          <div className="table-responsive feedback-table-box">
            <Table bordered hover className="text-center align-middle feedback-table">
              <thead>
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
                {feedbacks.map((fb, i) => (
                  <tr key={fb._id}>
                    <td>{i + 1}</td>
                    <td>{fb.name || fb.user?.name}</td>
                    <td>{fb.email || fb.user?.email}</td>
                    <td>{fb.phone || fb.user?.phone}</td>

                    <td className="text-start comment-cell">{fb.comment}</td>

                    <td>{new Date(fb.createdAt).toLocaleString()}</td>

                    <td>
                      <Button
                        variant="danger"
                        size="sm"
                        className="delete-btn"
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
        </div>
      </div>

      {feedbacks.length === 0 && (
        <p className="text-center text-muted mt-3">No feedback available.</p>
      )}
    </div>
  );
}
