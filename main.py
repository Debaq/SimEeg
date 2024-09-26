from flask import Flask, render_template, jsonify, send_from_directory
from eeg_simulator import ECG_Simulator
import time
import os

app = Flask(__name__)
ecg = ECG_Simulator()

# Variables globales para mantener los datos del ECG
ecg_data = {'x': [], 'y': []}
start_time = time.time()

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/data')
def get_data():
    global ecg_data, start_time
    current_time = time.time() - start_time
    
    # Agregar nuevo punto de datos
    ecg_data['x'].append(current_time)
    ecg_data['y'].append(ecg.get_next_value())
    
    # Mantener solo los últimos 500 puntos de datos
    if len(ecg_data['x']) > 500:
        ecg_data['x'] = ecg_data['x'][-500:]
        ecg_data['y'] = ecg_data['y'][-500:]
    
    return jsonify(ecg_data)

@app.route('/static/js/<path:filename>')
def serve_js(filename):
    return send_from_directory(os.path.join(app.root_path, 'static', 'js'), filename, mimetype='application/javascript')

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)