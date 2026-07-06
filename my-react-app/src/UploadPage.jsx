import { useState } from "react";
import axios from "axios";

export default function UploadPage() {
  const [file, setFile] = useState(null);
  const [jobDesc, setJobDesc] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const API_URL = import.meta.env.VITE_API_URL;

  const uploadFile = async () => {
    if (!file) {
      alert("Please upload a PDF file");
      return;
    }

    console.log("API URL:", API_URL);

    setLoading(true);
    setResult(null);

    const formData = new FormData();
    formData.append("file", file);
    formData.append("job_desc", jobDesc);

    try {
      const res = await axios.post(
        `${API_URL}/upload-resume/`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      console.log("Response:", res.data);
      setResult(res.data);

    } catch (err) {
      console.error("Upload Error:", err);

      if (err.response) {
        console.log("Status:", err.response.status);
        console.log("Response Data:", err.response.data);

        setResult({
          message: `Error ${err.response.status}: ${JSON.stringify(
            err.response.data
          )}`,
        });
      } else if (err.request) {
        setResult({
          message:
            "Cannot connect to the backend. Check VITE_API_URL and CORS.",
        });
      } else {
        setResult({
          message: err.message,
        });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: 20, maxWidth: 700, margin: "0 auto" }}>
      <h2>ATS Resume AI</h2>

      <textarea
        rows={6}
        placeholder="Paste Job Description here..."
        value={jobDesc}
        onChange={(e) => setJobDesc(e.target.value)}
        style={{
          width: "100%",
          padding: 10,
          marginBottom: 15,
        }}
      />

      <input
        type="file"
        accept=".pdf"
        onChange={(e) => setFile(e.target.files[0])}
      />

      <br />
      <br />

      <button
        onClick={uploadFile}
        disabled={!file || loading}
        style={{
          padding: "10px 20px",
          cursor: "pointer",
        }}
      >
        {loading ? "Analyzing..." : "Analyze Resume"}
      </button>

      {result && (
        <div style={{ marginTop: 30 }}>
          <h3>Result</h3>

          {result.score !== undefined && (
            <>
              <p>
                <b>Filename:</b> {result.filename}
              </p>

              <p>
                <b>Score:</b> {result.score}%
              </p>

              <p>
                <b>Matched Skills:</b>
              </p>
              <p>{result.matched_skills?.join(", ")}</p>

              <p>
                <b>Missing Skills:</b>
              </p>
              <p>{result.missing_skills?.join(", ")}</p>
            </>
          )}

          {result.message && (
            <p style={{ color: "red" }}>
              {result.message}
            </p>
          )}
        </div>
      )}
    </div>
  );
}