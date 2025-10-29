import type { Satellite, GroundStation, SatellitePass } from '../types';

// This tells TypeScript that `satellite` is a global variable
// provided by the script tag in index.html.
declare const satellite: any;

export const calculatePasses = (
    sat: Satellite,
    groundStation: GroundStation,
    startDate: Date,
    endDate: Date
): SatellitePass[] => {
    const satrec = satellite.twoline2satrec(sat.line1, sat.line2);
    const observerGd = {
        longitude: satellite.degreesToRadians(groundStation.longitude),
        latitude: satellite.degreesToRadians(groundStation.latitude),
        height: groundStation.altitude
    };

    const passes: SatellitePass[] = [];
    const timeStep = 30 * 1000; // 30 seconds
    
    let wasVisible = false;
    let currentPass: Partial<Omit<SatellitePass, 'satelliteName' | 'satelliteNoradId'>> = {};

    for (let time = startDate.getTime(); time < endDate.getTime(); time += timeStep) {
        const currentDate = new Date(time);
        
        const positionAndVelocity = satellite.propagate(satrec, currentDate);
        const gmst = satellite.gstime(currentDate);
        
        if (!positionAndVelocity.position || !positionAndVelocity.velocity) {
            continue; // Satellite data is stale, cannot propagate
        }
        
        const positionEcf = satellite.eciToEcf(positionAndVelocity.position, gmst);
        
        const lookAngles = satellite.ecfToLookAngles(observerGd, positionEcf);
        const elevation = satellite.radiansToDegrees(lookAngles.elevation);

        const isVisible = elevation > 0;

        if (isVisible && !wasVisible) { // Satellite rises (AOS)
            const geodetic = satellite.eciToGeodetic(positionAndVelocity.position, gmst);
            currentPass = { 
                aos: currentDate, 
                maxElevation: elevation,
                aosLat: satellite.radiansToDegrees(geodetic.latitude),
                aosLng: satellite.radiansToDegrees(geodetic.longitude),
            };
        } else if (!isVisible && wasVisible) { // Satellite sets (LOS)
            const geodetic = satellite.eciToGeodetic(positionAndVelocity.position, gmst);
            currentPass.los = currentDate;
            currentPass.losLat = satellite.radiansToDegrees(geodetic.latitude);
            currentPass.losLng = satellite.radiansToDegrees(geodetic.longitude);
            if (currentPass.aos) {
                currentPass.durationSeconds = (currentPass.los.getTime() - currentPass.aos.getTime()) / 1000;
                if (currentPass.durationSeconds > 60) { // Filter out very short passes
                    const completePass: SatellitePass = {
                        ...(currentPass as Required<typeof currentPass>),
                        satelliteName: sat.name,
                        satelliteNoradId: sat.noradCatId,
                    };
                    passes.push(completePass);
                }
            }
            currentPass = {};
        }

        if (isVisible && currentPass.maxElevation) {
            if (elevation > currentPass.maxElevation) {
                currentPass.maxElevation = elevation;
            }
        }

        wasVisible = isVisible;
    }
    
    return passes;
};
