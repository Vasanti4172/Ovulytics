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
    FertilitySpread: ""
  });

  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    // Convert all inputs to appropriate numeric types
    const payload = {
      Age: parseFloat(formData.Age),
      BMI: parseFloat(formData.BMI),
      LengthofCycle: parseFloat(formData.LengthofCycle),
      MeanCycleLength: parseFloat(formData.MeanCycleLength),
      LengthofLutealPhase: parseFloat(formData.LengthofLutealPhase),
      EstimatedDayofOvulation: parseFloat(formData.EstimatedDayofOvulation),
      FirstDayofHigh: parseFloat(formData.FirstDayofHigh),
      TotalDaysofFertility: parseFloat(formData.TotalDaysofFertility),
      TotalNumberofHighDays: parseFloat(formData.TotalNumberofHighDays),
      TotalNumberofPeakDays: parseFloat(formData.TotalNumberofPeakDays),
      CycleWithPeakorNot: parseInt(formData.CycleWithPeakorNot),
      CycleRegularityIndex: parseFloat(formData.CycleRegularityIndex),
      FertilitySpread: parseFloat(formData.FertilitySpread)
    };

    try {
      const res = await axios.post("http://127.0.0.1:5000/predict", payload);
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
      <h1>Ovulytics Pro</h1>
      <p className="subtitle">Clinical Cycle Analysis (13-Feature Mode)</p>
      
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

          <button type="submit" disabled={loading}>{loading ? "Analyzing..." : "Analyze Health"}</button>
        </form>
      </div>

      {result && (
        <div className="result-box">
          <h3>Analysis Result</h3>
          <p><strong>Pattern:</strong> {result.OvulationPattern}</p>
          <p><strong>Status:</strong> {result.CycleHealth}</p>
          <p><strong>Confidence:</strong> {result.Confidence}</p>
        </div>
      )}
    </div>
  );
}

export default App;
