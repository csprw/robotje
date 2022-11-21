"""zuurstof URL Configuration

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/3.0/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
from django.urls import path

from meter.views import base, get_data, save_data, get_data_ips, get_data_factors

urlpatterns = [
    path("admin/", admin.site.urls),
    path("api/get_data", get_data),
    path("api/save_data", save_data),
    path("api/get_data_ips", get_data_ips),
    path("api/get_data_factors", get_data_factors),
    path("", base),
    # path("Call_listing/", views.record_filter , name="Call_Listing"), 
]

# urlpatterns = [
#     path("Call_listing/", views.record_filter , name="Call_Listing"),    
#     ] + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
