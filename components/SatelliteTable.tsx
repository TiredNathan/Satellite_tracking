import React, { useState, useMemo } from 'react';
import type { Satellite } from '../types';
import { RefreshIcon } from './icons';

interface SatelliteTableProps {
    satellites: Satellite[];
    onToggleSelect: (satellite: Satellite) => void;
    onShowDetails: (satellite: Satellite) => void;
    selectedSatellites: Satellite[];
    activeSatelliteDetail: Satellite | null;
    isLoading: boolean;
    error: string | null;
}

const SatelliteTable: React.FC<SatelliteTableProps> = ({
    satellites,
    onToggleSelect,
    onShowDetails,
    selectedSatellites,
    activeSatelliteDetail,
    isLoading,
    error,
}) => {
    const [filter, setFilter] = useState('');
    const [sortBy, setSortBy] = useState<{ key: keyof Satellite | 'inclination' | 'period', direction: 'asc' | 'desc' }>({ key: 'name', direction: 'asc' });

    const filteredAndSortedSatellites = useMemo(() => {
        let filtered = satellites.filter(s =>
            s.name.toLowerCase().includes(filter.toLowerCase()) ||
            s.noradCatId.includes(filter)
        );

        return filtered.sort((a, b) => {
            let valA: any;
            let valB: any;

            if (sortBy.key === 'inclination' || sortBy.key === 'period') {
                valA = a.orbitalParams?.[sortBy.key];
                valB = b.orbitalParams?.[sortBy.key];
            } else {
                valA = a[sortBy.key as keyof Satellite];
                valB = b[sortBy.key as keyof Satellite];
            }

            if (valA === undefined || valB === undefined) return 0;

            if (valA < valB) return sortBy.direction === 'asc' ? -1 : 1;
            if (valA > valB) return sortBy.direction === 'asc' ? 1 : -1;
            return 0;
        });
    }, [satellites, filter, sortBy]);

    const handleSort = (key: keyof Satellite | 'inclination' | 'period') => {
        setSortBy(prev => ({
            key,
            direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc'
        }));
    };
    
    const renderSortArrow = (key: keyof Satellite | 'inclination' | 'period') => {
        if (sortBy.key !== key) return null;
        return sortBy.direction === 'asc' ? '▲' : '▼';
    }

    return (
        <div className="bg-gray-800/50 p-6 rounded-lg shadow-lg border border-cyan-500/20">
            <h2 className="text-xl font-semibold mb-4 text-cyan-400">Active Satellites</h2>
            <input
                type="text"
                placeholder="Filter by name or NORAD ID..."
                value={filter}
                onChange={e => setFilter(e.target.value)}
                className="w-full bg-gray-900 border border-gray-600 rounded-md p-2 mb-4 focus:ring-cyan-500 focus:border-cyan-500"
            />
            <div className="overflow-auto max-h-[600px]">
                <table className="w-full text-sm text-left text-gray-400">
                    <thead className="text-xs text-cyan-400 uppercase bg-gray-900/50 sticky top-0">
                        <tr>
                            <th scope="col" className="px-4 py-3"><span className="sr-only">Select</span></th>
                            <th scope="col" className="px-6 py-3 cursor-pointer" onClick={() => handleSort('name')}>Name {renderSortArrow('name')}</th>
                            <th scope="col" className="px-6 py-3 cursor-pointer" onClick={() => handleSort('noradCatId')}>NORAD ID {renderSortArrow('noradCatId')}</th>
                            <th scope="col" className="px-6 py-3 cursor-pointer" onClick={() => handleSort('inclination')}>Inclination {renderSortArrow('inclination')}</th>
                            <th scope="col" className="px-6 py-3 cursor-pointer" onClick={() => handleSort('period')}>Period (min) {renderSortArrow('period')}</th>
                        </tr>
                    </thead>
                    <tbody>
                        {isLoading ? (
                            <tr>
                                <td colSpan={5} className="text-center py-8">
                                    <div className="flex justify-center items-center gap-2">
                                        <RefreshIcon className="animate-spin" />
                                        <span>Loading satellite data...</span>
                                    </div>
                                </td>
                            </tr>
                        ) : error ? (
                             <tr>
                                <td colSpan={5} className="text-center py-8 text-red-400">{error}</td>
                            </tr>
                        ) : filteredAndSortedSatellites.map(sat => {
                            const isSelected = selectedSatellites.some(s => s.noradCatId === sat.noradCatId);
                            const isActive = activeSatelliteDetail?.noradCatId === sat.noradCatId;
                            return (
                                <tr
                                    key={sat.noradCatId}
                                    onClick={() => onShowDetails(sat)}
                                    className={`border-b border-gray-700 hover:bg-gray-700/50 cursor-pointer transition-colors 
                                        ${isActive ? 'bg-cyan-900/50' : ''} 
                                        ${isSelected && !isActive ? 'bg-gray-700/70' : ''}`}
                                >
                                    <td className="px-4 py-4">
                                        <input
                                            type="checkbox"
                                            checked={isSelected}
                                            onChange={(e) => {
                                                e.stopPropagation();
                                                onToggleSelect(sat);
                                            }}
                                            onClick={(e) => e.stopPropagation()}
                                            className="h-4 w-4 rounded bg-gray-900 border-gray-600 text-cyan-600 focus:ring-cyan-500"
                                            aria-label={`Select ${sat.name}`}
                                        />
                                    </td>
                                    <th scope="row" className="px-6 py-4 font-medium text-white whitespace-nowrap">{sat.name}</th>
                                    <td className="px-6 py-4">{sat.noradCatId}</td>
                                    <td className="px-6 py-4">{sat.orbitalParams?.inclination.toFixed(2)}°</td>
                                    <td className="px-6 py-4">{sat.orbitalParams?.period.toFixed(2)}</td>
                                </tr>
                            )
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default SatelliteTable;
