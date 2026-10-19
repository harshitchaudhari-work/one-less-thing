"use client";

import { useState } from "react";
import { Glass } from "./Glass";
import { HeadlineText } from "./Headline";
import "./headline-stage.css";

export function HeadlineStage() {
  // Tapping the glass sloshes the water (and the magnified type with it).
  const [sloshes, setSloshes] = useState(0);

  return (
    <div className={`hs-stage${sloshes ? " is-sloshing" : ""}`} key={sloshes}>
      <h1 className="hs-headline">
        <HeadlineText />
      </h1>

      {/* The same headline, magnified, seen through the water */}
      <div className="hs-lens" aria-hidden="true">
        <div className="hs-lens-inner">
          <p className="hs-headline">
            <HeadlineText />
          </p>
        </div>
      </div>

      <Glass
        className="hs-glass"
        waterClassName="hs-water"
        onClick={() => setSloshes((n) => n + 1)}
      />
    </div>
  );
}
