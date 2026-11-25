# Frontend-Only Product Requirements Document (PRD): **am around**

---

## 1. Product Overview

* **Product Name:** **am around**
* **One-Sentence Description:** A ride-hailing aggregator mobile application that allows users to view nearby vehicles, compare estimated waiting times, and check fares across multiple ride-hailing providers in a single unified interface before deep-linking to the chosen provider's app to book.
* **Problem It Solves:** Daily commuters and urban travelers currently face long wait times, frequent driver cancellations, and delayed arrivals because they have to manually switch between multiple ride-hailing apps (such as Grab, Bolt, Maxim, LINE MAN RIDE, inDrive, and TADA) to guess which service has the closest driver and the best price.
* **Target Users:**
  * **Primary Users:** Daily urban commuters, university students (e.g., commuters traveling around Bang Kruai Municipality – KMUTNB), and office workers who rely on motorcycle taxis (win/bike) and ride-hailing services during rush hours and need to minimize waiting times.
  * **Secondary Users:** Price-conscious riders who want to compare estimated fares side-by-side across platforms before committing to a booking.

---

## 2. User Stories

1. **As a** daily commuter, **I want to** select which ride-hailing providers I have installed or prefer to use (e.g., Grab, Bolt, Maxim) during initial setup or settings, **so that** I only see relevant vehicle options.
2. **As a** rushed passenger, **I want to** input my pickup and drop-off locations and see nearby vehicles from different apps plotted on a single map, **so that** I immediately know which provider has a driver closest to me.
3. **As a** budget-conscious rider, **I want to** view a side-by-side comparison list showing estimated wait times (in minutes) and estimated fares (in THB) for each provider, **so that** I can choose the best balance of speed and price.
4. **As a** user who has selected a preferred ride option, **I want to** review a pre-handoff confirmation screen with my route, estimated fare, and next steps, **so that** I clearly understand what will happen when I am redirected to the third-party app.
5. **As a** rider ready to book, **I want to** tap a single call-to-action button that launches the chosen provider's app directly, **so that** I can complete my confirmation and payment without wasting time searching for the app manually.
6. **As a** returning user, **I want to** toggle or update my active ride-hailing providers anytime, **so that** my comparison results always match the apps available on my phone.

---

## 3. Screen / Page Definitions

### Screen 1: Splash & Onboarding / Provider Setup (`ProviderSelectionScreen`)
* **What It Displays:**
  * Top orange brand header displaying the **am around** logo (white location pin containing an orange-helmeted scooter rider icon with signal waves on a bright orange squircle background) and app title.
  * Headline: *"จะเดินทางกับแอปไหนดี?"* (Which app will you travel with?) and subtitle: *"ดูรถใกล้ตัวและเปรียบเทียบก่อนเลือก"* (See nearby rides and compare before choosing).
  * Section header: *"เลือกผู้ให้บริการ"* (Select Providers) followed by a vertical list of selectable provider cards: **Grab**, **LINE MAN RIDE**, **Bolt**, **inDrive**, **Maxim**, and **TADA**.
  * Footnote disclaimer: *"* ประเภทพาหนะและพื้นที่ให้บริการขึ้นกับแต่ละแอป"* (Vehicle types and service areas depend on each app).
  * Primary bottom CTA button to save preferences and proceed to the main map screen.
* **Navigation Flow:**
  * Entry point on first launch (or accessible from the top-left menu/settings icon on the Home Map Screen).
  * Tapping "Continue / Confirm" navigates to **Screen 2: Home & Route Search (`MapComparisonScreen`)**.

### Screen 2: Home Map & Ride Comparison (`MapComparisonScreen`)
* **What It Displays:**
  * **Header Bar:** Title *"เลือกจุดรับและปลายทาง"* (Select Pickup & Destination) on the left, and the square orange **am around** app icon on the right (plus hamburger/settings trigger to edit providers).
  * **Route Input Card:** Rounded warm-cream container displaying two location fields with colored dot indicators:
    * Pickup (Orange dot): e.g., *"รับ: เทศบาลเมืองบางกรวย"*
    * Destination (Black dot): e.g., *"ส่ง: มจพ. พระนครเหนือ"*
  * **Interactive Map Viewport:** Displays the route polyline in bright orange (`#FF6B00`), pickup/drop-off markers, and real-time simulated nearby driver pins labeled with provider initials/icons and distances/ETAs (e.g., green `G` pin, green `B` pin, coral-orange `M` pin, or rider avatars with `2 min` / `3 min` / `5 min` badges).
  * **Map Disclaimer Caption:** *"ตำแหน่งรถและเส้นทางในภาพเป็นตัวอย่าง"* (Vehicle positions and routes shown are illustrative).
  * **Comparison Bottom Sheet / List (`เปรียบเทียบรถใกล้คุณ`):** Vertical stack of selectable ride cards showing service name (e.g., *GrabBike*, *Maxim Bike*, *Bolt Motorbike*), estimated wait time (*"รอ ~3 นาที"*), and estimated fare in Thai Baht (*"฿95"*, *"฿80"*, *"฿85"*).
* **Navigation Flow:**
  * Tapping the Pickup or Destination row opens **Screen 3: Location Search Modal (`LocationPickerModal`)**.
  * Tapping any ride card in the *"เปรียบเทียบรถใกล้คุณ"* list highlights the card with an orange border and navigates to **Screen 4: Provider Handoff Confirmation (`HandoffConfirmationScreen`)**.

### Screen 3: Location Search & Picker (`LocationPickerModal`)
* **What It Displays:**
  * Full-screen or slide-up modal with active text inputs for Pickup and Destination, a "Use Current Location" button, a "Swap Locations" icon button, and a scrollable list of recent/suggested landmarks (e.g., *เทศบาลเมืองบางกรวย*, *มจพ. พระนครเหนือ*, *MRT บางซื่อ*).
* **Navigation Flow:**
  * Selecting a location updates the state and returns to **Screen 2 (`MapComparisonScreen`)**, triggering a simulated refresh of nearby vehicles and fares.

### Screen 4: Provider Handoff Confirmation (`HandoffConfirmationScreen`)
* **What It Displays:**
  * **Header:** Dynamic title *"ดำเนินการต่อใน [Provider Name]"* (Continue in Grab), subtitle *"ตรวจสอบรายละเอียดก่อนเปิดแอปผู้ให้บริการ"* (Review details before opening provider app), and the **am around** brand icon in the top-right corner.
  * **Route Summary Card:** Warm-cream card labeled *"เส้นทางของคุณ"* showing Pickup → Down Arrow (`↓`) → Destination.
  * **Selected Ride Summary Card:** Light-gray card displaying the provider badge (e.g., green circle `G`), service tier (*GrabBike*), estimated wait time (*"รอประมาณ 3 นาที"*), and bold estimated fare (*"฿95"*).
  * **Price Notice Banner:** Warm-cream info card stating *"ราคาแสดงก่อนเปลี่ยนแอป — ยอดจริงให้ตรวจสอบใน [Provider Name] อีกครั้ง"* (Price shown prior to app switch — verify final fare inside Grab).
  * **Primary Action Button:** Full-width pill-shaped orange button: *"เปิด [Provider Name] เพื่อเรียกรถ ↗"* (Open Grab to book ride).
  * **Visual Process Indicator:** Downward orange arrow (`↓`) leading to a soft mint-green instruction box: *"ขั้นตอนถัดไปใน [Provider Name]: ตรวจสอบราคา → กดยืนยัน → ชำระเงิน"* (Next steps in Grab: Check price → Confirm → Pay).
* **Navigation Flow:**
  * Tapping the Back button returns to **Screen 2 (`MapComparisonScreen`)**.
  * Tapping *"เปิด [Provider Name] เพื่อเรียกรถ ↗"* triggers the external app URI/deep-link simulation modal or fallback toast if the app is not installed.

---

## 4. UI Component Specifications

### Visual Identity, Logo & Iconography (Strict Retention)
* **Brand Logo & App Icon:** Retain the exact **am around** visual identity:
  * **App Icon Container:** Rounded square (squircle) with a vibrant orange background (`#FF6B00` to `#FF7A00` gradient).
  * **Center Emblem:** A solid white map-pin silhouette containing a stylized scooter rider icon (black/dark charcoal scooter and rider silhouette wearing an orange helmet, with three horizontal speed lines behind the rider).
  * **Signal & Road Accents:** Two curved white Wi-Fi/radar signal waves radiating from the top-right of the pin, resting above stylized orange/yellow intersecting road lines at the base.
  * **Wordmark:** Lowercase bold rounded sans-serif typography **`am around`** in white (on orange backgrounds) or dark charcoal (`#1A1A1A`) paired with the squircle icon (on light backgrounds).
* **Provider Badges:** Circular 36px–40px brand badges retaining exact colors and initials from the design:
  * **Grab:** Green circle (`#00B14F`) with bold white `G`
  * **LINE MAN RIDE:** Bright green circle (`#06C755`) with bold white `L`
  * **Bolt:** Emerald green circle (`#34D186`) with bold white `B`
  * **inDrive:** Charcoal/black circle (`#1E1E1E`) with bold white `i`
  * **Maxim:** Coral red-orange circle (`#FF5733`) with bold white `M`
  * **TADA:** Royal blue circle (`#2B59FF`) with bold white `T`

### Color Palette & Typography
* **Color Scheme:**
  * **Primary Brand Orange:** `#FF6B00` (Headers, primary CTAs, active borders, route polylines, directional arrows)
  * **Soft Cream / Warm Tint Surface:** `#FFF5EC` (Route summary boxes, provider list row backgrounds, price notice banners)
  * **Neutral Card Surface:** `#F5F5F7` (Unselected ride comparison cards, selected service detail card)
  * **Mint Guidance Surface:** `#EAF7EE` (Next-steps instruction card on handoff screen)
  * **Canvas Background:** `#FFFFFF` (Clean white primary background)
  * **Primary Text:** `#111827` (High-contrast near-black for headings and fares)
  * **Secondary Text:** `#6B7280` (Muted gray for subtitles, wait times, and disclaimers)
* **Typography:**
  * **Font Family:** **Kanit** or **IBM Plex Sans Thai** (clean geometric/humanist Thai + Latin sans-serif matching the round, modern readability of the mockups).
  * **Hierarchy:**
    * Screen Title: `20px–22px`, Bold (`700`)
    * Section Header: `16px–18px`, Bold (`700`)
    * Fare Price (`฿95`): `20px–24px`, ExtraBold (`800`)
    * Body / Location Label: `14px–15px`, Medium (`500`)
    * Subtitles / Disclaimers: `12px`, Regular (`400`)

### Key Components & Responsive Behavior
* **Layout & Responsiveness:** Mobile-first single-column portrait layout (`360px` to `430px` standard viewport), centered within a `480px` max-width container with subtle elevation when viewed on tablet or desktop viewports.
* **Provider Selection Row (`ProviderToggleItem`):** Flex row (`height: 56px`, `border-radius: 12px`, background `#FFF5EC`), left-aligned circular provider badge + bold provider name, right-aligned `24px` circular checkbox (filled green `#16A34A` with white checkmark when selected; `1.5px` `#D1D5DB` outline when unselected).
* **Interactive Map Card (`RouteMapView`):** Rounded container (`border-radius: 16px`, `height: 220px–260px`) supporting pinch-to-zoom, pan, custom SVG marker pins (`G`, `B`, `M`), orange route polyline, and floating destination pill tag (`มจพ.`).
* **Ride Comparison Card (`RideOptionCard`):** Full-width interactive card (`padding: 14px 16px`, `border-radius: 12px`). Default state uses `#F5F5F7` fill; active/selected/fastest state uses `#FFF8F1` fill with a `1.5px solid #FF6B00` border. Displays service name & wait time (`รอ ~3 นาที`) on the left, and right-aligned Baht price (`฿95`) on the right.

---

## 5. User Interaction Flows

### Flow A: Initial Provider Configuration
1. User opens **am around** and lands on `ProviderSelectionScreen`.
2. User taps desired provider rows (e.g., **Grab**, **Bolt**, **Maxim**). Each tap immediately toggles the green checkmark state.
3. **Client-Side Validation:** At least **1 provider** must be selected. If the user deselects all providers, the primary CTA button enters a disabled state (`opacity: 0.5`) and displays an inline helper message: *"กรุณาเลือกผู้ให้บริการอย่างน้อย 1 แอป"* (Please select at least 1 provider).
4. User taps the confirm button and transitions smoothly to `MapComparisonScreen`.

### Flow B: Route Entry & Real-Time Ride Comparison
1. On `MapComparisonScreen`, user taps the Pickup or Destination card (`เทศบาลเมืองบางกรวย` / `มจพ. พระนครเหนือ`).
2. `LocationPickerModal` slides up. User types a query or picks from suggested locations.
3. **Client-Side Validation:**
   * Empty input prevents submission and highlights the input border in red with *"กรุณาระบุจุดรับและปลายทาง"*.
   * Identical pickup and destination triggers a warning banner: *"จุดรับและปลายทางต้องไม่ซ้ำกัน"* (Pickup and destination cannot be the same).
4. Upon valid selection, `LocationPickerModal` closes.
5. **Loading State:** While simulating nearby vehicle discovery (`800ms` frontend timer), the map displays a pulsing orange radar animation around the pickup pin, and the comparison list renders 3 shimmer skeleton cards.
6. **Loaded State:** The map updates with the orange route polyline and nearby vehicle pins (`G`, `M`, `B`), and the comparison list populates sorted by fastest arrival or lowest price.

### Flow C: Ride Selection & Third-Party App Handoff
1. User reviews the comparison list (e.g., *GrabBike ฿95 / ~3 min*, *Maxim Bike ฿80 / ~5 min*, *Bolt Motorbike ฿85 / ~9 min*) and taps **GrabBike**.
2. The card highlights with an orange border and transitions to `HandoffConfirmationScreen`.
3. User verifies the route summary, estimated wait time, fare, and the green *"ขั้นตอนถัดไปใน Grab"* guide.
4. User taps the primary orange button *"เปิด Grab เพื่อเรียกรถ ↗"*.
5. **Handoff & Fallback Error Display:**
   * Frontend triggers a simulated deep-link launch overlay (*"กำลังเปิดแอป Grab..."* with spinner).
   * **Error / Fallback State (App Not Installed Simulation):** If simulated deep-link fails or times out, a bottom modal sheet appears: *"ไม่พบแอป Grab ในเครื่องของคุณ"* (Grab app not found on your device) with two buttons: *"ดาวน์โหลด Grab"* (Store link) and *"เลือกผู้ให้บริการอื่น"* (Return to comparison list).

---

## 6. Mock Data Structure

```json
{
  "appConfig": {
    "brandName": "am around",
    "currency": "THB",
    "currencySymbol": "฿",
    "defaultCenter": {
      "lat": 13.8142,
      "lng": 100.4985
    }
  },
  "providers": [
    {
      "id": "grab",
      "name": "Grab",
      "shortCode": "G",
      "badgeColor": "#00B14F",
      "isSelected": true,
      "deepLinkScheme": "grab://open",
      "fallbackUrl": "https://grab.com"
    },
    {
      "id": "lineman",
      "name": "LINE MAN RIDE",
      "shortCode": "L",
      "badgeColor": "#06C755",
      "isSelected": false,
      "deepLinkScheme": "lineman://ride",
      "fallbackUrl": "https://lineman.line.me"
    },
    {
      "id": "bolt",
      "name": "Bolt",
      "shortCode": "B",
      "badgeColor": "#34D186",
      "isSelected": true,
      "deepLinkScheme": "bolt://ride",
      "fallbackUrl": "https://bolt.eu"
    },
    {
      "id": "indrive",
      "name": "inDrive",
      "shortCode": "i",
      "badgeColor": "#1E1E1E",
      "isSelected": false,
      "deepLinkScheme": "indrive://open",
      "fallbackUrl": "https://indrive.com"
    },
    {
      "id": "maxim",
      "name": "Maxim",
      "shortCode": "M",
      "badgeColor": "#FF5733",
      "isSelected": true,
      "deepLinkScheme": "maxim://order",
      "fallbackUrl": "https://taximaxim.com"
    },
    {
      "id": "tada",
      "name": "TADA",
      "shortCode": "T",
      "badgeColor": "#2B59FF",
      "isSelected": false,
      "deepLinkScheme": "tada://ride",
      "fallbackUrl": "https://tada.global"
    }
  ],
  "savedLocations": [
    {
      "id": "loc_01",
      "name": "เทศบาลเมืองบางกรวย",
      "shortName": "เทศบาลบางกรวย",
      "district": "บางกรวย, นนทบุรี",
      "lat": 13.8051,
      "lng": 100.4728
    },
    {
      "id": "loc_02",
      "name": "มจพ. พระนครเหนือ",
      "shortName": "มจพ.",
      "district": "บางซื่อ, กรุงเทพมหานคร",
      "lat": 13.8191,
      "lng": 100.5143
    },
    {
      "id": "loc_03",
      "name": "MRT บางซื่อ (ทางออก 2)",
      "shortName": "MRT บางซื่อ",
      "district": "บางซื่อ, กรุงเทพมหานคร",
      "lat": 13.8025,
      "lng": 100.5372
    },
    {
      "id": "loc_04",
      "name": "เซ็นทรัล ลาดพร้าว",
      "shortName": "เซ็นทรัล ลาดพร้าว",
      "district": "จตุจักร, กรุงเทพมหานคร",
      "lat": 13.8161,
      "lng": 100.5608
    }
  ],
  "activeSearchRoute": {
    "pickup": {
      "id": "loc_01",
      "name": "เทศบาลเมืองบางกรวย",
      "lat": 13.8051,
      "lng": 100.4728
    },
    "destination": {
      "id": "loc_02",
      "name": "มจพ. พระนครเหนือ",
      "lat": 13.8191,
      "lng": 100.5143
    },
    "distanceKm": 6.4,
    "routePolyline": [
      [13.8051, 100.4728],
      [13.8095, 100.4810],
      [13.8140, 100.4955],
      [13.8172, 100.5060],
      [13.8191, 100.5143]
    ]
  },
  "nearbyRideOptions": [
    {
      "id": "ride_01",
      "providerId": "grab",
      "providerName": "Grab",
      "serviceName": "GrabBike",
      "vehicleType": "motorbike",
      "etaMinutes": 3,
      "distanceKm": 0.6,
      "estimatedFare": 95,
      "currency": "THB",
      "isRecommended": true,
      "driverPin": {
        "shortCode": "G",
        "badgeColor": "#00B14F",
        "lat": 13.8082,
        "lng": 100.4765
      }
    },
    {
      "id": "ride_02",
      "providerId": "maxim",
      "providerName": "Maxim",
      "serviceName": "Maxim Bike",
      "vehicleType": "motorbike",
      "etaMinutes": 5,
      "distanceKm": 0.9,
      "estimatedFare": 80,
      "currency": "THB",
      "isRecommended": false,
      "driverPin": {
        "shortCode": "M",
        "badgeColor": "#FF5733",
        "lat": 13.8038,
        "lng": 100.4702
      }
    },
    {
      "id": "ride_03",
      "providerId": "bolt",
      "providerName": "Bolt",
      "serviceName": "Bolt Motorbike",
      "vehicleType": "motorbike",
      "etaMinutes": 9,
      "distanceKm": 1.1,
      "estimatedFare": 85,
      "currency": "THB",
      "isRecommended": false,
      "driverPin": {
        "shortCode": "B",
        "badgeColor": "#34D186",
        "lat": 13.8110,
        "lng": 100.4920
      }
    },
    {
      "id": "ride_04",
      "providerId": "lineman",
      "providerName": "LINE MAN RIDE",
      "serviceName": "LINE MAN Bike",
      "vehicleType": "motorbike",
      "etaMinutes": 6,
      "distanceKm": 1.0,
      "estimatedFare": 90,
      "currency": "THB",
      "isRecommended": false,
      "driverPin": {
        "shortCode": "L",
        "badgeColor": "#06C755",
        "lat": 13.8070,
        "lng": 100.4830
      }
    },
    {
      "id": "ride_05",
      "providerId": "tada",
      "providerName": "TADA",
      "serviceName": "TADA Bike",
      "vehicleType": "motorbike",
      "etaMinutes": 11,
      "distanceKm": 1.8,
      "estimatedFare": 88,
      "currency": "THB",
      "isRecommended": false,
      "driverPin": {
        "shortCode": "T",
        "badgeColor": "#2B59FF",
        "lat": 13.8155,
        "lng": 100.5010
      }
    }
  ]
}
```