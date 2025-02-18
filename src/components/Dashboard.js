import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/customm-dashboard.css"; // Updated CSS class names
import ReactToPrint from "react-to-print";


const Dashboard = () => {
  const navigate = useNavigate();
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const qrRef = useRef(null);

  useEffect(() => {
    if (!localStorage.getItem("token")) {
      navigate("/auth");
    } else {
      fetchDocuments();
    }
  }, [navigate]);


  const fetchDocuments = async () => {
    setLoading(true);
    setError("");
    try {
      const token = localStorage.getItem("token");
      const response = await fetch("http://127.0.0.1:5000/api/document/documents", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch documents");
      }

      const data = await response.json();
      console.log(data);
      setDocuments(data);
    } catch (error) {
      setError("Failed to load documents. Please try again.");
    } finally {
      setLoading(false);
    }
  };


  const handlePrint = () => {
    // Open a new window and inject the QR code content
    const printWindow = window.open("", "_blank");
    printWindow.document.write(`
      <html>
        <head><title>QR Code</title></head>
        <body>
          <img src="${qrRef.current.src}" alt="QR Code" />
          <script type="text/javascript">window.print();</script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };
 


  return (
    <div className="custom-dashboard">
      <h1>📂 Your Documents</h1>

      {loading && <div className="custom-loader">Loading...</div>}

      {error && <div className="custom-error">{error}</div>}

      {documents.length > 0 ? (
        <div className="custom-document-grid">
          {documents.map((doc) => (
            <div key={doc._id} className="custom-document-card">
              <div ref={qrRef}>
                <img className="custom-document-icon" src={doc.qr_code_url} alt="Document qr" />
              </div>
              <h2>{doc.document_name}</h2>
              <p>Type: {doc.document_type}</p>
              <p>Created: {new Date(doc.created_at).toLocaleDateString()}</p>
              <p>
                {doc.is_verified ? (
                  <span className="verified-status">✔ Verified</span>
                ) : (
                  <span className="unverified-status">✘ Not Verified</span>
                )}
              </p>
              <a href={doc.file_url} target="_blank" rel="noopener noreferrer" className="custom-btn">
                View Document
              </a>
              {doc.qr_code_url && (
                <div className="custom-qr-code">
                  <button className="custom-btn" onClick={handlePrint}>
                    Download QR Code
                  </button>
                  <img
                    ref={qrRef}
                    className="custom-document-icon"
                    src={doc.qr_code_url}
                    alt="Document qr"
                    style={{ display: "none" }}
                  />
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <p>No documents available.</p>
      )}
    </div>
  );
};

export default Dashboard;
