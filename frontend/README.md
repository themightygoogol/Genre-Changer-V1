# MIDI Shift

An engine that analyzes MIDI files and transforms its characteristics to match music theory principles of different genres.

This engine analyses the musical structure of a MIDI file: notes, timing, rhythm, key, instrumentation, and track roles before applying genre-specific transformations.

Currently supports **Drill**. Each genre provides its own interface and transformation pipeline.

## Features

### MIDI Analysis

Upload a `.mid` or `.midi` file and the application automatically parses its musical structure, including:

- MIDI tracks and channels
- notes, pitches, velocities, and durations
- instrument information
- tempo
- drum tracks
- pitch bends
- musical key and mode
- likely bass tracks
- likely melody tracks

The parsed MIDI data is then used by the genre transformation pipeline.

### Genre Transformation

Choose a target genre and transform the MIDI using genre-specific musical rules.

#### UK Drill

The Drill transformation pipeline currently includes:

- automatic key detection
- bass-track detection
- 808 bass generation
- pitch-bend-based 808 slides
- minor-scale melody conversion
- original drum/percussion removal
- drill-style hi-hat generation
- velocity and rhythmic variation
- MIDI pitch-bend export

The generated 808 track preserves key note structure from the original bass while adapting to a Drill-style arrangement.

#### Metal

Coming soon...

#### House

Coming soon...

#### Lo-Fi

Coming soon...

## Interactive Player

The application also provides a lightweight synth and DAW preview for exploring the uploaded and transformed MIDI.

Users can:

- inspect MIDI tracks
- compare the original and transformed arrangements
- play MIDI directly in the browser
- control playback
- adjust track volume
- interact with genre-specific controls
- download the transformed MIDI file

## How It Works

The transformation process follows a general pipeline:

```text
Upload MIDI
    ↓
Parse MIDI Structure
    ↓
Analyze Tracks
    ↓
Detect Musical Characteristics
    ↓
Select Genre
    ↓
Apply Genre-Specific Transformations
    ↓
Reconstruct MIDI
    ↓
Preview + Download
```

The Drill pipeline:

```text
Original MIDI
    ↓
Detect Key
    ↓
Identify Bass Track
    ↓
Generate 808 Bass
    ↓
Generate 808 Slides
    ↓
Convert Melodic Material
    ↓
Replace / Modify Drum Elements
    ↓
Generate Drill Hi-Hats
    ↓
Export Transformed MIDI
```

This allows transformations to act according to specific characteristics of the uploaded file instead of relying entirely on fixed patterns.

## Tech Stack

**Frontend**

- React
- TypeScript
- Vite
- CSS

**MIDI Processing**

- `@tonejs/midi`
- Tone.js

The application performs MIDI parsing and transformation directly in the browser.

## Project Structure

The project separates MIDI analysis, genre transformation, shared utilities, and UI components so that additional genres can be added without rewriting the core MIDI-processing system.

Genre-specific transformation logic is kept independent wherever possible, while shared functionality such as MIDI parsing, note utilities, playback, and track analysis can be reused across transformations.

## Running Locally

Clone the repository:

```bash
git clone <repository-url>
cd <repository-name>
```

Install dependencies:

```bash
npm install
```

Start the development server:

```bash
npm run dev
```

Vite will start a local development server and provide the address in the terminal.

## Motivation

Most music genre converters operate on finished audio or apply simple effects and presets.

This project explores a different question:

> **Can the underlying composition itself be algorithmically adapted to another genre?**

Because MIDI represents musical events rather than recorded audio, the application can modify the composition at a structural level — changing rhythm, pitch, instrumentation, bass movement, articulation, and other musical characteristics while retaining elements of the original piece.

The goal is not to perfectly reproduce a genre from any arbitrary MIDI file, but to explore how musical rules and computational analysis can be combined to create recognizable stylistic transformations.

## Future Development

Planned improvements include:

- additional genre transformations
- more sophisticated melody transformation
- improved track-role classification
- context-aware 808 placement
- more natural 808 slide generation
- expanded drum-pattern generation
- improved MIDI visualization
- more detailed original/transformed comparisons
- additional user control over transformation characteristics

This project was created as a personal software and music-processing project.