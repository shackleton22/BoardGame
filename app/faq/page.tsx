import { ContentPage } from "@/components/shared/content-page";

const FAQ_SECTIONS = [
  {
    title: "Creating your game",
    items: [
      {
        question: "How does customization actually work?",
        answer:
          "You choose a game format, answer a guided story form built for that format, and we turn those details into a proof of the board, cards, and rules. You review the proof before you move into checkout.",
      },
      {
        question: "Do I have to design the board myself?",
        answer:
          "No. The product is designed for gift buyers, not game designers. You provide the memories, people, places, jokes, or milestones that matter, and GameGift Studio turns that into the game layout and copy.",
      },
      {
        question: "Can I edit the proof before I buy?",
        answer:
          "Yes. The proof is editable before checkout, including the title, subtitle, and the generated board and card copy. The goal is to help you approve something that already feels gift-ready instead of forcing you to build it from scratch.",
      },
    ],
  },
  {
    title: "Digital and boxed delivery",
    items: [
      {
        question: "What is included in the digital version?",
        answer:
          "Digital orders include the final board PDF and PNG, printable card sheets, and the rules PDF. These are prepared after payment and made available through the confirmation flow.",
      },
      {
        question: "What is included in the boxed version?",
        answer:
          "Boxed orders include the custom board, personalized cards, the rules booklet, and the stock game pieces required for that format, all packed as one giftable product.",
      },
      {
        question: "Do I see shipping before I pay?",
        answer:
          "Yes. Boxed orders collect the shipping address before checkout so the app can show live shipping options and timing before payment.",
      },
    ],
  },
  {
    title: "Ordering and support",
    items: [
      {
        question: "Do I need an account?",
        answer:
          "No. Launch checkout is guest-only. You can return to your order through the confirmation email or the guest order lookup page.",
      },
      {
        question: "How long does a boxed order take?",
        answer:
          "Each format has its own production window, and the proof page shows the expected timing before checkout. Shipping speed depends on the carrier option you select.",
      },
      {
        question: "What if I need help after ordering?",
        answer:
          "Support is handled by email during the launch period so questions stay personal and easy to track. Include your order number if you already checked out.",
      },
    ],
  },
] as const;

export default function FaqPage() {
  return (
    <ContentPage
      eyebrow="FAQ"
      title="Questions customers ask before they order"
      intro="The launch is designed to feel straightforward: guided customization, proof before checkout, and a clean path into digital delivery or a boxed physical gift."
    >
      <div className="space-y-10">
        {FAQ_SECTIONS.map((section) => (
          <section key={section.title}>
            <div className="spec-label">{section.title}</div>
            <div className="mt-5 space-y-4">
              {section.items.map((item) => (
                <div
                  key={item.question}
                  className="rounded-[1.6rem] border border-[var(--line)] bg-white px-5 py-5"
                >
                  <h2 className="heading-display text-2xl font-semibold text-stone-950">
                    {item.question}
                  </h2>
                  <p className="mt-3 text-sm leading-7 text-stone-600">{item.answer}</p>
                </div>
              ))}
            </div>
          </section>
        ))}
      </div>
    </ContentPage>
  );
}
