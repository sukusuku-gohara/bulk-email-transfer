@extends('layouts.app')
@section('title', 'メール作成・配信')

@section('content')
<div x-data="{
    subject: '',
    bodyHtml: '',
    sheetName: 'Sheet1',
    showConfirm: false,
    testEmail: '',
    showTestForm: false,
}">
    <div class="flex gap-6">
        {{-- 左: 入力フォーム --}}
        <div class="w-1/2 space-y-4">
            <div class="bg-white rounded-lg shadow p-6 space-y-4">
                <h2 class="font-semibold text-gray-700">メール内容</h2>

                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">送信先リスト（シート）</label>
                    <select x-model="sheetName"
                            class="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500">
                        <option value="Sheet1">Sheet1</option>
                        <option value="Sheet2">Sheet2</option>
                        <option value="Sheet3">Sheet3</option>
                    </select>
                </div>

                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">件名</label>
                    <input type="text" x-model="subject" placeholder="メールの件名を入力"
                           class="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500">
                </div>

                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">本文（HTML）</label>
                    <textarea x-model="bodyHtml" rows="16" placeholder="HTMLまたはテキストで本文を入力..."
                              class="w-full border border-gray-300 rounded-md px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500"></textarea>
                </div>

                <div class="flex gap-3">
                    {{-- テスト送信 --}}
                    <button type="button" @click="showTestForm = !showTestForm"
                            class="border border-indigo-600 text-indigo-600 px-4 py-2 rounded-md text-sm hover:bg-indigo-50">
                        テスト送信
                    </button>

                    {{-- 本配信ボタン（2段階確認） --}}
                    <button type="button" @click="showConfirm = true"
                            class="bg-red-600 text-white px-6 py-2 rounded-md text-sm hover:bg-red-700 font-semibold">
                        本配信を開始する
                    </button>
                </div>

                {{-- テスト送信フォーム --}}
                <div x-show="showTestForm" x-transition class="border-t pt-4">
                    <form method="POST" action="{{ route('campaigns.test') }}" class="flex gap-2">
                        @csrf
                        <input type="hidden" name="subject" :value="subject">
                        <input type="hidden" name="body_html" :value="bodyHtml">
                        <input type="email" name="test_email" placeholder="送信先メールアドレス"
                               class="flex-1 border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500">
                        <button type="submit" class="bg-indigo-600 text-white px-4 py-2 rounded-md text-sm hover:bg-indigo-700">
                            送信
                        </button>
                    </form>
                    @error('test_email')<p class="text-red-500 text-xs mt-1">{{ $message }}</p>@enderror
                </div>

                @if($errors->any())
                <div class="bg-red-50 border border-red-300 text-red-700 rounded p-3 text-sm">
                    <ul>@foreach($errors->all() as $e)<li>{{ $e }}</li>@endforeach</ul>
                </div>
                @endif
            </div>
        </div>

        {{-- 右: プレビュー --}}
        <div class="w-1/2">
            <div class="bg-white rounded-lg shadow p-6 h-full">
                <h2 class="font-semibold text-gray-700 mb-3">プレビュー</h2>
                <div class="border rounded p-2 mb-2 text-sm text-gray-500">
                    件名: <span x-text="subject || '（未入力）'" class="text-gray-800"></span>
                </div>
                <div class="border rounded p-4 min-h-64 text-sm overflow-auto" x-html="bodyHtml || '<span class=\'text-gray-400\'>本文がここに表示されます</span>'"></div>
            </div>
        </div>
    </div>

    {{-- 本配信確認ダイアログ --}}
    <div x-show="showConfirm" x-transition class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div class="bg-white rounded-lg shadow-xl p-6 max-w-md w-full mx-4">
            <h3 class="text-lg font-semibold text-gray-800 mb-2">本配信の確認</h3>
            <p class="text-gray-600 text-sm mb-4">
                以下の内容で全配信先にメールを送信します。この操作は取り消せません。
            </p>
            <div class="bg-gray-50 rounded p-3 text-sm mb-4 space-y-1">
                <div><span class="text-gray-500">送信先:</span> <span class="font-medium" x-text="sheetName"></span></div>
                <div><span class="text-gray-500">件名:</span> <span class="font-medium" x-text="subject"></span></div>
            </div>
            <div class="flex gap-3 justify-end">
                <button type="button" @click="showConfirm = false"
                        class="border border-gray-300 text-gray-700 px-4 py-2 rounded-md text-sm hover:bg-gray-50">
                    キャンセル
                </button>
                <form method="POST" action="{{ route('campaigns.store') }}">
                    @csrf
                    <input type="hidden" name="subject" :value="subject">
                    <input type="hidden" name="body_html" :value="bodyHtml">
                    <input type="hidden" name="sheet_name" :value="sheetName">
                    <button type="submit" class="bg-red-600 text-white px-6 py-2 rounded-md text-sm hover:bg-red-700 font-semibold">
                        配信を開始する
                    </button>
                </form>
            </div>
        </div>
    </div>
</div>
@endsection
