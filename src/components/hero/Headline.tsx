/** Shared markup so the magnified copy behind the water wraps identically. */
export function HeadlineText() {
  return (
    <>
      one less <br className="md:hidden" />
      thing <br className="hidden md:block" />
      to <br className="md:hidden" />
      worry about.
    </>
  );
}
