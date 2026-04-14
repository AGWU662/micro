from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from django.contrib.auth.models import User
from django.utils.html import format_html
from .models import (
    Profile, KYC, Wallet, Transaction, Trade, 
    MiningPlan, MiningContract, P2PTrade, P2POrder,
    Deposit, Withdrawal, Newsletter, SupportTicket, TicketReply
)


# Inline for Profile in User admin
class ProfileInline(admin.StackedInline):
    model = Profile
    can_delete = False
    verbose_name_plural = 'Profile'


# Extended User Admin
class UserAdmin(BaseUserAdmin):
    inlines = (ProfileInline,)
    list_display = ('username', 'email', 'first_name', 'last_name', 'is_staff', 'date_joined')
    list_filter = ('is_staff', 'is_superuser', 'is_active', 'date_joined')


admin.site.unregister(User)
admin.site.register(User, UserAdmin)


@admin.register(Profile)
class ProfileAdmin(admin.ModelAdmin):
    list_display = ('user', 'phone', 'country', 'is_verified', 'referral_code', 'created_at')
    list_filter = ('is_verified', 'country', 'two_factor_enabled')
    search_fields = ('user__username', 'user__email', 'phone', 'referral_code')
    readonly_fields = ('referral_code', 'created_at', 'updated_at')


@admin.register(KYC)
class KYCAdmin(admin.ModelAdmin):
    list_display = ('user', 'document_type', 'full_name', 'status', 'submitted_at')
    list_filter = ('status', 'document_type', 'submitted_at')
    search_fields = ('user__username', 'full_name')
    readonly_fields = ('submitted_at',)
    actions = ['approve_kyc', 'reject_kyc']

    def approve_kyc(self, request, queryset):
        from django.utils import timezone
        queryset.update(status='approved', reviewed_at=timezone.now(), reviewed_by=request.user)
        self.message_user(request, f'{queryset.count()} KYC application(s) approved.')
    approve_kyc.short_description = 'Approve selected KYC applications'

    def reject_kyc(self, request, queryset):
        from django.utils import timezone
        queryset.update(status='rejected', reviewed_at=timezone.now(), reviewed_by=request.user)
        self.message_user(request, f'{queryset.count()} KYC application(s) rejected.')
    reject_kyc.short_description = 'Reject selected KYC applications'


@admin.register(Wallet)
class WalletAdmin(admin.ModelAdmin):
    list_display = ('user', 'currency', 'balance', 'address', 'is_active', 'created_at')
    list_filter = ('currency', 'is_active')
    search_fields = ('user__username', 'address')
    readonly_fields = ('address', 'created_at')


@admin.register(Transaction)
class TransactionAdmin(admin.ModelAdmin):
    list_display = ('user', 'type', 'currency', 'amount', 'fee', 'status', 'created_at')
    list_filter = ('type', 'status', 'currency', 'created_at')
    search_fields = ('user__username', 'tx_hash', 'description')
    readonly_fields = ('created_at',)
    date_hierarchy = 'created_at'


@admin.register(Trade)
class TradeAdmin(admin.ModelAdmin):
    list_display = ('user', 'pair', 'side', 'order_type', 'amount', 'price', 'total', 'status', 'created_at')
    list_filter = ('side', 'order_type', 'status', 'pair')
    search_fields = ('user__username', 'pair')
    readonly_fields = ('total', 'created_at')


@admin.register(MiningPlan)
class MiningPlanAdmin(admin.ModelAdmin):
    list_display = ('name', 'currency', 'hashrate', 'price', 'daily_return', 'duration_days', 'is_active')
    list_filter = ('currency', 'is_active')
    search_fields = ('name',)


@admin.register(MiningContract)
class MiningContractAdmin(admin.ModelAdmin):
    list_display = ('user', 'plan', 'investment', 'total_earned', 'status', 'started_at', 'ends_at')
    list_filter = ('status', 'plan', 'started_at')
    search_fields = ('user__username',)
    readonly_fields = ('started_at',)


@admin.register(P2PTrade)
class P2PTradeAdmin(admin.ModelAdmin):
    list_display = ('user', 'type', 'currency', 'amount', 'price', 'fiat_currency', 'payment_method', 'status')
    list_filter = ('type', 'status', 'currency', 'payment_method')
    search_fields = ('user__username',)


@admin.register(P2POrder)
class P2POrderAdmin(admin.ModelAdmin):
    list_display = ('id', 'buyer', 'seller', 'amount', 'total_fiat', 'status', 'created_at')
    list_filter = ('status', 'created_at')
    search_fields = ('buyer__username', 'seller__username')


@admin.register(Deposit)
class DepositAdmin(admin.ModelAdmin):
    list_display = ('user', 'method', 'currency', 'amount', 'status', 'created_at')
    list_filter = ('status', 'method', 'currency', 'created_at')
    search_fields = ('user__username', 'tx_hash')
    readonly_fields = ('created_at',)
    actions = ['approve_deposits', 'reject_deposits']

    def approve_deposits(self, request, queryset):
        from django.utils import timezone
        for deposit in queryset.filter(status='pending'):
            deposit.status = 'approved'
            deposit.processed_at = timezone.now()
            deposit.save()
            # Credit wallet
            wallet, _ = Wallet.objects.get_or_create(user=deposit.user, currency=deposit.currency)
            wallet.balance += deposit.amount
            wallet.save()
        self.message_user(request, f'{queryset.count()} deposit(s) approved and credited.')
    approve_deposits.short_description = 'Approve and credit selected deposits'

    def reject_deposits(self, request, queryset):
        from django.utils import timezone
        queryset.update(status='rejected', processed_at=timezone.now())
        self.message_user(request, f'{queryset.count()} deposit(s) rejected.')
    reject_deposits.short_description = 'Reject selected deposits'


@admin.register(Withdrawal)
class WithdrawalAdmin(admin.ModelAdmin):
    list_display = ('user', 'currency', 'amount', 'fee', 'address', 'status', 'created_at')
    list_filter = ('status', 'currency', 'created_at')
    search_fields = ('user__username', 'address', 'tx_hash')
    readonly_fields = ('created_at',)
    actions = ['approve_withdrawals', 'reject_withdrawals']

    def approve_withdrawals(self, request, queryset):
        from django.utils import timezone
        queryset.filter(status='pending').update(status='completed', processed_at=timezone.now())
        self.message_user(request, f'{queryset.count()} withdrawal(s) approved.')
    approve_withdrawals.short_description = 'Approve selected withdrawals'

    def reject_withdrawals(self, request, queryset):
        from django.utils import timezone
        for withdrawal in queryset.filter(status='pending'):
            # Refund to wallet
            wallet = Wallet.objects.get(user=withdrawal.user, currency=withdrawal.currency)
            wallet.balance += withdrawal.amount + withdrawal.fee
            wallet.save()
            withdrawal.status = 'rejected'
            withdrawal.processed_at = timezone.now()
            withdrawal.save()
        self.message_user(request, f'{queryset.count()} withdrawal(s) rejected and refunded.')
    reject_withdrawals.short_description = 'Reject and refund selected withdrawals'


@admin.register(Newsletter)
class NewsletterAdmin(admin.ModelAdmin):
    list_display = ('email', 'is_active', 'subscribed_at')
    list_filter = ('is_active', 'subscribed_at')
    search_fields = ('email',)


class TicketReplyInline(admin.TabularInline):
    model = TicketReply
    extra = 1
    readonly_fields = ('created_at',)


@admin.register(SupportTicket)
class SupportTicketAdmin(admin.ModelAdmin):
    list_display = ('id', 'user', 'subject', 'priority', 'status', 'created_at', 'updated_at')
    list_filter = ('status', 'priority', 'created_at')
    search_fields = ('user__username', 'subject', 'message')
    inlines = [TicketReplyInline]
    actions = ['mark_resolved', 'mark_in_progress']

    def mark_resolved(self, request, queryset):
        queryset.update(status='resolved')
    mark_resolved.short_description = 'Mark as Resolved'

    def mark_in_progress(self, request, queryset):
        queryset.update(status='in_progress')
    mark_in_progress.short_description = 'Mark as In Progress'
