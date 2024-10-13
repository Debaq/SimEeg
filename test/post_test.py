import requests
import json
import time

url = 'http://localhost:5000/update_eeg'

while True:
    # Simular la generación de datos EEG
    current_time = time.time()
    eeg_value = 0.5
    
    data = {
        'x': [current_time],
        'y': [eeg_value]
    }
    
    response = requests.post(url, json=data)
    print(response.json())
    
    time.sleep(0.01)  # Esperar 10ms antes de enviar el siguiente dato