# main.py

from flask import Flask, render_template, jsonify, send_from_directory, request
from flask_socketio import SocketIO, emit
from flask_sqlalchemy import SQLAlchemy
import time
import os
import json

app = Flask(__name__)
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///eeg_data.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
db = SQLAlchemy(app)
socketio = SocketIO(app, cors_allowed_origins="*")

class EEGData(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    timestamp = db.Column(db.Float, nullable=False)
    value = db.Column(db.Float, nullable=False)

    def __repr__(self):
        return f'<EEGData {self.timestamp}: {self.value}>'

def reset_database():
    # Eliminar la base de datos si existe
    if os.path.exists('eeg_data.db'):
        os.remove('eeg_data.db')
    
    # Crear todas las tablas
    with app.app_context():
        db.create_all()
    
    print("Base de datos reiniciada.")

# Llamar a la función de reinicio al inicio del programa
reset_database()

# Variables globales para mantener los datos del EEG
eeg_data = {'x': [], 'y': []}
start_time = time.time()

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/data')
def get_data():
    global eeg_data, start_time
    current_time = time.time() - start_time
    
    if eeg_data['x'] and eeg_data['y']:
        return jsonify(eeg_data)
    else:
        return jsonify({'x': [current_time], 'y': [0]})

@app.route('/update_eeg', methods=['POST'])
def update_eeg():
    global eeg_data, start_time
    data = request.json
    
    if 'x' in data and 'y' in data:
        for x, y in zip(data['x'], data['y']):
            new_data = EEGData(timestamp=x, value=y)
            db.session.add(new_data)
        
        db.session.commit()
        
        eeg_data['x'].extend(data['x'])
        eeg_data['y'].extend(data['y'])
        
        # Mantener solo los últimos 500 puntos de datos
        if len(eeg_data['x']) > 500:
            eeg_data['x'] = eeg_data['x'][-500:]
            eeg_data['y'] = eeg_data['y'][-500:]
        
        socketio.emit('new_eeg_data', eeg_data)
        return jsonify({"status": "success"})
    else:
        return jsonify({"status": "error", "message": "Invalid data format"}), 400

@app.route('/static/js/<path:filename>')
def serve_js(filename):
    return send_from_directory(os.path.join(app.root_path, 'static', 'js'), filename, mimetype='application/javascript')

if __name__ == '__main__':
    socketio.run(app, debug=True, host='0.0.0.0', port=5000)