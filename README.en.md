# DLIM Home Bilingual Brand Website

## Project Overview

1. DLIM Home is a bilingual brand website focused on ceramic and home products. It introduces the brand, product collections, production process, and support services, and provides entry points for business inquiries and recruitment information.
2. The project uses a decoupled frontend and backend architecture: Vue 3 powers the website pages, while Django provides the admin site and APIs. The website supports English and Chinese.

## Website Structure

1. Home: Brand hero, featured products, ceramic craftsmanship, product carousel, brand values, FAQ, and lifestyle guides.
2. Products: Product collections with category filters, keyword search, and filter reset.
3. Factory: Ceramic product development process, quality priorities, and collection customization.
4. About Us: Brand background and values, business footprint, and an illustrative market connection map.
5. Support: Guides for product selection, care, orders, and business partnerships.
6. Business Inquiries: A place to outline retail, bulk purchasing, and customization requests.
7. Join Us: Team introduction, employee benefits, recruitment process, and resume submission information.
8. Product Collection Details: Collection descriptions, images, features, and related inquiry links.
9. Other Pages: A custom 404 page.

## Key Features

1. Switches the interface and content between English and Chinese, and remembers each visitor's language preference.
2. Product category filters, keyword search, and empty-result messages.
3. A two-column image marquee on the home page, product carousel, expandable FAQ, and back-to-top control.
4. Scroll-triggered entrances for page content and images, route transition animations, and support for the system “Reduce Motion” preference.
5. Business inquiry form validation and a local inquiry summary that visitors can copy or download. The form only creates the summary in the current page; it does not submit information to the backend, save it, or send it automatically.
6. Resume applications are initiated through the visitor's email client. The website does not collect or send resumes directly.
7. The current website is static; backend business functionality is pending.

## Technology Stack

1. Frontend: Vue 3, Vue Router, Vite, GSAP
2. Backend: Django, Django REST Framework, django-simpleui
3. Development database: SQLite
4. Deployment: GitHub Actions, GitHub Pages
