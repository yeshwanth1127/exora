import { Outlet } from 'react-router-dom';
import SiteNav from './SiteNav';
import SiteFooter from './SiteFooter';
import './marketing.css';

export default function PublicLayout() {
  return <div className="mx-site"><SiteNav /><Outlet /><SiteFooter /></div>;
}
