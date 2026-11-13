import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../api";

const categories = ["Wallet", "Phone", "Keys", "Bag", "Books", "ID card", "Electronics", "Other"];

const MAX_PHOTO_MB = 3;
const PHOTO_TYPES = ["image/jpeg", "image/png", "image/webp"];

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
  const [photoFile, setPhotoFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError("");
  }

  function handlePhoto(e) {
    const file = e.target.files[0];

    if (!file) {
      setPhotoFile(null);
      setPreview(null);
      return;
    }

    // Check in the browser first, so the user finds out straight away
    if (!PHOTO_TYPES.includes(file.type)) {
      setError("Only JPG, PNG or WebP photos are allowed.");
      e.target.value = "";
      setPhotoFile(null);
      setPreview(null);
      return;
    }
    if (file.size > MAX_PHOTO_MB * 1024 * 1024) {
      setError(`The photo is too large (${MAX_PHOTO_MB} MB maximum).`);
      e.target.value = "";
      setPhotoFile(null);
      setPreview(null);
      return;
    }

    setError("");
    setPhotoFile(file);
    setPreview(URL.createObjectURL(file));
  }

  function removePhoto() {
    setPhotoFile(null);
    setPreview(null);
    document.getElementById("photo").value = "";
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setBusy(true);
    setError("");

    // A form with a file must be sent as FormData, not JSON
    const data = new FormData();
    Object.entries(form).forEach(([key, value]) => data.append(key, value));
    if (photoFile) data.append("photo", photoFile);

    try {
      await api("/items", { method: "POST", body: data });
      navigate("/my-reports");
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
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
          <input
            id="contact"
            name="contact"
            type="tel"
            inputMode="numeric"
            maxLength={10}
            pattern="[0-9]{10}"
            title="Enter a 10-digit mobile number"
            placeholder="10-digit mobile number"
            value={form.contact}
            onChange={handleChange}
            required
          />
          <p className="hint">Shared with the owner only after their claim is approved.</p>
        </div>

        <div className="full">
          <label htmlFor="description">Description</label>
          <textarea id="description" name="description" rows="4" placeholder="Colour, brand, marks. Leave out private details like card numbers." value={form.description} onChange={handleChange} required />
        </div>

        <div className="full">
          <label htmlFor="photo">Photo (optional)</label>
          <input id="photo" type="file" accept="image/jpeg,image/png,image/webp" onChange={handlePhoto} />
          <p className="hint">
            JPG, PNG or WebP, up to {MAX_PHOTO_MB} MB. Photos are public, so don't
            show ID numbers, card numbers or other personal details.
          </p>
          {preview && (
            <>
              <img src={preview} alt="Preview" className="preview" />
              <button type="button" className="btn alt sm remove-photo" onClick={removePhoto}>
                Remove photo
              </button>
            </>
          )}
        </div>

        {error && <p className="error full">{error}</p>}

        <div className="full actions">
          <button type="submit" className="btn" disabled={busy}>
            {busy ? "Submitting..." : "Submit report"}
          </button>
          <button type="button" className="btn alt" onClick={() => navigate(-1)}>Cancel</button>
        </div>
      </form>
    </div>
  );
}