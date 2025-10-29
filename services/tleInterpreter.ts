import type { TLE, OrbitalParameters } from '../types';

declare const satellite: any;

const WGS84_EARTH_RADIUS_KM = 6378.137;

export const interpretTle = (tle: TLE): OrbitalParameters => {
    const satrec = satellite.twoline2satrec(tle.line1, tle.line2);

    if (!satrec) {
        throw new Error("Invalid TLE data provided.");
    }
    
    // The mean motion is in radians per minute.
    // Convert to revolutions per day.
    const meanMotionRevsPerDay = satrec.no_kozai * (1440 / (2 * Math.PI));

    // The period is the time for one revolution.
    const periodMinutes = (2 * Math.PI) / satrec.no_kozai;

    // satrec.a is semi-major axis in Earth radii.
    const semiMajorAxisKm = satrec.a * WGS84_EARTH_RADIUS_KM;
    
    // Altitude = distance from center of Earth - Earth's radius
    const apogeeKm = (semiMajorAxisKm * (1 + satrec.ecco)) - WGS84_EARTH_RADIUS_KM;
    const perigeeKm = (semiMajorAxisKm * (1 - satrec.ecco)) - WGS84_EARTH_RADIUS_KM;
    
    // satellite.invjday converts Julian date to a JS Date object.
    const epochDate = satellite.invjday(satrec.epoch);

    // Calculate position at epoch
    const positionAndVelocityAtEpoch = satellite.propagate(satrec, epochDate);
    const gmstAtEpoch = satellite.gstime(epochDate);

    let epochLat, epochLng, epochAlt;
    if (positionAndVelocityAtEpoch.position) {
        const geodetic = satellite.eciToGeodetic(positionAndVelocityAtEpoch.position, gmstAtEpoch);
        epochLat = satellite.radiansToDegrees(geodetic.latitude);
        epochLng = satellite.radiansToDegrees(geodetic.longitude);
        epochAlt = geodetic.height;
    }

    return {
        inclination: satellite.radiansToDegrees(satrec.inclo),
        raan: satellite.radiansToDegrees(satrec.nodeo),
        eccentricity: satrec.ecco,
        argOfPerigee: satellite.radiansToDegrees(satrec.argpo),
        meanAnomaly: satellite.radiansToDegrees(satrec.mo),
        meanMotion: meanMotionRevsPerDay,
        revNumberAtEpoch: satrec.revnum,
        epoch: epochDate,
        apogee: apogeeKm,
        perigee: perigeeKm,
        period: periodMinutes,
        epochLat,
        epochLng,
        epochAlt,
    };
};