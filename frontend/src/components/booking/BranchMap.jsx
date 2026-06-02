import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import L from 'leaflet';
import { MapContainer, Marker, Popup, TileLayer, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { formatPriceFrom } from '../../data/properties';
import {
  averageMapCenter,
  resolveBranchMapPins,
  resolvePinDisplay,
} from '../../lib/branchMap';
import { buildUrl } from '../../lib/bookingContext';

function branchShortName(name) {
  return name.replace(/^Chi nhánh /, '').replace(/^Cherry House /, '').replace(/^Cherry /, '');
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

/**
 * @param {{ badge: string; info: string; active: boolean }} props
 */
function createBranchMarkerIcon({ badge, info, active }) {
  const infoHtml = info
    ? `<span class="branch-map-marker__info">${escapeHtml(info)}</span>`
    : '';

  return L.divIcon({
    className: 'branch-map-marker',
    html: `<div class="branch-map-marker__bubble${active ? ' branch-map-marker__bubble--active' : ''}">
      <span class="branch-map-marker__price">${escapeHtml(badge)}</span>
      ${infoHtml}
      <span class="branch-map-marker__tail" aria-hidden="true"></span>
    </div>`,
    iconSize: [1, 1],
    iconAnchor: [0, 0],
  });
}

/**
 * @param {{ positions: import('leaflet').LatLngExpression[] }} props
 */
function FitAllMarkers({ positions }) {
  const map = useMap();

  useEffect(() => {
    if (positions.length === 0) return;
    if (positions.length === 1) {
      map.setView(positions[0], 15);
      return;
    }
    map.fitBounds(L.latLngBounds(positions), { padding: [52, 52], maxZoom: 16 });
  }, [map, positions]);

  return null;
}

/**
 * @param {{ position: import('leaflet').LatLngExpression | null; zoom?: number; enabled: boolean }} props
 */
function FlyToBranch({ position, zoom = 15, enabled }) {
  const map = useMap();

  useEffect(() => {
    if (!enabled || !position) return;
    map.flyTo(position, zoom, { duration: 0.45 });
  }, [enabled, map, position, zoom]);

  return null;
}

/**
 * @param {{
 *   property: {
 *     slug: string;
 *     name: string;
 *     city: string;
 *     priceFromVnd: number;
 *     subBranches: Array<{ id: string; name: string; address: string; tagline?: string; priceFromVnd?: number }>;
 *   };
 *   context: import('../../lib/bookingContext').BookingContext;
 *   activeBranchId?: string;
 * }} props
 */
export default function BranchMap({ property, context, activeBranchId }) {
  const entries = useMemo(
    () => resolveBranchMapPins(property.subBranches, property.city),
    [property.subBranches, property.city],
  );

  const mapEntries = useMemo(
    () => entries.filter(({ pin }) => pin.lat && pin.lng),
    [entries],
  );

  const [focusedId, setFocusedId] = useState(
    activeBranchId ?? property.subBranches[0]?.id ?? null,
  );
  const [flyToBranch, setFlyToBranch] = useState(false);

  const focusedEntry = entries.find((e) => e.branch.id === focusedId) ?? entries[0];
  const overviewCenter = useMemo(
    () => averageMapCenter(mapEntries.map((e) => e.pin)),
    [mapEntries],
  );

  const markerPositions = useMemo(
    () => mapEntries.map(({ pin }) => [pin.lat, pin.lng]),
    [mapEntries],
  );

  const flyTarget = useMemo(() => {
    const pin = focusedEntry?.pin;
    if (!pin?.lat || !pin?.lng) return null;
    return [pin.lat, pin.lng];
  }, [focusedEntry]);

  if (entries.length === 0) return null;

  const mapCenter = markerPositions[0] ?? [overviewCenter.lat, overviewCenter.lng];

  return (
    <div className="mt-6 overflow-hidden rounded-xl border border-black/5 bg-surface-container-low/40">
      <div className="border-b border-black/5 bg-white px-4 py-3">
        <p className="font-headline text-sm font-bold text-on-surface">Bản đồ chi nhánh</p>
        <p className="mt-0.5 text-xs text-on-surface-variant">
          Tất cả chi nhánh hiển thị cùng lúc để so sánh vị trí và giá. Tuỳ chỉnh text trên ghim
          bằng <code className="rounded bg-black/5 px-1 text-[11px]">pinBadge</code> /{' '}
          <code className="rounded bg-black/5 px-1 text-[11px]">pinInfo</code> trong{' '}
          <code className="rounded bg-black/5 px-1 text-[11px]">branchMapPins.js</code>
        </p>
      </div>

      <div className="grid lg:grid-cols-[minmax(0,1fr)_minmax(280px,360px)]">
        <div className="relative min-h-[260px] bg-surface-container-high sm:min-h-[360px]">
          {mapEntries.length > 0 ? (
            <MapContainer
              center={mapCenter}
              zoom={overviewCenter.zoom ?? 13}
              className="absolute inset-0 z-0 h-full w-full"
              scrollWheelZoom={false}
            >
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              <FitAllMarkers positions={markerPositions} />
              <FlyToBranch
                position={flyTarget}
                zoom={focusedEntry?.pin?.zoom ?? 15}
                enabled={flyToBranch}
              />
              {mapEntries.map(({ branch, pin }) => {
                const active = branch.id === focusedId;
                const display = resolvePinDisplay(branch, pin, property.priceFromVnd);
                const bookingUrl = buildUrl('/booking', {
                  ...context,
                  property: property.slug,
                  branch: branch.id,
                });

                return (
                  <Marker
                    key={branch.id}
                    position={[pin.lat, pin.lng]}
                    icon={createBranchMarkerIcon({
                      badge: display.badge,
                      info: display.info,
                      active,
                    })}
                    eventHandlers={{
                      click: () => {
                        setFocusedId(branch.id);
                        setFlyToBranch(false);
                      },
                    }}
                  >
                    <Popup>
                      <div className="min-w-[200px] font-body text-sm text-on-surface">
                        <p className="font-headline font-bold">{branchShortName(branch.name)}</p>
                        {pin.label && (
                          <p className="mt-0.5 text-xs text-on-surface-variant">{pin.label}</p>
                        )}
                        <p className="mt-1 text-xs text-on-surface-variant">{branch.address}</p>
                        {display.info && (
                          <p className="mt-1 text-xs font-semibold text-on-surface">{display.info}</p>
                        )}
                        <p className="mt-2 font-headline font-bold text-primary">
                          Từ {display.priceLabel}/đêm
                        </p>
                        <div className="mt-3 flex flex-wrap gap-3 text-xs font-semibold">
                          <a
                            href={pin.googleMapsUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-primary hover:underline"
                          >
                            Google Maps
                          </a>
                          <Link
                            to={bookingUrl}
                            className="text-on-surface-variant hover:text-primary hover:underline"
                          >
                            Chọn chi nhánh
                          </Link>
                        </div>
                      </div>
                    </Popup>
                  </Marker>
                );
              })}
            </MapContainer>
          ) : (
            <div className="flex h-full items-center justify-center px-6 text-center text-sm text-on-surface-variant">
              Chưa có tọa độ bản đồ — thêm lat/lng trong branchMapPins.js
            </div>
          )}
        </div>

        <ul className="divide-y divide-black/5 bg-white lg:max-h-[360px] lg:overflow-y-auto">
          {entries.map(({ branch, pin }) => {
            const active = branch.id === focusedId;
            const display = resolvePinDisplay(branch, pin, property.priceFromVnd);
            const price = branch.priceFromVnd ?? property.priceFromVnd;
            const bookingUrl = buildUrl('/booking', {
              ...context,
              property: property.slug,
              branch: branch.id,
            });

            return (
              <li key={branch.id}>
                <button
                  type="button"
                  onClick={() => {
                    setFocusedId(branch.id);
                    setFlyToBranch(true);
                  }}
                  className={[
                    'flex w-full gap-3 px-4 py-3.5 text-left transition-colors',
                    active ? 'bg-primary/5' : 'hover:bg-surface-container-low',
                  ].join(' ')}
                >
                  <span
                    className={[
                      'mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white shadow-sm',
                      active ? 'bg-primary' : 'bg-on-surface/70',
                    ].join(' ')}
                    aria-hidden
                  >
                    <span className="material-symbols-outlined text-base">location_on</span>
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="font-headline text-sm font-bold text-on-surface">
                      {branchShortName(branch.name)}
                    </span>
                    {display.info && (
                      <span className="mt-0.5 block text-xs font-semibold text-on-surface-variant">
                        {display.info}
                      </span>
                    )}
                    <span className="mt-0.5 block text-xs text-on-surface-variant">{branch.address}</span>
                    <span className="mt-1.5 block font-headline text-sm font-bold text-primary">
                      Từ {formatPriceFrom(price)}/đêm
                    </span>
                    <span className="mt-2 flex flex-wrap gap-3 text-xs font-semibold">
                      <a
                        href={pin.googleMapsUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="inline-flex items-center gap-0.5 text-primary hover:underline"
                      >
                        Google Maps
                        <span className="material-symbols-outlined text-sm">open_in_new</span>
                      </a>
                      <Link
                        to={bookingUrl}
                        onClick={(e) => e.stopPropagation()}
                        className="text-on-surface-variant hover:text-primary hover:underline"
                      >
                        Chọn chi nhánh này
                      </Link>
                    </span>
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}
