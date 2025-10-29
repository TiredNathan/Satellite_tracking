import React, { useState, useEffect } from 'react';
import type { GroundStation } from '../types';
import { LocationMarkerIcon, RefreshIcon } from './icons';

interface GroundStationFormProps {
    onUpdate: (groundStation: GroundStation) => void;
    onDateRangeChange: (start: Date, end: Date) => void;
}

// Helper to format a Date object to a string suitable for datetime-local input
const formatDateForInput = (date: Date): string => {
    const pad = (num: number) => num.toString().padStart(2, '0');
    const year = date.getFullYear();
    const month = pad(date.getMonth() + 1);
    const day = pad(date.getDate());
    const hours = pad(date.getHours());
    const minutes = pad(date.getMinutes());
    return `${year}-${month}-${day}T${hours}:${minutes}`;
};

const GroundStationForm: React.FC<GroundStationFormProps> = ({ onUpdate, onDateRangeChange }) => {
    const [latitude, setLatitude] = useState<string>('40.7128');
    const [longitude, setLongitude] = useState<string>('-74.0060');
    const [altitude, setAltitude] = useState<string>('0.1');
    const [startDate, setStartDate] = useState<string>(formatDateForInput(new Date()));
    const [endDate, setEndDate] = useState<string>(formatDateForInput(new Date(Date.now() + 2 * 24 * 60 * 60 * 1000)));
    const [isLocating, setIsLocating] = useState<boolean>(false);
    const [error, setError] = useState<string>('');

    const handleUpdate = () => {
        const lat = parseFloat(latitude);
        const lon = parseFloat(longitude);
        const alt = parseFloat(altitude);
        const start = new Date(startDate);
        const end = new Date(endDate);

        if (isNaN(lat) || isNaN(lon) || isNaN(alt)) {
            setError('Please enter valid numbers for all fields.');
            return;
        }
        if (isNaN(start.getTime()) || isNaN(end.getTime())) {
            setError('Please enter valid dates.');
            return;
        }
        if (start >= end) {
            setError('Start date must be before end date.');
            return;
        }
        if (lat < -90 || lat > 90) {
            setError('Latitude must be between -90 and 90.');
            return;
        }
        if (lon < -180 || lon > 180) {
            setError('Longitude must be between -180 and 180.');
            return;
        }
        setError('');
        onUpdate({ latitude: lat, longitude: lon, altitude: alt });
        onDateRangeChange(start, end);
    };
    
    useEffect(() => {
        // Automatically update on initial load with default values
        handleUpdate();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const handleUseMyLocation = () => {
        setIsLocating(true);
        setError('');
        navigator.geolocation.getCurrentPosition(
            (position) => {
                const { latitude, longitude, altitude } = position.coords;
                setLatitude(latitude.toFixed(6));
                setLongitude(longitude.toFixed(6));
                setAltitude((altitude || 0.1).toFixed(2)); // Altitude from browser can be null
                
                // When location is used, trigger a full update
                const start = new Date(startDate);
                const end = new Date(endDate);
                onUpdate({ 
                    latitude: position.coords.latitude, 
                    longitude: position.coords.longitude, 
                    altitude: position.coords.altitude || 0.1 
                });
                if (start < end) {
                    onDateRangeChange(start, end);
                }
                setIsLocating(false);
            },
            (err) => {
                setError(`Could not get location: ${err.message}`);
                setIsLocating(false);
            },
            { enableHighAccuracy: true }
        );
    };

    return (
        <div className="bg-gray-800/50 p-6 rounded-lg shadow-lg border border-cyan-500/20">
            <h2 className="text-xl font-semibold mb-4 text-cyan-400">Ground Station & Time Range</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                <div>
                    <label htmlFor="latitude" className="block text-sm font-medium text-gray-400 mb-1">Latitude (°)</label>
                    <input
                        type="number"
                        id="latitude"
                        value={latitude}
                        onChange={(e) => setLatitude(e.target.value)}
                        className="w-full bg-gray-900 border border-gray-600 rounded-md p-2 focus:ring-cyan-500 focus:border-cyan-500"
                        placeholder="e.g., 40.7128"
                    />
                </div>
                <div>
                    <label htmlFor="longitude" className="block text-sm font-medium text-gray-400 mb-1">Longitude (°)</label>
                    <input
                        type="number"
                        id="longitude"
                        value={longitude}
                        onChange={(e) => setLongitude(e.target.value)}
                        className="w-full bg-gray-900 border border-gray-600 rounded-md p-2 focus:ring-cyan-500 focus:border-cyan-500"
                        placeholder="e.g., -74.0060"
                    />
                </div>
                <div>
                    <label htmlFor="altitude" className="block text-sm font-medium text-gray-400 mb-1">Altitude (km)</label>
                    <input
                        type="number"
                        id="altitude"
                        value={altitude}
                        onChange={(e) => setAltitude(e.target.value)}
                        className="w-full bg-gray-900 border border-gray-600 rounded-md p-2 focus:ring-cyan-500 focus:border-cyan-500"
                        placeholder="e.g., 0.1"
                    />
                </div>
                <div>
                    <label htmlFor="startDate" className="block text-sm font-medium text-gray-400 mb-1">Start Date & Time</label>
                    <input
                        type="datetime-local"
                        id="startDate"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                        className="w-full bg-gray-900 border border-gray-600 rounded-md p-2 focus:ring-cyan-500 focus:border-cyan-500"
                    />
                </div>
                <div>
                    <label htmlFor="endDate" className="block text-sm font-medium text-gray-400 mb-1">End Date & Time</label>
                    <input
                        type="datetime-local"
                        id="endDate"
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                        className="w-full bg-gray-900 border border-gray-600 rounded-md p-2 focus:ring-cyan-500 focus:border-cyan-500"
                    />
                </div>
            </div>
            {error && <p className="text-red-400 mt-3 text-sm">{error}</p>}
            <div className="mt-4 flex flex-wrap items-center gap-4">
                <button
                    onClick={handleUpdate}
                    className="flex items-center justify-center gap-2 bg-cyan-600 hover:bg-cyan-500 text-white font-bold py-2 px-4 rounded-md transition-colors duration-300"
                >
                    <RefreshIcon />
                    Update & Calculate Passes
                </button>
                <button
                    onClick={handleUseMyLocation}
                    disabled={isLocating}
                    className="flex items-center justify-center gap-2 bg-gray-700 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded-md transition-colors duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    <LocationMarkerIcon />
                    {isLocating ? 'Locating...' : 'Use My Location'}
                </button>
            </div>
        </div>
    );
};

export default GroundStationForm;