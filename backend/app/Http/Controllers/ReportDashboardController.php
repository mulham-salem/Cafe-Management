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
            'type' => 'required|in:daily,weekly,monthly',
            'start_date' => 'required|date',
            'end_date' => 'required|date|after_or_equal:start_date',
        ]);

        $start = Carbon::parse($request->start_date);
        $end = Carbon::parse($request->end_date);

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
                ->join('order_items', 'orders.id', '=', 'order_items.order_id')
                ->join('menu_items', 'order_items.menuItem_id', '=', 'menu_items.id')
                ->select(
                    'menu_items.id',
                    'menu_items.name',
                    DB::raw('SUM(order_items.quantity) as total_quantity')
                )
                ->groupBy('menu_items.id', 'menu_items.name')
                ->orderByDesc('total_quantity')
                ->limit(5)
                ->get(),

        ];

        // حفظ التقرير في جدول
        DB::table('sales_report')->insert([
            'type' => $request->type,
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
            'type' => 'required|in:daily,weekly,monthly',
            'start_date' => 'required|date',
            'end_date' => 'required|date|after_or_equal:start_date',
        ]);

        $start = Carbon::parse($request->start_date);
        $end = Carbon::parse($request->end_date);

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
            'type' => $request->type,
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
