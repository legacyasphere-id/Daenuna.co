// @ts-check
const { test, expect } = require('@playwright/test');

const FILE_URL = 'file:///home/user/Miss-Knit/index.html';

test.beforeEach(async ({ page }) => {
  // Silence expected external network failures (Google Fonts, etc.)
  await page.route('**/*', (route) => {
    const url = route.request().url();
    if (url.startsWith('file://')) return route.continue();
    // Allow everything through — just don't fail on external 404s
    route.continue().catch(() => {});
  });
  await page.goto(FILE_URL, { waitUntil: 'domcontentloaded' });
});

// ============================================================
// BRAND IDENTITY
// ============================================================
test.describe('Brand identity', () => {
  test('page title contains daenuna.co', async ({ page }) => {
    await expect(page).toHaveTitle(/daenuna\.co/i);
  });

  test('brand name appears in navbar', async ({ page }) => {
    await expect(page.locator('.logo').first()).toContainText('daenuna.co');
  });

  test('logo image loads without error', async ({ page }) => {
    const logo = page.locator('.logo-img').first();
    await expect(logo).toBeVisible();
    const naturalWidth = await logo.evaluate((el) => el.naturalWidth);
    expect(naturalWidth).toBeGreaterThan(0);
  });

  test('tagline is present', async ({ page }) => {
    await expect(page.locator('.hero-tagline')).toContainText('made with love');
  });

  test('meta description references daenuna.co', async ({ page }) => {
    const desc = await page.locator('meta[name="description"]').getAttribute('content');
    expect(desc).toMatch(/daenuna/i);
  });
});

// ============================================================
// NAVIGATION
// ============================================================
test.describe('Navigation', () => {
  test('navbar renders with all links on desktop', async ({ page, viewport }) => {
    test.skip((viewport?.width ?? 0) <= 720, 'Desktop only — nav links hidden on mobile');
    await expect(page.locator('.nav-links a[href="#koleksi"]')).toBeVisible();
    await expect(page.locator('.nav-links a[href="#cerita"]')).toBeVisible();
    await expect(page.locator('.nav-links a[href="#faq"]')).toBeVisible();
    await expect(page.locator('.nav-links a[href="#kontak"]')).toBeVisible();
  });

  test('navbar CTA button is present', async ({ page, viewport }) => {
    test.skip((viewport?.width ?? 0) <= 720, 'Desktop only — nav-cta hidden on mobile');
    await expect(page.locator('.nav-cta')).toBeVisible();
    await expect(page.locator('.nav-cta')).toContainText('Order Custom');
  });

  test('navbar gets .scrolled class after scrolling', async ({ page }) => {
    await page.evaluate(() => window.scrollTo(0, 200));
    await page.waitForTimeout(300);
    await expect(page.locator('#nav')).toHaveClass(/scrolled/);
  });

  test('mobile drawer opens and closes', async ({ page, viewport }) => {
    test.skip(viewport?.width > 720, 'Mobile only');
    await expect(page.locator('#mobileDrawer')).not.toHaveClass(/open/);
    await page.click('#navToggle');
    await expect(page.locator('#mobileDrawer')).toHaveClass(/open/);
    await page.click('#mobileDrawer a[href="#koleksi"]');
    await expect(page.locator('#mobileDrawer')).not.toHaveClass(/open/);
  });
});

// ============================================================
// HERO
// ============================================================
test.describe('Hero section', () => {
  test('main headline is visible', async ({ page }) => {
    await expect(page.locator('.hero h1')).toBeVisible();
    await expect(page.locator('.hero h1')).toContainText('Dibuat Khusus');
  });

  test('CTA buttons are present', async ({ page }) => {
    const ctaRow = page.locator('.hero-cta-row');
    await expect(ctaRow.locator('.btn-primary')).toBeVisible();
    await expect(ctaRow.locator('.btn-outline')).toBeVisible();
  });

  test('Order Custom CTA links to WhatsApp', async ({ page }) => {
    const href = await page.locator('.hero-cta-row .btn-primary').getAttribute('href');
    expect(href).toMatch(/wa\.me/);
  });

  test('trust badges are rendered', async ({ page }) => {
    const trust = page.locator('.hero-trust');
    await expect(trust).toContainText('Open Order');
    await expect(trust).toContainText('Handmade');
    await expect(trust).toContainText('Custom Request');
  });

  test('hero product cards are visible', async ({ page }) => {
    await expect(page.locator('.hero-card-main')).toBeVisible();
    await expect(page.locator('.hero-card-sec')).toBeVisible();
  });
});

// ============================================================
// PRODUCTS
// ============================================================
test.describe('Products section', () => {
  test('renders 4 product cards', async ({ page }) => {
    await expect(page.locator('.product-card')).toHaveCount(4);
  });

  test('Penguin with Ice Cream — correct price', async ({ page }) => {
    const card = page.locator('.product-card').nth(0);
    await expect(card).toContainText('Penguin');
    await expect(card).toContainText('Rp17.000');
  });

  test('Nailong — correct price', async ({ page }) => {
    const card = page.locator('.product-card').nth(1);
    await expect(card).toContainText('Nailong');
    await expect(card).toContainText('Rp60.000');
  });

  test('Peach Kitten — correct price', async ({ page }) => {
    const card = page.locator('.product-card').nth(2);
    await expect(card).toContainText('Peach Kitten');
    await expect(card).toContainText('Rp35.000');
  });

  test('Murakami NewJeans — correct price', async ({ page }) => {
    const card = page.locator('.product-card').nth(3);
    await expect(card).toContainText('NewJeans');
    await expect(card).toContainText('Rp64.000');
  });

  test('all 4 product images load', async ({ page }) => {
    // Reveal cards by scrolling into view
    await page.locator('#koleksi').scrollIntoViewIfNeeded();
    await page.waitForTimeout(400);
    const imgs = page.locator('.product-img-wrap img');
    await expect(imgs).toHaveCount(4);
    for (let i = 0; i < 4; i++) {
      const nw = await imgs.nth(i).evaluate((el) => el.naturalWidth);
      expect(nw, `Product image ${i} failed to load`).toBeGreaterThan(0);
    }
  });

  test('product badges are rendered', async ({ page }) => {
    const badges = page.locator('.product-badge');
    await expect(badges).toHaveCount(4);
  });

  test('"Lihat Semua" button links to WhatsApp', async ({ page }) => {
    const href = await page.locator('.products-head .btn-outline').getAttribute('href');
    expect(href).toMatch(/wa\.me/);
  });
});

// ============================================================
// STORY SECTION
// ============================================================
test.describe('About / Story section', () => {
  test('section is present', async ({ page }) => {
    await expect(page.locator('#cerita')).toBeVisible();
  });

  test('mentions Yogyakarta', async ({ page }) => {
    await expect(page.locator('.story')).toContainText('Yogyakarta');
  });

  test('story images load', async ({ page }) => {
    await page.locator('#cerita').scrollIntoViewIfNeeded();
    await page.waitForTimeout(400);
    for (const sel of ['.story-img-main img', '.story-img-float img']) {
      const nw = await page.locator(sel).evaluate((el) => el.naturalWidth);
      expect(nw, `${sel} failed to load`).toBeGreaterThan(0);
    }
  });
});

// ============================================================
// WHY CHOOSE US
// ============================================================
test.describe('Why Choose Us', () => {
  test('renders 4 cards', async ({ page }) => {
    await expect(page.locator('.why-card')).toHaveCount(4);
  });

  test('cards have expected headings', async ({ page }) => {
    const grid = page.locator('.why-grid');
    await expect(grid).toContainText('100% Handmade');
    await expect(grid).toContainText('Custom Request');
    await expect(grid).toContainText('Hadiah Berkesan');
    await expect(grid).toContainText('Produk Lokal');
  });
});

// ============================================================
// HOW TO ORDER
// ============================================================
test.describe('How to Order', () => {
  test('renders 3 steps', async ({ page }) => {
    await expect(page.locator('.step')).toHaveCount(3);
  });

  test('step numbers 1 2 3 are present', async ({ page }) => {
    const nums = page.locator('.step-num');
    await expect(nums.nth(0)).toContainText('1');
    await expect(nums.nth(1)).toContainText('2');
    await expect(nums.nth(2)).toContainText('3');
  });
});

// ============================================================
// FAQ
// ============================================================
test.describe('FAQ accordion', () => {
  test('renders 6 FAQ items', async ({ page }) => {
    await expect(page.locator('.faq-item')).toHaveCount(6);
  });

  test('first item is open by default', async ({ page }) => {
    await expect(page.locator('.faq-item').first()).toHaveClass(/open/);
  });

  test('clicking a closed item opens it', async ({ page }) => {
    const second = page.locator('.faq-item').nth(1);
    await expect(second).not.toHaveClass(/open/);
    await second.locator('.faq-q').click();
    await expect(second).toHaveClass(/open/);
  });

  test('opening one item closes the previously open one', async ({ page }) => {
    const first = page.locator('.faq-item').nth(0);
    const second = page.locator('.faq-item').nth(1);
    await expect(first).toHaveClass(/open/);
    await second.locator('.faq-q').click();
    await expect(first).not.toHaveClass(/open/);
    await expect(second).toHaveClass(/open/);
  });

  test('clicking open item closes it', async ({ page }) => {
    const first = page.locator('.faq-item').nth(0);
    await expect(first).toHaveClass(/open/);
    await first.locator('.faq-q').click();
    await expect(first).not.toHaveClass(/open/);
  });
});

// ============================================================
// SOCIAL / INSTAGRAM CTA
// ============================================================
test.describe('Social CTA section', () => {
  test('Instagram card shows correct handle', async ({ page }) => {
    await expect(page.locator('.social-card').nth(0)).toContainText('@daenuna.co');
  });

  test('TikTok card shows correct handle', async ({ page }) => {
    await expect(page.locator('.social-card').nth(1)).toContainText('@daenuna');
  });

  test('Instagram card links to correct URL', async ({ page }) => {
    const href = await page.locator('.social-card').nth(0).getAttribute('href');
    expect(href).toMatch(/instagram\.com\/daenuna\.co/);
  });

  test('TikTok card links to correct URL', async ({ page }) => {
    const href = await page.locator('.social-card').nth(1).getAttribute('href');
    expect(href).toMatch(/tiktok\.com\/@daenuna/);
  });
});

// ============================================================
// WHATSAPP FLOAT + STICKY BAR
// ============================================================
test.describe('WhatsApp & sticky CTA', () => {
  test('floating WhatsApp button is in the DOM', async ({ page }) => {
    await expect(page.locator('.wa-float')).toBeAttached();
  });

  test('WA float links to wa.me', async ({ page }) => {
    const href = await page.locator('.wa-float').getAttribute('href');
    expect(href).toMatch(/wa\.me/);
  });

  test('sticky order bar is in the DOM (mobile)', async ({ page }) => {
    await expect(page.locator('.sticky-order')).toBeAttached();
  });
});

// ============================================================
// FINAL CTA
// ============================================================
test.describe('Final CTA section', () => {
  test('CTA box is visible', async ({ page }) => {
    await page.locator('#kontak').scrollIntoViewIfNeeded();
    await expect(page.locator('.cta-box')).toBeVisible();
  });

  test('WhatsApp CTA button is present', async ({ page }) => {
    const btn = page.locator('.cta-btns .btn-primary');
    await expect(btn).toContainText('WhatsApp');
    const href = await btn.getAttribute('href');
    expect(href).toMatch(/wa\.me/);
  });

  test('Instagram button is present', async ({ page }) => {
    const btn = page.locator('.cta-btns .btn-ghost');
    await expect(btn).toContainText('Instagram');
  });
});

// ============================================================
// FOOTER
// ============================================================
test.describe('Footer', () => {
  test('brand name in footer', async ({ page }) => {
    await expect(page.locator('.footer .logo').first()).toContainText('daenuna.co');
  });

  test('tagline in footer', async ({ page }) => {
    await expect(page.locator('.footer-tagline')).toContainText('made with love');
  });

  test('operational hours are shown', async ({ page }) => {
    await expect(page.locator('.footer')).toContainText('10.00');
    await expect(page.locator('.footer')).toContainText('22.00');
  });

  test('Yogyakarta location is shown', async ({ page }) => {
    await expect(page.locator('.footer')).toContainText('Yogyakarta');
  });

  test('social links in footer', async ({ page }) => {
    const socials = page.locator('.footer-socials a');
    await expect(socials).toHaveCount(3);
  });

  test('footer nav links are present', async ({ page }) => {
    const col = page.locator('.footer-col ul').first();
    await expect(col).toContainText('Koleksi');
    await expect(col).toContainText('FAQ');
  });

  test('copyright text is present', async ({ page }) => {
    await expect(page.locator('.footer-bottom')).toContainText('2025 daenuna.co');
  });

  test('Powered by Legacya.id link is present with correct href', async ({ page }) => {
    const link = page.locator('.powered-by');
    await expect(link).toBeVisible();
    await expect(link).toContainText('Legacya.id');
    const href = await link.getAttribute('href');
    expect(href).toMatch(/instagram\.com\/legacya\.id/);
  });

  test('footer social links have correct hrefs', async ({ page }) => {
    const links = page.locator('.footer-socials a');
    const hrefs = await links.evaluateAll((els) => els.map((el) => el.getAttribute('href')));
    expect(hrefs.some((h) => h?.includes('instagram.com/daenuna.co'))).toBe(true);
    expect(hrefs.some((h) => h?.includes('tiktok.com/@daenuna'))).toBe(true);
    expect(hrefs.some((h) => h?.includes('wa.me'))).toBe(true);
  });
});

// ============================================================
// MOBILE LAYOUT
// ============================================================
test.describe('Mobile layout', () => {
  test.use({ viewport: { width: 390, height: 844 } });

  test('nav links are hidden on mobile', async ({ page }) => {
    await expect(page.locator('.nav-links')).toBeHidden();
  });

  test('hamburger toggle is visible on mobile', async ({ page }) => {
    await expect(page.locator('#navToggle')).toBeVisible();
  });

  test('sticky order bar is visible on mobile', async ({ page }) => {
    await expect(page.locator('.sticky-order')).toBeVisible();
  });

  test('sticky order bar button says Order Custom', async ({ page }) => {
    await expect(page.locator('.sticky-order .btn')).toContainText('Order Custom');
  });
});

// ============================================================
// SCROLL REVEAL ANIMATIONS
// ============================================================
test.describe('Scroll animations', () => {
  test('hero elements become visible on load', async ({ page }) => {
    await page.waitForTimeout(600);
    await expect(page.locator('.hero h1')).toHaveClass(/is-visible/);
  });

  test('product cards get is-visible class after scrolling', async ({ page }) => {
    await page.locator('#koleksi').scrollIntoViewIfNeeded();
    // Scroll past the section so all delayed cards enter the viewport
    await page.evaluate(() => window.scrollBy(0, 400));
    await page.waitForTimeout(1200); // covers longest transition-delay (600ms) + animation (850ms)
    const cards = page.locator('.product-card[data-animate]');
    const count = await cards.count();
    for (let i = 0; i < count; i++) {
      await expect(cards.nth(i)).toHaveClass(/is-visible/);
    }
  });
});

// ============================================================
// ACCESSIBILITY BASICS
// ============================================================
test.describe('Accessibility basics', () => {
  test('images have alt attributes', async ({ page }) => {
    const imgs = page.locator('img:not([alt])');
    await expect(imgs).toHaveCount(0);
  });

  test('buttons have accessible labels', async ({ page }) => {
    // nav toggle has aria-label
    await expect(page.locator('#navToggle')).toHaveAttribute('aria-label');
    // WA float has aria-label
    await expect(page.locator('.wa-float')).toHaveAttribute('aria-label');
  });

  test('FAQ buttons have aria-expanded', async ({ page }) => {
    const faqBtns = page.locator('.faq-q');
    const count = await faqBtns.count();
    for (let i = 0; i < count; i++) {
      await expect(faqBtns.nth(i)).toHaveAttribute('aria-expanded');
    }
  });

  test('lang attribute is set to id', async ({ page }) => {
    await expect(page.locator('html')).toHaveAttribute('lang', 'id');
  });
});
