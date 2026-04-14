from django.shortcuts import render, redirect
from django.contrib.auth.decorators import login_required
from django.contrib.auth import login, authenticate
from django.contrib import messages
from django.db.models import Sum
from decimal import Decimal
from .models import (
    Profile, Wallet, Transaction, Trade, MiningContract,
    P2PTrade, Deposit, Withdrawal, SupportTicket, Newsletter
)


def home(request):
    """Landing page"""
    return render(request, 'home.html')


@login_required
def dashboard(request):
    """User dashboard with portfolio overview"""
    user = request.user
    
    # Get or create profile
    profile, _ = Profile.objects.get_or_create(user=user)
    
    # Get all wallets
    wallets = Wallet.objects.filter(user=user)
    
    # Calculate total portfolio value (simplified - would need real prices)
    crypto_prices = {
        'BTC': Decimal('67245.00'),
        'ETH': Decimal('3456.78'),
        'USDT': Decimal('1.00'),
        'BNB': Decimal('598.45'),
        'SOL': Decimal('142.30'),
        'XRP': Decimal('0.52'),
        'DOGE': Decimal('0.082'),
        'ADA': Decimal('0.45'),
    }
    
    total_value = Decimal('0')
    wallet_data = []
    for wallet in wallets:
        price = crypto_prices.get(wallet.currency, Decimal('0'))
        value = wallet.balance * price
        total_value += value
        wallet_data.append({
            'wallet': wallet,
            'price': price,
            'value': value,
        })
    
    # Recent transactions
    recent_transactions = Transaction.objects.filter(user=user).order_by('-created_at')[:10]
    
    # Active mining contracts
    active_mining = MiningContract.objects.filter(user=user, status='active')
    mining_earnings = active_mining.aggregate(total=Sum('total_earned'))['total'] or Decimal('0')
    
    # Open trades
    open_trades = Trade.objects.filter(user=user, status='open').count()
    
    # P2P stats
    p2p_ads = P2PTrade.objects.filter(user=user, status='active').count()
    
    # Pending deposits/withdrawals
    pending_deposits = Deposit.objects.filter(user=user, status='pending').count()
    pending_withdrawals = Withdrawal.objects.filter(user=user, status='pending').count()
    
    # Support tickets
    open_tickets = SupportTicket.objects.filter(user=user, status__in=['open', 'in_progress']).count()
    
    context = {
        'profile': profile,
        'wallets': wallet_data,
        'total_value': total_value,
        'recent_transactions': recent_transactions,
        'active_mining': active_mining,
        'mining_earnings': mining_earnings,
        'open_trades': open_trades,
        'p2p_ads': p2p_ads,
        'pending_deposits': pending_deposits,
        'pending_withdrawals': pending_withdrawals,
        'open_tickets': open_tickets,
        'crypto_prices': crypto_prices,
    }
    
    return render(request, 'dashboard/index.html', context)


@login_required
def wallet_view(request):
    """Wallet management page"""
    wallets = Wallet.objects.filter(user=request.user)
    
    crypto_prices = {
        'BTC': Decimal('67245.00'),
        'ETH': Decimal('3456.78'),
        'USDT': Decimal('1.00'),
        'BNB': Decimal('598.45'),
        'SOL': Decimal('142.30'),
        'XRP': Decimal('0.52'),
        'DOGE': Decimal('0.082'),
        'ADA': Decimal('0.45'),
    }
    
    wallet_data = []
    total_value = Decimal('0')
    for wallet in wallets:
        price = crypto_prices.get(wallet.currency, Decimal('0'))
        value = wallet.balance * price
        total_value += value
        wallet_data.append({
            'wallet': wallet,
            'price': price,
            'value': value,
        })
    
    # Recent transactions
    transactions = Transaction.objects.filter(user=request.user).order_by('-created_at')[:20]
    
    context = {
        'wallets': wallet_data,
        'total_value': total_value,
        'transactions': transactions,
    }
    
    return render(request, 'dashboard/wallet.html', context)


@login_required
def trading_view(request):
    """Spot trading page"""
    trades = Trade.objects.filter(user=request.user).order_by('-created_at')[:20]
    open_trades = Trade.objects.filter(user=request.user, status='open')
    
    context = {
        'trades': trades,
        'open_trades': open_trades,
    }
    
    return render(request, 'dashboard/trading.html', context)


@login_required
def mining_view(request):
    """Mining contracts page"""
    from .models import MiningPlan
    
    plans = MiningPlan.objects.filter(is_active=True)
    contracts = MiningContract.objects.filter(user=request.user).order_by('-started_at')
    active_contracts = contracts.filter(status='active')
    total_earnings = contracts.aggregate(total=Sum('total_earned'))['total'] or Decimal('0')
    
    context = {
        'plans': plans,
        'contracts': contracts,
        'active_contracts': active_contracts,
        'total_earnings': total_earnings,
    }
    
    return render(request, 'dashboard/mining.html', context)


@login_required
def p2p_view(request):
    """P2P trading page"""
    from .models import P2POrder
    
    my_ads = P2PTrade.objects.filter(user=request.user).order_by('-created_at')
    all_ads = P2PTrade.objects.filter(status='active').exclude(user=request.user)[:20]
    my_orders = P2POrder.objects.filter(buyer=request.user) | P2POrder.objects.filter(seller=request.user)
    my_orders = my_orders.order_by('-created_at')[:20]
    
    context = {
        'my_ads': my_ads,
        'all_ads': all_ads,
        'my_orders': my_orders,
    }
    
    return render(request, 'dashboard/p2p.html', context)


@login_required  
def profile_view(request):
    """User profile page"""
    from .models import KYC
    
    profile, _ = Profile.objects.get_or_create(user=request.user)
    
    try:
        kyc = KYC.objects.get(user=request.user)
    except KYC.DoesNotExist:
        kyc = None
    
    context = {
        'profile': profile,
        'kyc': kyc,
    }
    
    return render(request, 'dashboard/profile.html', context)


def newsletter_subscribe(request):
    """Newsletter subscription endpoint"""
    if request.method == 'POST':
        email = request.POST.get('email')
        if email:
            Newsletter.objects.get_or_create(email=email)
            messages.success(request, 'Successfully subscribed to newsletter!')
        return redirect('home')
    return redirect('home')
