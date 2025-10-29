import React from 'react';
import type { Satellite, OrbitalParameters } from '../types';
import { formatDateTime, formatCoordinate } from '../utils/time';

interface SatelliteDetailsProps {
    satellite: Satellite;
    orbitalParams: OrbitalParameters;
}

const DetailItem: React.FC<{ label: string; value: string | number; unit?: string }> = ({ label, value, unit }) => (
    <div className="flex justify-between items-baseline py-2 border-b border-gray-700/50">
        <span className="text-gray-400">{label}</span>
        <span className="font-mono text-cyan-300">
            {typeof value === 'number' ? value.toFixed(4) : value}
            {unit && <span className="text-gray-500 ml-1">{unit}</span>}
        </span>
    </div>
);

const CoordinateDetailItem: React.FC<{ label: string; lat?: number; lng?: number; alt?: number }> = ({ label, lat, lng, alt }) => {
    if (lat === undefined || lng === undefined || alt === undefined) return null;
    return (
        <div className="flex justify-between items-start py-2 border-b border-gray-700/50">
            <span className="text-gray-400 pt-1">{label}</span>
            <div className="text-right">
                <div className="font-mono text-cyan-300">
                    {formatCoordinate(lat, 'lat')}, {formatCoordinate(lng, 'lng')}
                </div>
                <div className="font-mono text-cyan-300">
                    {alt.toFixed(2)}
                    <span className="text-gray-500 ml-1">km</span>
                </div>
            </div>
        </div>
    );
};


const SatelliteDetails: React.FC<SatelliteDetailsProps> = ({ satellite, orbitalParams }) => {
    return (
        <div className="bg-gray-800/50 p-6 rounded-lg shadow-lg border border-cyan-500/20 h-fit">
            <h2 className="text-xl font-semibold mb-4 text-cyan-400">Orbital Parameters for {satellite.name}</h2>
            <div className="space-y-1 text-sm">
                <DetailItem label="Epoch (UTC)" value={formatDateTime(orbitalParams.epoch)} />
                <CoordinateDetailItem 
                    label="Position at Epoch"
                    lat={orbitalParams.epochLat}
                    lng={orbitalParams.epochLng}
                    alt={orbitalParams.epochAlt}
                />
                <DetailItem label="Inclination" value={orbitalParams.inclination} unit="°" />
                <DetailItem label="RAAN" value={orbitalParams.raan} unit="°" />
                <DetailItem label="Eccentricity" value={orbitalParams.eccentricity} />
                <DetailItem label="Argument of Perigee" value={orbitalParams.argOfPerigee} unit="°" />
                <DetailItem label="Mean Anomaly" value={orbitalParams.meanAnomaly} unit="°" />
                <DetailItem label="Mean Motion" value={orbitalParams.meanMotion} unit="revs/day" />
                <DetailItem label="Period" value={orbitalParams.period} unit="min" />
                <DetailItem label="Apogee Altitude" value={orbitalParams.apogee} unit="km" />
                <DetailItem label="Perigee Altitude" value={orbitalParams.perigee} unit="km" />
                <DetailItem label="Revs at Epoch" value={orbitalParams.revNumberAtEpoch} />
            </div>
        </div>
    );
};

export default SatelliteDetails;