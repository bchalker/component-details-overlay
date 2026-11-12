import { Card } from './Card';

/** Why and how to use a component name when talking about the page. */
export function Usage() {
  return (
    <Card title="Usage">
      <div id="usage">
        <p className="prose">
          Every piece of the screen has a name in the code. When you use that name in Slack, a ticket or a
          review, the developer knows exactly what you mean. No screenshot, no guessing, no back and forth.
        </p>
        <p className="prose">
          It also helps product owners, QA testers and other non-technical teammates communicate clearly
          with developers, and gives them a small look at how the screen is built.
        </p>

        <ol className="usage__steps">
          <li>Switch on Component details in the bottom-right corner.</li>
          <li>Find the badge on the thing you mean. The badge is its name.</li>
          <li>
            Alt-click it (Option-click on Mac) to copy the name, then paste it into your message. If it sits
            inside another component, add that first, like <code>Card › Button</code>.
          </li>
        </ol>

        <div className="usage__examples">
          <Card title="Vague">
            <p className="usage__quote">&ldquo;The pill in that table looks off on mobile.&rdquo;</p>
          </Card>
          <Card title="Clear">
            <p className="usage__quote">
              &ldquo;<code>Table › StatusBadge</code> is cut off at 320px on /customers.&rdquo;
            </p>
          </Card>
        </div>

        <p className="prose">
          No badge on something? It is untagged, so say that: &ldquo;the banner on /customers is
          untagged.&rdquo; A developer will know to look at it.
        </p>
      </div>
    </Card>
  );
}
