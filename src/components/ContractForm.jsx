import React, { useState } from "react";

import { useSearchParams } from "react-router-dom";

const ContractForm = ({ defaultType = "Offer Letter" }) => {
  const [searchParams] = useSearchParams();
  const urlType = searchParams.get("type");
  const [type, setType] = useState(urlType || defaultType);
  const [fields, setFields] = useState({
    // Company fields
    companyName: "",
    companyAddress: "",
    logoImage: "",
    signatureImage: "",
    // Owner fields
    ownerName: "",
    ownerAddress: "",
    ownerSignature: "",
    // Tenant/Recipient fields
    recipientName: "",
    tenantSignature: "",
    // Employment fields
    position: "",
    location: "",
    startDate: "",
    workingDays: "",
    workingHours: "",
    compensation: "",
    benefits: "",
    // Rental fields
    propertyAddress: "",
    rentAmount: "",
    duration: "",
    securityDeposit: "",
    utilities: "",
    // Freelance fields
    projectScope: "",
    deliverables: "",
    paymentTerms: "",
    revisions: "",
    // Common fields
    additionalTerms: "",
  });
  const [contract, setContract] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [documentUrl, setDocumentUrl] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFields((prev) => ({ ...prev, [name]: value }));
    setError("");
  };

  const handleImageUpload = (e, fieldName) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFields((prev) => ({ ...prev, [fieldName]: reader.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const getRequiredFields = () => {
    switch (type) {
      case "Rental Contract":
        return [
          "ownerName",
          "ownerAddress",
          "recipientName",
          "propertyAddress",
          "rentAmount",
          "duration",
        ];
      case "Freelance Contract":
        return [
          "companyName",
          "recipientName",
          "projectScope",
          "deliverables",
          "paymentTerms",
        ];
      default: // Offer Letter & Employment Contract
        return [
          "companyName",
          "recipientName",
          "position",
          "startDate",
          "compensation",
          "workingHours",
        ];
    }
  };

  const validateForm = () => {
    const requiredFields = getRequiredFields();
    const missingFields = requiredFields.filter((field) => !fields[field]);

    if (missingFields.length > 0) {
      setError(
        `Please fill in all required fields: ${missingFields.join(", ")}`
      );
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await fetch("http://localhost:5000/generate-contract", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ type: type, fields }),
      });

      if (!response.ok) {
        throw new Error(`Server error: ${response.status}`);
      }

      const data = await response.json();

      if (data.error) {
        throw new Error(data.error);
      }

      setContract(data.contract);

      // Store the document URL for download button
      if (data.fileUrl) {
        setDocumentUrl(`http://localhost:5000${data.fileUrl}`);
      }
    } catch (error) {
      setError(error.message || "Failed to generate contract");
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = () => {
    if (documentUrl) {
      const link = document.createElement("a");
      link.href = documentUrl;
      link.download = documentUrl.split("/").pop();
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const generatePreview = () => {
    if (!fields.recipientName) {
      return "Enter recipient details to see preview";
    }

    let previewContent = "";

    switch (type) {
      case "Offer Letter":
        previewContent = `
Dear ${fields.recipientName},

We are pleased to offer you the position of ${fields.position || "[Position]"} at ${fields.companyName || "[Company Name]"}.

Start Date: ${fields.startDate || "[Start Date]"}
Working Hours: ${fields.workingHours || "[Working Hours]"}
Compensation: ${fields.compensation || "[Compensation]"}

${fields.benefits ? `Benefits: ${fields.benefits}` : ""}
${fields.additionalTerms ? `Additional Terms: ${fields.additionalTerms}` : ""}

We look forward to welcoming you to our team.

Sincerely,
${fields.companyName || "[Company Name]"}
        `;
        break;

      case "Rental Contract":
        previewContent = `
RENTAL AGREEMENT

BETWEEN:
${fields.ownerName || "[Owner Name]"} (Landlord)
${fields.ownerAddress || "[Owner Address]"}

AND:
${fields.recipientName || "[Tenant Name]"} (Tenant)

PROPERTY:
${fields.propertyAddress || "[Property Address]"}

TERMS:
Rent Amount: ${fields.rentAmount || "[Rent Amount]"}
Duration: ${fields.duration || "[Duration]"}
${fields.securityDeposit ? `Security Deposit: ${fields.securityDeposit}` : ""}
${fields.utilities ? `Utilities Included: ${fields.utilities}` : ""}
${fields.additionalTerms ? `Additional Terms: ${fields.additionalTerms}` : ""}
        `;
        break;

      case "Freelance Contract":
        previewContent = `
FREELANCE AGREEMENT

BETWEEN:
${fields.companyName || "[Company Name]"} (Client)
${fields.companyAddress || "[Company Address]"}

AND:
${fields.recipientName || "[Freelancer Name]"} (Freelancer)

PROJECT DETAILS:
${fields.projectScope || "[Project Scope]"}

DELIVERABLES:
${fields.deliverables || "[Deliverables]"}

PAYMENT TERMS:
${fields.paymentTerms || "[Payment Terms]"}

${fields.revisions ? `Revision Policy: ${fields.revisions}` : ""}
${fields.additionalTerms ? `Additional Terms: ${fields.additionalTerms}` : ""}
        `;
        break;

      case "Job Contract":
        previewContent = `
JOB CONTRACT

BETWEEN:
${fields.companyName || "[Company Name]"} (Employer)
${fields.companyAddress || "[Company Address]"}

AND:
${fields.recipientName || "[Employee Name]"} (Employee)

POSITION: ${fields.position || "[Position]"}
${fields.location ? `Location: ${fields.location}` : ""}
Start Date: ${fields.startDate || "[Start Date]"}
${fields.duration ? `Duration: ${fields.duration}` : ""}
Working Hours: ${fields.workingHours || "[Working Hours]"}
${fields.workingDays ? `Working Days: ${fields.workingDays}` : ""}

COMPENSATION:
${fields.compensation || "[Compensation]"}
${fields.benefits ? `Benefits: ${fields.benefits}` : ""}

${fields.additionalTerms ? `Additional Terms: ${fields.additionalTerms}` : ""}
        `;
        break;
    }

    return previewContent;
  };

  const renderFields = () => {
    switch (type) {
      case "Rental Contract":
        return (
          <>
            <div className="mb-6 p-6 bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow transition-shadow">
              <h3 className="mt-0 mb-4 text-blue-600 text-xl font-semibold border-b-2 border-gray-200 pb-2">Owner Information</h3>
              <div className="mb-4">
                <label className="block mb-1 font-medium">
                  Owner Name*
                  <input
                    className="w-full mt-1 px-3 py-2 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                    name="ownerName"
                    value={fields.ownerName}
                    onChange={handleChange}
                    placeholder="Full legal name"
                  />
                </label>
              </div>
              <div className="mb-4">
                <label className="block mb-1 font-medium">
                  Owner Address*
                  <input
                    className="w-full mt-1 px-3 py-2 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                    name="ownerAddress"
                    value={fields.ownerAddress}
                    onChange={handleChange}
                    placeholder="Complete address"
                  />
                </label>
              </div>
              <div className="mb-4">
                <label className="block mb-1 font-medium">
                  Owner Signature
                  <input
                    className="w-full mt-1 px-3 py-2 border border-gray-200 rounded-md bg-gray-50 cursor-pointer hover:bg-blue-50 hover:border-blue-600 transition-colors"
                    type="file"
                    name="ownerSignature"
                    onChange={(e) => handleImageUpload(e, "ownerSignature")}
                    accept="image/*"
                  />
                </label>
              </div>
            </div>
            <div className="mb-6 p-6 bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow transition-shadow">
              <h3 className="mt-0 mb-4 text-blue-600 text-xl font-semibold border-b-2 border-gray-200 pb-2">Property Information</h3>
              <div className="mb-4">
                <label className="block mb-1 font-medium">
                  Property Address*
                  <input
                    className="w-full mt-1 px-3 py-2 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                    name="propertyAddress"
                    value={fields.propertyAddress}
                    onChange={handleChange}
                    placeholder="Complete property address"
                  />
                </label>
              </div>
              <div className="mb-4">
                <label className="block mb-1 font-medium">
                  Monthly Rent*
                  <input
                    className="w-full mt-1 px-3 py-2 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                    name="rentAmount"
                    value={fields.rentAmount}
                    onChange={handleChange}
                    placeholder="e.g., ₹25,000"
                  />
                </label>
              </div>
              <div className="mb-4">
                <label className="block mb-1 font-medium">
                  Lease Duration*
                  <input
                    className="w-full mt-1 px-3 py-2 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                    name="duration"
                    value={fields.duration}
                    onChange={handleChange}
                    placeholder="e.g., 11 months"
                  />
                </label>
              </div>
              <div className="mb-4">
                <label className="block mb-1 font-medium">
                  Security Deposit
                  <input
                    className="w-full mt-1 px-3 py-2 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                    name="securityDeposit"
                    value={fields.securityDeposit}
                    onChange={handleChange}
                    placeholder="e.g., ₹50,000"
                  />
                </label>
              </div>
              <div className="mb-4">
                <label className="block mb-1 font-medium">
                  Utilities Included
                  <input
                    className="w-full mt-1 px-3 py-2 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                    name="utilities"
                    value={fields.utilities}
                    onChange={handleChange}
                    placeholder="e.g., Water, Electricity"
                  />
                </label>
              </div>
            </div>
            <div className="mb-6 p-6 bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow transition-shadow">
              <h3 className="mt-0 mb-4 text-blue-600 text-xl font-semibold border-b-2 border-gray-200 pb-2">Tenant Signature</h3>
              <div className="mb-4">
                <label className="block mb-1 font-medium">
                  Tenant Signature
                  <input
                    className="w-full mt-1 px-3 py-2 border border-gray-200 rounded-md bg-gray-50 cursor-pointer hover:bg-blue-50 hover:border-blue-600 transition-colors"
                    type="file"
                    name="tenantSignature"
                    onChange={(e) => handleImageUpload(e, "tenantSignature")}
                    accept="image/*"
                  />
                </label>
              </div>
            </div>
          </>
        );

      case "Freelance Contract":
        return (
          <>
            <div className="mb-6 p-6 bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow transition-shadow">
              <h3 className="mt-0 mb-4 text-blue-600 text-xl font-semibold border-b-2 border-gray-200 pb-2">Company Information</h3>
              <div className="mb-4">
                <label className="block mb-1 font-medium">
                  Company Name*
                  <input
                    className="w-full mt-1 px-3 py-2 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                    name="companyName"
                    value={fields.companyName}
                    onChange={handleChange}
                    placeholder="Legal company name"
                  />
                </label>
              </div>
              <div className="mb-4">
                <label className="block mb-1 font-medium">
                  Company Address
                  <input
                    className="w-full mt-1 px-3 py-2 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                    name="companyAddress"
                    value={fields.companyAddress}
                    onChange={handleChange}
                    placeholder="Complete company address"
                  />
                </label>
              </div>
              <div className="mb-4">
                <label className="block mb-1 font-medium">
                  Company Logo
                  <input
                    className="w-full mt-1 px-3 py-2 border border-gray-200 rounded-md bg-gray-50 cursor-pointer hover:bg-blue-50 hover:border-blue-600 transition-colors"
                    type="file"
                    name="logoImage"
                    onChange={(e) => handleImageUpload(e, "logoImage")}
                    accept="image/*"
                  />
                </label>
              </div>
              <div className="mb-4">
                <label className="block mb-1 font-medium">
                  Authorized Signature
                  <input
                    className="w-full mt-1 px-3 py-2 border border-gray-200 rounded-md bg-gray-50 cursor-pointer hover:bg-blue-50 hover:border-blue-600 transition-colors"
                    type="file"
                    name="signatureImage"
                    onChange={(e) => handleImageUpload(e, "signatureImage")}
                    accept="image/*"
                  />
                </label>
              </div>
            </div>
            <div className="mb-6 p-6 bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow transition-shadow">
              <h3 className="mt-0 mb-4 text-blue-600 text-xl font-semibold border-b-2 border-gray-200 pb-2">Project Details</h3>
              <div className="mb-4">
                <label className="block mb-1 font-medium">
                  Project Scope*
                  <textarea
                    className="w-full mt-1 px-3 py-2 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent h-24 resize-y"
                    name="projectScope"
                    value={fields.projectScope}
                    onChange={handleChange}
                    placeholder="Detailed description of the project scope"
                  />
                </label>
              </div>
              <div className="mb-4">
                <label className="block mb-1 font-medium">
                  Deliverables*
                  <textarea
                    className="w-full mt-1 px-3 py-2 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent h-24 resize-y"
                    name="deliverables"
                    value={fields.deliverables}
                    onChange={handleChange}
                    placeholder="List all deliverables"
                  />
                </label>
              </div>
              <div className="mb-4">
                <label className="block mb-1 font-medium">
                  Payment Terms*
                  <textarea
                    className="w-full mt-1 px-3 py-2 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent h-24 resize-y"
                    name="paymentTerms"
                    value={fields.paymentTerms}
                    onChange={handleChange}
                    placeholder="Payment schedule and terms"
                  />
                </label>
              </div>
              <div className="mb-4">
                <label className="block mb-1 font-medium">
                  Revision Policy
                  <textarea
                    className="w-full mt-1 px-3 py-2 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent h-24 resize-y"
                    name="revisions"
                    value={fields.revisions}
                    onChange={handleChange}
                    placeholder="Number of revisions included"
                  />
                </label>
              </div>
            </div>
          </>
        );

      default: // Offer Letter & Employment Contract
        return (
          <>
            <div className="mb-6 p-6 bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow transition-shadow">
              <h3 className="mt-0 mb-4 text-blue-600 text-xl font-semibold border-b-2 border-gray-200 pb-2">Company Information</h3>
              <div className="mb-4">
                <label className="block mb-1 font-medium">
                  Company Name*
                  <input
                    className="w-full mt-1 px-3 py-2 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                    name="companyName"
                    value={fields.companyName}
                    onChange={handleChange}
                    placeholder="Legal company name"
                  />
                </label>
              </div>
              <div className="mb-4">
                <label className="block mb-1 font-medium">
                  Company Address
                  <input
                    className="w-full mt-1 px-3 py-2 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                    name="companyAddress"
                    value={fields.companyAddress}
                    onChange={handleChange}
                    placeholder="Complete company address"
                  />
                </label>
              </div>
              <div className="mb-4">
                <label className="block mb-1 font-medium">
                  Company Logo
                  <input
                    className="w-full mt-1 px-3 py-2 border border-gray-200 rounded-md bg-gray-50 cursor-pointer hover:bg-blue-50 hover:border-blue-600 transition-colors"
                    type="file"
                    name="logoImage"
                    onChange={(e) => handleImageUpload(e, "logoImage")}
                    accept="image/*"
                  />
                </label>
              </div>
              <div className="mb-4">
                <label className="block mb-1 font-medium">
                  Authorized Signature
                  <input
                    className="w-full mt-1 px-3 py-2 border border-gray-200 rounded-md bg-gray-50 cursor-pointer hover:bg-blue-50 hover:border-blue-600 transition-colors"
                    type="file"
                    name="signatureImage"
                    onChange={(e) => handleImageUpload(e, "signatureImage")}
                    accept="image/*"
                  />
                </label>
              </div>
            </div>
            <div className="mb-6 p-6 bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow transition-shadow">
              <h3 className="mt-0 mb-4 text-blue-600 text-xl font-semibold border-b-2 border-gray-200 pb-2">Employment Details</h3>
              <div className="mb-4">
                <label className="block mb-1 font-medium">
                  Position*
                  <input
                    className="w-full mt-1 px-3 py-2 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                    name="position"
                    value={fields.position}
                    onChange={handleChange}
                    placeholder="Job title or role"
                  />
                </label>
              </div>
              <div className="mb-4">
                <label className="block mb-1 font-medium">
                  Office Location
                  <input
                    className="w-full mt-1 px-3 py-2 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                    name="location"
                    value={fields.location}
                    onChange={handleChange}
                    placeholder="Work location"
                  />
                </label>
              </div>
              <div className="mb-4">
                <label className="block mb-1 font-medium">
                  Start Date*
                  <input
                    className="w-full mt-1 px-3 py-2 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                    name="startDate"
                    value={fields.startDate}
                    onChange={handleChange}
                    type="date"
                  />
                </label>
              </div>
              <div className="mb-4">
                <label className="block mb-1 font-medium">
                  Duration
                  <input
                    className="w-full mt-1 px-3 py-2 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                    name="duration"
                    value={fields.duration}
                    onChange={handleChange}
                    placeholder="e.g., 6 months, 1 year"
                  />
                </label>
              </div>
            </div>
            <div className="mb-6 p-6 bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow transition-shadow">
              <h3 className="mt-0 mb-4 text-blue-600 text-xl font-semibold border-b-2 border-gray-200 pb-2">Work Schedule</h3>
              <div className="mb-4">
                <label className="block mb-1 font-medium">
                  Working Days
                  <input
                    className="w-full mt-1 px-3 py-2 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                    name="workingDays"
                    value={fields.workingDays}
                    onChange={handleChange}
                    placeholder="e.g., Monday to Friday"
                  />
                </label>
              </div>
              <div className="mb-4">
                <label className="block mb-1 font-medium">
                  Working Hours*
                  <input
                    className="w-full mt-1 px-3 py-2 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                    name="workingHours"
                    value={fields.workingHours}
                    onChange={handleChange}
                    placeholder="e.g., 9:00 AM to 6:00 PM"
                  />
                </label>
              </div>
            </div>
            <div className="mb-6 p-6 bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow transition-shadow">
              <h3 className="mt-0 mb-4 text-blue-600 text-xl font-semibold border-b-2 border-gray-200 pb-2">Compensation</h3>
              <div className="mb-4">
                <label className="block mb-1 font-medium">
                  Compensation*
                  <input
                    className="w-full mt-1 px-3 py-2 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                    name="compensation"
                    value={fields.compensation}
                    onChange={handleChange}
                    placeholder="e.g., ₹75,000 per month"
                  />
                </label>
              </div>
              <div className="mb-4">
                <label className="block mb-1 font-medium">
                  Benefits
                  <textarea
                    className="w-full mt-1 px-3 py-2 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent h-24 resize-y"
                    name="benefits"
                    value={fields.benefits}
                    onChange={handleChange}
                    placeholder="List all benefits, one per line"
                  />
                </label>
              </div>
            </div>
          </>
        );
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 bg-gray-100 min-h-screen">
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Form Section - Left Side */}
        <div className="lg:w-1/2 w-full h-full overflow-y-auto">
          <form onSubmit={handleSubmit} className="bg-white p-6 rounded-xl shadow-md border border-gray-200">
            <div className="mb-6">
              <label className="block mb-2 font-medium">
                Document Type
                <select 
                  className="w-full mt-1 px-3 py-2 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent bg-white"
                  value={type} 
                  onChange={(e) => setType(e.target.value)}
                >
                  <option value="Offer Letter">Offer Letter</option>
                  <option value="Job Contract">Job Contract</option>
                  <option value="Rental Contract">Rental Contract</option>
                  <option value="Freelance Contract">Freelance Contract</option>
                </select>
              </label>
            </div>

            <div className="mb-6 p-6 bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow transition-shadow">
              <h3 className="mt-0 mb-4 text-blue-600 text-xl font-semibold border-b-2 border-gray-200 pb-2">Recipient Information</h3>
              <div className="mb-4">
                <label className="block mb-1 font-medium">
                  Recipient Name*
                  <input
                    className="w-full mt-1 px-3 py-2 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                    name="recipientName"
                    value={fields.recipientName}
                    onChange={handleChange}
                    placeholder="Full name of recipient"
                  />
                </label>
              </div>
            </div>

            {renderFields()}

            <div className="mb-6 p-6 bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow transition-shadow">
              <h3 className="mt-0 mb-4 text-blue-600 text-xl font-semibold border-b-2 border-gray-200 pb-2">Additional Terms</h3>
              <div className="mb-4">
                <label className="block mb-1 font-medium">
                  Additional Terms & Conditions
                  <textarea
                    className="w-full mt-1 px-3 py-2 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent h-24 resize-y"
                    name="additionalTerms"
                    value={fields.additionalTerms}
                    onChange={handleChange}
                    rows="4"
                  />
                </label>
              </div>
            </div>

            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md text-red-600">
                {error}
              </div>
            )}

            <div className="flex gap-4">
              <button
                type="submit"
                className="px-6 py-3 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={loading}
              >
                {loading ? "Generating..." : "Generate Contract"}
              </button>

              {documentUrl && (
                <button
                  type="button"
                  onClick={handleDownload}
                  className="px-6 py-3 bg-green-600 text-white font-medium rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-600 focus:ring-offset-2 transition-colors"
                >
                  Download Document
                </button>
              )}
            </div>
          </form>
        </div>

        {/* Preview Section - Right Side */}
        <div className="lg:w-1/2 w-full">
          <div className="bg-white p-6 rounded-xl shadow-md border border-gray-200 h-full">
            <h2 className="text-2xl font-bold text-blue-600 mb-4 border-b-2 border-gray-200 pb-2">Document Preview</h2>
            <div className="bg-gray-50 p-4 rounded-md border border-gray-200 h-[calc(100%-3rem)] overflow-y-auto whitespace-pre-wrap font-mono text-sm">
              {generatePreview()}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContractForm;
