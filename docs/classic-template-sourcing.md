# Classic Template Sourcing And Delivery Plan

This document answers the practical launch question:

Can GameGift Studio deliver a full physical game with both the custom board and the game pieces, without self-assembly or a warehouse?

## Short answer

Yes, but only if we constrain the templates to component sets that can be manufactured, assembled, and shipped by a single game manufacturer.

The recommended launch manufacturer is **The Game Crafter**.

Why:

- public developer API for carts, shipping quotes, receipts, and shipments
- print-on-demand boards, cards, boxes, booklets, tiles, play money, and stock parts
- direct shipping to the end customer
- no minimum order quantity
- existing app code is already oriented around The Game Crafter

Backup manufacturer:

- **BoardGamesMaker**

BoardGamesMaker has strong manufacturing and fulfillment capabilities, but for this app The Game Crafter is the better operational fit because it exposes public API documentation for checkout flow and shipment polling.

## What the manufacturers currently support

The Game Crafter publicly documents:

- game boards
- custom boxes
- booklets
- tiles
- screens
- play money
- thousands of stock game pieces
- shipping methods and estimated ship dates
- cart and shipment APIs

BoardGamesMaker publicly documents:

- boards
- cards
- boxes
- dice
- tiles/chits
- booklets
- play money
- fulfillment services with direct-to-customer shipping

## The decision

We should launch only templates that can fit inside a standard boxed game recipe:

- 1 folding board
- 1 to 2 custom decks
- 1 booklet
- standard stock pawns / meeples / dice / chips / tiles
- 1 standard retail box

That means the product is still highly personal, but the supply chain remains standard.

## Recommended classic-inspired template slate

These names are shorthand only. They are not customer-facing product names.

### 1. Monopoly-style

Status:

- **physically deliverable**

Recommended component set:

- quad-fold board
- 2 x D6 dice
- 6 stock pawns or meeples
- custom deed / event cards
- custom play money or point-money cards
- generic building markers or chips
- booklet
- large retail box

Personalization hooks:

- custom streets / destinations / memories / businesses
- custom event cards
- custom title and visual theme

Operational note:

- high commercial value
- highest legal design risk
- must be visually and structurally transformed away from the classic trade dress

### 2. Guess Who-style

Status:

- **physically deliverable only if redesigned around standard components**

Do **not** depend on reproducing the classic plastic flip-frame hardware.

Recommended component set:

- 2 printed player screens or portrait panels
- 24 to 48 portrait cards or tiles
- yes/no markers or elimination tokens
- quick rules card or booklet
- small to medium box

Personalization hooks:

- custom faces
- custom names
- custom personal traits / clue tags / inside jokes

Operational note:

- excellent personalization payoff
- weakest fit for exact hardware recreation
- should be sold as a custom deduction portrait game, not as a hardware clone

### 3. The Game of Life-style

Status:

- **physically deliverable**

Recommended component set:

- quad-fold or six-fold board
- 1 x D6 or 1 custom spinner substitute using cards or dial if needed
- 4 to 6 stock pawns
- milestone / event / reward cards
- score or cash tokens
- booklet
- retail box

Personalization hooks:

- milestones
- jobs
- hobbies
- travel
- family moments
- achievements

Operational note:

- easiest emotional gift
- easiest to make premium and heartfelt
- should avoid iconic spinner / path visuals if they read too close to the original

### 4. Clue-style

Status:

- **physically deliverable**

Recommended component set:

- folding board
- suspect cards
- evidence / twist cards
- room / location cards or tiles
- 6 stock pawns or suspect markers
- detective sheet or score pad
- booklet
- retail box

Personalization hooks:

- custom suspects
- custom locations
- custom objects
- custom clues
- custom story setup

Operational note:

- strong group gift format
- more writing-heavy than the others
- should be framed as a custom mystery case board game

### 5. Trivial Pursuit-style

Status:

- **physically deliverable**

Recommended component set:

- folding board with progress track
- 1 large question deck or 6 themed mini decks
- answer / challenge cards if needed
- 4 to 6 stock pawns
- scoring chips, cubes, or tokens instead of bespoke wedge hardware
- booklet
- retail box

Personalization hooks:

- couple trivia
- family history
- friend-group memories
- inside jokes
- wedding / retirement / reunion categories

Operational note:

- strongest fourth or fifth launch template
- easiest to personalize at scale
- should avoid relying on custom wedge pieces

## Physical launch ranking by sourcing confidence

Best to worst:

1. Life-style
2. Trivial Pursuit-style
3. Clue-style
4. Monopoly-style
5. Guess Who-style

Why:

- Life, Trivia, and Clue work naturally with boards, decks, pawns, dice, and booklets
- Monopoly-style is sourceable but requires careful design to avoid over-cloning
- Guess Who-style is sourceable only if we give up the iconic hardware feel

## What this means for launch

If the business promise is:

"We deliver the custom board and the pieces"

Then the launch set is all five, with the two higher-risk formats simplified into sourceable stock-piece kits:

- Monopoly-style becomes `Home Turf`, an original neighborhood-map strategy game with no perimeter-property trade dress
- Life-style
- Guess Who-style becomes `Face Card`, an original people-guessing board/card game with no flip-rack hardware dependency
- Clue-style
- Trivia-style

Operationally, `Home Turf` and `Face Card` only qualify because they use stock boards, decks, tokens, pawns/markers, dice, booklets, and boxes instead of custom molded hardware.

## Manufacturing rule

Every physical template must satisfy this rule before launch:

- all custom printed parts come from uploaded artwork
- all non-printed parts come from stock manufacturer pieces
- all components fit inside a single standard box
- the full kit can be ordered and shipped by the manufacturer without manual repacking by us

If a template requires custom plastic tooling, hand insertion, or owner-managed assembly, it does not qualify for launch.

## What is sourced today vs what is not

Sourced today:

- the category of parts is sourceable from The Game Crafter and BoardGamesMaker
- the app has a The Game Crafter-oriented fulfillment architecture

Not sourced today:

- final live SKUs for the classic-inspired template bundles
- validated box-fit quotes for each template
- tested sample orders for each template
- final COGS and margin sheet

## Next operational steps

1. Lock the five classic-inspired physical templates in The Game Crafter.
2. For each one, finalize a single-box BOM.
3. Build the product in The Game Crafter as a preconfigured boxed game.
4. Lock the game SKU and shipping profile.
5. Order one proof copy.
6. Validate fit, quality, shipping time, and unit margin.
7. Add that live SKU to the app config.

## Bottom line

Yes, we can deliver the board and the pieces.

But we should only launch templates whose physical format can be built from:

- standard printed boards
- standard printed cards / tiles / booklets
- stock manufacturer pieces
- a standard retail box

That makes the business operationally real, shippable, and warehouse-free.
