<!DOCTYPE html>
<html lang="ja">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{{ config('app.name') }} 管理画面</title>
    @if(file_exists(public_path('build/manifest.json')))
        @vite(['resources/css/app.css', 'resources/js/app.js'])
    @else
        {{-- Viteビルド未実施時: Tailwind CDN を使用 --}}
        <script src="https://cdn.tailwindcss.com"></script>
    @endif
    <script defer src="https://cdn.jsdelivr.net/npm/alpinejs@3.x.x/dist/cdn.min.js"></script>
</head>
<body class="bg-gray-100 font-sans">
    <div class="flex h-screen">
        {{-- サイドバー --}}
        <aside class="w-64 bg-indigo-800 text-white flex flex-col">
            <div class="px-6 py-5 text-xl font-bold border-b border-indigo-700">
                📧 一斉メール配信
            </div>
            <nav class="flex-1 px-4 py-4 space-y-1">
                <a href="{{ route('dashboard') }}"
                   class="flex items-center px-3 py-2 rounded-md text-sm font-medium {{ request()->routeIs('dashboard') ? 'bg-indigo-900 text-white' : 'text-indigo-200 hover:bg-indigo-700' }}">
                    ダッシュボード
                </a>
                <a href="{{ route('campaigns.create') }}"
                   class="flex items-center px-3 py-2 rounded-md text-sm font-medium {{ request()->routeIs('campaigns.create') ? 'bg-indigo-900 text-white' : 'text-indigo-200 hover:bg-indigo-700' }}">
                    メール作成・配信
                </a>
                <a href="{{ route('campaigns.index') }}"
                   class="flex items-center px-3 py-2 rounded-md text-sm font-medium {{ request()->routeIs('campaigns.index') ? 'bg-indigo-900 text-white' : 'text-indigo-200 hover:bg-indigo-700' }}">
                    配信履歴
                </a>
                <a href="{{ route('recipients.index') }}"
                   class="flex items-center px-3 py-2 rounded-md text-sm font-medium {{ request()->routeIs('recipients.index') ? 'bg-indigo-900 text-white' : 'text-indigo-200 hover:bg-indigo-700' }}">
                    配信リスト
                </a>
                <a href="{{ route('unsubscribes.index') }}"
                   class="flex items-center px-3 py-2 rounded-md text-sm font-medium {{ request()->routeIs('unsubscribes.index') ? 'bg-indigo-900 text-white' : 'text-indigo-200 hover:bg-indigo-700' }}">
                    配信停止者
                </a>
            </nav>
            <div class="px-4 py-4 border-t border-indigo-700">
                <form method="POST" action="{{ route('logout') }}">
                    @csrf
                    <button type="submit" class="text-indigo-300 hover:text-white text-sm">
                        ログアウト
                    </button>
                </form>
            </div>
        </aside>

        {{-- メインエリア --}}
        <div class="flex-1 flex flex-col overflow-hidden">
            {{-- ヘッダー --}}
            <header class="bg-white shadow-sm px-8 py-4 flex items-center justify-between">
                <h1 class="text-lg font-semibold text-gray-800">@yield('title', '管理画面')</h1>
                <span class="text-sm text-gray-500">{{ Auth::user()->name }}</span>
            </header>

            {{-- フラッシュメッセージ --}}
            @if(session('success') || session('error'))
            <div x-data="{ show: true }" x-show="show" x-init="setTimeout(() => show = false, 3000)"
                 class="px-8 pt-4">
                @if(session('success'))
                    <div class="bg-green-100 border border-green-400 text-green-800 px-4 py-3 rounded">
                        {{ session('success') }}
                    </div>
                @endif
                @if(session('error'))
                    <div class="bg-red-100 border border-red-400 text-red-800 px-4 py-3 rounded">
                        {{ session('error') }}
                    </div>
                @endif
            </div>
            @endif

            {{-- コンテンツ --}}
            <main class="flex-1 overflow-y-auto px-8 py-6">
                @yield('content')
            </main>
        </div>
    </div>
</body>
</html>
