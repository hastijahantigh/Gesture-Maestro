from threading import Lock


class PBControl:
    def __init__(self) -> None:
        self._tmp_mult = 1.0
        self._lock = Lock()
        self._exp=90
    def set_tmp_mult(self, value: float) -> None:
        value = max(0.5, min(2.0, value))

        with self._lock:
            self._tmp_mult = value

    def get_tmp_mult(self) -> float:
        with self._lock:
            return self._tmp_mult
    def set_exp(self,value :int)->None:
        value = max(0, min(127, value))

        with self._lock:
            self._exp= value

    def get_exp(self) -> int:
        with self._lock:
            return self._exp