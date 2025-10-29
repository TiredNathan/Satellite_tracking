// TLE represents the two-line element set for a satellite.
export interface TLE {
    line1: string;
    line2: string;
}

// OrbitalParameters describe the orbit of a satellite.
export interface OrbitalParameters {
    inclination: number;
    raan: number;
    eccentricity: number;
    argOfPerigee: number;
    meanAnomaly: number;
    meanMotion: number;
    revNumberAtEpoch: number;
    epoch: Date;
    apogee: number;
    perigee: number;
    period: number;
    epochLat?: number;
    epochLng?: number;
    epochAlt?: number;
}

// Satellite represents a single satellite object.
export interface Satellite extends TLE {
    name: string;
    noradCatId: string;
    orbitalParams?: OrbitalParameters;
}

// GroundStation represents the observer's location on Earth.
export interface GroundStation {
    latitude: number;
    longitude: number;
    altitude: number;
}

// SatellitePass describes a single pass of a satellite over a ground station.
export interface SatellitePass {
    aos: Date;
    los: Date;
    durationSeconds: number;
    maxElevation: number;
    aosLat: number;
    aosLng: number;
    losLat: number;
    losLng: number;
    satelliteName: string;
    satelliteNoradId: string;
}
