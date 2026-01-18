import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Sparkles, ArrowRight } from "lucide-react";
import "./CreateRFP.scss";
import type { RFP } from "../../types";

export const CreateRFP: React.FC = () => {
  const [prompt, setPrompt] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const navigate = useNavigate();

  const API_URL = import.meta.env.VITE_API_URL;

  const handleGenerate = async () => {
    if (!prompt.trim()) return;

    setIsProcessing(true);

    try {
      const res = await fetch(`${API_URL}/generate`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ prompt }),
      });

      if (!res.ok) {
        throw new Error(`Error: ${res.statusText}`);
      }

      const data: RFP = await res.json();
      setIsProcessing(false);
      navigate(`/rfps/${data.id}`);
    } catch (error) {
      console.error("Failed to generate RFP:", error);
      setIsProcessing(false);
      alert("Failed to generate RFP. Please try again.");
    }
  };

  return (
    <div className="create-rfp-container">
      <h1>What do you need to buy?</h1>
      <p className="subtitle">
        Describe your requirements in plain English. Our AI will structure the
        data and draft the RFP for you.
      </p>

      <div className="prompt-wrapper">
        <textarea
          placeholder="e.g., I need 50 MacBook Pros with M3 chips for our engineering team. Budget is $150k, needed by next month..."
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          disabled={isProcessing}
        />

        <div className="actions">
          <div className="hints">
            <Sparkles
              size={14}
              style={{ display: "inline", marginRight: "5px" }}
            />
            Try: "Office furniture for 20 people" or "Cloud security audit"
          </div>

          <button onClick={handleGenerate} disabled={isProcessing}>
            {isProcessing ? (
              "Analyzing..."
            ) : (
              <>
                Generate RFP <ArrowRight size={18} />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
