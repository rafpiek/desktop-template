# Typewriter feature in Document Editor

## Overview

The typewriter feature similar to other editors.

## Requirements

- User can turn it on and off directly in the document view, and the setting is stored in local storage
  - We use switch toggle to turn on and off the typewriter feature
- Typewriter should focus the current working block with sky blue highlight and slight different font color
- Active block is the block where the caret currently is
- It should keep the active block always in the center of the viewport
- If user enters to create new block it should scroll accordingly
- If user clicks on any other block and makes it active by putting the caret in it, it should scroll accordingly
- In the future we would need other typewriter modes like top and bottom of the viewport so keep this future in mind
- For now we focus only on center mode

## Implementation plan

### Clarifying Questions & Answers

1.  **Q: Where should the toggle for the typewriter feature be located?**
    -   **A:** The existing editor settings panel is a suitable location.

2.  **Q: What specific color should be used for the "sky blue highlight"?**
    -   **A:** A suitable blue from the existing Tailwind CSS color palette should be used.

3.  **Q: Should the highlight apply to just the immediate block or the entire parent block (e.g., a whole list)?**
    -   **A:** The highlight should apply to the entire parent block.

4.  **Q: Should the scrolling be instant or animated?**
    -   **A:** The scroll should be a smooth, animated transition.

5.  **Q: Should the active block be perfectly centered, or have an offset?**
    -   **A:** It should have a slight offset, but this should be configurable to allow for absolute centering.

6.  **Q: How should the feature behave with content shorter than the viewport?**
    -   **A:** The active line should always be centered, using dynamic padding if necessary.

7.  **Q: How should the setting for future modes (top, bottom) be implemented now?**
    -   **A:** A dropdown menu should be used from the start, initially containing "Off" and "Center" modes.

8.  **Q: Should typewriter mode be active during Zen Mode?**
    -   **A:** Yes, it should remain active and functional in Zen Mode.

9.  **Q: How should text selection (spanning multiple blocks) be handled?**
    -   **A:** The feature is driven only by the caret's position. It should be inactive when a range of text is selected.

10. **Q: What about the font color change for the active line?**
    -   **A:** The font color should be a variation of sky blue.

### Task Breakdown & To-Do List

Here is a comprehensive to-do list for implementing the typewriter feature.

#### Phase 1: Setup & UI
- [ ] Create a `useTypewriter.ts` hook to manage state (e.g., `mode`, `offset`) and persist it to `localStorage`.
- [ ] Add a `Select` dropdown component to the `EditorSettingsSheet` to control the typewriter mode. The initial options will be "Off" and "Center".
- [ ] Connect the new dropdown to the `useTypewriter` hook to read and update the state.

#### Phase 2: Core Logic
- [ ] In `DocumentEditor.tsx`, consume the `useTypewriter` hook to get the current settings.
- [ ] Create a `useEffect` hook that listens for changes in the editor's selection (i.e., caret movement).
- [ ] Inside the effect, identify the current block element based on the caret's position using Plate's APIs.
- [ ] Implement the smooth scrolling logic to vertically center the active block element within the editor's viewport.
- [ ] Add the logic to handle the configurable vertical offset (e.g., center vs. slightly above center).

#### Phase 3: Styling
- [ ] Define new CSS styles for the active typewriter block (e.g., a `typewriter-active` class) to apply the sky blue background highlight and font color change.
- [ ] Dynamically apply and remove this class to the appropriate block element as the caret moves.
- [ ] Implement dynamic vertical padding for the main editor container. This will ensure the centering logic works correctly even when the document content is shorter than the viewport height.

#### Phase 4: Integration & Testing
- [ ] Verify that the typewriter scrolling and highlighting function correctly when Zen Mode is enabled.
- [ ] Test the feature with various block types (headings, paragraphs, nested lists, code blocks, etc.) to ensure consistent behavior.
- [ ] Confirm that the typewriter effect is disabled when a range of text is selected, and re-engages when the selection is collapsed to a single caret.
- [ ] Test switching between different documents to ensure the state and behavior remain correct.
  