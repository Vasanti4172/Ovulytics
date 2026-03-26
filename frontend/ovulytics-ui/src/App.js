import React, { useState } from "react";
import axios from "axios";
import "./App.css";

function App() {
  const [formData, setFormData] = useState({
    Age: "",
    BMI: "",
    LengthofCycle: "",
    MeanCycleLength: "",
    LengthofLutealPhase: "",
    EstimatedDayofOvulation: "",
    FirstDayofHigh: "",
    TotalDaysofFertility: "",
    TotalNumberofHighDays: "",
    TotalNumberofPeakDays: "",
    CycleWithPeakorNot: "",
    CycleRegularityIndex: "",
    FertilitySpread: "",
    CurrentDate: ""
  });

  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
  e.preventDefault();
  setLoading(true);

  const payload = {
    Age: parseFloat(formData.Age) || 0,
    BMI: parseFloat(formData.BMI) || 0,
    LengthofCycle: parseFloat(formData.LengthofCycle) || 0,
    MeanCycleLength: parseFloat(formData.MeanCycleLength) || 0,
    LengthofLutealPhase: parseFloat(formData.LengthofLutealPhase) || 0,
    EstimatedDayofOvulation: parseFloat(formData.EstimatedDayofOvulation) || 0,
    FirstDayofHigh: parseFloat(formData.FirstDayofHigh) || 0,
    TotalDaysofFertility: parseFloat(formData.TotalDaysofFertility) || 0,
    TotalNumberofHighDays: parseFloat(formData.TotalNumberofHighDays) || 0,
    TotalNumberofPeakDays: parseFloat(formData.TotalNumberofPeakDays) || 0,
    CycleWithPeakorNot: parseInt(formData.CycleWithPeakorNot) || 0,
    CycleRegularityIndex: parseFloat(formData.CycleRegularityIndex) || 0,
    FertilitySpread: parseFloat(formData.FertilitySpread) || 0,
    CurrentDate: formData.CurrentDate
  };

  try {

    const res = await axios.post("http://127.0.0.1:5000/predict", payload);

    // ✅ store backend response
    setResult(res.data);

  } catch (err) {

    console.error("Error:", err.response?.data || err.message);
    alert("Prediction failed. Check backend.");

  } finally {

    setLoading(false);

  }
};


  return (
    <div className="container">
      <h1>Ovulytics Pr🩸</h1>
      <p className="subtitle">Clinical Cycle Analysis</p>
      
      <div className="form-box">
        <form onSubmit={handleSubmit}>
          {/* Section 1: Basic Physicals */}
          <div className="form-section">
            <h3>Physical Metrics</h3>
            <label>Age: <input type="number" name="Age" value={formData.Age} onChange={handleChange} required /></label>
            <label>BMI: <input type="number" step="0.1" name="BMI" value={formData.BMI} onChange={handleChange} required /></label>
          </div>

          {/* Section 2: Cycle History */}
          <div className="form-section">
            <h3>Cycle History</h3>
            <label>Current Cycle Length (days): <input type="number" name="LengthofCycle" value={formData.LengthofCycle} onChange={handleChange} required /></label>
            <label>Mean Cycle Length: <input type="number" step="0.1" name="MeanCycleLength" value={formData.MeanCycleLength} onChange={handleChange} required /></label>
            <label>Luteal Phase Length: <input type="number" name="LengthofLutealPhase" value={formData.LengthofLutealPhase} onChange={handleChange} required /></label>
          </div>

          {/* Section 3: Medical Markers */}
          <div className="form-section">
            <h3>Medical/Ovulation Markers</h3>
            <label>Est. Day of Ovulation: <input type="number" name="EstimatedDayofOvulation" value={formData.EstimatedDayofOvulation} onChange={handleChange} required /></label>
            <label>First Day of High Fertility: <input type="number" name="FirstDayofHigh" value={formData.FirstDayofHigh} onChange={handleChange} required /></label>
            <label>Total Days of Fertility: <input type="number" name="TotalDaysofFertility" value={formData.TotalDaysofFertility} onChange={handleChange} required /></label>
            <label>Total High Days: <input type="number" name="TotalNumberofHighDays" value={formData.TotalNumberofHighDays} onChange={handleChange} required /></label>
            <label>Total Peak Days: <input type="number" name="TotalNumberofPeakDays" value={formData.TotalNumberofPeakDays} onChange={handleChange} required /></label>
            <label>Cycle with Peak? (1:Yes, 0:No): <input type="number" name="CycleWithPeakorNot" value={formData.CycleWithPeakorNot} onChange={handleChange} required min="0" max="1" /></label>
            <label>Regularity Index: <input type="number" step="0.01" name="CycleRegularityIndex" value={formData.CycleRegularityIndex} onChange={handleChange} required /></label>
            <label>Fertility Spread: <input type="number" step="0.001" name="FertilitySpread" value={formData.FertilitySpread} onChange={handleChange} required /></label>
          </div>
          <div className="form-section">
  <h3>Cycle Date</h3>
  <label>
    Current Cycle Start Date:
    <input
      type="date"
      name="CurrentDate"
      value={formData.CurrentDate}
      onChange={handleChange}
      required
    />
  </label>
</div>
          <button type="submit" disabled={loading}>{loading ? "Analyzing..." : "Analyze Health"}</button>
        </form>
      </div>

{result && (
  <div className={result.CycleHealth === "Regular" ? "result-regular" : "result-irregular"}>
    <h3>
  {result.CycleHealth === "Regular" ? "✅ Healthy Cycle" : "⚠️ Irregular Cycle Detected"}
</h3>
    <div className="result-content">
      <p><strong>Ovulation Pattern:</strong> {result.OvulationPattern}</p>
      <p><strong>Health Status:</strong> {result.CycleHealth}</p>
      <div className="confidence-box">
  <p>Confidence: {result.Confidence}</p>
  <div className="confidence-bar">
    <div
      className="confidence-fill"
      style={{ width: result.Confidence }}
    ></div>
  </div>
</div>
 {result.NextCycleDate && (
        <p><strong>Predicted Next Cycle:</strong> {new Date(result.NextCycleDate).toLocaleDateString()}</p>
      )}
    </div>
      {/* 🧠 Explainable AI Section */}
{/* 🧠 Explainable AI Section */}
{/* 🧠 Explainable AI Section */}
{result.Insights && (
  <div className="insights-box">
    <h4>🧠 AI Insights</h4>

    <ul className="insight-list">
      {result.Insights.map((item, index) => (
        <li key={index}>• {item}</li>
      ))}
    </ul>

   {result.RiskLevel && (
  <div className="risk-section">
    <span className={`risk-badge ${result.RiskLevel.toLowerCase()}`}>
      {result.RiskLevel} Risk
    </span>
  </div>
)}


    {result.DoctorAdvice && (
      <div className="doctor-warning">
        ⚠️ {result.DoctorAdvice}
      </div>
    )}
  </div>
)}



     

    <button onClick={() => setResult(null)} style={{marginTop: '15px', padding: '10px'}}>
      Clear Result
    </button>
  </div>
)}

    </div>
  );
}

export default App;
