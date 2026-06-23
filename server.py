import json
import os
import uuid
from datetime import datetime, timedelta
from flask import Flask, jsonify, request, send_from_directory
from flask_cors import CORS
app = Flask(__name__, static_folder="dist", static_url_path="")
CORS(app)
DB_FILE = "database.json"
def load_db():
    if not os.path.exists(DB_FILE):
        return {"reservations": []}
    try:
        with open(DB_FILE, "r", encoding="utf-8") as f:
            return json.load(f)
    except:
        return {"reservations": []}
def save_db(data):
    with open(DB_FILE, "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=2)
@app.route("/api/reservations", methods=["GET"])
def get_reservations():
    db = load_db()
    # Сортировка по дате и времени
    sorted_res = sorted(db["reservations"], key=lambda x: f"{x['date']}T{x['time']}")
    return jsonify(sorted_res)
@app.route("/api/reservations", methods=["POST"])
def create_reservation():
    data = request.get_json()
    
    table_id = int(data.get("tableId"))
    res_date = data.get("date")
    res_time = data.get("time")
    new_start = datetime.strptime(f"{res_date}T{res_time}", "%Y-%m-%dT%H:%M")
    
    if new_start <= datetime.now():
        return jsonify({"error": "Бронирование возможно только на будущее время!"}), 400
    db = load_db()
    
    for existing in db["reservations"]:
        if int(existing["tableId"]) == table_id and existing["date"] == res_date:
            ext_start = datetime.strptime(f"{existing['date']}T{existing['time']}", "%Y-%m-%dT%H:%M")
            diff = abs((new_start - ext_start).total_seconds()) / 60  # в минутах
            
            if diff < 60:
                return jsonify({
                    "error": f"Этот столик уже занят в это время. Интервал между бронями должен быть 1 час. (Ближайшее бронирование: {existing['time']})"
                }), 400
    new_res = {
        "id": str(uuid.uuid4()),
        "tableId": table_id,
        "name": data.get("name"),
        "phone": data.get("phone"),
        "date": res_date,
        "time": res_time,
        "comment": data.get("comment", ""),
        "createdAt": datetime.now().isoformat()
    }
    
    db["reservations"].append(new_res)
    save_db(db)
    return jsonify(new_res), 201
@app.route("/api/reservations/<res_id>", methods=["DELETE"])
def delete_reservation(res_id):
    db = load_db()
    db["reservations"] = [r for r in db["reservations"] if r["id"] != res_id]
    save_db(db)
    return jsonify({"success": True})
@app.route("/")
def index():
    return send_from_directory(app.static_folder, "index.html")
@app.route("/admin")
def admin():
    return send_from_directory(app.static_folder, "index.html")
@app.route("/<path:path>")
def static_proxy(path):
    return send_from_directory(app.static_folder, "index.html")
if __name__ == "__main__":
    app.run(debug=True, port=5000)