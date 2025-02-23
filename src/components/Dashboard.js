import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/customm-dashboard.css"; // Updated CSS class names
import ReactToPrint from "react-to-print";
import { FaTrash } from "react-icons/fa";


const Dashboard = () => {
  const navigate = useNavigate();
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const qrRef = useRef(null);
  const [isPublicKeyExpired, setIsPublicKeyExpired] = useState(false);
  

  useEffect(() => {
    if (!localStorage.getItem("token")) {
      navigate("/auth");
    } else {
      fetchpublicKey();
      fetchDocuments();
    }
  }, [navigate]);

  const fetchpublicKey = async () => {
    setLoading(true);
    setError("");
    try {
      const token = localStorage.getItem("token");
      const response = await fetch("http://127.0.0.1:5000/api/document/public_key", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch public key");
      }

      const data = await response.json();
      //check if data.public_key.expiry_date is less than current date and time
      console.log(data.expiry_date);
      const expiryDateUTC = new Date(data.expiry_date);
      const expiryDateIST = new Date(expiryDateUTC.getTime() + (5 * 60 + 30) * 60 * 1000);

    console.log("Public Key Expiry Date (IST):", expiryDateIST);

    const currentDateIST = new Date(new Date().toLocaleString("en-US", { timeZone: "Asia/Kolkata" }));
    console.log("Current Date (IST):", currentDateIST);

    // Compare expiry date and current date correctly
    if (expiryDateIST < currentDateIST) {
      setIsPublicKeyExpired(true);
    }
    } catch (error) {
      setError("Failed to load public key. Please try again.");
    } finally {
      setLoading(false);
    }
  };

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

  const resetPublicKey = async () => {
    setLoading(true);
    setError("");
    try {
      const token = localStorage.getItem("token");
      const response = await fetch("http://127.0.0.1:5000/api/document/reset_public_key", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to reset public key");
      }

      const data = await response.json();
      alert(data.status);

      setIsPublicKeyExpired(false);
    } catch (error) {
      setError("Failed to reset public key. Please try again.");
    }
    finally {
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

  const handleDelete = async (documentId) => {
    if (!window.confirm("Are you sure you want to delete this document?")) return;
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`http://127.0.0.1:5000/api/document/delete/${documentId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to delete document");
      }

      setDocuments((prevDocs) => prevDocs.filter((doc) => doc._id !== documentId));
    } catch (error) {
      alert("Error deleting document. Please try again.");
    }
  };
 


  return (
    <div className="custom-dashboard">
       {isPublicKeyExpired && (
        <div className="reset-button" onClick={resetPublicKey}>
          Reset Public Key
        </div>
      )}
      <h1>📂 Your Documents</h1>

      {loading && <div className="custom-loader">Loading...</div>}

      {error && <div className="custom-error">{error}</div>}

     

      {documents.length > 0 ? (
        <div className="custom-document-grid">
          {documents.map((doc) => (
            <div key={doc._id} className="custom-document-card">
              <div className="custom-delete-btn" onClick={() => handleDelete(doc._id)}>
                <FaTrash size={18} color="red" />
              </div>
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
