"use client";

import { useState } from "react";
import { CheckCircle } from 'lucide-react';

export default function ATSPage() {
  const [jobDesc, setJobDesc] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return alert("Please upload a resume!");

    setLoading(true);

    const formData = new FormData();
    formData.append("resume", file);
    formData.append("jobDescription", jobDesc);

    try {
      const res = await fetch("/api/atsapi", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      setResult(data);
    } catch (error) {
      console.error("Error:", error);
      setResult({ error: "Something went wrong." });
    }

    setLoading(false);
  };

  return (
    <main className="p-6">
      <h1 className="text-2xl font-bold mb-4">ATS Score Checker</h1>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="flex flex-row">
          <input
            type="file"
            accept=".pdf,.docx"
            onChange={(e) => setFile(e.target.files?.[0] || null)}
            className="block border rounded p-2"
            required
          />
          {file && (
            <CheckCircle className="text-green-500 w-6 h-6 mt-2 ml-1.5" />
          )}
        </div>
        <textarea
          placeholder="Paste the job description..."
          value={jobDesc}
          onChange={(e) => setJobDesc(e.target.value)}
          className="w-full h-32 border p-2 rounded"
          required
        />
        <button
          type="submit"
          className="bg-blue-600 text-white px-4 py-2 rounded"
          disabled={loading}
        >
          {loading ? "Processing..." : "Check ATS Score"}
        </button>
      </form>

      {result && (
        <div className="mt-6 p-4 border rounded shadow">
          {result.error ? (
            <p className="text-red-600">{result.error}</p>
          ) : (
            <>
              <h2 className="text-xl font-semibold">
                ATS Score: {result.score}%
              </h2>
              <p className="mt-2">{result.analysis}</p>
            </>
          )}
        </div>
      )}
    </main>
  );
}
