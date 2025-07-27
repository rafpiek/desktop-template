# The ability to set the font size of the editor

## Description
I want the ability to set the font size for whole editor similar like we have in Notion app.
The user can click on settings gear icon and the Shadcn left side sheet should open.
Sheet will have multiple sections. But now we work only on font size section.
In this sheet they are 3 options:
- small
- medium
- large

Each option should add to the editor the class with the font size e.g. "font-size-small".
And then that style should cascade for all the elements so it set's appropriate sizes for headings, paragraphs, etc.
We do not treat this font size option as same font size for all the elements, but it's rather the group of sizes applied to each element separately.
Each font size group should look good together. So small font size cannot apply to h1 e.g. 60px. It should have proportional values.

## Implementation plan
1. **Define CSS font-size groups (now five presets)**
   - Utility classes: `.font-size-xs`, `.font-size-sm`, `.font-size-md` (default), `.font-size-lg`, `.font-size-zen`.
   - Tuned specifically for long-form fiction writing—body text stays within the ergonomic 12–22 px band, headings maintain comfortable hierarchy.
   - Declare per-class CSS variables. Example baseline (feel free to tweak after real-world testing):

     ```css
     /* Tight mode – when you need maximum words on screen */
     .font-size-xs {
       --fs-h1: 1.5rem;  /* 24px */
       --fs-h2: 1.25rem; /* 20px */
       --fs-body: 0.75rem; /* 12px */
     }

     /* Compact but readable */
     .font-size-sm {
       --fs-h1: 1.75rem; /* 28px */
       --fs-h2: 1.5rem;  /* 24px */
       --fs-body: 0.875rem; /* 14px */
     }

     /* Balanced default */
     .font-size-md {
       --fs-h1: 2rem;   /* 32px */
       --fs-h2: 1.75rem;/* 28px */
       --fs-body: 1rem; /* 16px */
     }

     /* Spacious editing */
     .font-size-lg {
       --fs-h1: 2.25rem; /* 36px */
       --fs-h2: 2rem;    /* 32px */
       --fs-body: 1.125rem; /* 18px */
     }

     /* ZEN mode – oversized for effortless focus */
     .font-size-zen {
       --fs-h1: 2.75rem; /* 44px */
       --fs-h2: 2.375rem;/* 38px */
       --fs-body: 1.375rem; /* 22px */
     }

     :where([class*="font-size-"]) h1 { font-size: var(--fs-h1); }
     :where([class*="font-size-"]) h2 { font-size: var(--fs-h2); }
     :where([class*="font-size-"]) p,
     :where([class*="font-size-"]) li,
     :where([class*="font-size-"]) blockquote {
       font-size: var(--fs-body);
       line-height: 1.55;
     }

     /* Optional: narrow the line-length in ZEN to ~65ch for readability */
     .font-size-zen .plate-editor {
       max-width: 65ch;
       margin-inline: auto;
     }
     ```

2. **State hook & persistence**
   - `useFontSize` maintains both the current preset **and** the last non-zen choice so we can bounce back smoothly.
   - Internal sketch:
     ```ts
     type Size = 'xs' | 'sm' | 'md' | 'lg' | 'zen';
     const [fontSize, setFontSize] = useLocalStorage<Size>('editor-font-size', 'md');
     const [lastNonZenSize, setLastNonZenSize] = useLocalStorage<Size>('editor-last-non-zen', 'md');

     const toggleZen = (on: boolean) => {
       if (on) {
         setLastNonZenSize(fontSize === 'zen' ? 'md' : fontSize);
         setFontSize('zen');
       } else {
         setFontSize(lastNonZenSize ?? 'md');
       }
     };
     ```
   - Expose `isZen = fontSize === 'zen'` to keep settings sheet & zen-mode toggle in sync.

3. **Settings UI**
   - Settings sheet gets a *Font size* radio-group with 5 labelled options (include preview text snippets like "Aa").
   - For users already in Zen-mode (if separate UI exists) keep them in sync: when entering Zen, automatically switch to `'zen'` size and restore previous size on exit.

4. **Editor container wiring**
   - Apply `className={cn('font-size-'+fontSize)}` to the same wrapper as before. No other changes needed; CSS cascade handles the rest.

5. **Debounce reflow**
   - Font-size change is purely CSS; no heavy rerenders expected—no extra throttling required.

6. **Tests & QA**
   - Cypress: load each size, assert computed `font-size` on h1 and p nodes.
   - Vitest: ensure `useFontSize` defaults and persists across remounts.

7. **Migration & defaults**
   - Existing users fall back to `medium` when no key present.
   - Guard feature behind `VITE_FONT_SIZE_SELECTOR` env flag until fully tested.

8. **Accessibility**
   - Radio buttons labelled with size name & sample text.
   - Ensure contrast and scaling look good across zoom levels.

### Timeline (optimistic)
- CSS & hook: **½ day**
- UI integration: **½ day**
