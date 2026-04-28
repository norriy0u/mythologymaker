# ⚡ Mythology Maker

An immersive, multi-page web experience where you forge an original myth by selecting ancient symbols, brought to life by live AI.

## ✨ Features

- **Element Selection Grimoire**: A visually striking interface (`pick.html`) where you select 3 symbols, set the character alignment (God/Demon), and pick a cultural pantheon.
- **Live AI Storyteller**: Uses Pollinations.ai's text API to instantly weave a unique, structured myth (Origin, Conflict, Convergence, Legacy) based on your choices.
- **Generative Canvas Portraits**: A dynamic character portrait is drawn on the `canvas` based on the chosen alignment and symbols.
- **Parallax Manuscript Scroll**: The story unfolds on an aged parchment background (`story.html`) with floating SVG flames and stars that move at different speeds as you scroll.
- **Intersection-Triggered Audio**: A Web Audio API drone plays continuously, while specific musical flourishes trigger automatically as you scroll into new chapters.

## 🚀 Getting Started

1.  Open `pick.html` in any modern web browser.
2.  Or serve locally:
    ```bash
    python -m http.server 8000
    ```
    *Note: The app requires an active internet connection to contact the Pollinations.ai API for story generation.*

## 🛠️ Tech Stack

- **HTML5 & CSS3**: Custom grid layouts, CSS noise for the parchment texture, and parallax scrolling.
- **Vanilla JavaScript**: State management (`sessionStorage`), Canvas drawing, and `IntersectionObserver` for scroll events.
- **Pollinations.ai**: Live AI myth generation (Mistral model default).
- **Web Audio API**: Synthetic drones, atmospheric noise, and ascending chime scales.

---
*Built for the VishwaNova Weboreel Hackathon.*
