import React, { useState, useEffect, useCallback } from 'react';
import type { Satellite, GroundStation, SatellitePass } from './types';
import { fetchActiveSatellites } from './services/celestrak';
import { calculatePasses } from './services/satelliteCalculator';
import GroundStationForm from './components/GroundStationForm';
import SatelliteTable from './components/SatelliteTable';
import PassesDisplay from './components/PassesDisplay';
import SatelliteDetails from './components/SatelliteDetails';
import { HeaderIcon } from './components/icons';

const App: React.FC = () => {
    const [satellites, setSatellites] = useState<Satellite[]>([]);
    const [isSatellitesLoading, setIsSatellitesLoading] = useState<boolean>(true);
    const [satellitesError, setSatellitesError] = useState<string | null>(null);

    const [selectedSatellites, setSelectedSatellites] = useState<Satellite[]>([]);
    const [activeSatelliteDetail, setActiveSatelliteDetail] = useState<Satellite | null>(null);
    const [groundStation, setGroundStation] = useState<GroundStation | null>(null);
    const [dateRange, setDateRange] = useState<{ start: Date, end: Date } | null>(null);

    const [passes, setPasses] = useState<SatellitePass[] | null>(null);
    const [isCalculating, setIsCalculating] = useState<boolean>(false);

    useEffect(() => {
        const loadSatellites = async () => {
            try {
                setIsSatellitesLoading(true);
                setSatellitesError(null);
                const fetchedSatellites = await fetchActiveSatellites();
                setSatellites(fetchedSatellites);
            } catch (error) {
                console.error("Failed to fetch satellites:", error);
                setSatellitesError("Could not load satellite data. Please check your network connection and try again.");
            } finally {
                setIsSatellitesLoading(false);
            }
        };
        loadSatellites();
    }, []);

    const handleGroundStationUpdate = useCallback((gs: GroundStation) => {
        setGroundStation(gs);
    }, []);

    const handleDateRangeChange = useCallback((start: Date, end: Date) => {
        setDateRange({ start, end });
    }, []);

    const handleToggleSatellite = (satellite: Satellite) => {
        setSelectedSatellites(prev => {
            const isSelected = prev.some(s => s.noradCatId === satellite.noradCatId);
            if (isSelected) {
                return prev.filter(s => s.noradCatId !== satellite.noradCatId);
            } else {
                return [...prev, satellite];
            }
        });
    };

    useEffect(() => {
        if (selectedSatellites.length > 0 && groundStation && dateRange) {
            setIsCalculating(true);
            setPasses(null);
            
            setTimeout(() => {
                try {
                    const allPasses = selectedSatellites.flatMap(sat => 
                        calculatePasses(
                            sat,
                            groundStation,
                            dateRange.start,
                            dateRange.end
                        )
                    );
                    allPasses.sort((a, b) => a.aos.getTime() - b.aos.getTime());
                    setPasses(allPasses);
                } catch (e) {
                    console.error("Error calculating passes", e);
                    setPasses([]); 
                } finally {
                    setIsCalculating(false);
                }
            }, 50);
        } else {
            setPasses([]);
        }
    }, [selectedSatellites, groundStation, dateRange]);

    return (
        <div className="bg-gray-900 text-white min-h-screen font-sans">
            <header className="bg-gray-900/80 backdrop-blur-sm sticky top-0 z-10 border-b border-cyan-500/20">
                <div className="container mx-auto px-4 py-3 flex items-center gap-3">
                    <HeaderIcon />
                    <h1 className="text-2xl font-bold text-cyan-400">Satellite Pass Finder</h1>
                </div>
            </header>
            <main className="container mx-auto p-4 space-y-6">
                <GroundStationForm 
                    onUpdate={handleGroundStationUpdate} 
                    onDateRangeChange={handleDateRangeChange}
                />
                
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2">
                        <SatelliteTable
                            satellites={satellites}
                            onToggleSelect={handleToggleSatellite}
                            onShowDetails={setActiveSatelliteDetail}
                            selectedSatellites={selectedSatellites}
                            activeSatelliteDetail={activeSatelliteDetail}
                            isLoading={isSatellitesLoading}
                            error={satellitesError}
                        />
                    </div>
                    <div className="space-y-6">
                        {activeSatelliteDetail && activeSatelliteDetail.orbitalParams && (
                            <SatelliteDetails 
                                satellite={activeSatelliteDetail} 
                                orbitalParams={activeSatelliteDetail.orbitalParams}
                            />
                        )}
                    </div>
                </div>

                <div>
                    <PassesDisplay
                        passes={passes}
                        isLoading={isCalculating}
                        error={null}
                        selectedSatellitesCount={selectedSatellites.length}
                    />
                </div>
            </main>
             <footer className="text-center p-4 text-gray-500 text-sm">
                <p>Authored by GreatOldNathe.</p>
                <p>Powered by Celestrak TLE data and satellite.js.</p>
            </footer>
        </div>
    );
};

export default App;