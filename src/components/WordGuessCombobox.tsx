import { useEffect, useRef, useState } from 'react'
import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
  useFilteredItems,
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

/**
 * Reports the combobox's currently filtered (search-matching) items to the parent — must render
 * inside `<Combobox>` since `useFilteredItems` reads from Combobox's internal context.
 *
 * `useFilteredItems` returns a new array instance on every render even when its contents haven't
 * changed, so this only calls `onChange` (and triggers a parent re-render) when the actual set of
 * matched ids changes — otherwise the parent's state update would re-render this component with
 * a fresh array reference every time, which would re-trigger the effect, forever.
 */
function FilteredItemsWatcher({ onChange }: { onChange: (items: WordOption[]) => void }) {
  const filteredItems = useFilteredItems<WordOption>()
  const previousIdsRef = useRef<string>('')

  useEffect(() => {
    const ids = filteredItems.map((item) => item.id).join(',')
    if (ids !== previousIdsRef.current) {
      previousIdsRef.current = ids
      onChange(filteredItems)
    }
  }, [filteredItems, onChange])

  return null
}

/** Searchable combobox over every word, gated behind a Confirm button (or a second Enter) so guessing never submits accidentally while narrowing the search. */
export function WordGuessCombobox({ words, onSubmit, disabled = false }: WordGuessComboboxProps) {
  const [selectedWord, setSelectedWord] = useState<WordOption | null>(null)
  const [inputValue, setInputValue] = useState('')
  const [filteredItems, setFilteredItems] = useState<WordOption[]>(words)

  function submit() {
    if (selectedWord) {
      onSubmit(selectedWord.id)
    }
  }

  return (
    <div
      className="flex items-center gap-2"
      onKeyDown={(event) => {
        // Ignore browser auto-repeat from a held-down Enter — each stage (fill, then submit)
        // should only advance on a distinct key press, not on a repeat event fired while the
        // key from the previous stage is still physically down.
        if (event.key !== 'Enter' || event.repeat) {
          return
        }

        if (selectedWord) {
          submit()
          return
        }

        if (filteredItems.length > 0) {
          setSelectedWord(filteredItems[0])
          setInputValue(filteredItems[0].word)
        } else {
          setInputValue('')
        }
      }}
    >
      <div className="min-w-0 flex-1">
        <Combobox
          items={words}
          value={selectedWord}
          onValueChange={setSelectedWord}
          inputValue={inputValue}
          onInputValueChange={setInputValue}
          itemToStringLabel={(word) => word.word}
          isItemEqualToValue={(a, b) => a.id === b.id}
          disabled={disabled}
        >
          <FilteredItemsWatcher onChange={setFilteredItems} />
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
      </div>
      <Button type="button" onClick={submit} disabled={!selectedWord}>
        Confirm
      </Button>
    </div>
  )
}
