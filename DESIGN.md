---
name: Java 21 Study Notes
description: A clean, offline technical reading website.
colors:
  paper: "#ffffff"
  ink: "#25272a"
  muted: "#666b73"
  line: "#e6e7e9"
  link: "#245ca6"
  tint: "#f3f4f6"
  code: "#f6f7f8"
  correct: "#286344"
  correct-tint: "#edf5f0"
  incorrect: "#974130"
  incorrect-tint: "#fbefed"
typography:
  display:
    fontFamily: '"Source Sans 3", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif'
    fontSize: "clamp(30px,3vw,38px)"
    fontWeight: 700
    lineHeight: 1.2
    letterSpacing: "-0.8px"
  headline:
    fontFamily: '"Source Sans 3", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif'
    fontSize: "27px"
    fontWeight: 600
    lineHeight: 1.3
    letterSpacing: "-0.35px"
  title:
    fontFamily: '"Source Sans 3", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif'
    fontSize: "22px"
    fontWeight: 600
    lineHeight: 1.4
    letterSpacing: "-0.2px"
  body:
    fontFamily: '"Source Sans 3", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif'
    fontSize: "19px"
    fontWeight: 400
    lineHeight: 1.75
  label:
    fontFamily: '"Source Sans 3", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif'
    fontSize: "14px"
    lineHeight: 1.5
  code:
    fontFamily: 'Consolas, "Cascadia Code", monospace'
    fontSize: "14px"
    lineHeight: 1.7
rounded:
  control: "3px"
  code: "4px"
spacing:
  compact: "12px"
  content: "22px"
  section: "48px"
components:
  button-primary:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.ink}"
    rounded: "{rounded.control}"
    padding: "10px 14px"
  search:
    textColor: "{colors.ink}"
    rounded: "{rounded.control}"
    padding: "9px 12px"
    width: "255px"
  navigation-selected:
    backgroundColor: "{colors.tint}"
    textColor: "{colors.ink}"
    padding: "11px 12px"
  code-panel:
    backgroundColor: "{colors.code}"
    rounded: "{rounded.code}"
  answer-disclosure:
    textColor: "{colors.ink}"
    padding: "20px 0"
  quiz-option:
    textColor: "{colors.ink}"
    rounded: "{rounded.control}"
    padding: "10px 12px"
---

# Design System: Java 21 Study Notes

## Overview

**Creative North Star: "A Clear Technical Publication"**

White space, neutral text, and blue links support long technical reading. Source Sans 3 carries both prose and controls; fine rules organize the chapter index and article tools. The masthead names the material directly, without promotional slogans.

The header and chapter drawer use the same 28px coffee-cup mark from `study-notes/assets/favicon.svg`. The blue rounded square, white cup, and warm steam lines also serve as the browser favicon. Page titles start with “Java 21 Study Notes.”

This system describes the separate offline `study-notes` reader. The user rejected the earlier decorative notebook styling; the implemented system uses a compact publication index and an article-first layout.

**Key Characteristics:**

- White surfaces, quiet rules, and blue text links.
- Readable sans-serif prose and light code examples.
- Compact chapter lists and navigation opened on demand.

## Colors

The palette uses one interface accent with neutral reading surfaces.

### Primary

Blue identifies links, keyboard focus, reading progress, completed chapters, and the current section. Completion controls use a pale blue pressed state. Syntax highlighting has its own restrained purple, green, orange, and blue colors.

### Neutral

White is the page, masthead, drawer, and input background. Ink carries prose and titles; muted text carries metadata and secondary navigation. Fine gray rules separate content. Tint marks hover and selected navigation; the light code surface distinguishes examples.

### Feedback

Green text and a pale green option fill identify correct quiz answers. Rust red text and a pale rust fill identify incorrect selections. Pair these colors with explicit Correct, Partly correct, or Incorrect text and answer letters; color alone never communicates the result. Single-answer feedback appears immediately on selection; checkbox feedback appears after Check answer. The `.quiz-option.is-answer:has(input:checked)` and `.quiz-option.is-wrong:has(input:checked)` rules ensure semantic fills outrank the generic pale blue checked state, including while hovering.

## Typography

Source Sans 3 is self-hosted in regular, italic, semibold, and bold weights, with system sans-serif fallbacks. Consolas and Cascadia Code carry examples and inline code. Font files remain local for offline reading.

The frontmatter defines chapter titles, section headings, prose, labels, and code. The index title uses 34px. On phones, chapter titles use 31px, the index title uses 30px, prose uses 18px, and code uses 13px. The reading-size control can override prose size.

**The Reading Rhythm Rule.** Keep prose leading generous and paragraphs distinct; labels and metadata remain smaller than reading text.

## Layout

A sticky masthead spans the page. A centered article grid pairs a reading column capped at 712px with a 208px section index and a 72px gap, inside a 1120px container with 32px side padding. The section index lists h2 sections; practice pages instead list Book questions and Extra quiz with their separate counts, then Free resources. The index uses a single-column 884px container and ruled chapter rows, with a smaller practice sublink beneath each chapter.

Chapter navigation is a 340px toggle drawer at every viewport, capped to leave 38px of the screen visible. It is inert while closed. At 1000px and below, the section index moves above the article as an in-flow disclosure. At 600px and below, content uses 22px side padding and search fills its row. Code and tables scroll horizontally. Focus mode hides the section index and centers the article; print uses one text column and hides reader controls.

## Elevation & Depth

There are no box shadows. Borders and restrained surface tints organize content; a translucent scrim separates the open drawer from the page. Drawer movement uses a short ease-out transition, while transient status messages fade. Reduced-motion preferences disable transitions and smooth scrolling.

## Shapes

Controls have small corners; code panels are slightly softer. Navigation rows and answer disclosures remain flat and ruled. Icons use small inline stroke SVGs. Completion indicators are small circles, paired with semantic state on controls.

## Components

- **Completion button:** white, fine bordered, and compact. Hover uses neutral tint; the pressed state adds a pale blue background, blue text, and a stronger border.
- **Search field:** bordered wrapper with a search icon, transparent input, and keyboard shortcut hint. It expands across the toolbar on phones.
- **Navigation:** the masthead provides Chapters and reading tools. Drawer rows show tabular chapter numbers, neutral selected fill, and optional completion dots; smaller indented practice sublinks use subchapter numbers such as 1.1. Chapter tabs underline the current view and link to its separate practice page. The index also exposes each practice sublink. Previous/next navigation follows chapter → its practice page → next chapter; the final practice page returns to the index. Section links use blue for the current section, including question topics on practice pages. Continue reading restores either a chapter or a practice page.
- **Code panel:** light bordered container with language and copy toolbar, highlighted monospace text, and independently scrollable, keyboard-focusable code.
- **Answer disclosure:** full-width question row with a fine lower rule, explanation label, and plus/minus indicator. Expanded explanations use the reading face and rhythm.
- **Notes field:** white, resizable textarea with a fine border, blue caret, and adjacent local-save status.
- **Quiz question:** a flat, ruled fieldset with a semibold legend, muted topic and selection instruction, and vertically stacked options. Use native radio inputs for Select one answer and checkboxes for Select 2 answers. Extra quiz options use padded native labels. Rich book options use a padded flow-content wrapper around a native input, a letter, and prose or code; the input is named by the letter and content. Clicking the wrapper selects the input while preserving code text selection, links, and native keyboard controls. Options use the reading face at 17px with 1.6 leading and retain the blue focus treatment. Code examples keep the existing scrollable code surface.
- **Practice heading:** each separate practice page begins with a document h1 such as Chapter 1.1 Practice, the parent chapter title as a muted subtitle, separate book and extra question counts, and links to the chapter, current practice page, and Original answers. Keep the existing document title hierarchy and reading width. All 14 practice pages place Book practice questions above Extra quiz on the same page, with a fine rule and section spacing between them. Book practice contains 146 source questions across the reader; Extra quiz contains 154 original exercises, 11 per chapter. Section jump links mirror this order. Each subsection has an instruction and its own form and score; Extra quiz also has an About these questions disclosure and local-save context.
- **Quiz feedback and actions:** single-answer questions reveal feedback immediately. Checkbox questions have a bordered Check answer button below their choices, disabled until at least one choice is selected. Checking reveals the explanation, correct options in green, chosen incorrect options in rust red, and a verdict naming the correct answer letters. A correct subset is labeled Partly correct; only the exact set earns a correct score. Editing checkbox selections hides feedback and grading colors until checked again. Each feedback block is a polite live status. The running score counts reviewed questions only. Try this question again clears that question and focuses its first choice. Restart book practice and Restart extra quiz independently clear selections, reviewed state, and score counts. Separate storage keys preserve each subsection?s selections and reviewed state; unfinished checkbox selections remain hidden on reload. Single-answer questions automatically regrade on restoration.

- **Source and reviewed notes:** affected book questions carry a neutral gray reviewed-note block before the choices. Feedback includes muted answer-origin text and a Java reference link when supplied; these source notes stay visually distinct from grading colors. Original answer sheets retain their source text and show a notice linking to reviewed interactive questions when applicable.
- **Resource list:** a simple vertical list below a fine rule, with blue links, muted supporting descriptions, and a smaller review date. New-tab behavior and the need for internet access are stated alongside the links.

Interactive elements use a visible blue focus outline (2px, offset 4px). Preserve native disclosure semantics, visible labels, and keyboard operation.

## Do's and Don'ts

- Do use the local Source Sans 3 family for prose and interface text.
- Do keep links, focus, and progress consistently blue.
- Do preserve horizontal scrolling for code and reference tables.
- Don't add promotional slogans or decorative notebook framing.
- Don't turn the compact chapter index into a card grid.
- Don't introduce remote font or image dependencies into offline reading.
