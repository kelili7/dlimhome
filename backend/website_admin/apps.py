from django.apps import AppConfig


class WebsiteAdminConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'website_admin'
    verbose_name = '网站后台管理'
