import { useRouteError, useNavigate } from "react-router";

export function ErrorBoundaryPage() {
  const error = useRouteError() as any;
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center px-6">
      <p className="text-6xl mb-4">😥</p>
      <h1 className="text-gray-800 mb-2" style={{ fontSize: 20, fontWeight: 700 }}>
        {error?.status === 404 ? "ページが見つかりません" : "エラーが発生しました"}
      </h1>
      <p className="text-gray-500 mb-8 text-center">
        {error?.status === 404
          ? "お探しのページは存在しないか、移動した可能性があります。"
          : "予期しないエラーが発生しました。もう一度お試しください。"}
      </p>
      <button
        onClick={() => navigate("/home")}
        className="px-6 py-3 bg-[#FF5A71] text-white rounded-full"
        style={{ fontWeight: 600 }}
      >
        ホームに戻る
      </button>
    </div>
  );
}
