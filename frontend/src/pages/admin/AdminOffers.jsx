import React, { useEffect, useState } from "react";
import API from "../../api/api";
import "./AdminOffers.css";

export default function AdminOffers() {
  const [offers, setOffers] = useState([]);
  const [categories, setCategories] = useState([]);
  const [subcategories, setSubcategories] = useState([]);
  const [products, setProducts] = useState([]);

  const [editingOffer, setEditingOffer] = useState(null);

  const emptyForm = {
    title: "",
    description: "",
    scopeType: "product", // product | subcategory | category | cart
    category: "",
    subcategoryId: "",
    product: "",
    discountType: "percentage",
    discountValue: "",
    minCartAmount: "",
    minMrp: "",
    couponCode: "",
    autoApply: true,
    active: true,
    startDate: "",
    endDate: "",
  };

  const [form, setForm] = useState(emptyForm);

  /* =====================================================
      LOAD ALL DATA
  ===================================================== */
  const loadData = async () => {
    try {
      const [offersRes, categoriesRes, productsRes] = await Promise.all([
        API.get("/admin/offers"),   // admin route
        API.get("/categories"),     // category route
        API.get("/products"),       // ✔ correct product route
      ]);

      setOffers(offersRes.data);
      setCategories(categoriesRes.data);
      setProducts(productsRes.data);

      // extract subcategories
      const subs = [];
      categoriesRes.data.forEach((cat) => {
        if (Array.isArray(cat.subcategories)) {
          cat.subcategories.forEach((sub) => {
            subs.push({
              _id: sub._id,
              name: sub.name,
              parentCategory: cat._id,
              parentCategoryName: cat.name,
            });
          });
        }
      });

      setSubcategories(subs);

    } catch (err) {
      console.error("❌ ERROR LOADING DATA:", err);
      alert("Could not load categories/products. Check server logs.");
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  /* =====================================================
      HANDLE CHANGES
  ===================================================== */
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleScopeChange = (e) => {
    setForm({
      ...emptyForm,
      scopeType: e.target.value,
    });
  };

  /* =====================================================
      SUBMIT (CREATE / UPDATE)
  ===================================================== */
  const handleSubmit = async (e) => {
    e.preventDefault();

    const payload = {
      ...form,
      discountValue: Number(form.discountValue),
      minCartAmount: Number(form.minCartAmount) || 0,
      minMrp: Number(form.minMrp) || 0,
    };

    try {
      if (editingOffer) {
        await API.put(`/admin/offers/${editingOffer._id}`, payload);
      } else {
        await API.post("/admin/offers", payload);
      }

      resetForm();
      loadData();

    } catch (err) {
      console.error("❌ SAVE ERROR:", err);
      alert(err.response?.data?.message || "Failed to save offer");
    }
  };

  const resetForm = () => {
    setEditingOffer(null);
    setForm(emptyForm);
  };

  /* =====================================================
      EDIT OFFER
  ===================================================== */
  const startEdit = (offer) => {
    setEditingOffer(offer);

    setForm({
      title: offer.title,
      description: offer.description || "",
      scopeType: offer.scopeType,
      category: offer.category?._id || "",
      subcategoryId: offer.subcategoryId || "",
      product: offer.product?._id || "",
      discountType: offer.discountType,
      discountValue: offer.discountValue,
      minCartAmount: offer.minCartAmount || "",
      minMrp: offer.minMrp || "",
      couponCode: offer.couponCode || "",
      autoApply: offer.autoApply,
      active: offer.active,
      startDate: offer.startDate ? offer.startDate.slice(0, 10) : "",
      endDate: offer.endDate ? offer.endDate.slice(0, 10) : "",
    });
  };

  /* =====================================================
      DELETE OFFER
  ===================================================== */
  const deleteOffer = async (id) => {
    if (!window.confirm("Delete this offer?")) return;

    try {
      await API.delete(`/admin/offers/${id}`);
      loadData();
    } catch (err) {
      console.error("❌ DELETE ERROR:", err);
    }
  };

  /* =====================================================
      CONDITIONAL SELECT BOXES
  ===================================================== */
  const renderScopeSelector = () => {
    if (form.scopeType === "category") {
      return (
        <div className="col-md-4 mb-3">
          <label>Select Category</label>
          <select
            name="category"
            className="form-select"
            value={form.category}
            onChange={handleChange}
          >
            <option value="">Choose...</option>
            {categories.map((c) => (
              <option key={c._id} value={c._id}>{c.name}</option>
            ))}
          </select>
        </div>
      );
    }

    if (form.scopeType === "subcategory") {
      return (
        <div className="col-md-4 mb-3">
          <label>Select Subcategory</label>
          <select
            name="subcategoryId"
            className="form-select"
            value={form.subcategoryId}
            onChange={handleChange}
          >
            <option value="">Choose...</option>
            {subcategories.map((s) => (
              <option key={s._id} value={s._id}>
                {s.parentCategoryName} → {s.name}
              </option>
            ))}
          </select>
        </div>
      );
    }

    if (form.scopeType === "product") {
      return (
        <div className="col-md-4 mb-3">
          <label>Select Product</label>
          <select
            name="product"
            className="form-select"
            value={form.product}
            onChange={handleChange}
          >
            <option value="">Choose...</option>
            {products.map((p) => (
              <option key={p._id} value={p._id}>{p.title}</option>
            ))}
          </select>
        </div>
      );
    }

    return null; // cart-level
  };

  /* =====================================================
      UI
  ===================================================== */
  return (
    <div className="container py-3">

      <div className="admin-orders-hero mb-4">
        <h1>Offers & Discounts</h1>
        <p>Manage Product, Subcategory, Category, and Cart-level offers.</p>
      </div>

      {/* ===================== FORM ===================== */}
      <div className="card shadow-sm p-3 mb-4">
        <h4>{editingOffer ? "Edit Offer" : "Create New Offer"}</h4>

        <form onSubmit={handleSubmit} className="mt-3">

          <div className="row">

            <div className="col-md-4 mb-3">
              <label>Title</label>
              <input
                className="form-control"
                name="title"
                value={form.title}
                onChange={handleChange}
                required
              />
            </div>

            <div className="col-md-4 mb-3">
              <label>Scope Type</label>
              <select
                name="scopeType"
                className="form-select"
                value={form.scopeType}
                onChange={handleScopeChange}
              >
                <option value="product">Product</option>
                <option value="subcategory">Subcategory</option>
                <option value="category">Category</option>
                <option value="cart">Cart Total</option>
              </select>
            </div>

            <div className="col-md-4 mb-3">
              <label>Discount Type</label>
              <select
                name="discountType"
                className="form-select"
                value={form.discountType}
                onChange={handleChange}
              >
                <option value="percentage">Percentage (%)</option>
                <option value="flat">Flat (₹)</option>
              </select>
            </div>

            {renderScopeSelector()}

            {form.scopeType === "cart" && (
              <div className="col-md-4 mb-3">
                <label>Min Cart Amount (₹)</label>
                <input
                  type="number"
                  className="form-control"
                  name="minCartAmount"
                  value={form.minCartAmount}
                  onChange={handleChange}
                />
              </div>
            )}

            <div className="col-md-4 mb-3">
              <label>Discount Value</label>
              <input
                type="number"
                className="form-control"
                name="discountValue"
                value={form.discountValue}
                onChange={handleChange}
                required
              />
            </div>

            <div className="col-md-4 mb-3">
              <label>Min MRP (Optional)</label>
              <input
                type="number"
                className="form-control"
                name="minMrp"
                value={form.minMrp}
                onChange={handleChange}
              />
            </div>

            <div className="col-md-4 mb-3">
              <label>Coupon Code (Optional)</label>
              <input
                className="form-control"
                name="couponCode"
                value={form.couponCode}
                onChange={handleChange}
              />
            </div>

            <div className="col-md-3">
              <label>Start Date</label>
              <input
                type="date"
                className="form-control"
                name="startDate"
                value={form.startDate}
                onChange={handleChange}
              />
            </div>

            <div className="col-md-3">
              <label>End Date</label>
              <input
                type="date"
                className="form-control"
                name="endDate"
                value={form.endDate}
                onChange={handleChange}
              />
            </div>

            <div className="col-md-3 d-flex align-items-center">
              <input
                type="checkbox"
                name="autoApply"
                checked={form.autoApply}
                onChange={handleChange}
              />
              <label className="ms-2">Auto Apply</label>
            </div>

            <div className="col-md-3 d-flex align-items-center">
              <input
                type="checkbox"
                name="active"
                checked={form.active}
                onChange={handleChange}
              />
              <label className="ms-2">Active</label>
            </div>

            <div className="col-12 mt-3">
              <button className="btn btn-primary me-2" type="submit">
                {editingOffer ? "Update Offer" : "Create Offer"}
              </button>

              {editingOffer && (
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={resetForm}
                >
                  Cancel
                </button>
              )}
            </div>

          </div>
        </form>
      </div>

      {/* ===================== OFFER TABLE ===================== */}
      <div className="table-responsive shadow-sm">
        <table className="table table-bordered text-center align-middle">
          <thead className="table-header">
            <tr>
              <th>Title</th>
              <th>Scope</th>
              <th>Target</th>
              <th>Discount</th>
              <th>Active</th>
              <th>Auto</th>
              <th>Start</th>
              <th>End</th>
              <th>Coupon</th>
              <th>Actions</th>
            </tr>
          </thead>

          <tbody>
            {offers.map((o) => {
              const target =
                o.scopeType === "category"
                  ? categories.find((c) => c._id === o.category)?.name
                  : o.scopeType === "subcategory"
                  ? subcategories.find((s) => s._id === o.subcategoryId)?.name
                  : o.scopeType === "product"
                  ? products.find((p) => p._id === o.product)?.title
                  : "Cart";

              const discount =
                o.discountType === "percentage"
                  ? `${o.discountValue}%`
                  : `₹${o.discountValue}`;

              return (
                <tr key={o._id}>
                  <td>{o.title}</td>
                  <td>{o.scopeType}</td>
                  <td>{target || "-"}</td>
                  <td>{discount}</td>
                  <td>{o.active ? "Yes" : "No"}</td>
                  <td>{o.autoApply ? "Yes" : "No"}</td>
                  <td>{o.startDate ? new Date(o.startDate).toLocaleDateString() : "-"}</td>
                  <td>{o.endDate ? new Date(o.endDate).toLocaleDateString() : "-"}</td>
                  <td>{o.couponCode || "-"}</td>

                  <td>
                    <button
                      className="btn btn-sm btn-view me-1"
                      onClick={() => startEdit(o)}
                    >
                      Edit
                    </button>
                    <button
                      className="btn btn-sm btn-delete"
                      onClick={() => deleteOffer(o._id)}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>

        </table>
      </div>
    </div>
  );
}
