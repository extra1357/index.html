import { useEffect, useState } from 'react'

/**
 * Hook de debounce para otimizar buscas
 * @param value - Valor a ser debounced
 * @param delay - Delay em ms (padrão: 500ms)
 */
export function useDebounce<T>(value: T, delay: number = 500): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value)

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value)
    }, delay)

    return () => {
      clearTimeout(handler)
    }
  }, [value, delay])

  return debouncedValue
}

// Exemplo de uso:
// const [busca, setBusca] = useState('')
// const buscaDebounced = useDebounce(busca, 500)
// 
// useEffect(() => {
//   if (buscaDebounced) {
//     // Fazer fetch aqui
//   }
// }, [buscaDebounced])
