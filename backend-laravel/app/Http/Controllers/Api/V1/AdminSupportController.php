<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\FinancialLedgerEntry;
use App\Models\Notification;
use App\Models\SupportTicket;
use App\Services\WalletService;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;

class AdminSupportController extends Controller
{
    protected WalletService $walletService;

    public function __construct(WalletService $walletService)
    {
        $this->walletService = $walletService;
    }

    public function getTickets(Request $request): JsonResponse
    {
        $query = SupportTicket::with(['customer', 'order.items.product']);

        if ($request->filled('status')) {
            $query->where('status', $request->query('status'));
        }

        $tickets = $query->orderBy('created_at', 'desc')->get();

        return response()->json([
            'success' => true,
            'data' => $tickets,
        ]);
    }

    public function resolveTicket(Request $request, string $id): JsonResponse
    {
        $ticket = SupportTicket::with(['customer', 'order'])->findOrFail($id);

        $action = $request->input('action', 'approve'); // approve, reject
        $note = $request->input('adminResolutionNote', 'Approved and refunded to customer BazMart Wallet by Dark Store Operations.');

        return DB::transaction(function () use ($ticket, $action, $note) {
            if ($action === 'approve') {
                $ticket->status = 'APPROVED_REFUNDED_TO_WALLET';
                $ticket->admin_resolution_note = $note;
                $ticket->resolved_at = now();
                $ticket->save();

                $refundAmount = $ticket->requested_refund_iqd > 0 ? $ticket->requested_refund_iqd : 2250;

                // Credit customer wallet
                $this->walletService->creditWallet(
                    $ticket->customer,
                    $refundAmount,
                    'ORDER_REFUND_CREDIT',
                    $ticket->order_id,
                    "Refund approved for Support Ticket {$ticket->ticket_number}",
                    "پارەی گەڕاوە پەسەندکرا بۆ داواکاریی پشتگیریی {$ticket->ticket_number}",
                    "تمت الموافقة على استرجاع المبلغ لتذكرة الدعم {$ticket->ticket_number}"
                );

                // Create financial ledger entry
                FinancialLedgerEntry::create([
                    'entry_number' => '#FIN-' . strtoupper(substr(uniqid(), -6)),
                    'warehouse_id' => $ticket->order ? $ticket->order->warehouse_id : 'erbil-central-darkstore',
                    'order_id' => $ticket->order_id,
                    'product_id' => null,
                    'entry_type' => 'CUSTOMER_REFUND',
                    'direction' => 'DEBIT',
                    'amount_iqd' => $refundAmount,
                    'description' => "Order Support Refund Credit for Ticket {$ticket->ticket_number} (Customer: {$ticket->customer->name})",
                    'recorded_at' => now(),
                ]);

                // Send localized customer notification
                Notification::create([
                    'title_en' => '💳 Wallet Refund Credited!',
                    'title_ckb' => '💳 پارەی گەڕاوە خرایە سەر وۆڵێت!',
                    'title_ar' => '💳 تم إيداع المبلغ المسترجع في محفظتك!',
                    'body_en' => "Your refund of IQD {$refundAmount} for Ticket {$ticket->ticket_number} has been credited to your BazMart Wallet.",
                    'body_ckb' => "بڕی {$refundAmount} دینار بۆ داواکاریی ژمارە {$ticket->ticket_number} بە سەرکەوتوویی خرایە سەر باڵانسی وۆڵێتەکەت.",
                    'body_ar' => "تم استرجاع مبلغ {$refundAmount} دينار عراقي لتذكرة الدعم {$ticket->ticket_number} إلى رصيد محفظتك في بازمارت.",
                    'type' => 'WALLET_CREDITED',
                    'target_role' => 'CUSTOMER',
                    'customer_phone' => $ticket->customer->phone,
                    'data' => json_encode(['ticketId' => $ticket->id, 'refundAmount' => $refundAmount]),
                ]);
            } else {
                $ticket->status = 'REJECTED';
                $ticket->admin_resolution_note = $note;
                $ticket->resolved_at = now();
                $ticket->save();
            }

            return response()->json([
                'success' => true,
                'message' => $action === 'approve' ? 'Ticket approved and refunded to customer wallet.' : 'Ticket rejected.',
                'ticket' => $ticket->fresh(['customer', 'order']),
            ]);
        });
    }
}

