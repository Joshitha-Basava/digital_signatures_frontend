import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import html2canvas from "html2canvas";
import { toPng } from "html-to-image";
import "../styles/dashboard.css";

function UploadDocument() {

    const navigate = useNavigate();
  const [selectedFile, setSelectedFile] = useState(null);
  const [documentName, setDocumentName] = useState("");
  const [documentType, setDocumentType] = useState("");
  const [uploadStatus, setUploadStatus] = useState("");
  const [fileUrl, setFileUrl] = useState(null);
  const [qrCodeUrl, setQrCodeUrl] = useState(null);
  const qrRef = useRef(null);
  const [qrBase64, setQrBase64] = useState(null);

  const fetchProxyQR = async (firebaseUrl) => {
    try {
      const backendUrl =`http://127.0.0.1:5000/fetch_qr?qr_url=${encodeURIComponent(firebaseUrl)}`;
      setQrBase64(backendUrl);
    } catch (error) {
      console.error("Error fetching QR code through proxy:", error);
    }
  };

  useEffect(() => {
    if (qrCodeUrl) {
      fetchProxyQR(qrCodeUrl);
    }
  }, [qrCodeUrl]);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/auth");
    }
  }, [navigate]);

  const handleFileChange = (event) => {
    setSelectedFile(event.target.files[0]);
  };

  const handleUpload = async () => {
    if (!selectedFile || !documentName || !documentType) {
      setUploadStatus("❌ Please fill in all fields and select a file.");
      return;
    }

    const formData = new FormData();
    formData.append("document_name", documentName);
    formData.append("document_type", documentType);
    formData.append("file", selectedFile);

    try {
      setUploadStatus("⏳ Uploading...");
      const token = localStorage.getItem("token");

      const response = await fetch("http://127.0.0.1:5000/api/document/upload", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      const data = await response.json();

      if (response.ok) {
        setUploadStatus("✅ Upload successful!");
        setFileUrl(data.file_url);
        setQrCodeUrl(data.qr_code_url);
      } else {
        setUploadStatus(`❌ Upload failed: ${data.detail || "Unknown error"}`);
      }
    } catch (error) {
      setUploadStatus("❌ Upload error. Please try again.");
    }
  };

  const handleDownloadQR = () => {
    if (qrRef.current) {
      html2canvas(qrRef.current, { useCORS: true })
        .then((canvas) => {
          const link = document.createElement("a");
          link.href = canvas.toDataURL("image/png");
          link.download = "qr_code.png";
          link.click();
        })
        .catch((err) => {
          console.error("QR Code download failed", err);
        });
    }
  };


  return (
    <div className="dashboard-container">
      <h2>Upload Documents for secure authentication</h2>

      <div className="upload-section">
        <input
          type="text"
          placeholder="Document Name"
          value={documentName}
          onChange={(e) => setDocumentName(e.target.value)}
        />
        <input
          type="text"
          placeholder="Document Type (e.g., PDF, Image)"
          value={documentType}
          onChange={(e) => setDocumentType(e.target.value)}
        />
        <input type="file" onChange={handleFileChange} />
        <button onClick={handleUpload}>Upload Document</button>
      </div>

      {uploadStatus && <p className="upload-status">{uploadStatus}</p>}

      {fileUrl && (
        <div className="file-section">
          <h3>📄 Uploaded Document</h3>
          <a href={fileUrl} target="_blank" rel="noopener noreferrer">
            View Document
          </a>
        </div>
      )}

      {qrBase64 && (
        <div className="qr-code-section">
          <h3>📌 Scan QR Code for Verification</h3>
          <div ref={qrRef}>
          <img src={qrBase64} alt="QR Code" />
          </div>
          <button onClick={handleDownloadQR}>Download QR Code</button>
        </div>
      )}

    </div>
  );
}

export default UploadDocument;
