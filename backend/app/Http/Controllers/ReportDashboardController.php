<?php

namespace App\Http\Controllers;

use App\Models\Order;
use App\Models\OrderItem;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class ReportDashboardController extends Controller
{
    public function salesReport(Request $request)
    {
        $request->validate([
            'params.type' => 'required|in:daily,weekly,monthly',
            'params.start_date' => 'required|date',
            'params.end_date' => 'required|date|after_or_equal:start_date',
        ]);

        $start = Carbon::parse($request->input('params.start_date'))->startOfDay();
        $end = Carbon::parse($request->input('params.end_date'))->endOfDay();

        $summary = [
            'total_orders' => Order::whereBetween('created_at', [$start, $end])->count(),
            'top_items' => OrderItem::select('item_name as name', DB::raw('SUM(quantity * price) as sales'))
                ->whereBetween('created_at', [$start, $end])
                ->groupBy('item_name')
                ->orderByDesc('sales')
                ->limit(5)
                ->get(),
            'top_sales' => DB::table('bills')
                ->join('orders', 'bills.order_id', '=', 'orders.id')
                ->select(
                    DB::raw('DATE(orders.created_at) as date'),
                    DB::raw('SUM(bills.total_amount) as sales')
                )
                ->whereBetween('orders.created_at', [$start, $end])
                ->groupBy(DB::raw('DATE(orders.created_at)'))
                ->orderBy('date')
                ->get(),

        ];

        // حفظ التقرير في جدول
        DB::table('sales_report')->insert([
            'type' => $request->input('params.type'),
            'start_date' => $start,
            'end_date' => $end,
            'data' => json_encode($summary),
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        return response()->json([
            'summary' => $summary,
            'report_info' => [
                'start_date' => $start->toDateString(),
                'end_date' => $end->toDateString(),
                'generated_at' => now()->toDateTimeString(),
            ],
        ]);
    }

    public function financialReport(Request $request)
    {
        $request->validate([
            'params.type' => 'required|in:daily,weekly,monthly',
            'params.start_date' => 'required|date',
            'params.end_date' => 'required|date|after_or_equal:start_date',
        ]);

        $start = Carbon::parse($request->input('params.start_date'));
        $end = Carbon::parse($request->input('params.end_date'));

        $total_revenue = DB::table('bills')
            ->whereBetween('created_at', [$start, $end])
            ->sum('total_amount');

        $total_expenses = DB::table('purchase_bills')
            ->whereBetween('created_at', [$start, $end])
            ->sum('total_amount');

        $net_profit = $total_revenue - $total_expenses;

        if ($request->type === 'daily') {
            $groupFormat = '%Y-%m-%d';
        } elseif ($request->type === 'weekly') {
            $groupFormat = '%x-%v';
        } else {
            $groupFormat = '%Y-%m';
        }

        $revenues = DB::table('bills')
            ->select(DB::raw("DATE_FORMAT(created_at, '$groupFormat') as period"), DB::raw('SUM(total_amount) as revenue'))
            ->whereBetween('created_at', [$start, $end])
            ->groupBy('period')
            ->get();

        $expenses = DB::table('purchase_bills')
            ->select(DB::raw("DATE_FORMAT(created_at, '$groupFormat') as period"), DB::raw('SUM(total_amount) as expenses'))
            ->whereBetween('created_at', [$start, $end])
            ->groupBy('period')
            ->get();

        $breakdown = collect($revenues)->map(function ($rev) use ($expenses) {
            $exp = $expenses->firstWhere('period', $rev->period);

            return [
                'period' => $rev->period,
                'revenue' => (float) $rev->revenue,
                'expenses' => $exp ? (float) $exp->expenses : 0,
            ];
        })->values();

        $summary = [
            'net_profit' => $net_profit,
            'total_expenses' => $total_expenses,
            'total_revenue' => $total_revenue,
            'breakdown' => $breakdown,
        ];

        // حفظ التقرير في جدول
        DB::table('finanical_report')->insert([
            'type' => $request->input('params.type'),
            'start_date' => $start,
            'end_date' => $end,
            'data' => json_encode($summary),
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        return response()->json([
            'summary' => $summary,
            'report_info' => [
                'start_date' => $start->toDateString(),
                'end_date' => $end->toDateString(),
                'generated_at' => now()->toDateTimeString(),
            ],
        ]);
    }
}
