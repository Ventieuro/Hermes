import { useState, useRef, useEffect, useCallback } from 'react'
import { PIN, LAYOUT } from '../shared/labels'
import {
  loadPin, savePin, verifyPin, setUnlocked, loadSettings,
  isBiometricCredentialSaved, isBiometricAvailable, verifyBiometric,
} from '../shared/storage'

interface PinLockProps {
  onUnlocked: () => void
}

function PinLock({ onUnlocked }: PinLockProps) {
  const storedPin = loadPin()
  const isSetup = !storedPin
  const { userName } = loadSettings()

  const [pin, setPin] = useState(['', '', '', ''])
  const [confirmPin, setConfirmPin] = useState(['', '', '', ''])
  const [step, setStep] = useState<'enter' | 'confirm'>('enter')
  const [error, setError] = useState('')
  const [biometricAvailable, setBiometricAvailable] = useState(false)
  const [showPin, setShowPin] = useState(false)

  const inputsRef = useRef<(HTMLInputElement | null)[]>([])
  const confirmInputsRef = useRef<(HTMLInputElement | null)[]>([])

  const handleBiometricAuth = useCallback(async () => {
    const ok = await verifyBiometric()
    if (ok) {
      setUnlocked()
      onUnlocked()
    } else {
      setBiometricAvailable(false)
      setShowPin(true)
      setError(PIN.biometriaFallita)
      setTimeout(() => inputsRef.current[0]?.focus(), 50)
    }
  }, [onUnlocked])

  useEffect(() => {
    if (isSetup) {
      inputsRef.current[0]?.focus()
      return
    }
    // Check and auto-trigger biometric if available
    if (isBiometricCredentialSaved()) {
      isBiometricAvailable().then((available) => {
        if (available) {
          setBiometricAvailable(true)
          handleBiometricAuth()
        } else {
          setShowPin(true)
          inputsRef.current[0]?.focus()
        }
      })
    } else {
      setShowPin(true)
      inputsRef.current[0]?.focus()
    }
  }, [isSetup, handleBiometricAuth])

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
      className="min-h-screen flex flex-col items-center justify-center p-4"
      style={{ backgroundColor: 'var(--bg-primary)' }}
    >
      {/* ─── Stelle decorative ─── */}
      <div aria-hidden="true" style={{ position: 'fixed', inset: 0, overflow: 'hidden', pointerEvents: 'none', zIndex: 0 }}>
        {['12% 18%','82% 12%','25% 72%','70% 65%','50% 30%','88% 80%','6% 50%','60% 88%'].map((pos, i) => (
          <div key={i} style={{
            position: 'absolute', left: pos.split(' ')[0], top: pos.split(' ')[1],
            width: i % 3 === 0 ? '3px' : '2px', height: i % 3 === 0 ? '3px' : '2px',
            borderRadius: '50%', backgroundColor: 'var(--text-muted)', opacity: 0.4,
          }} />
        ))}
      </div>

      {/* ─── Card ─── */}
      <div
        className="relative w-full max-w-sm rounded-3xl p-8 text-center shadow-2xl"
        style={{
          backgroundColor: 'var(--bg-card)',
          border: '1px solid var(--border)',
          zIndex: 1,
        }}
      >
        {/* Logo app */}
        <div className="mb-1" style={{ fontSize: '38px', lineHeight: 1 }}>🚀</div>
        <div className="text-lg font-bold mb-6" style={{ color: 'var(--accent)', letterSpacing: '0.05em' }}>
          {LAYOUT.appName.replace('🚀 ', '')}
        </div>

        {/* Icona lucchetto */}
        <div className="text-4xl mb-3">🔒</div>

        {/* Titolo / Benvenuto */}
        <h1 className="text-xl font-bold mb-1" style={{ color: 'var(--text-primary)' }}>
          {isSetup
            ? PIN.titolo
            : (userName ? PIN.benvenutoNome(userName) : PIN.benvenuto)}
        </h1>

        {/* Istruzione */}
        <p className="text-sm mb-6" style={{ color: 'var(--text-secondary)' }}>
          {isSetup
            ? (step === 'enter' ? PIN.primoAccesso : PIN.confermaPin)
            : (showPin ? PIN.inserisciPin : '')}
        </p>

        {/* ─── Biometric button (unlock mode, credential registered) ─── */}
        {!isSetup && biometricAvailable && !showPin && (
          <div className="flex flex-col items-center gap-4">
            <button
              onClick={handleBiometricAuth}
              className="w-full py-4 rounded-2xl text-base font-semibold transition active:scale-95"
              style={{ backgroundColor: 'var(--accent)', color: '#fff' }}
            >
              {PIN.biometriaAvvia}
            </button>
            <button
              onClick={() => { setShowPin(true); setTimeout(() => inputsRef.current[0]?.focus(), 50) }}
              className="text-sm transition"
              style={{ color: 'var(--text-muted)' }}
            >
              {PIN.usaPin}
            </button>
          </div>
        )}

        {/* ─── PIN inputs ─── */}
        {(isSetup || showPin) && (
          <>
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

            {/* Bottone biometria (fallback se showPin dopo failure) */}
            {!isSetup && biometricAvailable && showPin && (
              <button
                onClick={() => { setShowPin(false); setError(''); handleBiometricAuth() }}
                className="mt-4 w-full py-2.5 rounded-xl text-sm font-medium transition active:scale-95"
                style={{
                  backgroundColor: 'var(--bg-secondary)',
                  color: 'var(--text-secondary)',
                  border: '1px solid var(--border)',
                }}
              >
                {PIN.biometriaAvvia}
              </button>
            )}

            {/* Bottone submit (solo per setup primo step) */}
            {isSetup && step === 'enter' && pin.every((d) => d !== '') && (
              <button
                onClick={handleSubmit}
                className="mt-6 w-full py-3 rounded-xl font-semibold transition-colors duration-200 active:scale-95"
                style={{ backgroundColor: 'var(--accent)', color: '#fff' }}
              >
                {PIN.conferma}
              </button>
            )}
          </>
        )}
      </div>
    </div>
  )
}

export default PinLock
