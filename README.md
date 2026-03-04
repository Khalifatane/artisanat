**Project Structure**
```
.
  .env.example
  .env.local
  .gitignore
  Alboury.png
  biome.json
  build-warnings.txt
  bun.lock
  components.json
  next-env.d.ts
  next.config.js
  package-lock.json
  package-lock.json.bak
  package.json
  postcss.config.mjs
  proxy.ts
  tsconfig.json
  .vscode/
    extensions.json
    launch.json
    settings.json
  app/
    cart-button.tsx
    footer.tsx
    globals.css
    layout.tsx
    navbar.tsx
    not-found.tsx
    page.tsx
    cart/
      actions.ts
      cart-client.tsx
      cart-context.tsx
      cart-item.tsx
      cart-sidebar.tsx
      page.tsx
    checkout/
      checkout-client.tsx
      page.tsx
    collection/
      [slug]/
        page.tsx
    legal/
      [slug]/
        page.tsx
    order/
      success/
        [id]/
          page.tsx
    product/
      [slug]/
        add-to-cart-button.tsx
        image-gallery.tsx
        page.tsx
        product-features.tsx
        quantity-selector.tsx
        trust-badges.tsx
        variant-selector.tsx
    products/
      page.tsx
  components/
    devtools.tsx
    referral-badge.tsx
    yns-link.tsx
    cart/
      cart-drawer.tsx
    sections/
      hero.tsx
      product-grid.tsx
    ui/
      accordion.tsx
      alert-dialog.tsx
      alert.tsx
      aspect-ratio.tsx
      avatar.tsx
      badge.tsx
      breadcrumb.tsx
      button-group.tsx
      button.tsx
      calendar.tsx
      card.tsx
      carousel.tsx
      chart.tsx
      checkbox.tsx
      collapsible.tsx
      command.tsx
      context-menu.tsx
      dialog.tsx
      drawer.tsx
      dropdown-menu.tsx
      empty.tsx
      field.tsx
      form.tsx
      hover-card.tsx
      input-group.tsx
      input-otp.tsx
      input.tsx
      item.tsx
      kbd.tsx
      label.tsx
      menubar.tsx
      navigation-menu.tsx
      pagination.tsx
      popover.tsx
      progress.tsx
      radio-group.tsx
      resizable.tsx
      scroll-area.tsx
      select.tsx
      separator.tsx
      sheet.tsx
      sidebar.tsx
      skeleton.tsx
      slider.tsx
      sonner.tsx
      spinner.tsx
      switch.tsx
      table.tsx
      tabs.tsx
      textarea.tsx
      toggle-group.tsx
      toggle.tsx
      tooltip.tsx
  docs/
  hooks/
    use-mobile.ts
  lib/
    commerce.ts
    constants.ts
    cookies.ts
    invariant.ts
    money.ts
    orders.ts
    paystack.ts
    sanity.ts
    utils.ts
    whatsapp.ts
    yns-image.tsx
  public/
    Default_product_imag_of_a_yellow_bag (2).jpg
    Default_product_imag_of_a_yellow_bag.jpg
    Default_product_image_of_a_bag.jpg
    Default_product_image_of_a_bottle.jpg
    Default_product_image_of_a_tshirt (2).jpg
    Default_product_image_of_a_tshirt.jpg
    MDB8YWNjdF8x (2).avif
    MDB8YWNjdF8x.avif
    OpenAI20Playground202026-01-1420at2022.jpg
    Playground202026-01-1420at2013.png
    Playground202026-01-1420at2022(1).jpg
    hero.jpg
    logo.svg
    screenshot.png
  sanity/
    schema.ts
    schemaTypes/
      collection.ts
      index.ts
      legalPage.ts
      product.ts
  services/
    checkout/
      index.ts
  types/
    cart.ts
    checkout.ts
```

**Routing Structure (App Router)**
- `/` ? `app/page.tsx`  
- `/products` ? `app/products/page.tsx`  
- `/product/[slug]` ? `app/product/[slug]/page.tsx`  
- `/collection/[slug]` ? `app/collection/[slug]/page.tsx`  
- `/cart` ? `app/cart/page.tsx`  
- `/checkout` ? `app/checkout/page.tsx`  
- `/legal/[slug]` ? `app/legal/[slug]/page.tsx`  
- `/order/success/[id]` ? `app/order/success/[id]/page.tsx`  
- `not found` ? `app/not-found.tsx`

**Architecture Diagram (High-Level)**
```
[Browser]
   |
   v
[Next.js App Router]
   |
   v
[app/layout.tsx]
   |-- CartProvider (app/cart/cart-context.tsx)
   |-- Navbar/Footer/CartSidebar/UI chrome
   |
   v
[Route Page (app/**/page.tsx)]
   |
   +--> UI components (components/**, app/** subcomponents)
   |
   +--> Data access (lib/commerce.ts, lib/orders.ts, lib/paystack.ts, lib/whatsapp.ts)
           |
           +--> Sanity client (lib/sanity.ts) -> Sanity API
           +--> Paystack API
           +--> WhatsApp API
```

**Data-Flow Mapping**
- Product browsing  
  - `app/page.tsx` and `app/products/page.tsx` ? `components/sections/product-grid.tsx` ? `lib/commerce.ts` ? `lib/sanity.ts` ? Sanity API.
- Product details  
  - `app/product/[slug]/page.tsx` ? `lib/commerce.ts` ? Sanity API.  
  - Images render through `lib/yns-image.tsx`.
- Collections  
  - `app/collection/[slug]/page.tsx` ? `lib/commerce.ts` ? Sanity API.
- Legal pages  
  - `app/legal/[slug]/page.tsx` ? `lib/commerce.ts` ? Sanity API.
- Cart  
  - Layout wraps app with `CartProvider` from `app/cart/cart-context.tsx`.  
  - Cart state is hydrated by `lib/commerce.ts` and cookie helpers in `lib/cookies.ts`.
- Checkout and payment  
  - `app/checkout/page.tsx` uses `app/checkout/checkout-client.tsx` and `services/checkout/index.ts`.  
  - Order success page verifies payment using `lib/paystack.ts` and updates orders via `lib/orders.ts`, with notifications via `lib/whatsapp.ts`.

**Relationship Between App Router and `src/views`**
- There is **no** `src/` or `src/views` directory in this project.  
- All routing and “views” live under `app/` (App Router).  
- If you previously had a `src/views` setup, it has been removed or never existed here.

**How Components Depend on Routes and Views**
- Layout and global chrome  
  - `app/layout.tsx` imports `Navbar`, `Footer`, `CartButton`, `CartSidebar`, `CartProvider`, `YnsLink`, and dev tools.
- Home page  
  - `app/page.tsx` ? `components/sections/hero.tsx` and `components/sections/product-grid.tsx`.
- Products list  
  - `app/products/page.tsx` ? `components/sections/product-grid.tsx`.
- Product detail  
  - `app/product/[slug]/page.tsx` ? `app/product/[slug]/add-to-cart-button.tsx`, `image-gallery.tsx`, `product-features.tsx`, `quantity-selector.tsx`, `trust-badges.tsx`, `variant-selector.tsx`.
- Collection page  
  - `app/collection/[slug]/page.tsx` ? `components/sections/product-grid.tsx` and `lib/yns-image.tsx`.
- Order success  
  - `app/order/success/[id]/page.tsx` ? `components/ui/button.tsx`, `components/yns-link.tsx`, `lib/yns-image.tsx`.

**Technology Stack Map**
- Framework: Next.js App Router (`app/`)
- Language: TypeScript + React
- UI: Tailwind CSS + shadcn/ui + Radix UI
- State: React context (`app/cart/cart-context.tsx`)
- Data layer: Sanity (`lib/sanity.ts`), Commerce wrapper (`lib/commerce.ts`)
- Payments: Paystack (`lib/paystack.ts`)
- Notifications: WhatsApp (`lib/whatsapp.ts`)
- Tooling: Biome, Bun config present (but npm used), PostCSS, Next font

**Env Map (current `.env.local` keys)**
- `NEXT_PUBLIC_SANITY_PROJECT_ID`
- `NEXT_PUBLIC_SANITY_DATASET`
- `NEXT_PUBLIC_SANITY_API_VERSION`
- `SANITY_READ_TOKEN`
- `YNS_API_KEY` is required per instructions (not shown here, but must exist)

**Data Pattern + Fetching + Caching Map**
- **Fetching**: `lib/commerce.ts` is the main data gateway and uses the Sanity client in `lib/sanity.ts`.
- **Caching**: Several pages use `"use cache"` + `cacheLife(...)` for server component caching:
  - `app/product/[slug]/page.tsx` ? `cacheLife("minutes")`
  - `app/collection/[slug]/page.tsx` ? `cacheLife("minutes")`
  - `app/legal/[slug]/page.tsx` ? `cacheLife("hours")`
  - `app/order/success/[id]/page.tsx` ? `cacheLife("seconds")`
- **Data flow pattern**:
  - Routes in `app/**/page.tsx` call `lib/commerce.ts`
  - `lib/commerce.ts` calls `lib/sanity.ts` (Sanity API)
  - UI components render the returned data
- **Error handling**: Some fetches are guarded (`notFound()` in route pages, try/catch in layout cart bootstrap).
- **No `src/views`**: All views are App Router routes in `app/`.

