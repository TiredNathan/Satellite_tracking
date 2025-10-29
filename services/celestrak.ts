import type { Satellite } from '../types';
import { interpretTle } from './tleInterpreter';

const TLE_URL = 'https://corsproxy.io/?https://celestrak.com/NORAD/elements/gp.php?GROUP=active&FORMAT=tle';

export const fetchActiveSatellites = async (): Promise<Satellite[]> => {
    const response = await fetch(TLE_URL);
    if (!response.ok) {
        throw new Error(`Failed to fetch TLE data: ${response.statusText}`);
    }
    const tleData = await response.text();
    return parseTleData(tleData);
};

const parseTleData = (tleData: string): Satellite[] => {
    const lines = tleData.trim().split('\n');
    const satellites: Satellite[] = [];

    for (let i = 0; i < lines.length; i += 3) {
        if (i + 2 >= lines.length) continue;

        const name = lines[i].trim();
        const line1 = lines[i + 1].trim();
        const line2 = lines[i + 2].trim();

        if (name && line1.startsWith('1 ') && line2.startsWith('2 ')) {
            const noradCatId = line1.substring(2, 7).trim();
            const satellite: Satellite = {
                name,
                line1,
                line2,
                noradCatId,
            };
            
            try {
                // Pre-calculate orbital params for table display
                satellite.orbitalParams = interpretTle(satellite);
            } catch (e) {
                console.warn(`Could not interpret TLE for ${name} (${noradCatId})`, e);
            }

            satellites.push(satellite);
        }
    }
    return satellites;
};
