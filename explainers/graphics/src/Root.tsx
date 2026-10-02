import React from "react";
import { Composition } from "remotion";
import { Overlay, OverlayProps } from "./Overlay";
import { InitTerminal, Workflow } from "./FullFrame";
import { FPS } from "./theme";

export const Root: React.FC = () => (
  <>
    <Composition id="Overlay" component={Overlay as any} width={1920} height={1080} fps={FPS} durationInFrames={FPS * 3}
      defaultProps={{ kind: "end", seconds: 3 } as OverlayProps}
      calculateMetadata={({ props }) => ({ durationInFrames: Math.round((props as OverlayProps).seconds * FPS) })} />
    <Composition id="Workflow" component={Workflow as any} width={1920} height={1080} fps={FPS} durationInFrames={FPS * 5}
      defaultProps={{ seconds: 5, stepTimes: [0.3, 0.9, 1.5, 2.1, 2.7, 3.3, 3.9] }}
      calculateMetadata={({ props }) => ({ durationInFrames: Math.round((props as any).seconds * FPS) })} />
    <Composition id="InitTerminal" component={InitTerminal} width={1920} height={1080} fps={FPS} durationInFrames={FPS * 5} />
  </>
);
