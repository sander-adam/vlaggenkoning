declare module "react-simple-maps" {
  import { ComponentType, ReactNode } from "react";

  interface ComposableMapProps {
    projectionConfig?: {
      rotate?: [number, number, number];
      scale?: number;
      center?: [number, number];
    };
    projection?: string;
    className?: string;
    children?: ReactNode;
  }

  interface ZoomableGroupProps {
    center?: [number, number];
    zoom?: number;
    minZoom?: number;
    maxZoom?: number;
    children?: ReactNode;
  }

  interface GeographiesProps {
    geography: string | object;
    children: (data: { geographies: Array<GeographyObject> }) => ReactNode;
  }

  interface GeographyObject {
    rsmKey: string;
    id: string;
    properties: Record<string, unknown>;
    geometry: object;
  }

  interface GeographyProps {
    geography: GeographyObject;
    key?: string;
    fill?: string;
    stroke?: string;
    strokeWidth?: number;
    onClick?: () => void;
    onMouseEnter?: () => void;
    onMouseLeave?: () => void;
    style?: {
      default?: Record<string, string>;
      hover?: Record<string, string>;
      pressed?: Record<string, string>;
    };
  }

  export const ComposableMap: ComponentType<ComposableMapProps>;
  export const ZoomableGroup: ComponentType<ZoomableGroupProps>;
  export const Geographies: ComponentType<GeographiesProps>;
  export const Geography: ComponentType<GeographyProps>;
}
