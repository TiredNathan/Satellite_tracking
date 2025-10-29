import React, { useState } from 'react';
import type { SatellitePass } from '../types';
import { formatDateTime, formatDuration, formatCoordinate } from '../utils/time';
import { BellIcon, CheckCircleIcon } from './icons';
import { useNotifications } from '../hooks/useNotifications';

interface PassesDisplayProps {
    passes: SatellitePass[] | null;
    isLoading: boolean;
    error: string | null;
    selectedSatellitesCount: number;
}

const PassesDisplay: React.FC<PassesDisplayProps> = ({ passes, isLoading, error, selectedSatellitesCount }) => {
    const { permission, requestPermission, scheduleNotification } = useNotifications();
    const [scheduledNotifications, setScheduledNotifications] = useState<Record<string, boolean>>({});
    
    const handleScheduleNotification = (pass: SatellitePass) => {
        const key = `${pass.satelliteNoradId}-${pass.aos.getTime()}`;
        if (scheduledNotifications[key]) return; // Already scheduled

        const fiveMinutes = 5 * 60 * 1000;
        const timeoutId = scheduleNotification(
            pass.aos,
            `${pass.satelliteName} Pass Starting`,
            `AOS in 5 minutes at ${formatDateTime(pass.aos)}. Max elevation: ${pass.maxElevation.toFixed(1)}°.`,
            fiveMinutes
        );

        if (timeoutId) {
            setScheduledNotifications(prev => ({ ...prev, [key]: true }));
        }
    };
    
    const renderContent = () => {
        if (isLoading) {
            return <p className="text-center py-8">Calculating passes...</p>;
        }
        if (error) {
            return <p className="text-center py-8 text-red-400">{error}</p>;
        }
        if (selectedSatellitesCount === 0) {
            return <p className="text-center py-8 text-gray-500">Select one or more satellites to see upcoming passes.</p>;
        }
        if (!passes || passes.length === 0) {
            return <p className="text-center py-8">No passes found for the selected satellites in the specified time range.</p>;
        }
        return (
            <ul className="space-y-4">
                {passes.map((pass) => {
                    const key = `${pass.satelliteNoradId}-${pass.aos.getTime()}`;
                    const isScheduled = scheduledNotifications[key];
                    return (
                        <li key={key} className="bg-gray-900/50 p-4 rounded-md border border-gray-700">
                            <div className="flex justify-between items-start">
                                <div>
                                    <p className="font-bold text-lg text-white">{pass.satelliteName}</p>
                                    <p className="text-sm text-gray-400">Max Elevation: <span className="text-cyan-400 font-mono">{pass.maxElevation.toFixed(2)}°</span></p>
                                </div>
                                {permission === 'granted' && (
                                     <button 
                                        onClick={() => handleScheduleNotification(pass)}
                                        disabled={isScheduled}
                                        className="flex items-center gap-1 text-sm bg-gray-700 hover:bg-gray-600 disabled:bg-green-800 disabled:text-green-300 disabled:cursor-not-allowed px-3 py-1 rounded-full transition-colors"
                                        title={isScheduled ? 'Notification scheduled' : 'Notify 5 mins before pass'}
                                    >
                                        {isScheduled ? <CheckCircleIcon /> : <BellIcon />}
                                        {isScheduled ? 'Scheduled' : 'Notify Me'}
                                    </button>
                                )}
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-3 text-sm">
                                <div>
                                    <p className="font-semibold text-green-400">AOS (Rise)</p>
                                    <p className="font-mono">{formatDateTime(pass.aos)}</p>
                                    <p className="font-mono text-gray-500">{formatCoordinate(pass.aosLat, 'lat')}, {formatCoordinate(pass.aosLng, 'lng')}</p>
                                </div>
                                <div>
                                    <p className="font-semibold text-cyan-400">Duration</p>
                                    <p className="font-mono text-2xl">{formatDuration(pass.durationSeconds)}</p>
                                </div>
                                <div>
                                    <p className="font-semibold text-red-400">LOS (Set)</p>
                                    <p className="font-mono">{formatDateTime(pass.los)}</p>
                                     <p className="font-mono text-gray-500">{formatCoordinate(pass.losLat, 'lat')}, {formatCoordinate(pass.losLng, 'lng')}</p>
                                </div>
                            </div>
                        </li>
                    )
                })}
            </ul>
        );
    };

    return (
        <div className="bg-gray-800/50 p-6 rounded-lg shadow-lg border border-cyan-500/20">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold text-cyan-400">
                    Visible Passes
                </h2>
                {permission !== 'granted' && (
                    <button 
                        onClick={requestPermission}
                        className="flex items-center gap-1 text-sm bg-cyan-700 hover:bg-cyan-600 px-3 py-1 rounded-full transition-colors"
                    >
                       <BellIcon /> Enable Notifications
                    </button>
                )}
            </div>
            <div className="overflow-auto max-h-[600px] pr-2">
                {renderContent()}
            </div>
        </div>
    );
};

export default PassesDisplay;