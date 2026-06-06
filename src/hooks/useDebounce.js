import { useState, useEffect } from 'react'

// Recibe un valor y un delay en ms
// Solo actualiza el valor devuelto cuando el usuario deja de escribir
// durante 'delay' milisegundos
export function useDebounce(value, delay = 300) {
  const [debouncedValue, setDebouncedValue] = useState(value)

  useEffect(() => {
    // Crea un timer que actualiza el valor después del delay
    const timer = setTimeout(() => {
      setDebouncedValue(value)
    }, delay)

    // Limpieza: si el valor cambia antes de que expire el timer,
    // cancelamos el timer anterior y creamos uno nuevo
    // Esto es lo que "debouncea" — reinicia el contador en cada keystroke
    return () => clearTimeout(timer)
  }, [value, delay])

  return debouncedValue
}