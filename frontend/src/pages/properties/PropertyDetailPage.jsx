import { Navigate, useParams, useSearchParams } from 'react-router-dom';
import { buildUrl, parseBookingContext } from '../../lib/bookingContext';

/** Legacy URL — redirect into unified /booking flow (branch step). */
export default function PropertyDetailPage() {
  const { slug } = useParams();
  const [searchParams] = useSearchParams();
  const context = parseBookingContext(searchParams);
  return <Navigate to={buildUrl('/booking', { ...context, property: slug })} replace />;
}
