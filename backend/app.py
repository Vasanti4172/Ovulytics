from flask import Flask, request, jsonify
from flask_cors import CORS
import joblib
import numpy as np
import os

app = Flask(__name__)
CORS(app)

# --- MODEL LOADING ---
# Ensure these files are the new Random Forest versions
MODEL_PATH = "cycle_model.pkl"
SCALER_PATH = "scaler.pkl"

if os.path.exists(MODEL_PATH) and os.path.exists(SCALER_PATH):
    model = joblib.load(MODEL_PATH)
    scaler = joblib.load(SCALER_PATH)
    print("✅ Random Forest Model and Scaler loaded successfully.")
else:
    print("❌ ERROR: Model or Scaler files not found! Please retrain in your notebook.")

@app.route('/predict', methods=['POST'])
def predict():
    try:
        data = request.json
        
        # 1. EXTRACT 13 FEATURES IN EXACT DATASET ORDER
        # Note: Order must match the 'X' features in your notebook training
        features = [
            float(data.get("Age", 0)),
            float(data.get("BMI", 0)),
            float(data.get("LengthofCycle", 0)),
            float(data.get("MeanCycleLength", 0)),
            float(data.get("LengthofLutealPhase", 0)),
            float(data.get("EstimatedDayofOvulation", 0)),
            float(data.get("FirstDayofHigh", 0)),
            float(data.get("TotalDaysofFertility", 0)),
            float(data.get("TotalNumberofHighDays", 0)),
            float(data.get("TotalNumberofPeakDays", 0)),
            float(data.get("CycleWithPeakorNot", 0)),
            float(data.get("CycleRegularityIndex", 0)),
            float(data.get("FertilitySpread", 0))
        ]

        # 2. DATA PREPROCESSING
        # Convert to 2D array and apply scaling
        features_array = np.array([features])
        features_scaled = scaler.transform(features_array)

        # 3. MODEL INFERENCE
        prediction = model.predict(features_scaled)[0]
        
        # 4. CALCULATE CONFIDENCE (Using Random Forest Probabilities)
        # Random Forest provides probabilities for both classes [Irregular, Regular]
        if hasattr(model, "predict_proba"):
            probs = model.predict_proba(features_scaled)[0]
            confidence_val = np.max(probs)
        else:
            confidence_val = 1.0

        # 5. MAPPING RESULT
        # Based on your target: 1 = Regular/Stable, 0 = Irregular/Needs Attention
        if prediction == 1:
            pattern = "Stable"
            health = "Regular"
        else:
            pattern = "Irregular"
            health = "Needs Attention"

        # 6. SEND RESPONSE
        return jsonify({
            "OvulationPattern": pattern,
            "CycleHealth": health,
            "Confidence": f"{int(confidence_val * 100)}%"
        })

    except Exception as e:
        print(f"⚠️ Prediction Error: {str(e)}")
        return jsonify({"error": "Failed to process data. Check input values."}), 400

@app.route('/health', methods=['GET'])
def health_check():
    return jsonify({"status": "Backend is running"}), 200

if __name__ == '__main__':
    # Running on port 5000 by default
    app.run(debug=True, port=5000)