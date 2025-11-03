# Recipe App Frontend (Tizen Web)

- Preview: `npm run preview` (served on port 3000)
- Dev: `npm run dev` (served on port 3000)
- Build: `npm run build`

Notes:
- CI uses Node 18.x; Vite is pinned to 4.5.5 and @vitejs/plugin-react to 3.1.0 for compatibility.
- If you see a warning like "Vite requires Node 20.19+," reinstall dev deps to restore Vite 4.x:
  `npm i --save-dev vite@4.5.5 @vitejs/plugin-react@3.1.0`
- The preview/dev server binds to 0.0.0.0 with `--strictPort` on port 3000 to satisfy the preview system. If 3000 is busy, the command will fail fast; free the port and retry or choose another port explicitly.
- Use TV remote arrow keys to move focus between sidebar and cards; Enter to open/close details; Back clears filters or closes details.
