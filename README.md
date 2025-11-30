# ♾️ TexLoop

> **Share Text in Real-Time. Collaborate Instantly.**

![TexLoop Banner](https://via.placeholder.com/1200x400?text=TexLoop+Preview)

TexLoop is a modern, real-time text sharing and collaboration platform designed for speed and privacy. Create temporary rooms, share code or text, and chat with others instantly—no signup required.

Built with **Next.js 15**, **Socket.IO**, and **MongoDB**.

---

## ✨ Key Features

- **⚡ Real-Time Synchronization**: Type and see changes instantly across all devices using Y.js CRDT technology.
- **🔒 Secure & Private**: Create password-protected rooms for sensitive content.
- **💬 Live Chat**: Built-in real-time chat to discuss while you collaborate.
- **⏱️ Ephemeral Rooms**: Set auto-destruction timers. Rooms clean up after themselves.
- **📱 Fully Responsive**: Seamless experience on desktop, tablet, and mobile devices.
- **🚫 No Registration**: Jump straight into a room without creating an account.

## 🛠️ Tech Stack

- **Framework**: [Next.js 15](https://nextjs.org/) (App Router)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/) & [Shadcn/UI](https://ui.shadcn.com/)
- **Real-time**: [Socket.IO](https://socket.io/) & [Y.js](https://github.com/yjs/yjs)
- **Database**: [MongoDB](https://www.mongodb.com/) (with Mongoose)
- **Icons**: [Lucide React](https://lucide.dev/)

## 🚀 Getting Started

Follow these steps to set up the project locally.

### Prerequisites

- Node.js 18+
- MongoDB instance (Local or Atlas)

### Installation

1. **Clone the repository**

   ```bash
   git clone https://github.com/akashwrites1120/texloop.git
   cd texloop
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Set up Environment Variables**
   Create a `.env.local` file in the root directory and add the following:

   ```env
   MONGODB_URI=your_mongodb_connection_string
   NEXT_PUBLIC_SITE_URL=http://localhost:3000
   NEXT_PUBLIC_SOCKET_URL=http://localhost:3000
   ENCRYPTION_KEY=your_32_character_encryption_key_here
   CRON_SECRET=your_32_character_cron_secret_here
   ```

4. **Run the Development Server**
   Since this project uses a custom server for Socket.IO, use the following command:

   ```bash
   npm run dev
   ```

5. **Open the App**
   Visit `http://localhost:3000` in your browser.

## 📂 Project Structure

```
texloop/
├── app/                  # Next.js App Router pages & API routes
├── components/           # React components
│   ├── room/             # Room-specific components (Editor, Chat)
│   ├── shared/           # Shared components (Navbar, Footer)
│   └── ui/               # Reusable UI components (Shadcn)
├── hooks/                # Custom React hooks (useSocket, useRoom)
├── lib/                  # Utility functions & configs
├── models/               # Mongoose database models
├── server.ts             # Custom Node.js server for Socket.IO
└── types/                # TypeScript type definitions
```

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the project
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

<div align="center">
  Made with ❤️ by <a href="https://github.com/akashwrites1120">Akash</a>
</div>
