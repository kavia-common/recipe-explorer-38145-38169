# Recipe App Frontend (Tizen Web)

- Preview: `npm run preview` (served on port 3000)
- Build: `npm run build`

Notes:
- Tooling pins Vite 4.x for Node 18 compatibility in CI. Node 18.20.x is supported with Vite 4.5.x.
- If you see a Node/Vite warning like "Vite requires Node 20.19+," ensure that `node_modules/vite/package.json` shows version 4.5.5 and reinstall dev deps if needed: `npm i --save-dev vite@4.5.5 @vitejs/plugin-react@3.1.0`.
- If port 3000 is in use during preview, you can run `npm run preview -- --port 3001 --strictPort` instead.
- Use TV remote arrow keys to move focus between sidebar and cards; Enter to open/close details; Back clears filters or closes details.
