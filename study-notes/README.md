# Java 21 study notebook

Open **index.html** in your browser. Every chapter and answer sheet is already generated. No installation, server, internet connection, or Jekyll setup is needed for reading.

For a local server, run these commands in this folder:

```powershell
npm start
```

Then open http://localhost:4173. Keep the terminal running; Ctrl+C stops the server.

## Studying

- Search the chapter index for topics anywhere in the chapter text.
- Open **Chapters** in the header to browse the book. Use **In this chapter** to jump between sections.
- Jump to Key points, the book’s questions, a separate Practice page, or the corresponding book answer sheet.
- Reveal explanations individually on answer sheets.
- Each chapter is followed by a separate **Practice page**, numbered as a subchapter: Chapter 1 → **1.1 Practice** → Chapter 2. Each page has two subsections: **Book practice questions** first, then the **11-question Extra quiz**. The original question blocks have moved off the reading pages. Use the chapter drawer, index, tabs, or next-page navigation to open practice.
- Selecting an answer immediately reveals the explanation. Correct choices turn green; an incorrect selection turns red while the correct choices turn green. Select-two questions show explanations and both correct choices immediately, with partial selections labeled **Partly correct**. Only the exact full answer set counts as correct.
- **Try this question again** resets one question. **Restart book practice** and **Restart extra quiz** reset their own sections independently. Each section has its own score and saved selections.
- **Free resources** below each quiz links to relevant tutorials, Java 21 references, and coding exercises. The quizzes work offline; external resources need a connection.
- Copy Java examples, adjust text with **Aa**, or use **Focus** for a wider reading area.
- Write notes at the bottom of each page and mark chapters complete.
- Use **Print** to print a chapter or save it as a PDF. Answer sheets include all explanations when printed.

Notes and completion are saved in your current browser profile, with no account or cloud sync. Clearing browser data removes them. Switching between direct file opening and the local server uses separate browser storage. Copy important notes elsewhere as a backup.

Quiz selections are also stored locally; explanations and the running score appear immediately and are restored when you revisit the practice page. The 154 additional questions are original learning exercises, not official exam questions or a prediction of an exam score. They use Java 21 without preview features. Standard imports and an appropriate enclosing context are assumed. The bank is maintained in `practice/bank.mjs`, separately from the original book. Previous links to embedded quizzes redirect to their new practice pages.

The other 146 questions and their explanations are imported from the original chapter Markdown and answer sheets by `practice/book-bank.mjs`. Reviewed corrections or clarifications are maintained explicitly in `practice/book-corrections.mjs`, displayed beside the affected questions, and linked to Java references. The original Markdown is preserved. “Original answers” pages retain the source answer sheets and point to reviewed updates in interactive practice. These are source-backed learning questions, not a claim that every original snippet has been compiler-verified.

## Updating the pages

Edit the original `../ch01.md`, other chapter files, answer files, or `../intro.md`, then run:

```powershell
npm install
npm run build
```

The build renders all Markdown into static HTML, including Java syntax highlighting, relative links, and a local search index. Original Markdown is preserved. Reading times are estimates. Study material and exam information are reproduced from the supplied book, not independently updated.

`npm run check` validates page links and runs browser checks. On Windows it uses installed Microsoft Edge; on other systems install Playwright Chromium with `npx playwright install chromium`. You can also set `CHROME_PATH` to your browser executable.

`npm run check:practice` validates all 300 questions across 28 independently scored sections on 14 practice pages, including multi-answer grading, immediate explanations, persistence, independent resets, rich code choices, and mobile widths. The checks do not compile Java snippets.

## Typography and design references

The reader uses locally bundled Source Sans 3, with its license in `assets/fonts/OFL.txt`. Fonts work offline. The clean publication layout draws on [Julia Evans’s technical blog](https://jvns.ca/), [A List Apart](https://alistapart.com/), and [Practical Typography’s guidance on line length](https://practicaltypography.com/line-length.html). Reference links are for context; reading the notebook does not load those sites.

## Attribution

Adapted for personal study from Esteban Herrera’s *Java SE 21 Developer Study Guide*, © 2024, under CC BY-NC-SA 4.0. See LICENSE.txt. Changes add a reading interface, navigation, syntax highlighting, answer disclosures, and local study tools. The generated Date API chapter also repairs the original Localization cross-reference from chapter 15 to chapter 14.
