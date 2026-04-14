from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from django.contrib.auth.models import User
from django.utils.html import format_html
from django.utils import timezone
from django.db.models import Sum, Count
from decimal import Decimal
from .models import (
    Profile, KYC, Wallet, Transaction, Trade, 
    MiningPlan, MiningContract, P2PTrade, P2POrder,
    Deposit, Withdrawal, Newsletter, SupportTicket, TicketReply
)


# ========== Custom Admin Site ==========
class CryptoAdminSite(admin.AdminSite):
    site_header = 'CryptoTrade Admin'
    site_title = 'CryptoTrade'
    index_title = 'Dashboard'

    def index(self, request, extra_context=None):
        extra_context = extra_context or {}
        
        # Dashboard stats
        extra_context['user_count'] = User.objects.count()
        extra_context['pending_kyc'] = KYC.objects.filter(status='pending').count()
        extra_context['pending_deposits'] = Deposit.objects.filter(status='pending').count()
        extra_context['pending_withdrawals'] = Withdrawal.objects.filter(status='pending').count()
        extra_context['open_tickets'] = SupportTicket.objects.filter(status='open').count()
        extra_context['active_mining'] = MiningContract.objects.filter(status='active').count()
        extra_context['active_p2p'] = P2PTrade.objects.filter(status='active').count()
        
        # Total balances
        total_btc = Wallet.objects.filter(currency='BTC').aggregate(total=Sum('balance'))['total'] or 0
        total_eth = Wallet.objects.filter(currency='ETH').aggregate(total=Sum('balance'))['total'] or 0
        total_usdt = Wallet.objects.filter(currency='USDT').aggregate(total=Sum('balance'))['total'] or 0
        extra_context['total_btc'] = total_btc
        extra_context['total_eth'] = total_eth
        extra_context['total_usdt'] = total_usdt
        
        return super().index(request, extra_context)


# ========== Inline for Profile in User admin ==========
class ProfileInline(admin.StackedInline):
    model = Profile
    can_delete = False
    verbose_name_plural = 'Profile'
    fk_name = 'user'


class WalletInline(admin.TabularInline):
    model = Wallet
    extra = 0
    readonly_fields = ('address', 'created_at')
    can_delete = False


# ========== Extended User Admin ==========
class UserAdmin(BaseUserAdmin):
    inlines = (ProfileInline, WalletInline)
    list_display = ('username', 'email', 'first_name', 'last_name', 'is_staff', 'is_active', 'date_joined')
    list_filter = ('is_staff', 'is_superuser', 'is_active', 'date_joined')
    actions = ['activate_users', 'deactivate_users', 'create_wallets']

    def activate_users(self, request, queryset):
        queryset.update(is_active=True)
        self.message_user(request, f'{queryset.count()} user(s) activated.')
    activate_users.short_description = 'Activate selected users'

    def deactivate_users(self, request, queryset):
        queryset.update(is_active=False)
        self.message_user(request, f'{queryset.count()} user(s) deactivated.')
    deactivate_users.short_description = 'Deactivate selected users'

    def create_wallets(self, request, queryset):
        currencies = ['BTC', 'ETH', 'USDT', 'BNB']
        created = 0
        for user in queryset:
            for currency in currencies:
                _, was_created = Wallet.objects.get_or_create(user=user, currency=currency)
                if was_created:
                    created += 1
        self.message_user(request, f'{created} wallet(s) created.')
    create_wallets.short_description = 'Create default wallets for users'


admin.site.unregister(User)
admin.site.register(User, UserAdmin)


# ========== Profile Admin ==========
@admin.register(Profile)
class ProfileAdmin(admin.ModelAdmin):
    list_display = ('user', 'phone', 'country', 'is_verified', 'referral_code', 'created_at')
    list_filter = ('is_verified', 'country', 'two_factor_enabled')
    search_fields = ('user__username', 'user__email', 'phone', 'referral_code')
    readonly_fields = ('referral_code', 'created_at', 'updated_at')
    actions = ['verify_profiles', 'unverify_profiles']

    def verify_profiles(self, request, queryset):
        queryset.update(is_verified=True)
        self.message_user(request, f'{queryset.count()} profile(s) verified.')
    verify_profiles.short_description = 'Mark as Verified'

    def unverify_profiles(self, request, queryset):
        queryset.update(is_verified=False)
        self.message_user(request, f'{queryset.count()} profile(s) unverified.')
    unverify_profiles.short_description = 'Mark as Unverified'


# ========== KYC Admin ==========
@admin.register(KYC)
class KYCAdmin(admin.ModelAdmin):
    list_display = ('user', 'document_type', 'full_name', 'status', 'status_badge', 'submitted_at')
    list_filter = ('status', 'document_type', 'submitted_at')
    search_fields = ('user__username', 'full_name')
    readonly_fields = ('submitted_at', 'document_preview')
    actions = ['approve_kyc', 'reject_kyc']
    fieldsets = (
        ('User Info', {'fields': ('user', 'full_name', 'date_of_birth', 'address')}),
        ('Documents', {'fields': ('document_type', 'document_front', 'document_back', 'selfie', 'document_preview')}),
        ('Status', {'fields': ('status', 'rejection_reason', 'submitted_at', 'reviewed_at', 'reviewed_by')}),
    )

    def status_badge(self, obj):
        colors = {'pending': 'orange', 'approved': 'green', 'rejected': 'red'}
        return format_html('<span style="color: {}; font-weight: bold;">{}</span>', 
                          colors.get(obj.status, 'gray'), obj.get_status_display())
    status_badge.short_description = 'Status'

    def document_preview(self, obj):
        html = ''
        if obj.document_front:
            html += f'<img src="{obj.document_front.url}" style="max-width: 200px; margin: 5px;"/>'
        if obj.document_back:
            html += f'<img src="{obj.document_back.url}" style="max-width: 200px; margin: 5px;"/>'
        if obj.selfie:
            html += f'<img src="{obj.selfie.url}" style="max-width: 200px; margin: 5px;"/>'
        return format_html(html) if html else 'No images'
    document_preview.short_description = 'Document Preview'

    def approve_kyc(self, request, queryset):
        updated = queryset.filter(status='pending').update(
            status='approved', 
            reviewed_at=timezone.now(), 
            reviewed_by=request.user
        )
        # Also verify user profiles
        for kyc in queryset:
            Profile.objects.filter(user=kyc.user).update(is_verified=True)
        self.message_user(request, f'{updated} KYC application(s) approved.')
    approve_kyc.short_description = 'Approve selected KYC'

    def reject_kyc(self, request, queryset):
        updated = queryset.filter(status='pending').update(
            status='rejected', 
            reviewed_at=timezone.now(), 
            reviewed_by=request.user
        )
        self.message_user(request, f'{updated} KYC application(s) rejected.')
    reject_kyc.short_description = 'Reject selected KYC'


# ========== Wallet Admin ==========
@admin.register(Wallet)
class WalletAdmin(admin.ModelAdmin):
    list_display = ('user', 'currency', 'balance_display', 'address_short', 'is_active', 'created_at')
    list_filter = ('currency', 'is_active')
    search_fields = ('user__username', 'address')
    readonly_fields = ('address', 'created_at')
    actions = ['add_bonus', 'deduct_balance', 'activate_wallets', 'deactivate_wallets']

    def balance_display(self, obj):
        color = 'green' if obj.balance > 0 else 'gray'
        return format_html('<span style="color: {}; font-weight: bold;">{} {}</span>', 
                          color, obj.balance, obj.currency)
    balance_display.short_description = 'Balance'

    def address_short(self, obj):
        return f'{obj.address[:15]}...' if len(obj.address) > 15 else obj.address
    address_short.short_description = 'Address'

    def add_bonus(self, request, queryset):
        # Add 0.001 bonus to each selected wallet
        bonus = Decimal('0.001')
        for wallet in queryset:
            wallet.balance += bonus
            wallet.save()
            Transaction.objects.create(
                user=wallet.user,
                type='referral',
                currency=wallet.currency,
                amount=bonus,
                status='completed',
                description='Admin bonus'
            )
        self.message_user(request, f'Added {bonus} bonus to {queryset.count()} wallet(s).')
    add_bonus.short_description = 'Add 0.001 bonus'

    def deduct_balance(self, request, queryset):
        self.message_user(request, 'Use individual wallet edit to deduct balance.')
    deduct_balance.short_description = 'Deduct balance (edit individually)'

    def activate_wallets(self, request, queryset):
        queryset.update(is_active=True)
    activate_wallets.short_description = 'Activate wallets'

    def deactivate_wallets(self, request, queryset):
        queryset.update(is_active=False)
    deactivate_wallets.short_description = 'Deactivate wallets'


# ========== Transaction Admin ==========
@admin.register(Transaction)
class TransactionAdmin(admin.ModelAdmin):
    list_display = ('user', 'type', 'currency', 'amount_display', 'fee', 'status_badge', 'created_at')
    list_filter = ('type', 'status', 'currency', 'created_at')
    search_fields = ('user__username', 'tx_hash', 'description')
    readonly_fields = ('created_at',)
    date_hierarchy = 'created_at'
    actions = ['mark_completed', 'mark_failed']

    def amount_display(self, obj):
        color = 'green' if obj.amount > 0 else 'red'
        return format_html('<span style="color: {};">{}</span>', color, obj.amount)
    amount_display.short_description = 'Amount'

    def status_badge(self, obj):
        colors = {'pending': 'orange', 'completed': 'green', 'failed': 'red', 'cancelled': 'gray'}
        return format_html('<span style="color: {};">{}</span>', 
                          colors.get(obj.status, 'gray'), obj.get_status_display())
    status_badge.short_description = 'Status'

    def mark_completed(self, request, queryset):
        queryset.update(status='completed', completed_at=timezone.now())
    mark_completed.short_description = 'Mark as Completed'

    def mark_failed(self, request, queryset):
        queryset.update(status='failed')
    mark_failed.short_description = 'Mark as Failed'


# ========== Trade Admin ==========
@admin.register(Trade)
class TradeAdmin(admin.ModelAdmin):
    list_display = ('user', 'pair', 'side_badge', 'order_type', 'amount', 'price', 'total', 'status_badge', 'created_at')
    list_filter = ('side', 'order_type', 'status', 'pair')
    search_fields = ('user__username', 'pair')
    readonly_fields = ('total', 'created_at')
    actions = ['execute_trades', 'cancel_trades']

    def side_badge(self, obj):
        color = 'green' if obj.side == 'buy' else 'red'
        return format_html('<span style="color: {}; font-weight: bold;">{}</span>', 
                          color, obj.side.upper())
    side_badge.short_description = 'Side'

    def status_badge(self, obj):
        colors = {'open': 'blue', 'filled': 'green', 'partial': 'orange', 'cancelled': 'gray'}
        return format_html('<span style="color: {};">{}</span>', 
                          colors.get(obj.status, 'gray'), obj.get_status_display())
    status_badge.short_description = 'Status'

    def execute_trades(self, request, queryset):
        for trade in queryset.filter(status='open'):
            trade.status = 'filled'
            trade.filled_amount = trade.amount
            trade.filled_at = timezone.now()
            trade.save()
            # Create transaction record
            Transaction.objects.create(
                user=trade.user,
                type='trade',
                currency=trade.pair.split('/')[0],
                amount=trade.amount if trade.side == 'buy' else -trade.amount,
                fee=trade.fee,
                status='completed',
                description=f'{trade.side.upper()} {trade.pair}'
            )
        self.message_user(request, f'{queryset.count()} trade(s) executed.')
    execute_trades.short_description = 'Execute/Fill trades'

    def cancel_trades(self, request, queryset):
        queryset.filter(status='open').update(status='cancelled')
    cancel_trades.short_description = 'Cancel trades'


# ========== Mining Plan Admin ==========
@admin.register(MiningPlan)
class MiningPlanAdmin(admin.ModelAdmin):
    list_display = ('name', 'currency', 'hashrate', 'price', 'daily_return', 'duration_days', 'is_active')
    list_filter = ('currency', 'is_active')
    search_fields = ('name',)
    actions = ['activate_plans', 'deactivate_plans']

    def activate_plans(self, request, queryset):
        queryset.update(is_active=True)
    activate_plans.short_description = 'Activate plans'

    def deactivate_plans(self, request, queryset):
        queryset.update(is_active=False)
    deactivate_plans.short_description = 'Deactivate plans'


# ========== Mining Contract Admin ==========
@admin.register(MiningContract)
class MiningContractAdmin(admin.ModelAdmin):
    list_display = ('user', 'plan', 'investment', 'total_earned', 'status_badge', 'started_at', 'ends_at')
    list_filter = ('status', 'plan', 'started_at')
    search_fields = ('user__username',)
    readonly_fields = ('started_at',)
    actions = ['process_payouts', 'complete_contracts', 'cancel_contracts']

    def status_badge(self, obj):
        colors = {'active': 'green', 'completed': 'blue', 'cancelled': 'red'}
        return format_html('<span style="color: {};">{}</span>', 
                          colors.get(obj.status, 'gray'), obj.get_status_display())
    status_badge.short_description = 'Status'

    def process_payouts(self, request, queryset):
        for contract in queryset.filter(status='active'):
            # Calculate daily payout
            daily_payout = contract.investment * contract.plan.daily_return
            contract.total_earned += daily_payout
            contract.last_payout = timezone.now()
            contract.save()
            
            # Credit wallet
            wallet, _ = Wallet.objects.get_or_create(user=contract.user, currency=contract.plan.currency)
            wallet.balance += daily_payout
            wallet.save()
            
            # Create transaction
            Transaction.objects.create(
                user=contract.user,
                type='mining',
                currency=contract.plan.currency,
                amount=daily_payout,
                status='completed',
                description=f'Mining payout - {contract.plan.name}'
            )
        self.message_user(request, f'Processed payouts for {queryset.count()} contract(s).')
    process_payouts.short_description = 'Process daily payouts'

    def complete_contracts(self, request, queryset):
        queryset.filter(status='active').update(status='completed')
    complete_contracts.short_description = 'Mark as Completed'

    def cancel_contracts(self, request, queryset):
        # Refund investment
        for contract in queryset.filter(status='active'):
            wallet, _ = Wallet.objects.get_or_create(user=contract.user, currency=contract.plan.currency)
            wallet.balance += contract.investment
            wallet.save()
            contract.status = 'cancelled'
            contract.save()
        self.message_user(request, f'{queryset.count()} contract(s) cancelled and refunded.')
    cancel_contracts.short_description = 'Cancel and refund'


# ========== P2P Trade Admin ==========
@admin.register(P2PTrade)
class P2PTradeAdmin(admin.ModelAdmin):
    list_display = ('user', 'type_badge', 'currency', 'amount', 'price', 'fiat_currency', 'payment_method', 'status')
    list_filter = ('type', 'status', 'currency', 'payment_method')
    search_fields = ('user__username',)
    actions = ['activate_ads', 'deactivate_ads']

    def type_badge(self, obj):
        color = 'green' if obj.type == 'buy' else 'red'
        return format_html('<span style="color: {}; font-weight: bold;">{}</span>', 
                          color, obj.type.upper())
    type_badge.short_description = 'Type'

    def activate_ads(self, request, queryset):
        queryset.update(status='active')
    activate_ads.short_description = 'Activate ads'

    def deactivate_ads(self, request, queryset):
        queryset.update(status='cancelled')
    deactivate_ads.short_description = 'Deactivate ads'


# ========== P2P Order Admin ==========
@admin.register(P2POrder)
class P2POrderAdmin(admin.ModelAdmin):
    list_display = ('id', 'buyer', 'seller', 'amount', 'total_fiat', 'status_badge', 'created_at')
    list_filter = ('status', 'created_at')
    search_fields = ('buyer__username', 'seller__username')
    actions = ['release_crypto', 'cancel_orders', 'resolve_dispute_buyer', 'resolve_dispute_seller']

    def status_badge(self, obj):
        colors = {'pending': 'orange', 'paid': 'blue', 'completed': 'green', 'disputed': 'red', 'cancelled': 'gray'}
        return format_html('<span style="color: {};">{}</span>', 
                          colors.get(obj.status, 'gray'), obj.get_status_display())
    status_badge.short_description = 'Status'

    def release_crypto(self, request, queryset):
        for order in queryset.filter(status='paid'):
            # Transfer crypto to buyer
            wallet, _ = Wallet.objects.get_or_create(user=order.buyer, currency=order.ad.currency)
            wallet.balance += order.amount
            wallet.save()
            order.status = 'completed'
            order.completed_at = timezone.now()
            order.save()
        self.message_user(request, f'{queryset.count()} order(s) completed - crypto released.')
    release_crypto.short_description = 'Release crypto to buyer'

    def cancel_orders(self, request, queryset):
        for order in queryset.filter(status__in=['pending', 'paid']):
            # Return crypto to seller
            wallet, _ = Wallet.objects.get_or_create(user=order.seller, currency=order.ad.currency)
            wallet.balance += order.amount
            wallet.save()
            order.status = 'cancelled'
            order.save()
        self.message_user(request, f'{queryset.count()} order(s) cancelled - crypto returned to seller.')
    cancel_orders.short_description = 'Cancel and refund seller'

    def resolve_dispute_buyer(self, request, queryset):
        """Resolve dispute in favor of buyer"""
        for order in queryset.filter(status='disputed'):
            wallet, _ = Wallet.objects.get_or_create(user=order.buyer, currency=order.ad.currency)
            wallet.balance += order.amount
            wallet.save()
            order.status = 'completed'
            order.completed_at = timezone.now()
            order.save()
        self.message_user(request, f'Dispute resolved for {queryset.count()} order(s) - buyer wins.')
    resolve_dispute_buyer.short_description = 'Resolve: Buyer wins'

    def resolve_dispute_seller(self, request, queryset):
        """Resolve dispute in favor of seller"""
        for order in queryset.filter(status='disputed'):
            wallet, _ = Wallet.objects.get_or_create(user=order.seller, currency=order.ad.currency)
            wallet.balance += order.amount
            wallet.save()
            order.status = 'cancelled'
            order.save()
        self.message_user(request, f'Dispute resolved for {queryset.count()} order(s) - seller wins.')
    resolve_dispute_seller.short_description = 'Resolve: Seller wins'


# ========== Deposit Admin ==========
@admin.register(Deposit)
class DepositAdmin(admin.ModelAdmin):
    list_display = ('user', 'method', 'currency', 'amount', 'status_badge', 'created_at')
    list_filter = ('status', 'method', 'currency', 'created_at')
    search_fields = ('user__username', 'tx_hash')
    readonly_fields = ('created_at',)
    actions = ['approve_deposits', 'reject_deposits']

    def status_badge(self, obj):
        colors = {'pending': 'orange', 'approved': 'green', 'rejected': 'red'}
        return format_html('<span style="color: {}; font-weight: bold;">{}</span>', 
                          colors.get(obj.status, 'gray'), obj.get_status_display())
    status_badge.short_description = 'Status'

    def approve_deposits(self, request, queryset):
        for deposit in queryset.filter(status='pending'):
            deposit.status = 'approved'
            deposit.processed_at = timezone.now()
            deposit.save()
            # Credit wallet
            wallet, _ = Wallet.objects.get_or_create(user=deposit.user, currency=deposit.currency)
            wallet.balance += deposit.amount
            wallet.save()
            # Create transaction
            Transaction.objects.create(
                user=deposit.user,
                type='deposit',
                currency=deposit.currency,
                amount=deposit.amount,
                status='completed',
                description=f'Deposit via {deposit.get_method_display()}'
            )
        self.message_user(request, f'{queryset.count()} deposit(s) approved and credited.')
    approve_deposits.short_description = 'Approve and credit'

    def reject_deposits(self, request, queryset):
        queryset.filter(status='pending').update(status='rejected', processed_at=timezone.now())
        self.message_user(request, f'{queryset.count()} deposit(s) rejected.')
    reject_deposits.short_description = 'Reject'


# ========== Withdrawal Admin ==========
@admin.register(Withdrawal)
class WithdrawalAdmin(admin.ModelAdmin):
    list_display = ('user', 'currency', 'amount', 'fee', 'address_short', 'status_badge', 'created_at')
    list_filter = ('status', 'currency', 'created_at')
    search_fields = ('user__username', 'address', 'tx_hash')
    readonly_fields = ('created_at',)
    actions = ['approve_withdrawals', 'reject_withdrawals', 'mark_processing']

    def address_short(self, obj):
        return f'{obj.address[:20]}...' if len(obj.address) > 20 else obj.address
    address_short.short_description = 'Address'

    def status_badge(self, obj):
        colors = {'pending': 'orange', 'processing': 'blue', 'completed': 'green', 'rejected': 'red'}
        return format_html('<span style="color: {}; font-weight: bold;">{}</span>', 
                          colors.get(obj.status, 'gray'), obj.get_status_display())
    status_badge.short_description = 'Status'

    def mark_processing(self, request, queryset):
        queryset.filter(status='pending').update(status='processing')
    mark_processing.short_description = 'Mark as Processing'

    def approve_withdrawals(self, request, queryset):
        for withdrawal in queryset.filter(status__in=['pending', 'processing']):
            withdrawal.status = 'completed'
            withdrawal.processed_at = timezone.now()
            withdrawal.save()
            # Create transaction
            Transaction.objects.create(
                user=withdrawal.user,
                type='withdrawal',
                currency=withdrawal.currency,
                amount=-withdrawal.amount,
                fee=withdrawal.fee,
                status='completed',
                description=f'Withdrawal to {withdrawal.address[:20]}...'
            )
        self.message_user(request, f'{queryset.count()} withdrawal(s) approved.')
    approve_withdrawals.short_description = 'Approve (mark completed)'

    def reject_withdrawals(self, request, queryset):
        for withdrawal in queryset.filter(status__in=['pending', 'processing']):
            # Refund to wallet
            wallet = Wallet.objects.filter(user=withdrawal.user, currency=withdrawal.currency).first()
            if wallet:
                wallet.balance += withdrawal.amount + withdrawal.fee
                wallet.save()
            withdrawal.status = 'rejected'
            withdrawal.processed_at = timezone.now()
            withdrawal.save()
        self.message_user(request, f'{queryset.count()} withdrawal(s) rejected and refunded.')
    reject_withdrawals.short_description = 'Reject and refund'


# ========== Newsletter Admin ==========
@admin.register(Newsletter)
class NewsletterAdmin(admin.ModelAdmin):
    list_display = ('email', 'is_active', 'subscribed_at')
    list_filter = ('is_active', 'subscribed_at')
    search_fields = ('email',)
    actions = ['activate_subscriptions', 'deactivate_subscriptions']

    def activate_subscriptions(self, request, queryset):
        queryset.update(is_active=True)
    activate_subscriptions.short_description = 'Activate'

    def deactivate_subscriptions(self, request, queryset):
        queryset.update(is_active=False)
    deactivate_subscriptions.short_description = 'Deactivate'


# ========== Support Ticket Admin ==========
class TicketReplyInline(admin.TabularInline):
    model = TicketReply
    extra = 1
    readonly_fields = ('created_at',)


@admin.register(SupportTicket)
class SupportTicketAdmin(admin.ModelAdmin):
    list_display = ('id', 'user', 'subject', 'priority_badge', 'status_badge', 'created_at', 'updated_at')
    list_filter = ('status', 'priority', 'created_at')
    search_fields = ('user__username', 'subject', 'message')
    inlines = [TicketReplyInline]
    actions = ['mark_resolved', 'mark_in_progress', 'mark_urgent']

    def priority_badge(self, obj):
        colors = {'low': 'gray', 'medium': 'blue', 'high': 'orange', 'urgent': 'red'}
        return format_html('<span style="color: {};">{}</span>', 
                          colors.get(obj.priority, 'gray'), obj.get_priority_display())
    priority_badge.short_description = 'Priority'

    def status_badge(self, obj):
        colors = {'open': 'orange', 'in_progress': 'blue', 'resolved': 'green', 'closed': 'gray'}
        return format_html('<span style="color: {};">{}</span>', 
                          colors.get(obj.status, 'gray'), obj.get_status_display())
    status_badge.short_description = 'Status'

    def mark_resolved(self, request, queryset):
        queryset.update(status='resolved')
    mark_resolved.short_description = 'Mark as Resolved'

    def mark_in_progress(self, request, queryset):
        queryset.update(status='in_progress')
    mark_in_progress.short_description = 'Mark as In Progress'

    def mark_urgent(self, request, queryset):
        queryset.update(priority='urgent')
    mark_urgent.short_description = 'Set priority: Urgent'
