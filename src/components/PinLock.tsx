import { useState, useRef, useEffect } from 'react'
import { PIN } from '../shared/labels'
import { loadPin, savePin, verifyPin, setUnlocked } from '../shared/storage'

interface PinLockProps {
  onUnlocked: () => void
}

function PinLock({ onUnlocked }: PinLockProps) {
  const storedPin = loadPin()
  const isSetup = !storedPin

  const [pin, setPin] = useState(['', '', '', ''])
  const [confirmPin, setConfirmPin] = useState(['', '', '', ''])
  const [step, setStep] = useState<'enter' | 'confirm'>('enter')
  const [error, setError] = useState('')

  const inputsRef = useRef<(HTMLInputElement | null)[]>([])
  const confirmInputsRef = useRef<(HTMLInputElement | null)[]>([])

  useEffect(() => {
    inputsRef.current[0]?.focus()
  }, [])

  function handleDigit(
    index: number,
    value: string,
    arr: string[],
    setArr: React.Dispatch<React.SetStateAction<string[]>>,
    refs: React.MutableRefObject<(HTMLInputElement | null)[]>,
  ) {
    if (!/^\d?$/.test(value)) return
    const next = [...arr]
    next[index] = value
    setArr(next)
    setError('')
    if (value && index < 3) {
      refs.current[index + 1]?.focus()
    }
  }

  function handleKeyDown(
    e: React.KeyboardEvent,
    index: number,
    arr: string[],
    setArr: React.Dispatch<React.SetStateAction<string[]>>,
    refs: React.MutableRefObject<(HTMLInputElement | null)[]>,
  ) {
    if (e.key === 'Backspace' && !arr[index] && index > 0) {
      const next = [...arr]
      next[index - 1] = ''
      setArr(next)
      refs.current[index - 1]?.focus()
    }
  }

  async function handleSubmit() {
    const code = pin.join('')
    if (code.length < 4) return

    if (isSetup) {
      if (step === 'enter') {
        setStep('confirm')
        setConfirmPin(['', '', '', ''])
        setTimeout(() => confirmInputsRef.current[0]?.focus(), 50)
        return
      }
      const confirmCode = confirmPin.join('')
      if (code !== confirmCode) {
        setError(PIN.pinNonCoincide)
        setConfirmPin(['', '', '', ''])
        setTimeout(() => confirmInputsRef.current[0]?.focus(), 50)
        return
      }
      await savePin(code)
      setUnlocked()
      onUnlocked()
    } else {
      const ok = await verifyPin(code)
      if (ok) {
        setUnlocked()
        onUnlocked()
      } else {
        setError(PIN.pinErrato)
        setPin(['', '', '', ''])
        setTimeout(() => inputsRef.current[0]?.focus(), 50)
      }
    }
  }

  // ─── Auto-submit quando tutte le cifre sono inserite ───
  useEffect(() => {
    if (!isSetup && pin.every((d) => d !== '')) {
      handleSubmit()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pin])

  useEffect(() => {
    if (isSetup && step === 'confirm' && confirmPin.every((d) => d !== '')) {
      handleSubmit()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [confirmPin])

  function renderInputs(
    arr: string[],
    setArr: React.Dispatch<React.SetStateAction<string[]>>,
    refs: React.MutableRefObject<(HTMLInputElement | null)[]>,
  ) {
    return (
      <div className="flex gap-3 justify-center">
        {arr.map((digit, i) => (
          <input
            key={i}
            ref={(el) => { refs.current[i] = el }}
            type="password"
            inputMode="numeric"
            maxLength={1}
            value={digit}
            onChange={(e) => handleDigit(i, e.target.value, arr, setArr, refs)}
            onKeyDown={(e) => handleKeyDown(e, i, arr, setArr, refs)}
            className="w-14 h-14 text-center text-2xl font-bold rounded-xl outline-none
                       transition-all duration-200 focus:scale-110"
            style={{
              backgroundColor: 'var(--input-bg)',
              border: '2px solid var(--input-border)',
              color: 'var(--text-primary)',
            }}
          />
        ))}
      </div>
    )
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4"
      style={{ backgroundColor: 'var(--bg-primary)' }}
    >
      <div
        className="w-full max-w-sm rounded-2xl p-8 text-center shadow-lg"
        style={{
          backgroundColor: 'var(--bg-card)',
          border: '1px solid var(--border)',
        }}
      >
        {/* Icona */}
        <div className="text-5xl mb-4">🔒</div>

        {/* Titolo */}
        <h1
          className="text-xl font-bold mb-2"
          style={{ color: 'var(--text-primary)' }}
        >
          {PIN.titolo}
        </h1>

        {/* Istruzione */}
        <p
          className="text-sm mb-6"
          style={{ color: 'var(--text-secondary)' }}
        >
          {isSetup
            ? step === 'enter'
              ? PIN.creaPin
              : PIN.confermaPin
            : PIN.inserisciPin}
        </p>

        {/* Input PIN */}
        {step === 'enter'
          ? renderInputs(pin, setPin, inputsRef)
          : renderInputs(confirmPin, setConfirmPin, confirmInputsRef)}

        {/* Errore */}
        {error && (
          <p className="mt-4 text-sm font-medium" style={{ color: '#ef4444' }}>
            {error}
          </p>
        )}

        {/* Bottone submit (solo per setup primo step) */}
        {isSetup && step === 'enter' && pin.every((d) => d !== '') && (
          <button
            onClick={handleSubmit}
            className="mt-6 w-full py-3 rounded-xl font-semibold transition-colors duration-200
                       active:scale-95"
            style={{
              backgroundColor: 'var(--accent)',
              color: '#fff',
            }}
          >
            {PIN.conferma}
          </button>
        )}
      </div>
    </div>
  )
}

export default PinLock
