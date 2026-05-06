# Sourcing And Delivery

This is the current operating model for how GameGift Studio sources and delivers launch products without self-storing inventory or running an in-house warehouse.

## Business model

GameGift Studio is a fixed-template customization business, not an open-ended custom board-game factory.

That means:

- customers customize only from approved templates
- each template has a controlled component set
- each physical template maps to a preconfigured vendor component set at the manufacturer
- personalization changes the printed assets and copy, not the underlying supply chain shape

## Launch provider

The launch physical provider is The Game Crafter.

Why:

- live shipping quotes are available during checkout
- the app can submit boxed-game orders after payment
- the provider handles manufacturing and shipping directly to the customer
- this avoids basement inventory, hand assembly, and self-run fulfillment

## What the repo currently does

- stores template-level vendor SKU mappings
- collects US shipping addresses for physical orders
- builds a The Game Crafter cart for quote retrieval
- fetches live shipping methods and pricing
- freezes the selected shipping quote on the order
- charges the customer in Stripe
- submits the paid order to The Game Crafter
- stores vendor order, receipt, and shipment sync records
- generates a per-order `fulfillment_manifest.json`

## What must exist outside the repo

The code assumes you have already configured the printed parts and stock pieces SKUs for each launch template:

- `Milestone Trail`
- `Home Turf`
- `Face Card`
- `Case File`
- `Trivia Trek`

Each template needs live SKUs for:

- board
- primary deck
- secondary deck
- rulebook
- stock pieces kit
- box

Those SKUs are injected through the `TGC_HOME_TURF_*`, `TGC_MILESTONE_TRAIL_*`, `TGC_FACE_CARD_*`, `TGC_CASE_FILE_*`, and `TGC_TRIVIA_TREK_*` env groups.

## BOM strategy

The launch BOM is controlled and non-infringing.

Examples:

- `Milestone Trail`: folding board, 2 decks, rulebook, stock pawns, die, score tokens, box
- `Home Turf`: neighborhood-map board, 2 decks, rulebook, stock movers, die, turf/score tokens, box
- `Face Card`: identity board, 2 decks, rulebook, stock markers, guess tokens, die, box
- `Case File`: evidence board, 2 decks, detective booklet, suspect markers, investigation tokens, die, box
- `Trivia Trek`: score-track board, 2 decks, rulebook, stock movers, die, score markers, box

These are represented in the template registry and catalog sync layer. They are not open-ended arbitrary kits.

## Delivery flow

Digital orders:

- customer pays in Stripe
- webhook generates final files
- success page exposes downloads

Physical orders:

- customer enters US shipping address
- app gets live shipping quotes from The Game Crafter
- customer pays in Stripe for product + shipping + tax
- webhook generates final files and fulfillment manifest
- fulfillment manifest includes the BOM version and packout checklist
- app submits the order to The Game Crafter
- scheduled sync updates shipment state later

## What is code-complete

- launch catalog structure
- shipping quote persistence
- Stripe Checkout and webhook orchestration
- generated asset storage abstraction
- fulfillment submission path
- vendor sync endpoint
- admin visibility into vendor state

## What is still operationally dependent

- live The Game Crafter credentials
- real per-template component SKUs
- verified product configuration at the vendor
- production shipping cost and SLA validation
- at least one successful internal shipment per template

## What is intentionally not part of launch

- self-stored components
- hand assembly
- warehouse hiring
- arbitrary customer-uploaded custom games
- premium gift box upsell
