import React, { useState, useEffect, useRef } from "react";
import { Html5Qrcode } from "html5-qrcode";
import "../styles/verify.css";
import { useNavigate } from "react-router-dom";

const VerifyQR = () => {
  const [scanResult, setScanResult] = useState(null);
  const [manualInput, setManualInput] = useState("");
  const [verificationStatus, setVerificationStatus] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [scanning, setScanning] = useState(false);
  const scannerRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (!localStorage.getItem("token")) {
      navigate("/auth");
    }
  }, []);

  // Start scanning when the user clicks "Start Scanning"
  const startScanning = () => {
    const html5QrCode = new Html5Qrcode("qr-reader");

    html5QrCode.start(
      { facingMode: "environment" }, // Camera constraint for QR scanning
      {
        fps: 10,
        qrbox: { width: 250, height: 250 },
      },
      (decodedText) => {
        setScanResult(decodedText);
        verifyQRCode(decodedText);
      },
      (errorMessage) => {
        console.warn("QR Code scanning error:", errorMessage);
      }
    )
    .then(() => {
      setScanning(true); // Mark as scanning
      scannerRef.current = html5QrCode; // Store the scanner instance for later use
    })
    .catch((error) => {
      setError("Error starting scanner");
      console.error(error);
    });
  };

  // Stop scanning when the user clicks "Stop Scanning"
  const stopScanning = () => {
    setTimeout(() => {
      if (scannerRef.current) {
        console.log("Stopping scanner");
        scannerRef.current.stop().then(() => {
          setScanning(false); // Stop scanning
          setScanResult(null); // Reset scan result
        }).catch((error) => {
          setError("Error stopping the scanner");
          console.error(error);
        });
      }
    }, 500);
  };

  const verifyQRCode = async (qrId) => {
    setIsLoading(true);
    setError(null); // Reset error before each attempt
    try {
      const token = localStorage.getItem("token");

      const response = await fetch(`http://127.0.0.1:5000/api/qr/verify/${qrId}`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (response.ok) {
        setVerificationStatus(`✅ Verified! Document ID: ${data.document_id}`);
      } else {
        setVerificationStatus(`❌ Verification failed: ${data.detail}`);
      }
    } catch (error) {
      setError("❌ Error verifying QR Code. Please try again.");
      setVerificationStatus(""); // Reset status message
    } finally {
      setIsLoading(false); // Hide loading spinner when done
    }
  };

  const handleManualVerify = () => {
    if (manualInput.trim() !== "") {
      verifyQRCode(manualInput);
    }
  };

  return (
    <div className="verify-container">
      <h2>🔍 Scan QR Code for Verification</h2>

      <div id="qr-reader"></div>

      <div>
        {!scanning ? (
          <button onClick={startScanning}>Start Scanning</button>
        ) : (
          <button onClick={stopScanning}>Stop Scanning</button>
        )}
      </div>

      {isLoading && <div className="loading-spinner">🔄 Verifying...</div>}

      {error && <p className="error">{error}</p>}
      {verificationStatus && <p className="status">{verificationStatus}</p>}
    </div>
  );
};

export default VerifyQR;
