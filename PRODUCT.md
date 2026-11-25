# Java 21 study notes

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users and purpose

The user is preparing for the Java SE 21 certification and wants the existing Markdown book to be easier and more enjoyable to study, in the reading style of Medium and Notion.

The user rejected the initial decorative notebook design and asked for a cleaner, modern reading website informed by blog and news typography. Prefer factual interface copy, readable fonts, and simple document navigation.

## Stack and constraints

Separate static HTML study pages in `study-notes`, generated from the existing chapter and answer Markdown. Preserve source material, code, author attribution, and license. The original Jekyll site remains available. Local reading must not depend on a network connection.

Each of the 14 chapters is followed by a separate subchapter practice page (1 → 1.1 Practice → 2), containing its original book practice questions above an 11-question extra quiz, then related free resources. The 146 book questions use the supplied answer sheets, with explicitly labeled reviewed corrections; the 154 extra questions are original learning exercises. Reading pages no longer contain the long book question blocks. Single-answer questions show immediate feedback. Checkbox questions wait for Check answer before revealing explanations and grading colors; editing a selection hides feedback until checked again. Only checked questions count toward the score, and scoring requires the exact answer set. Each subsection independently saves selections, restores submitted feedback while keeping unfinished checkbox selections hidden, and supports retry/reset. These are learning exercises, not official certification questions. External resources require internet access.

## Evidence

Fourteen chapter files, fourteen answer files, `intro.md`, and `LICENSE.txt`. These are the supplied study material; exam facts are reproduced from the source rather than independently verified.
