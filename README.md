# Desktop App Template

A modern desktop application template built with **React 19**, **Tauri 2.7**, **TypeScript**, and **Tailwind CSS**.

Perfect for building cross-platform desktop applications with web technologies and native performance.

## ✨ Features

- 🚀 **Modern Stack**: React 19, TypeScript, Vite, Tauri 2.7
- 🎨 **Beautiful UI**: Tailwind CSS + shadcn/ui components
- 🌙 **Theme Support**: Light/dark mode with system preference detection
- 📝 **Rich Text Editor**: Tiptap editor with basic formatting
- 📊 **Data Visualization**: Charts with Recharts library
- ⚡ **Fast Development**: Hot reload with Vite
- 📱 **Responsive**: Mobile-first responsive design
- 🔧 **TypeScript**: Full type safety and excellent DX

## 🛠️ Prerequisites

- [Bun](https://bun.sh/) - Fast JavaScript runtime and package manager
- [Rust](https://www.rust-lang.org/) - Required for Tauri (install via rustup)
- [Node.js](https://nodejs.org/) - Alternative to Bun if preferred

## 🚀 Quick Start

1. **Install dependencies:**
   ```bash
   bun install
   ```

2. **Start development server:**
   ```bash
   # Web development (browser)
   bun run dev
   
   # Desktop app development
   bun run tauri:dev
   ```

3. **Build for production:**
   ```bash
   # Web build
   bun run build
   
   # Desktop app build
   bun run tauri:build
   ```

## 📁 Project Structure

```
src/
├── components/          # React components
│   ├── ui/             # shadcn/ui components
│   ├── editor/         # Tiptap editor components
│   ├── settings/       # Settings page components
│   └── theme-provider.tsx
├── pages/              # Application pages
│   ├── about.tsx       # About the template
│   ├── editor.tsx      # Editor showcase
│   ├── settings.tsx    # App settings
│   └── stats.tsx       # Charts & analytics
├── hooks/              # Custom React hooks
├── lib/                # Utilities and configurations
└── styles/             # CSS files
```

## 🎯 What's Included

### Pages
- **Home**: Welcome dashboard with navigation
- **About**: Template information and features
- **Editor**: Tiptap rich text editor showcase
- **Settings**: Theme, preferences, and app configuration
- **Stats**: Data visualization with various chart types

### Components
- **UI Library**: Full shadcn/ui component collection
- **Theme System**: Dark/light mode with persistence
- **Rich Text Editor**: Basic Tiptap editor with formatting
- **Charts**: Line, bar, area, and pie charts with Recharts
- **Navigation**: Responsive layout with routing

### Features
- **Cross-platform**: Windows, macOS, and Linux support
- **Native Performance**: Tauri provides native desktop capabilities
- **File System Access**: Read/write files with Tauri's secure API
- **Auto-updates**: Built-in update mechanism (configurable)
- **System Integration**: Native notifications and system tray

## 📋 Available Scripts

- `bun run dev` - Start Vite development server
- `bun run build` - Build for production
- `bun run preview` - Preview production build
- `bun run tauri:dev` - Start Tauri desktop app in development
- `bun run tauri:build` - Build desktop app for distribution
- `bun run lint` - Run ESLint

## 🎨 Customization

### Theming
The template uses Tailwind CSS with CSS custom properties for theming. Modify `/src/index.css` to customize colors and design tokens.

### Adding Pages
1. Create a new page component in `/src/pages/`
2. Add the route to `/src/App.tsx`
3. Update the navigation in the homepage

### Using the Editor
The Tiptap editor is configured with basic extensions. See `/src/components/editor/v2/plugins/basic-editor-kit.tsx` to add more features.

### Adding Charts
The template includes Recharts. See `/src/pages/stats.tsx` for examples of line charts, bar charts, area charts, and pie charts.

## 🔧 Configuration

### Tauri Configuration
Edit `/src-tauri/tauri.conf.json` to customize:
- App name, version, and description
- Window settings (size, decorations, etc.)
- Security and permissions
- Bundle settings for different platforms

### TypeScript
The project uses strict TypeScript configuration. Modify `tsconfig.json` for different compiler options.

## 🚀 Deployment

### Desktop App
```bash
# Build for current platform
bun run tauri:build

# Cross-platform builds (requires additional setup)
# See Tauri documentation for cross-compilation
```

The built app will be in `/src-tauri/target/release/bundle/`

### Web App
```bash
bun run build
```
Deploy the `/dist/` folder to any static hosting service.

## 📚 Learn More

- [Tauri Documentation](https://tauri.app/v2/guides/)
- [React Documentation](https://react.dev/)
- [Tailwind CSS](https://tailwindcss.com/)
- [shadcn/ui](https://ui.shadcn.com/)
- [Tiptap Editor](https://tiptap.dev/)
- [Recharts](https://recharts.org/)

## 📄 License

This template is available as open source under the terms of the [MIT License](LICENSE).

## 🤝 Contributing

Contributions, issues, and feature requests are welcome! Feel free to check the issues page.

---

**Happy Building!** 🚀
