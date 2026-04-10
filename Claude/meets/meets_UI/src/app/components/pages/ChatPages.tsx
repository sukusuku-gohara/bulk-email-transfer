import { useState } from "react";
import { useNavigate } from "react-router";
import { ArrowLeft, Send, AlertTriangle, Shield, Video, Info, Camera } from "lucide-react";
import { PageTransition, SlideTransition } from "../PageTransition";
import { ImageWithFallback } from "../figma/ImageWithFallback";

const threads = [
  { id: "1", name: "はなこさん", lastMessage: "週末のご予定はいかがですか？", time: "14:30", unread: 2, status: "仮交際" },
  { id: "2", name: "みきさん", lastMessage: "（お見合い承認済）", time: "昨日", unread: 0, status: "お見合い完了" },
  { id: "3", name: "けんたさん", lastMessage: "来週のお見合い楽しみにしています", time: "3/7", unread: 1, status: "仮交際" },
];

const agentThreads = [
  { id: "a1", name: "鈴木エージェント", lastMessage: "先日の件、承知いたしました。よろしくお願いします！", time: "10:00", unread: 1 },
];

export function ChatListPage() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<"partner" | "agent">("partner");

  return (
    <PageTransition>
    <div className="flex flex-col h-full bg-white max-w-md mx-auto relative pb-20">
      <div className="bg-white px-4 py-4 shrink-0 z-10 sticky top-0 flex flex-col gap-4">
         <h1 className="text-xl font-bold text-gray-800">メッセージ</h1>
         
         <div className="flex bg-gray-100 rounded-sm p-1 relative border border-gray-200">
           <button
             onClick={() => setActiveTab("partner")}
             className={`flex-1 py-1.5 text-[13px] font-bold text-center rounded-sm transition-all z-10 ${
               activeTab === "partner" ? "text-[#FF5A71] bg-white border border-gray-200" : "text-gray-500 hover:text-gray-800"
             }`}
           >
             お相手
           </button>
           <button
             onClick={() => setActiveTab("agent")}
             className={`flex-1 py-1.5 text-[13px] font-bold text-center rounded-sm transition-all z-10 ${
               activeTab === "agent" ? "text-[#FF5A71] bg-white border border-gray-200" : "text-gray-500 hover:text-gray-800"
             }`}
           >
             担当者
           </button>
         </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {activeTab === "partner" && (
          <>
            <div className="bg-[#FFFDE7] p-3 mx-4 mb-4 text-[11px] text-gray-800 leading-relaxed border border-[#FBE3B8] rounded-sm">
              Omiai ではユーザーの安全のために、Omiai サービス内で連絡先 (電話番号やメールアドレス、SNS アカウント) の交換を行うことを非推奨としています。ご自身の身の安全を守るために、連絡先の交換は実際にお相手に会ってから行うようにしましょう。
            </div>

            <div className="space-y-0">
              {threads.map((thread) => (
                <button
                  key={thread.id}
                  onClick={() => {
                    if (thread.status !== "仮交際") {
                      alert("チャットは仮交際に進んだ後から利用可能になります。");
                      return;
                    }
                    navigate(`/chat/${thread.id}`);
                  }}
                  className={`w-full bg-white border-b border-gray-100 p-4 flex items-center gap-3 transition-all text-left ${thread.status === "仮交際" ? "hover:bg-gray-50 active:scale-[0.98]" : "opacity-50"}`}
                >
                  <div className={`w-14 h-14 rounded-full overflow-hidden shrink-0 ${thread.status === "仮交際" ? "bg-gray-100 border border-gray-200" : "bg-gray-100"}`}>
                     <ImageWithFallback src="https://images.unsplash.com/photo-1752718065615-14ee9a0bb3e8?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxqYXBhbmVzZSUyMHdvbWFuJTIwcG9ydHJhaXQlMjBzbWlsZSUyMHByb2Zlc3Npb25hbHxlbnwxfHx8fDE3NzMwNDczMTN8MA&ixlib=rb-4.1.0&q=80&w=1080" alt="" className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <p className="text-[15px] font-bold text-gray-800">{thread.name}</p>
                      <span className="text-[11px] text-gray-400 shrink-0">{thread.time}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <p className="text-[13px] text-gray-500 truncate">{thread.lastMessage}</p>
                    </div>
                  </div>
                  {thread.unread > 0 && thread.status === "仮交際" && (
                    <span className="w-5 h-5 bg-[#FF5A71] rounded-full text-white text-[11px] font-bold flex items-center justify-center shrink-0">
                      {thread.unread}
                    </span>
                  )}
                </button>
              ))}
            </div>
          </>
        )}

        {activeTab === "agent" && (
          <div className="space-y-0">
            {agentThreads.map((thread) => (
              <button
                key={thread.id}
                onClick={() => navigate(`/chat/${thread.id}?type=agent`)}
                className="w-full bg-white border-b border-gray-100 p-4 flex items-center gap-3 hover:bg-gray-50 transition-all text-left active:scale-[0.98]"
              >
                <div className="w-14 h-14 bg-gray-100 rounded-full flex items-center justify-center shrink-0 border border-gray-200 relative overflow-hidden">
                   <ImageWithFallback src="https://images.unsplash.com/photo-1752718065615-14ee9a0bb3e8?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxqYXBhbmVzZSUyMHdvbWFuJTIwcG9ydHJhaXQlMjBzbWlsZSUyMHByb2Zlc3Npb25hbHxlbnwxfHx8fDE3NzMwNDczMTN8MA&ixlib=rb-4.1.0&q=80&w=1080" alt="" className="w-full h-full object-cover" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-[15px] font-bold text-gray-800">{thread.name}</p>
                    <span className="text-[11px] text-gray-400 shrink-0">{thread.time}</span>
                  </div>
                  <p className="text-[13px] text-gray-500 truncate">{thread.lastMessage}</p>
                </div>
                {thread.unread > 0 && (
                  <span className="w-5 h-5 bg-[#FF5A71] rounded-full text-white text-[11px] font-bold flex items-center justify-center shrink-0">
                    {thread.unread}
                  </span>
                )}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
    </PageTransition>
  );
}

const sampleMessages = [
  { id: 1, sender: "other", text: "はじめまして！プロフィール拝見しました。", time: "14:20" },
  { id: 2, sender: "me", text: "はじめまして！こちらこそよろしくお願いします。", time: "14:22" },
  { id: 3, sender: "other", text: "ご趣味が旅行とのことですが、最近どこか行かれましたか？", time: "14:25" },
  { id: 4, sender: "me", text: "先月京都に行ってきました！紅葉がとても綺麗でした。", time: "14:28" },
  { id: 5, sender: "other", text: "京都いいですね！私も行きたいと思っていました。週末のご予定はいかがですか？", time: "14:30" },
];

export function ChatRoomPage() {
  const navigate = useNavigate();
  const [messages, setMessages] = useState(sampleMessages);
  const [input, setInput] = useState("");
  const [warning, setWarning] = useState(false);

  const isAgent = window.location.search.includes("type=agent");

  const handleSend = () => {
    if (!input.trim()) return;

    if (!isAgent) {
      const ngPatterns = /(\d{3}[-\s]?\d{4}[-\s]?\d{4}|\d{2,4}[-\s]?\d{2,4}[-\s]?\d{4}|@|\.com|\.jp)/;
      if (ngPatterns.test(input)) {
        setWarning(true);
        setTimeout(() => setWarning(false), 3000);
        return;
      }
    }

    setMessages([...messages, {
      id: messages.length + 1,
      sender: "me",
      text: input,
      time: new Date().toLocaleTimeString("ja-JP", { hour: "2-digit", minute: "2-digit" }),
    }]);
    setInput("");
  };

  return (
    <SlideTransition className="h-screen">
    <div className="flex flex-col h-full bg-white max-w-md mx-auto relative">
      <div className="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between shrink-0 z-10 relative sticky top-0">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate("/chat")} className="text-gray-800">
            <ArrowLeft className="w-6 h-6" />
          </button>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-gray-100 overflow-hidden relative">
               <ImageWithFallback src="https://images.unsplash.com/photo-1752718065615-14ee9a0bb3e8?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxqYXBhbmVzZSUyMHdvbWFuJTIwcG9ydHJhaXQlMjBzbWlsZSUyMHByb2Zlc3Npb25hbHxlbnwxfHx8fDE3NzMwNDczMTN8MA&ixlib=rb-4.1.0&q=80&w=1080" alt="" className="w-full h-full object-cover" />
               <div className="absolute bottom-0 right-0 bg-white p-0.5 rounded-full"><div className="w-2 h-2 bg-green-500 rounded-full"></div></div>
            </div>
            <span className="font-bold text-[15px]">{isAgent ? "鈴木さん" : "はなこさん"}</span>
          </div>
        </div>

        <div className="flex items-center gap-4 text-gray-800">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
          <div className="flex flex-col gap-1 w-5">
            <div className="w-5 h-[2px] bg-gray-800" />
            <div className="w-5 h-[2px] bg-gray-800" />
            <div className="w-5 h-[2px] bg-gray-800" />
          </div>
        </div>
      </div>

      {warning && (
        <div className="bg-red-50 px-4 py-2 flex items-center gap-2 border-b border-red-200 shrink-0">
          <AlertTriangle className="w-4 h-4 text-destructive" />
          <p className="text-xs text-destructive">個人情報を含むメッセージは送信できません。</p>
        </div>
      )}

      <div className="bg-[#FFFDE7] p-3 text-[11px] text-gray-800 leading-relaxed border-b border-[#FBE3B8] shrink-0">
        Omiai ではユーザーの安全のために、Omiai サービス内で連絡先 (電話番号やメールアドレス、SNS アカウント) の交換を行うことを非推奨としています。ご自身の身の安全を守るために、連絡先の交換は実際にお相手に会ってから行うようにしましょう。
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-4 pb-32">
        <div className="flex flex-col items-center justify-center mb-6">
           <div className="relative w-24 h-24 rounded-full overflow-hidden mb-4 bg-gray-100 border border-gray-200">
             <ImageWithFallback src="https://images.unsplash.com/photo-1752718065615-14ee9a0bb3e8?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxqYXBhbmVzZSUyMHdvbWFuJTIwcG9ydHJhaXQlMjBzbWlsZSUyMHByb2Zlc3Npb25hbHxlbnwxfHx8fDE3NzMwNDczMTN8MA&ixlib=rb-4.1.0&q=80&w=1080" alt="" className="w-full h-full object-cover" />
           </div>
           <p className="text-[13px] text-gray-800 font-bold mb-1">{isAgent ? "鈴木さん" : "はなこさん"}とマッチングしました！</p>
           <p className="text-[13px] text-gray-800 font-bold mb-1">初回のメッセージは</p>
           <p className="text-[13px] text-gray-800 font-bold">無料で送ることができます</p>
        </div>

        <div className="text-center text-[11px] text-gray-400 mb-6">3月18日(水)</div>

        {messages.map((msg) => (
          <div key={msg.id} className={`flex ${msg.sender === "me" ? "justify-end" : "justify-start"} mb-4`}>
            {msg.sender === "other" && (
               <div className="w-8 h-8 rounded-full bg-gray-100 overflow-hidden mr-2 shrink-0">
                 <ImageWithFallback src="https://images.unsplash.com/photo-1752718065615-14ee9a0bb3e8?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxqYXBhbmVzZSUyMHdvbWFuJTIwcG9ydHJhaXQlMjBzbWlsZSUyMHByb2Zlc3Npb25hbHxlbnwxfHx8fDE3NzMwNDczMTN8MA&ixlib=rb-4.1.0&q=80&w=1080" alt="" className="w-full h-full object-cover" />
               </div>
            )}
            <div className={`max-w-[70%] ${
              msg.sender === "me"
                ? "bg-[#D6E6F2] rounded-2xl rounded-tr-sm"
                : "bg-gray-100 rounded-2xl rounded-tl-sm"
            } px-4 py-2.5`}>
              <p className="text-[13px] text-gray-800">{msg.text}</p>
            </div>
            <div className={`text-[9px] text-gray-400 self-end mb-1 ${msg.sender === "me" ? "mr-1 order-first" : "ml-1"}`}>
              {msg.time}
            </div>
          </div>
        ))}
      </div>

      <div className="absolute bottom-0 left-0 right-0 bg-white border-t border-gray-200 shrink-0 z-20">
        <div className="px-4 py-2">
          <p className="text-[11px] text-gray-500 mb-2">登録しているキーワードを話題にしてみよう！</p>
          <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-2">
            {["旅行", "カラオケ", "散歩", "温泉", "音楽鑑賞"].map(kw => (
              <span key={kw} className="border border-gray-200 rounded-full px-4 py-1 text-[11px] whitespace-nowrap text-[#FF5A71]">
                {kw}
              </span>
            ))}
          </div>
        </div>
        <div className="bg-gray-100 px-3 py-2 flex items-center gap-2">
          <button className="text-gray-400 p-1">
             <Camera className="w-6 h-6" />
          </button>
          <button className="text-gray-400 p-1">
             <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"></circle><path d="M8 14s1.5 2 4 2 4-2 4-2"></path><line x1="9" y1="9" x2="9.01" y2="9"></line><line x1="15" y1="9" x2="15.01" y2="9"></line></svg>
          </button>
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            placeholder="メッセージを入力してください。"
            className="flex-1 bg-white border border-gray-200 rounded-sm py-2 px-3 text-[13px] outline-none"
          />
          <button
            onClick={handleSend}
            className="bg-[#FF5A71] text-white px-4 py-2 rounded-sm text-[13px] font-bold"
          >
            送信
          </button>
        </div>
      </div>
    </div>
    </SlideTransition>
  );
}
