# ai_service/app.py
from flask import Flask, request, jsonify
from flask_cors import CORS
import numpy as np
from sklearn.ensemble import RandomForestRegressor
import datetime

app = Flask(__name__)
CORS(app)

# Train synthetic predictor model
# Features: [hour_of_day, active_counters, current_queue_total, avg_scan_time_sec]
X_train = np.array([
    [8, 2, 4, 120],   [10, 3, 12, 180], [12, 4, 25, 200],
    [14, 3, 15, 150], [18, 5, 45, 240], [20, 3, 30, 210], [22, 1, 5, 90]
])
y_train = np.array([3.5, 9.0, 18.5, 11.0, 28.0, 22.0, 4.0])

model = RandomForestRegressor(n_estimators=100, random_state=42)
model.fit(X_train, y_train)

@app.route('/predict-queue', methods=['POST'])
def predict_queue():
    data = request.get_json() or {}
    
    hour = datetime.datetime.now().hour
    active_counters = data.get('active_counters', 3)
    queue_total = data.get('queue_total', 10)
    avg_scan_time = data.get('avg_scan_time', 180)
    
    features = np.array([[hour, active_counters, queue_total, avg_scan_time]])
    predicted_wait = float(model.predict(features)[0])
    
    # Forecast expected queue levels for the next 15 & 30 minutes
    features_15 = np.array([[(hour + 0.25) % 24, active_counters, max(1, queue_total * 0.65), avg_scan_time]])
    predicted_wait_15 = float(model.predict(features_15)[0])

    status = "Low"
    if predicted_wait > 16:
        status = "High"
    elif predicted_wait > 8:
        status = "Moderate"

    recommendation = "Optimal time to checkout now!"
    if predicted_wait_15 < (predicted_wait * 0.7):
        recommendation = f"Queue dropping soon! Delay checkout by 15 mins to cut wait down to ~{round(predicted_wait_15)} mins."
    elif predicted_wait > 15:
        recommendation = "Heavy surge ahead! Head to Counter 2 (Express) or finish checkout now."

    return jsonify({
        "current_predicted_wait_min": round(predicted_wait, 1),
        "predicted_wait_in_15m_min": round(predicted_wait_15, 1),
        "recommendation": recommendation,
        "congestion_status": status
    })

if __name__ == '__main__':
    app.run(port=5001, debug=True)