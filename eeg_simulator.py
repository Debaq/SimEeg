import math
import random


class ECG_Simulator:
    def __init__(self, heart_rate=60, use_pacemaker=False, p_wave=0.25,
                 qrs_complex=1.0, t_wave=0.35, noise_level=0.05,
                 noise_amplitude=0.005):
        """
        Inicializa el simulador de ECG.

        :param heart_rate: Frecuencia cardíaca en latidos por minuto.
        :param use_pacemaker: Si se debe simular un marcapasos.
        :param p_wave: Amplitud de la onda P.
        :param qrs_complex: Amplitud del complejo QRS.
        :param t_wave: Amplitud de la onda T.
        :param noise_level: Nivel de ruido.
        :param noise_amplitude: Amplitud del ruido.
        """
        self.set_heart_rate(heart_rate)
        self.t = 0
        self.amplitude = 1.0
        self.noise_level = noise_level
        self.noise_amplitude = noise_amplitude
        self.use_pacemaker = use_pacemaker
        self.pacemaker_amplitude = 2.0
        self.last_pacemaker_pulse = -self.interval

        # Componentes de la onda
        self.p_wave = p_wave
        self.qrs_complex = qrs_complex
        self.t_wave = t_wave

        # Intervalos y segmentos (en proporción del ciclo cardíaco)
        self.pr_interval = 0.16
        self.st_segment = 0.1

    def set_heart_rate(self, bpm):
        """
        Configura la frecuencia cardíaca.

        :param bpm: Latidos por minuto.
        """
        self.heart_rate = bpm
        self.interval = 60.0 / bpm
        self.frequency = 1 / self.interval

    def generate_p_wave(self, t_relative):
        """
        Genera la onda P.

        :param t_relative: Tiempo relativo en el ciclo cardíaco.
        :return: Valor de la onda P.
        """
        return (self.p_wave * self.amplitude *
                math.exp(-((t_relative - 0.1) ** 2) / 0.002))

    def generate_qrs_complex(self, t_relative):
        """
        Genera el complejo QRS.

        :param t_relative: Tiempo relativo en el ciclo cardíaco.
        :return: Valor del complejo QRS.
        """
        t_shift = self.pr_interval + 0.04
        return self.qrs_complex * self.amplitude * math.exp(
            -((t_relative - t_shift) ** 2) / 0.0002
        )

    def generate_t_wave(self, t_relative):
        """
        Genera la onda T.

        :param t_relative: Tiempo relativo en el ciclo cardíaco.
        :return: Valor de la onda T.
        """
        t_shift = self.pr_interval + self.st_segment + 0.2
        return (self.t_wave * self.amplitude *
                math.exp(-((t_relative - t_shift) ** 2) / 0.006))

    def generate_noise(self):
        """
        Genera ruido.

        :return: Valor del ruido.
        """
        return random.gauss(0, self.noise_amplitude)

    def get_next_value(self):
        """
        Obtiene el siguiente valor del ECG.

        :return: Valor del ECG.
        """
        t_relative = (self.t % self.interval) / self.interval

        # Generar componentes de la onda
        p = self.generate_p_wave(t_relative)
        qrs = self.generate_qrs_complex(t_relative)
        t = self.generate_t_wave(t_relative)

        value = p + qrs + t

        # Simular marcapasos si está activado
        if self.use_pacemaker:
            if self.t - self.last_pacemaker_pulse >= self.interval:
                # Generar pulso del marcapasos
                pacemaker_pulse = self.pacemaker_amplitude * math.exp(
                    -((t_relative - 0.05) ** 2) / 0.00001
                )
                value += pacemaker_pulse
                self.last_pacemaker_pulse = self.t

        # Añadir ruido
        value += self.generate_noise()

        # Incrementar el tiempo
        self.t += 0.01

        return value
