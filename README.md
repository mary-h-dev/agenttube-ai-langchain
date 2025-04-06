# 🧠 Multi-Source AI Agent (LangChain-Powered)

An advanced AI agent built with LangChain that intelligently processes and responds to various data sources — including YouTube videos, PDF files, and private client datasets.

This project is designed to demonstrate flexible AI reasoning and tool integration using LangChain, LangGraph, OpenAI, Anthropic, and Google GenAI.

## ✨ Features

- 🎥 **YouTube Analysis**: Summarizes and analyzes public YouTube videos via link input.
- 📄 **PDF Understanding**: Parses and answers questions based on uploaded PDF content.
- 🔐 **Private Client Data**: Handles context-aware queries using predefined customer datasets.
- 🧠 **Multi-model AI**: Supports OpenAI, Anthropic, and Google Generative AI models.
- 🔗 **LangGraph Workflows**: Manages decision-making and flow using LangChain's LangGraph.
- 👤 **Authentication**: Integrated with Clerk for secure user sessions.
- ☁️ **Convex**: Used as backend for data storage and real-time functionality.

## 🛠 Tech Stack

- **Framework**: Next.js 15 + React 19 + TypeScript
- **AI Frameworks**: LangChain, OpenAI, Anthropic, Google GenAI
- **Authentication**: Clerk
- **UI/UX**: Tailwind CSS, Radix UI, Lucide Icons
- **Data**: Convex (Realtime DB)
- **Tools**: PDF Parsing, YouTube Transcript API, LangGraph, WXFlows

## 🚀 Getting Started

```bash
pnpm install
pnpm dev
