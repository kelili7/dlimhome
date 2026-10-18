from django.contrib.auth import get_user_model
from django.test import TestCase
from django.urls import reverse


class HealthCheckTests(TestCase):
    def test_health_check_returns_ok(self):
        response = self.client.get(reverse('website_admin:health-check'))

        self.assertEqual(response.status_code, 200)
        self.assertJSONEqual(
            response.content,
            {'status': 'ok', 'message': 'Django API is running'},
        )


class FrontendRedirectTests(TestCase):
    def test_django_root_redirects_to_vue_frontend(self):
        response = self.client.get(reverse('frontend'))

        self.assertRedirects(
            response,
            'http://127.0.0.1:5173/',
            fetch_redirect_response=False,
        )


class AdminSiteTests(TestCase):
    @classmethod
    def setUpTestData(cls):
        cls.user = get_user_model().objects.create_superuser(
            username='test-admin',
            password='test-password',
        )

    def test_admin_uses_simpleui_and_chinese_branding(self):
        self.client.force_login(self.user)
        response = self.client.get(reverse('admin:index'))

        self.assertEqual(response.status_code, 200)
        self.assertContains(response, 'admin/simpleui-x/css/index.css')
        self.assertContains(response, 'DLIM 官网管理后台')
        self.assertContains(response, "goIndex('http://127.0.0.1:5173/')")
