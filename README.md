# The Trial of Common Sense

**Any topic goes on trial. Common sense always loses. Every single time.**

The Trial of Common Sense is an AI-powered theatrical courtroom simulator where users submit any debatable topic and watch it become a full dramatic legal case.

Is pineapple on pizza a crime?
Was Thanos right?
Is a hotdog a sandwich?
Should group projects be banned under international law?

The court will hear the matter.

The verdict will be guilty.

Common Sense never wins.

---

## What Is This?

The Trial of Common Sense is not a chatbot, quiz, debate tool, or productivity app.

It is an interactive courtroom performance where an AI writes a fresh trial script for every topic. The user becomes an associate counsel for Common Sense, tries to help the defense, raises objections, advises Gerald, appeals to the jury, and still watches the case collapse exactly as the court intended.

The ending is fixed.

The middle is chaos.

That is the point.

---

## Core Concept

```txt
User topic → AI-generated courtroom script → Interactive trial performance → GUILTY verdict
```

Every trial includes:

* A confused Victorian judge
* The Internet as prosecution
* Gerald Finch, the exhausted defense attorney
* Three absurd exhibits
* Cross-examination that goes nowhere
* A randomized jury of chaotic beings
* Player choices that matter emotionally but not legally
* A final verdict where Common Sense is always found guilty

---

## Characters

### Judge Cornelius Reginald Hawthorne III

A Victorian magistrate deeply confused by everything invented after 1890.

He refers to the internet as **“the electrical pamphlet”**, calls memes **“painted jests”**, and overrules objections without understanding what an objection is.

### The Internet

The prosecution.

Chaotic, contradictory, loud, overconfident, and somehow winning.

The Internet cites sources like Reddit threads, old tweets, vague cousin knowledge, and suspicious polls with eleven respondents.

### Gerald Finch

The defense attorney for Common Sense.

He has defended Common Sense for forty-seven years.

He knows he will lose.

He still tries.

### The Jury

Twelve randomly selected jurors from history, fiction, and pure nonsense.

Examples include:

* A medieval peasant
* A Silicon Valley VC
* A time-traveling Viking
* A sentient Roomba
* A tired mom of four
* A philosophy PhD student
* A Victorian chimney sweep

Every juror votes guilty.

---

## Features

* Submit any custom topic
* Generate an absurd topic automatically
* AI-generated courtroom script using Groq
* Full theatrical trial flow
* Typewriter dialogue system
* Interactive player choices
* Failed objection tracking
* Jury deliberation sequence
* Evidence board
* Court record panel
* Optional sound effects
* Adjustable reading speed
* Auto-play toggle
* Dramatic guilty verdict reveal
* Copyable verdict card
* Local case history
* Responsive courtroom UI

---

## Player Interaction

The player is assigned the role of:

> Associate Counsel for Common Sense

During the trial, the player can:

* Advise Gerald before opening statements
* Raise objections during evidence
* Pick cross-examination questions
* Make one final appeal to the jury
* Choose Gerald’s final reaction after the verdict

None of these choices change the ending.

They only make the loss more personal.

---

## Tech Stack

* **Framework:** Next.js 14 App Router
* **Language:** TypeScript
* **Styling:** Tailwind CSS
* **Animation:** Motion for React
* **AI:** Groq API
* **Model:** `llama-3.3-70b-versatile`
* **Storage:** localStorage for case history
* **Deployment:** Vercel-ready

---

## AI Integration

The app uses Groq to generate the entire trial script in one API call.

The AI returns a structured JSON object containing:

* Judge opening
* Opening statements
* Three exhibits
* Cross-examination
* Closing arguments
* Twelve juror lines
* Guilty verdict
* Sentencing speech
* Shareable verdict text

The frontend then performs the script like a courtroom stage play.

The verdict is not decided by AI.

It is always guilty.

---

## Environment Variables

Create a `.env.local` file in the project root:

```env
GROQ_API_KEY=your_groq_api_key_here
```

---

## Getting Started

Install dependencies:

```bash
npm install
```

Run the development server:

```bash
npm run dev
```

Open:

```txt
http://localhost:3000
```

---

## Production Build

```bash
npm run build
```

Run production locally:

```bash
npm start
```

---

## Project Structure

```txt
src/
  app/
    page.tsx
    trial/
      page.tsx
    api/
      generate-trial/
        route.ts
    layout.tsx
    globals.css

  components/
    Lobby.tsx
    CourtroomLoading.tsx
    TrialStage.tsx
    DialogueCard.tsx
    EvidenceBoard.tsx
    JuryBox.tsx
    VerdictScreen.tsx
    TypewriterText.tsx

  lib/
    absurdTopics.ts
    fallbackTrial.ts
    trialPrompt.ts
    trialTypes.ts
    validateTrial.ts
    sound.ts
```

---

## Design Philosophy

The UI is intentionally not styled like a typical AI product.

No glowing gradient hero sections.
No SaaS dashboard clutter.
No chatbot bubbles.
No generic “AI assistant” layout.

The goal is a grounded, cinematic courtroom atmosphere:

* Dark mahogany tones
* Aged paper textures
* Brass accents
* Formal typography
* Heavy shadows
* Restrained motion
* Dramatic pacing

The comedy comes from the courtroom taking the absurdity completely seriously.

---

## Example Verdict

```txt
Common Sense was found GUILTY of "Is pineapple on pizza acceptable?"
in Case No. 0047-∞.

Gerald sends his condolences.
```

---

## Why This Project Exists

Most AI projects are built around infinite possibility.

This one is built around fixed fate.

The AI can generate unpredictable arguments, jurors, exhibits, and dialogue, but it can never save Common Sense.

That contrast is the joke:

A fresh trial every time.
A doomed verdict every time.

---

## Status

Built as an experimental AI theatre project.

Common Sense remains unavailable for comment.

---

## License

MIT
