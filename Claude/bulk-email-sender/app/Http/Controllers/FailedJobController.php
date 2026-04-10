<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class FailedJobController extends Controller
{
    public function index()
    {
        $failedJobs = DB::table('failed_jobs')->orderByDesc('failed_at')->paginate(20);
        return view('failed_jobs.index', compact('failedJobs'));
    }

    public function destroy(int $id)
    {
        DB::table('failed_jobs')->where('id', $id)->delete();
        return back()->with('success', '削除しました');
    }

    public function destroyAll()
    {
        DB::table('failed_jobs')->truncate();
        return back()->with('success', 'すべての失敗履歴を削除しました');
    }
}
