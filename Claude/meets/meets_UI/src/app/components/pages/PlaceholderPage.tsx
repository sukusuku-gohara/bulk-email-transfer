import { useNavigate, useLocation } from "react-router";
import { ArrowLeft } from "lucide-react";

export function PlaceholderPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const pageName = location.pathname.replace("/", "").replace(/-/g, " ");

  return (
    <div className="min-h-screen bg-white">
      <div className="sticky top-0 z-10 bg-white border-b border-gray-200 flex items-center px-4 py-3">
        <button onClick={() => navigate(-1)} className="p-1 mr-3">
          <ArrowLeft className="w-5 h-5 text-gray-800" />
        </button>
        <h1 className="font-bold text-gray-800 capitalize">{pageName}</h1>
      </div>
      <div className="flex items-center justify-center h-[60vh] text-gray-400">
        <p>準備中です</p>
      </div>
    </div>
  );
}
