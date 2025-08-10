import React, { useState } from "react";
import "./index.css";

export default function App() {
  const [form, setForm] = useState({
    name: "",
    id: "",
    email: "",
    referringPhysician: "",
    symptoms: "",
    history: "",
    documents: "",
    notes: ""
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Form submitted:", form);
    // TODO: POST to backend API
  };

  return (
    <div className="min-h-screen bg-slate-100 p-6">
      <div className="max-w-4xl mx-auto space-y-6">

        {/* Title */}
        <div className="text-center">
          <h1 className="text-3xl font-bold text-blue-800">
            Patient Intake Form
          </h1>
          <p className="text-slate-600">
            Please complete the required fields before submission
          </p>
        </div>

        {/* Patient Demographics */}
        <div className="bg-white rounded-lg shadow-md p-6 space-y-4">
          <h2 className="text-xl font-semibold text-blue-700 border-b pb-2">
            Patient Demographics
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input
              className="input"
              name="name"
              placeholder="Full Name"
              value={form.name}
              onChange={handleChange}
            />
            <input
              className="input"
              name="id"
              placeholder="Patient ID"
              value={form.id}
              onChange={handleChange}
            />
            <input
              className="input"
              name="email"
              placeholder="Email"
              value={form.email}
              onChange={handleChange}
            />
            <input
              className="input"
              name="referringPhysician"
              placeholder="Referring Physician"
              value={form.referringPhysician}
              onChange={handleChange}
            />
          </div>
        </div>

        {/* Clinical Intake */}
        <div className="bg-white rounded-lg shadow-md p-6 space-y-4">
          <h2 className="text-xl font-semibold text-blue-700 border-b pb-2">
            Clinical Intake
          </h2>
          <textarea
            className="textarea"
            name="symptoms"
            placeholder="Symptoms"
            value={form.symptoms}
            onChange={handleChange}
          />
          <textarea
            className="textarea"
            name="history"
            placeholder="Medical History"
            value={form.history}
            onChange={handleChange}
          />
          <textarea
            className="textarea"
            name="documents"
            placeholder="Medical Documents and Imaging URLs (one per line)"
            value={form.documents}
            onChange={handleChange}
          />
          <textarea
            className="textarea"
            name="notes"
            placeholder="Notes"
            value={form.notes}
            onChange={handleChange}
          />
        </div>

        {/* Submit */}
        <div className="text-right">
          <button
            onClick={handleSubmit}
            className="btn bg-blue-600 hover:bg-blue-700"
          >
            Submit Form
          </button>
        </div>
      </div>
    </div>
  );
}
