import { NextRequest, NextResponse } from 'next/server';
import {
  HistoricalDailyRecord,
  HistoricalApiResponse,
  ClimateRiskIndicators,
  ClimateTimelineEvent,
  SeasonalAggregate,
} from '@/lib/climateTypes';
import {
  aggregateYearly,
  aggregateMonthly,
  calculateIndianSeasons,
  calculateClimateRisk,
  detectHistoricalExtremes,
} from '@/lib/climateEngine';

export const dynamic = 'force-dynamic';

// Server-side in-memory cache with 1-hour TTL
interface CacheEntry {
  data: any;
  timestamp: number;
}
const cache = new Map<string, CacheEntry>();
const CACHE_TTL_MS = 60 * 60 * 1000; // 1 hour

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const latStr = searchParams.get('lat') || '28.6214';
    const lonStr = searchParams.get('lon') || '77.2148';
    const name = searchParams.get('name') || 'New Delhi';
    const country = searchParams.get('country') || 'India';
    const timezone = searchParams.get('timezone') || 'Asia/Kolkata';

    const currentYear = new Date().getFullYear();
    const startYear = Math.max(
      1980,
      Math.min(parseInt(searchParams.get('startYear') || '2000', 10), currentYear)
    );
    const endYear = Math.max(
      startYear,
      Math.min(parseInt(searchParams.get('endYear') || `${currentYear}`, 10), currentYear)
    );

    const lat = parseFloat(latStr);
    const lon = parseFloat(lonStr);

    if (isNaN(lat) || isNaN(lon)) {
      return NextResponse.json({ error: 'Invalid coordinates' }, { status: 400 });
    }

    const cacheKey = `${lat.toFixed(3)}_${lon.toFixed(3)}_${startYear}_${endYear}`;
    const cached = cache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
      return NextResponse.json({
        ...cached.data,
        cachedAt: new Date(cached.timestamp).toLocaleTimeString(),
      });
    }

    // Format dates for Open-Meteo Archive API
    const startDate = `${startYear}-01-01`;

    // The archive API has data up to ~2-3 days ago.
    const now = new Date();
    const safeRecentDate = new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000);
    const safeRecentStr = safeRecentDate.toISOString().split('T')[0];

    let endDate = `${endYear}-12-31`;
    if (endYear >= currentYear) {
      endDate = safeRecentStr;
    }

    const openMeteoUrl = new URL('https://archive-api.open-meteo.com/v1/archive');
    openMeteoUrl.searchParams.set('latitude', lat.toString());
    openMeteoUrl.searchParams.set('longitude', lon.toString());
    openMeteoUrl.searchParams.set('start_date', startDate);
    openMeteoUrl.searchParams.set('end_date', endDate);
    openMeteoUrl.searchParams.set(
      'daily',
      'temperature_2m_max,temperature_2m_min,temperature_2m_mean,apparent_temperature_max,apparent_temperature_min,precipitation_sum,wind_speed_10m_max,relative_humidity_2m_mean'
    );
    openMeteoUrl.searchParams.set('timezone', timezone);

    const res = await fetch(openMeteoUrl.toString(), {
      next: { revalidate: 3600 },
    });

    if (!res.ok) {
      const errText = await res.text();
      console.error('Open-Meteo Archive API Error:', res.status, errText);
      return NextResponse.json(
        {
          error: 'Historical climate data is currently unavailable from Open-Meteo archive.',
          details: errText,
          status: res.status,
        },
        { status: 502 }
      );
    }

    const json = await res.json();
    const daily = json.daily;

    if (!daily || !daily.time || daily.time.length === 0) {
      return NextResponse.json(
        {
          location: { name, country, latitude: lat, longitude: lon },
          period: { startYear, endYear },
          dailyCount: 0,
          yearlyAggregates: [],
          monthlyAggregates: [],
          currentOverview: {
            avgTemp: 0,
            annualRainfall: 0,
            hotDays: 0,
            rainyDays: 0,
            tempAnomaly: 0,
            avgWindSpeed: 0,
          },
          dataAvailable: false,
        },
        { status: 200 }
      );
    }

    // Convert parallel arrays to daily record objects
    const records: HistoricalDailyRecord[] = [];
    const len = daily.time.length;

    for (let i = 0; i < len; i++) {
      records.push({
        date: daily.time[i],
        tempMax: daily.temperature_2m_max?.[i] ?? 0,
        tempMin: daily.temperature_2m_min?.[i] ?? 0,
        tempMean: daily.temperature_2m_mean?.[i] ?? 0,
        apparentTempMax: daily.apparent_temperature_max?.[i],
        apparentTempMin: daily.apparent_temperature_min?.[i],
        precipitation: daily.precipitation_sum?.[i] ?? 0,
        windSpeedMax: daily.wind_speed_10m_max?.[i] ?? 0,
        relativeHumidityMean: daily.relative_humidity_2m_mean?.[i],
      });
    }

    // Process aggregations
    const yearlyAggregates = aggregateYearly(records);
    const monthlyAggregates = aggregateMonthly(records);
    const seasons = calculateIndianSeasons(records);
    const riskIndicators = calculateClimateRisk(yearlyAggregates);
    const timelineEvents = detectHistoricalExtremes(records);

    // Compute overview statistics (most recent completed full year or overall mean)
    const recentYear = yearlyAggregates[yearlyAggregates.length - 1] || {
      avgTemp: 0,
      totalPrecipitation: 0,
      hotDays: 0,
      rainyDays: 0,
      avgWindSpeed: 0,
    };

    const overallAvgTemp =
      yearlyAggregates.length > 0
        ? yearlyAggregates.reduce((s, y) => s + y.avgTemp, 0) / yearlyAggregates.length
        : 0;

    const tempAnomaly =
      yearlyAggregates.length > 0
        ? Number((recentYear.avgTemp - overallAvgTemp).toFixed(1))
        : 0;

    const responsePayload = {
      location: {
        name,
        country,
        latitude: lat,
        longitude: lon,
        elevation: json.elevation,
      },
      period: { startYear, endYear },
      dailyCount: records.length,
      yearlyAggregates,
      monthlyAggregates,
      seasons,
      riskIndicators,
      timelineEvents,
      currentOverview: {
        avgTemp: Number(recentYear.avgTemp.toFixed(1)),
        annualRainfall: recentYear.totalPrecipitation,
        hotDays: recentYear.hotDays,
        rainyDays: recentYear.rainyDays,
        tempAnomaly,
        avgWindSpeed: recentYear.avgWindSpeed,
      },
      dataAvailable: true,
      source: 'Open-Meteo Historical Weather API (ECMWF ERA5 Reanalysis)',
    };

    cache.set(cacheKey, { data: responsePayload, timestamp: Date.now() });

    return NextResponse.json(responsePayload);
  } catch (err: any) {
    console.error('Server error in /api/climate/historical:', err);
    return NextResponse.json(
      { error: 'Failed to process historical climate request', message: err.message },
      { status: 500 }
    );
  }
}
