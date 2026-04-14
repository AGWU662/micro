from django.db import models
from django.contrib.auth.models import User
from django.utils import timezone
from decimal import Decimal
import uuid


class Profile(models.Model):
    """Extended user profile"""
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='profile')
    phone = models.CharField(max_length=20, blank=True)
    country = models.CharField(max_length=100, blank=True)
    avatar = models.ImageField(upload_to='avatars/', blank=True, null=True)
    referral_code = models.CharField(max_length=20, unique=True, blank=True)
    referred_by = models.ForeignKey('self', on_delete=models.SET_NULL, null=True, blank=True)
    is_verified = models.BooleanField(default=False)
    two_factor_enabled = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def save(self, *args, **kwargs):
        if not self.referral_code:
            self.referral_code = str(uuid.uuid4())[:8].upper()
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.user.username}'s Profile"


class KYC(models.Model):
    """Know Your Customer verification"""
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('approved', 'Approved'),
        ('rejected', 'Rejected'),
    ]
    DOCUMENT_TYPES = [
        ('passport', 'Passport'),
        ('id_card', 'National ID Card'),
        ('drivers_license', 'Drivers License'),
    ]

    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='kyc')
    document_type = models.CharField(max_length=20, choices=DOCUMENT_TYPES)
    document_front = models.ImageField(upload_to='kyc/documents/')
    document_back = models.ImageField(upload_to='kyc/documents/', blank=True, null=True)
    selfie = models.ImageField(upload_to='kyc/selfies/')
    full_name = models.CharField(max_length=200)
    date_of_birth = models.DateField()
    address = models.TextField()
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    rejection_reason = models.TextField(blank=True)
    submitted_at = models.DateTimeField(auto_now_add=True)
    reviewed_at = models.DateTimeField(null=True, blank=True)
    reviewed_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='kyc_reviews')

    class Meta:
        verbose_name = 'KYC Verification'
        verbose_name_plural = 'KYC Verifications'

    def __str__(self):
        return f"{self.user.username} - {self.status}"


class Wallet(models.Model):
    """User cryptocurrency wallet"""
    CRYPTO_CHOICES = [
        ('BTC', 'Bitcoin'),
        ('ETH', 'Ethereum'),
        ('USDT', 'Tether USDT'),
        ('BNB', 'Binance Coin'),
        ('SOL', 'Solana'),
        ('XRP', 'Ripple'),
        ('DOGE', 'Dogecoin'),
        ('ADA', 'Cardano'),
    ]

    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='wallets')
    currency = models.CharField(max_length=10, choices=CRYPTO_CHOICES)
    balance = models.DecimalField(max_digits=20, decimal_places=8, default=Decimal('0'))
    address = models.CharField(max_length=100, unique=True, blank=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ['user', 'currency']

    def save(self, *args, **kwargs):
        if not self.address:
            self.address = f"{self.currency.lower()}_{uuid.uuid4().hex[:32]}"
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.user.username} - {self.currency}: {self.balance}"


class Transaction(models.Model):
    """All financial transactions"""
    TYPE_CHOICES = [
        ('deposit', 'Deposit'),
        ('withdrawal', 'Withdrawal'),
        ('trade', 'Trade'),
        ('mining', 'Mining Reward'),
        ('p2p_buy', 'P2P Buy'),
        ('p2p_sell', 'P2P Sell'),
        ('referral', 'Referral Bonus'),
        ('transfer', 'Transfer'),
    ]
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('completed', 'Completed'),
        ('failed', 'Failed'),
        ('cancelled', 'Cancelled'),
    ]

    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='transactions')
    type = models.CharField(max_length=20, choices=TYPE_CHOICES)
    currency = models.CharField(max_length=10)
    amount = models.DecimalField(max_digits=20, decimal_places=8)
    fee = models.DecimalField(max_digits=20, decimal_places=8, default=Decimal('0'))
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    tx_hash = models.CharField(max_length=100, blank=True, help_text='Blockchain transaction hash')
    description = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    completed_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.user.username} - {self.type} {self.amount} {self.currency}"


class Trade(models.Model):
    """Spot trading orders"""
    SIDE_CHOICES = [
        ('buy', 'Buy'),
        ('sell', 'Sell'),
    ]
    ORDER_TYPES = [
        ('market', 'Market Order'),
        ('limit', 'Limit Order'),
    ]
    STATUS_CHOICES = [
        ('open', 'Open'),
        ('filled', 'Filled'),
        ('partial', 'Partially Filled'),
        ('cancelled', 'Cancelled'),
    ]

    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='trades')
    pair = models.CharField(max_length=20, help_text='e.g., BTC/USDT')
    side = models.CharField(max_length=10, choices=SIDE_CHOICES)
    order_type = models.CharField(max_length=10, choices=ORDER_TYPES)
    amount = models.DecimalField(max_digits=20, decimal_places=8)
    price = models.DecimalField(max_digits=20, decimal_places=8)
    filled_amount = models.DecimalField(max_digits=20, decimal_places=8, default=Decimal('0'))
    total = models.DecimalField(max_digits=20, decimal_places=8)
    fee = models.DecimalField(max_digits=20, decimal_places=8, default=Decimal('0'))
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='open')
    created_at = models.DateTimeField(auto_now_add=True)
    filled_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        ordering = ['-created_at']

    def save(self, *args, **kwargs):
        self.total = self.amount * self.price
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.user.username} - {self.side.upper()} {self.amount} {self.pair}"


class MiningPlan(models.Model):
    """Available mining plans"""
    name = models.CharField(max_length=100)
    currency = models.CharField(max_length=10, default='BTC')
    hashrate = models.CharField(max_length=50, help_text='e.g., 100 TH/s')
    price = models.DecimalField(max_digits=10, decimal_places=2)
    daily_return = models.DecimalField(max_digits=10, decimal_places=6, help_text='Daily return rate')
    duration_days = models.IntegerField(help_text='Contract duration in days')
    min_investment = models.DecimalField(max_digits=10, decimal_places=2)
    max_investment = models.DecimalField(max_digits=10, decimal_places=2)
    is_active = models.BooleanField(default=True)
    description = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.name} - {self.hashrate}"


class MiningContract(models.Model):
    """User's active mining contracts"""
    STATUS_CHOICES = [
        ('active', 'Active'),
        ('completed', 'Completed'),
        ('cancelled', 'Cancelled'),
    ]

    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='mining_contracts')
    plan = models.ForeignKey(MiningPlan, on_delete=models.PROTECT)
    investment = models.DecimalField(max_digits=20, decimal_places=8)
    total_earned = models.DecimalField(max_digits=20, decimal_places=8, default=Decimal('0'))
    last_payout = models.DateTimeField(null=True, blank=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='active')
    started_at = models.DateTimeField(auto_now_add=True)
    ends_at = models.DateTimeField()

    class Meta:
        ordering = ['-started_at']

    def __str__(self):
        return f"{self.user.username} - {self.plan.name}"


class P2PTrade(models.Model):
    """Peer-to-peer trading ads"""
    TYPE_CHOICES = [
        ('buy', 'Buy'),
        ('sell', 'Sell'),
    ]
    STATUS_CHOICES = [
        ('active', 'Active'),
        ('completed', 'Completed'),
        ('cancelled', 'Cancelled'),
    ]
    PAYMENT_METHODS = [
        ('bank_transfer', 'Bank Transfer'),
        ('paypal', 'PayPal'),
        ('cash', 'Cash'),
        ('mobile_money', 'Mobile Money'),
        ('crypto', 'Crypto'),
    ]

    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='p2p_ads')
    type = models.CharField(max_length=10, choices=TYPE_CHOICES)
    currency = models.CharField(max_length=10)
    fiat_currency = models.CharField(max_length=10, default='USD')
    amount = models.DecimalField(max_digits=20, decimal_places=8)
    min_amount = models.DecimalField(max_digits=20, decimal_places=8)
    max_amount = models.DecimalField(max_digits=20, decimal_places=8)
    price = models.DecimalField(max_digits=20, decimal_places=2, help_text='Price per unit in fiat')
    payment_method = models.CharField(max_length=20, choices=PAYMENT_METHODS)
    payment_details = models.TextField(blank=True)
    terms = models.TextField(blank=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='active')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = 'P2P Trade Ad'
        verbose_name_plural = 'P2P Trade Ads'
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.user.username} - {self.type.upper()} {self.currency}"


class P2POrder(models.Model):
    """P2P trade orders"""
    STATUS_CHOICES = [
        ('pending', 'Pending Payment'),
        ('paid', 'Paid - Awaiting Release'),
        ('completed', 'Completed'),
        ('disputed', 'Disputed'),
        ('cancelled', 'Cancelled'),
    ]

    ad = models.ForeignKey(P2PTrade, on_delete=models.CASCADE, related_name='orders')
    buyer = models.ForeignKey(User, on_delete=models.CASCADE, related_name='p2p_buys')
    seller = models.ForeignKey(User, on_delete=models.CASCADE, related_name='p2p_sells')
    amount = models.DecimalField(max_digits=20, decimal_places=8)
    total_fiat = models.DecimalField(max_digits=20, decimal_places=2)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    payment_proof = models.ImageField(upload_to='p2p/payments/', blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    completed_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"P2P Order #{self.id} - {self.amount} {self.ad.currency}"


class Deposit(models.Model):
    """Fiat/Crypto deposits"""
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('approved', 'Approved'),
        ('rejected', 'Rejected'),
    ]
    METHOD_CHOICES = [
        ('crypto', 'Cryptocurrency'),
        ('bank', 'Bank Transfer'),
        ('card', 'Credit/Debit Card'),
    ]

    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='deposits')
    method = models.CharField(max_length=20, choices=METHOD_CHOICES)
    currency = models.CharField(max_length=10)
    amount = models.DecimalField(max_digits=20, decimal_places=8)
    tx_hash = models.CharField(max_length=100, blank=True)
    proof = models.ImageField(upload_to='deposits/', blank=True, null=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    admin_note = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    processed_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.user.username} - {self.amount} {self.currency}"


class Withdrawal(models.Model):
    """Withdrawal requests"""
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('processing', 'Processing'),
        ('completed', 'Completed'),
        ('rejected', 'Rejected'),
    ]

    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='withdrawals')
    currency = models.CharField(max_length=10)
    amount = models.DecimalField(max_digits=20, decimal_places=8)
    fee = models.DecimalField(max_digits=20, decimal_places=8, default=Decimal('0'))
    address = models.CharField(max_length=100)
    network = models.CharField(max_length=20, blank=True)
    tx_hash = models.CharField(max_length=100, blank=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    admin_note = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    processed_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.user.username} - {self.amount} {self.currency}"


class Newsletter(models.Model):
    """Newsletter subscribers"""
    email = models.EmailField(unique=True)
    is_active = models.BooleanField(default=True)
    subscribed_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.email


class SupportTicket(models.Model):
    """Customer support tickets"""
    PRIORITY_CHOICES = [
        ('low', 'Low'),
        ('medium', 'Medium'),
        ('high', 'High'),
        ('urgent', 'Urgent'),
    ]
    STATUS_CHOICES = [
        ('open', 'Open'),
        ('in_progress', 'In Progress'),
        ('resolved', 'Resolved'),
        ('closed', 'Closed'),
    ]

    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='tickets')
    subject = models.CharField(max_length=200)
    message = models.TextField()
    priority = models.CharField(max_length=10, choices=PRIORITY_CHOICES, default='medium')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='open')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"#{self.id} - {self.subject}"


class TicketReply(models.Model):
    """Replies to support tickets"""
    ticket = models.ForeignKey(SupportTicket, on_delete=models.CASCADE, related_name='replies')
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    message = models.TextField()
    is_staff = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name_plural = 'Ticket Replies'
        ordering = ['created_at']

    def __str__(self):
        return f"Reply to #{self.ticket.id}"
