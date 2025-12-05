import React, { useEffect, useState } from "react";
import Swal from "sweetalert2";
import API from "../../api/api";
import "./AdminMostlyUsed.css";

export default function AdminMostlyUsed() {
  const [items, setItems] = useState([]);
  const [file, setFile] = useState(null);
  const [link, setLink] = useState("");

  useEffect(() => {
    loadItems();
  }, []);

  const loadItems = async () => {
    try {
      const res = await API.get("/mostly-used/all");
      const sorted = res.data.data.sort((a, b) => a.order - b.order);
      setItems(sorted);
    } catch (err) {
      console.log(err);
    }
  };

  const uploadItem = async (e) => {
    e.preventDefault();

    if (!file || !link) {
      Swal.fire("Error", "Logo & link required", "error");
      return;
    }

    const fd = new FormData();
    fd.append("logo", file);
    fd.append("link", link);

    try {
      await API.post("/mostly-used/add", fd);

      Swal.fire("Success", "Added successfully", "success");
      setFile(null);
      setLink("");
      loadItems();
    } catch (err) {
      Swal.fire("Error", "Cannot upload", "error");
    }
  };

  const deleteItem = async (id) => {
    const ok = await Swal.fire({
      title: "Delete?",
      icon: "warning",
      showCancelButton: true
    });

    if (!ok.isConfirmed) return;

    await API.delete(`/mostly-used/${id}`);
    loadItems();
  };

  const moveItem = (index, dir) => {
    const arr = [...items];

    if (dir === "up" && index > 0) {
      [arr[index], arr[index - 1]] = [arr[index - 1], arr[index]];
    }
    if (dir === "down" && index < arr.length - 1) {
      [arr[index], arr[index + 1]] = [arr[index + 1], arr[index]];
    }

    const reordered = arr.map((x, i) => ({ ...x, order: i + 1 }));
    setItems(reordered);
  };

  const saveOrder = async () => {
    await API.put("/mostly-used/reorder", { items });
    Swal.fire("Saved", "Order saved successfully", "success");
    loadItems();
  };

  return (
    <div className="mused-wrapper">
      <div className="mused-container">

        <h3 className="mused-title">Manage Mostly Used Links</h3>
        <div className="mused-underline"></div>

        {/* Upload Box */}
        <form onSubmit={uploadItem} className="mused-upload-box">
          <input
            type="file"
            className="form-control"
            onChange={(e) => setFile(e.target.files[0])}
            required
          />

          <input
            type="text"
            placeholder="Enter Link"
            className="form-control"
            value={link}
            onChange={(e) => setLink(e.target.value)}
            required
          />

          <button className="mused-upload-btn">Upload</button>
        </form>

        {/* Grid */}
        <div className="mused-grid mt-4">
          {items.map((item, index) => (
            <div className="mused-card" key={item._id}>
              
              <div className="mused-controls">
                <button
                  type="button"
                  className="btn btn-sm btn-outline-primary"
                  onClick={() => moveItem(index, "up")}
                  disabled={index === 0}
                >
                  ↑
                </button>

                <button
                  type="button"
                  className="btn btn-sm btn-outline-primary"
                  onClick={() => moveItem(index, "down")}
                  disabled={index === items.length - 1}
                >
                  ↓
                </button>

                <button
                  type="button"
                  className="btn btn-sm btn-outline-danger"
                  onClick={() => deleteItem(item._id)}
                >
                  ✖
                </button>
              </div>

              <img src={item.logo} className="mused-logo" alt="" />

              <div className="mused-link">{item.link}</div>

            </div>
          ))}
        </div>

        {items.length > 1 && (
          <div className="text-center mt-4">
            <button className="mused-save-btn" onClick={saveOrder}>
              💾 Save Order
            </button>
          </div>
        )}

      </div>
    </div>
  );
}
