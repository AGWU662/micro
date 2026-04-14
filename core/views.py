from django.shortcuts import render, redirect, get_object_or_404
from django.contrib.auth.decorators import login_required
from django.contrib.auth import login, authenticate, logout
from django.contrib.auth.models import User
from django.contrib.auth.forms import UserCreationForm
from django.contrib import messages
from django.db.models import Sum
from django.http import JsonResponse
from django.views.decorators.http import require_POST
from django.utils import timezone
from decimal import Decimal
import requests
import json
from .models import (
    Profile, Wallet, Transaction, Trade, MiningContract, MiningPlan,
    P2PTrade, P2POrder, Deposit, Withdrawal, SupportTicket, Newsletter, KYC
)


# ============ Crypto Price API ============
def get_crypto_prices():
    """Fetch real-time crypto prices from CoinGecko API"""
    try:
        url = "https://api.coingecko.com/api/v3/simple/price"
        params = {
            'ids': 'bitcoin,ethereum,tether,binancecoin,solana,ripple,dogecoin,cardano',
            'vs_currencies': 'usd',
            'include_24hr_change': 'true'
        }
        response = requests.get(url, params=params, timeout=10)
        if response.status_code == 200:
            data = response.json()
            return {
                'BTC': {'price': Decimal(str(data['bitcoin']['usd'])), 'change': data['bitcoin'].get('usd_24h_change', 0)},
                'ETH': {'price': Decimal(str(data['ethereum']['usd'])), 'change': data['ethereum'].get('usd_24h_change', 0)},
                'USDT': {'price': Decimal(str(data['tether']['usd'])), 'change': data['tether'].get('usd_24h_change', 0)},
                'BNB': {'price': Decimal(str(data['binancecoin']['usd'])), 'change': data['binancecoin'].get('usd_24h_change', 0)},
                'SOL': {'price': Decimal(str(data['solana']['usd'])), 'change': data['solana'].get('usd_24h_change', 0)},
                'XRP': {'price': Decimal(str(data['ripple']['usd'])), 'change': data['ripple'].get('usd_24h_change', 0)},
                'DOGE': {'price': Decimal(str(data['dogecoin']['usd'])), 'change': data['dogecoin'].get('usd_24h_change', 0)},
                'ADA': {'price': Decimal(str(data['cardano']['usd'])), 'change': data['cardano'].get('usd_24h_change', 0)},
            }
    except Exception as e:
        print(f"Error fetching prices: {e}")
    
    # Fallback prices if API fails
    return {
        'BTC': {'price': Decimal('67245.00'), 'change': 2.34},
        'ETH': {'price': Decimal('3456.78'), 'change': 1.89},
        'USDT': {'price': Decimal('1.00'), 'change': 0.01},
        'BNB': {'price': Decimal('598.45'), 'change': -0.56},
        'SOL': {'price': Decimal('142.30'), 'change': 5.67},
        'XRP': {'price': Decimal('0.52'), 'change': -1.23},
        'DOGE': {'price': Decimal('0.082'), 'change': 3.45},
        'ADA': {'price': Decimal('0.45'), 'change': -0.89},
    }


def api_prices(request):
    """API endpoint for fetching crypto prices"""
    prices = get_crypto_prices()
    return JsonResponse({
        'success': True,
        'data': {k: {'price': float(v['price']), 'change': v['change']} for k, v in prices.items()}
    })


# ============ Authentication Views ============
def login_view(request):
    """Custom login view"""
    if request.user.is_authenticated:
        return redirect('dashboard')
    
    if request.method == 'POST':
        username = request.POST.get('username')
        password = request.POST.get('password')
        
        # Try to authenticate with username or email
        user = authenticate(request, username=username, password=password)
        if user is None:
            # Try email login
            try:
                user_obj = User.objects.get(email=username)
                user = authenticate(request, username=user_obj.username, password=password)
            except User.DoesNotExist:
                pass
        
        if user is not None:
            login(request, user)
            next_url = request.POST.get('next') or request.GET.get('next') or 'dashboard'
            messages.success(request, f'Welcome back, {user.username}!')
            return redirect(next_url)
        else:
            messages.error(request, 'Invalid username or password.')
    
    return render(request, 'auth/login.html', {'next': request.GET.get('next', '')})


def register_view(request):
    """Custom registration view"""
    if request.user.is_authenticated:
        return redirect('dashboard')
    
    if request.method == 'POST':
        username = request.POST.get('username')
        email = request.POST.get('email')
        password1 = request.POST.get('password1')
        password2 = request.POST.get('password2')
        first_name = request.POST.get('first_name', '')
        last_name = request.POST.get('last_name', '')
        referral_code = request.POST.get('referral_code', '')
        
        errors = []
        
        # Validation
        if User.objects.filter(username=username).exists():
            errors.append('Username already exists.')
        if User.objects.filter(email=email).exists():
            errors.append('Email already registered.')
        if password1 != password2:
            errors.append('Passwords do not match.')
        if len(password1) < 8:
            errors.append('Password must be at least 8 characters.')
        
        if errors:
            for error in errors:
                messages.error(request, error)
        else:
            # Create user
            user = User.objects.create_user(
                username=username,
                email=email,
                password=password1,
                first_name=first_name,
                last_name=last_name
            )
            
            # Create profile
            profile = Profile.objects.create(user=user)
            
            # Handle referral
            if referral_code:
                try:
                    referrer = Profile.objects.get(referral_code=referral_code)
                    profile.referred_by = referrer
                    profile.save()
                except Profile.DoesNotExist:
                    pass
            
            # Create default wallets
            for currency in ['BTC', 'ETH', 'USDT', 'BNB']:
                Wallet.objects.create(user=user, currency=currency)
            
            # Auto login
            login(request, user)
            messages.success(request, 'Account created successfully! Welcome to CryptoTrade.')
            return redirect('dashboard')
    
    return render(request, 'auth/register.html')


def logout_view(request):
    """Custom logout view"""
    logout(request)
    messages.info(request, 'You have been logged out.')
    return redirect('home')


def password_reset_view(request):
    """Password reset view"""
    if request.method == 'POST':
        email = request.POST.get('email')
        if User.objects.filter(email=email).exists():
            # In production, send actual email here
            messages.success(request, 'Password reset instructions have been sent to your email.')
        else:
            messages.success(request, 'If an account with that email exists, you will receive reset instructions.')
        return redirect('password_reset')
    
    return render(request, 'auth/password_reset.html')


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
    
    # Get real prices from API
    crypto_prices = get_crypto_prices()
    
    total_value = Decimal('0')
    wallet_data = []
    for wallet in wallets:
        price_data = crypto_prices.get(wallet.currency, {'price': Decimal('0'), 'change': 0})
        value = wallet.balance * price_data['price']
        total_value += value
        wallet_data.append({
            'wallet': wallet,
            'price': price_data['price'],
            'change': price_data['change'],
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
    
    # Get real prices
    crypto_prices = get_crypto_prices()
    
    wallet_data = []
    total_value = Decimal('0')
    for wallet in wallets:
        price_data = crypto_prices.get(wallet.currency, {'price': Decimal('0'), 'change': 0})
        value = wallet.balance * price_data['price']
        total_value += value
        wallet_data.append({
            'wallet': wallet,
            'price': price_data['price'],
            'change': price_data['change'],
            'value': value,
        })
    
    # Recent transactions
    transactions = Transaction.objects.filter(user=request.user).order_by('-created_at')[:20]
    
    # Handle deposit/withdrawal requests
    if request.method == 'POST':
        action = request.POST.get('action')
        currency = request.POST.get('currency')
        amount = Decimal(request.POST.get('amount', '0'))
        
        if action == 'deposit':
            address = request.POST.get('address', '')
            deposit = Deposit.objects.create(
                user=request.user,
                currency=currency,
                amount=amount,
                wallet_address=address,
                status='pending'
            )
            messages.success(request, f'Deposit request for {amount} {currency} submitted. Awaiting confirmation.')
        elif action == 'withdraw':
            address = request.POST.get('address', '')
            try:
                wallet = Wallet.objects.get(user=request.user, currency=currency)
                if wallet.balance >= amount:
                    withdrawal = Withdrawal.objects.create(
                        user=request.user,
                        currency=currency,
                        amount=amount,
                        wallet_address=address,
                        status='pending'
                    )
                    messages.success(request, f'Withdrawal request for {amount} {currency} submitted.')
                else:
                    messages.error(request, 'Insufficient balance.')
            except Wallet.DoesNotExist:
                messages.error(request, 'Wallet not found.')
        
        return redirect('wallet')
    
    context = {
        'wallets': wallet_data,
        'total_value': total_value,
        'transactions': transactions,
    }
    
    return render(request, 'dashboard/wallet.html', context)


@login_required
def trading_view(request):
    """Spot trading page"""
    crypto_prices = get_crypto_prices()
    trades = Trade.objects.filter(user=request.user).order_by('-created_at')[:20]
    open_trades = Trade.objects.filter(user=request.user, status='open')
    
    # Handle trade submission
    if request.method == 'POST':
        trade_type = request.POST.get('trade_type')  # buy or sell
        pair = request.POST.get('pair', 'BTC/USDT')
        amount = Decimal(request.POST.get('amount', '0'))
        price = Decimal(request.POST.get('price', '0'))
        
        base_currency, quote_currency = pair.split('/')
        
        trade = Trade.objects.create(
            user=request.user,
            trade_type=trade_type,
            pair=pair,
            amount=amount,
            price=price,
            total=amount * price,
            status='open'
        )
        messages.success(request, f'{trade_type.upper()} order placed for {amount} {base_currency}.')
        return redirect('trading')
    
    context = {
        'trades': trades,
        'open_trades': open_trades,
        'crypto_prices': crypto_prices,
    }
    
    return render(request, 'dashboard/trading.html', context)


@login_required
def mining_view(request):
    """Mining contracts page"""
    plans = MiningPlan.objects.filter(is_active=True)
    contracts = MiningContract.objects.filter(user=request.user).order_by('-started_at')
    active_contracts = contracts.filter(status='active')
    total_earnings = contracts.aggregate(total=Sum('total_earned'))['total'] or Decimal('0')
    
    # Handle mining plan purchase
    if request.method == 'POST':
        plan_id = request.POST.get('plan_id')
        try:
            plan = MiningPlan.objects.get(id=plan_id, is_active=True)
            usdt_wallet = Wallet.objects.get(user=request.user, currency='USDT')
            
            if usdt_wallet.balance >= plan.price:
                usdt_wallet.balance -= plan.price
                usdt_wallet.save()
                
                contract = MiningContract.objects.create(
                    user=request.user,
                    plan=plan,
                    status='active',
                    started_at=timezone.now()
                )
                messages.success(request, f'Successfully purchased {plan.name} mining plan!')
            else:
                messages.error(request, 'Insufficient USDT balance.')
        except (MiningPlan.DoesNotExist, Wallet.DoesNotExist):
            messages.error(request, 'Invalid plan or wallet not found.')
        
        return redirect('mining')
    
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
    my_ads = P2PTrade.objects.filter(user=request.user).order_by('-created_at')
    all_ads = P2PTrade.objects.filter(status='active').exclude(user=request.user)[:20]
    my_orders = P2POrder.objects.filter(buyer=request.user) | P2POrder.objects.filter(seller=request.user)
    my_orders = my_orders.order_by('-created_at')[:20]
    
    # Handle P2P ad creation
    if request.method == 'POST':
        action = request.POST.get('action')
        
        if action == 'create_ad':
            ad_type = request.POST.get('ad_type')  # buy or sell
            currency = request.POST.get('currency')
            amount = Decimal(request.POST.get('amount', '0'))
            price = Decimal(request.POST.get('price', '0'))
            payment_method = request.POST.get('payment_method', 'bank_transfer')
            
            P2PTrade.objects.create(
                user=request.user,
                trade_type=ad_type,
                currency=currency,
                amount=amount,
                price=price,
                payment_method=payment_method,
                status='active'
            )
            messages.success(request, f'P2P {ad_type} ad created successfully!')
        
        return redirect('p2p')
    
    context = {
        'my_ads': my_ads,
        'all_ads': all_ads,
        'my_orders': my_orders,
    }
    
    return render(request, 'dashboard/p2p.html', context)


@login_required  
def profile_view(request):
    """User profile page"""
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
