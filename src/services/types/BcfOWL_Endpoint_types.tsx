export type SpatialRepresentation_location = {
  x: number;
  y: number;
  z: number;
};

export type SpatialRepresentation_rotation = {
  x: number;
  y: number;
  z: number;
};

export type SpatialRepresentation_scale = {
  x: number;
  y: number;
  z: number;
};

export type SpatialRepresentation = {
  alignment?: string;
  location: SpatialRepresentation_location;
  rotation: SpatialRepresentation_rotation;
  scale: SpatialRepresentation_scale;
};
