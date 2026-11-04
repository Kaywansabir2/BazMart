<?php

namespace App\Services;

use App\Models\Customer;
use App\Models\WalletTransaction;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class WalletService
{
    public function creditWallet(
        Customer $customer,
        int $amountIqd,
        string $type,
        ?string $orderId = null,
        string $descEn = 'Wallet Credit',
        ?string $descCkb = 'باڵانسی وۆڵێت زیادکرا',
        ?string $descAr = 'تمت إضافة رصيد إلى المحفظة'
    ): WalletTransaction {
        if ($amountIqd <= 0) {
            throw ValidationException::withMessages(['amount' => 'Credit amount must be greater than zero.']);
        }

        return DB::transaction(function () use ($customer, $amountIqd, $type, $orderId, $descEn, $descCkb, $descAr) {
            $customer->refresh();
            $newBalance = $customer->wallet_balance_iqd + $amountIqd;
            $customer->wallet_balance_iqd = $newBalance;
            $customer->save();

            $txNumber = '#WLT-' . strtoupper(substr(uniqid(), -6)) . rand(10, 99);

            return WalletTransaction::create([
                'transaction_number' => $txNumber,
                'customer_id' => $customer->id,
                'order_id' => $orderId,
                'type' => $type,
                'direction' => 'CREDIT',
                'amount_iqd' => $amountIqd,
                'balance_after_iqd' => $newBalance,
                'description_en' => $descEn,
                'description_ckb' => $descCkb,
                'description_ar' => $descAr,
            ]);
        });
    }

    public function debitWallet(
        Customer $customer,
        int $amountIqd,
        string $type,
        ?string $orderId = null,
        string $descEn = 'Wallet Checkout Payment',
        ?string $descCkb = 'پارەدانی داواکاری لە باڵانسی وۆڵێت',
        ?string $descAr = 'دفع الطلب من رصيد المحفظة'
    ): WalletTransaction {
        if ($amountIqd <= 0) {
            throw ValidationException::withMessages(['amount' => 'Debit amount must be greater than zero.']);
        }

        return DB::transaction(function () use ($customer, $amountIqd, $type, $orderId, $descEn, $descCkb, $descAr) {
            $customer->refresh();

            if ($customer->wallet_balance_iqd < $amountIqd) {
                throw ValidationException::withMessages([
                    'wallet' => 'Insufficient wallet balance. Available: IQD ' . $customer->wallet_balance_iqd,
                ]);
            }

            $newBalance = $customer->wallet_balance_iqd - $amountIqd;
            $customer->wallet_balance_iqd = $newBalance;
            $customer->save();

            $txNumber = '#WLT-' . strtoupper(substr(uniqid(), -6)) . rand(10, 99);

            return WalletTransaction::create([
                'transaction_number' => $txNumber,
                'customer_id' => $customer->id,
                'order_id' => $orderId,
                'type' => $type,
                'direction' => 'DEBIT',
                'amount_iqd' => $amountIqd,
                'balance_after_iqd' => $newBalance,
                'description_en' => $descEn,
                'description_ckb' => $descCkb,
                'description_ar' => $descAr,
            ]);
        });
    }

    public function getTransactions(Customer $customer)
    {
        return WalletTransaction::where('customer_id', $customer->id)
            ->orderBy('created_at', 'desc')
            ->get();
    }
}

