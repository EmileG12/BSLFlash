import { useState } from 'react'
import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
} from '@/components/ui/combobox'
import { Button } from '@/components/ui/button'
import type { WordOption } from '../hooks/useWords'

interface WordGuessComboboxProps {
  words: WordOption[]
  onSubmit: (wordId: string) => void
  disabled?: boolean
}

function wordLabel(word: WordOption) {
  return `${word.word} — ${word.definition}`
}

/** Searchable combobox over every word, gated behind a Confirm button (or a second Enter) so guessing never submits accidentally while narrowing the search. */
export function WordGuessCombobox({ words, onSubmit, disabled = false }: WordGuessComboboxProps) {
  const [selectedWord, setSelectedWord] = useState<WordOption | null>(null)

  function submit() {
    if (selectedWord) {
      onSubmit(selectedWord.id)
    }
  }

  return (
    <div
      className="flex items-center gap-2"
      onKeyDown={(event) => {
        if (event.key === 'Enter' && selectedWord) {
          submit()
        }
      }}
    >
      <Combobox
        items={words}
        value={selectedWord}
        onValueChange={setSelectedWord}
        itemToStringLabel={wordLabel}
        isItemEqualToValue={(a, b) => a.id === b.id}
        disabled={disabled}
      >
        <ComboboxInput placeholder="Search words..." className="w-full" />
        <ComboboxContent>
          <ComboboxEmpty>No matching words.</ComboboxEmpty>
          <ComboboxList>
            {(word: WordOption) => (
              <ComboboxItem key={word.id} value={word}>
                {wordLabel(word)}
              </ComboboxItem>
            )}
          </ComboboxList>
        </ComboboxContent>
      </Combobox>
      <Button type="button" onClick={submit} disabled={!selectedWord}>
        Confirm
      </Button>
    </div>
  )
}
