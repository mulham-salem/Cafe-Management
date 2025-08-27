import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import styles from "./styles/MyAccount.module.css";

/**
 * MyAccount.jsx
 * - Full component with file upload flow (upload-first)
 * - Preview uses URL.createObjectURL(file)
 * - On save: upload image (if selected) -> get image_url -> update profile
 *
 * Backend:
 * POST /api/user/upload-avatar   -> returns { image_url: "https://..." } (or url/path)
 * PUT  /api/user/profile         -> accepts JSON with image_url and other fields
 */

const mockProfile = {
  first_name: "mulham",
  last_name: "salem",
  username: "mulham.cafe",
  email: "mulham@example.com",
  image_url:
    "https://images.unsplash.com/photo-1509042239860-f550ce710b93?q=80&w=800&auto=format&fit=crop&ixlib=rb-4.0.3&s=coffee",
  phone_number: "0994435873",
  company_name: "MS_One",
  address: "Damascus",
  points_balance: 125.75,
  tier: "Gold",
};

export default function MyAccount() {
  const [profile, setProfile] = useState(null);
  const [form, setForm] = useState({
    first_name: "",
    last_name: "",
    username: "",
    email: "",
    image_url: "",
    phone_number: "",
    company_name: "",
    address: "",
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  // file upload state
  const [localFile, setLocalFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState("");

  // Fetch profile on mount
  useEffect(() => {
    fetchProfile();
    return () => {
      // cleanup preview if component unmounts
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, []);

  const fetchProfile = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("authToken");
      const res = await axios.get("/api/user/profile", {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });

      const data = res?.data ?? mockProfile;
      setProfile(data);
      setForm({
        first_name: data.first_name || "",
        last_name: data.last_name || "",
        username: data.username || "",
        email: data.email || "",
        image_url: data.image_url || "",
        phone_number: data.phone_number || "",
        company_name: data.company_name || "",
        address: data.address || "",
        points_balance: data.points_balance ?? 0,
        tier: data.tier ?? "Bronze",
      });
    } catch (err) {
      console.warn("Could not fetch profile, using mock:", err?.message || err);
      toast.info("Displaying mock profile data — API unavailable.");
      const data = mockProfile;
      setProfile(data);
      setForm({
        first_name: data.first_name,
        last_name: data.last_name,
        username: data.username,
        email: data.email,
        image_url: data.image_url,
        phone_number: data.phone_number,
        company_name: data.company_name,
        address: data.address,
      });
    } finally {
      setLoading(false);
    }
  };

  // Simple client-side validation
  const validate = () => {
    const e = {};
    if (!form.first_name.trim()) e.first_name = "First name is required";
    if (!form.last_name.trim()) e.last_name = "Last name is required";
    if (!form.username.trim()) e.username = "Username is required";
    if (!form.phone_number.trim()) e.phone_number = "Phone number is required";
    if (!form.company_name.trim()) e.company_name = "Company name is required";
    if (!form.address.trim()) e.address = "Address is required";
    if (form.username && form.username.length < 3)
      e.username = "Username must be at least 3 characters";
    if (!form.email.trim()) e.email = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
      e.email = "Email is not valid";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  // Input change handler
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((s) => ({ ...s, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: undefined }));
  };

  // File selection handler
  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // validate type & size (example: max 3MB)
    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file.");
      return;
    }
    if (file.size > 3 * 1024 * 1024) {
      toast.error("Image must be smaller than 3MB.");
      return;
    }

    // revoke previous preview if any
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      setPreviewUrl("");
    }

    const url = URL.createObjectURL(file);
    setLocalFile(file);
    setPreviewUrl(url);
  };

  // Upload single file to server; returns public URL or null
  const uploadProfileImage = async (file) => {
    if (!file) return null;
    const formData = new FormData();
    formData.append("avatar", file); // backend should expect 'avatar' field name
    const token = localStorage.getItem("authToken");

    try {
      const res = await axios.post("/api/user/upload-avatar", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });

      // backend might return image_url or url or path
      const imageUrl =
        res?.data?.image_url ?? res?.data?.url ?? res?.data?.path ?? null;
      return imageUrl;
    } catch (err) {
      console.error("Image upload failed:", err);
      const serverMessage =
        err?.response?.data?.message || err?.response?.data?.error;
      toast.error("Image upload failed. " + (serverMessage ?? ""));
      return null;
    }
  };

  // Submit handler: upload image first, then update profile
  const handleSubmit = async (ev) => {
    ev.preventDefault();
    if (!validate()) {
      toast.error("Please fix the errors before submitting.");
      return;
    }

    setSaving(true);
    try {
      // 1) upload image if user selected a local file
      let uploadedUrl = null;
      if (localFile) {
        uploadedUrl = await uploadProfileImage(localFile);
        if (!uploadedUrl) {
          // stop if upload failed
          throw new Error("Image upload failed");
        }
      }

      // 2) prepare payload for profile update
      const payload = {
        first_name: form.first_name.trim(),
        last_name: form.last_name.trim(),
        username: form.username.trim(),
        email: form.email.trim(),
        image_url: uploadedUrl ?? form.image_url ?? null,
        phone_number: form.phone_number.trim() ?? "",
        company_name: form.company_name.trim() ?? "",
        address: form.address.trim() ?? "",
      };

      // 3) update profile
      const token = localStorage.getItem("authToken");
      const res = await axios.put("/api/user/profile", payload, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });

      // use returned user object or fallback to payload
      const updated = res?.data ?? payload;
      setProfile(updated);
      setForm({
        first_name: updated.first_name || "",
        last_name: updated.last_name || "",
        username: updated.username || "",
        email: updated.email || "",
        image_url: updated.image_url || "",
        phone_number: updated.phone_number || "",
        company_name: updated.company_name || "",
        address: updated.address || "",
      });

      // cleanup local file & preview
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
        setPreviewUrl("");
      }
      setLocalFile(null);

      toast.success("Profile updated successfully");
    } catch (err) {
      console.error("Update profile failed:", err);
      const serverMessage =
        err?.response?.data?.message || err?.response?.data?.error;
      toast.error(
        serverMessage || "An error occurred while updating the profile."
      );
    } finally {
      setSaving(false);
    }
  };

  // Reset form to last saved profile state
  const handleReset = () => {
    if (!profile) return;
    setForm({
      first_name: profile.first_name || "",
      last_name: profile.last_name || "",
      username: profile.username || "",
      email: profile.email || "",
      image_url: profile.image_url || "",
      phone_number: profile.phone_number || "",
      company_name: profile.company_name || "",
      address: profile.address || "",
    });
    setErrors({});
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      setPreviewUrl("");
    }
    setLocalFile(null);
    toast.info("Values reset to last saved state");
  };

  if (loading || !profile) {
    return (
      <div className="profilePage">
        <div className="center">
          <div className={styles.loader} aria-hidden="true"></div>
          <p>Loading account data...</p>
        </div>
      </div>
    );
  }

  const supplierPath = location.pathname === "/login/supplier-home/my-account";
  const customerPath = location.pathname === "/login/customer-home/my-account";

  return (
    <div className="profilePage">
      <ToastContainer />
      <header className="header">
        <h1 className="profileTitle">My Account</h1>
        <p className={styles.subtitle}>
          Edit your personal details or change your password to secure your
          account.
        </p>
      </header>

      <main className="cardContainer">
        {/* Profile preview card */}
        <section className="profileCard">
          <div className="avatarWrap">
            <img
              src={
                previewUrl ||
                form.image_url ||
                profile.image_url ||
                mockProfile.image_url
              }
              alt={`${form.first_name} ${form.last_name}`}
              className={styles.avatar}
            />
          </div>

          <div className={styles.info}>
            <h2 className={styles.name}>
              {profile.first_name} {profile.last_name}
            </h2>
            <p className={styles.username}>{profile.username}</p>
            <p className={styles.email}>{profile.email}</p>

            {customerPath && (
              <div className={styles.loyaltyInfo}>
                <p className={styles.points}>
                  <strong>Points Balance:</strong>{" "}
                  {profile.points_balance?.toFixed(2)}
                </p>
                <p className={styles.tier}>
                  <strong>Tier:</strong> {profile.tier}
                </p>
              </div>
            )}

            <div className="actionsRow">
              <Link
                to="/change-password"
                state={{ from: location.pathname }}
                className={styles.changePassBtn}
              >
                Change Password
              </Link>

              <button
                className={styles.refreshBtn}
                onClick={fetchProfile}
                aria-label="Refresh profile"
              >
                Refresh
              </button>
            </div>
          </div>
        </section>

        {/* Edit form */}
        <section className="editSection">
          <form onSubmit={handleSubmit} className={styles.form}>
            <div className={styles.row}>
              <label className={styles.label}>
                First name
                <input
                  name="first_name"
                  value={form.first_name}
                  onChange={handleChange}
                  className={styles.input}
                  placeholder="First name"
                  disabled={saving}
                />
                {errors.first_name && (
                  <small className={styles.error}>{errors.first_name}</small>
                )}
              </label>

              <label className={styles.label}>
                Last name
                <input
                  name="last_name"
                  value={form.last_name}
                  onChange={handleChange}
                  className={styles.input}
                  placeholder="Last name"
                  disabled={saving}
                />
                {errors.last_name && (
                  <small className={styles.error}>{errors.last_name}</small>
                )}
              </label>
            </div>

            <div className={styles.row}>
              <label className={styles.label}>
                Username
                <input
                  name="username"
                  value={form.username}
                  onChange={handleChange}
                  className={styles.input}
                  placeholder="Username"
                  disabled={saving}
                />
                {errors.username && (
                  <small className={styles.error}>{errors.username}</small>
                )}
              </label>

              <label className={styles.label}>
                Email
                <input
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  className={styles.input}
                  placeholder="email@example.com"
                  disabled={saving}
                />
                {errors.email && (
                  <small className={styles.error}>{errors.email}</small>
                )}
              </label>
            </div>

            {supplierPath && (
              <div className={styles.row}>
                <label className={styles.label}>
                  Phone number
                  <input
                    name="phone_number"
                    value={form.phone_number}
                    onChange={handleChange}
                    className={styles.input}
                    placeholder="Phone number"
                    disabled={saving}
                  />
                  {errors.phone_number && (
                    <small className={styles.error}>
                      {errors.phone_number}
                    </small>
                  )}
                </label>

                <label className={styles.label}>
                  Company name
                  <input
                    name="company_name"
                    value={form.company_name}
                    onChange={handleChange}
                    className={styles.input}
                    placeholder="company name"
                    disabled={saving}
                  />
                  {errors.company_name && (
                    <small className={styles.error}>
                      {errors.company_name}
                    </small>
                  )}
                </label>
              </div>
            )}

            {customerPath && (
              <div className={styles.row}>
                <label className={styles.label}>
                  Phone number
                  <input
                    name="phone_number"
                    value={form.phone_number}
                    onChange={handleChange}
                    className={styles.input}
                    placeholder="Phone number"
                    disabled={saving}
                  />
                  {errors.phone_number && (
                    <small className={styles.error}>
                      {errors.phone_number}
                    </small>
                  )}
                </label>

                <label className={styles.label}>
                  Address
                  <input
                    name="address"
                    value={form.address}
                    onChange={handleChange}
                    className={styles.input}
                    placeholder="address"
                    disabled={saving}
                  />
                  {errors.company_name && (
                    <small className={styles.error}>{errors.address}</small>
                  )}
                </label>
              </div>
            )}

            {/* File input + preview - Redesigned with fixed alignment */}
            <div className={styles.imageUploadContainer}>
              <div className={styles.uploadColumn}>
                <label className={styles.label}>
                  Profile image
                  <div className={styles.fileInputWrapper}>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange}
                      className={styles.fileInput}
                      disabled={saving}
                      id="profileImageInput"
                    />
                    <label
                      htmlFor="profileImageInput"
                      className={styles.fileInputLabel}
                    >
                      Choose Image
                    </label>
                    <span className={styles.fileName}>
                      {localFile ? localFile.name : "No file chosen"}
                    </span>
                  </div>
                  <small className={styles.fileHint}>
                    Max 3MB. JPG, PNG, GIF, WEBP allowed.
                  </small>
                </label>
              </div>

              <div className={styles.previewColumn}>
                <span className={styles.previewLabel}>Preview</span>
                <div className={styles.circularPreview}>
                  {previewUrl || form.image_url ? (
                    <img
                      src={previewUrl || form.image_url || profile.image_url}
                      alt="profile preview"
                      className={styles.previewImage}
                    />
                  ) : (
                    <div className={styles.emptyPreview}></div>
                  )}
                </div>
              </div>
            </div>

            <div className={styles.formFooter}>
              <button
                type="submit"
                className={styles.saveBtn}
                disabled={saving}
                aria-busy={saving}
              >
                {saving ? "Saving..." : "Save changes"}
              </button>

              <button
                type="button"
                className={styles.resetBtn}
                onClick={handleReset}
                disabled={saving}
              >
                Reset
              </button>
            </div>
          </form>
        </section>
      </main>
    </div>
  );
}
