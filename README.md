# BookStack

A personal bookshelf for iOS and Android. Track what you're reading, what you've finished and how far along you are.

Design: [Figma — Book Stack](https://www.figma.com/design/5YusE8XzdQictaWqt2Bf9C/Book-Stack?node-id=96-2865)

## Stack

| Area            | Choice                                                                                                                      |
| --------------- | --------------------------------------------------------------------------------------------------------------------------- |
| App framework   | [Expo](https://docs.expo.dev) SDK 58 · React Native 0.88 · TypeScript                                                       |
| Navigation      | [Expo Router](https://docs.expo.dev/router/introduction/) (file-based, `src/app/`)                                          |
| Styling         | [Uniwind](https://docs.uniwind.dev) — Tailwind CSS v4 classes on React Native components                                    |
| Local database  | `expo-sqlite` + [Drizzle ORM](https://orm.drizzle.team) (offline-first, typed, migrations)                                  |
| Remote data     | [TanStack Query](https://tanstack.com/query) · [Open Library](https://openlibrary.org/developers/api) search (free, no key) |
| App state       | [Zustand](https://zustand.docs.pmnd.rs)                                                                                     |
| UI details      | `expo-glass-effect` (Liquid Glass on iOS 26), `expo-haptics`, `expo-image`, `lucide-react-native` icons                     |
| Fonts           | Schibsted Grotesk + Inter via `@expo-google-fonts`                                                                          |
| Quality         | ESLint (`eslint-config-expo`), Prettier (+ Tailwind class sorting), Jest (`jest-expo`) + Testing Library                    |
| Build & release | [EAS](https://docs.expo.dev/eas/) Build / Submit / Update (`eas.json`)                                                      |

## Getting started

```bash
npm install
npm start
```

Scan the QR code with **Expo Go** on your phone (iOS or Android). Everything currently in the app runs in Expo Go.

When you add a library with custom native code, switch to a development build:

```bash
npx eas-cli@latest build --profile development --platform ios   # or android
```

## Scripts

| Command               | What it does                                                  |
| --------------------- | ------------------------------------------------------------- |
| `npm start`           | Start the dev server                                          |
| `npm run lint`        | ESLint                                                        |
| `npm run typecheck`   | TypeScript                                                    |
| `npm test`            | Jest unit tests                                               |
| `npm run format`      | Prettier                                                      |
| `npm run db:generate` | Generate a Drizzle migration after editing `src/db/schema.ts` |

## Project layout

```
src/
  app/                 Routes (Expo Router). Every file is a screen.
    (tabs)/            Library + Stats, with the floating glass tab bar
    book/[id].tsx      Book detail
    add.tsx            Add-a-book modal (Open Library search)
  components/
    ui/                Design-system primitives (Text, Button, GlassSurface, FilterChips…)
    books/             Book cover, grid, progress bar, empty shelf
    navigation/        Tab bar and headers
  db/                  Drizzle schema + SQLite client
  features/books/      Queries, mutations, Open Library client
  stores/              Zustand stores
  theme/tokens.ts      Raw token values for icon colors etc.
  global.css           Design tokens (@theme) — the single source for colors, fonts and type scale
drizzle/               Generated SQL migrations (run automatically on launch)
```

## Design tokens

Colors, fonts and type sizes from the Figma variables live in `src/global.css` and become Tailwind classes:

- Colors: `bg-brand`, `text-brand-on`, `text-content`, `text-content-secondary`, `bg-surface-subtle`, `bg-surface-muted`, `bg-surface-inverse`, `bg-success-bg`, `text-warning`, …
- Type: use `<Text variant="h2" | "body-lg-semibold" | "body-sm" | "caption" …>` from `src/components/ui/text.tsx`.

If a Figma variable changes, update `src/global.css` and the matching value in `src/theme/tokens.ts`.
