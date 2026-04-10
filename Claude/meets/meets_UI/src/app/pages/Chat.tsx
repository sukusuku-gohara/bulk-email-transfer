import { useState, useRef, useEffect } from "react";
import { useParams, useNavigate } from "react-router";
import { ArrowLeft, Send, Phone, Video, ShieldCheck } from "lucide-react";
import { clsx } from "clsx";

const MOCK_MESSAGES = [
  { id: 1, sender: "other", text: "初めまして！よろしくお願いします😊", time: "14:30" },
  { id: 2, sender: "me", text: "初めまして！こちらこそよろしくお願いします！", time: "14:35" },
  { id: 3, sender: "other", text: "趣味は映画鑑賞なんですね！最近何見ましたか？", time: "14:40" },
];

export function Chat() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [messages, setMessages] = useState(MOCK_MESSAGES);
  const [inputText, setInputText] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const isAgent = id === "agent";
  const chatPartnerName = isAgent ? "担当エージェント (佐藤)" : "Aoi";

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = () => {
    if (!inputText.trim()) return;
    setMessages([
      ...messages,
      {
        id: Date.now(),
        sender: "me",
        text: inputText.trim(),
        time: new Date().toLocaleTimeString("ja-JP", { hour: "2-digit", minute: "2-digit" }),
      },
    ]);
    setInputText("");
  };

  return (
    <div className="flex flex-col h-[100dvh] md:h-[calc(100vh-64px)] bg-gray-50">
      {/* Header */}
      <header className="flex-none flex items-center justify-between px-4 h-14 bg-white/80 backdrop-blur-md border-b border-gray-200 sticky top-0 z-10 shadow-sm">
        <button
          onClick={() => navigate(-1)}
          className="p-2 -ml-2 text-gray-500 hover:text-gray-800 transition-colors rounded-full hover:bg-gray-100"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="flex flex-col items-center">
          <span className="font-bold text-gray-800 flex items-center space-x-1">
            {isAgent && <ShieldCheck className="w-4 h-4 text-pink-500" />}
            <span>{chatPartnerName}</span>
          </span>
          <span className="text-[10px] text-gray-500">{isAgent ? "専任サポート" : "仮交際中"}</span>
        </div>
        <div className="flex items-center space-x-1">
          {!isAgent && (
            <button className="p-2 text-pink-500 hover:bg-pink-50 rounded-full transition-colors">
              <Video className="w-5 h-5" />
            </button>
          )}
        </div>
      </header>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={clsx("flex flex-col", msg.sender === "me" ? "items-end" : "items-start")}
          >
            <div
              className={clsx(
                "max-w-[75%] rounded-2xl px-4 py-2 text-sm shadow-sm",
                msg.sender === "me"
                  ? "bg-gradient-to-br from-pink-500 to-rose-400 text-white rounded-tr-none"
                  : "bg-white border border-gray-100 text-gray-800 rounded-tl-none"
              )}
            >
              {msg.text}
            </div>
            <span className="text-[10px] text-gray-400 mt-1 px-1">{msg.time}</span>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="flex-none p-4 bg-white border-t border-gray-200 pb-[env(safe-area-inset-bottom)]">
        <div className="flex items-end space-x-2 bg-gray-50 border border-gray-200 rounded-3xl p-1 pr-2 shadow-inner transition-colors focus-within:border-pink-300 focus-within:ring-2 focus-within:ring-pink-100">
          <textarea
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="メッセージを入力..."
            className="flex-1 bg-transparent border-none focus:ring-0 resize-none py-2 px-4 text-sm max-h-32 min-h-[40px]"
            rows={1}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
          />
          <button
            onClick={handleSend}
            disabled={!inputText.trim()}
            className={clsx(
              "p-2 rounded-full flex items-center justify-center transition-all mb-0.5",
              inputText.trim()
                ? "bg-pink-500 text-white shadow-sm hover:bg-pink-600"
                : "bg-gray-200 text-gray-400"
            )}
          >
            <Send className="w-4 h-4 translate-x-px" />
          </button>
        </div>
      </div>
    </div>
  );
}