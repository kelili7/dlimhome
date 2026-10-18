from django.contrib import admin
from django.conf import settings


admin.site.site_header = 'DLIM 官网管理后台'
admin.site.site_title = 'DLIM 后台管理'
admin.site.index_title = '网站内容管理'
admin.site.site_url = settings.FRONTEND_URL
