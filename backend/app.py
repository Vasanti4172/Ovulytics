from flask import Flask, request, jsonify
from flask_cors import CORS
from pymongo import MongoClient
from datetime import datetime, timedelta
import joblib
import numpy as np
import os

# -----------------------------
# MongoDB Connection
# -----------------------------
client = MongoClient("mongodb://localhost:27017/")
db = client["ovulytics_db"]
predictions_collection = db["predictions"]

print("✅ Connected to MongoDB")

# -----------------------------
# Flask App Setup
# -----------------------------
app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "*"}})

# -----------------------------
# MODEL LOADING
# -----------------------------
MODEL_PATH = "cycle_model.pkl"
SCALER_PATH = "scaler.pkl"

if os.path.exists(MODEL_PATH) and os.path.exists(SCALER_PATH):
    model = joblib.load(MODEL_PATH)
    scaler = joblib.load(SCALER_PATH)
    print("✅ Random Forest Model and Scaler loaded successfully.")
else:
    print("❌ ERROR: Model or Scaler files not found!")

# -----------------------------
# Prediction Route
# -----------------------------
@app.route('/predict', methods=['POST'])
def predict():
    try:
        data = request.json
        print("📥 Incoming Data:", data)

        # -----------------------------
        # Extract features
        # -----------------------------
        age = float(data.get("Age", 0))
        bmi = float(data.get("BMI", 0))
        length_cycle = float(data.get("LengthofCycle", 0))
        mean_cycle = float(data.get("MeanCycleLength", 28))
        luteal_phase = float(data.get("LengthofLutealPhase", 0))
        ovulation_day = float(data.get("EstimatedDayofOvulation", 0))
        first_high = float(data.get("FirstDayofHigh", 0))
        fertility_days = float(data.get("TotalDaysofFertility", 0))
        high_days = float(data.get("TotalNumberofHighDays", 0))
        peak_days = float(data.get("TotalNumberofPeakDays", 0))
        peak_cycle = float(data.get("CycleWithPeakorNot", 0))
        regularity_index = float(data.get("CycleRegularityIndex", 0))
        fertility_spread = float(data.get("FertilitySpread", 0))

        features = [
            age, bmi, length_cycle, mean_cycle, luteal_phase,
            ovulation_day, first_high, fertility_days,
            high_days, peak_days, peak_cycle,
            regularity_index, fertility_spread
        ]

        # -----------------------------
        # Data preprocessing
        # -----------------------------
        features_array = np.array([features])
        features_scaled = scaler.transform(features_array)

        # -----------------------------
        # Model prediction
        # -----------------------------
        prediction = model.predict(features_scaled)[0]

        # -----------------------------
        # Confidence score
        # -----------------------------
        if hasattr(model, "predict_proba"):
            probs = model.predict_proba(features_scaled)[0]
            confidence_val = float(np.max(probs))
        else:
            confidence_val = 1.0

        # -----------------------------
        # Output mapping
        # -----------------------------
        if prediction == 1:
            pattern = "Stable"
            health = "Regular"
        else:
            pattern = "Irregular"
            health = "Needs Attention"

        # -----------------------------
        # Explainable AI Logic
        # -----------------------------
        insights = []

        if regularity_index < 0.5:
            insights.append("Low cycle regularity detected")

        if length_cycle < 21 or length_cycle > 35:
            insights.append("Cycle length is outside normal range (21–35 days)")

        if luteal_phase < 10:
            insights.append("Short luteal phase may affect hormonal balance")

        if fertility_spread > 5:
            insights.append("High fertility spread indicates irregular ovulation window")

        if peak_cycle == 0:
            insights.append("No peak fertility detected in this cycle")

        if not insights:
            insights.append("All key cycle parameters appear within healthy ranges")

        # -----------------------------
        # Risk Level Calculation
        # -----------------------------
        risk_level = "Normal"
        if len(insights) >= 3:
            risk_level = "High"
        elif len(insights) == 2:
            risk_level = "Moderate"

        # -----------------------------
        # Doctor Recommendation
        # -----------------------------
        doctor_note = ""
        if risk_level == "High":
            doctor_note = "⚠️ Multiple irregular patterns detected. Consider consulting a gynecologist."
        elif risk_level == "Moderate":
            doctor_note = "⚠️ Some irregularities observed. Monitor cycles closely."

        # -----------------------------
        # Next cycle prediction
        # -----------------------------
        current_date_str = data.get("CurrentDate")

        if current_date_str:
            try:
                current_date = datetime.strptime(current_date_str, "%Y-%m-%d")
                next_cycle_date = current_date + timedelta(days=int(mean_cycle))
                next_cycle_str = next_cycle_date.strftime("%Y-%m-%d")
            except:
                next_cycle_str = "Invalid Date"
        else:
            next_cycle_str = "Not Provided"

        # -----------------------------
        # MongoDB Insert
        # -----------------------------
        prediction_record = {
            "Age": age,
            "BMI": bmi,
            "LengthofCycle": length_cycle,
            "MeanCycleLength": mean_cycle,
            "LengthofLutealPhase": luteal_phase,
            "EstimatedDayofOvulation": ovulation_day,
            "FirstDayofHigh": first_high,
            "TotalDaysofFertility": fertility_days,
            "TotalNumberofHighDays": high_days,
            "TotalNumberofPeakDays": peak_days,
            "CycleWithPeakorNot": peak_cycle,
            "CycleRegularityIndex": regularity_index,
            "FertilitySpread": fertility_spread,
            "Prediction": pattern,
            "CycleHealth": health,
            "Confidence": confidence_val,
            "NextCycleDate": next_cycle_str,
            "timestamp": datetime.utcnow()
        }

        print("💾 Saving prediction to MongoDB...")
        result = predictions_collection.insert_one(prediction_record)
        print("✅ Inserted ID:", result.inserted_id)

        # -----------------------------
        # Send response (FIXED ✅)
        # -----------------------------
        response = {
            "OvulationPattern": pattern,
            "CycleHealth": health,
            "Confidence": f"{int(confidence_val * 100)}%",
            "NextCycleDate": next_cycle_str,
            "Insights": insights
        }

        # Only send risk if needed
        if risk_level != "Normal":
            response["RiskLevel"] = risk_level
            if risk_level != "Normal":
                response["DoctorAdvice"] = doctor_note

        return jsonify(response)

    except Exception as e:
        print("⚠️ Prediction Error:", str(e))
        return jsonify({"error": str(e)}), 400



# -----------------------------
# Health Check
# -----------------------------
@app.route('/health', methods=['GET'])
def health_check():
    return jsonify({"status": "Backend is running"}), 200


# -----------------------------
# Run Flask
# -----------------------------
if __name__ == '__main__':
    app.run(debug=True, port=5000)

