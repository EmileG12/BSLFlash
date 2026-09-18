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
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import type { WordOption } from '../hooks/useWords'
import './WordGuessCombobox.css'

interface WordGuessComboboxProps {
  words: WordOption[]
  onSubmit: (wordId: string) => void
  disabled?: boolean
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
        itemToStringLabel={(word) => word.word}
        isItemEqualToValue={(a, b) => a.id === b.id}
        disabled={disabled}
      >
        <ComboboxInput placeholder="Search words..." className="w-full word-guess-input" />
        <ComboboxContent>
          <ComboboxEmpty>No matching words.</ComboboxEmpty>
          <ComboboxList>
            {(word: WordOption) => (
              <TooltipProvider key={word.id}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <ComboboxItem value={word} className="word-guess-item">
                      {word.word}
                    </ComboboxItem>
                  </TooltipTrigger>
                  <TooltipContent side="right">{word.definition}</TooltipContent>
                </Tooltip>
              </TooltipProvider>
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
