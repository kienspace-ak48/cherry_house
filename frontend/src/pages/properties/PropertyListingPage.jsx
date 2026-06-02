import { Navigate, useSearchParams } from 'react-router-dom';
import { buildUrl, parseBookingContext } from '../../lib/bookingContext';

/** Legacy route — redirect to unified booking entry. */
export default function PropertyListingPage() {
  const [searchParams] = useSearchParams();
  const context = parseBookingContext(searchParams);
  const focus = searchParams.get('focus');
  return (
    <Navigate
      to={buildUrl('/booking', context, focus ? { focus } : {})}
      replace
    />
  );
}
