import { useState } from "react";
import { useNavigate } from "react-router-dom";

const categories = ["Wallet", "Phone", "Keys", "Bag", "Books", "ID card", "Electronics", "Other"];

export default function ReportItem() {
  const navigate = useNavigate();
  const today = new Date().toISOString().split("T")[0];

  const [form, setForm] = useState({
    type: "lost",
    name: "",
    category: "Wallet",
    date: today,
    location: "",
    contact: "",
    description: "",
  });
  const [photo, setPhoto] = useState(null);

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  function handlePhoto(e) {
    const file = e.target.files[0];
    setPhoto(file ? URL.createObjectURL(file) : null);
  }

  function handleSubmit(e) {
    e.preventDefault();
    // Fake submit for now. The real one will send data to the backend.
    console.log("Report submitted:", form);
    navigate("/my-reports");
  }

  return (
    <div className="wrap">
      <h1>Report an item</h1>
      <p className="sub">
        Tell us what you lost or found. Contact details and sensitive
        information stay private.
      </p>

      <form className="form" onSubmit={handleSubmit}>
        <div className="full">
          <label>This item was</label>
          <div className="seg">
            <label className="opt">
              <input
                type="radio"
                name="type"
                value="lost"
                checked={form.type === "lost"}
                onChange={handleChange}
              />
              Lost
            </label>
            <label className="opt">
              <input
                type="radio"
                name="type"
                value="found"
                checked={form.type === "found"}
                onChange={handleChange}
              />
              Found
            </label>
          </div>
        </div>

        <div>
          <label htmlFor="name">Item name</label>
          <input id="name" name="name" type="text" placeholder="e.g. Black leather wallet" value={form.name} onChange={handleChange} required />
        </div>

        <div>
          <label htmlFor="category">Category</label>
          <select id="category" name="category" value={form.category} onChange={handleChange}>
            {categories.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="date">Date</label>
          <input id="date" name="date" type="date" max={today} value={form.date} onChange={handleChange} required />
        </div>

        <div>
          <label htmlFor="location">Location</label>
          <input id="location" name="location" type="text" placeholder="e.g. Library, Block A" value={form.location} onChange={handleChange} required />
        </div>

        <div className="full">
          <label htmlFor="contact">Your contact number</label>
          <input id="contact" name="contact" type="tel" placeholder="10-digit mobile number" value={form.contact} onChange={handleChange} required />
          <p className="hint">Shared with the owner only after their claim is approved.</p>
        </div>

        <div className="full">
          <label htmlFor="description">Description</label>
          <textarea id="description" name="description" rows="4" placeholder="Colour, brand, marks. Leave out private details like card numbers." value={form.description} onChange={handleChange} required />
        </div>

        <div className="full">
          <label htmlFor="photo">Photo (optional)</label>
          <input id="photo" type="file" accept="image/*" onChange={handlePhoto} />
          {photo && <img src={photo} alt="Preview" className="preview" />}
        </div>

        <div className="full actions">
          <button type="submit" className="btn">Submit report</button>
          <button type="button" className="btn alt" onClick={() => navigate(-1)}>Cancel</button>
        </div>
      </form>
    </div>
  );
}