import { useState, useRef, useEffect } from 'react'
import styles from './DropdownButton.module.css'

interface DropdownOption {
  id: string
  label: string
}

interface DropdownButtonProps {
  label: string
  options: DropdownOption[]
  onSelect: (id: string) => void
  disabled?: boolean
}

export function DropdownButton({
  label,
  options,
  onSelect,
  disabled = false,
}: DropdownButtonProps) {
  const [isOpen, setIsOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleSelect = (id: string) => {
    onSelect(id)
    setIsOpen(false)
  }

  return (
    <div className={styles.container} ref={containerRef}>
      <button
        className={styles.trigger}
        onClick={() => setIsOpen(!isOpen)}
        disabled={disabled}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
      >
        {label}
        <span className={styles.arrow}>&#9662;</span>
      </button>

      {isOpen && (
        <ul className={styles.menu} role="listbox">
          {options.map((option) => (
            <li key={option.id}>
              <button
                className={styles.option}
                onClick={() => handleSelect(option.id)}
                role="option"
              >
                {option.label}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
