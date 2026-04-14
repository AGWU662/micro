from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from core import views

urlpatterns = [
    path('admin/', admin.site.urls),
    path('', views.home, name='home'),
    
    # Authentication
    path('login/', views.login_view, name='login'),
    path('register/', views.register_view, name='register'),
    path('logout/', views.logout_view, name='logout'),
    path('password-reset/', views.password_reset_view, name='password_reset'),
    
    # Dashboard
    path('dashboard/', views.dashboard, name='dashboard'),
    path('dashboard/wallet/', views.wallet_view, name='wallet'),
    path('dashboard/trading/', views.trading_view, name='trading'),
    path('dashboard/mining/', views.mining_view, name='mining'),
    path('dashboard/p2p/', views.p2p_view, name='p2p'),
    path('dashboard/profile/', views.profile_view, name='profile'),
    
    # API
    path('api/prices/', views.api_prices, name='api_prices'),
    
    # Newsletter
    path('newsletter/subscribe/', views.newsletter_subscribe, name='newsletter_subscribe'),
]

# Serve media files in development
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)
