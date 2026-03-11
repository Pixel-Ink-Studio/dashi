import { Navbar } from '@/components/layout/Navbar'
import { ChatContainer } from '@/components/chat/ChatContainer'

export default function Home() {
  return (
    <div className="flex flex-col h-screen bg-acme-navy">
      <Navbar />
      <main className="flex-1 overflow-hidden pt-16">
        <ChatContainer />
      </main>
    </div>
  )
}
