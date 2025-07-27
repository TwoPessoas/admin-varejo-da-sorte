import { Outlet } from 'react-router-dom';

const GuestLayout = () => {
  return (
    <div className="auth-container">
      <div className="auth-card">
        <Outlet />
      </div>
    </div>
  );
};

export default GuestLayout;